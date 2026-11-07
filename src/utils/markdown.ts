import DOMPurify from 'dompurify'
import { marked } from 'marked'

export interface MarkdownDocument {
  data: Record<string, unknown>
  body: string
}

const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/
const INLINE_SANITIZE_OPTIONS = {
  ALLOWED_TAGS: ['a', 'br', 'code', 'em', 'strong'],
  ALLOWED_ATTR: ['href', 'title'],
}

function parseScalar(raw: string): unknown {
  const value = raw.trim()

  if (value === '') return ''
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim()
    if (!inner) return []
    return splitInlineList(inner).map(parseScalar)
  }
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value)
    } catch {
      return value.slice(1, -1)
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'")
  }
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null' || value === '~') return null
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value)
  return value
}

function splitInlineList(value: string): string[] {
  const items: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null

  for (const char of value) {
    if (quote) {
      if (char === quote) quote = null
      current += char
    } else if (char === '"' || char === "'") {
      quote = char
      current += char
    } else if (char === ',') {
      items.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  if (current.trim()) items.push(current.trim())
  return items
}

/**
 * Parses the small YAML subset used by CAFS content: scalar values, inline
 * arrays, block lists, and lists of flat key/value objects.
 */
function parseFrontmatter(source: string): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  let currentList: unknown[] | null = null

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const indented = /^\s/.test(rawLine)

    if (!indented) {
      const pair = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line)
      if (!pair) throw new Error(`Invalid frontmatter line: ${line}`)

      const [, key, rawValue = ''] = pair
      if (rawValue.trim() === '') {
        currentList = []
        data[key] = currentList
      } else {
        data[key] = parseScalar(rawValue)
        currentList = null
      }
      continue
    }

    if (!currentList) {
      throw new Error(`Unexpected indented frontmatter line: ${line}`)
    }

    const listItem = /^-\s*(.*)$/.exec(line)
    if (listItem) {
      const item = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(listItem[1])
      if (item) {
        currentList.push({ [item[1]]: parseScalar(item[2]) })
      } else {
        currentList.push(parseScalar(listItem[1]))
      }
      continue
    }

    const last = currentList[currentList.length - 1]
    const property = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (property && last && typeof last === 'object' && !Array.isArray(last)) {
      ;(last as Record<string, unknown>)[property[1]] = parseScalar(property[2])
      continue
    }

    throw new Error(`Invalid frontmatter list item: ${line}`)
  }

  return data
}

export function parseMarkdownDocument(raw: string): MarkdownDocument {
  const normalized = raw.replace(/\r\n?/g, '\n')
  const match = FRONTMATTER_PATTERN.exec(normalized)

  if (!match) {
    return { data: {}, body: normalized.trim() }
  }

  return {
    data: parseFrontmatter(match[1]),
    body: match[2].trim(),
  }
}

export function renderInlineMarkdown(source: string): string {
  const html = marked.parseInline(source, { async: false, gfm: true })
  return DOMPurify.sanitize(html as string, INLINE_SANITIZE_OPTIONS)
}
