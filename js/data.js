/* CoreLingual v108 — shared questionnaire / axis data */
/* v147 — prevent the original two-person setup from flashing before v146 finishes */
(function(){
  const revealWhenReady=()=>{
    const shell=document.getElementById('v72Shell');
    if(!shell)return;
    if(shell.dataset.v146Installed==='1'){
      shell.style.visibility='';
      return true;
    }
    shell.style.visibility='hidden';
    return false;
  };
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{
      if(revealWhenReady())return;
      const shell=document.getElementById('v72Shell');
      if(!shell)return;
      const observer=new MutationObserver(()=>{
        if(revealWhenReady())observer.disconnect();
      });
      observer.observe(shell,{attributes:true,attributeFilter:['data-v146-installed']});
      setTimeout(()=>{observer.disconnect();revealWhenReady();},5000);
    },{once:true});
  }else{
    revealWhenReady();
  }
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
