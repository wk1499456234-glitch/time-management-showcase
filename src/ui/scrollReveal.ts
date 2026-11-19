// In-memory only: returning to a page must not hide sections already read.
const seenSections = new Set<string>()

export function attachScrollReveal(element: HTMLElement, id: string, order = 0, seen = seenSections) {
  let observer: IntersectionObserver | undefined
  let animation: Animation | undefined
  let reduced: MediaQueryList | undefined
  let finished = false
  const visible = () => {
    finished = true
    seen.add(id)
    // Bound memory without changing persistence or recording user content.
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
    // Initial viewport/above-viewport content stays visible. Only later sections
    // are armed; long groups never need to expose a percentage of their height.
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
        // Remove pending only after WAAPI starts. No flash from visible to hidden.
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
    // Default CSS is visible. Set this only after successful observer setup.
    if (!finished) element.dataset.revealPending = ''
  } catch { visible() }
  return cleanup
}
