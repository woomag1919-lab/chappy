export default async function handler(req,res){
 if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Method Not Allowed"})}
 const apiKey=process.env.GEMINI_API_KEY;if(!apiKey)return res.status(500).json({error:"GEMINI_API_KEY がVercelに設定されていません。"});
 try{
  const {inputMode="text",message="",images=[],myMbti="",partnerMbti="",myTraits=[],partnerTraits=[],myFree="",partnerFree=""}=req.body??{};
  if(inputMode==="text"&&!message)return res.status(400).json({error:"メッセージが空です。"});
  if(inputMode==="image"&&(!Array.isArray(images)||!images.length))return res.status(400).json({error:"画像が選択されていません。"});
  if(images.length>5)return res.status(400).json({error:"画像は最大5枚です。"});
  const system=`あなたは「あこりんガル」という、2人の会話を整理するサポートAIです。相手の本心を断定せず、確認できる事実と考えられる複数の解釈を分けて整理します。\n\n利用者は「自分」、もう一人は「相手」です。画像では原則として右側の吹き出し・メッセージ＝自分、左側＝相手。表示名よりこの左右ルールを優先してください。複数画像は基本的に選択順を時系列として扱いますが、画像内の日時が明らかに異なる場合は日時を優先します。画像にない内容は補完しません。\n\n自分のMBTI:${myMbti||"未設定"}\n相手のMBTI:${partnerMbti||"未設定"}\n自分の補助特性:${JSON.stringify(myTraits)}\n相手の補助特性:${JSON.stringify(partnerTraits)}\n自分の自由記入:${JSON.stringify(myFree)}\n相手の自由記入:${JSON.stringify(partnerFree)}\n\nMBTI/HSP/HSS型HSP/ASD傾向/ADHD傾向/愛着スタイル等は診断結果ではなく、入力された参考情報として扱うこと。特性だけで発言を説明しない。事実と推測を明確に分け、相手を悪者にしたり不安を煽ったりしない。重大な関係判断を代行しない。日本語で親しみやすく冷静に。\n\n次のJSONだけを返してください。{"observed":"会話から確認できること","likely":"もっとも自然そうな解釈。ただし推測であることが分かる書き方","alternatives":"別の可能性を1〜3個","mismatch":"すれ違いポイント","reply":"返し方・伝え方の例。必要な場合だけ","caution":"この材料だけでは分からないこと"}`;
  const parts=[];
  if(inputMode==="text")parts.push({text:`入力された会話を分析してください。話者が明示されない文章は勝手に話者を決めません。\n\n${message}`});
  else{parts.push({text:`メッセージアプリのスクリーンショット${images.length}枚です。右側＝自分、左側＝相手として読み取ってください。文字、話者、時系列をできる限り正確に読み取り、画像にない内容は補完しないでください。`});for(const x of images)if(typeof x==="string"&&x.length>20)parts.push({inline_data:{mime_type:"image/jpeg",data:x}})}
  const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":apiKey},body:JSON.stringify({system_instruction:{parts:[{text:system}]},contents:[{role:"user",parts}],generationConfig:{responseMimeType:"application/json"}})});
  const data=await r.json();if(!r.ok)return res.status(r.status).json({error:data.error?.message||`Gemini API Error (${r.status})`});
  const raw=data.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||"";if(!raw)return res.status(502).json({error:"Geminiから分析結果が返りませんでした。"});
  try{return res.status(200).json(JSON.parse(raw))}catch{return res.status(200).json({observed:"",likely:raw,alternatives:"",mismatch:"",reply:"",caution:"AIの返答を構造化できませんでした。"})}
 }catch(e){return res.status(500).json({error:e?.message||"サーバー側でエラーが発生しました。"})}
}