import { existsSync, statSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { defineConfig, type Plugin, type PluginContext } from 'vite'

const NAMESPACE = 'virtual:cafs-mtime:'
const ROOT = process.cwd()

// Map a content path (root-relative from import.meta.glob, or an absolute fs
// path) to an existing file on disk.
function resolveFilePath(path: string): string | null {
  const fromRoot = resolve(ROOT, path.replace(/^\/+/, ''))
  if (existsSync(fromRoot)) return fromRoot
  if (isAbsolute(path) && existsSync(path)) return path
  return null
}

function emitStamp(this: PluginContext, target: string): string {
  this.addWatchFile(target)
  try {
    return `export default ${statSync(target).mtimeMs}`
  } catch {
    return 'export default 0'
  }
}

// Virtual `?mtime` modules expose the last-modified timestamp of a content
// file, so catalog entries get real dates that refresh on every dev edit and
// every build without hand-written meta. Query flags may arrive in any order
// and combined with Vite's own `import` flag (e.g. `?import&mtime`), so match
// the `mtime` param explicitly instead of a fixed suffix.
function docsMtime(): Plugin {
  return {
    name: 'cafs-docs-mtime',
    enforce: 'pre',
    resolveId(id) {
      const separator = id.indexOf('?')
      const path = separator === -1 ? id : id.slice(0, separator)
      const query = separator === -1 ? '' : id.slice(separator + 1)
      if (!query.split(/[&,]/).includes('mtime')) return
      const target = resolveFilePath(path)
      if (!target) return
      return NAMESPACE + encodeURIComponent(target)
    },
    load(id) {
      // Build path: the virtual namespace id resolved above.
      if (id.startsWith(NAMESPACE)) {
        const target = decodeURIComponent(id.slice(NAMESPACE.length).split('?')[0])
        return emitStamp.call(this, target)
      }
      // Dev path: import.meta.glob URLs become direct module requests like
      // `/abs/path.md?mtime`, which bypass resolveId entirely.
      const separator = id.indexOf('?')
      const path = separator === -1 ? id : id.slice(0, separator)
      const query = separator === -1 ? '' : id.slice(separator + 1)
      if (!query.split(/[&,]/).includes('mtime')) return
      const target = resolveFilePath(path)
      if (!target) return
      return emitStamp.call(this, target)
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/CAFS/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  plugins: [docsMtime()],
}))
