import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

const NAMESPACE = 'virtual:cafs-git-stamps:'

// Per-line recency for the "Recently added & updated" list: `git blame`
// resolves which commit last touched every line of each content file, so each
// entry dates itself from real history without hand-written `addedAt` /
// `updatedAt` meta. Works in dev and builds, and stays correct on fresh clones
// where file mtimes are meaningless. Uncommitted lines (new links being edited)
// date to the file's modification time, so fresh edits surface immediately.
function gitStamps(): Plugin {
  const moduleId = NAMESPACE + 'stamps'
  const root = process.cwd()
  let stamps: Record<string, string[]> = {}

  // Same file set and key format as the `import.meta.glob('/docs/public/*.md')`
  // in src/content/catalog.ts.
  function contentFiles(): string[] {
    const dir = join(root, 'docs', 'public')
    if (!existsSync(dir)) return []
    return readdirSync(dir)
      .filter(file => file.toLowerCase().endsWith('.md') && file.toLowerCase() !== 'readme.md')
      .map(file => `/docs/public/${file}`)
      .sort()
  }

  // Porcelain blame: "<sha> <orig> <final> [<count>]" headers are followed by
  // metadata for that commit; content lines are tab-prefixed. Subsequent
  // headers reuse a commit without repeating its metadata, so collect
  // author-time per sha in a first sweep, then expand line ranges.
  function blameFile(relativePath: string): string[] {
    try {
      const out = execFileSync('git', ['blame', '--porcelain', '--', relativePath], {
        cwd: root,
        maxBuffer: 64 * 1024 * 1024,
      }).toString()

      const authorTime = new Map<string, number>()
      const ranges: Array<{ line: number; count: number; sha: string }> = []
      let sha = ''

      for (const line of out.split('\n')) {
        const header = /^([0-9a-f]{40})\s+(\d+)\s+(\d+)(?:\s+(\d+))?$/.exec(line)
        if (header) {
          sha = header[1]
          ranges.push({ line: Number(header[3]), count: header[4] ? Number(header[4]) : 1, sha })
          continue
        }
        const time = /^author-time\s+(\d+)/.exec(line)
        if (time) authorTime.set(sha, Number(time[1]) * 1000)
      }

      const stamps: string[] = []
      for (const range of ranges) {
        const ts = authorTime.get(range.sha)
        const iso = ts ? new Date(ts).toISOString() : ''
        for (let index = 0; index < range.count; index++) {
          stamps[range.line + index - 1] = iso
        }
      }
      // Compact the sparse array into a plain JSON-friendly array.
      return stamps.map(stamp => stamp || '')
    } catch {
      // No git history for this file: brand-new (untracked) docs date every
      // line to the file's mtime so fresh entries still surface in dev;
      // unreadable files simply have no stamps.
      try {
        const absolute = join(root, relativePath)
        const mtime = new Date(statSync(absolute).mtimeMs).toISOString()
        return readFileSync(absolute, 'utf8').split('\n').map(() => mtime)
      } catch {
        return []
      }
    }
  }

  function loadStamps(): void {
    stamps = {}
    for (const path of contentFiles()) {
      stamps[path] = blameFile(path.slice(1))
    }
  }

  return {
    name: 'cafs-git-stamps',
    buildStart() {
      loadStamps()
    },
    resolveId(id) {
      if (id === 'virtual:cafs-git-stamps') return moduleId
    },
    load(id) {
      if (id !== moduleId) return
      return `export default ${JSON.stringify(stamps)}`
    },
    configureServer(server) {
      // The stamps module is cached per dev session; refresh it whenever any
      // project file changes so edited entries pick up their new date.
      const refresh = () => {
        loadStamps()
        const module = server.moduleGraph.getModuleById(moduleId)
        if (module) server.moduleGraph.invalidateModule(module)
      }
      server.watcher.on('change', refresh)
      server.watcher.on('add', refresh)
      server.watcher.on('unlink', refresh)
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/CAFS/',
  plugins: [gitStamps()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}))
