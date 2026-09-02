import crypto from "crypto";
import { neon } from "@neondatabase/serverless";

const getDb = () => {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL;
  if (!url) throw new Error("DATABASE_URL が設定されていません。");
  return neon(url);
};
const tokenHash = s => crypto.createHash("sha256").update(String(s)).digest("hex");
const randomToken = n => crypto.randomBytes(n).toString("base64url");
const cleanText = (v,max) => typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0,max) : "";
const validToken = s => /^[A-Za-z0-9_-]{40,60}$/.test(String(s||""));

function cleanProfile(p){
  if(!p || typeof p !== "object" || Array.isArray(p)) return null;
  const radar = Array.isArray(p.radar) ? p.radar.slice(0,6).map(v=>Math.max(0,Math.min(100,Number(v)||0))) : null;
  const extraRadar = p.extraRadar && typeof p.extraRadar === "object" ? {
    before:Array.isArray(p.extraRadar.before)?p.extraRadar.before.slice(0,6).map(v=>Math.max(0,Math.min(100,Number(v)||0))):null,
    after:Array.isArray(p.extraRadar.after)?p.extraRadar.after.slice(0,6).map(v=>Math.max(0,Math.min(100,Number(v)||0))):null,
    deep:Array.isArray(p.extraRadar.deep)?p.extraRadar.deep.slice(0,3).map(x=>({key:cleanText(x?.key,80),score:Math.max(0,Math.min(100,Number(x?.score)||0)),count:Math.max(0,Math.min(18,Number(x?.count)||0))})).filter(x=>x.key):null
  } : null;
  const deepScores = Array.isArray(p.deepScores) ? p.deepScores.slice(0,3).map(x=>({key:cleanText(x?.key,80),score:Math.max(0,Math.min(100,Number(x?.score)||0)),count:Math.max(0,Math.min(18,Number(x?.count)||0))})).filter(x=>x.key) : [];
  const deepAnswers = Array.isArray(p.deepAnswers) ? p.deepAnswers.slice(0,18).map(v=>Math.max(1,Math.min(5,Number(v)||1))) : [];
  const scores = Array.isArray(p.scores) ? p.scores.slice(0,12).map(x=>({
    key: cleanText(x?.key,80),
    score: Math.max(0, Math.min(100, Number(x?.score)||50))
  })).filter(x=>x.key) : [];
  return {
    name: cleanText(p.name,80) || "相手",
    radar,
    extraRadar,
    scores,
    deepScores,
    deepAnswers,
    traits: Array.isArray(p.traits) ? p.traits.slice(0,20).map(x=>cleanText(String(x),80)).filter(Boolean) : [],
    answers: Array.isArray(p.answers) ? p.answers.slice(0,18).map(v=>Math.max(1,Math.min(5,Number(v)||1))) : [],
    extraAnswers: Array.isArray(p.extraAnswers) ? p.extraAnswers.slice(0,18).map(v=>Math.max(1,Math.min(5,Number(v)||1))) : [],
    summary: cleanText(p.summary,4000),
    free: cleanText(p.free,4000)
  };
}
function profileBytes(p){ return Buffer.byteLength(JSON.stringify(p||{}),"utf8"); }

export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  const sql=getDb();
  try{
    if(req.method === "POST"){
      const body=req.body||{};
      const ownerToken=String(body.ownerToken||"");
      // v61: ownerToken も招待トークンと同じ 40–60 文字ルールに統一
      if(!validToken(ownerToken)) return res.status(400).json({error:"所有者キーが不正です。ページを再読み込みしてから、もう一度招待を作成してください。"});
      const host=cleanProfile(body.host);
      if(!host || profileBytes(host)>30000) return res.status(400).json({error:"プロフィール情報が不正です。"});
      const token=randomToken(32);
      await sql`INSERT INTO corelingual_invites
        (token_hash,owner_hash,host_name,host_profile,host_share,expires_at)
        VALUES (${tokenHash(token)},${tokenHash(ownerToken)},${host.name},${JSON.stringify(host)},${!!body.hostShare},NOW() + INTERVAL '30 days')`;
      const proto=req.headers["x-forwarded-proto"]||"https";
      const hostHeader=req.headers.host;
      const base=(process.env.PUBLIC_BASE_URL||`${proto}://${hostHeader}`).replace(/\/$/,"");
      return res.status(200).json({ok:true,token,url:`${base}/?invite=${encodeURIComponent(token)}`,expiresInDays:30});
    }

    if(req.method === "PATCH"){
      // v61: 先着1人ロック — partner_hash が空のときだけ新規回答者を受け付ける
      const body=req.body||{};
      const token=String(body.token||"");
      const partnerKey=String(body.partnerKey||"");
      const partner=cleanProfile(body.partner);
      if(!validToken(token) || !partner || profileBytes(partner)>30000) return res.status(400).json({error:"招待情報またはプロフィールが不正です。"});
      const rows=await sql`SELECT id,partner_hash FROM corelingual_invites WHERE token_hash=${tokenHash(token)} AND expires_at > NOW() LIMIT 1`;
      if(!rows.length) return res.status(404).json({error:"招待リンクが見つからないか、期限切れです。"});
      const row=rows[0];

      // 既に別の回答者がいる
      if(row.partner_hash){
        if(!validToken(partnerKey) || tokenHash(partnerKey)!==row.partner_hash){
          return res.status(403).json({error:"この招待にはすでに別の方が回答しています。リンクの持ち主に確認してください。"});
        }
        // 同一回答者の再送・更新
        await sql`UPDATE corelingual_invites SET partner_profile=${JSON.stringify(partner)},partner_share=${!!body.partnerShare},updated_at=NOW() WHERE id=${row.id} AND partner_hash=${row.partner_hash} AND expires_at > NOW()`;
        return res.status(200).json({ok:true,joined:true,partnerKey,updated:true});
      }

      // 初回回答者（先着）
      let key = validToken(partnerKey) ? partnerKey : randomToken(32);
      const hash = tokenHash(key);
      const updated = await sql`
        UPDATE corelingual_invites
        SET partner_profile=${JSON.stringify(partner)},
            partner_share=${!!body.partnerShare},
            partner_hash=${hash},
            updated_at=NOW()
        WHERE id=${row.id}
          AND expires_at > NOW()
          AND partner_hash IS NULL
        RETURNING id`;
      if(!updated.length){
        // ほぼ同時に別人が先に入った
        return res.status(409).json({error:"直前に別の方が回答を完了しました。このリンクでは回答できません。"});
      }
      return res.status(200).json({ok:true,joined:true,partnerKey:key,created:true});
    }

    if(req.method === "GET"){
      const token=String(req.query?.token||"");
      const owner=String(req.query?.owner||"");
      if(!validToken(token)) return res.status(400).json({error:"招待リンクが不正です。"});
      const rows=await sql`SELECT owner_hash,host_name,host_profile,host_share,partner_profile,partner_share,expires_at FROM corelingual_invites WHERE token_hash=${tokenHash(token)} AND expires_at > NOW() LIMIT 1`;
      if(!rows.length) return res.status(404).json({error:"招待リンクが見つからないか、期限切れです。"});
      const row=rows[0];
      if(owner && tokenHash(owner)===row.owner_hash){
        const both=!!row.host_share && !!row.partner_share && !!row.partner_profile;
        return res.status(200).json({ok:true,status:{joined:!!row.partner_profile,hostShare:!!row.host_share,partnerShared:!!row.partner_share},hostProfile:row.host_share?row.host_profile:null,partnerProfile:row.partner_share?row.partner_profile:null,ready:both,expiresAt:row.expires_at});
      }
      return res.status(200).json({ok:true,hostName:row.host_name||"相手",hostShare:!!row.host_share,hostProfile:row.host_share?row.host_profile:null,joined:!!row.partner_profile,partnerShared:!!row.partner_share,expiresAt:row.expires_at});
    }

    if(req.method === "PUT"){
      const body=req.body||{}; const token=String(body.token||""); const who=String(body.who||""); const share=!!body.share;
      if(!validToken(token) || !["host","partner"].includes(who)) return res.status(400).json({error:"更新情報が不正です。"});
      const rows=await sql`SELECT id,owner_hash,partner_hash FROM corelingual_invites WHERE token_hash=${tokenHash(token)} AND expires_at > NOW() LIMIT 1`;
      if(!rows.length)return res.status(404).json({error:"招待リンクが見つからないか、期限切れです。"});
      const row=rows[0];
      if(who==="host"){
        const ownerToken=String(body.ownerToken||"");
        if(!ownerToken || tokenHash(ownerToken)!==row.owner_hash)return res.status(403).json({error:"所有者キーが一致しません。"});
        const q=await sql`UPDATE corelingual_invites SET host_share=${share},updated_at=NOW() WHERE id=${row.id} AND expires_at > NOW() RETURNING host_share,partner_share`;
        return res.status(200).json({ok:true,hostShare:q[0].host_share,partnerShare:q[0].partner_share});
      }
      const partnerKey=String(body.partnerKey||"");
      if(!row.partner_hash || !partnerKey || tokenHash(partnerKey)!==row.partner_hash)return res.status(403).json({error:"回答者キーが一致しません。"});
      const q=await sql`UPDATE corelingual_invites SET partner_share=${share},updated_at=NOW() WHERE id=${row.id} AND expires_at > NOW() RETURNING host_share,partner_share`;
      return res.status(200).json({ok:true,hostShare:q[0].host_share,partnerShare:q[0].partner_share});
    }
    if(req.method === "DELETE"){
      const body=req.body||{};
      const token=String(body.token||"");
      const ownerToken=String(body.ownerToken||"");
      if(!validToken(token) || !ownerToken) return res.status(400).json({error:"終了情報が不正です。"});
      const rows=await sql`SELECT id,owner_hash FROM corelingual_invites WHERE token_hash=${tokenHash(token)} AND expires_at > NOW() LIMIT 1`;
      if(!rows.length)return res.status(404).json({error:"招待リンクが見つからないか、すでに終了しています。"});
      if(tokenHash(ownerToken)!==rows[0].owner_hash)return res.status(403).json({error:"所有者キーが一致しません。"});
      await sql`DELETE FROM corelingual_invites WHERE id=${rows[0].id}`;
      return res.status(200).json({ok:true,ended:true});
    }
    res.setHeader("Allow","GET,POST,PATCH,PUT,DELETE"); return res.status(405).json({error:"Method not allowed"});
  }catch(e){
    console.error("CoreLingual invite API error:",e);
    return res.status(500).json({error:"招待機能でエラーが発生しました。"});
  }
}
