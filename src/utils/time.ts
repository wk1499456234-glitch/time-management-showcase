/** Formats a millisecond duration as H:MM:SS (clamped to >= 0). */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${h}:${pad(m)}:${pad(s)}`
}

/** Splits a millisecond duration into whole hours and remaining minutes (rounded down). */
export function msToHM(ms: number): { h: number; m: number } {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  return { h: Math.floor(totalMinutes / 60), m: totalMinutes % 60 }
}

/** Formats a timestamp as the Asia/Tokyo wall-clock time in strict 24-hour HH:mm (no locale dependency). */
export function formatLocalHM(timestamp: number): string {
  return new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false }).format(timestamp)
}
