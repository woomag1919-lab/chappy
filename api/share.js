import crypto from "crypto";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("Neon DBの接続情報がVercelにありません。STORAGE_URL / DATABASE_URL / POSTGRES_URL を確認してください。");
  return neon(url);
}
function token() { return crypto.randomBytes(32).toString("base64url"); }
function tokenHash(t) { return crypto.createHash("sha256").update(t).digest("hex"); }
function cleanPayload(payload) {
  if (!payload || typeof payload !== "object") throw new Error("共有データが不正です。");
  if (payload.kind === "analysis") {
    const r = payload.result || {};
    return { kind:"analysis", version:1, result:{
      partner:typeof r.partner === "string" ? r.partner.slice(0,6000) : "",
      me:typeof r.me === "string" ? r.me.slice(0,6000) : "",
      mismatch:typeof r.mismatch === "string" ? r.mismatch.slice(0,6000) : "",
      advice:Array.isArray(r.advice) ? r.advice.slice(0,5).map(x=>({cause:typeof x?.cause === "string"?x.cause.slice(0,1200):"",suggestion:typeof x?.suggestion === "string"?x.suggestion.slice(0,1800):""})) : [],
      caution:typeof r.caution === "string" ? r.caution.slice(0,3000) : ""
    }};
  }
  if (payload.kind === "diagnosis") {
    const cleanScores = value => Array.isArray(value)
      ? value.slice(0,8).map(x=>({
          key:typeof x?.key === "string" ? x.key.slice(0,80) : "",
          score:Number.isFinite(Number(x?.score)) ? Math.max(0,Math.min(100,Number(x.score))) : 0
        })).filter(x=>x.key && Number.isFinite(x.score))
      : [];

    const cleanAnswers = value => Array.isArray(value)
      ? value.slice(0,18).map(v => Math.max(1,Math.min(5,Number(v)||1)))
      : [];

    const deepScores = cleanScores(payload.deepScores);
    const deepAnswers = cleanAnswers(payload.deepAnswers);
    const nestedDeepScores = cleanScores(payload.deep?.scores);
    const nestedDeepAnswers = cleanAnswers(payload.deep?.answers);

    return {
      kind:"diagnosis",
      version:2,
      targetLabel:payload.targetLabel === "相手" ? "相手" : "自分",
      scores:cleanScores(payload.scores),
      deepScores:deepScores.length ? deepScores : nestedDeepScores,
      answers:cleanAnswers(payload.answers),
      deepAnswers:deepAnswers.length ? deepAnswers : nestedDeepAnswers,
      deep:{
        scores:deepScores.length ? deepScores : nestedDeepScores,
        answers:deepAnswers.length ? deepAnswers : nestedDeepAnswers
      },
      free:typeof payload.free === "string" ? payload.free.slice(0,4000) : "",
      hints:Array.isArray(payload.hints) ? payload.hints.slice(0,6).map(h=>({
        name:typeof h?.name === "string"?h.name.slice(0,160):"",
        text:typeof h?.text === "string"?h.text.slice(0,1500):""
      })).filter(x=>x.name||x.text):[]
    };
  }
  throw new Error("対応していない共有結果です。");
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const sql = getDb();
    // 期限切れの共有結果を、アクセスのついでにも掃除します。
    await sql`DELETE FROM corelingual_shares WHERE expires_at <= NOW()`;

    if (req.method === "POST") {
      const safe = cleanPayload(req.body?.payload);
      const title = typeof req.body?.title === "string" ? req.body.title.slice(0,120) : "CoreLingualの共有結果";
      const rawToken = token();
      const hash = tokenHash(rawToken);
      const ttlDays = 7;
      await sql`INSERT INTO corelingual_shares (token_hash,kind,title,payload,expires_at)
        VALUES (${hash},${safe.kind},${title},${JSON.stringify(safe)}::jsonb,NOW() + (${ttlDays} * INTERVAL '1 day'))`;
      return res.status(200).json({token:rawToken,url:`${req.headers["x-forwarded-proto"]||"https"}://${req.headers.host}/share/${rawToken}`,expiresInDays:7});
    }
    if (req.method === "GET") {
      const rawToken = String(req.query?.token || "");
      if (!/^[A-Za-z0-9_-]{40,50}$/.test(rawToken)) return res.status(400).json({error:"共有リンクが不正です。"});
      const hash = tokenHash(rawToken);
      const rows = await sql`SELECT kind,title,payload,expires_at FROM corelingual_shares
        WHERE token_hash=${hash} AND deleted_at IS NULL AND expires_at > NOW() LIMIT 1`;
      if (!rows.length) return res.status(404).json({error:"共有結果が見つからないか、期限が切れています。"});
      return res.status(200).json({kind:rows[0].kind,title:rows[0].title,payload:rows[0].payload});
    }
    res.setHeader("Allow","GET, POST"); return res.status(405).json({error:"Method Not Allowed"});
  } catch(e) {
    console.error("CoreLingual share API error:",e);
    return res.status(500).json({error:e.message||"共有機能でエラーが発生しました。"});
  }
}
