// Generates PWA icons: logo composited onto solid #0A2540 background.
// Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const src = resolve(root, "public/src-logo.png");
const outDir = resolve(root, "public/icons");

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const BG = { r: 10, g: 37, b: 64, alpha: 1 }; // #0A2540

for (const size of sizes) {
  // Resize logo to 80% of icon size, centre on solid background
  const logoSize = Math.round(size * 0.8);
  const pad = Math.round((size - logoSize) / 2);

  const logo = await sharp(src)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(`${outDir}/icon-${size}x${size}.png`);

  console.log(`✓ ${size}x${size}`);
}

// Favicons on white background
for (const size of [16, 32]) {
  const logo = await sharp(src)
    .resize(Math.round(size * 0.85), Math.round(size * 0.85), {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const pad = Math.round(size * 0.075);
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(resolve(root, `public/favicon-${size}.png`));

  console.log(`✓ favicon-${size}px`);
}

console.log("Done.");
