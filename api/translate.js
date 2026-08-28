export default async function handler(req,res){
  if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Method Not Allowed"})}
  const key=process.env.GEMINI_API_KEY;
  if(!key)return res.status(500).json({error:"GEMINI_API_KEY がVercelに設定されていません。"});
  try{
    const b=req.body||{};
    const prompt=`あなたはCoreLingual。自分=利用者、相手=もう一人。スクショでは右側を自分、左側を相手として扱う。複数画像は順序を保って読む。会話にない本心を断定せず、事実と推測を分ける。MBTI/HSP/HSS型HSP/ASD/ADHD/愛着パターンは診断ではなく参考情報。特性だけで会話を説明せず実際の発言を最優先。JSONだけ返す。
{"observed":"","likely":"","alternatives":"","mismatch":"","reply":"","caution":""}
入力:${b.inputMode==="text"?`発言者=${b.speaker||"me"}（me=自分、partner=相手、unknown=不明）\n${b.message}`:"複数スクショを確認してください。"}
プロフィール: 自分MBTI=${b.myMbti||"未設定"};自分特性=${(b.myTraits||[]).join(",")};相手MBTI=${b.partnerMbti||"未設定"};相手特性=${(b.partnerTraits||[]).join(",")};自分メモ=${b.myFree||""};相手メモ=${b.partnerFree||""}`;
    const parts=[{text:prompt}];
    for(const x of (b.images||[]))parts.push({inline_data:{mime_type:"image/jpeg",data:x}});
    const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key="+encodeURIComponent(key),{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({contents:[{role:"user",parts}],generationConfig:{responseMimeType:"application/json"}})
    });
    const d=await r.json();
    if(!r.ok)return res.status(r.status).json({error:d.error?.message||"Gemini API Error"});
    const raw=d.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("")||"";
    if(!raw)throw Error("Geminiから結果が返りませんでした。");
    return res.status(200).json(JSON.parse(raw.replace(/^```json\s*/i,"").replace(/```$/,"").trim()));
  }catch(e){return res.status(500).json({error:e.message||"サーバーエラー"})}
}
