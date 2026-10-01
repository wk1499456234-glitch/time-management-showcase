import { OutputList } from './OutputList'
import { useLocale } from '../i18n'
import { ACTIVITIES } from '../data/activities'
import { msToHM, formatLocalHM } from '../utils/time'
import type { FinishedSession } from '../types'

export function DailySessionsList({ sessions, onEditOutput }: { sessions: FinishedSession[]; onEditOutput: (sessionId: string, outputId: string, text: string) => Promise<boolean> }) {
  const { t, locale } = useLocale()

  return (
    <section className="daily-sessions">
      <h2 className="section__title">{t('today.todaySessions')}</h2>
      {sessions.length === 0 ? (
        <p className="daily-sessions__empty">{t('today.noSessions')}</p>
      ) : (
        <ul className="daily-sessions__list">
          {sessions
            .slice()
            .reverse()
            .map((session) => {
              const activity = ACTIVITIES.find((item) => item.id === session.activityId)
              const { h, m } = msToHM(session.activeMs)
              return (
                <li key={session.id} className="daily-sessions__item">
                  <span className="daily-sessions__name">{activity ? t(activity.nameKey) : ''}</span>
                  <span className="daily-sessions__time">
                    {new Date(session.startAt).toLocaleDateString(locale)} {formatLocalHM(session.startAt)}
                    {' – '}
                    {new Date(session.endAt).toLocaleDateString(locale)} {formatLocalHM(session.endAt)}
                  </span>
                  <span className="daily-sessions__active">
                    {h}h{String(m).padStart(2, '0')}m
                  </span>
                  <details className="daily-sessions__outputs"><summary>Output（{session.outputs.length}）</summary><OutputList outputs={session.outputs} emptyLabel={t('session.outputsEmpty')} onEdit={(id, text) => onEditOutput(session.id, id, text)} /></details>
                </li>
              )
            })}
        </ul>
      )}
    </section>
  )
}
