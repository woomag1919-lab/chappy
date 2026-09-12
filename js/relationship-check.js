/* CoreLingual — stable relationship-specific partner questionnaire entry point
 * Self check stays on the original universal questions.
 * Partner check uses the relationship selected on the partner profile.
 */
(function(){
  'use strict';

  const RELS={
    romantic:{label:'❤️ 恋人・パートナー'},
    friend:{label:'👫 友人関係'},
    work:{label:'💼 仕事関係'}
  };

  const BASE={
    romantic:[
      {q:'恋人と予定を決めるとき、先に日時や場所を具体的に決めておきたい',axis:'language',dir:-1},{q:'恋人の言葉は、その前後の流れや気持ちも含めて受け取りたい',axis:'language',dir:1},{q:'恋人から曖昧な返事をされると、何を意味しているのか確認したくなる',axis:'language',dir:-1},{q:'恋人との意見が違うとき、理由や経緯を整理してから納得したい',axis:'thinking',dir:-1},{q:'デートや休日の過ごし方を決めるとき、いくつかの案を考えるのが楽しい',axis:'thinking',dir:1},{q:'恋人とのことでは、説明よりも「なんとなくそう感じる」という感覚を大事にすることがある',axis:'thinking',dir:1},{q:'恋人との出来事で気持ちが動いたとき、話しながら整理するほうだ',axis:'emotion',dir:-1},{q:'恋人とぶつかった直後は、少し時間を置いてから話したい',axis:'emotion',dir:1},{q:'恋人に何が嫌だったのかを言葉で伝えると、自分の気持ちも整理しやすい',axis:'emotion',dir:-1},{q:'恋人との間で気になることがあると、その日のうちに話して確認したい',axis:'distance',dir:-1},{q:'恋人と仲が良くても、自分だけの時間は必要だ',axis:'distance',dir:1},{q:'恋人との関係で不安を感じたとき、早めに共有したほうが安心できる',axis:'distance',dir:-1},{q:'恋人との予定は、前もって流れが分かっているほうが安心する',axis:'change',dir:-1},{q:'恋人との休日は、その場の気分で予定を変えるのも楽しい',axis:'change',dir:1},{q:'デートの予定が急に変わると、まず変更後の流れを確認したくなる',axis:'change',dir:-1},{q:'恋人が悩みを話してきたら、まず気持ちを受け止めてあげたい',axis:'communication',dir:-1},{q:'恋人の悩みを聞くと、まず具体的な解決方法を考えたくなる',axis:'communication',dir:1},{q:'恋人と意見が違うときは、自分の考えを伝える前に相手の気持ちを理解したい',axis:'communication',dir:-1}
    ],
    friend:[
      {q:'友人と遊ぶ予定を決めるとき、集合時間や場所を具体的に決めておきたい',axis:'language',dir:-1},{q:'友人の言葉は、その場の雰囲気やこれまでの流れも含めて受け取りたい',axis:'language',dir:1},{q:'友人から曖昧な返事をされると、予定や意図を確認したくなる',axis:'language',dir:-1},{q:'友人と意見が違うとき、理由や経緯を整理してから判断したい',axis:'thinking',dir:-1},{q:'友人と出かけるとき、いくつかの候補を出しながら決めるのが楽しい',axis:'thinking',dir:1},{q:'友人とのやり取りでは、説明より「なんとなくこう思う」という感覚を大事にすることがある',axis:'thinking',dir:1},{q:'友人との出来事で気持ちが動いたとき、話しながら整理するほうだ',axis:'emotion',dir:-1},{q:'友人と気まずくなったとき、少し時間を置いてから話したい',axis:'emotion',dir:1},{q:'友人との出来事で何が嫌だったのかを言葉にすると、気持ちが整理しやすい',axis:'emotion',dir:-1},{q:'友人との間で気になることがあれば、その場で話して確認したい',axis:'distance',dir:-1},{q:'仲の良い友人でも、一人で過ごす時間は必要だ',axis:'distance',dir:1},{q:'友人関係で気になることは、早めに共有したほうが楽だと感じる',axis:'distance',dir:-1},{q:'友人との予定は、前もって流れが分かっているほうが安心する',axis:'change',dir:-1},{q:'友人との遊びは、その場の流れで予定を変えるのも楽しい',axis:'change',dir:1},{q:'友人との予定が急に変わると、まず変更後の流れを確認したくなる',axis:'change',dir:-1},{q:'友人が悩みを話してきたら、まず気持ちを受け止めたい',axis:'communication',dir:-1},{q:'友人の悩みを聞くと、まず具体的な解決方法を考えたくなる',axis:'communication',dir:1},{q:'友人と意見が違うときは、まず相手の気持ちや理由を理解してから返したい',axis:'communication',dir:-1}
    ],
    work:[
      {q:'仕事の依頼を受けるとき、期限や条件を具体的に確認しておきたい',axis:'language',dir:-1},{q:'仕事の指示は、前後の状況や目的も含めて理解したい',axis:'language',dir:1},{q:'仕事で曖昧な指示を受けると、まず具体的な内容を確認したくなる',axis:'language',dir:-1},{q:'仕事上の意見が違うとき、理由や根拠を整理してから判断したい',axis:'thinking',dir:-1},{q:'仕事の進め方を考えるとき、いくつかの方法を比較するのが楽しい',axis:'thinking',dir:1},{q:'仕事では、資料や説明だけでなく「なんとなくこうしたほうがよい」という感覚を判断材料にすることがある',axis:'thinking',dir:1},{q:'仕事で気持ちが引っかかったとき、誰かに話しながら整理するほうだ',axis:'emotion',dir:-1},{q:'仕事で感情的になったとき、少し時間を置いてから話したい',axis:'emotion',dir:1},{q:'仕事で何が気になったのかを言葉にすると、自分の考えを整理しやすい',axis:'emotion',dir:-1},{q:'仕事で気になることがあれば、その場で相手と話して確認したい',axis:'distance',dir:-1},{q:'仕事でも、一人で集中して考える時間は必要だ',axis:'distance',dir:1},{q:'仕事上の問題は、早めに共有したほうが進めやすいと感じる',axis:'distance',dir:-1},{q:'仕事の予定や手順は、前もって分かっているほうが安心する',axis:'change',dir:-1},{q:'仕事では、新しい方法を試しながら進めるのが好きだ',axis:'change',dir:1},{q:'仕事の予定が急に変わると、まず変更後の流れを確認したくなる',axis:'change',dir:-1},{q:'仕事で相談されたら、まず相手の状況や気持ちを受け止めたい',axis:'communication',dir:-1},{q:'仕事の相談を受けると、まず具体的な解決方法を考えたくなる',axis:'communication',dir:1},{q:'仕事で意見が違うときは、反論する前に相手の理由を理解したい',axis:'communication',dir:-1}
    ]
  };

  const DEEP={
    romantic:[
      ['恋人からの返事がいつもと違うと、何があったのか確かめたくなる','attach',-1],['恋人と少し気まずくなったとき、まず自分の中で整理してから話したい','attach',1],['恋人から返事がないと、状況を確認したくなることがある','attach',-1],['恋人とのやり取りで疲れたとき、一人の時間で回復しやすい','attach',1],['関係が不安定に感じると、恋人とのつながりを確かめたくなることがある','attach',-1],['恋人と近い関係でも、少し離れて考える時間があるほうが落ち着く','attach',1],['恋人との連絡が重なると、いったん通知や情報量を減らしたくなる','sensory',-1],['恋人との予定が重なっても、気持ちを切り替えながら対応できるほうだ','sensory',1],['恋人とのやり取りが続くと、静かな時間を取りたくなることがある','sensory',-1],['にぎやかな場所で恋人と過ごしても、そこまで疲れないことが多い','sensory',1],['恋人との会話と周囲の情報が重なると、いったん情報を減らしたくなる','sensory',-1],['刺激が多いデートでも、面白ければそのまま楽しめることが多い','sensory',1],['恋人との予定を立てるとき、順番や流れを決めておきたい','process',-1],['恋人との予定は、まずやってみて途中で決めるほうが楽なことがある','process',1],['恋人との予定が変わると、いったん整理してから続けたい','process',-1],['デートは最初から全部決めるより、動きながら決めるほうが楽しい','process',1],['休日に複数の予定があると、順番を決めてから動きたい','process',-1],['予定どおりでなくても、楽しく過ごせれば途中で変えて構わないと思う','process',1]
    ],
    friend:[
      ['友人の反応がいつもと違うと、何があったのか確かめたくなる','attach',-1],['友人とのやり取りで気になることがあっても、まず自分の中で整理してから話したい','attach',1],['仲の良い友人から返事がないと、状況を確認したくなることがある','attach',-1],['友人関係で疲れたとき、一人の時間で回復しやすい','attach',1],['友人関係が不安定に感じると、つながりを確かめたくなることがある','attach',-1],['仲の良い友人でも、少し離れて考える時間があるほうが落ち着く','attach',1],['友人との連絡や予定が重なると、いったん情報量を減らしたくなる','sensory',-1],['友人との予定が重なっても、切り替えながら対応できるほうだ','sensory',1],['友人とのやり取りが続くと、静かな時間を取りたくなることがある','sensory',-1],['人の多い場所で友人と過ごしても、そこまで疲れないことが多い','sensory',1],['友人との会話と周囲の情報が重なると、いったん情報を減らしたくなる','sensory',-1],['刺激が多い遊びでも、面白ければそのまま楽しめることが多い','sensory',1],['友人と出かけるとき、順番や流れを決めておきたい','process',-1],['友人との予定は、まず試して途中で決めるほうが楽なことがある','process',1],['友人との予定が変わると、いったん整理してから続けたい','process',-1],['遊びは最初から全部決めるより、動きながら決めるほうが楽しい','process',1],['複数の予定があると、順番を決めてから動きたい','process',-1],['予定どおりでなくても、楽しく過ごせれば途中で変えて構わないと思う','process',1]
    ],
    work:[
      ['仕事相手の反応がいつもと違うと、何があったのか確認したくなる','attach',-1],['仕事で気になることがあっても、まず自分の中で整理してから話したい','attach',1],['仕事の連絡への返事がないと、状況を確認したくなることがある','attach',-1],['仕事で疲れたとき、一人で集中する時間で回復しやすい','attach',1],['仕事上の関係が不安定に感じると、状況を確かめたくなることがある','attach',-1],['仕事でも、少し離れて考える時間があるほうが落ち着く','attach',1],['仕事の連絡や情報が重なると、いったん情報量を減らしたくなる','sensory',-1],['複数の仕事が同時に起きても、切り替えながら対応できるほうだ','sensory',1],['情報が続けて入ってくると、静かな時間を取りたくなることがある','sensory',-1],['人の多い職場や会議でも、そこまで気にならないことが多い','sensory',1],['仕事の会話と周囲の情報が重なると、いったん情報を減らしたくなる','sensory',-1],['刺激が多い状況でも、興味のある仕事ならそのまま集中できることが多い','sensory',1],['仕事を始める前に、手順や順番を決めておきたい','process',-1],['仕事は、まず試して途中で方法を変えるほうが楽なことがある','process',1],['途中で予定が変わると、いったん整理してから続けたい','process',-1],['最初から完璧な計画を作るより、動きながら調整するほうが楽だと感じる','process',1],['複数の仕事があると、優先順位や順番を決めてから取りかかりたい','process',-1],['予定どおりでなくても、結果が良ければ途中のやり方は変えて構わないと思う','process',1]
    ]
  };

  Object.keys(DEEP).forEach(k=>DEEP[k]=DEEP[k].map(x=>({q:x[0],axis:x[1],dir:x[2]})));

  function relationshipFor(name){
    try{const p=typeof list==='function'?list('partner').find(x=>x?.name===name):null;return p?.relationship||'romantic'}catch{return'romantic'}
  }
  function activeRelationship(){
    try{return relationshipFor(typeof activeProfile==='function'?activeProfile('partner'):null)}catch{return'romantic'}
  }
  function getQuestions(rel){return BASE[rel]||BASE.romantic}
  function getDeep(rel){return DEEP[rel]||DEEP.romantic}
  function escape(v){const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML}

  function renderBase(rel,restoreAnswers){
    const box=document.getElementById('questions');if(!box)return false;
    const qs=getQuestions(rel);box.innerHTML='';
    qs.forEach((q,i)=>box.insertAdjacentHTML('beforeend',`<div class="q"><b>${i+1}. ${escape(q.q)}</b><div class="scale">${[1,2,3,4,5].map(v=>`<label><input type="radio" name="q${i}" value="${v}">${v}</label>`).join('')}</div><div class="scale"><span>あまり当てはまらない</span><span>かなり当てはまる</span></div></div>`));
    if(Array.isArray(restoreAnswers))restoreAnswers.forEach((v,i)=>{const x=box.querySelector(`input[name="q${i}"][value="${String(v)}"]`);if(x)x.checked=true});
    const note=document.getElementById('targetNote');
    if(note&&rel)note.textContent=`相手は「${RELS[rel]?.label?.replace(/^\S+\s/,'')||'今回の関係'}」としてチェックします。実際の関係で起こりやすい場面を中心に見ます。`;
    return true;
  }

  function customScore(qs,answers){
    const out={};
    Object.keys(AXES).forEach(k=>{
      let total=0,count=0;
      qs.forEach((q,i)=>{if(q.axis!==k)return;const v=Number(answers[i]);if(!Number.isFinite(v))return;total+=(v-3)*q.dir;count++});
      out[k]=count?Math.max(0,Math.min(100,50+(total/count)*25)):50;
    });
    return Object.entries(out).map(([key,score])=>({key,score}));
  }

  function restoreBaseForPartner(rel){
    let a=[];
    try{
      const p=typeof activeProfile==='function'?activeProfile('partner'):null;
      const prof=p&&typeof list==='function'?list('partner').find(x=>x.name===p):null;
      a=Array.isArray(prof?.answers)?prof.answers:[];
    }catch{}
    return renderBase(rel,a);
  }

  function installPartnerBase(){
    const btn=document.getElementById('runDiag');if(!btn||btn.__v147)return false;
    btn.__v147=true;
    btn.addEventListener('click',function(ev){
      let isPartner=false;try{isPartner=typeof target!=='undefined'&&target==='partner'}catch{}
      if(!isPartner)return;
      ev.stopImmediatePropagation();
      const rel=activeRelationship(),qs=getQuestions(rel),answers=[];
      for(let i=0;i<qs.length;i++){const x=document.querySelector(`input[name="q${i}"]:checked`);if(!x){alert('前半18問すべてに回答してください。1〜5で選んでね。');return}answers.push(Number(x.value))}
      const scores=customScore(qs,answers);diagAnswers=answers;diagScores=scores;
      localStorage.setItem('cl_diag_radar_partner',JSON.stringify(axisValuesFromScores(scores)));
      localStorage.setItem('cl_diag_result_partner',JSON.stringify({scores,answers,relationship:rel,updatedAt:Date.now()}));
      renderDiagResult(scores);applyDiagToProfile('partner',scores);
      const more=document.getElementById('moreDiag');if(more)more.style.display='block';
      try{const n=typeof activeProfile==='function'?activeProfile('partner'):null;if(n&&typeof list==='function'){const arr=list('partner'),idx=arr.findIndex(x=>x.name===n);if(idx>=0){arr[idx]={...arr[idx],answers,scores,relationship:rel,updatedAt:Date.now()};localStorage.setItem('cl_partner',JSON.stringify(arr))}}}catch(e){console.warn(e)}
      renderTwoPersonComparison();
    },true);
    return true;
  }

  function installOpenHooks(){
    const btn=document.getElementById('v72OpenDiag');if(!btn||btn.__v147Open)return false;btn.__v147Open=true;
    btn.addEventListener('click',()=>setTimeout(()=>{let isPartner=false;try{isPartner=target==='partner'}catch{};if(isPartner)renderBase(activeRelationship(),[]);},120),true);
    return true;
  }

  window.CoreLingualRelationshipCheck={relationships:RELS,base:getQuestions,deep:getDeep,active:activeRelationship,renderBase,customScore};

  function install(){installPartnerBase();installOpenHooks();return !!document.getElementById('questions')}
  if(!install()){let tries=0;const t=setInterval(()=>{if(install()||++tries>=120)clearInterval(t)},100)}
})();
