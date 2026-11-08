import { parseMarkdownDocument } from '../utils/markdown'
import type { Category, Site, Subcategory } from '../types'

// Category content lives in docs/public/ so it can also be edited without touching
// the application source. Each file holds one category and all of its
// resources, grouped under `## Name {#subcategory-id}` headings.
const categoryFiles = import.meta.glob('/docs/public/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// Last-modified stamps straight from the content files (refreshed on every dev
// edit and every build). Entries without their own `addedAt` / `updatedAt`
// meta inherit their file's real timestamp instead of a fixed placeholder.
const fileMtimes = import.meta.glob('/docs/public/*.md', {
  query: '?mtime',
  import: 'default',
  eager: true,
}) as Record<string, number>

interface CategoryEntry {
  category: Category
  order: number
  path: string
}

interface SiteEntry {
  site: Site
  order: number
  path: string
  documentIndex: number
}

interface ResourceMeta {
  [key: string]: string
}

function fail(path: string, message: string): never {
  throw new Error(`[public] ${path}: ${message}`)
}

function fileStem(path: string): string {
  const file = path.slice(path.lastIndexOf('/') + 1)
  return file.replace(/\.md$/, '')
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function asSubcategories(value: unknown, path: string): Subcategory[] {
  if (!Array.isArray(value)) return []

  return value.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      fail(path, `subcategories[${index}] must be an object`)
    }

    const record = item as Record<string, unknown>
    const id = asString(record.id)
    const name = asString(record.name)

    if (!id) fail(path, `subcategories[${index}] is missing an id`)
    if (!name) fail(path, `subcategories[${index}] is missing a name`)

    return { id, name }
  })
}

function splitMeta(source: string): ResourceMeta {
  const meta: ResourceMeta = {}

  for (const part of source.split(';')) {
    const separator = part.indexOf(':')
    if (separator === -1) continue

    const key = part.slice(0, separator).trim()
    const value = part.slice(separator + 1).trim()
    if (key) meta[key] = value
  }

  return meta
}

function parseBoolean(value: string | undefined): boolean | string {
  if (value === undefined) return false
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}

function parseSections(body: string): Array<{ id: string; name: string; lines: string[] }> {
  const sections: Array<{ id: string; name: string; lines: string[] }> = []
  let current: { id: string; name: string; lines: string[] } | null = null

  for (const line of body.split('\n')) {
    const heading = /^##\s+(.+?)\s*\{#([^}]+)\}\s*$/.exec(line)
    if (heading) {
      current = { id: heading[2].trim(), name: heading[1].trim(), lines: [] }
      sections.push(current)
      continue
    }

    if (current && line.trim()) current.lines.push(line)
  }

  return sections
}

function parseResource(
  path: string,
  line: string,
  category: Category,
  subcategory: string,
  fileMtime: number,
): { site: Site; order: number } {
  const link = /^\-\s+\[([^\]]+)\]\(([^)\s]+)\)/.exec(line)
  if (!link) fail(path, `invalid resource line: ${line}`)

  const metaMatch = /<!--\s*([\s\S]*?)\s*-->\s*$/.exec(line)
  const meta = splitMeta(metaMatch ? metaMatch[1] : '')

  const name = link[1].trim()
  const url = link[2].trim()
  const rest = line.slice(link[0].length).trim()
  const description = rest
    .replace(/^—\s*/, '')
    .replace(/<!--\s*[\s\S]*?-->\s*$/, '')
    .trim()

  if (!name) fail(path, 'resource name is required')
  if (!description) fail(path, `resource "${name}" is missing a description`)
  if (!/^https?:\/\//i.test(url)) {
    fail(path, `resource "${name}" url must start with http:// or https://`)
  }

  const rawId = meta.id || slugify(name)
  if (!rawId) fail(path, `resource "${name}" is missing an id`)

  const fallbackStamp = new Date(fileMtime).toISOString()

  const site: Site = {
    id: rawId,
    name,
    description,
    shortDescription: description,
    url,
    category: category.id,
    subcategory,
    tags: meta.tags ? meta.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    language: meta.language || 'en',
    requires: meta.requires || '',
    curatorNote: meta.curatorNote || '',
    featured: parseBoolean(meta.featured),
    addedAt: meta.addedAt || fallbackStamp,
    updatedAt: meta.updatedAt || fallbackStamp,
  }

  const order = meta.order === undefined
    ? Number.MAX_SAFE_INTEGER
    : asNumber(Number(meta.order), Number.MAX_SAFE_INTEGER)

  return { site, order }
}

function loadCategories(): CategoryEntry[] {
  const entries = Object.entries(categoryFiles)
    .filter(([path]) => fileStem(path).toLowerCase() !== 'readme')
    .map(([path, raw]): CategoryEntry => {
      const { data, body } = parseMarkdownDocument(raw)
      const id = slugify(fileStem(path))
      const name = asString(data.name)

      if (!name) fail(path, 'name is required')
      if (!id) fail(path, 'category filename must contain letters or numbers')

      const intro = body.split(/^##\s/m)[0].trim()
      const description = asString(data.description) || intro
      if (!description) fail(path, 'description is required')

      return {
        category: {
          id,
          name,
          description,
          icon: asString(data.icon, 'folder'),
          subcategories: asSubcategories(data.subcategories, path),
        },
        order: asNumber(data.order, Number.MAX_SAFE_INTEGER),
        path,
      }
    })

  entries.sort((a, b) => a.order - b.order || a.category.name.localeCompare(b.category.name))

  const seen = new Set<string>()
  for (const entry of entries) {
    if (seen.has(entry.category.id)) fail(entry.path, `duplicate category id "${entry.category.id}"`)
    seen.add(entry.category.id)
  }

  return entries
}

function loadSites(categories: Category[]): SiteEntry[] {
  const entries: SiteEntry[] = []
  let documentIndex = 0

  for (const [path, raw] of Object.entries(categoryFiles)) {
    if (fileStem(path).toLowerCase() === 'readme') continue

    const { body } = parseMarkdownDocument(raw)
    const id = slugify(fileStem(path))
    const category = categories.find(item => item.id === id)
    if (!category) fail(path, `category "${id}" was not loaded`)
    const known = new Set(category.subcategories.map(sub => sub.id))
    const sections = parseSections(body)
    const headings = new Set<string>()

    for (const section of sections) {
      if (headings.has(section.id)) fail(path, `duplicate section id "${section.id}"`)
      headings.add(section.id)
      if (!known.has(section.id)) {
        fail(path, `section "${section.id}" is not declared in subcategories`)
      }

      for (const line of section.lines) {
        const { site, order } = parseResource(path, line, category, section.id, fileMtimes[path] ?? 0)
        entries.push({
          site,
          order,
          path,
          documentIndex: documentIndex++,
        })
      }
    }
  }

  entries.sort((a, b) => a.order - b.order || a.documentIndex - b.documentIndex)

  const seen = new Set<string>()
  for (const entry of entries) {
    if (seen.has(entry.site.id)) fail(entry.path, `duplicate resource id "${entry.site.id}"`)
    seen.add(entry.site.id)
  }

  return entries
}

export interface Catalog {
  sites: Site[]
  categories: Category[]
}

export function loadCatalog(): Catalog {
  const categories = loadCategories().map(entry => entry.category)
  const sites = loadSites(categories).map(entry => entry.site)
  return { sites, categories }
}
