import { useLocale } from '../i18n'
import { msToHM } from '../utils/time'
import type { BudgetStats } from '../utils/stats'

function HM({ ms }: { ms: number }) {
  const { h, m } = msToHM(ms)
  return (
    <span className="stat__value">
      {h}
      <span className="stat__unit">h</span>
      {String(m).padStart(2, '0')}
      <span className="stat__unit">m</span>
    </span>
  )
}

export function BudgetSummary({ stats }: { stats: BudgetStats }) {
  const { t } = useLocale()
  return (
    <section className="budget">
      <div className="stat">
        <span className="stat__label">{t('today.budget')}</span>
        <HM ms={stats.budgetMs} />
      </div>
      <div className="stat">
        <span className="stat__label">{t('today.actual')}</span>
        <HM ms={stats.actualMs} />
      </div>
      <div className="stat">
        <span className="stat__label">{t('today.utilisation')}</span>
        <span className="stat__value">{stats.utilisationPct.toFixed(1)}%</span>
      </div>
      <div className="stat">
        <span className="stat__label">{t('today.remaining')}</span>
        <HM ms={stats.remainingMs} />
      </div>
    </section>
  )
}
