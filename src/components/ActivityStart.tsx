import { useLocale } from '../i18n'
import { ACTIVITIES } from '../data/activities'

export function ActivityStart({ onStart }: { onStart: (activityId: string) => void }) {
  const { t } = useLocale()
  return (
    <section className="activity-start">
      <h2 className="section__title">{t('today.startTitle')}</h2>
      <div className="activity-grid">
        {ACTIVITIES.map((activity) => (
          <button
            key={activity.id}
            type="button"
            className="activity-card"
            onClick={() => onStart(activity.id)}
          >
            <span className="activity-card__name">{t(activity.nameKey)}</span>
            <span className="activity-card__start">{t('today.start')}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
