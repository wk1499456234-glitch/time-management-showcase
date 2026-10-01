import { emptyData, mergeData, parseData, transition, type Action, type SessionData } from './sessionData'

export const STORAGE_KEY = 'time-management.showcase.v1'
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
export type LockPort = (name: string, callback: () => void) => Promise<unknown>
export interface StoreSnapshot { data: SessionData; warning: string; conflict: boolean; unsaved: boolean }

// All writers use one same-origin Web Lock; raw baseline comparison detects stale tabs,
// deletion, external edits and imports. No lease expiry or read/modify/write race.
export class LocalSessionStore {
  private baseline: string | null = null
  private blocked = false
  private snapshot: StoreSnapshot = { data: emptyData(), warning: '', conflict: false, unsaved: false }
  private listeners = new Set<() => void>()
  constructor(private storage: StoragePort, private lock: LockPort | undefined, private clock = Date.now, private uuid = () => crypto.randomUUID()) {
    try {
      this.baseline = storage.getItem(STORAGE_KEY)
      if (this.baseline !== null) this.snapshot.data = parseData(this.baseline)
    } catch {
      this.blocked = true
      this.snapshot.warning = 'errors.readFailed'
    }
    if (!lock) {
      this.blocked = true
      this.snapshot.warning = 'errors.noLocks'
    }
  }
  getSnapshot = () => this.snapshot
  subscribe = (callback: () => void) => { this.listeners.add(callback); return () => { this.listeners.delete(callback) } }
  private publish(next: StoreSnapshot) { this.snapshot = next; this.listeners.forEach(fn => fn()) }
  private conflict() { this.publish({ ...this.snapshot, conflict: true, warning: 'errors.conflict' }) }
  checkExternal = () => {
    if (this.blocked) return
    try { if (this.storage.getItem(STORAGE_KEY) !== this.baseline) this.conflict() }
    catch { this.publish({ ...this.snapshot, warning: 'errors.storageRead', unsaved: true }) }
  }
  // Only the explicit UI confirmation may replace this tab's in-memory branch.
  reload = () => {
    try {
      const raw = this.storage.getItem(STORAGE_KEY)
      const data = raw === null ? emptyData() : parseData(raw)
      this.baseline = raw; this.blocked = !this.lock
      this.publish({ data, conflict: false, unsaved: false, warning: this.blocked ? 'errors.memoryOnly' : '' })
    } catch { this.publish({ ...this.snapshot, warning: 'errors.reloadFailed' }) }
  }
  export = () => JSON.stringify(this.snapshot.data, null, 2)
  rawBackup = () => this.baseline
  dispatch = (action: Action) => this.commit(data => transition(data, action, this.clock(), this.uuid))
  import = (raw: string) => {
    const incoming = parseData(raw)
    return this.commit(data => mergeData(data, incoming))
  }
  retry = () => this.commit(data => data, true)
  private async commit(change: (data: SessionData) => SessionData, retry = false) {
    if (this.snapshot.conflict) throw new Error('errors.stale')
    const work = () => {
      if (this.snapshot.conflict) throw new Error('errors.staleAction')
      // Checking before transition means rejected cross-tab clicks are never replayed.
      if (!this.blocked) {
        try {
          if (this.storage.getItem(STORAGE_KEY) !== this.baseline) { this.conflict(); throw new Error('errors.changed') }
        } catch (error) {
          if (this.snapshot.conflict) throw error
          this.blocked = true
        }
      }
      const previous = this.snapshot.data
      const changed = change(previous)
      if (changed === previous && !retry) return
      const data = { ...changed, revision: this.uuid() }
      const raw = JSON.stringify(data)
      // Validate our own envelope too; rejected imports cannot partially mutate state.
      parseData(raw)
      let warning = this.snapshot.warning, unsaved = true
      if (!this.blocked) {
        try {
          this.storage.setItem(STORAGE_KEY, raw)
          this.baseline = raw; warning = ''; unsaved = false
        } catch { warning = 'errors.saveFailed' }
      } else warning = this.snapshot.warning || 'errors.unavailable'
      this.publish({ data, warning, unsaved, conflict: false })
    }
    if (this.lock) await this.lock(STORAGE_KEY, work)
    else work()
  }
}
