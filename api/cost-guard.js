/* CoreLingual AI cost guard
 * Phase 1: conservative per-request budget and model-call cap.
 * This module is intentionally dependency-free so it can be imported by API routes.
 */

const DEFAULT_MAX_MODEL_CALLS = 2;
const DEFAULT_MAX_OUTPUT_TOKENS = 1800;

function intEnv(name, fallback, min, max) {
  const n = Number.parseInt(process.env[name] || "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function getCostGuardConfig() {
  return {
    maxModelCalls: intEnv("GEMINI_MAX_MODEL_CALLS", DEFAULT_MAX_MODEL_CALLS, 1, 4),
    maxOutputTokens: intEnv("GEMINI_MAX_OUTPUT_TOKENS", DEFAULT_MAX_OUTPUT_TOKENS, 256, 1800)
  };
}

function createCallBudget() {
  const config = getCostGuardConfig();
  let calls = 0;
  return {
    config,
    canCall() {
      return calls < config.maxModelCalls;
    },
    markCall() {
      calls += 1;
      return calls;
    },
    calls() {
      return calls;
    }
  };
}

module.exports = { getCostGuardConfig, createCallBudget };
