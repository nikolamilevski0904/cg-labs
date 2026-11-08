import { defineConfig } from 'vite'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

// Multi-page build: every labN/*.html becomes its own entry point
const input = {}
for (const dir of readdirSync('.').filter((d) => /^lab\d$/.test(d))) {
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.html'))) {
    input[`${dir}/${file}`] = resolve(dir, file)
  }
}

export default defineConfig({
  base: './', // relative asset paths, so the build works from any folder
  build: { rollupOptions: { input } },
})
