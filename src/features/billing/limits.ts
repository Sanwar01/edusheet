export const FREE_PLAN_LIMITS = {
  generationsPerMonth: 5,
  exportsPerMonth: 5,
} as const;

export type PlanLimits = {
  generationsPerMonth: number | null;
  exportsPerMonth: number | null;
};

export function isProPlan(plan?: string | null, status?: string | null) {
  return plan === 'pro' && (status === 'active' || status === 'trialing');
}

export function getPlanLimits(plan?: string | null, status?: string | null): PlanLimits {
  if (isProPlan(plan, status)) {
    return {
      generationsPerMonth: null,
      exportsPerMonth: null,
    };
  }

  return {
    generationsPerMonth: FREE_PLAN_LIMITS.generationsPerMonth,
    exportsPerMonth: FREE_PLAN_LIMITS.exportsPerMonth,
  };
}

export function getMonthStartIso() {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  return monthStart.toISOString();
}
