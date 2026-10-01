import type { OutputEntry } from '../types'
import { useState } from 'react'
import { useLocale } from '../i18n'

export function OutputList({ outputs, emptyLabel, onEdit }: { outputs: OutputEntry[]; emptyLabel: string; onEdit?: (id: string, text: string) => Promise<boolean> }) {
  const { t, locale } = useLocale()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  if (outputs.length === 0) return <p className="output-list__empty">{emptyLabel}</p>
  return <ul className="output-list">
    {outputs.map(entry => <li key={entry.id} className="output-list__item">
      <span className="output-list__time">{new Date(entry.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
      <span className="output-list__text">{entry.text}</span>
      {onEdit && (editing === entry.id ? <span>
        <input aria-label={t('output.label')} value={draft} onChange={e => setDraft(e.target.value)} maxLength={20000} />
        <button type="button" className="btn btn--secondary" disabled={saving || !draft.trim()} onClick={async () => {
          setSaving(true);try { if(await onEdit(entry.id,draft)) setEditing(null) } finally {setSaving(false)}
        }}>{t('output.save')}</button>
        <button type="button" className="btn btn--secondary" disabled={saving} onClick={() => setEditing(null)}>{t('output.cancel')}</button>
      </span> : <button type="button" className="btn btn--secondary" aria-label={`${t('output.edit')} Output：${entry.text}`} onClick={() => {setEditing(entry.id);setDraft(entry.text)}}>{t('output.edit')}</button>)}
    </li>)}
  </ul>
}
