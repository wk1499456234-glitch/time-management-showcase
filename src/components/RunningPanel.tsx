import { useRef, useState } from 'react'
import { useLocale } from '../i18n'
import { ACTIVITIES } from '../data/activities'
import { formatClock } from '../utils/time'
import type { OutputEntry, RunStatus } from '../types'
import { OutputList } from './OutputList'

interface RunningPanelProps {
  status: Extract<RunStatus, 'running' | 'paused'>
  activityId: string
  activeMs: number
  outputs: OutputEntry[]
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onAddOutput: (text: string) => Promise<boolean>
  onEditOutput: (id: string, text: string) => Promise<boolean>
}

export function RunningPanel({
  status,
  activityId,
  activeMs,
  outputs,
  onPause,
  onResume,
  onStop,
  onAddOutput,
  onEditOutput,
}: RunningPanelProps) {
  const { t } = useLocale()
  const [draft, setDraft] = useState('')
  const submitting = useRef(false)
  const activity = ACTIVITIES.find((item) => item.id === activityId)
  const isRunning = status === 'running'

  const submitOutput = async () => {
    if (!draft.trim() || submitting.current) return
    submitting.current = true
    try { if (await onAddOutput(draft)) setDraft('') } finally { submitting.current = false }
  }

  return (
    <section className={`running-panel${isRunning ? '' : ' running-panel--paused'}`}>
      <div className="running-panel__header">
        <span className="running-panel__status">{t(isRunning ? 'session.running' : 'session.paused')}</span>
        <span className="running-panel__activity">{activity ? t(activity.nameKey) : ''}</span>
      </div>

      <div className="running-panel__timer">{formatClock(activeMs)}</div>

      <div className="running-panel__actions">
        {isRunning ? (
          <button type="button" className="btn btn--secondary" onClick={onPause}>
            {t('session.pause')}
          </button>
        ) : (
          <button type="button" className="btn btn--secondary" onClick={onResume}>
            {t('session.resume')}
          </button>
        )}
        <button type="button" className="btn btn--danger" onClick={onStop}>
          {t('session.stop')}
        </button>
      </div>

      <div className="running-panel__outputs">
        <h3 className="section__title">{t('session.outputTitle')}</h3>
        {isRunning ? (
          <div className="output-input">
            <input
              type="text"
              aria-label={t('session.outputTitle')}
              maxLength={20000}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) submitOutput()
              }}
              placeholder={t('session.outputPlaceholder')}
              className="output-input__field"
            />
            <button type="button" className="btn btn--primary" onClick={submitOutput}>
              {t('session.addOutput')}
            </button>
          </div>
        ) : (
          <p className="running-panel__paused-notice">{t('session.pausedNotice')}</p>
        )}
        <OutputList outputs={outputs} emptyLabel={t('session.outputsEmpty')} onEdit={onEditOutput} />
      </div>
    </section>
  )
}
