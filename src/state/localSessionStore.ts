import { emptyData, mergeData, parseData, transition, type Action, type SessionData } from './sessionData'

export const STORAGE_KEY = 'time-management.showcase.v1'
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
export type LockPort = (name: string, callback: () => void) => Promise<unknown>
export type SaveResult = { status: 'saved' | 'memory-only' | 'unchanged' }
export interface StoreSnapshot { data: SessionData; warning: string; conflict: boolean; unsaved: boolean; savedOutput?: { text: string; revision: string } }

// 同一オリジンの書き込みを一つのWeb Lockで直列化し、保存値との比較で古いタブ、
// 削除、外部編集、読み込みを検出する。期限切れや読み取り・更新・書き込みの競合を避ける。
export class LocalSessionStore {
  private baseline: string | null = null
  private blocked = false
  private snapshot: StoreSnapshot = { data: emptyData(), warning: '', conflict: false, unsaved: false }
  private listeners = new Set<() => void>()
  private pendingKey: string | null = null
  private pendingAction?: Action
  private flights = new Map<string, Promise<SaveResult>>()
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
  // 画面で明示確認した場合だけ、このタブのメモリー上の変更を置き換える。
  reload = () => {
    try {
      const raw = this.storage.getItem(STORAGE_KEY)
      const data = raw === null ? emptyData() : parseData(raw)
      this.baseline = raw; this.blocked = !this.lock; this.pendingKey = null; this.pendingAction = undefined
      this.publish({ data, conflict: false, unsaved: false, warning: this.blocked ? 'errors.memoryOnly' : '' })
    } catch { this.publish({ ...this.snapshot, warning: 'errors.reloadFailed' }) }
  }
  export = () => JSON.stringify(this.snapshot.data, null, 2)
  rawBackup = () => this.baseline
  dispatch = (action: Action) => this.once(JSON.stringify(action), () => this.commit(data => transition(data, action, this.clock(), this.uuid), JSON.stringify(action), action))
  import = (raw: string) => {
    const incoming = parseData(raw)
    return this.once(raw, () => this.commit(data => mergeData(data, incoming), raw))
  }
  retry = () => this.once('retry', () => this.commit(data => data))
  private once(key: string, work: () => Promise<SaveResult>) {
    const existing = this.flights.get(key)
    if (existing) return existing
    const result = work().finally(() => this.flights.delete(key))
    this.flights.set(key, result)
    return result
  }
  private async commit(change: (data: SessionData) => SessionData, key?: string, action?: Action): Promise<SaveResult> {
    if (this.snapshot.conflict) throw new Error('errors.stale')
    let result: SaveResult = { status: 'unchanged' }
    const work = () => {
      if (this.snapshot.conflict) throw new Error('errors.staleAction')
      // 書き込み失敗時も操作はメモリーへ適用済み。その状態の保存だけを再試行し、
      // 追加・読み込みは再実行しない。保存が終わるまで別の変更を拒否する。
      if (this.snapshot.unsaved && key && key !== this.pendingKey) throw new Error('errors.retryFirst')
      // 状態遷移前に検査し、他タブとの競合で拒否した操作を再実行しない。
      if (!this.blocked) {
        try {
          if (this.storage.getItem(STORAGE_KEY) !== this.baseline) { this.conflict(); throw new Error('errors.changed') }
        } catch (error) {
          if (this.snapshot.conflict) throw error
          this.blocked = true
        }
      }
      const previous = this.snapshot.data
      const retry = this.snapshot.unsaved
      const changed = retry ? previous : change(previous)
      if (changed === previous && !retry) return
      const data = retry ? previous : { ...changed, revision: this.uuid() }
      const raw = JSON.stringify(data)
      // 生成した保存形式も検査する。拒否した読み込みで状態を部分更新しない。
      parseData(raw)
      if (!retry) { this.pendingKey = key ?? null; this.pendingAction = action }
      let warning = this.snapshot.warning, unsaved = true
      if (!this.blocked) {
        try {
          this.storage.setItem(STORAGE_KEY, raw)
          this.baseline = raw; warning = ''; unsaved = false
        } catch { warning = 'errors.saveFailed' }
      } else warning = this.snapshot.warning || 'errors.unavailable'
      const savedOutput = !unsaved && this.pendingAction?.type === 'output'
        ? { text: this.pendingAction.text, revision: data.revision } : this.snapshot.savedOutput
      if (!unsaved) { this.pendingKey = null; this.pendingAction = undefined }
      this.publish({ data, warning, unsaved, conflict: false, savedOutput })
      result = { status: unsaved ? 'memory-only' : 'saved' }
    }
    if (this.lock) await this.lock(STORAGE_KEY, work)
    else work()
    return result
  }
}
