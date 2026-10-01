import { useLocale } from '../i18n'
import type { PageKey } from '../types'

export function PlaceholderPage({ page }: { page: PageKey }) {
  const { t } = useLocale()
  return (
    <section className="page">
      <h1 className="page__title">{t(`nav.${page}`)}</h1>
      <p className="placeholder">{t('placeholder.comingLater')}</p>
    </section>
  )
}
