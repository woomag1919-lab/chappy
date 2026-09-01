const MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";
const API_KEY = process.env.GEMINI_API_KEY;
const MAX_MESSAGE = 60000;
const MAX_IMAGES = 8;
const MAX_TOTAL_IMAGE_CHARS = 3200000;
const TIMEOUT_MS = 45000;

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

function normalizeResult(raw) {
  const x = raw && typeof raw === "object" ? raw : {};
  return {
    partner: cleanText(x.partner, 2200),
    me: cleanText(x.me, 2200),
    mismatch: cleanText(x.mismatch, 3000),
    advice: normalizeAdvice(x.advice),
    caution: cleanText(x.caution, 1600)
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

  return `あなたはCoreLingualの会話解析エンジンです。
目的は、2人の会話のすれ違いを責めずに整理し、双方の意図を尊重しながら、次に伝えやすい言い方を提案することです。

【最重要ルール】
- 実際の会話・発言内容を最優先する。
- 特性プロフィールは「解釈の補助材料」であり、発言より優先しない。
- ASD、ADHD、HSP、愛着パターンなどの名称から、診断・病気・障害・性格を断定しない。
- 「ASDだから」「不安型だから」のように因果関係を決めつけない。
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

特性プロフィールには、基本18問の6軸、深掘り18問の3軸、ASD/ADHD/HSPとの特徴上の重なり、愛着パターンが含まれることがあります。
それらは「この人を分類するラベル」ではなく、「この会話をどう受け取りやすかったかを考えるための補助情報」として使ってください。
`;
}

async function generate(body) {
  if (!API_KEY) throw new Error("missing_api_key");
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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 1800,
          responseMimeType: "application/json"
        }
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Gemini request failed", { status: res.status, model: MODEL });
      throw new Error("gemini_request_failed");
    }
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    if (!text) throw new Error("empty_model_response");
    return normalizeResult(parseJson(text));
  } finally {
    clearTimeout(timer);
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
    if (e?.name === "AbortError") return res.status(504).json({ error: "解析に時間がかかりすぎました。もう一度試してください。" });
    if (e?.message === "image_too_large") return res.status(413).json({ error: "画像の容量が大きすぎます。枚数を減らしてください。" });
    console.error("translate error", e?.message || e);
    return res.status(500).json({ error: "会話の解析に失敗しました。もう一度試してください。" });
  }
}
