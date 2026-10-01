import type { FinishedSession, OutputEntry, PauseInterval } from '../types'
import { ACTIVITIES } from '../data/activities'

export interface CurrentSession {
  id: string
  activityId: string
  startAt: number
  lastAt: number
  status: 'running' | 'paused'
  pauseIntervals: PauseInterval[]
  outputs: OutputEntry[]
}
export interface SessionData {
  format: 'time-management-local'
  version: 1
  revision: string
  sessions: FinishedSession[]
  current: CurrentSession | null
}
export type Action =
  | { type: 'start'; activityId: string }
  | { type: 'pause' | 'resume' | 'stop'; id: string }
  | { type: 'output'; id: string; text: string }
  | { type: 'edit-output'; id: string; outputId: string; text: string }

export const emptyData = (): SessionData => ({ format: 'time-management-local', version: 1, revision: 'empty', sessions: [], current: null })
export function durations(run: { startAt: number; pauseIntervals: PauseInterval[] }, end: number) {
  const elapsedMs = Math.max(0, end - run.startAt)
  const pauseMs = run.pauseIntervals.reduce((sum, p) => sum + Math.max(0, (p.end ?? end) - p.start), 0)
  return { elapsedMs, pauseMs, activeMs: Math.max(0, elapsedMs - pauseMs) }
}
export function todayBounds(now: number): [number, number] {
  const start = new Date(now); start.setHours(0, 0, 0, 0)
  const end = new Date(start); end.setDate(end.getDate() + 1)
  return [start.getTime(), end.getTime()]
}
export function activeInDay(run: { startAt: number; pauseIntervals: PauseInterval[] }, endAt: number, now: number) {
  const [dayStart, dayEnd] = todayBounds(now)
  const lo = Math.max(run.startAt, dayStart), hi = Math.min(endAt, dayEnd)
  if (hi <= lo) return 0
  return Math.max(0, hi - lo - run.pauseIntervals.reduce((sum, p) => sum + Math.max(0, Math.min(p.end ?? endAt, hi) - Math.max(p.start, lo)), 0))
}
export function transition(data: SessionData, action: Action, clock: number, uuid: () => string): SessionData {
  const run = data.current
  if (action.type === 'edit-output') {
    const text = action.text
    if (!text.trim() || text.length > 20000) throw new Error('errors.outputInvalid')
    const edit = (outputs: OutputEntry[]) => outputs.map(o => o.id === action.outputId ? { ...o, text } : o)
    if (run?.id === action.id) return { ...data, current: { ...run, outputs: edit(run.outputs) } }
    return { ...data, sessions: data.sessions.map(s => s.id === action.id ? { ...s, outputs: edit(s.outputs) } : s) }
  }
  if (action.type === 'start') {
    if (run || !ACTIVITIES.some(a => a.id === action.activityId)) return data
    const latest = data.sessions.reduce((n, s) => Math.max(n, s.endAt), 0)
    const at = Math.max(clock, latest)
    return { ...data, current: { id: uuid(), activityId: action.activityId, startAt: at, lastAt: at, status: 'running', pauseIntervals: [], outputs: [] } }
  }
  if (!run || run.id !== action.id) return data
  const at = Math.max(clock, run.lastAt)
  if (action.type === 'pause' && run.status === 'running') {
    return { ...data, current: { ...run, status: 'paused', lastAt: at, pauseIntervals: [...run.pauseIntervals, { start: at, end: null }] } }
  }
  if (action.type === 'resume' && run.status === 'paused') {
    return { ...data, current: { ...run, status: 'running', lastAt: at, pauseIntervals: run.pauseIntervals.map(p => p.end === null ? { ...p, end: at } : p) } }
  }
  if (action.type === 'output' && run.status === 'running' && action.text.trim()) {
    if (action.text.length > 20000) throw new Error('errors.outputLong')
    return { ...data, current: { ...run, lastAt: at, outputs: [...run.outputs, { id: uuid(), text: action.text, createdAt: at }] } }
  }
  if (action.type === 'stop') {
    const pauseIntervals = run.pauseIntervals.map(p => p.end === null ? { ...p, end: at } : p)
    const session: FinishedSession = { id: run.id, activityId: run.activityId, startAt: run.startAt, endAt: at, pauseIntervals, outputs: run.outputs, ...durations({ ...run, pauseIntervals }, at) }
    return { ...data, current: null, sessions: [...data.sessions, session] }
  }
  return data
}

const fail = (): never => { throw new Error('errors.invalid') }
const object = (v: unknown): Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : fail()
const string = (v: unknown, max = 200): string => typeof v === 'string' && v.length > 0 && v.length <= max ? v : fail()
const timestamp = (v: unknown): number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 && v <= 8640000000000000 ? v : fail()
const array = (v: unknown): unknown[] => Array.isArray(v) && v.length <= 10000 ? v : fail()
const keys = (v: Record<string, unknown>, allowed: string[]) => { if (Object.keys(v).some(k => !allowed.includes(k))) fail() }
function readRun(input: unknown, current: boolean): CurrentSession | FinishedSession {
  const r = object(input)
  keys(r, current ? ['id','activityId','startAt','lastAt','status','pauseIntervals','outputs'] : ['id','activityId','startAt','endAt','pauseIntervals','outputs','elapsedMs','pauseMs','activeMs'])
  const id = string(r.id), activityId = string(r.activityId), startAt = timestamp(r.startAt)
  if (!ACTIVITIES.some(a => a.id === activityId)) fail()
  const end = timestamp(current ? r.lastAt : r.endAt)
  if (end < startAt || (current && r.status !== 'running' && r.status !== 'paused')) fail()
  let previous = startAt, open = 0
  const pauseIntervals = array(r.pauseIntervals).map((value, i, all) => {
    const p = object(value); keys(p, ['start','end'])
    const start = timestamp(p.start), stop = p.end === null ? null : timestamp(p.end)
    if (start < previous || start > end || (stop !== null && (stop < start || stop > end))) fail()
    if (stop === null) { if (!current || i !== all.length - 1) fail(); open++ }
    previous = stop ?? end
    return { start, end: stop }
  })
  if (current && open !== (r.status === 'paused' ? 1 : 0)) fail()
  const ids = new Set<string>()
  const outputs = array(r.outputs).map(value => {
    const o = object(value); keys(o, ['id','text','createdAt'])
    const output = { id: string(o.id), text: string(o.text, 20000), createdAt: timestamp(o.createdAt) }
    if (ids.has(output.id) || !output.text.trim() || output.createdAt < startAt || output.createdAt > end) fail()
    ids.add(output.id); return output
  })
  const base = { id, activityId, startAt, pauseIntervals, outputs }
  if (current) return { ...base, lastAt: end, status: r.status as CurrentSession['status'] }
  const times = durations(base, end)
  if (r.elapsedMs !== times.elapsedMs || r.pauseMs !== times.pauseMs || r.activeMs !== times.activeMs) fail()
  return { ...base, endAt: end, ...times }
}
export function parseData(raw: string): SessionData {
  if (raw.length > 5_000_000) throw new Error('errors.tooLarge')
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { throw new Error('errors.json') }
  const r = object(parsed); keys(r, ['format','version','revision','sessions','current'])
  if (r.format !== 'time-management-local' || r.version !== 1) throw new Error('errors.version')
  const revision = string(r.revision)
  const sessions = array(r.sessions).map(v => readRun(v, false) as FinishedSession)
  const current = r.current === null ? null : readRun(r.current, true) as CurrentSession
  const ids = new Set<string>()
  let end = 0
  for (const s of [...sessions].sort((a,b) => a.startAt - b.startAt || a.endAt - b.endAt)) {
    if (ids.has(s.id) || s.startAt < end) fail()
    ids.add(s.id); end = s.endAt
  }
  if (current && (ids.has(current.id) || current.startAt < end)) fail()
  return { format: 'time-management-local', version: 1, revision, sessions, current }
}
export function mergeData(existing: SessionData, incoming: SessionData): SessionData {
  const sessions = new Map(existing.sessions.map(s => [s.id, s]))
  for (const s of incoming.sessions) {
    const old = sessions.get(s.id)
    if (old && JSON.stringify(readRun(old, false)) !== JSON.stringify(readRun(s, false))) throw new Error('errors.idConflict')
    sessions.set(s.id, s)
  }
  if (existing.current && incoming.current && JSON.stringify(readRun(existing.current, true)) !== JSON.stringify(readRun(incoming.current, true))) throw new Error('errors.currentConflict')
  return parseData(JSON.stringify({ ...existing, sessions: [...sessions.values()].sort((a,b) => a.startAt - b.startAt), current: existing.current ?? incoming.current }))
}
