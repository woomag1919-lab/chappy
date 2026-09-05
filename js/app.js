const PROFILE_TRAITS=[
"具体的な言葉を好む","文脈や行間を重視する","理由や根拠を確認したい","直感を重視することがある",
"複数の可能性を考える","一度気になると考え続けやすい","自分の気持ちを言葉にして整理する","一人で整理してから話したい",
"相手の感情の変化に気づきやすい","関係の変化が気になりやすい","自分のペースを保ちたい","まず話し合って解決したい",
"変化は前もって知りたい","新しいことを試すのが好き","興味のあることに集中しやすい","会話では共感を大切にする"
];
function makeTraits(id){const e=document.getElementById(id);PROFILE_TRAITS.forEach(t=>{const b=document.createElement("button");b.className="chip";b.type="button";b.textContent=t;b.onclick=()=>b.classList.toggle("on");e.appendChild(b)})}
makeTraits("myTraits");makeTraits("partnerTraits");

textMode.onclick=()=>setMode("text");imageMode.onclick=()=>setMode("image");function setMode(x){textMode.classList.toggle("on",x==="text");imageMode.classList.toggle("on",x==="image");textArea.style.display=x==="text"?"block":"none";imageArea.style.display=x==="image"?"block":"none"}
talkTab.onclick=()=>{talk.style.display="block";diag.style.display="none";talkTab.classList.add("on");diagTab.classList.remove("on")};diagTab.onclick=()=>{talk.style.display="none";diag.style.display="block";diagTab.classList.add("on");talkTab.classList.remove("on")};
let selectedImages=[];
let compressedImages=[];
function drawImages(){
  thumbs.innerHTML="";
  selectedImages.forEach((f,idx)=>{
    let wrap=document.createElement("div");wrap.style.cssText="position:relative;flex:0 0 auto";
    let i=document.createElement("img");i.className="thumb";i.src=URL.createObjectURL(f);
    let x=document.createElement("button");x.type="button";x.textContent="×";x.title="この画像を削除";
    x.style.cssText="position:absolute;right:-5px;top:-5px;width:23px;height:23px;border:0;border-radius:50%;background:#333;color:#fff;font-weight:bold;padding:0";
    x.onclick=()=>{selectedImages.splice(idx,1);drawImages()};
    wrap.appendChild(i);wrap.appendChild(x);thumbs.appendChild(wrap);
  });
  imageControls.style.display=selectedImages.length?"block":"none";
}
async function compressImage(file){
  const bitmap=await createImageBitmap(file);
  const maxSide=2200;
  const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  const w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale));
  const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext("2d",{alpha:false});
  ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);ctx.drawImage(bitmap,0,0,w,h);
  bitmap.close();
  const blob=await new Promise(ok=>canvas.toBlob(ok,"image/jpeg",0.72));
  if(!blob)throw Error("スクショの圧縮に失敗しました。");
  return blob;
}
images.onchange=async()=>{
  const incoming=[...images.files].slice(0,3-selectedImages.length);
  if(!incoming.length){images.value="";return}
  const oldText=imageMode.innerHTML;imageMode.disabled=true;imageMode.innerHTML="🖼️ 圧縮中…";
  try{
    for(const f of incoming){
      const blob=await compressImage(f);
      const compressed=new File([blob],(f.name||"screenshot").replace(/\.[^.]+$/i,".jpg"),{type:"image/jpeg"});
      selectedImages.push(compressed);
    }
    drawImages();
  }catch(e){alert(e.message||"スクショを処理できませんでした。");}
  finally{imageMode.disabled=false;imageMode.innerHTML=oldText;images.value=""}
};
clearImages.onclick=()=>{selectedImages=[];drawImages()};
let currentSpeaker="me";
function setSpeaker(x){currentSpeaker=x;speakerMe.classList.toggle("on",x==="me");speakerPartner.classList.toggle("on",x==="partner");speakerUnknown.classList.toggle("on",x==="unknown")}
speakerMe.onclick=()=>setSpeaker("me");speakerPartner.onclick=()=>setSpeaker("partner");speakerUnknown.onclick=()=>setSpeaker("unknown");
document.getElementById("myName")?.addEventListener("input",()=>clearNameRequired("my"));
document.getElementById("partnerName")?.addEventListener("input",()=>clearNameRequired("partner"));
draw("my");draw("partner");
function sharePayload(title,payload){
  return fetch("/api/share",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,payload})})
    .then(async r=>{const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||"共有機能のDBがまだ接続されていません。DB設定後に利用できます。");return data;})
    .then(async data=>{const url=data.url||location.origin+"/share/"+data.token;const shareData={title,text:title+"\nCoreLingualの共有結果を見る",url};if(navigator.share){await navigator.share(shareData);return;}if(navigator.clipboard){await navigator.clipboard.writeText(url);alert("安全な共有リンクをコピーしました！");return;}prompt("このリンクをコピーして送ってね",url);})
    .catch(e=>{if(e?.name!=="AbortError")alert(e.message||"共有リンクを作れませんでした。");});
}
function addShareButton(parent,title,payload){
  const row=document.createElement("div");row.className="share-row";
  const b=document.createElement("button");b.className="share-btn";b.type="button";b.textContent="📤 この結果を共有する";
  b.onclick=()=>sharePayload(title,payload);row.appendChild(b);parent.appendChild(row);
  const n=document.createElement("div");n.className="share-note";n.textContent="共有するのは今回の結果だけ。会話本文・スクショ・プロフィール詳細は共有しません。共有リンクは推測しにくいランダムIDで管理します。";parent.appendChild(n);
}
function render(d){
  result.innerHTML="";
  const ana=document.createElement("section");ana.className="result-section analysis-section";
  ana.innerHTML='<div class="result-heading">🔍 特性アナライズ</div>';
  const items=[
    ["🌸 相手の心理・背景",d.partner],
    ["🧩 自分の心理・背景",d.me],
    ["💡 すれ違いのメカニズム",d.mismatch]
  ];
  items.forEach(([title,text])=>{if(!text)return;const c=document.createElement("div");c.className="result-card";c.innerHTML="<b></b><p></p>";c.querySelector("b").textContent=title;c.querySelector("p").textContent=text;ana.appendChild(c)});
  if(ana.children.length>1)result.appendChild(ana);

  const advice=document.createElement("section");advice.className="result-section advice-section";
  advice.innerHTML='<div class="result-heading advice-heading">💬 言い換えアドバイス</div>';
  const list=Array.isArray(d.advice)?d.advice:[];
  list.forEach(item=>{
    const c=document.createElement("div");c.className="advice-card";
    const cause=document.createElement("div");cause.className="advice-cause";cause.innerHTML='<span>原因：</span> '+(item.cause||"");
    const suggest=document.createElement("div");suggest.className="advice-suggest";suggest.innerHTML='<b>💡 こう言い換えてみましょう</b><p></p>';suggest.querySelector("p").textContent=item.suggestion||"";
    c.appendChild(cause);c.appendChild(suggest);advice.appendChild(c);
  });
  if(d.reply && !list.length){const c=document.createElement("div");c.className="advice-card";c.innerHTML='<div class="advice-suggest"><b>💡 こう言い換えてみましょう</b><p></p></div>';c.querySelector("p").textContent=d.reply;advice.appendChild(c)}
  if(advice.children.length>1)result.appendChild(advice);

  if(d.caution){const c=document.createElement("div");c.className="card caution-card";c.innerHTML='<b>🌱 ここは断定できないところ</b><p></p>';c.querySelector("p").textContent=d.caution;result.appendChild(c)}
  addShareButton(result,"CoreLingualの会話解析結果",{kind:"analysis",version:1,result:{partner:d.partner||"",me:d.me||"",mismatch:d.mismatch||"",advice:Array.isArray(d.advice)?d.advice:[],caution:d.caution||""}});
}
async function waitAd(seconds, slot, countdownEl, label){
  slot.style.display="block";
  let c=seconds; countdownEl.textContent=label+"（"+c+"秒）";
  await new Promise(resolve=>{const t=setInterval(()=>{c--;countdownEl.textContent=c>0?label+"（"+c+"秒）":"広告枠終了。分析を開始します…";if(c<=0){clearInterval(t);setTimeout(resolve,250)}},1000)});
}



let extraTimer=null;
let extraTarget="my";
let extraPlan=[];
const ad30=document.getElementById("ad30");
const extraDiag=document.getElementById("extraDiag");
const ad30Countdown=document.getElementById("ad30Countdown");
const extraTitle=document.getElementById("extraTitle");
const extraIntro=document.getElementById("extraIntro");
const extraQuestions=document.getElementById("extraQuestions");
const extraResult=document.getElementById("extraResult");

function startExtra(){
  try{
    extraTarget=target;
    if(!ad30||!extraDiag||!ad30Countdown)throw new Error("追加チェックの広告ゲート要素が見つかりません。");
    // 招待された相手には広告を表示しない。本人にお願いする導線なので、36問をそのまま続けてもらう。
    const inviteState=v23GetInviteState();
    const isInvitedPartner=!!(inviteState?.token && !inviteState?.ownerToken);
    if(isInvitedPartner){
      ad30.style.display="none";
      extraDiag.style.display="none";
      const btn=document.getElementById("startMore");
      if(btn)btn.disabled=false;
      setTimeout(()=>{try{showExtra()}catch(e){console.error(e);alert(e.message||"後半18問の表示に失敗しました。")}},50);
      return;
    }
    ad30.style.display="block";
    extraDiag.style.display="none";
    const btn=document.getElementById("startMore");
    if(btn)btn.disabled=true;
    if(extraTimer)clearInterval(extraTimer);
    let c=3;
    ad30Countdown.textContent=`広告終了まで ${c}秒`;
    extraTimer=setInterval(()=>{
      try{
        c--;
        if(c>0){
          ad30Countdown.textContent=`広告終了まで ${c}秒`;
          return;
        }
        clearInterval(extraTimer);
        extraTimer=null;
        ad30Countdown.textContent="広告枠終了。後半18問を開始します…";
        if(btn)btn.disabled=false;
        setTimeout(()=>{try{showExtra()}catch(e){console.error(e);alert(e.message||"後半18問の表示に失敗しました。")}},350);
      }catch(e){
        clearInterval(extraTimer);
        extraTimer=null;
        console.error(e);
        if(btn)btn.disabled=false;
        alert(e.message||"追加チェックの開始に失敗しました。");
      }
    },1000);
  }catch(e){
    console.error(e);
    const btn=document.getElementById("startMore");
    if(btn)btn.disabled=false;
    alert(e.message||"追加チェックの開始に失敗しました。");
  }
}

const EXTRA_DRAFT_PREFIX="cl_extra_draft_";
function extraDraftKey(p){
  let name=null;
  try{name=activeProfile(p)}catch{}
  return EXTRA_DRAFT_PREFIX+p+"_"+encodeURIComponent(name||"__none__");
}
function readExtraDraft(p){
  try{
    const d=JSON.parse(localStorage.getItem(extraDraftKey(p))||"null");
    if(d&&Array.isArray(d.answers))return d;
    const ap=activeProfile(p);
    const prof=ap?list(p).find(x=>x.name===ap):null;
    if(prof&&Array.isArray(prof.deepAnswers)&&prof.deepAnswers.length){
      return {answers:prof.deepAnswers.slice(0,18),free:prof.state?.free||"",updatedAt:prof.updatedAt||Date.now()};
    }
    return null;
  }catch{return null}
}
function saveExtraDraft(p,answers,free){
  try{
    localStorage.setItem(extraDraftKey(p),JSON.stringify({
      answers:Array.isArray(answers)?answers.slice(0,18):[],
      free:String(free||"").slice(0,4000),
      updatedAt:Date.now()
    }));
  }catch(e){console.warn("extra draft save failed",e)}
}
function collectExtraAnswers(){
  return extraPlan.map((_,i)=>{
    const x=document.querySelector(`input[name="ex${i+1}"]:checked`);
    return x?Number(x.value):null;
  });
}
function persistExtraDraftFromUi(){
  const answers=collectExtraAnswers();
  const free=(document.getElementById("extraFree")?.value||"").trim();
  saveExtraDraft(extraTarget,answers,free);
}
function restoreExtraDraftToUi(p){
  const draft=readExtraDraft(p);if(!draft)return;
  (draft.answers||[]).forEach((v,i)=>{
    if(v==null)return;
    const input=document.querySelector(`input[name="ex${i+1}"][value="${String(v)}"]`);
    if(input)input.checked=true;
  });
  const free=document.getElementById("extraFree");
  if(free)free.value=draft.free||"";
}

function showExtra(){
  try{
  if(!ad30||!extraDiag||!ad30Countdown||!extraTitle||!extraIntro||!extraQuestions||!extraResult)throw new Error("後半18問の表示要素が見つかりません。");
  ad30.style.display="none";
  extraDiag.style.setProperty("display","block","important");
  extraTitle.textContent="🔎 深掘りチェック（後半18問）";
  extraPlan=Q_DEEP.map(q=>({axis:q.axis,q:q.q,dir:q.dir}));
  extraIntro.innerHTML=`<div class="extra-adaptive-note"><b>前半18問とは別の3方向を見ます。</b><br>近づき方・距離の取り方、刺激への反応、進め方・柔軟性を各6問ずつ確認します。全員同じ18問です。</div>`;
  extraQuestions.innerHTML="";
  extraPlan.forEach((item,i)=>{
    const n=i+1;
    if(i===0||item.axis!==extraPlan[i-1].axis){const h=document.createElement('div');h.className='extra-section-title';h.textContent=`${DEEP_AXES[item.axis].icon} ${DEEP_AXES[item.axis].label}`;extraQuestions.appendChild(h)}
    extraQuestions.insertAdjacentHTML("beforeend",`<div class="q"><b>${n}. ${escapeHtml(item.q)}</b><div class="scale">${[1,2,3,4,5].map(v=>`<label><input type="radio" name="ex${n}" value="${v}">${v}</label>`).join("")}</div><div class="scale"><span>あまり当てはまらない</span><span>かなり当てはまる</span></div></div>`);
  });
  extraQuestions.insertAdjacentHTML("beforeend",`<div class="extra-free"><label class="small">📝 まだ選択肢にない特徴があれば（任意）</label><textarea id="extraFree" placeholder="例：こういう場面ではこうなりやすい、など自由にどうぞ"></textarea></div>`);
  restoreExtraDraftToUi(extraTarget);
  extraQuestions.querySelectorAll('input[type="radio"]').forEach(el=>el.addEventListener("change",persistExtraDraftFromUi));
  document.getElementById("extraFree")?.addEventListener("input",persistExtraDraftFromUi);
  extraResult.innerHTML="";
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    window.scrollTo({top:extraDiag.getBoundingClientRect().top+window.scrollY-20,behavior:"smooth"});
  }));
  }catch(e){
    console.error(e);
    alert(e.message||"後半18問の表示に失敗しました。");
  }
}
function extraScore(){
 const sums={};Object.keys(DEEP_AXES).forEach(k=>sums[k]=[]);
 extraPlan.forEach((item,i)=>{const x=document.querySelector(`input[name="ex${i+1}"]:checked`);if(x)sums[item.axis].push({v:Number(x.value),q:item})});
 return Object.keys(DEEP_AXES).map(key=>{const arr=sums[key];let total=0;arr.forEach(o=>{total+=(o.v-3)*Number(o.q.dir||1)});const score=arr.length?Math.max(0,Math.min(100,50+(total/arr.length)*25)):50;return {key,score,count:arr.length}});
}
function renderExtraResult(scores,answers,free){
  extraResult.innerHTML="";
  const base=diagScores.length?diagScores:axisScore(Q,diagAnswers);
  const sec=document.createElement("section");sec.className="result-overview";
  sec.innerHTML=`<div class="overview-head">🧩 36問で見えた、あなたのコミュニケーション特性</div><div class="overview-body"><p class="overview-lead">前半18問で基本の6方向、後半18問でさらに3つの方向を見ました。ここでは9方向をまとめて、会話で出やすい特徴を整理します。</p></div>`;
  const body=sec.querySelector('.overview-body');
  const baseTop=[...base].sort((a,b)=>Math.abs(b.score-50)-Math.abs(a.score-50)).slice(0,3);
  baseTop.forEach(x=>{const a=AXES[x.key],n=traitNarrative(x.key,x.score),card=document.createElement('div');card.className='meaning-card';card.innerHTML=`<div class="meaning-title">${a.icon} ${a.label}</div><p class="meaning-main"><b>傾向：</b>${escapeHtml(n.main)}。</p><div class="meaning-use"><b>会話では：</b>${escapeHtml(n.use)}</div>`;body.appendChild(card)});
  scores.forEach(x=>{const a=DEEP_AXES[x.key],n=deepNarrative(x.key,x.score),card=document.createElement('div');card.className='meaning-card';card.innerHTML=`<div class="meaning-title">${a.icon} ${a.label}</div><p class="meaning-main"><b>傾向：</b>${escapeHtml(n.main)}。</p><div class="meaning-use"><b>会話では：</b>${escapeHtml(n.use)}</div>`;body.appendChild(card)});
  extraResult.appendChild(sec);
  buildTraitOverlapCards(base,scores).forEach(card=>extraResult.appendChild(card));
  const attachment=buildAttachmentOverlapCard(scores);if(attachment)extraResult.appendChild(attachment);
  if(free){const n=document.createElement('div');n.className='v36-cause';n.innerHTML=`<b>📝 本人が追加したメモ</b><br>${escapeHtml(free)}`;extraResult.appendChild(n)}
  localStorage.setItem("cl_extra_result_"+extraTarget,JSON.stringify({kind:"deep",scores,answers,free:free||"",updatedAt:Date.now()}));
  localStorage.setItem("cl_extra_radar_"+extraTarget,JSON.stringify({deep:scores}));
  const baseSaved=(()=>{try{return JSON.parse(localStorage.getItem('cl_diag_result_'+extraTarget)||'null')}catch{return null}})();
  const baseAnswers=Array.isArray(baseSaved?.answers)?baseSaved.answers.slice(0,18):[];
  const shareBox=document.createElement('div');
  addShareButton(shareBox,'CoreLingualの36問特性チェック結果',{
    kind:'diagnosis',version:9,target:extraTarget,targetLabel:extraTarget==='my'?'自分':'相手',
    scores:base.map(x=>({key:x.key,score:x.score})),
    deepScores:scores.map(x=>({key:x.key,score:x.score})),
    answers:baseAnswers,
    deepAnswers:answers.slice(0,18),
    deep:{scores:scores.map(x=>({key:x.key,score:x.score})),answers:answers.slice(0,18)},
    free:free||''
  });
  extraResult.appendChild(shareBox);
  const applyBox=document.createElement('div');applyBox.className='v36-profile-apply';
  const applyBtn=document.createElement('button');applyBtn.type='button';applyBtn.className='primary';applyBtn.textContent='🧩 この36問の結果をプロフィールに反映する';
  applyBtn.onclick=()=>{
    const manual=free||extractManualMemo(document.getElementById(extraTarget==='my'?'myFree':'partnerFree')?.value||'');
    applyDiagToProfile(extraTarget,base,scores);
    const freeId=extraTarget==='my'?'myFree':'partnerFree';
    const profileText=buildAiProfileText(base,extraTarget==='my'?'あなた':'相手',scores,manual);
    const freeEl=document.getElementById(freeId);if(freeEl)freeEl.value=profileText;
    localStorage.setItem('cl_diag_summary_'+extraTarget,profileText);
    alert('36問の特性チェック結果をプロフィールに反映したよ！');
  };
  applyBox.appendChild(applyBtn);extraResult.appendChild(applyBox);
}
runExtra.onclick=()=>{
  const answers=collectExtraAnswers();
  const missing=answers.findIndex(v=>v==null);
  if(missing>=0){saveExtraDraft(extraTarget,answers,(document.getElementById('extraFree')?.value||'').trim());alert(`追加探索の全${extraPlan.length}問に回答してください。未回答は${missing+1}問目です。1〜5で選んでね。`);return}
  const free=(document.getElementById('extraFree')?.value||'').trim();
  saveExtraDraft(extraTarget,answers,free);
  renderExtraResult(extraScore(),answers,free);
};
startMore.onclick=()=>startExtra();
Q.forEach((q,i)=>questions.insertAdjacentHTML("beforeend",`<div class="q"><b>${i+1}. ${q.q}</b><div class="scale">${[1,2,3,4,5].map(v=>`<label><input type="radio" name="q${i}" value="${v}">${v}</label>`).join("")}</div><div class="scale"><span>あまり当てはまらない</span><span>かなり当てはまる</span></div></div>`));
function cl55ShowPane(which){
  const myPane=document.getElementById('cl55PaneMy');
  const pPane=document.getElementById('cl55PanePartner');
  if(myPane)myPane.style.display=which==='my'?'block':'none';
  if(pPane)pPane.style.display=which==='partner'?'block':'none';
  selfDiag.classList.toggle('on',which==='my');
  otherDiag.classList.toggle('on',which==='partner');
  selfDiag.setAttribute('aria-selected',which==='my'?'true':'false');
  otherDiag.setAttribute('aria-selected',which==='partner'?'true':'false');
}
selfDiag.onclick=()=>{target="my";cl55ShowPane('my');const n=document.getElementById('targetNote');if(n)n.textContent="自分自身について、気づいていることやチェック結果を残せます。";restoreDiagAnswers("my")};
otherDiag.onclick=()=>{target="partner";cl55ShowPane('partner');restoreDiagAnswers("partner")};

function showDiagQuestions(){const panel=document.getElementById("diagQuestionPanel");if(panel){panel.hidden=false;panel.style.display="block"}}
function hideDiagQuestions(){/* v36: 質問は常時表示。過去回答をそのまま残すため非表示化しない。 */}
function restoreDiagAnswers(p){
  try{
    const saved=JSON.parse(localStorage.getItem("cl_diag_result_"+p)||"null");
    const answers=Array.isArray(saved?.answers)?saved.answers:[];
    if(answers.length!==Q.length)return false;
    for(let i=0;i<Q.length;i++){
      const value=String(answers[i]);
      const input=document.querySelector(`input[name="q${i}"][value="${value}"]`);
      if(input)input.checked=true;
    }
    diagAnswers=answers.map(Number);
    diagScores=Array.isArray(saved?.scores)?saved.scores:axisScore(Q,diagAnswers);
    return true;
  }catch{return false}
}
runDiag.onclick=()=>{const answers=[];for(let i=0;i<Q.length;i++){const x=document.querySelector(`input[name="q${i}"]:checked`);if(!x){alert("前半18問すべてに回答してください。1〜5で選んでね。");return}answers.push(Number(x.value))}diagAnswers=answers;diagScores=axisScore(Q,answers);localStorage.setItem("cl_diag_radar_"+target,JSON.stringify(axisValuesFromScores(diagScores)));localStorage.setItem("cl_diag_result_"+target,JSON.stringify({scores:diagScores,answers,updatedAt:Date.now()}));renderDiagResult(diagScores);applyDiagToProfile(target,diagScores);document.getElementById("moreDiag").style.display="block";renderTwoPersonComparison();};


function normalizeSharedDeepScores(p){
  const direct=Array.isArray(p?.deepScores)?p.deepScores:[];
  if(direct.length)return direct;
  const nested=Array.isArray(p?.deep?.scores)?p.deep.scores:[];
  if(nested.length)return nested;
  const radar=Array.isArray(p?.extraRadar?.deep)?p.extraRadar.deep:(Array.isArray(p?.extraRadar?.scores)?p.extraRadar.scores:[]);
  if(radar.length)return radar;
  const ans=Array.isArray(p?.deepAnswers)?p.deepAnswers:(Array.isArray(p?.deep?.answers)?p.deep.answers:[]);
  if(ans.length===18){
    const sums={};Object.keys(DEEP_AXES).forEach(k=>sums[k]=[]);
    Q_DEEP.forEach((item,i)=>{const v=Number(ans[i]);if(Number.isFinite(v))sums[item.axis].push({v,q:item});});
    return Object.keys(DEEP_AXES).map(key=>{
      const arr=sums[key]||[];let total=0;arr.forEach(o=>{total+=(o.v-3)*Number(o.q.dir||1)});
      const score=arr.length?Math.max(0,Math.min(100,50+(total/arr.length)*25)):50;
      return {key,score,count:arr.length};
    });
  }
  return [];
}

function renderShared(payload){
 const p=payload||{};
 document.body.classList.add('shared-mode');
 try{document.querySelectorAll('body > .shared-shell').forEach(x=>x.remove())}catch{}
 diag.style.display='none';
 const shell=document.createElement('div');shell.className='shared-shell v36-shared-result';
 const title=document.createElement('div');title.className='v36-shared-title';
 title.innerHTML=`<h2>📎 特性チェックの共有結果</h2><p>${escapeHtml(p.title||'特性チェックの結果が共有されました。')}</p>`;
 shell.appendChild(title);
 if(p.kind==='analysis'){
   const r=p.result||{},sec=document.createElement('section');sec.className='result-section analysis-section';sec.innerHTML='<div class="result-heading">🔍 会話解析結果</div>';
   [['🌸 相手の心理・背景',r.partner],['🧩 自分の心理・背景',r.me],['💡 すれ違いのメカニズム',r.mismatch]].forEach(([t,x])=>{if(!x)return;const c=document.createElement('div');c.className='result-card';c.innerHTML=`<b>${t}</b><p>${escapeHtml(x)}</p>`;sec.appendChild(c)});
   (Array.isArray(r.advice)?r.advice:[]).forEach(a=>{const c=document.createElement('div');c.className='advice-card';c.innerHTML=`<div class="advice-cause"><span>原因：</span>${escapeHtml(a.cause||'')}</div><div class="advice-suggest"><b>💡 こう言い換えてみましょう</b><p>${escapeHtml(a.suggestion||'')}</p></div>`;sec.appendChild(c)});shell.appendChild(sec);
 }else if(p.kind==='diagnosis'){
   const scores=Array.isArray(p.scores)?p.scores:[];
   const deepScores=normalizeSharedDeepScores(p);
   const label=p.targetLabel||'本人';
   const title2=document.createElement('div');title2.className='v36-shared-title';title2.innerHTML=`<h2>🧩 ${escapeHtml(label)}の特性チェック結果</h2><p>${deepScores.length?'前半18問＋後半18問の36問から、会話で出やすい特徴をまとめています。':'会話の中で、どんな受け取り方・考え方・伝え方が自然になりやすいかをまとめています。'}自分のコミュニケーションの特徴を知るための、ひとつの参考としてご覧ください。</p>`;
   shell.innerHTML='';shell.appendChild(title2);
   const baseProfile=buildTraitSummary(scores,label);
   if(baseProfile){
     baseProfile.querySelectorAll('.v36-trait').forEach(t=>{
       const c=document.createElement('div');c.className='v36-shared-trait';
       const h=t.querySelector('.v36-trait-title')?.textContent||'';
       const main=t.querySelector('.v36-trait-main')?.textContent||'';
       const use=t.querySelector('.v36-trait-use')?.textContent||'';
       c.innerHTML=`<h3>${escapeHtml(h)}</h3><p>${escapeHtml(main)}</p><div class="use"><b>会話では：</b>${escapeHtml(use.replace(/^会話では：/,'').trim())}</div>`;
       shell.appendChild(c);
     });
   }
   if(deepScores.length){
     const deepTitle=document.createElement('h3');deepTitle.className='shared-subheading';deepTitle.textContent='🔎 後半18問で見えた3つの方向';shell.appendChild(deepTitle);
     deepScores.forEach(x=>{const a=DEEP_AXES[x.key];if(!a)return;const n=deepNarrative(x.key,x.score);const c=document.createElement('div');c.className='v36-shared-trait';c.innerHTML=`<h3>${escapeHtml(a.icon+' '+a.label)}</h3><p><b>傾向：</b>${escapeHtml(n.main)}。</p><div class="use"><b>会話では：</b>${escapeHtml(n.use)}</div>`;shell.appendChild(c)});
     buildTraitOverlapCards(scores,deepScores).forEach(card=>{const clone=card.cloneNode(true);shell.appendChild(clone)});
     const attachment=buildAttachmentOverlapCard(deepScores);if(attachment)shell.appendChild(attachment.cloneNode(true));
   }
   if(p.free){const memo=document.createElement('div');memo.className='v36-cause';memo.innerHTML=`<b>📝 本人が追加したメモ</b><br>${escapeHtml(p.free)}`;shell.appendChild(memo);}
   const cta=document.createElement('div');cta.className='shared-cta';
   cta.innerHTML='<b>🧩 自分も特性チェックしてみる</b><p>自分のコミュニケーション傾向もチェックしてみよう。</p><button type="button">特性チェックを始める</button>';
   cta.querySelector('button').addEventListener('click',()=>{const u=new URL(location.href);u.pathname='/';u.search='';u.hash='';location.href=u.toString();});
   shell.appendChild(cta);
 }else shell.innerHTML+=`<div class="shared-error"><b>共有データを表示できませんでした</b><p>${escapeHtml(p.error||'対応していない共有形式です。')}</p></div>`;
 document.body.appendChild(shell);
}
async function loadSharedFromUrl(){
 const pathMatch=location.pathname.match(/^\/share\/([A-Za-z0-9_-]{40,50})\/?$/);
 const queryToken=new URLSearchParams(location.search).get("sharedToken");
 const t=(pathMatch&&pathMatch[1])||queryToken;if(!t)return;
 try{const r=await fetch("/api/share?token="+encodeURIComponent(t),{cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"共有結果を読み込めませんでした。");renderShared(d.payload||d);}catch(e){talk.style.display="block";diag.style.display="none";result.innerHTML='<div class="card"><b>📎 共有結果を読み込めませんでした</b><p class="friendly-note"></p></div>';result.querySelector("p").textContent=e.message;}
}
loadSharedFromUrl();


(function(){
  function boot(){ try{if(!v29HostInviteActive() && localStorage.getItem('cl_shared_partner_profile')){localStorage.removeItem('cl_shared_partner_profile')}}catch{} renderTwoPersonComparison();restoreDiagAnswers(target); if(loadDiagRadar(target)){const m=document.getElementById('moreDiag');if(m)m.style.display='block';} }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

(function(){
  const box=document.getElementById("v23InviteControls");
  if(box && !v23InviteToken()){box.innerHTML=v23InviteCreateControls();v23BindCreateInvite();}
  // v54: 招待パートナーの送信は後半18問完了後のみ（script末尾の capture handler）
  v23CheckInvite();
  v23LoadHost();
  v26StartHostPolling();
  v26StartPartnerPolling();
})();

/* v53: 招待された側は前半18問→広告→後半18問まで完了してから送信する。
   「自分/相手」切替や通常の4種類のプロフィール入口は招待画面では使わせない。 */
(function(){
  function isInvitePartner(){
    const inv=v23GetInviteState();
    return !!(inv?.token && !inv?.ownerToken);
  }
  function answerBase(){
    const answers=[];
    for(let i=0;i<Q.length;i++){
      const x=document.querySelector(`input[name="q${i}"]:checked`);
      if(!x){alert(`前半18問すべてに回答してください。未回答は${i+1}問目です。`);return false;}
      answers.push(Number(x.value));
    }
    target='my';
    diagAnswers=answers;
    diagScores=axisScore(Q,answers);
    localStorage.setItem('cl_diag_radar_my',JSON.stringify(axisValuesFromScores(diagScores)));
    localStorage.setItem('cl_diag_result_my',JSON.stringify({scores:diagScores,answers,updatedAt:Date.now()}));
    try{applyDiagToProfile('my',diagScores)}catch(e){console.warn(e)}
    const more=document.getElementById('moreDiag');
    if(more)more.style.setProperty('display','block','important');
    const qp=document.getElementById('diagQuestionPanel');
    if(qp)qp.style.setProperty('display','none','important');
    return true;
  }
  function answerDeep(){
    const answers=collectExtraAnswers();
    const missing=answers.findIndex(v=>v==null);
    if(missing>=0){
      saveExtraDraft('my',answers,(document.getElementById('extraFree')?.value||'').trim());
      alert(`後半18問すべてに回答してください。未回答は${missing+1}問目です。`);
      return false;
    }
    const free=(document.getElementById('extraFree')?.value||'').trim();
    saveExtraDraft('my',answers,free);
    extraTarget='my';
    renderExtraResult(extraScore(),answers,free);
    return true;
  }
  async function submitAfter36(){
    try{
      await v23SubmitPartner();
      document.body.classList.remove('invite-questions-mode');
      document.body.classList.add('invite-complete-mode');
      const qp=document.getElementById('diagQuestionPanel');
      if(qp)qp.style.setProperty('display','none','important');
      const more=document.getElementById('moreDiag');
      if(more)more.style.setProperty('display','none','important');
      const result=document.getElementById('diagResult');
      if(result)result.style.setProperty('display','none','important');
      window.scrollTo({top:0,behavior:'smooth'});
    }catch(e){
      alert(e.message||'36問の結果を送信できませんでした。もう一度試してね。');
    }
  }
  document.addEventListener('click',e=>{
    if(!isInvitePartner())return;
    const baseBtn=e.target?.closest?.('#runDiag');
    if(baseBtn){
      e.preventDefault();e.stopImmediatePropagation();
      if(answerBase()){
        setTimeout(()=>{
          try{startExtra()}catch(err){alert(err.message||'後半18問を開始できませんでした。');}
        },50);
      }
      return;
    }
    const deepBtn=e.target?.closest?.('#runExtra');
    if(deepBtn){
      e.preventDefault();e.stopImmediatePropagation();
      if(answerDeep())setTimeout(submitAfter36,100);
    }
  },true);

  const forceInviteView=()=>{
    if(!isInvitePartner())return;
    target='my';
    selfDiag.classList.remove('on');
    otherDiag.classList.remove('on');
    const m=document.getElementById('moreDiag');
    if(m)m.style.setProperty('display','block','important');
  };
  setTimeout(forceInviteView,200);
  setTimeout(forceInviteView,1000);
})();

(function(){
  document.body.classList.add('v72-active');
  const shell=document.getElementById('v72Shell');
  if(!shell)return;
  const page1=document.getElementById('v72Page1'),page2=document.getElementById('v72Page2'),page3=document.getElementById('v72Page3'),page4=document.getElementById('v72Page4');
  const pages=[page1,page2,page3,page4];
  const dots=[...document.querySelectorAll('.v72-dot')];
  const talkOriginal=document.getElementById('talk');
  const diagOriginal=document.getElementById('diag');
  const profilePanels=[...document.querySelectorAll('#talk > .panel')];
  // The original talk/diag sections were removed from the normal flow above; rebuild references from saved IDs if present.
  const conversationPanel=document.querySelector('#v72ConversationMount') && document.querySelector('#v72ConversationMount').dataset.ready ? null : document.querySelector('#talk > .panel');
  function setNames(){
    const my=typeof activeProfile==='function'?activeProfile('my'):null;
    const partner=typeof activeProfile==='function'?activeProfile('partner'):null;
    document.getElementById('v72MyName').textContent=my||'未設定';
    document.getElementById('v72PartnerName').textContent=partner||'未設定';
    document.getElementById('v72ContextLine').textContent=(my||'自分')+' × '+(partner||'相手')+' の会話として解析します。プロフィールや特性チェックは後からでも設定できます。';
  }
  function go(i){pages[i].scrollIntoView({behavior:'smooth',block:'start'});dots.forEach((d,n)=>d.classList.toggle('on',n===i));}
  dots.forEach(d=>d.addEventListener('click',()=>go(Number(d.dataset.page))));
  document.getElementById('v72StartConversation').onclick=()=>go(1);
  document.getElementById('v72BackToInput').onclick=()=>go(1);
  document.getElementById('v72BackToResult').onclick=()=>go(2);
  document.getElementById('v72ToCompare').onclick=()=>go(3);
  // Move the original nodes into the new pages. IDs and existing event handlers remain intact.
  const talk=document.getElementById('talk');
  if(talk){
    const panels=[...talk.querySelectorAll(':scope > .panel')];
    const conv=panels[0];
    const prof=panels[1];
    if(conv){document.getElementById('v72ConversationMount').appendChild(conv);}
    const analyzeEl=document.getElementById('analyze');
    const banner=document.getElementById('bannerAd');
    const result=document.getElementById('result');
    if(analyzeEl)document.getElementById('v72AnalyzeMount').appendChild(analyzeEl);
    if(banner)document.getElementById('v72BannerMount').appendChild(banner);
    if(result)document.getElementById('v72ResultMount').appendChild(result);
    if(prof)document.getElementById('v72ProfileMount').appendChild(prof);
  }
  const diag=document.getElementById('diag');
  if(diag){
    // Move the existing diagnostic UI into the diagnostic sheet so all original functions remain usable.
    const inner=[...diag.children];
    const mount=document.getElementById('v72DiagMount');
    inner.forEach(x=>mount.appendChild(x));
  }
  function openProfile(which){
    const overlay=document.getElementById('v72ProfileOverlay');
    overlay?.setAttribute('data-profile-mode','existing');
    const title=document.getElementById('v72ProfileTitle');
    const paneMy=document.getElementById('profileMyPane'),panePartner=document.getElementById('profilePartnerPane');
    const diagBtn=document.getElementById('v72OpenDiag');
    if(which==='my'){
      profileMyPane.style.display='block'; profilePartnerPane.style.display='none'; title.textContent='👤 自分のプロフィール';
      const n=activeProfile('my'); if(n){const x=list('my').find(z=>z.name===n);if(x){apply('my',x.state);const ne=document.getElementById('myName');if(ne)ne.value=x.name;}} else {const ne=document.getElementById('myName');if(ne)ne.value='';}
      if(diagBtn){const fold=profileMyPane.querySelector('.v74-traits-fold'); if(fold) fold.parentNode.insertBefore(diagBtn,fold);}
    }else{
      profileMyPane.style.display='none'; profilePartnerPane.style.display='block'; title.textContent='👥 相手のプロフィール';
      const n=activeProfile('partner'); if(n){const x=list('partner').find(z=>z.name===n);if(x){apply('partner',x.state);const ne=document.getElementById('partnerName');if(ne)ne.value=x.name;}} else {const ne=document.getElementById('partnerName');if(ne)ne.value='';}
      if(diagBtn){const fold=profilePartnerPane.querySelector('.v74-traits-fold'); if(fold) fold.parentNode.insertBefore(diagBtn,fold);}
    }
    overlay.classList.add('show');
  }
  let pickerWhich='my';
  function openPicker(which){
    pickerWhich=which;
    const title=document.getElementById('v72PickerTitle');
    title.textContent=(which==='my'?'👤 自分':'👥 相手')+'のプロフィールを選ぶ';
    const box=document.getElementById('v72PickerChoices');box.innerHTML='';
    const arr=list(which), active=activeProfile(which);
    const add=(label,sub,fn,cls='')=>{const b=document.createElement('button');b.type='button';b.className='v72-choice '+cls;b.innerHTML=label+(sub?'<small>'+sub+'</small>':'');b.onclick=()=>{document.getElementById('v72PickerOverlay').classList.remove('show');fn();};box.appendChild(b)};
    add('＋ 新しく作る','名前をつけてプロフィールを作成',()=>openProfileNew(which),'v72-new');
    arr.forEach(x=>add((active===x.name?'● ':'')+x.name,'このプロフィールを今回の'+(which==='my'?'自分':'相手')+'として使う',()=>{setActiveProfile(which,x.name);apply(which,x.state);draw(which);renderTwoPersonComparison();setNames();}));
    if(arr.length) add('⚙️ 選択中のプロフィールを編集',active||'',()=>openProfile(which));
    document.getElementById('v72PickerOverlay').classList.add('show');
  }
  function openProfileNew(which){
    openProfile(which);
    document.getElementById('v72ProfileOverlay')?.setAttribute('data-profile-mode','new');
    const name=document.getElementById(which+'Name');
    const free=document.getElementById(which+'Free');
    if(name)name.value='';
    if(free)free.value='';
    document.querySelectorAll('#'+which+'Traits .chip').forEach(x=>x.classList.remove('on'));
    // Do not auto-focus the name field: opening a new profile should not summon the mobile keyboard and hide the next actions.
  }
  document.getElementById('v72MyPicker').onclick=()=>openPicker('my');
  document.getElementById('v72PartnerPicker').onclick=()=>openPicker('partner');
  document.getElementById('v72PickerClose').onclick=()=>document.getElementById('v72PickerOverlay').classList.remove('show');
  document.getElementById('v72ProfileClose').onclick=()=>{document.getElementById('v72ProfileOverlay').classList.remove('show');setNames();};
  document.getElementById('v72OpenDiag').onclick=()=>{
    const which=pickerWhich;
    const nameInput=document.getElementById(which+'Name');
    if(!nameInput?.value.trim()){
      showSaveNameRequired(which);
      return;
    }
    // 特性チェックへ進むときは、名前を確定したプロフィールを先に作成・保存する。
    // 特性チェック自体は任意なので、ここでプロフィールを保存してもメモだけ保存する利用方法はそのまま。
    if(!save(which,{close:false,toast:false}))return;
    document.getElementById('v72ProfileOverlay').classList.remove('show');
    if(which==='my')selfDiag.click();else otherDiag.click();
    document.getElementById('v72DiagTitle').textContent=(which==='my'?'👤 自分':'👥 相手')+'の特性チェック';
    document.getElementById('v72DiagOverlay').classList.add('show');
  };
  document.getElementById('v72DiagClose').onclick=()=>{document.getElementById('v72DiagOverlay').classList.remove('show');setNames();renderTwoPersonComparison();};
  // Reflect saves/profile switches in the top page.
  const oldSaveMy=saveMy.onclick,oldSavePartner=savePartner.onclick;
  saveMy.addEventListener('click',()=>setTimeout(setNames,50));
  savePartner.addEventListener('click',()=>setTimeout(setNames,50));
  // Result auto-scroll after the existing analysis handler finishes.
  const analyzeEl=document.getElementById('analyze');
  const resultEl=document.getElementById('result');
  if(analyzeEl && analyzeEl.onclick){
    const old=analyzeEl.onclick;
    analyzeEl.onclick=async function(e){
      const r=await old.call(this,e);
      setTimeout(()=>{const empty=document.getElementById('v72ResultEmpty');if(resultEl && resultEl.innerHTML.trim()){if(empty)empty.style.display='none';go(2);}},80);
      return r;
    };
  }
  // Comparison is already rendered by the existing app; move its live node into page 4.
  const compare=document.getElementById('v21CompareCard');
  if(compare)document.getElementById('v72CompareMount').appendChild(compare);
  // Since the original diagnostic and talk sections are now empty containers, keep them out of normal layout.
  if(talk)talk.style.display='none';
  if(diag)diag.style.display='none';
  setNames();
  function deleteProfile(which){
    const name=activeProfile(which);
    if(!name){alert('削除するプロフィールがありません。');return;}
    if(!confirm('「'+name+'」を削除しますか？\nこの操作は取り消せません。'))return;
    const arr=list(which),idx=arr.findIndex(x=>x.name===name);
    if(idx>=0){arr.splice(idx,1);localStorage.setItem('cl_'+which,JSON.stringify(arr));}
    localStorage.removeItem('cl_'+which+'_active');
    const ne=document.getElementById(which+'Name');if(ne)ne.value='';
    const fe=document.getElementById(which+'Free');if(fe)fe.value='';
    document.querySelectorAll('#'+which+'Traits .chip').forEach(x=>x.classList.remove('on'));
    draw(which);renderTwoPersonComparison();setNames();
    document.getElementById('v72ProfileOverlay')?.classList.remove('show');
    document.getElementById('v72PickerOverlay')?.classList.remove('show');
  }
  document.getElementById('deleteMyProfile')?.addEventListener('click',()=>deleteProfile('my'));
  document.getElementById('deletePartnerProfile')?.addEventListener('click',()=>deleteProfile('partner'));
  function escSvg(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
  function cardSide(score){const n=Number(score);if(n<=35)return 'left';if(n>=65)return 'right';return 'middle';}
  function cardDirection(key,score){
    const a=AXES[key]||{};const side=cardSide(score);
    if(side==='left')return a.left||'左寄り';
    if(side==='right')return a.right||'右寄り';
    return '場面に応じて使い分けやすい';
  }
  function buildCardCopy(data){
    const myScores=Object.fromEntries((data.my?.scores||[]).map(x=>[x.key,Number(x.score)||50]));
    const paScores=Object.fromEntries((data.partner?.scores||[]).map(x=>[x.key,Number(x.score)||50]));
    const defs={
      language:{
        short:{left:'はっきり派',right:'空気派'},
        feature:{left:'大事なことは、言葉ではっきり確認したい',right:'言葉だけでなく、流れや背景から受け取りたい',middle:'言葉と流れの両方を見ながら受け取りたい'},
        titles:{opp:'はっきり派 × 空気派',same:'同じ入口の2人'},
        story:{leftRight:(a,b)=>`${a}は「言葉」を手がかりに、${b}は「流れ」を手がかりに話をつかみやすい2人。`,rightLeft:(a,b)=>`${a}は「流れ」を手がかりに、${b}は「言葉」を手がかりに話をつかみやすい2人。`,same:(a,b)=>`${a}と${b}は、会話の受け取り方が近いぶん、話が早く進みやすい2人。`,middle:(a,b)=>`${a}と${b}は、言葉と流れを行き来しながら会話をつかみやすい2人。`},
        tip:{left:'大事なことほど、短く言葉にして確認する',right:'大事なことは最後に一言だけ確認する',middle:'「ここはこういう意味で合ってる？」を時々入れる'}
      },
      thinking:{
        short:{left:'整理派',right:'ひらめき派'},
        feature:{left:'理由や順番を整理してから進みたい',right:'思いついた可能性を広げながら考えたい',middle:'整理と発想を行き来しながら考えたい'},
        titles:{opp:'整理派 × ひらめき派',same:'同じ考え方の2人'},
        story:{leftRight:(a,b)=>`${a}は「筋道」を整えてから、${b}は「ひらめき」を広げながら前に進みやすい2人。`,rightLeft:(a,b)=>`${a}は「ひらめき」を広げながら、${b}は「筋道」を整えてから前に進みやすい2人。`,same:(a,b)=>`${a}と${b}は、考えるテンポが近いぶん、アイデアを共有しやすい2人。`,middle:(a,b)=>`${a}と${b}は、整理と発想を切り替えながら答えを見つけやすい2人。`},
        tip:{left:'途中のアイデアも「仮の案」として受け取る',right:'広げた案は、最後に一つだけ要点を決める',middle:'「今は案出し」「ここから決める」と区切る'}
      },
      emotion:{
        short:{left:'話して整理',right:'時間で整理'},
        feature:{left:'話しながら気持ちを言葉にして整理したい',right:'少し時間を置いてから気持ちを整理したい',middle:'話す時と考える時を使い分けて整理したい'},
        titles:{opp:'話して整理 × 時間で整理',same:'似たペースの2人'},
        story:{leftRight:(a,b)=>`${a}は「話すうちに」、${b}は「少し離れてから」気持ちを整理しやすい2人。`,rightLeft:(a,b)=>`${a}は「少し離れてから」、${b}は「話すうちに」気持ちを整理しやすい2人。`,same:(a,b)=>`${a}と${b}は、気持ちを整理するペースが近く、無理なく話しやすい2人。`,middle:(a,b)=>`${a}と${b}は、話す時間と考える時間を切り替えながら気持ちを整理しやすい2人。`},
        tip:{left:'「今は聞いてほしい」と先に伝えてみる',right:'時間が必要なら「あとで話したい」と伝える',middle:'話すか考えるか、今ほしい時間を一言で伝える'}
      },
      distance:{
        short:{left:'一緒に整理',right:'ひとりで整理'},
        feature:{left:'話しながら気持ちや状況を整理したい',right:'自分の時間を取ってから話したい',middle:'相手や状況に合わせて距離を調整したい'},
        titles:{opp:'一緒に整理 × ひとりで整理',same:'ちょうどいい距離の2人'},
        story:{leftRight:(a,b)=>`${a}は「一緒に話す」と落ち着き、${b}は「ひとりで整える」と落ち着きやすい2人。`,rightLeft:(a,b)=>`${a}は「ひとりで整える」と落ち着き、${b}は「一緒に話す」と落ち着きやすい2人。`,same:(a,b)=>`${a}と${b}は、距離の取り方が近く、お互いのペースを合わせやすい2人。`,middle:(a,b)=>`${a}と${b}は、話す時間とひとりの時間を状況に合わせて使いやすい2人。`},
        tip:{left:'返事を急がず、相手の考える時間も残す',right:'離れたい時は「落ち着いたら話す」と伝える',middle:'「今話す？あとで話す？」を一言で確認する'}
      },
      change:{
        short:{left:'地図が欲しい',right:'歩きながら'},
        feature:{left:'先の流れが見えると安心して進みやすい',right:'まず試して、途中で調整しながら進みやすい',middle:'見通しを立てつつ、必要なら柔軟に変えやすい'},
        titles:{opp:'地図が欲しい × 歩きながら',same:'似た進み方の2人'},
        story:{leftRight:(a,b)=>`${a}は「地図を見てから」、${b}は「歩きながら」進み方を決めやすい2人。`,rightLeft:(a,b)=>`${a}は「歩きながら」、${b}は「地図を見てから」進み方を決めやすい2人。`,same:(a,b)=>`${a}と${b}は、進み方の感覚が近く、予定を合わせやすい2人。`,middle:(a,b)=>`${a}と${b}は、見通しと柔軟さのバランスを取りながら進みやすい2人。`},
        tip:{left:'「今のところ」を添えて、予定に余白を残す',right:'変える前に「ここまではこのまま」と伝える',middle:'変更するときは「何が変わるか」を一言で共有する'}
      },
      communication:{
        short:{left:'まず分かって',right:'まず解決'},
        feature:{left:'気持ちを受け止めてもらってから話を進めたい',right:'何をすればいいか具体的になると話を進めやすい',middle:'気持ちと具体策の両方を見ながら話を進めたい'},
        titles:{opp:'まず分かって × まず解決',same:'同じ入口の2人'},
        story:{leftRight:(a,b)=>`${a}は「分かってもらうこと」から、${b}は「どうするか」から会話を前に進めやすい2人。`,rightLeft:(a,b)=>`${a}は「どうするか」から、${b}は「分かってもらうこと」から会話を前に進めやすい2人。`,same:(a,b)=>`${a}と${b}は、会話の入口が近いぶん、気持ちを共有しやすい2人。`,middle:(a,b)=>`${a}と${b}は、気持ちと具体策の両方を行き来しながら話を進めやすい2人。`},
        tip:{left:'「そう感じたんだね」を先に置いてみる',right:'解決策の前に「まず聞くよ」を一言添える',middle:'「聞いてほしい？一緒に考える？」を確認する'}
      }
    };
    const keys=Object.keys(defs);let best=keys[0],bestDiff=-1;
    keys.forEach(k=>{const d=Math.abs((myScores[k]??50)-(paScores[k]??50));if(d>bestDiff){best=k;bestDiff=d;}});
    const def=defs[best],ms=myScores[best]??50,ps=paScores[best]??50;
    const mySide=cardSide(ms),paSide=cardSide(ps),A=data.myName||'あなた',B=data.paName||'相手';
    const sideLabel=side=>side==='left'?def.short.left:side==='right'?def.short.right:'バランス型';
    const feature=side=>side==='left'?def.feature.left:side==='right'?def.feature.right:def.feature.middle;
    let title;
    if(mySide==='middle'&&paSide==='middle') title='似た入口の2人';
    else if(mySide===paSide) title=def.titles.same;
    else title=def.titles.opp;
    if(bestDiff<22) title='似た入口の2人';
    let story;
    if(mySide==='left'&&paSide==='right') story=def.story.leftRight(A,B);
    else if(mySide==='right'&&paSide==='left') story=def.story.rightLeft(A,B);
    else if(mySide===mySide&&paSide===mySide&&mySide!=='middle') story=def.story.same(A,B);
    else story=def.story.middle(A,B);
    let myTip=def.tip[mySide]||def.tip.middle,paTip=def.tip[paSide]||def.tip.middle;
    if(mySide===paSide&&mySide!=='middle'){
      myTip=def.tip.middle;paTip=def.tip.middle;
    }
    return {title,myName:A,paName:B,myFeature:feature(mySide),paFeature:feature(paSide),myShort:sideLabel(mySide),paShort:sideLabel(paSide),story,myTip,paTip,bestDiff};
  }
  function svgTextLines(text,maxChars){
    const out=[];let cur='';for(const ch of String(text||'')){if(ch==='\n'){if(cur)out.push(cur);cur='';continue;}if([...cur].length>=maxChars){out.push(cur);cur='';}cur+=ch;}if(cur)out.push(cur);return out;
  }
  function svgParagraph(text,x,y,maxChars,lineH,opts={}){
    const lines=svgTextLines(text,maxChars);const fill=opts.fill||'#39424d',size=opts.size||25,weight=opts.weight||500,anchor=opts.anchor||'start';
    return lines.map((line,i)=>`<text x="${x}" y="${y+i*lineH}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${escSvg(line)}</text>`).join('');
  }
  function copyComputedStyles(src,dst){
    if(!src||!dst)return;
    const cs=getComputedStyle(src);
    const props=['box-sizing','display','position','width','height','min-height','max-width','margin','padding','border','border-radius','background','background-color','color','font-family','font-size','font-weight','line-height','letter-spacing','text-align','vertical-align','white-space','word-break','overflow','grid-template-columns','grid-template-rows','gap','align-items','justify-content'];
    props.forEach(k=>{const v=cs.getPropertyValue(k);if(v)dst.style.setProperty(k,v);});
    const sc=src.children,dc=dst.children;
    for(let i=0;i<sc.length;i++)if(dc[i])copyComputedStyles(sc[i],dc[i]);
  }
  // Page tracking.
  const io=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){const i=pages.indexOf(en.target);dots.forEach((d,n)=>d.classList.toggle('on',n===i));}}),{root:shell,threshold:.6});
  pages.forEach(p=>io.observe(p));
})();

(function(){
  const el=document.getElementById("analysisCharCount");
  if(!el)return;
  const ta=el.previousElementSibling;
  if(!ta || ta.tagName!=="TEXTAREA")return;
  const max=60000;
  function update(){
    const n=ta.value.length;
    el.textContent=n.toLocaleString()+" / "+max.toLocaleString()+"文字";
    el.classList.toggle("warn", n>=50000);
  }
  ta.setAttribute("maxlength",String(max));
  ta.addEventListener("input",update);
  update();
})();
