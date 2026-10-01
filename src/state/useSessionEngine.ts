import { useEffect, useState, useSyncExternalStore } from 'react'
import { LocalSessionStore } from './localSessionStore'
import { activeInDay, durations, todayBounds, type Action } from './sessionData'

let singleton: LocalSessionStore | undefined
function getStore() {
  if (!singleton) {
    // Access to window.localStorage itself can throw in restricted browsers.
    const storage = { getItem: (key: string) => window.localStorage.getItem(key), setItem: (key: string, value: string) => window.localStorage.setItem(key, value) }
    singleton = new LocalSessionStore(storage, navigator.locks ? (name, work) => navigator.locks.request(name, work) : undefined)
  }
  return singleton
}
export function useSessionEngine() {
  const store = getStore()
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const [now, setNow] = useState(Date.now)
  const [error, setError] = useState('')
  const [lastId, setLastId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  useEffect(() => {
    const refresh = () => { setNow(Date.now()); store.checkExternal() }
    const tick = window.setInterval(() => setNow(Date.now()), 1000)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    window.addEventListener('pageshow', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(tick)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('pageshow', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [store])
  useEffect(() => {
    if (!snapshot.unsaved) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [snapshot.unsaved])
  const execute = async (work: () => Promise<unknown>) => {
    setPending(true); setError('')
    try { await work(); setNow(Date.now()); return true }
    catch (e) { setError(e instanceof Error ? e.message : 'errors.actionFailed'); return false }
    finally { setPending(false) }
  }
  const dispatch = (action: Action) => execute(() => store.dispatch(action))
  const current = snapshot.data.current
  const end = current ? Math.max(now, current.lastAt) : now
  const times = current ? durations(current, end) : { elapsedMs: 0, pauseMs: 0, activeMs: 0 }
  const [dayStart, dayEnd] = todayBounds(now)
  const todaySessions = snapshot.data.sessions.filter(s => s.startAt < dayEnd && (s.endAt > dayStart || s.startAt === dayStart))
  return {
    ...snapshot, ...times, pending, now, error,
    status: current?.status ?? 'idle' as const,
    currentActivityId: current?.activityId ?? null,
    outputs: current?.outputs ?? [],
    finishedSessions: todaySessions,
    allSessions: snapshot.data.sessions,
    todayActiveMs: snapshot.data.sessions.reduce((sum, s) => sum + activeInDay(s, s.endAt, now), 0) + (current ? activeInDay(current, end, now) : 0),
    lastFinishedSession: snapshot.data.sessions.find(s => s.id === lastId) ?? null,
    start: (activityId: string) => dispatch({ type: 'start', activityId }),
    pause: () => current && dispatch({ type: 'pause', id: current.id }),
    resume: () => current && dispatch({ type: 'resume', id: current.id }),
    stop: async () => { if (current && await dispatch({ type: 'stop', id: current.id })) setLastId(current.id) },
    addOutput: (text: string) => current ? dispatch({ type: 'output', id: current.id, text }) : Promise.resolve(false),
    editOutput: (id: string, outputId: string, text: string) => dispatch({ type: 'edit-output', id, outputId, text }),
    dismissLastSummary: () => setLastId(null),
    exportData: store.export,
    rawBackup: store.rawBackup,
    importData: (text: string) => execute(() => store.import(text)),
    reloadData: () => { store.reload(); setError(''); setLastId(null) },
    retry: () => execute(store.retry),
  }
}
export type SessionEngine = ReturnType<typeof useSessionEngine>
