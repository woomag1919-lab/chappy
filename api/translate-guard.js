const originalHandler = require("./translate");

const handler = originalHandler?.default || originalHandler;
const buckets = new Map();

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MAX_PER_HOUR = Number.parseInt(process.env.CORELINGUAL_MAX_REQUESTS_PER_HOUR || "10", 10);
const MAX_PER_DAY = Number.parseInt(process.env.CORELINGUAL_MAX_REQUESTS_PER_DAY || "30", 10);

function clientKey(req) {
  const forwarded = req?.headers?.["x-forwarded-for"] || req?.headers?.["x-real-ip"] || "unknown";
  return String(forwarded).split(",")[0].trim().slice(0, 100) || "unknown";
}

function take(key, now) {
  const old = buckets.get(key) || { hourStart: now, hourCount: 0, dayStart: now, dayCount: 0 };
  if (now - old.hourStart >= HOUR_MS) {
    old.hourStart = now;
    old.hourCount = 0;
  }
  if (now - old.dayStart >= DAY_MS) {
    old.dayStart = now;
    old.dayCount = 0;
  }
  if (old.hourCount >= MAX_PER_HOUR || old.dayCount >= MAX_PER_DAY) {
    buckets.set(key, old);
    return false;
  }
  old.hourCount += 1;
  old.dayCount += 1;
  buckets.set(key, old);
  return true;
}

module.exports = async function translateGuard(req, res) {
  if (req?.method && req.method !== "POST") return handler(req, res);

  const contentLength = Number(req?.headers?.["content-length"] || 0);
  if (contentLength > 4_000_000) {
    return res.status(413).json({ error: "request_too_large", message: "リクエストが大きすぎます。スクショの枚数やサイズを減らしてください。" });
  }

  const now = Date.now();
  if (!take(clientKey(req), now)) {
    return res.status(429).json({
      error: "cost_guard_rate_limited",
      message: "AI解析の利用回数が一時的な上限に達しました。しばらく時間をおいてから、もう一度お試しください。"
    });
  }

  return handler(req, res);
};
