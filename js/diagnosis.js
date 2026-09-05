let diagScores=[];let diagAnswers=[];let target="my";
function axisScore(qset,answers){
 const out={};
 Object.keys(AXES).forEach(k=>{
   let total=0,count=0;
   qset.forEach((q,i)=>{if(q.axis!==k)return;const v=Number(answers[i]);total+=(v-3)*q.dir;count++});
   out[k]=count?Math.max(0,Math.min(100,50+(total/count)*25)):50;
 });
 return Object.entries(out).map(([key,score])=>({key,score}));
}
function deepScore(answers){
 const out={};
 Object.keys(DEEP_AXES).forEach(k=>{
   let total=0,count=0;
   Q_DEEP.forEach((q,i)=>{if(q.axis!==k)return;const v=Number(answers[i]);total+=(v-3)*q.dir;count++});
   out[k]=count?Math.max(0,Math.min(100,50+(total/count)*25)):50;
 });
 return Object.entries(out).map(([key,score])=>({key,score}));
}
function deepNarrative(key,score){
 const a=DEEP_AXES[key];
 const uses={
  attach:{left:"相手の反応が読みにくいときは、確認したくなる気持ちを否定せず、『今は返事が必要なのか、少し待てるのか』を切り分けると落ち着きやすくなります。",right:"近い関係でも一人で整理する時間が必要になることがあります。『少し考えてから話したい』と先に伝えると、距離を拒絶と受け取られにくくなります。",middle:"相手との関係やその時の気持ちによって、確認したい時と一人で整理したい時を切り替えやすい傾向があります。"},
  sensory:{left:"情報や刺激が重なった場面では、話す量や通知などを少し減らしてから会話を続けると整理しやすくなることがあります。",right:"刺激が重なっても、その場で切り替えながら会話を続けやすい傾向があります。ただし疲れが出ているときは、無理に合わせなくても大丈夫です。",middle:"刺激の量やその場の余裕によって、受け止め方を変えやすい傾向があります。"},
  process:{left:"予定や順番が見えないときは、まず『次に何をするか』を一つ決めると動きやすくなります。",right:"最初から全部決めるより、まず小さく始めて途中で調整するほうが進みやすいことがあります。",middle:"見通しを立ててから動く時と、まず試して途中で変える時を状況に応じて使い分けやすい傾向があります。"}
 };
 if(score<=35)return {main:a.left,use:uses[key].left};
 if(score>=65)return {main:a.right,use:uses[key].right};
 return {main:`${a.left}と${a.right}の両方が、場面によって出やすい`,use:uses[key].middle};
}
function axisValuesFromScores(scores){const by={};(scores||[]).forEach(x=>by[x.key]=Number(x.score));return CoreLingual_v36.axes.map(a=>Math.round(by[a.id]??50))}
function extraAxisValues(extraScores){
 const by={};
 (extraScores||[]).forEach(x=>{
   if(AXES[x.key]) by[x.key]=Number(x.score)||0;
 });
 return CoreLingual_v36.axes.map(a=>by[a.id]!=null?Math.round(CoreLingual_v36.normalize(by[a.id])):50);
}
function combinedAxisValues(baseScores,extraScores){const b=axisValuesFromScores(baseScores),e=extraAxisValues(extraScores);return b.map((v,i)=>Math.round(v*.5+e[i]*.5))}
function profileDisplayName(p){return p==="my"?"あなた":"相手"}
function loadDiagRadar(p){try{return JSON.parse(localStorage.getItem("cl_diag_radar_"+p)||"null")}catch{return null}}
function escapeHtml(v){const d=document.createElement("div");d.textContent=String(v??"");return d.innerHTML}
function profileTraitMap(){return{
 language:["具体的な言葉を好む","文脈や行間を重視する"],
 thinking:["理由や根拠を確認したい","直感を重視することがある","複数の可能性を考える","一度気になると考え続けやすい"],
 emotion:["自分の気持ちを言葉にして整理する","一人で整理してから話したい","相手の感情の変化に気づきやすい"],
 distance:["関係の変化が気になりやすい","自分のペースを保ちたい","まず話し合って解決したい"],
 change:["変化は前もって知りたい","新しいことを試すのが好き","興味のあることに集中しやすい"],
 communication:["具体的な言葉を好む","文脈や行間を重視する","まず話し合って解決したい","会話では共感を大切にする"]
}}
function diagSummary(scores,targetLabel){return `【特性チェックの自動まとめ】\n${targetLabel}の回答では、次のような方向が見えました。\n${scores.map(x=>`・${AXES[x.key].label}：${directionText(x.key,x.score)}`).join("\n")}\n\nこれは性格・病気・障害・愛着スタイルなどを判定するものではありません。会話の中で「どちらのやり方が自然に感じやすいか」を見るための参考メモです。`}
function extractManualMemo(existing){
  const text=String(existing||'').trim();
  if(!text)return '';
  const markers=['【本人が追加したメモ】','【自分で追加したメモ】'];
  for(const marker of markers){
    const i=text.indexOf(marker);
    if(i>=0)return text.slice(i+marker.length).trim();
  }
  if(text.includes('【特性チェック v'))return '';
  return text;
}
function mergeDiagFree(existing,auto){
  const manual=extractManualMemo(existing);
  return auto+(manual?`\n\n【本人が追加したメモ】\n${manual}`:'');
}
function applyDiagToProfile(p,scores,extraScoresOverride){
  const id=p==='my'?'myTraits':'partnerTraits';const selected=new Set();const map=profileTraitMap();
  (scores||[]).forEach(x=>{if(x.score<=35)(map[x.key]||[]).slice(0,1).forEach(t=>selected.add(t));if(x.score>=65)(map[x.key]||[]).slice(-1).forEach(t=>selected.add(t))});
  document.querySelectorAll('#'+id+' .chip').forEach(c=>c.classList.toggle('on',selected.has(c.textContent)));
  const freeId=p==='my'?'myFree':'partnerFree';const label=p==='my'?'あなた':'相手';
  let extra=Array.isArray(extraScoresOverride)?extraScoresOverride:[];
  if(!extra.length){try{extra=JSON.parse(localStorage.getItem('cl_extra_result_'+p)||'null')?.scores||[]}catch{}}
  const current=document.getElementById(freeId)?.value||'';
  const manual=extractManualMemo(current);
  const auto=buildAiProfileText(scores||[],label,extra,manual);
  const free=document.getElementById(freeId);if(free)free.value=auto;
  localStorage.setItem('cl_diag_summary_'+p,auto);
  const active=activeProfile(p);
  if(active){
    const arr=list(p);const idx=arr.findIndex(x=>x.name===active);
    if(idx>=0){
      arr[idx]={
        ...arr[idx],
        state:state(p),
        scores:Array.isArray(scores)?scores.map(x=>({key:x.key,score:Number(x.score)||50})):[],
        deepScores:Array.isArray(extra)?extra.map(x=>({key:x.key,score:Number(x.score)||50})):[],
        updatedAt:Date.now()
      };
      localStorage.setItem('cl_'+p,JSON.stringify(arr));
      draw(p);
    }
  }
}

function axisDirection(key,score){
 const a=AXES[key];
 if(score<=35)return {short:"左寄り",label:a.left};
 if(score>=65)return {short:"右寄り",label:a.right};
 return {short:"中間",label:"場面・相手に応じて使い分け"};
}
const AXIS_MEANINGS={
 language:{left:"言葉の細かい条件まで確認したいところがあるため、情報が曖昧なままだと引っかかりやすいことがあります",right:"会話全体の流れから意味をつかみやすいところがあるため、言葉だけを切り取られると意図と違って受け取ることがあります",middle:"言葉の具体性と会話全体の流れの両方を手がかりにしやすく、相手や場面によって理解の仕方が変わることがあります",use:"相手に『具体的な条件があると助かる』『前後の流れもあると分かりやすい』など、自分に必要な情報の量を伝えるとズレを減らせます。"},
 thinking:{left:"理由や順序を整理してから納得したいところがあるため、結論だけを急に渡されると置いていかれたように感じることがあります",right:"いくつかの可能性を広げて考えやすいところがあるため、早く一つに決めるより選択肢を残したくなることがあります",middle:"筋道と直感の両方を使いやすく、状況によって判断材料を切り替えることがあります",use:"相手には『理由を聞いてから決めたい』『候補をいくつか出したい』など、考えるために必要な材料を伝えると会話が進みやすくなります。"},
 emotion:{left:"気持ちを言葉にして整理したいところがあるため、話せないまま抱えると考えがまとまりにくくなることがあります",right:"感情が動いた直後より時間を置いて整理したいところがあるため、すぐ答えを求められると負担になることがあります",middle:"話しながら整理する時と、時間を置く時を状況に応じて選びやすい傾向があります",use:"感情的な場面では、『今話したい』『少し整理してから話したい』のどちらが楽かを相手に伝えておくと誤解を減らせます。"},
 distance:{left:"気になることを共有して整理したいところがあるため、相手の反応が分からない状態が続くと確認したくなることがあります",right:"自分の時間やペースを守って整理したいところがあるため、すぐに話し合うよう求められると少し離れて考えたくなることがあります",middle:"相手と話す時間と一人で整える時間を、状況に応じて切り替えやすい傾向があります",use:"近い関係ほど、『話さない＝拒絶』ではなく、必要な距離の取り方が人によって違うことを前提にできます。"},
 change:{left:"先の流れや慣れた手順を確認したいところがあるため、急な変更ではまず状況を整理したくなることがあります",right:"新しい方法を試しながら進めやすいところがあるため、細かく決めすぎるより自由に試せるほうが動きやすいことがあります",middle:"見通しを持つことと試しながら変えることを、状況に応じて使い分けやすい傾向があります",use:"予定変更では、変更そのものより『理由・次の流れ』を共有するだけで受け入れやすくなる場合があります。"},
 communication:{left:"相手の気持ちや背景を受け止めてから進めたいところがあるため、解決策だけを急に出されると気持ちが追いつかないことがあります",right:"具体的な方法や次の一歩を決めて進めたいところがあるため、共感だけが続くと『で、どうすればいい？』となることがあります",middle:"共感と具体策のどちらを先に置くか、相手や状況に応じて調整しやすい傾向があります",use:"相談では『まず気持ちを聞いてほしい』『一緒に解決策を考えてほしい』など、最初に欲しいものを確認すると善意のズレを減らせます。"}
};
function directionText(key,score){return axisDirection(key,score).label}
function directionShort(key,score){return axisDirection(key,score).short}
function scoreTraitOverlap(scores, weights){
  const by=Object.fromEntries((scores||[]).map(x=>[x.key,Number(x.score)]));
  let total=0, used=0;
  Object.entries(weights).forEach(([key,w])=>{const v=by[key]; if(!Number.isFinite(v))return; total += (50-v)*w; used += 50*Math.abs(w);});
  if(!used)return 50;
  // weights are signed: negative means the lower end of an axis contributes more.
  return Math.max(0,Math.min(100,50 + (total/used)*50));
}
function overlapLevel(score){
  if(score>=70)return '比較的強く重なる';
  if(score>=58)return 'やや重なる';
  return '目立った重なりは少なめ';
}
function buildTraitOverlapCards(baseScores,deepScores){
  const base=baseScores||[]; const deep=deepScores||[];
  const allBy=Object.fromEntries([...base,...deep].map(x=>[x.key,Number(x.score)]));
  const get=k=>allBy[k];
  const asd=Math.max(0,Math.min(100,50 + (50-(get('language')??50))*.28 + (50-(get('thinking')??50))*.22 + (50-(get('change')??50))*.18 + ((get('communication')??50)-50)*.16 - ((get('process')??50)-50)*.16));
  const adhd=Math.max(0,Math.min(100,50 + ((get('thinking')??50)-50)*.24 + ((get('change')??50)-50)*.20 + ((get('process')??50)-50)*.28 + ((get('sensory')??50)-50)*.14));
  const hsp=Math.max(0,Math.min(100,50 + (50-(get('emotion')??50))*.22 + (50-(get('sensory')??50))*.38 + (50-(get('language')??50))*.12 + (50-(get('distance')??50))*.10));
  const defs=[
    {key:'asd',icon:'🧩',title:'具体性・見通しを好む傾向',score:asd,why:'曖昧さより具体性、理由や順序、予定変更後の見通しを重視する回答が重なると、この傾向が出やすくなります。'},
    {key:'adhd',icon:'⚡',title:'切り替え・動きながら進めやすい傾向',score:adhd,why:'可能性を広げる、変化に合わせる、まず動いて調整する、といった回答が重なると、この傾向が出やすくなります。'},
    {key:'hsp',icon:'🌿',title:'刺激や情報量に敏感な傾向',score:hsp,why:'音・人の多さ・情報量などの刺激を強く受け取り、いったん減らして整理したいという回答が重なると、この傾向が出やすくなります.'}
  ];
  return defs.map(d=>{const el=document.createElement('section');el.className='v36-attachment-card';el.innerHTML=`<div class="v36-asd-head">${d.icon} ${d.title}</div><div class="v36-asd-body"><p><b>${overlapLevel(d.score)}</b></p><p>${escapeHtml(d.why)}</p></div>`;return el;});
}
function buildAttachmentOverlapCard(scores){
  const by=Object.fromEntries((scores||[]).map(x=>[x.key,Number(x.score)]));
  const score=by.attach;
  if(!Number.isFinite(score))return null;
  let title,main;
  if(score<=35){
    title="🤝 つながりを確認したくなる傾向";
    main="相手の反応や関係の変化が気になると、つながりを確かめたくなりやすい傾向があります。";
  }else if(score>=65){
    title="🤝 一人で整理して距離を調整したくなる傾向";
    main="近い関係でも、自分の中で整理してから距離を調整したくなりやすい傾向があります。";
  }else{
    title="🤝 関係によって距離の取り方が変わりやすい傾向";
    main="つながりを確かめたい時と、一人で整理したい時の両方が、相手や状況によって出やすい傾向があります。";
  }
  const type=score<=35?'不安型':score>=65?'回避型':'安定型';
  const el=document.createElement('section');el.className='v36-attachment-card';
  el.innerHTML=`<div class="v36-asd-head">${title}</div><div class="v36-asd-body"><p><b>愛着パターン：${type}の特徴と重なる傾向</b></p><p>${escapeHtml(main)}</p><div class="v36-cause">愛着パターンの考え方では似た特徴が説明されることがありますが、これは愛着スタイルの診断ではありません。人や状況によって反応は変わります。</div></div>`;
  return el;
}
function traitNarrative(key,score){
  const m=AXIS_MEANINGS[key];
  if(score<=35)return {main:m.leftResult||m.left,use:m.use};
  if(score>=65)return {main:m.rightResult||m.right,use:m.use};
  return {main:m.middleResult||"状況や相手に応じて、複数の受け取り方・進め方を切り替えやすい",use:m.use};
}
function buildTraitSummary(scores,label){
  const sorted=[...scores].sort((a,b)=>Math.abs(b.score-50)-Math.abs(a.score-50));
  const focus=sorted.slice(0,3);
  if(!focus.length)return null;
  const sec=document.createElement('section');sec.className='v36-profile-card';
  sec.innerHTML=`<div class="v36-profile-head">🧩 ${escapeHtml(label)}はこういう傾向</div><div class="v36-profile-intro">このチェックは診断名をつけるものではなく、会話の中でどんな受け取り方・考え方・伝え方が自然になりやすいかを整理するためのものです。</div>`;
  focus.forEach(x=>{const a=AXES[x.key],n=traitNarrative(x.key,x.score),c=document.createElement('div');c.className='v36-trait';c.innerHTML=`<div class="v36-trait-title">${a.icon} ${a.label}</div><p class="v36-trait-main"><b>傾向：</b>${escapeHtml(n.main)}。</p><div class="v36-trait-use"><b>会話では：</b>${escapeHtml(n.use)}</div>`;sec.appendChild(c)});
  return sec;
}
function buildTraitOverlapData(baseScores,deepScores){
 const b=Object.fromEntries((baseScores||[]).map(x=>[x.key,Number(x.score)]));
 const d=Object.fromEntries((deepScores||[]).map(x=>[x.key,Number(x.score)]));
 const asd=Math.max(0,Math.min(100,50 + (50-(b.language??50))*.28 + (50-(b.thinking??50))*.22 + (50-(b.change??50))*.18 + ((b.communication??50)-50)*.16 - ((d.process??50)-50)*.16));
 const adhd=Math.max(0,Math.min(100,50 + ((b.thinking??50)-50)*.24 + ((b.change??50)-50)*.20 + ((d.process??50)-50)*.28 + ((d.sensory??50)-50)*.14));
 const hsp=Math.max(0,Math.min(100,50 + (50-(b.emotion??50))*.22 + (50-(d.sensory??50))*.38 + (50-(b.language??50))*.12 + (50-(b.distance??50))*.10));
 const a=Object.fromEntries((deepScores||[]).map(x=>[x.key,Number(x.score)]));
 const att=a.attach??50; const type=att<=35?'不安型':att>=65?'回避型':'安定型';
 return `・具体性・見通しを好む傾向：${overlapLevel(asd)}\n・切り替え・動きながら進めやすい傾向：${overlapLevel(adhd)}\n・刺激や情報量に敏感な傾向：${overlapLevel(hsp)}\n・愛着パターン：${type}の特徴と重なる傾向`;
}
function buildAiProfileText(scores,label,extraScores,free){
  const sorted=[...(scores||[])].sort((a,b)=>Math.abs(b.score-50)-Math.abs(a.score-50));
  const top=sorted.slice(0,4).map(x=>{const a=AXES[x.key],n=traitNarrative(x.key,x.score);return `・${a.label}: ${n.main}`}).join('\n');
  const deep=(extraScores||[]).filter(x=>DEEP_AXES[x.key]).sort((a,b)=>Math.abs(b.score-50)-Math.abs(a.score-50)).slice(0,3).map(x=>`・${DEEP_AXES[x.key].label}: ${deepNarrative(x.key,x.score).main}`).join('\n');
  const overlap=extraScores&&extraScores.length?buildTraitOverlapData(scores,extraScores):null;
  return `【特性チェック v46：${label}の会話プロフィール】
【基本18問】
${top}${deep?`

【深掘り18問】
${deep}`:''}${overlap?`

【補助的な特徴の整理】
${overlap}`:''}

この情報は会話解析の補助情報です。実際の発言内容やその時々の状況も含めて、ひとつの参考としてご覧ください。${free?`

【本人が追加したメモ】
${free.trim()}`:''}`;
}
function renderDiagResult(scores){
  diagResult.innerHTML='';
  const label=target==='my'?'あなた':'相手';
  const profile=buildTraitSummary(scores,label);
  if(profile)diagResult.appendChild(profile);
  const gentleNote=document.createElement('div');gentleNote.className='v77-gentle-note';gentleNote.textContent='「自分って、こういうところあるかも？」を見つけるための参考情報です。';diagResult.appendChild(gentleNote);
  const profileSection=document.createElement('section');profileSection.className='result-section analysis-section';
  profileSection.innerHTML='<div class="result-heading">📊 6つの傾向を確認</div><div style="padding:0 14px 4px"><p class="friendly-note">グラフは結果の位置関係を確認するための補助表示です。「右寄り・左寄り・中間」というラベルは表示しません。</p></div>';
  const box=document.createElement('div');box.className='result-card';
  scores.forEach(x=>{const a=AXES[x.key];const row=document.createElement('div');row.className='axis-result';row.innerHTML=`<div class="axis-head2"><span>${a.icon} ${a.label}</span></div><div class="axis-bar2"><span class="axis-dot2" style="left:${x.score}%"></span></div><div class="axis-labels2"><span>${a.left}</span><span>${a.right}</span></div>`;box.appendChild(row)});
  profileSection.appendChild(box);diagResult.appendChild(profileSection);
  const shareBox=document.createElement('div');addShareButton(shareBox,'CoreLingualの特性チェック結果',{kind:'diagnosis',version:7,target:target,targetLabel:label,scores:scores.map(x=>({key:x.key,score:x.score}))});diagResult.appendChild(shareBox);
  const applyBox=document.createElement('div');applyBox.className='v36-profile-apply';const applyBtn=document.createElement('button');applyBtn.type='button';applyBtn.textContent='🧩 この結果をプロフィールに反映する';applyBtn.onclick=()=>{applyDiagToProfile(target,scores);alert('特性チェックの結果をプロフィールに反映したよ！')};applyBox.appendChild(applyBtn);diagResult.appendChild(applyBox);
}

function renderSharedAnswers(container,profile,label){
  const baseScores=Array.isArray(profile?.scores)?profile.scores:[];
  const deepScores=Array.isArray(profile?.deepScores)?profile.deepScores:[];
  if(!baseScores.length && !deepScores.length)return;
  const sec=document.createElement('section');sec.className='v46-partner-result';
  sec.innerHTML=`<div class="v46-result-head">🧩 ${escapeHtml(label)}の特性チェック結果</div><div class="v46-result-note">回答そのものを並べるのではなく、36問から整理した「会話で出やすい傾向」を表示しています。</div>`;
  const overview=buildTraitSummary(baseScores,label);
  if(overview){
    overview.querySelectorAll('.v36-trait').forEach(t=>{
      const c=document.createElement('div');c.className='v46-result-trait';
      c.innerHTML=`<h4>${escapeHtml(t.querySelector('.v36-trait-title')?.textContent||'')}</h4><p>${escapeHtml((t.querySelector('.v36-trait-main')?.textContent||'').replace(/^傾向：/,''))}</p><div class="use">${escapeHtml(t.querySelector('.v36-trait-use')?.textContent||'')}</div>`;
      sec.appendChild(c);
    });
  }
  if(deepScores.length){
    const h=document.createElement('h4');h.className='v46-subhead';h.textContent='🔎 後半18問で見えた3つの方向';sec.appendChild(h);
    deepScores.forEach(x=>{const a=DEEP_AXES[x.key];if(!a)return;const n=deepNarrative(x.key,x.score);const c=document.createElement('div');c.className='v46-result-trait';c.innerHTML=`<h4>${escapeHtml(a.icon+' '+a.label)}</h4><p>${escapeHtml(n.main)}。</p><div class="use"><b>会話では：</b>${escapeHtml(n.use)}</div>`;sec.appendChild(c)});
    buildTraitOverlapCards(baseScores,deepScores).forEach(c=>sec.appendChild(c.cloneNode(true)));
    const attachment=buildAttachmentOverlapCard(deepScores);if(attachment)sec.appendChild(attachment.cloneNode(true));
  }
  container.appendChild(sec);
}
function sharedTraitsFromScores(scores){
  const id='partnerTraits';const selected=new Set();const map=profileTraitMap();
  (scores||[]).forEach(x=>{if(Number(x.score)<=35)(map[x.key]||[]).slice(0,1).forEach(t=>selected.add(t));if(Number(x.score)>=65)(map[x.key]||[]).slice(-1).forEach(t=>selected.add(t))});
  return [...selected];
}
function scoresFromInviteProfile(profile){
  if(!profile||typeof profile!=='object')return [];
  if(Array.isArray(profile.scores)&&profile.scores.length)return profile.scores;
  if(Array.isArray(profile.answers)&&profile.answers.length===Q.length){
    try{return axisScore(Q,profile.answers)}catch(e){console.warn(e)}
  }
  if(Array.isArray(profile.radar)&&profile.radar.length){
    const ids=(typeof CoreLingual_v36!=='undefined'&&CoreLingual_v36.axes)?CoreLingual_v36.axes.map(a=>a.id):Object.keys(AXES);
    return ids.map((id,i)=>({key:id,score:Math.max(0,Math.min(100,Number(profile.radar[i])||50))}));
  }
  return [];
}
function savePartnerSharedProfile(profile,targetName){
  if(!profile)return;
  const scores=scoresFromInviteProfile(profile);
  const deep=Array.isArray(profile.deepScores)?profile.deepScores:[];
  const answers=Array.isArray(profile.answers)?profile.answers:[];
  if(scores.length){
    localStorage.setItem('cl_diag_result_partner',JSON.stringify({scores,answers,updatedAt:Date.now()}));
    const radar=Array.isArray(profile.radar)&&profile.radar.length?profile.radar.map(v=>Math.max(0,Math.min(100,Number(v)||50))):axisValuesFromScores(scores);
    localStorage.setItem('cl_diag_radar_partner',JSON.stringify(radar));
  }
  if(deep.length){
    localStorage.setItem('cl_extra_result_partner',JSON.stringify({kind:'deep',scores:deep,answers:Array.isArray(profile.deepAnswers)?profile.deepAnswers:[],free:profile.free||profile.summary||'',updatedAt:Date.now()}));
    localStorage.setItem('cl_extra_radar_partner',JSON.stringify({deep}));
  }
  const summary=buildAiProfileText(scores,'相手',deep,profile.free||profile.summary||'');
  if(summary)localStorage.setItem('cl_diag_summary_partner',summary);

  const desired=String(targetName||'').trim()||'相手の回答';
  const active=activeProfile('partner');
  let target=desired || active || '相手の回答';
  if(target){
    let arr=list('partner');
    let idx=arr.findIndex(x=>x.name===target);
    if(idx<0){
      const traits=typeof sharedTraitsFromScores==='function'?sharedTraitsFromScores(scores):(Array.isArray(profile.traits)?profile.traits:[]);
      const st={traits,free:summary||profile.free||profile.summary||''};
      arr.push({name:target,state:st,scores:scores.map(x=>({key:x.key,score:Number(x.score)||50})),deepScores:deep.map(x=>({key:x.key,score:Number(x.score)||50})),updatedAt:Date.now()});
      localStorage.setItem('cl_partner',JSON.stringify(arr));
      setActiveProfile('partner',target);
      apply('partner',st);
      try{draw('partner')}catch(e){}
      renderTwoPersonComparison();
      return;
    }
    if(idx>=0){
      const traits=typeof sharedTraitsFromScores==='function'?sharedTraitsFromScores(scores):(Array.isArray(profile.traits)?profile.traits:[]);
      arr[idx]={...arr[idx],state:{traits,free:summary||profile.free||profile.summary||''},scores:scores.map(x=>({key:x.key,score:Number(x.score)||50})),deepScores:deep.map(x=>({key:x.key,score:Number(x.score)||50})),updatedAt:Date.now()};
      localStorage.setItem('cl_partner',JSON.stringify(arr));
      setActiveProfile('partner',target);
      apply('partner',arr[idx].state);
      draw('partner');
      renderTwoPersonComparison();
      return;
    }
  }
  try{ if(scores.length) applyDiagToProfile('partner',scores,deep); }catch(e){ console.warn('partner profile apply failed',e); }
  renderTwoPersonComparison();
}
function renderPartnerResultOnly(container,profile,label='相手'){
  container.innerHTML='';renderSharedAnswers(container,profile,label);
}
function deepDirectionText(key,score){
  const a=DEEP_AXES[key];
  if(score<=35)return a.left;
  if(score>=65)return a.right;
  return "場面・相手に応じて使い分けやすい";
}
