import type { Activity } from '../types'

/**
 * V1 prototype uses a fixed set of mock activities with stable ids.
 * Display names are resolved through i18n (see i18n/locales), not hardcoded here.
 */
export const ACTIVITIES: Activity[] = [
  { id: 'act-ai-dev', nameKey: 'activity.ai_dev' },
  { id: 'act-typescript', nameKey: 'activity.typescript' },
  { id: 'act-toeic', nameKey: 'activity.toeic' },
  { id: 'act-exercise', nameKey: 'activity.exercise' },
]
