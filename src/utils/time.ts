/** ミリ秒の時間を0以上に補正し、H:MM:SS形式で表示する。 */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${h}:${pad(m)}:${pad(s)}`
}

/** ミリ秒の時間を時間と残りの分に分け、端数を切り捨てる。 */
export function msToHM(ms: number): { h: number; m: number } {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  return { h: Math.floor(totalMinutes / 60), m: totalMinutes % 60 }
}

/** 時刻をAsia/Tokyoの24時間制HH:mmで表示する。表示言語には依存しない。 */
export function formatLocalHM(timestamp: number): string {
  return new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false }).format(timestamp)
}
