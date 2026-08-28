export default async function handler(req,res){
  if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Method Not Allowed"})}
  const key=process.env.GEMINI_API_KEY;
  if(!key)return res.status(500).json({error:"GEMINI_API_KEY がVercelに設定されていません。"});
  try{
    const b=req.body||{};
    const prompt=`あなたはCoreLingual。会話の「言葉の翻訳」を手伝うアシスタントです。
目的は、特性の違う2人が「気持ちは同じでも、言葉の選び方・受け取り方がズレてしまう」ことで起きるすれ違いを、責めずに分かりやすく整理することです。

自分=利用者、相手=もう一人。スクショでは右側を自分、左側を相手として扱う。複数画像は順序を保って読む。
会話にない本心を断定しない。実際の発言・流れを最優先し、プロフィールの特性は「なぜその言葉が出たのか／なぜそう受け取ったのか」を考える補助材料として使う。
プロフィールにある傾向は診断名として断定せず、会話の受け取り方・考え方・感情の扱い方・距離感・変化への反応・コミュニケーションの好みを補助材料として使う。

【出力の考え方】
「この人はこういう性格だから」で終わらせず、必ず「今回の発言→その人が伝えたかった可能性→相手がどう受け取った可能性→特性の組み合わせによるズレ→次に使えそうな言葉」までつなげる。
どちらか一方を悪者にしない。両方の気持ちや意図が同時に成立する可能性を大切にする。

【口調】
硬すぎず、砕けすぎず。教科書・医師・心理検査の結果のような文章にはしない。
「〜かもしれません」「〜だったのかも」「〜と受け取った可能性があります」など、落ち着いた相談相手のような自然な日本語にする。
ただし「〜っぽい」「〜じゃん」など砕けすぎる表現は多用しない。

【必ずこの構造でJSONを返す】
{
  "partner": "相手の心理・背景。今回の言葉をどう受け取った可能性があるか、相手の特性との関係も含める",
  "me": "自分の心理・背景。今回、本当は何を伝えたかった可能性があるか、自分の特性との関係も含める",
  "mismatch": "すれ違いのメカニズム。2人の気持ち・意図そのものがどう違ったのではなく、同じ／近い気持ちがなぜ別の言葉や意味として伝わったのかを具体的に説明する",
  "advice": [
    {"cause":"今回のズレにつながったポイント", "suggestion":"次に同じ場面になったときに使いやすい、具体的で自然な言い換え"}
  ],
  "caution": "断定できない点や、会話だけでは分からない点。なければ空文字"
}

言い換えアドバイスは、今回の会話から実際に役立ちそうなものを1〜3個。単なる一般論ではなく、元の言葉のどこをどう変えると伝わりやすいかを書く。
入力:${b.inputMode==="text"?`発言者=${b.speaker||"me"}（me=自分、partner=相手、unknown=不明）\n${b.message}`:`複数スクショを確認してください。\nスクショについての質問=${b.imageQuestion||"特になし"}`}
詳細チェック参考情報: 自分=${b.myExtra?JSON.stringify(b.myExtra):"なし"}; 相手=${b.partnerExtra?JSON.stringify(b.partnerExtra):"なし"}
プロフィール: 自分の傾向=${(b.myTraits||[]).join(",")};相手の傾向=${(b.partnerTraits||[]).join(",")};自分メモ=${b.myFree||""};相手メモ=${b.partnerFree||""}`
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
