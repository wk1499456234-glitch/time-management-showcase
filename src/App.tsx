import { useEffect, useLayoutEffect, useState } from 'react'
import { useSessionEngine } from './state/useSessionEngine'
import { LocalDataPanel } from './components/LocalDataPanel'
import { LocaleProvider, useLocale } from './i18n'
import { Nav } from './components/Nav'
import { LanguageSwitch } from './components/LanguageSwitch'
import { TodayPage } from './components/TodayPage'
import { PlaceholderPage } from './components/PlaceholderPage'
import type { PageKey } from './types'

const SECTIONS = ['timer', 'records', 'backup'] as const
type Section = typeof SECTIONS[number]

function AppShell() {
  const engine = useSessionEngine()
  const { t } = useLocale()
  const [page, setPage] = useState<PageKey>('today')
  const [destination, setDestination] = useState<{ id: Section; visit: number } | null>(null)
  const locate = (hash: string) => {
    const id = SECTIONS.find(section => hash === `#${section}`)
    if (!id) return
    setPage('today')
    setDestination(previous => ({ id, visit: (previous?.visit ?? 0) + 1 }))
  }
  useEffect(() => {
    const onHashChange = () => locate(window.location.hash)
    onHashChange()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  useLayoutEffect(() => {
    if (!destination) return
    const target = document.getElementById(destination.id)
    if (destination.id === 'backup') {
      const details = target?.querySelector('details')
      if (details) details.open = true
    }
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: 'start' })
  }, [destination])

  return (
    <div className="app">
      <div className="showcase-heading"><span>{t('showcase.badge')}</span><h1>{t('showcase.title')}</h1><p>{t('showcase.subtitle')}</p></div>
      <header className="app__header">
        <Nav page={page} onChange={setPage} />
        <LanguageSwitch />
      </header>
      <main className="app__main">
        <nav className="section-nav" aria-label={t('sections.label')}>
          {SECTIONS.map(id => <a key={id} href={`#${id}`}
            aria-current={page === 'today' && destination?.id === id ? 'location' : undefined}
            onClick={event => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
              event.preventDefault()
              if (window.location.hash === `#${id}`) locate(`#${id}`)
              else window.location.hash = id
            }}>{t(`sections.${id}`)}</a>)}
        </nav>
        <aside className="showcase-notice"><p>{t('showcase.privacy')}</p><details><summary>{t('showcase.guide')}</summary><p>{t('showcase.scope')}</p><p>{t('showcase.timer')}</p></details></aside>
        <LocalDataPanel engine={engine} />
        <div hidden={page !== 'today'}><TodayPage engine={engine} /></div>
        {page !== 'today' && <PlaceholderPage page={page} />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <LocaleProvider>
      <AppShell />
    </LocaleProvider>
  )
}
