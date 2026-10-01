import { useState } from 'react'
import { useSessionEngine } from './state/useSessionEngine'
import { LocalDataPanel } from './components/LocalDataPanel'
import { LocaleProvider, useLocale } from './i18n'
import { Nav } from './components/Nav'
import { LanguageSwitch } from './components/LanguageSwitch'
import { TodayPage } from './components/TodayPage'
import { PlaceholderPage } from './components/PlaceholderPage'
import type { PageKey } from './types'

function AppShell() {
  const engine = useSessionEngine()
  const { t } = useLocale()
  const [page, setPage] = useState<PageKey>('today')

  return (
    <div className="app">
      <div className="showcase-heading"><span>{t('showcase.badge')}</span><h1>{t('showcase.title')}</h1><p>{t('showcase.subtitle')}</p></div>
      <header className="app__header">
        <Nav page={page} onChange={setPage} />
        <LanguageSwitch />
      </header>
      <main className="app__main">
        <aside className="showcase-notice"><p>{t('showcase.privacy')}</p><details><summary>{t('showcase.guide')}</summary><p>{t('showcase.scope')}</p><p>{t('showcase.timer')}</p></details></aside>
        <LocalDataPanel engine={engine} />
        {page === 'today' ? <TodayPage engine={engine} /> : <PlaceholderPage page={page} />}
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
