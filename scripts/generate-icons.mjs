// Generates PWA icons from public/icon.svg using sharp (SVG → PNG)
// Run once: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgBuffer = readFileSync(resolve(root, 'public/icon.svg'))

const icons = [
  { size: 192, file: 'public/icons/icon-192.png' },
  { size: 512, file: 'public/icons/icon-512.png' },
  { size: 180, file: 'public/icons/apple-touch-icon.png' },
]

for (const { size, file } of icons) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(resolve(root, file))
  console.log(`✅ ${file} (${size}×${size})`)
}
