/* CoreLingual AI request guard
 * Hosting-independent Phase 1: conservative per-request limits.
 * Keep this module free of Vercel/Cloudflare-specific APIs so the same
 * protection can move with the application.
 */

const DEFAULT_MAX_MODEL_CALLS = 2;
const DEFAULT_MAX_OUTPUT_TOKENS = 1800;
const DEFAULT_MAX_REQUEST_BYTES = 4_000_000;

function intEnv(name, fallback, min, max) {
  const n = Number.parseInt(process.env[name] || "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function getCostGuardConfig() {
  return {
    maxModelCalls: intEnv("GEMINI_MAX_MODEL_CALLS", DEFAULT_MAX_MODEL_CALLS, 1, 4),
    maxOutputTokens: intEnv("GEMINI_MAX_OUTPUT_TOKENS", DEFAULT_MAX_OUTPUT_TOKENS, 256, 1800),
    maxRequestBytes: intEnv("CORELINGUAL_MAX_REQUEST_BYTES", DEFAULT_MAX_REQUEST_BYTES, 100_000, 6_000_000)
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

function getRequestSize(req) {
  const raw = req?.headers?.["content-length"] ?? req?.headers?.["Content-Length"] ?? 0;
  const size = Number(raw);
  return Number.isFinite(size) && size >= 0 ? size : 0;
}

function validateRequestSize(req) {
  const config = getCostGuardConfig();
  return getRequestSize(req) <= config.maxRequestBytes;
}

module.exports = {
  getCostGuardConfig,
  createCallBudget,
  getRequestSize,
  validateRequestSize
};
