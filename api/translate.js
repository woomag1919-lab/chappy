const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const MAX_MESSAGE = 30000;
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 1800000;
const MAX_TOTAL_BYTES = 3600000;
const MAX_CONTEXT = 14000;
const ALLOWED_MIME = new Set(["image/jpeg","image/png","image/webp"]);

const cleanText=(v,max)=>typeof v==="string"?v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,"").slice(0,max):"";
const fail=(res,status,msg)=>res.status(status).json({error:msg});

function validateBody(b){
  if(!b || typeof b!=="object" || Array.isArray(b))throw new Error("入力データが不正です。");
  if(!["text","image"].includes(b.inputMode))throw new Error("入力形式が不正です。");
  const speaker=cleanText(b.speaker||"me",20);
  if(!["me","partner","unknown"].includes(speaker))throw new Error("発言者の指定が不正です。");
  const message=cleanText(b.message||"",MAX_MESSAGE);
  if(b.inputMode==="text" && !message.trim())throw new Error("会話内容を入力してください。");
  const images=Array.isArray(b.images)?b.images:[];
  if(images.length>MAX_IMAGES)throw new Error(`画像は${MAX_IMAGES}枚までです。`);
  let total=0;
  for(const x of images){
    if(!x || typeof x!=="object" || typeof x.data!=="string")throw new Error("画像データが不正です。");
    const mime=String(x.mime_type||"image/jpeg").toLowerCase();
    if(!ALLOWED_MIME.has(mime))throw new Error("対応していない画像形式です。");
    const bytes=Math.ceil(x.data.length*0.75);
    if(bytes>MAX_IMAGE_BYTES)throw new Error("画像サイズが大きすぎます。");
    total+=bytes;
  }
  if(total>MAX_TOTAL_BYTES)throw new Error("画像の合計サイズが大きすぎます。");
  const dc=b.diagnosisContext && typeof b.diagnosisContext==="object"?b.diagnosisContext:{};
  const diagnosisContext={my:cleanText(dc.my||"",MAX_CONTEXT),partner:cleanText(dc.partner||"",MAX_CONTEXT)};
  const myTraits=Array.isArray(b.myTraits)?b.myTraits.slice(0,20).map(x=>cleanText(String(x),80)).filter(Boolean):[];
  const partnerTraits=Array.isArray(b.partnerTraits)?b.partnerTraits.slice(0,20).map(x=>cleanText(String(x),80)).filter(Boolean):[];
  return {inputMode:b.inputMode,speaker,message,imageQuestion:cleanText(b.imageQuestion||"",3000),images,diagnosisContext,myTraits,partnerTraits,myFree:cleanText(b.myFree||"",3000),partnerFree:cleanText(b.partnerFree||"",3000)};
}

function makePrompt(b){
  return `あなたはCoreLingual。会話の「言葉の翻訳」を手伝うアシスタントです。
目的は、特性の違う2人が「気持ちは同じでも、言葉の選び方・受け取り方がズレてしまう」ことで起きるすれ違いを、責めずに分かりやすく整理することです。

【重要な分析原則】
- 実際の発言・会話の流れを最優先する。プロフィールだけから心理や本心を断定しない。
- diagnosisContext は会話解釈の補助材料。会話内容と矛盾する場合は会話内容を優先する。
- 特性情報を診断名や病名として扱わない。「なぜその言葉が出た可能性があるか」「なぜそう受け取った可能性があるか」を考える材料として使う。
- どちらか一方を悪者にしない。両方の気持ちや意図が成立する可能性を大切にする。
- 「この人はこういう性格だから」で終わらせず、今回の発言→伝えたかった可能性→相手が受け取った可能性→特性の組み合わせによるズレ→次に使えそうな言葉までつなげる。
- ASD等の診断・判定はしない。特性チェックはあくまで会話上の参考情報。

【自分の会話プロフィール】
${b.diagnosisContext.my||"なし"}

【相手の会話プロフィール】
${b.diagnosisContext.partner||"なし"}

【補助的なプロフィール情報】
自分の選択特性=${b.myTraits.join(",")||"なし"}
相手の選択特性=${b.partnerTraits.join(",")||"なし"}
自分メモ=${b.myFree||"なし"}
相手メモ=${b.partnerFree||"なし"}

【口調】
硬すぎず、砕けすぎず。教科書・医師・心理検査の結果のような文章にはしない。
「〜かもしれません」「〜だったのかも」「〜と受け取った可能性があります」など自然な日本語にする。

【必ずこの構造でJSONを返す】
{
  "partner":"相手の心理・背景。今回の言葉をどう受け取った可能性があるか、相手の特性との関係も含める",
  "me":"自分の心理・背景。今回、本当は何を伝えたかった可能性があるか、自分の特性との関係も含める",
  "mismatch":"すれ違いのメカニズム。2人の気持ち・意図そのものがどう違ったのではなく、同じ／近い気持ちがなぜ別の言葉や意味として伝わったのかを具体的に説明する",
  "advice":[{"cause":"今回のズレにつながったポイント","suggestion":"次に同じ場面になったときに使いやすい具体的で自然な言い換え"}],
  "caution":"断定できない点や会話だけでは分からない点。なければ空文字"
}

【入力】
発言者=${b.speaker}
${b.inputMode==="text"?b.message:`複数スクショを確認してください。スクショについての質問=${b.imageQuestion||"特になし"}`}

【出力ルール】
advice は1〜3個。単なる一般論ではなく、今回の言葉のどこをどう変えると伝わりやすいかを書く。JSON以外の文章は返さない。`;
}

function normalizeResult(raw){
  let d=raw;
  if(typeof d!=="object"||!d)d={};
  const advice=Array.isArray(d.advice)?d.advice.slice(0,3).map(x=>({cause:cleanText(x?.cause||"",1200),suggestion:cleanText(x?.suggestion||"",1800)})).filter(x=>x.cause||x.suggestion):[];
  return {partner:cleanText(d.partner||"",6000),me:cleanText(d.me||"",6000),mismatch:cleanText(d.mismatch||"",7000),advice,caution:cleanText(d.caution||"",3000)};
}
function parseJson(raw){
  const cleaned=String(raw||"").replace(/^```json\s*/i,"").replace(/```$/i,"").trim();
  try{return normalizeResult(JSON.parse(cleaned));}catch{
    const a=cleaned.indexOf("{"); const z=cleaned.lastIndexOf("}");
    if(a>=0&&z>a)return normalizeResult(JSON.parse(cleaned.slice(a,z+1)));
    throw new Error("AI結果の形式を確認できませんでした。");
  }
}

export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST"){res.setHeader("Allow","POST");return fail(res,405,"Method Not Allowed");}
  const key=process.env.GEMINI_API_KEY;
  if(!key)return fail(res,500,"解析サービスの設定が完了していません。");
  try{
    const b=validateBody(req.body||{});
    const parts=[{text:makePrompt(b)}];
    for(const x of b.images)parts.push({inline_data:{mime_type:String(x.mime_type||"image/jpeg"),data:x.data}});
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),40000);
    let r;
    try{
      r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,{
        method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},
        body:JSON.stringify({contents:[{role:"user",parts}],generationConfig:{responseMimeType:"application/json",temperature:0.35,maxOutputTokens:5000}}),signal:controller.signal
      });
    }finally{clearTimeout(timer)}
    const d=await r.json().catch(()=>({}));
    if(!r.ok){console.error("Gemini API status:",r.status,d.error?.status||"");return fail(res,502,"解析サービスから正常な結果を受け取れませんでした。");}
    const raw=d.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("")||"";
    if(!raw)throw new Error("Geminiから結果が返りませんでした。");
    return res.status(200).json(parseJson(raw));
  }catch(e){
    if(e?.name==="AbortError")return fail(res,504,"解析に時間がかかりすぎました。もう一度試してください。");
    console.error("CoreLingual translate API error:",e?.message||e);
    const client=/入力|画像|発言者|形式|サイズ|枚/.test(String(e?.message||""))?e.message:"会話の解析に失敗しました。もう一度試してください。";
    return fail(res,400,client);
  }
}
