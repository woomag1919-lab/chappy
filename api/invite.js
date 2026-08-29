const crypto = require('crypto');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');
const tokenHash = s => crypto.createHash('sha256').update(String(s)).digest('hex');
const randomToken = n => crypto.randomBytes(n).toString('base64url');

function cleanProfile(p){
  if(!p || typeof p !== 'object') return null;
  return {
    name: typeof p.name === 'string' ? p.name.slice(0,80) : '相手',
    radar: Array.isArray(p.radar) ? p.radar.slice(0,6).map(v=>Math.max(0,Math.min(100,Number(v)||0))) : null,
    extraRadar: p.extraRadar && typeof p.extraRadar === 'object' ? {
      before:Array.isArray(p.extraRadar.before)?p.extraRadar.before.slice(0,6):null,
      after:Array.isArray(p.extraRadar.after)?p.extraRadar.after.slice(0,6):null
    } : null,
    traits: Array.isArray(p.traits) ? p.traits.slice(0,20).map(x=>String(x).slice(0,80)) : []
  };
}

async function ensureTable(){
  if(!process.env.DATABASE_URL && !process.env.POSTGRES_URL) throw new Error('DATABASE_URL が設定されていません。');
  await sql`CREATE TABLE IF NOT EXISTS corelingual_invites (
    id BIGSERIAL PRIMARY KEY,
    token_hash TEXT UNIQUE NOT NULL,
    owner_hash TEXT NOT NULL,
    host_name TEXT,
    host_profile JSONB,
    host_share BOOLEAN NOT NULL DEFAULT FALSE,
    partner_profile JSONB,
    partner_share BOOLEAN NOT NULL DEFAULT FALSE,
    partner_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

module.exports = async (req,res) => {
  try{
    await ensureTable();
    if(req.method === 'POST'){
      const body=req.body||{};
      const ownerToken=String(body.ownerToken||'');
      if(ownerToken.length<32) return res.status(400).json({error:'所有者キーが不正です。'});
      const host=cleanProfile(body.host);
      if(!host) return res.status(400).json({error:'プロフィール情報がありません。'});
      const token=randomToken(32);
      await sql`INSERT INTO corelingual_invites (token_hash,owner_hash,host_name,host_profile,host_share) VALUES (${tokenHash(token)},${tokenHash(ownerToken)},${host.name},${JSON.stringify(host)},${!!body.hostShare})`;
      return res.status(200).json({ok:true,token,url:`${process.env.PUBLIC_BASE_URL||''}/?invite=${encodeURIComponent(token)}`});
    }
    if(req.method === 'PATCH'){
      const body=req.body||{};
      const token=String(body.token||'');
      const partnerKey=String(body.partnerKey||'');
      const partner=cleanProfile(body.partner);
      if(token.length<32 || !partner) return res.status(400).json({error:'招待情報またはプロフィールが不正です。'});
      const rows=await sql`SELECT id,partner_hash FROM corelingual_invites WHERE token_hash=${tokenHash(token)} LIMIT 1`;
      if(!rows.length) return res.status(404).json({error:'招待リンクが見つかりません。'});
      const row=rows[0];
      let key=partnerKey;
      if(row.partner_hash){
        if(!partnerKey || tokenHash(partnerKey)!==row.partner_hash) return res.status(403).json({error:'この招待への回答者キーが一致しません。'});
      }else{
        key=randomToken(32);
      }
      await sql`UPDATE corelingual_invites SET partner_profile=${JSON.stringify(partner)}, partner_share=${!!body.partnerShare}, partner_hash=${row.partner_hash||tokenHash(key)}, updated_at=NOW() WHERE id=${row.id}`;
      return res.status(200).json({ok:true,joined:true,partnerKey:key});
    }
    if(req.method === 'GET'){
      const token=String(req.query?.token||'');
      const owner=String(req.query?.owner||'');
      if(token.length<32) return res.status(400).json({error:'招待リンクが不正です。'});
      const rows=await sql`SELECT host_name,host_profile,host_share,partner_profile,partner_share,created_at FROM corelingual_invites WHERE token_hash=${tokenHash(token)} LIMIT 1`;
      if(!rows.length) return res.status(404).json({error:'招待リンクが見つからないか、期限切れです。'});
      const row=rows[0];
      if(owner && tokenHash(owner)===row.owner_hash){
        const both=!!row.host_share && !!row.partner_share && !!row.partner_profile;
        return res.status(200).json({ok:true,status:{joined:!!row.partner_profile,hostShare:!!row.host_share,partnerShared:!!row.partner_share},hostProfile:row.host_share?row.host_profile:null,partnerProfile:row.partner_share?row.partner_profile:null,ready:both});
      }
      return res.status(200).json({ok:true,hostName:row.host_name||'相手',hostShare:!!row.host_share,hostProfile:row.host_share?row.host_profile:null,joined:!!row.partner_profile,partnerShared:!!row.partner_share});
    }
    if(req.method === 'PUT'){
      const body=req.body||{};const token=String(body.token||'');
      const who=String(body.who||'');
      const share=!!body.share;
      if(!token || !['host','partner'].includes(who)) return res.status(400).json({error:'更新情報が不正です。'});
      const field=who==='host'?'host_share':'partner_share';
      const q=who==='host'
        ? await sql`UPDATE corelingual_invites SET host_share=${share},updated_at=NOW() WHERE token_hash=${tokenHash(token)} RETURNING host_share,partner_share`
        : await sql`UPDATE corelingual_invites SET partner_share=${share},updated_at=NOW() WHERE token_hash=${tokenHash(token)} RETURNING host_share,partner_share`;
      if(!q.length)return res.status(404).json({error:'招待リンクが見つかりません。'});
      return res.status(200).json({ok:true,hostShare:q[0].host_share,partnerShare:q[0].partner_share});
    }
    res.setHeader('Allow','GET,POST,PATCH,PUT'); return res.status(405).json({error:'Method not allowed'});
  }catch(e){
    console.error(e); return res.status(500).json({error:e.message||'招待機能でエラーが発生しました。'});
  }
};
