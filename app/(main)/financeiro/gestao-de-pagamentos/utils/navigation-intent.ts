"use client";

const STRICT_MODE_GRACE_MS = 2000;

type CbsIntentState = {
  pending: boolean;
  consumedAt: number | null;
};

const cbsIntentState: CbsIntentState = {
  pending: false,
  consumedAt: null,
};

export function markCbsForecastFilterIntentFromDashboard() {
  cbsIntentState.pending = true;
  cbsIntentState.consumedAt = null;
}

export function consumeCbsForecastFilterIntentFromDashboard(): boolean {
  if (cbsIntentState.pending) {
    cbsIntentState.pending = false;
    cbsIntentState.consumedAt = Date.now();
    return true;
  }

  if (cbsIntentState.consumedAt) {
    const elapsed = Date.now() - cbsIntentState.consumedAt;
    if (elapsed <= STRICT_MODE_GRACE_MS) {
      return true;
    }
    cbsIntentState.consumedAt = null;
  }

  return false;
}
