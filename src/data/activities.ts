import type { Activity } from '../types'

/**
 * 公開デモは、安定した識別子を持つ固定の活動候補を使う。
 * 表示名はここへ直接書かず、i18n/localesの翻訳から取得する。
 */
export const ACTIVITIES: Activity[] = [
  { id: 'act-ai-dev', nameKey: 'activity.ai_dev' },
  { id: 'act-typescript', nameKey: 'activity.typescript' },
  { id: 'act-toeic', nameKey: 'activity.toeic' },
  { id: 'act-exercise', nameKey: 'activity.exercise' },
]
