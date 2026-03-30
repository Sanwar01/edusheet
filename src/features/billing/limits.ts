export const FREE_PLAN_LIMITS = {
  generationsPerMonth: 10,
  exportsPerMonth: 5,
} as const;

export function isProPlan(plan?: string | null, status?: string | null) {
  return plan === 'pro' && (status === 'active' || status === 'trialing');
}

export function getMonthStartIso() {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return monthStart.toISOString();
}
