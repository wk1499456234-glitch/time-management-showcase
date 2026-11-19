export type Locale = 'zh-CN' | 'ja-JP'

export type PageKey = 'today' | 'history' | 'analysis' | 'settings'

export type RunStatus = 'idle' | 'running' | 'paused'

export interface Activity {
  id: string
  /** 表示名のi18nキー。例："activity.ai_dev" */
  nameKey: string
}

export interface OutputEntry {
  id: string
  text: string
  createdAt: number
}

export interface PauseInterval {
  start: number
  end: number | null
}

export interface FinishedSession {
  id: string
  activityId: string
  startAt: number
  endAt: number
  pauseIntervals: PauseInterval[]
  elapsedMs: number
  pauseMs: number
  activeMs: number
  outputs: OutputEntry[]
}
