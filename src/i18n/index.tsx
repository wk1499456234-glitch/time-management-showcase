import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Locale } from '../types'
import zhCN from './locales/zh-CN'
import jaJP from './locales/ja-JP'

const resources: Record<Locale, typeof zhCN> = {
  'zh-CN': zhCN,
  'ja-JP': jaJP,
}

type Vars = Record<string, string | number>

function resolve(dict: unknown, path: string[]): unknown {
  let cur: unknown = dict
  for (const key of path) {
    if (cur && typeof cur === 'object' && key in cur) {
      cur = (cur as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  return cur
}

function applyVars(text: string, vars?: Vars): string {
  if (!vars) return text
  return text.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Vars) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => { try { return localStorage.getItem('time-management.showcase.locale') === 'zh-CN' ? 'zh-CN' : 'ja-JP' } catch { return 'ja-JP' } })
  useEffect(() => { document.documentElement.lang = locale; try { localStorage.setItem('time-management.showcase.locale', locale) } catch { /* Language stays usable without storage. */ } }, [locale])

  const t = useCallback(
    (key: string, vars?: Vars) => {
      const value = resolve(resources[locale], key.split('.'))
      if (typeof value !== 'string') return key
      return applyVars(value, vars)
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
