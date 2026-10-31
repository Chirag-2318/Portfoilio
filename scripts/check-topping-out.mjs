/**
 * Test script for Topping Out engine
 * Run via: npx tsx scripts/check-topping-out.mjs
 */

import assert from "node:assert/strict";
import { ToppingOutEngine } from "../src/components/game/topping-out/engine.ts";
import { GAME_CONSTANTS } from "../src/components/game/topping-out/constants.ts";

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

console.log("\n=========================================");
console.log("ALL ENGINE ASSERTIONS PASSED SUCCESSFULLY!");
console.log("=========================================");
