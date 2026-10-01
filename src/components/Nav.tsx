import { useLocale } from '../i18n'
import type { PageKey } from '../types'

const PAGES: PageKey[] = ['today', 'history', 'analysis', 'settings']

interface NavProps {
  page: PageKey
  onChange: (page: PageKey) => void
}

export function Nav({ page, onChange }: NavProps) {
  const { t } = useLocale()
  return (
    <nav className="nav">
      {PAGES.map((key) => (
        <button
          key={key}
          type="button"
          className={`nav__item${page === key ? ' nav__item--active' : ''}`}
          onClick={() => onChange(key)}
        >
          {t(`nav.${key}`)}
        </button>
      ))}
    </nav>
  )
}
