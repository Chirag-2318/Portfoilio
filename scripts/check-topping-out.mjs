/**
 * Test script for Topping Out engine
 * Run via: npx tsx scripts/check-topping-out.mjs
 */

import assert from "node:assert/strict";
import { ToppingOutEngine } from "../src/components/game/topping-out/engine.ts";
import { GAME_CONSTANTS } from "../src/components/game/topping-out/constants.ts";
import { landmarkCrossed } from "../src/components/game/topping-out/landmarks.ts";
import { isPaletteUnlocked, blockColors, PALETTES } from "../src/components/game/topping-out/palettes.ts";
import {
  ACHIEVEMENTS,
  ACHIEVEMENTS_BY_ID,
  createInitialAchievementState,
  reduceAchievements,
  progressFor,
  nextGoal,
} from "../src/components/game/topping-out/achievements.ts";
import {
  loadAchievements,
  loadLifetimeStats,
  saveAchievements,
  saveLifetimeStats,
  STORAGE_KEY_ACHIEVEMENTS,
  STORAGE_KEY_STATS,
} from "../src/components/game/topping-out/storage.ts";

console.log("=== RUNNING TOPPING OUT ENGINE TESTS ===");

// -------------------------------------------------------------
// Test 1: Perfect drop keeps size and snaps
// -------------------------------------------------------------
{
  console.log("\n[Test 1] Perfect drop keeps size and snaps...");
  const engine = new ToppingOutEngine();
  engine.start();

  assert.equal(engine.state, "playing");
  assert.equal(engine.floors, 0);

  const prev = engine.getTopSlab();
  assert.equal(prev.w, 3.2);
  assert.equal(prev.d, 3.2);
  assert.equal(prev.x, 0);
  assert.equal(prev.z, 0);

  // Position moving slab within perfect threshold (abs(delta) <= 0.12)
  assert.ok(engine.movingSlab !== null);
  engine.movingSlab.x = 0.08; // delta = 0.08

  const res = engine.drop();
  assert.ok(res !== null);
  assert.equal(res.type, "perfect");
  assert.equal(res.combo, 1);
  assert.equal(res.floors, 1);
  assert.equal(engine.floors, 1);

  const top = engine.getTopSlab();
  assert.equal(top.x, 0, "Top slab x should snap exactly to 0");
  assert.equal(top.z, 0, "Top slab z should snap to 0");
  assert.equal(top.w, 3.2, "Top slab width should remain 3.2");
  assert.equal(top.d, 3.2, "Top slab depth should remain 3.2");
  console.log("✓ PASS: Perfect drop kept size (3.2x3.2) and snapped centre to (0, 0).");
}

// -------------------------------------------------------------
// Test 2: Partial overlap trims correctly and spawns debris
// -------------------------------------------------------------
{
  console.log("\n[Test 2] Partial overlap trims correctly and spawns debris...");
  const engine = new ToppingOutEngine();
  engine.start();

  // Level 1: x axis, drop with offset 1.0 (currSize = 3.2, prev = 0, moving = 1.0)
  // delta = 1.0 > 0.12 -> trim
  engine.movingSlab.x = 1.0;
  const res = engine.drop();

  assert.ok(res !== null);
  assert.equal(res.type, "trim");
  assert.equal(res.combo, 0);
  assert.equal(res.floors, 1);

  const top = engine.getTopSlab();
  const expectedOverlap = 3.2 - 1.0; // 2.2
  assert.ok(Math.abs(top.w - expectedOverlap) < 0.001, `New width ${top.w} should be ~2.2`);
  assert.equal(top.d, 3.2, "Depth along z should be unchanged at 3.2");

  // Debris check
  assert.ok(res.debris !== undefined, "Debris piece should be spawned");
  assert.equal(engine.debrisList.length, 1);
  const debris = engine.debrisList[0];
  const expectedDebrisW = 3.2 - expectedOverlap; // 1.0
  assert.ok(
    Math.abs(debris.w - expectedDebrisW) < 0.001,
    `Debris width ${debris.w} should equal cut-off width ${expectedDebrisW}`
  );
  assert.equal(debris.d, 3.2, "Debris depth should match untouched axis");
  assert.ok(
    Math.abs(top.w + debris.w - 3.2) < 0.001,
    "Placed slab width + debris width must sum to previous width (3.2)"
  );
  console.log(`✓ PASS: Trimmed slab to ${top.w.toFixed(2)}, spawned debris of width ${debris.w.toFixed(2)}.`);
}

// -------------------------------------------------------------
// Test 3: Zero overlap ends the game
// -------------------------------------------------------------
{
  console.log("\n[Test 3] Zero overlap ends the game...");
  let gameOverCalled = false;
  let finalScore = -1;

  const engine = new ToppingOutEngine({
    onGameOver: (floors) => {
      gameOverCalled = true;
      finalScore = floors;
    },
  });
  engine.start();

  // Position moving slab completely off (moving.x = 4.0, prev width is 3.2, max reach is 1.6)
  engine.movingSlab.x = 4.0;
  const floorsBeforeDrop = engine.floors;

  const res = engine.drop();
  assert.ok(res !== null);
  assert.equal(res.type, "miss");
  assert.equal(res.combo, 0);
  assert.equal(res.floors, floorsBeforeDrop, "Floors should not increment on miss");
  assert.equal(engine.floors, floorsBeforeDrop);
  assert.ok(engine.fallingSlab !== null, "Falling slab should be created");
  assert.equal(engine.movingSlab, null, "Moving slab should be cleared");

  // Update physics past miss duration (600ms = 0.6s)
  engine.update(0.7);

  assert.equal(engine.state, "over", "State should transition to 'over'");
  assert.ok(gameOverCalled, "onGameOver callback must fire");
  assert.equal(finalScore, 0);
  console.log("✓ PASS: Miss ended game with falling slab and onGameOver fired with final score 0.");
}

// -------------------------------------------------------------
// Test 4: Five consecutive perfects regrow the slab by 0.25 up to max
// -------------------------------------------------------------
{
  console.log("\n[Test 4] Five consecutive perfects regrow the slab by 0.25 up to max...");
  const engine = new ToppingOutEngine();
  engine.start();

  // First, force a trim on both x and z so the slab is narrower than 3.2 on both axes
  // Drop 1 trims x: delta = 1.2 -> width becomes 3.2 - 1.2 = 2.0
  engine.movingSlab.x = 1.2;
  const trimX = engine.drop();
  assert.equal(trimX.type, "trim");

  // Drop 2 trims z: delta = 1.2 -> depth becomes 3.2 - 1.2 = 2.0
  engine.movingSlab.z = 1.2;
  const trimZ = engine.drop();
  assert.equal(trimZ.type, "trim");

  const trimmedTop = engine.getTopSlab();
  assert.ok(Math.abs(trimmedTop.w - 2.0) < 0.001);
  assert.ok(Math.abs(trimmedTop.d - 2.0) < 0.001);
  console.log(`  Initial trimmed size: ${trimmedTop.w.toFixed(2)} x ${trimmedTop.d.toFixed(2)}`);

  // Now perform 5 consecutive perfect drops
  let regrowCount = 0;
  for (let i = 1; i <= 5; i++) {
    // Snap moving slab to previous centre
    if (engine.movingSlab.axis === "x") {
      engine.movingSlab.x = engine.getTopSlab().x;
    } else {
      engine.movingSlab.z = engine.getTopSlab().z;
    }

    const dropRes = engine.drop();
    assert.ok(dropRes !== null);
    assert.equal(dropRes.type, "perfect");
    assert.equal(dropRes.combo, i);

    if (dropRes.regrew) {
      regrowCount++;
      console.log(`  Perfect #${i}: Regrew along ${engine.slabs[engine.slabs.length - 1].w !== trimmedTop.w ? 'w' : 'd'} by +${dropRes.regrowAmount.toFixed(2)} (combo=${dropRes.combo})`);
    } else {
      console.log(`  Perfect #${i}: No regrow (combo=${dropRes.combo})`);
    }
  }

  assert.ok(regrowCount >= 2, `Regrowth should trigger at combo 4 and combo 5 (triggered ${regrowCount} times)`);
  console.log("✓ PASS: 5 consecutive perfects successfully triggered slab regrowth (+0.25).");
}

// -------------------------------------------------------------
// Test 5: Floors count increments only on success
// -------------------------------------------------------------
{
  console.log("\n[Test 5] Floors count increments only on success...");
  const engine = new ToppingOutEngine();
  engine.start();

  assert.equal(engine.floors, 0);

  // Success 1: Perfect drop
  engine.movingSlab.x = 0;
  engine.drop();
  assert.equal(engine.floors, 1);

  // Success 2: Trim drop
  engine.movingSlab.z = 0.5;
  engine.drop();
  assert.equal(engine.floors, 2);

  // Failure: Miss drop
  engine.movingSlab.x = 5.0;
  engine.drop();
  assert.equal(engine.floors, 2, "Floors count must NOT increment on miss");

  console.log("✓ PASS: Floors count incremented only on success (1 -> 2 -> 2).");
}

// -------------------------------------------------------------
// Test 6: landmarkCrossed returns landmark on crossing and null when within range
// -------------------------------------------------------------
{
  console.log("\n[Test 6] landmarkCrossed detection on height thresholds...");
  // Key landmark thresholds: 26 (Gateway of India), 73 (Qutub Minar), 182 (Statue of Unity), 330 (Eiffel Tower), 828 (Burj Khalifa)
  const lm26 = landmarkCrossed(24, 27);
  assert.ok(lm26 !== null, "Should detect crossing 26m");
  assert.equal(lm26.metres, 26);
  assert.equal(lm26.name, "Gateway of India");

  const lm73 = landmarkCrossed(72, 75);
  assert.ok(lm73 !== null, "Should detect crossing 73m");
  assert.equal(lm73.metres, 73);

  const lm182 = landmarkCrossed(180, 183);
  assert.ok(lm182 !== null, "Should detect crossing 182m");
  assert.equal(lm182.metres, 182);

  const lm330 = landmarkCrossed(327, 333);
  assert.ok(lm330 !== null, "Should detect crossing 330m");
  assert.equal(lm330.metres, 330);

  const lm828 = landmarkCrossed(825, 831);
  assert.ok(lm828 !== null, "Should detect crossing 828m");
  assert.equal(lm828.metres, 828);

  // When within range (no threshold crossed)
  assert.equal(landmarkCrossed(10, 20), null, "10m to 20m crosses no landmark");
  assert.equal(landmarkCrossed(26, 30), null, "26m to 30m should not re-trigger 26m");
  assert.equal(landmarkCrossed(50, 60), null, "50m to 60m crosses no landmark");

  console.log("✓ PASS: landmarkCrossed correctly identifies crossed landmarks (26, 73, 182, 330, 828) and returns null when within range.");
}

// -------------------------------------------------------------
// Test 7: isPaletteUnlocked checks
// -------------------------------------------------------------
{
  console.log("\n[Test 7] isPaletteUnlocked thresholds (dusk: 10, mint: 20, mono: 30)...");
  // Rainbow is unlocked at 0
  assert.equal(isPaletteUnlocked("rainbow", 0), true);
  assert.equal(isPaletteUnlocked("rainbow", 5), true);

  // Dusk unlocks at 10
  assert.equal(isPaletteUnlocked("dusk", 0), false);
  assert.equal(isPaletteUnlocked("dusk", 9), false);
  assert.equal(isPaletteUnlocked("dusk", 10), true);
  assert.equal(isPaletteUnlocked("dusk", 15), true);

  // Mint unlocks at 20
  assert.equal(isPaletteUnlocked("mint", 10), false);
  assert.equal(isPaletteUnlocked("mint", 19), false);
  assert.equal(isPaletteUnlocked("mint", 20), true);
  assert.equal(isPaletteUnlocked("mint", 25), true);

  // Mono unlocks at 30
  assert.equal(isPaletteUnlocked("mono", 20), false);
  assert.equal(isPaletteUnlocked("mono", 29), false);
  assert.equal(isPaletteUnlocked("mono", 30), true);
  assert.equal(isPaletteUnlocked("mono", 50), true);

  console.log("✓ PASS: isPaletteUnlocked accurately enforces unlock thresholds for Rainbow (0), Dusk (10), Mint (20), and Mono (30).");
}

// -------------------------------------------------------------
// Test 8: blockColors determinism and solid values
// -------------------------------------------------------------
{
  console.log("\n[Test 8] blockColors determinism and solid opaque color properties...");
  const palettes = ["rainbow", "dusk", "mint", "mono"];

  for (const pal of palettes) {
    const c1 = blockColors(12, pal);
    const c2 = blockColors(12, pal);

    // Deterministic: same floor + palette gives identical results
    assert.deepEqual(c1, c2, `Palette ${pal} must produce deterministic colors`);

    // Verify all faces exist and are non-empty
    assert.ok(c1.top && c1.left && c1.right && c1.edge && c1.windowDark && c1.windowLit, `Palette ${pal} should provide all required face colors`);

    // Verify solid opaque fills for main slab faces (top, left, right should start with hsl/rgb/# and not have alpha < 1.0)
    assert.ok(c1.top.startsWith("hsl(") || c1.top.startsWith("#"), `top face should use solid hsl or hex in ${pal}`);
    assert.ok(c1.left.startsWith("hsl(") || c1.left.startsWith("#"), `left face should use solid hsl or hex in ${pal}`);
    assert.ok(c1.right.startsWith("hsl(") || c1.right.startsWith("#"), `right face should use solid hsl or hex in ${pal}`);
    assert.ok(c1.edge.startsWith("hsl(") || c1.edge.startsWith("#"), `edge line should use solid hsl or hex in ${pal}`);
  }

  // Different floors should generally produce different hues (at least in rainbow)
  const floor1 = blockColors(1, "rainbow");
  const floor2 = blockColors(2, "rainbow");
  assert.notEqual(floor1.top, floor2.top, "Different floors in rainbow palette should produce distinct colors");

  console.log("✓ PASS: blockColors is deterministic, provides solid opaque faces across all palettes, and produces varied hues.");
}

// -------------------------------------------------------------
// Test 9: Achievement Registry (16 achievements in exact order)
// -------------------------------------------------------------
{
  console.log("\n[Test 9] Achievement definitions and registry integrity...");
  assert.equal(ACHIEVEMENTS.length, 16, "Must define exactly 16 achievements");

  const expectedIds = [
    "foundation-laid",
    "plumb-line",
    "hat-trick",
    "level-headed",
    "growth-spurt",
    "flawless-ten",
    "by-a-hair",
    "mid-rise",
    "high-rise",
    "skyline",
    "cloud-piercer",
    "landmark-collector",
    "leaning-tower",
    "lucky-seven",
    "night-shift",
    "chartered-architect",
  ];

  expectedIds.forEach((id, idx) => {
    assert.equal(ACHIEVEMENTS[idx].id, id, `Achievement at index ${idx} must be ${id}`);
    const item = ACHIEVEMENTS_BY_ID.get(id);
    assert.ok(item, `ACHIEVEMENTS_BY_ID must contain ${id}`);
    assert.ok(item.name.length > 0, "Name must not be empty");
    assert.ok(item.how.length > 0, "How must not be empty");
    assert.ok(item.flavour.length > 0, "Flavour must not be empty");
    assert.ok([1, 2, 3].includes(item.tier), "Tier must be 1, 2, or 3");
    assert.ok(
      ["craft", "height", "landmark", "secret", "meta"].includes(item.category),
      "Category must be one of craft, height, landmark, secret, meta"
    );
  });

  // Verify secret flags
  assert.equal(ACHIEVEMENTS_BY_ID.get("leaning-tower")?.secret, true);
  assert.equal(ACHIEVEMENTS_BY_ID.get("lucky-seven")?.secret, true);
  assert.equal(ACHIEVEMENTS_BY_ID.get("night-shift")?.secret, true);

  console.log("✓ PASS: Exactly 16 achievements registered with correct metadata, tiers, and secret flags.");
}

// -------------------------------------------------------------
// Test 10: State Reducer Logic for all 16 achievements
// -------------------------------------------------------------
{
  console.log("\n[Test 10] State Reducer logic for unlocking each achievement...");

  // 1. foundation-laid
  let s = createInitialAchievementState();
  let res = reduceAchievements(s, { type: "placed", kind: "trim", floor: 1, widthAfter: 2.0, sign: 1 });
  assert.ok(res.unlockedNow.some((a) => a.id === "foundation-laid"));
  assert.ok(res.state.unlocked["foundation-laid"]);
  s = res.state;

  // 2. plumb-line
  res = reduceAchievements(s, { type: "placed", kind: "perfect", floor: 2, widthAfter: 2.0, sign: 0 });
  assert.ok(res.unlockedNow.some((a) => a.id === "plumb-line"));
  assert.ok(res.state.unlocked["plumb-line"]);
  s = res.state;

  // 3. hat-trick (3 consecutive perfects: floor 2 was #1, now 3 and 4)
  res = reduceAchievements(s, { type: "placed", kind: "perfect", floor: 3, widthAfter: 2.0, sign: 0 });
  s = res.state;
  res = reduceAchievements(s, { type: "placed", kind: "perfect", floor: 4, widthAfter: 2.0, sign: 0 });
  assert.ok(res.unlockedNow.some((a) => a.id === "hat-trick"));
  assert.ok(res.state.unlocked["hat-trick"]);
  s = res.state;

  // 4. level-headed (8 consecutive perfects: floors 2,3,4 were 3. Add 5,6,7,8,9)
  for (let f = 5; f <= 9; f++) {
    res = reduceAchievements(s, { type: "placed", kind: "perfect", floor: f, widthAfter: 2.0, sign: 0 });
    s = res.state;
  }
  assert.ok(s.unlocked["level-headed"]);

  // 5. flawless-ten (first 10 floors all perfect)
  // Floor 1 was trimmed earlier, so in state s it's not flawless.
  // Let's test flawless-ten on a fresh run:
  let flawlessState = createInitialAchievementState();
  for (let f = 1; f <= 10; f++) {
    res = reduceAchievements(flawlessState, { type: "placed", kind: "perfect", floor: f, widthAfter: 3.2, sign: 0 });
    flawlessState = res.state;
  }
  assert.ok(flawlessState.unlocked["flawless-ten"], "10 perfects from floor 1 must unlock flawless-ten");

  // 6. mid-rise (floor 10)
  assert.ok(flawlessState.unlocked["mid-rise"]);

  // 7. high-rise (floor 20)
  res = reduceAchievements(flawlessState, { type: "placed", kind: "perfect", floor: 20, widthAfter: 3.2, sign: 0 });
  assert.ok(res.state.unlocked["high-rise"]);

  // 8. skyline (floor 30)
  res = reduceAchievements(res.state, { type: "placed", kind: "perfect", floor: 30, widthAfter: 3.2, sign: 0 });
  assert.ok(res.state.unlocked["skyline"]);

  // 9. cloud-piercer (floor 50)
  res = reduceAchievements(res.state, { type: "placed", kind: "perfect", floor: 50, widthAfter: 3.2, sign: 0 });
  assert.ok(res.state.unlocked["cloud-piercer"]);

  // 10. growth-spurt
  let growState = createInitialAchievementState();
  res = reduceAchievements(growState, { type: "regrow" });
  assert.ok(res.unlockedNow.some((a) => a.id === "growth-spurt"));
  assert.ok(res.state.unlocked["growth-spurt"]);

  // 11. by-a-hair (trim leaves slab narrower than 0.35, next placed slab unlocks)
  let hairState = createInitialAchievementState();
  res = reduceAchievements(hairState, { type: "placed", kind: "trim", floor: 1, widthAfter: 0.30, sign: 1 });
  assert.equal(res.state.run.pendingHair, true);
  assert.ok(!res.state.unlocked["by-a-hair"]);
  // Next placed slab (even if trimmed)
  res = reduceAchievements(res.state, { type: "placed", kind: "trim", floor: 2, widthAfter: 0.28, sign: 1 });
  assert.ok(res.unlockedNow.some((a) => a.id === "by-a-hair"));
  assert.ok(res.state.unlocked["by-a-hair"]);

  // 12. landmark-collector (clearing gateway and qutub in one run)
  let lmState = createInitialAchievementState();
  res = reduceAchievements(lmState, { type: "landmark", id: "gateway" });
  assert.ok(!res.state.unlocked["landmark-collector"]);
  res = reduceAchievements(res.state, { type: "landmark", id: "qutub" });
  assert.ok(res.unlockedNow.some((a) => a.id === "landmark-collector"));
  assert.ok(res.state.unlocked["landmark-collector"]);

  // 13. leaning-tower (5 consecutive trims on the same side)
  let tiltState = createInitialAchievementState();
  for (let i = 1; i <= 4; i++) {
    res = reduceAchievements(tiltState, { type: "placed", kind: "trim", floor: i, widthAfter: 2.5 - i * 0.2, sign: 1 });
    tiltState = res.state;
  }
  assert.ok(!tiltState.unlocked["leaning-tower"]);
  res = reduceAchievements(tiltState, { type: "placed", kind: "trim", floor: 5, widthAfter: 1.5, sign: 1 });
  assert.ok(res.unlockedNow.some((a) => a.id === "leaning-tower"));
  assert.ok(res.state.unlocked["leaning-tower"]);

  // 14. lucky-seven (gameover on exactly 7 floors)
  let luckyState = createInitialAchievementState();
  res = reduceAchievements(luckyState, { type: "gameover", floors: 7, hour: 14 });
  assert.ok(res.unlockedNow.some((a) => a.id === "lucky-seven"));
  assert.ok(res.state.unlocked["lucky-seven"]);

  // 15. night-shift (gameover with >= 5 floors between 00:00 and 04:59)
  let nightState = createInitialAchievementState();
  res = reduceAchievements(nightState, { type: "gameover", floors: 5, hour: 2 });
  assert.ok(res.unlockedNow.some((a) => a.id === "night-shift"));
  assert.ok(res.state.unlocked["night-shift"]);

  // But not daytime:
  let dayState = createInitialAchievementState();
  res = reduceAchievements(dayState, { type: "gameover", floors: 5, hour: 12 });
  assert.ok(!res.state.unlocked["night-shift"]);

  // 16. chartered-architect (unlock 10 other achievements)
  const tenUnlocked = {
    "foundation-laid": 1,
    "plumb-line": 2,
    "hat-trick": 3,
    "level-headed": 4,
    "growth-spurt": 5,
    "mid-rise": 6,
    "high-rise": 7,
    "skyline": 8,
    "cloud-piercer": 9,
  };
  let metaState = createInitialAchievementState(tenUnlocked);
  assert.ok(!metaState.unlocked["chartered-architect"]);
  // 10th unlock:
  res = reduceAchievements(metaState, { type: "landmark", id: "gateway" });
  res = reduceAchievements(res.state, { type: "landmark", id: "qutub" }); // unlocks landmark-collector (10th!)
  assert.ok(res.unlockedNow.some((a) => a.id === "chartered-architect"));
  assert.ok(res.state.unlocked["chartered-architect"]);

  console.log("✓ PASS: Reducer correctly processes all events and unlocks all 16 achievements.");
}

// -------------------------------------------------------------
// Test 11: progressFor logic
// -------------------------------------------------------------
{
  console.log("\n[Test 11] progressFor calculations...");
  const s = createInitialAchievementState({}, { bestFloors: 15, bestCombo: 5 });

  const midRise = progressFor(ACHIEVEMENTS_BY_ID.get("mid-rise"), s);
  assert.deepEqual(midRise, { current: 10, target: 10 });

  const highRise = progressFor(ACHIEVEMENTS_BY_ID.get("high-rise"), s);
  assert.deepEqual(highRise, { current: 15, target: 20 });

  const hatTrick = progressFor(ACHIEVEMENTS_BY_ID.get("hat-trick"), s);
  assert.deepEqual(hatTrick, { current: 3, target: 3 });

  const levelHeaded = progressFor(ACHIEVEMENTS_BY_ID.get("level-headed"), s);
  assert.deepEqual(levelHeaded, { current: 5, target: 8 });

  // Secrets return null
  assert.equal(progressFor(ACHIEVEMENTS_BY_ID.get("leaning-tower"), s), null);
  assert.equal(progressFor(ACHIEVEMENTS_BY_ID.get("lucky-seven"), s), null);
  assert.equal(progressFor(ACHIEVEMENTS_BY_ID.get("night-shift"), s), null);

  console.log("✓ PASS: progressFor returns correct numerical progress and null for secrets.");
}

// -------------------------------------------------------------
// Test 12: nextGoal progression
// -------------------------------------------------------------
{
  console.log("\n[Test 12] nextGoal progression logic...");
  let s = createInitialAchievementState({}, { bestFloors: 5, bestCombo: 0 });

  // Initially, mid-rise has 5/10 (ratio 0.5), which is candidate
  let goal = nextGoal(s);
  assert.ok(goal !== null);
  assert.equal(goal.id, "mid-rise");

  // When all unlocked
  const allUnlocked = {};
  for (const a of ACHIEVEMENTS) {
    allUnlocked[a.id] = Date.now();
  }
  const completedState = createInitialAchievementState(allUnlocked);
  assert.equal(nextGoal(completedState), null, "nextGoal must return null when all unlocked");

  console.log("✓ PASS: nextGoal selects optimal progression candidate and returns null when all unlocked.");
}

// -------------------------------------------------------------
// Test 13: Storage Corruption Resilience
// -------------------------------------------------------------
{
  console.log("\n[Test 13] Storage resilience against corrupt data...");
  const storageMap = new Map();
  globalThis.localStorage = {
    getItem: (k) => storageMap.get(k) ?? null,
    setItem: (k, v) => storageMap.set(k, String(v)),
    removeItem: (k) => storageMap.delete(k),
    clear: () => storageMap.clear(),
  };
  globalThis.window = globalThis;

  // Corrupted JSON string
  storageMap.set(STORAGE_KEY_ACHIEVEMENTS, "not-json{{{");
  const corruptedAch = loadAchievements();
  assert.deepEqual(corruptedAch, {}, "Must recover silently to empty object on corrupt JSON");

  storageMap.set(STORAGE_KEY_STATS, "{\"games\": \"not a number\"}");
  const stats = loadLifetimeStats();
  assert.equal(stats.games, 0, "Non-number fields must fallback to 0");

  // Valid save and load
  saveAchievements({ "plumb-line": 1234567 });
  const loaded = loadAchievements();
  assert.equal(loaded["plumb-line"], 1234567);

  console.log("✓ PASS: Storage safely recovers from corrupted data and persists correctly.");
}

// -------------------------------------------------------------
// Test 14: New Reward Palettes (Gold Hour & Copper)
// -------------------------------------------------------------
{
  console.log("\n[Test 14] New reward palettes unlock logic and colors...");
  assert.equal(PALETTES.length, 6, "Must define 6 palettes");

  // Gold Hour requires 'skyline'
  assert.equal(isPaletteUnlocked("gold", 50, {}), false);
  assert.equal(isPaletteUnlocked("gold", 50, { skyline: Date.now() }), true);

  // Copper requires 'chartered-architect'
  assert.equal(isPaletteUnlocked("copper", 50, {}), false);
  assert.equal(isPaletteUnlocked("copper", 50, { "chartered-architect": Date.now() }), true);

  // Colors for gold and copper
  const goldCol = blockColors(5, "gold");
  assert.ok(goldCol.top.startsWith("hsl("));
  assert.ok(goldCol.left.startsWith("hsl("));
  assert.ok(goldCol.right.startsWith("hsl("));

  const copperCol = blockColors(5, "copper");
  assert.ok(copperCol.top.startsWith("hsl("));
  assert.ok(copperCol.left.startsWith("hsl("));
  assert.ok(copperCol.right.startsWith("hsl("));

  console.log("✓ PASS: Gold Hour and Copper palette unlock requirements and colors verified.");
}

console.log("\n=========================================");
console.log("ALL ENGINE ASSERTIONS PASSED SUCCESSFULLY!");
console.log("=========================================");
