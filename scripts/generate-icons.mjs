// Generates PWA icons from the branded SVG sources using sharp (SVG → PNG)
// Run once: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const icons = [
  {
    source: 'public/icons/icon-app-dark.svg',
    size: 192,
    file: 'public/icons/icon-192.png',
  },
  {
    source: 'public/icons/icon-app-dark.svg',
    size: 512,
    file: 'public/icons/icon-512.png',
  },
  {
    source: 'public/icons/icon-maskable.svg',
    size: 512,
    file: 'public/icons/icon-maskable-512.png',
  },
  {
    source: 'public/icons/icon-app-dark.svg',
    size: 180,
    file: 'public/icons/apple-touch-icon.png',
    flatten: '#161c17',
  },
  {
    source: 'public/icons/favicon.svg',
    size: 32,
    file: 'public/icons/favicon-32.png',
  },
]

for (const { source, size, file, flatten } of icons) {
  let pipeline = sharp(resolve(root, source)).resize(size, size)

  if (flatten) {
    pipeline = pipeline.flatten({ background: flatten })
  }

  await pipeline.png().toFile(resolve(root, file))
  console.log(`✅ ${file} (${size}×${size})`)
}
