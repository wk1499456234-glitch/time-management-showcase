import { useLocale } from '../i18n'
import { ACTIVITIES } from '../data/activities'
import { msToHM } from '../utils/time'
import type { FinishedSession } from '../types'
import { OutputList } from './OutputList'

function HM({ ms }: { ms: number }) {
  const { h, m } = msToHM(ms)
  return (
    <span>
      {h}h{String(m).padStart(2, '0')}m
    </span>
  )
}

export function SessionSummaryCard({ session, onClose }: { session: FinishedSession; onClose: () => void }) {
  const { t } = useLocale()
  const activity = ACTIVITIES.find((item) => item.id === session.activityId)

  return (
    <section className="summary-card">
      <div className="summary-card__header">
        <h2 className="section__title">{t('summary.title')}</h2>
        <span className="summary-card__activity">{activity ? t(activity.nameKey) : ''}</span>
      </div>

      <div className="summary-card__stats">
        <div className="stat stat--compact">
          <span className="stat__label">{t('summary.elapsed')}</span>
          <span className="stat__value stat__value--small">
            <HM ms={session.elapsedMs} />
          </span>
        </div>
        <div className="stat stat--compact">
          <span className="stat__label">{t('summary.pauseTime')}</span>
          <span className="stat__value stat__value--small">
            <HM ms={session.pauseMs} />
          </span>
        </div>
        <div className="stat stat--compact">
          <span className="stat__label">{t('summary.activeTime')}</span>
          <span className="stat__value stat__value--small">
            <HM ms={session.activeMs} />
          </span>
        </div>
      </div>

      <div className="summary-card__outputs">
        <h3 className="section__title">{t('summary.outputsTitle')}</h3>
        <OutputList outputs={session.outputs} emptyLabel={t('summary.outputsEmpty')} />
      </div>

      <button type="button" className="btn btn--secondary" onClick={onClose}>
        {t('summary.close')}
      </button>
    </section>
  )
}
