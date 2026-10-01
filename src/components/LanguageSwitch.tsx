import { useLocale } from '../i18n'
import type { Locale } from '../types'

const LOCALES: Locale[] = ['zh-CN', 'ja-JP']
const LABELS: Record<Locale, string> = { 'zh-CN': '中文', 'ja-JP': '日本語' }

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale()
  return (
    <div className="lang-switch">
      {LOCALES.map((key) => (
        <button
          key={key}
          type="button"
          className={`lang-switch__item${locale === key ? ' lang-switch__item--active' : ''}`}
          onClick={() => setLocale(key)}
        >
          {LABELS[key]}
        </button>
      ))}
    </div>
  )
}
