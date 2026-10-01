import { useState } from 'react'
import type { SessionEngine } from '../state/useSessionEngine'
import { parseData } from '../state/sessionData'
import { useLocale } from '../i18n'

function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }))
  const a = document.createElement('a'); a.href = url; a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function LocalDataPanel({ engine }: { engine: SessionEngine }) {
  const { t } = useLocale()
  const [message, setMessage] = useState('')
  const [candidate, setCandidate] = useState<{text: string; count: number; current: boolean} | null>(null)
  const [confirmReload, setConfirmReload] = useState(false)
  const errorText = (key: string) => key ? t(key.startsWith('errors.') ? key : 'errors.actionFailed') : ''
  const state = engine.unsaved ? 'unsaved' : engine.conflict || engine.warning ? 'attention' : engine.data.revision === 'empty' ? 'ready' : 'saved'
  return <section className="local-data" aria-label={t('data.title')}>
    {(engine.warning || engine.error) && <p role="alert">{errorText(engine.warning)} {errorText(engine.error)}</p>}
    <details>
      <summary>{t('data.title')} · {t(`data.${state}`)}</summary>
      <p>{t('data.timing')}</p>
      <div className="local-data__actions">
        <button className="btn btn--secondary" onClick={() => download(engine.exportData(), `time-management-backup-${new Date().toISOString().replace(/[:.]/g,'-')}.json`)}>{t('data.export')}</button>
        <label className="btn btn--secondary">{t('data.import')}
          <input aria-label={t('data.importLabel')} type="file" accept=".json,application/json" disabled={engine.conflict || engine.pending} onChange={async event => {
            const file = event.target.files?.[0]; event.target.value = ''
            if (!file) return
            setMessage(''); setCandidate(null)
            try {
              if (file.size > 5_000_000) throw new Error('errors.tooLarge')
              const text = await file.text(); const data = parseData(text)
              setCandidate({text,count:data.sessions.length,current:!!data.current})
            } catch (e) { setMessage(e instanceof Error && e.message.startsWith('errors.') ? e.message : 'errors.invalid') }
          }} />
        </label>
        {engine.unsaved && !engine.conflict && <button className="btn btn--secondary" onClick={engine.retry}>{t('data.retry')}</button>}
        {(engine.conflict || engine.warning) && <button className="btn btn--secondary" onClick={() => setConfirmReload(true)}>{t('data.reload')}</button>}
        {engine.rawBackup() !== null && engine.warning && <button className="btn btn--secondary" onClick={() => download(engine.rawBackup()!, 'time-management-raw-backup.json')}>{t('data.raw')}</button>}
      </div>
      {candidate && <div role="region" aria-label={t('data.confirmTitle')}>
        <p>{t('data.merge', {count: candidate.count, current: candidate.current ? t('data.withCurrent') : ''})}</p>
        <button className="btn btn--secondary" disabled={engine.pending || engine.conflict} onClick={async () => {
          if (await engine.importData(candidate.text)) {setMessage('data.success');setCandidate(null)}
        }}>{t('data.confirm')}</button>
        <button className="btn btn--secondary" onClick={() => setCandidate(null)}>{t('data.cancel')}</button>
      </div>}
      {confirmReload && <div role="region" aria-label={t('data.reloadTitle')}>
        <p>{t('data.reloadWarning')}</p>
        <button className="btn btn--secondary" onClick={() => {engine.reloadData();setConfirmReload(false)}}>{t('data.reloadConfirm')}</button>
        <button className="btn btn--secondary" onClick={() => setConfirmReload(false)}>{t('output.cancel')}</button>
      </div>}
      <p role="status">{message ? t(message) : t('data.count', {count: engine.allSessions.length})}</p>
    </details>
  </section>
}
