export default async function handler(req,res){
  if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Method Not Allowed"})}
  const key=process.env.GEMINI_API_KEY;
  if(!key)return res.status(500).json({error:"GEMINI_API_KEY がVercelに設定されていません。"});
  try{
    const b=req.body||{};
    const prompt=`あなたはCoreLingual。会話を読んで、ユーザーと一緒に「なんでここでズレたんだろう？」をやさしく紐解く相棒です。
自分=利用者、相手=もう一人。スクショでは右側を自分、左側を相手として扱う。複数画像は順序を保って読む。会話にない本心を断定せず、事実と推測を分ける。MBTI/HSP/HSS型HSP/ASD/ADHD/愛着パターンは診断ではなく参考情報。特性だけで会話を説明せず実際の発言を最優先。
文章は教科書・医師の説明・心理検査の結果みたいに硬くしない。友達が隣で「たぶんここでこう感じたのかもね」「これ、どっちが悪いというより受け取り方がズレたっぽい」と一緒に考えてくれるような、ラフで落ち着いた日本語にする。
「〜です」「〜と考えられます」を連発せず、「〜だったのかも」「〜っぽい」「〜かもしれないね」など自然な表現を使う。ただし断定は避ける。相手を責めたり、特性名だけで人を決めつけたりしない。
結果は読み手が疲れないように、短めの段落と自然な改行を意識する。必要なら「ここ、ちょっと大事」「たぶんポイントはここ」など会話的な見出しを使ってよい。
JSONだけ返す。
{"observed":"","likely":"","alternatives":"","mismatch":"","reply":"","caution":""}
入力:${b.inputMode==="text"?`発言者=${b.speaker||"me"}（me=自分、partner=相手、unknown=不明）\n${b.message}`:`複数スクショを確認してください。\nスクショについての質問=${b.imageQuestion||"特になし"}`}
詳細チェック参考情報: 自分=${b.myExtra?JSON.stringify(b.myExtra):"なし"}; 相手=${b.partnerExtra?JSON.stringify(b.partnerExtra):"なし"}
プロフィール: 自分MBTI=${b.myMbti||"未設定"};自分特性=${(b.myTraits||[]).join(",")};相手MBTI=${b.partnerMbti||"未設定"};相手特性=${(b.partnerTraits||[]).join(",")};自分メモ=${b.myFree||""};相手メモ=${b.partnerFree||""}`;
    const parts=[{text:prompt}];
    for(const x of (b.images||[])){
      const image=typeof x==="string"?{data:x,mime_type:"image/jpeg"}:x;
      if(image?.data)parts.push({inline_data:{mime_type:image.mime_type||"image/jpeg",data:image.data}});
    }
    const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key="+encodeURIComponent(key),{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({contents:[{role:"user",parts}],generationConfig:{responseMimeType:"application/json"}})
    });
    const d=await r.json();
    if(!r.ok)return res.status(r.status).json({error:d.error?.message||"Gemini API Error"});
    const raw=d.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("")||"";
    if(!raw)throw Error("Geminiから結果が返りませんでした。");
    return res.status(200).json(JSON.parse(raw.replace(/^```json\s*/i,"").replace(/```$/,"").trim()));
  }catch(e){
    console.error("CoreLingual API error:",e);
    return res.status(500).json({error:e.message||"サーバーエラー"})
  }
}
