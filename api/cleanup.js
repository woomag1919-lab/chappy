SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'corelingual_shares',
    'corelingual_invites'
  );import { neon } from "@neondatabase/serverless";

function getDb(){
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if(!url) throw new Error("Neon DBの接続情報がVercelにありません。");
  return neon(url);
}

export default async function handler(req,res){
  if(req.method !== "GET" && req.method !== "POST") return res.status(405).json({error:"Method Not Allowed"});
  try{
    const sql=getDb();
    const shares=await sql`DELETE FROM corelingual_shares WHERE expires_at <= NOW() RETURNING id`;
    const invites=かはは
await sql`DELETE FROM corelingual_invites WHERE expires_at <= NOW() RETURNING id`;
    return res.status(200).json({ok:true,deleted:{shares:shares.length,invites:invites.length}});
  }catch(e){
    console.error("CoreLingual cleanup error:",e);
    return res.status(500).json({error:e.message||"cleanup failed"});
  }
}
