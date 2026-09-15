import crypto from "crypto";
import { neon } from "@neondatabase/serverless";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.6-flash";
const FALLBACK_MODELS = [
  FALLBACK_MODEL,
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite"
];
const RETRY_DELAY_MS = 800;
const API_KEY = process.env.GEMINI_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL;
const MAX_MESSAGE = 3000;
const MAX_IMAGES = 3;
const MAX_TOTAL_IMAGE_CHARS = 3200000;
const TIMEOUT_MS = 45000;
const COST_INPUT_USD_PER_1M = 0.75;
const COST_OUTPUT_USD_PER_1M = 3.75;

const json = (status, body) => ({ statusCode: status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, body: JSON.stringify(body) });

function cleanText(value, max = 12000) {
  return typeof value === "string" ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max) : "";
}

function cleanProfile(value) {
  if (typeof value === "string") return cleanText(value, 14000);
  if (!value || typeof value !== "object") return "";
  return JSON.stringify(value).slice(0, 16000);
}

function normalizeAdvice(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).map(x => ({
    cause: cleanText(x?.cause, 900),
    suggestion: cleanText(x?.suggestion ?? x?.suggest, 900)
  })).filter(x => x.cause || x.suggestion);
}

function sanitizeUserFacingText(value, max = 3000) {
  return cleanText(value, max)
    .replace(/\bASD\b/gi, "関連する特性")
    .replace(/\bADHD\b/gi, "関連する特性")
    .replace(/\bHSP\b/gi, "関連する特性");
}

function normalizeResult(raw) {
  const x = raw && typeof raw === "object" ? raw : {};
  return {
    partner: sanitizeUserFacingText(x.partner, 2200),
    me: sanitizeUserFacingText(x.me, 2200),
    mismatch: sanitizeUserFacingText(x.mismatch, 3000),
    advice: normalizeAdvice(x.advice).map(a => ({
      cause: sanitizeUserFacingText(a.cause, 900),
      suggestion: sanitizeUserFacingText(a.suggestion, 900)
    })),
    caution: sanitizeUserFacingText(x.caution, 1600)
  };
}

function parseJson(text) {
  const s = String(text || "").trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(s); } catch {}
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(s.slice(start, end + 1));
  throw new Error("invalid_json");
}

function normalizeRelation(body) {
  const allowed = new Set(["romantic", "friend", "work"]);
  const key = typeof body?.relation === "string" ? body.relation.trim() : "";
  const safeKey = allowed.has(key) ? key : "friend";
  const labels = {
    romantic: "恋人・パートナー",
    friend: "友人関係",
    work: "仕事関係"
  };
  const fromBody = typeof body?.relationLabel === "string" ? body.relationLabel.trim() : "";
  const label = fromBody || labels[safeKey];
  return { key: safeKey, label };
}

function buildPrompt(body) {
  const meProfile = cleanProfile(body.diagnosisContext?.my);
  const partnerProfile = cleanProfile(body.diagnosisContext?.partner);
  const myTraits = Array.isArray(body.myTraits) ? body.myTraits.slice(0, 20).map(x => cleanText(x, 120)).join(", ") : "";
  const partnerTraits = Array.isArray(body.partnerTraits) ? body.partnerTraits.slice(0, 20).map(x => cleanText(x, 120)).join(", ") : "";
  const myFree = cleanText(body.myFree, 2500);
  const partnerFree = cleanText(body.partnerFree, 2500);
  const message = cleanText(body.message, MAX_MESSAGE);
  const speaker = cleanText(body.speaker, 80);
  const imageQuestion = cleanText(body.imageQuestion, 500);
  const { key: relationKey, label: relationLabelJa } = normalizeRelation(body);

  return `あなたはCoreLingualの会話解析エンジンです。
目的は、2人の会話のすれ違いを責めずに整理し、双方の意図を尊重しながら、次に伝えやすい言い方を提案することです。

【最重要ルール】
- 実際の会話・発言内容を最優先する。
- 特性プロフィールは「解釈の補助材料」であり、発言より優先しない。
- 今回の関係性は「会話を読むときの文脈」であり、関係性だけで意図や性格を決めつけない。
- 特定の診断名・心理ラベル・愛着パターンなどの名称から、診断・病気・障害・性格を断定しない。
- 特定のラベルだからという理由で因果関係を決めつけない。
- プロフィールと会話が関係しているときだけ、「今回の場面では、その傾向が影響した可能性があります」と慎重に述べる。
- 関係が確認できない特性は無理に使わない。
- 相手を悪者にしない。双方にとって自然な受け取り方の違いとして説明する。
- 断定より「〜かもしれません」「〜だった可能性があります」を使う。
- 改善案は、相手を操作する方法ではなく、自分の気持ち・意図・お願いを具体的に伝える言い方にする。
- 診断や医療的評価を求められても、この解析では行わない。

【出力】
JSONのみ。Markdownやコードフェンスは禁止。
{
  "partner": "相手側の受け取り方・意図を会話に即して説明",
  "me": "自分側の受け取り方・意図を会話に即して説明",
  "mismatch": "2人の認識・期待・伝え方がどこですれ違ったか。特性が関係する場合は具体的な特徴と会話場面をつなげる",
  "advice": [
    {"cause":"なぜこの場面ですれ違いやすかったか", "suggestion":"次に伝えるならどう言うと分かりやすいか"}
  ],
  "caution": "断定できない点や、会話だけでは判断できない点"
}

【今回の関係性】
${relationLabelJa}
（内部キー: ${relationKey}）
この関係性は、同じ言葉でも場面の意味が違うための文脈です。
例:
- 恋人・パートナー: 返信の間・距離の取り方・気持ちの確認を、親密な関係の文脈で読む
- 友人関係: 連絡頻度や予定変更を、友人としての距離・ペースの文脈で読む
- 仕事関係: 期限・役割・指示の明確さを、業務コミュニケーションの文脈で読む
ただし関係性だけで「こう感じたはずだ」と断定しない。会話本文が矛盾する場合は会話を優先する。

【自分の特性プロフィール】
${meProfile || "なし"}

【相手の特性プロフィール】
${partnerProfile || "なし"}

【自分が選択した特徴メモ】
${myTraits || "なし"}

【相手が選択した特徴メモ】
${partnerTraits || "なし"}

【自分の自由記述】
${myFree || "なし"}

【相手の自由記述】
${partnerFree || "なし"}

【会話】
話者: ${speaker || "不明"}
${message || "（テキストなし。画像を参照）"}

【画像についての補足】
${imageQuestion || "なし"}

特性プロフィールには、基本18問の6軸、深掘り18問の3軸、関連する特性の説明との重なり、愛着パターンが含まれることがあります。
それらは「この人を分類するラベル」ではなく、「この会話をどう受け取りやすかったかを考えるための補助情報」として使ってください。
- ユーザー向けの出力では、ASD・ADHD・HSPなどの診断名・アルファベット名称を使わず、具体的なコミュニケーション上の特徴や傾向として表現する。
`;
}

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

function buildRequestPayload(parts) {
  return {
    contents: [{ role: "user", parts }],
    generationConfig: {
      maxOutputTokens: 1800,
      responseMimeType: "application/json"
    }
  };
}

function getDb() {
  if (!DATABASE_URL) return null;
  return neon(DATABASE_URL);
}

function estimateCostUsd(inputTokens, outputTokens) {
  const input = Number(inputTokens) || 0;
  const output = Number(outputTokens) || 0;
  return Number(((input / 1000000) * COST_INPUT_USD_PER_1M + (output / 1000000) * COST_OUTPUT_USD_PER_1M).toFixed(8));
}

async function recordUsage(entry) {
  const sql = getDb();
  if (!sql) return;
  try {
    await sql`INSERT INTO corelingual_ai_usage
      (request_id,operation,relation_key,model,attempt_reason,image_count,message_chars,input_tokens,output_tokens,total_tokens,estimated_cost_usd,success,error_code)
      VALUES (
        ${entry.requestId},${entry.operation},${entry.relationKey},${entry.model},${entry.reason},
        ${entry.imageCount},${entry.messageChars},${entry.inputTokens},${entry.outputTokens},${entry.totalTokens},
        ${entry.estimatedCostUsd},${entry.success},${entry.errorCode}
      )`;
  } catch (e) {
    console.error("CoreLingual AI usage log failed", e?.message || e);
  }
}

async function callGemini(model, parts) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
        signal: controller.signal,
        body: JSON.stringify(buildRequestPayload(parts))
      });
    } catch (fetchError) {
      if (fetchError?.name === "AbortError") {
        const err = new Error("gemini_timeout");
        err.model = model;
        err.httpStatus = 504;
        err.providerStatus = "TIMEOUT";
        err.providerMessage = `Geminiへの応答が${TIMEOUT_MS / 1000}秒以内に返りませんでした。`;
        throw err;
      }
      throw fetchError;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const providerError = data?.error || {};
      const providerStatus = typeof providerError.status === "string" ? providerError.status : "";
      const providerMessage = typeof providerError.message === "string" ? providerError.message : "";
      const retryAfter = res.headers.get("retry-after") || "";
      const info = {
        model,
        status: res.status,
        providerCode: providerError.code,
        providerStatus,
        providerMessage,
        details: providerError.details,
        retryAfter
      };
      console.error("Gemini request failed", info);

      const err = new Error(
        res.status === 400 ? "gemini_bad_request" :
        res.status === 413 ? "gemini_payload_too_large" :
        (res.status === 401 || res.status === 403) ? "gemini_auth" :
        res.status === 429 ? "gemini_rate_limited" :
        res.status >= 500 ? "gemini_unavailable" :
        "gemini_request_failed"
      );
      err.model = model;
      err.httpStatus = res.status;
      err.providerCode = Number.isFinite(providerError.code) ? providerError.code : res.status;
      err.providerStatus = providerStatus;
      err.providerMessage = providerMessage;
      err.retryAfter = retryAfter;
      throw err;
    }

    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    if (!text) {
      const err = new Error("empty_model_response");
      err.model = model;
      throw err;
    }
    const usage = data?.usageMetadata || {};
    return {
      result: normalizeResult(parseJson(text)),
      usage: {
        inputTokens: Number.isFinite(usage.promptTokenCount) ? usage.promptTokenCount : null,
        outputTokens: Number.isFinite(usage.candidatesTokenCount) ? usage.candidatesTokenCount : null,
        totalTokens: Number.isFinite(usage.totalTokenCount) ? usage.totalTokenCount : null
      }
    };
  } finally {
    clearTimeout(timer);
  }
}

async function generate(body) {
  if (!API_KEY) throw new Error("missing_api_key");
  const requestId = crypto.randomUUID();
  const relationKey = normalizeRelation(body).key;
  const images = Array.isArray(body.images) ? body.images.slice(0, MAX_IMAGES) : [];
  let imageChars = 0;
  const parts = [{ text: buildPrompt(body) }];
  for (const img of images) {
    const mime = ["image/jpeg", "image/png", "image/webp"].includes(img?.mime_type) ? img.mime_type : null;
    const data = typeof img?.data === "string" ? img.data : "";
    if (!mime || !data) continue;
    imageChars += data.length;
    if (imageChars > MAX_TOTAL_IMAGE_CHARS) throw new Error("image_too_large");
    parts.push({ inline_data: { mime_type: mime, data } });
  }

  const attempts = [];
  const tryModel = async (model, reason) => {
    try {
      const call = await callGemini(model, parts);
      const usage = call.usage || {};
      await recordUsage({
        requestId,
        operation: "analysis",
        relationKey,
        model,
        reason,
        imageCount: images.length,
        messageChars: String(body.message || "").length,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        estimatedCostUsd: estimateCostUsd(usage.inputTokens, usage.outputTokens),
        success: true,
        errorCode: null
      });
      return { result: call.result, model };
    } catch (e) {
      attempts.push({
        model,
        reason,
        status: e?.httpStatus || "",
        providerStatus: e?.providerStatus || "",
        providerMessage: e?.providerMessage || ""
      });
      await recordUsage({
        requestId,
        operation: "analysis",
        relationKey,
        model,
        reason,
        imageCount: images.length,
        messageChars: String(body.message || "").length,
        inputTokens: null,
        outputTokens: null,
        totalTokens: null,
        estimatedCostUsd: null,
        success: false,
        errorCode: e?.message || "gemini_error"
      });
      throw e;
    }
  };

  const isTransientProviderError = (err) => {
    const status = Number(err?.httpStatus);
    return status === 429 || status === 500 || status === 503 || status === 504;
  };

  try {
    return (await tryModel(MODEL, "primary")).result;
  } catch (firstError) {
    // When Gemini is temporarily busy/rate-limited, keep walking down the
    // fallback chain instead of making the user press the button again.
    if (!isTransientProviderError(firstError)) {
      firstError.attempts = attempts;
      throw firstError;
    }

    await sleep(RETRY_DELAY_MS);
    try {
      return (await tryModel(MODEL, "retry")).result;
    } catch (retryError) {
      if (!isTransientProviderError(retryError)) {
        retryError.attempts = attempts;
        throw retryError;
      }

      let lastError = retryError;
      const seen = new Set([MODEL]);
      for (const fallbackModel of FALLBACK_MODELS) {
        if (!fallbackModel || seen.has(fallbackModel)) continue;
        seen.add(fallbackModel);
        try {
          // Small pause between model switches so we don't hammer the API.
          await sleep(RETRY_DELAY_MS);
          return (await tryModel(fallbackModel, "fallback")).result;
        } catch (fallbackError) {
          lastError = fallbackError;
          if (!isTransientProviderError(fallbackError)) break;
        }
      }
      lastError.attempts = attempts;
      throw lastError;
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const body = req.body && typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    const message = cleanText(body.message, MAX_MESSAGE);
    const images = Array.isArray(body.images) ? body.images : [];
    if (!message && !images.length) return res.status(400).json({ error: "会話内容を入力してください。" });
    if (images.length > MAX_IMAGES) return res.status(400).json({ error: "画像が多すぎます。" });
    const result = await generate({ ...body, message, images });
    return res.status(200).json(result);
  } catch (e) {
    if (e?.message === "gemini_timeout") {
      const attempts = Array.isArray(e?.attempts) ? e.attempts : [];
      return res.status(504).json({
        error: "AIの応答に時間がかかったため、自動で別のモデルへの切り替えを試しましたが完了しませんでした。スクショが多い場合は枚数を減らして、もう一度試してください。",
        code: "timeout",
        diagnostic: {
          providerCode: 504,
          providerStatus: "TIMEOUT",
          providerMessage: typeof e?.providerMessage === "string" ? e.providerMessage.slice(0, 300) : "",
          attempts: attempts.slice(0, 6).map(a => ({
            model: typeof a?.model === "string" ? a.model.slice(0, 80) : "",
            reason: typeof a?.reason === "string" ? a.reason.slice(0, 20) : "",
            status: a?.status || "",
            providerStatus: typeof a?.providerStatus === "string" ? a.providerStatus.slice(0, 80) : ""
          }))
        }
      });
    }
    if (e?.message === "image_too_large" || e?.message === "gemini_payload_too_large") return res.status(413).json({ error: "スクショの容量が大きすぎます。枚数を減らすか、画像を小さくしてもう一度試してください。", code: "image_size" });
    if (e?.message === "gemini_rate_limited") {
      const providerStatus = typeof e?.providerStatus === "string" ? e.providerStatus : "";
      const reason = providerStatus === "RESOURCE_EXHAUSTED" ? "RESOURCE_EXHAUSTED" : providerStatus || "HTTP_429";
      return res.status(429).json({
        error: providerStatus === "RESOURCE_EXHAUSTED"
          ? "AIの利用上限または一時的な混雑が原因の可能性があります。少し時間をおいて、もう一度試してください。"
          : "AIサービスが429（利用制限）を返しました。少し時間をおいて、もう一度試してください。",
        code: "busy",
        reason
      });
    }
    if (e?.message === "gemini_auth") return res.status(502).json({ error: "AIサービスの接続設定を確認できませんでした。しばらくしてからもう一度試してください。", code: "service_config" });
    if (e?.message === "gemini_unavailable") {
      const providerStatus = typeof e?.providerStatus === "string" ? e.providerStatus.slice(0, 80) : "";
      const providerMessage = typeof e?.providerMessage === "string" ? e.providerMessage.replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, 500) : "";
      const providerCode = Number.isFinite(e?.providerCode) ? e.providerCode : 503;
      const retryAfter = typeof e?.retryAfter === "string" ? e.retryAfter.slice(0, 80) : "";
      const attempts = Array.isArray(e?.attempts) ? e.attempts.slice(0, 3).map(a => ({
        model: typeof a?.model === "string" ? a.model.slice(0, 80) : "",
        reason: typeof a?.reason === "string" ? a.reason.slice(0, 20) : "",
        status: a?.status || "",
        providerStatus: typeof a?.providerStatus === "string" ? a.providerStatus.slice(0, 80) : ""
      })) : [];
      return res.status(503).json({
        error: "AIサービスが一時的に混雑しています。自動で再試行しましたが、まだ利用できませんでした。少し時間をおいて、もう一度試してください。",
        code: "service_unavailable",
        diagnostic: { providerCode, providerStatus, providerMessage, retryAfter, attempts }
      });
    }
    if (e?.message === "gemini_bad_request") return res.status(400).json({ error: "送信した内容をAIが受け取れませんでした。スクショを減らすか、画像を小さくしてもう一度試してください。", code: "bad_request" });
    if (e?.message === "empty_model_response" || e?.message === "invalid_json") return res.status(422).json({ error: "AIから解析結果を受け取れませんでした。スクショの文字が読み取りにくい可能性があります。画像を減らすか、文字が見やすいスクショで試してください。", code: "read_failed" });
    console.error("translate error", e?.message || e);
    return res.status(500).json({ error: "会話の解析に失敗しました。しばらくしてからもう一度試してください。", code: "unknown" });
  }
}
