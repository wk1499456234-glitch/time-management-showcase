// メモリー内だけで保持する。戻った画面で既読の区画を再び隠さない。
const seenSections = new Set<string>()

export function attachScrollReveal(element: HTMLElement, id: string, order = 0, seen = seenSections) {
  let observer: IntersectionObserver | undefined
  let animation: Animation | undefined
  let reduced: MediaQueryList | undefined
  let finished = false
  const visible = () => {
    finished = true
    seen.add(id)
    // 永続保存を変えず、利用者の内容も記録せずに、メモリー使用量を制限する。
    if (seen.size > 500) seen.delete(seen.values().next().value!)
    observer?.disconnect()
    animation?.cancel()
    delete element.dataset.revealPending
  }
  const motionChanged = () => { if (reduced?.matches) visible() }
  const focused = () => visible()
  const cleanup = () => {
    observer?.disconnect()
    animation?.cancel()
    delete element.dataset.revealPending
    element.removeEventListener('focusin', focused)
    reduced?.removeEventListener('change', motionChanged)
  }
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const bounds = element.getBoundingClientRect()
    // 初期表示領域とその上の内容は表示したままにする。後続の区画だけを待機させ、
    // 長い区画でも高さに対する表示割合を条件にしない。
    if (seen.has(id) || reduced.matches || bounds.top < window.innerHeight ||
        element.contains(element.ownerDocument.activeElement)) {
      visible()
      return cleanup
    }
    if (!window.IntersectionObserver || !element.animate) return cleanup
    observer = new IntersectionObserver(entries => {
      if (finished || !entries.some(entry => entry.isIntersecting)) return
      try {
        const bounds = element.getBoundingClientRect()
        if (reduced?.matches || bounds.bottom <= 0 ||
            element.contains(element.ownerDocument.activeElement)) { visible(); return }
        // WAAPIの開始後にだけ待機状態を解除し、表示から非表示へのちらつきを避ける。
        animation = element.animate([
          {opacity: 0, transform: 'translateY(12px)'},
          {opacity: 1, transform: 'translateY(0)'},
        ], {duration: 420, delay: Math.min(Math.max(order, 0), 2) * 40,
          easing: 'cubic-bezier(.2,.65,.3,1)', fill: 'backwards'})
        finished = true
        seen.add(id)
        observer?.disconnect()
        delete element.dataset.revealPending
      } catch { visible() }
    }, {root: null, rootMargin: '0px 0px -24px 0px', threshold: 0})
    element.addEventListener('focusin', focused)
    reduced.addEventListener('change', motionChanged)
    observer.observe(element)
    // CSSの既定値は表示。監視の設定に成功してから待機状態にする。
    if (!finished) element.dataset.revealPending = ''
  } catch { visible() }
  return cleanup
}
