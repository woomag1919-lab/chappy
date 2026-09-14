/* CoreLingual v108 — shared questionnaire / axis data */
/* v147 — prevent the original two-person setup from flashing before v146 finishes */
(function(){
  const shell=document.getElementById('v72Shell');
  if(!shell || shell.dataset.v146Installed==='1')return;
  shell.style.visibility='hidden';
  const reveal=()=>{
    if(shell.dataset.v146Installed==='1'){
      shell.style.visibility='';
      observer.disconnect();
      return true;
    }
    return false;
  };
  const observer=new MutationObserver(reveal);
  observer.observe(shell,{attributes:true,attributeFilter:['data-v146-installed']});
  setTimeout(()=>{
    observer.disconnect();
    if(shell.dataset.v146Installed!=='1')shell.style.visibility='';
  },5000);
})();

const AXES={
 language:{label:"情報の受け取り方",left:"言葉を具体的に確認",right:"文脈や全体像から理解",icon:"🗣️"},
 thinking:{label:"考え方",left:"整理・根拠から考える",right:"直感・可能性から考える",icon:"🧠"},
 emotion:{label:"感情の扱い方",left:"言葉にして整理",right:"時間を置いて整理",icon:"💭"},
 distance:{label:"人との距離感",left:"その場で共有・相談",right:"自分の時間を確保",icon:"🤝"},
 change:{label:"変化への対応",left:"見通し・慣れを重視",right:"新しい方法を試しやすい",icon:"🔄"},
 communication:{label:"伝え方・受け止め方",left:"共感・気持ちを重視",right:"具体策・結論を重視",icon:"💬"}
};

const Q=[
 {q:"説明を聞くとき、具体的な例や条件があると理解しやすい",axis:"language",dir:-1},
 {q:"話の意味を考えるとき、前後の流れや状況を含めて受け取りたい",axis:"language",dir:1},
 {q:"曖昧な表現があると、まず言葉の意味を確認したくなる",axis:"language",dir:-1},
 {q:"何かを決めるとき、理由や根拠を整理してから判断したい",axis:"thinking",dir:-1},
 {q:"一つの答えを決める前に、いくつかの可能性を思い浮かべる",axis:"thinking",dir:1},
 {q:"『なんとなくこうだ』という感覚が、判断のきっかけになることがある",axis:"thinking",dir:1},
 {q:"自分の気持ちは、言葉にすると整理しやすいほうだ",axis:"emotion",dir:-1},
 {q:"感情が強くなったとき、いったん時間を置いてから考えたい",axis:"emotion",dir:1},
 {q:"何が嫌だったのか、何が嬉しかったのかを言葉にすると分かりやすい",axis:"emotion",dir:-1},
 {q:"気になることがあれば、その場で相手と話して確認したい",axis:"distance",dir:-1},
 {q:"親しい相手でも、一人で過ごす時間は必要だ",axis:"distance",dir:1},
 {q:"関係の中で気になることは、早めに共有したほうが楽だと感じる",axis:"distance",dir:-1},
 {q:"予定や手順が前もって分かっていると、安心して取り組みやすい",axis:"change",dir:-1},
 {q:"新しいやり方を試してみることに、あまり抵抗を感じない",axis:"change",dir:1},
 {q:"急な予定変更があると、まず変更後の流れを確認したくなる",axis:"change",dir:-1},
 {q:"誰かに相談されたとき、まず『それは大変だったね』と気持ちを受け止めたい",axis:"communication",dir:-1},
 {q:"相談を受けると、まず具体的な解決方法を考えたくなる",axis:"communication",dir:1},
 {q:"意見が違っても、まず相手の気持ちや理由を理解してから返したい",axis:"communication",dir:-1}
];

const DEEP_AXES={
 attach:{label:"近づき方・距離の取り方",icon:"🫂",left:"気になると相手とのつながりを確かめたくなりやすい",right:"自分の中で整理してから距離を調整しやすい"},
 sensory:{label:"刺激への反応",icon:"🌿",left:"情報量や刺激が重なると、いったん減らして整理したくなりやすい",right:"刺激や変化があっても、その場で切り替えながら対応しやすい"},
 process:{label:"進め方・柔軟性",icon:"🧭",left:"順番や見通しを整えてから進めたい",right:"まず動いて、途中で調整しながら進めたい"}
};

const Q_DEEP=[
 {q:"相手の反応がいつもと違うと、何があったのか確かめたくなる",axis:"attach",dir:-1},
 {q:"気になることがあっても、まず自分の中で整理してから相手に話したい",axis:"attach",dir:1},
 {q:"親しい相手から返事がないと、状況を確認したくなることがある",axis:"attach",dir:-1},
 {q:"人間関係で疲れたときは、誰かと話すより一人の時間で回復しやすい",axis:"attach",dir:1},
 {q:"関係が不安定に感じると、相手との距離を近づけて安心したくなることがある",axis:"attach",dir:-1},
 {q:"近い関係でも、少し離れて考える時間があるほうが落ち着くことがある",axis:"attach",dir:1},
 {q:"周りの音や情報が多い場所では、集中しにくくなることがある",axis:"sensory",dir:-1},
 {q:"いくつかのことが同時に起きても、気持ちを切り替えながら対応できるほうだ",axis:"sensory",dir:1},
 {q:"予定外の刺激が続くと、静かな時間を取りたくなることがある",axis:"sensory",dir:-1},
 {q:"人が多い場所やにぎやかな場面でも、そこまで気にならないことが多い",axis:"sensory",dir:1},
 {q:"相手の言葉や周囲の変化が重なると、いったん情報を減らしたくなる",axis:"sensory",dir:-1},
 {q:"刺激が多い状況でも、面白ければそのまま楽しめることが多い",axis:"sensory",dir:1},
 {q:"何かを始める前に、手順や順番を決めておきたい",axis:"process",dir:-1},
 {q:"まず試してみて、やりながら方法を変えるほうが楽なことがある",axis:"process",dir:1},
 {q:"途中で予定が変わると、いったん整理してから続けたい",axis:"process",dir:-1},
 {q:"最初から完璧な計画を作るより、動きながら決めるほうが早いと感じる",axis:"process",dir:1},
 {q:"複数の作業があると、優先順位や順番を決めてから取りかかりたい",axis:"process",dir:-1},
 {q:"予定どおりでなくても、結果が良ければ途中のやり方は変えて構わないと思う",axis:"process",dir:1}
];

const RELATION_TYPES={
 romantic:{label:"恋人・パートナー"},
 friend:{label:"友人関係"},
 work:{label:"仕事関係"}
};

const RELATION_Q={
 romantic:[
  {q:"相手からの言葉や態度に、好意や大切にされている感覚があると安心しやすい",axis:"emotion",dir:-1},
  {q:"親しい相手とは、気持ちを言葉にして共有する時間を大切にしたい",axis:"communication",dir:-1},
  {q:"相手のちょっとした変化から、気持ちや関係の変化を考えることがある",axis:"distance",dir:-1},
  {q:"予定や約束を決めるとき、二人の時間をどう過ごすか具体的に決めたい",axis:"change",dir:-1},
  {q:"意見がぶつかったとき、まずお互いの気持ちを確認してから解決したい",axis:"communication",dir:-1},
  {q:"相手と意見が違っても、すぐ結論を出さず少し時間を置ける",axis:"emotion",dir:1},
  {q:"返信や連絡の間隔が変わると、何かあったのか気になりやすい",axis:"distance",dir:-1},
  {q:"近い関係でも、お互いに一人で過ごす時間が必要だと思う",axis:"distance",dir:1},
  {q:"将来の予定について、ある程度見通しがあると安心しやすい",axis:"change",dir:-1},
  {q:"『分かってくれるはず』より、気持ちは言葉にして伝えたほうが伝わると思う",axis:"language",dir:-1},
  {q:"相手が落ち込んでいるときは、解決策より先に気持ちを受け止めたい",axis:"communication",dir:-1},
  {q:"二人の間で決めたことは、できるだけ同じように守りたい",axis:"change",dir:-1},
  {q:"相手の言葉だけでなく、表情や雰囲気から意図を読み取ることがある",axis:"language",dir:1},
  {q:"不満があっても、相手を責めるより自分がどう感じたかを伝えたい",axis:"emotion",dir:-1},
  {q:"関係がぎくしゃくしたときは、早めに話して元に戻したい",axis:"distance",dir:-1},
  {q:"相手のやり方が自分と違っても、二人に合う方法を探せばいいと思う",axis:"thinking",dir:1},
  {q:"大事な話では、結論だけでなく『なぜそう思ったか』も共有したい",axis:"thinking",dir:-1},
  {q:"親しい関係ほど、安心して本音を言える雰囲気が大切だと思う",axis:"communication",dir:-1}
 ],
 friend:[
  {q:"友人から相談されたとき、まず話を最後まで聞いてから返したい",axis:"communication",dir:-1},
  {q:"友人との予定は、細かく決めすぎずその場で調整するほうが楽だ",axis:"change",dir:1},
  {q:"しばらく連絡がなくても、相手には相手の都合があると思える",axis:"distance",dir:1},
  {q:"友人との間で気になることがあれば、できるだけ早めに伝えたい",axis:"distance",dir:-1},
  {q:"冗談や軽い言い方でも、前後の流れから意味を受け取ることが多い",axis:"language",dir:1},
  {q:"友人と意見が違ったときも、理由を聞けば納得できることが多い",axis:"thinking",dir:-1},
  {q:"一緒にいるときは楽しくても、別々に過ごす時間も自然だと思う",axis:"distance",dir:1},
  {q:"友人から急に予定を変えられると、次の予定を確認したくなる",axis:"change",dir:-1},
  {q:"困っている友人には、共感だけでなく具体的な手助けもしたい",axis:"communication",dir:1},
  {q:"友人の言葉の裏にある気持ちを考えることがある",axis:"language",dir:1},
  {q:"自分の気持ちをうまく説明できないとき、少し時間を置いてもいいと思う",axis:"emotion",dir:1},
  {q:"友人関係では、無理に合わせずお互いのペースを尊重したい",axis:"distance",dir:1},
  {q:"遊びや予定は、前もって大まかに決まっていると動きやすい",axis:"change",dir:-1},
  {q:"友人から意見を求められたら、自分の考えを率直に伝えたい",axis:"communication",dir:1},
  {q:"相手の考えを聞く前に、自分の中でいくつかの可能性を考えることがある",axis:"thinking",dir:1},
  {q:"友人に嫌なことをされたときは、何が嫌だったかを具体的に伝えたい",axis:"language",dir:-1},
  {q:"長く付き合っている友人なら、少し連絡が減っても関係は変わらないと思う",axis:"distance",dir:1},
  {q:"楽しい話でも、相手の気持ちが置いていかれないようにしたい",axis:"communication",dir:-1}
 ],
 work:[
  {q:"仕事の話では、担当・期限・条件が具体的に分かっていると進めやすい",axis:"language",dir:-1},
  {q:"指示の背景や目的まで分かると、状況に合わせて動きやすい",axis:"language",dir:1},
  {q:"判断するときは、経験だけでなく理由や根拠も確認したい",axis:"thinking",dir:-1},
  {q:"仕事では、一つに決める前に複数の案を考えておきたい",axis:"thinking",dir:1},
  {q:"忙しいときほど、優先順位を整理してから取りかかりたい",axis:"change",dir:-1},
  {q:"予定変更があっても、目的が分かればその場で方法を変えられる",axis:"change",dir:1},
  {q:"指摘を受けたとき、まず何を直せばよいか具体的に知りたい",axis:"communication",dir:1},
  {q:"仕事で意見がぶつかったとき、相手の意図を確認してから返したい",axis:"communication",dir:-1},
  {q:"仕事上の連絡が遅れていると、進み具合を確認したくなる",axis:"distance",dir:-1},
  {q:"必要な連絡が済んでいれば、細かく確認されなくても自分のペースで進めたい",axis:"distance",dir:1},
  {q:"ミスを指摘されたときは、感情より先に事実を整理すると対応しやすい",axis:"emotion",dir:1},
  {q:"仕事で負担が重なったときは、誰かに話して整理したいことがある",axis:"emotion",dir:-1},
  {q:"急な依頼でも、目的と期限が分かれば対応しやすい",axis:"change",dir:1},
  {q:"曖昧な指示のまま進めるより、最初に確認しておきたい",axis:"language",dir:-1},
  {q:"相手の立場を考えると、同じ内容でも伝え方を変える必要があると思う",axis:"communication",dir:-1},
  {q:"仕事のやり方は、結果が良くなるなら途中で変えても構わないと思う",axis:"change",dir:1},
  {q:"自分と違う意見でも、根拠が分かれば受け入れやすい",axis:"thinking",dir:-1},
  {q:"必要な距離を保ちながら、困ったときは相談し合える関係が理想だ",axis:"distance",dir:1}
 ]
};

const RELATION_BASE_Q=Q.slice();
function getProfileRelation(name){
  if(!name)return 'friend';
  try{return localStorage.getItem('cl_relation_partner_'+encodeURIComponent(name))||'friend'}catch{return 'friend'}
}
function getDiagnosisQuestions(which){
  if(which!=='partner')return RELATION_BASE_Q;
  const name=typeof activeProfile==='function'?activeProfile('partner'):null;
  const key=getProfileRelation(name);
  return RELATION_Q[key]||RELATION_Q.friend;
}
function relationLabel(key){return RELATION_TYPES[key]?.label||RELATION_TYPES.friend.label}

function renderRelationshipQuestions(which){
  const qs=document.getElementById('questions');
  if(!qs)return;
  const set=getDiagnosisQuestions(which);
  Q.splice(0,Q.length,...set);
  qs.innerHTML='';
  set.forEach((q,i)=>qs.insertAdjacentHTML('beforeend',`<div class="q"><b>${i+1}. ${q.q}</b><div class="scale">${[1,2,3,4,5].map(v=>`<label><input type="radio" name="q${i}" value="${v}">${v}</label>`).join('')}</div><div class="scale"><span>あまり当てはまらない</span><span>かなり当てはまる</span></div></div>`));
}

(function installRelationshipUi(){
  const setup=()=>{
    const input=document.getElementById('partnerName');
    if(!input)return;
    let select=document.getElementById('partnerRelation');
    if(!select){
      const wrap=document.createElement('div');
      wrap.className='v36-relation-field';
      wrap.innerHTML='<label class="small" for="partnerRelation">この相手との関係</label><select id="partnerRelation"><option value="romantic">恋人・パートナー</option><option value="friend">友人関係</option><option value="work">仕事関係</option></select>';
      input.parentNode.insertBefore(wrap,input.nextSibling?.nextSibling||input.nextSibling);
      select=wrap.querySelector('select');
    }
    const sync=()=>{
      const name=input.value.trim();
      let key='friend';
      try{key=getProfileRelation(name)}catch{}
      select.value=RELATION_TYPES[key]?key:'friend';
    };
    sync();
    if(!input.dataset.relationSyncBound){input.dataset.relationSyncBound='1';input.addEventListener('input',sync)}
    if(!select.dataset.relationBound){
      select.dataset.relationBound='1';
      select.addEventListener('change',()=>{
        const name=input.value.trim();
        if(name)try{localStorage.setItem('cl_relation_partner_'+encodeURIComponent(name),select.value)}catch{}
      });
    }
    if(!document.body.dataset.relationObserver){
      document.body.dataset.relationObserver='1';
      new MutationObserver(()=>{
        const overlay=document.getElementById('v72ProfileOverlay');
        if(overlay?.classList.contains('show'))sync();
      }).observe(document.getElementById('v72ProfileOverlay'),{attributes:true,attributeFilter:['class']});
    }
  };
  setup();
  window.addEventListener('load',setup,{once:true});

  document.addEventListener('click',e=>{
    const saveBtn=e.target?.closest?.('#savePartner');
    if(saveBtn){
      const name=document.getElementById('partnerName')?.value.trim();
      const rel=document.getElementById('partnerRelation')?.value||'friend';
      if(name)try{localStorage.setItem('cl_relation_partner_'+encodeURIComponent(name),rel)}catch{}
    }
  },true);

  document.addEventListener('click',e=>{
    const open=e.target?.closest?.('#v72OpenDiag,#selfDiag,#otherDiag');
    if(!open)return;
    const which=open.id==='otherDiag'?'partner':(open.id==='selfDiag'?'my':((typeof pickerWhich!=='undefined')?pickerWhich:'my'));
    renderRelationshipQuestions(which);
    setTimeout(()=>{
      try{if(typeof restoreDiagAnswers==='function')restoreDiagAnswers(which)}catch(err){console.warn('relationship diagnosis restore failed',err)}
    },0);
  },true);

  window.addEventListener('load',()=>renderRelationshipQuestions('my'),{once:true});
})();
