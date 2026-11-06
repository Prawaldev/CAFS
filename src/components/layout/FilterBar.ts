import { el } from '../../utils/dom'
import { icon } from '../../utils/icons'
import type { FilterState, SortOption, Category } from '../../types'

export function FilterBar(
  filters: FilterState,
  onFilterChange: (filters: FilterState) => void,
  onViewChange: (view: 'grid' | 'list' | 'compact') => void,
  currentView: 'grid' | 'list' | 'compact',
  categories: Category[] = [],
  onClearFilter?: () => void,
): HTMLElement {
  const bar = el('div', { class: 'collection-toolbar' })
  const controls = el('div', { class: 'collection-toolbar-controls' })

  const sortWrap = el('label', { class: 'collection-sort' })
  sortWrap.appendChild(el('span', { class: 'collection-sort-label' }, 'Sort'))
  const sortSelect = el('select', { class: 'filter-select', 'aria-label': 'Sort sites' }) as HTMLSelectElement
  const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: 'name-asc', label: 'Name ↑' },
    { value: 'name-desc', label: 'Name ↓' },
    { value: 'added', label: 'Recently added' },
    { value: 'updated', label: 'Recently updated' },
  ]
  sortOptions.forEach(opt => {
    const option = el('option', { value: opt.value }, opt.label) as HTMLOptionElement
    if (opt.value === filters.sort) option.selected = true
    sortSelect.appendChild(option)
  })
  sortSelect.addEventListener('change', () => {
    onFilterChange({ ...filters, sort: sortSelect.value as SortOption })
  })
  sortWrap.appendChild(sortSelect)
  controls.appendChild(sortWrap)

  const density = el('div', { class: 'collection-density', role: 'group', 'aria-label': 'Row density' })
  const densities: Array<{ id: 'list' | 'compact'; label: string; icon: string }> = [
    { id: 'list', label: 'Comfortable', icon: icon('list') },
    { id: 'compact', label: 'Compact', icon: icon('columns') },
  ]
  const activeDensity = currentView === 'compact' ? 'compact' : 'list'
  densities.forEach(item => {
    const btn = el('button', {
      class: `collection-density-btn${activeDensity === item.id ? ' active' : ''}`,
      type: 'button',
      title: `${item.label} rows`,
      'aria-pressed': String(activeDensity === item.id),
    })
    btn.innerHTML = `${item.icon}<span>${item.label}</span>`
    btn.addEventListener('click', () => onViewChange(item.id))
    density.appendChild(btn)
  })
  controls.appendChild(density)
  bar.appendChild(controls)

  const catMap = new Map(categories.map(cat => [cat.id, cat.name]))
  const subcatMap = new Map(categories.flatMap(cat => cat.subcategories.map(sub => [sub.id, sub.name])))

  if (filters.subcategory) {
    const name = subcatMap.get(filters.subcategory) || filters.subcategory
    const chip = el('button', {
      class: 'collection-filter-chip',
      type: 'button',
      title: 'Clear subcategory filter',
    })
    chip.appendChild(el('span', {}, name))
    const close = el('span', { 'aria-hidden': 'true' })
    close.innerHTML = icon('x')
    chip.appendChild(close)
    chip.addEventListener('click', () => {
      if (onClearFilter) onClearFilter()
      else onFilterChange({ ...filters, category: null, subcategory: null })
    })
    bar.appendChild(chip)
  } else if (filters.category) {
    const name = catMap.get(filters.category) || filters.category
    const chip = el('button', {
      class: 'collection-filter-chip',
      type: 'button',
      title: 'Clear collection filter',
    })
    chip.appendChild(el('span', {}, name))
    const close = el('span', { 'aria-hidden': 'true' })
    close.innerHTML = icon('x')
    chip.appendChild(close)
    chip.addEventListener('click', () => {
      if (onClearFilter) onClearFilter()
      else onFilterChange({ ...filters, category: null, subcategory: null })
    })
    bar.appendChild(chip)
  }

  return bar
}
