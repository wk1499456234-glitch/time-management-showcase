export const DAILY_BUDGET_MS = 8 * 60 * 60 * 1000

export interface BudgetStats {
  budgetMs: number
  actualMs: number
  utilisationPct: number
  remainingMs: number
}

/**
 * Deterministic budget/utilisation/remaining computation.
 * Utilisation is allowed to exceed 100% (see docs/product.md #4); remaining is
 * clamped at 0 for display since negative "remaining" is expressed via utilisation instead.
 */
export function computeBudgetStats(actualMs: number, budgetMs: number = DAILY_BUDGET_MS): BudgetStats {
  const utilisationPct = budgetMs > 0 ? (actualMs / budgetMs) * 100 : 0
  const remainingMs = Math.max(budgetMs - actualMs, 0)
  return { budgetMs, actualMs, utilisationPct, remainingMs }
}
