import { el, headingIcon } from '../utils/dom'
import { icons } from '../utils/icons'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { pluralize } from '../utils/format'
import type { Site, Category } from '../types'

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function AboutPage(sites: Site[], categories: Category[]): HTMLElement {
  const page = el('div', { class: 'wiki-page about-page' })

  page.appendChild(Breadcrumbs([
    { label: 'Home', href: '/' },
    { label: 'About' },
  ]))

  const aboutHeading = el('h1', {})
  aboutHeading.appendChild(headingIcon('info'))
  aboutHeading.appendChild(document.createTextNode('About cafs'))
  page.appendChild(aboutHeading)
  page.appendChild(el('p', { class: 'wiki-lead' },
    'cafs is a curated index of the best anime, manga, reading, gaming and tool resources on the internet. Every entry is hand-picked and kept up to date.'))

  const sections: Array<{ title: string; icon: keyof typeof icons; body: string }> = [
    {
      title: 'What is this?',
      icon: 'info',
      body: 'cafs is an archive and discovery hub, not a search engine. Think of it as a vetted collection: sites are reviewed before they are listed, and entries are trimmed when they stop being useful.',
    },
    {
      title: 'How sites are curated',
      icon: 'star',
      body: 'Every site is manually reviewed. Criteria include reliable uptime, active maintenance, genuine utility, and community reputation. Featured entries are marked with a star.',
    },
    {
      title: 'Technical details',
      icon: 'settings',
      body: [
        'Built with Vite + TypeScript. All data is static JSON.',
        'No backend, no database, no authentication, no user accounts.',
        'Search is powered by Fuse.js and runs entirely in your browser.',
        'Favorites, history, and notes are stored in localStorage and never sent to a server.',
      ].join('\n'),
    },
    {
      title: 'Current status',
      icon: 'barChart3',
      body: `${pluralize(sites.length, 'site')} across ${pluralize(categories.length, 'page')}. Maintained by a small group of enthusiasts.`,
    },
    {
      title: 'Contributing',
      icon: 'github',
      body: 'To suggest a site, report a broken link, or contribute, open an issue or pull request on GitHub.',
    },
  ] 

  sections.forEach(section => {
    const block = el('section', { class: 'about-section' })
    const heading = el('h2', { class: 'about-section-title', id: slugify(section.title) })
    heading.appendChild(headingIcon(section.icon))
    heading.appendChild(document.createTextNode(section.title))
    block.appendChild(heading)
    block.appendChild(el('p', { class: 'about-body', style: 'white-space:pre-line;' }, section.body))
    page.appendChild(block)
  })

  return page
}
