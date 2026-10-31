import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PROJECTS = [
  { id: "brackit", file: "brackit.png" },
  { id: "qa", file: "qa.png" },
  { id: "arthix", file: "arthix.png" },
  { id: "validedi", file: "validedi.png" },
  { id: "sar", file: "sar.png" },
];

const PUBLIC_DIR = path.resolve("./public/projects");
const OUT_JSON = path.resolve("./src/content/project-images.json");

async function optimize() {
  console.log("Optimizing project images to WebP and generating blur placeholders...\n");
  const manifest = {};
  let totalOrigBytes = 0;
  let totalWebpBytes = 0;

  for (const item of PROJECTS) {
    const inputPath = path.join(PUBLIC_DIR, item.file);
    const outputPath = path.join(PUBLIC_DIR, `${item.id}.webp`);

    if (!fs.existsSync(inputPath)) {
      console.warn(`[WARN] Original not found: ${item.file}`);
      continue;
    }

    const origStats = fs.statSync(inputPath);
    totalOrigBytes += origStats.size;

    const img = sharp(inputPath);
    const meta = await img.metadata();

    // Determine target width (max 1200px, no upscaling)
    const targetWidth = Math.min(1200, meta.width || 1200);
    const targetHeight = Math.round((meta.height || 600) * (targetWidth / (meta.width || 1200)));

    // Generate optimized WebP
    await sharp(inputPath)
      .resize({
        width: targetWidth,
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toFile(outputPath);

    const webpStats = fs.statSync(outputPath);
    totalWebpBytes += webpStats.size;

    // Generate tiny blur placeholder
    const blurBuffer = await sharp(inputPath)
      .resize(16, Math.max(1, Math.round(16 * (targetHeight / targetWidth))))
      .webp({ quality: 30 })
      .toBuffer();
    const blurDataUri = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

    manifest[item.id] = {
      src: `/projects/${item.id}.webp`,
      width: targetWidth,
      height: targetHeight,
      blur: blurDataUri,
    };

    console.log(
      `✓ [${item.id}] ${meta.width}x${meta.height} (${(origStats.size / 1024).toFixed(1)} KB) -> ` +
      `${targetWidth}x${targetHeight} WebP (${(webpStats.size / 1024).toFixed(1)} KB)`
    );
  }

  // Ensure output dir exists
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(manifest, null, 2), "utf8");

  console.log(`\nWritten manifest to: ${OUT_JSON}`);
  console.log(`Total original: ${(totalOrigBytes / 1024).toFixed(1)} KB`);
  console.log(`Total WebP: ${(totalWebpBytes / 1024).toFixed(1)} KB (${((1 - totalWebpBytes / totalOrigBytes) * 100).toFixed(1)}% reduction)`);
}

optimize().catch((err) => {
  console.error("Optimization failed:", err);
  process.exit(1);
});

