import { el } from '../../utils/dom'

export function Footer(): HTMLElement {
  const footer = el('footer', { class: 'footer' })
  const left = el('span', { class: 'footer-brand' })
  left.innerHTML = 'CAFS'
  const links = el('div', { class: 'footer-links' })
  const linkData = [
    { label: 'GitHub ↗', href: 'https://github.com/Prawaldev/CAFS' },
    { label: 'back to top ↑', href: '#top' },
  ]
  linkData.forEach(l => {
    const a = el('a', { href: l.href, target: l.href.startsWith('#') ? undefined : '_blank', rel: l.href.startsWith('#') ? undefined : 'noopener' }, l.label)
    if (l.href.startsWith('#')) {
      a.addEventListener('click', (e) => {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
    links.appendChild(a)
  })
  footer.appendChild(left)
  footer.appendChild(links)
  return footer
}  
