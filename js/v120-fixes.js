/* CoreLingual v120 — comparison differences made visible */
(function(){
  'use strict';

  const BASE_AXES=['情報の受け取り方','考え方','感情の扱い方','人との距離感','変化への対応','伝え方・受け止め方'];
  const DEEP_KEY={
    '近づき方・距離の取り方':'attach','刺激への反応':'sensory','進め方・柔軟性':'process'
  };
  const AXIS_KEY={
    '情報の受け取り方':'language','考え方':'thinking','感情の扱い方':'emotion','人との距離感':'distance','変化への対応':'change','伝え方・受け止め方':'communication',
    '近づき方・距離の取り方':'attach','刺激への反応':'sensory','進め方・柔軟性':'process'
  };
  const LABELS={
    language:{left:'言葉ではっきり',right:'流れから受け取る',middle:'言葉と流れを使い分け'},
    thinking:{left:'筋道を整理',right:'ひらめきを広げる',middle:'整理と発想を行き来'},
    emotion:{left:'話して整理',right:'時間を置いて整理',middle:'話す・考えるを使い分け'},
    distance:{left:'一緒に整理',right:'ひとりで整理',middle:'状況に合わせて距離調整'},
    change:{left:'見通してから',right:'動きながら',middle:'見通しと柔軟さを両立'},
    communication:{left:'まず気持ち',right:'まず具体策',middle:'気持ちと具体策を両方見る'},
    attach:{left:'つながりを確認',right:'自分で整理してから',middle:'近さと距離を調整'},
    sensory:{left:'刺激を減らして整理',right:'その場で切り替える',middle:'刺激量で切り替える'},
    process:{left:'順番を整えてから',right:'まず動いて調整',middle:'計画と柔軟さを使い分け'}
  };
  const NUANCE={
    language:{low:'やや言葉寄り',high:'やや流れ寄り'},thinking:{low:'やや整理寄り',high:'やや発想寄り'},emotion:{low:'やや話す寄り',high:'やや時間を置く寄り'},distance:{low:'やや共有寄り',high:'やや一人の時間寄り'},change:{low:'やや見通し寄り',high:'やや柔軟寄り'},communication:{low:'やや気持ち寄り',high:'やや具体策寄り'},attach:{low:'ややつながり寄り',high:'やや距離寄り'},sensory:{low:'やや刺激を減らす寄り',high:'やや切り替える寄り'},process:{low:'やや順番寄り',high:'やや柔軟寄り'}
  };
  const ADVICE={
    language:{left:'要点を短く区切って伝えると、行き違いを減らしやすい。',right:'話の最後に、認識が合っているか一度確かめる。',middle:'大事な点だけ、短く確認しておくと行き違いを防ぎやすい。',same:'2人とも言葉と流れの両方を使えるので、場面に合わせて確認の仕方を選ぶと進めやすい。'},
    thinking:{left:'まず目的をそろえてから、具体的な案を出していく。',right:'いくつかの案を広げたあと、最後に選択肢を絞り込む。',middle:'目的を共有したうえで、考えを広げたり整理したりすると進めやすい。',same:'2人とも整理と発想を行き来しやすいので、ゴールだけ共有して自由に考える時間を残すとよい。'},
    emotion:{left:'気持ちを受け止めてほしい時は、最初にそう伝えておく。',right:'少し考える時間がほしい時は、あとで話すことを先に知らせる。',middle:'話すか少し置くか、その時の気持ちに合わせてペースを決める。',same:'2人とも話す・考えるを使い分けやすいので、その場で無理に結論を急がないことが大切。'},
    distance:{left:'今話したい理由を添えると、相手も意図をつかみやすい。',right:'距離を置く時は、いつ頃また話すかを伝えておく。',middle:'今の距離感に合わせて、話すタイミングを調整する。',same:'2人とも状況に合わせて距離を調整しやすいので、今どのくらい話したいかを共有しておくと楽。'},
    change:{left:'予定が変わる時は、早めに知らせて心の準備をしてもらう。',right:'変える部分と変えない部分を分けて伝えると進めやすい。',middle:'見通しを持ちながら、必要なところだけ柔軟に変えていく。',same:'2人とも見通しと柔軟さを使えるので、変更点だけ先に共有しておくと動きやすい。'},
    communication:{left:'「まず聞いてほしい」と伝えてから、気持ちを話す。',right:'解決策を出す前に、相手の話を受け止める時間をつくる。',middle:'気持ちと具体策のどちらを先に扱うか、場面に合わせて決める。',same:'2人とも気持ちと具体策を使い分けやすいので、今は聞くのか考えるのかを最初にそろえるとよい。'},
    attach:{left:'確認したいことを一つに絞ると、安心につながりやすい。',right:'少し距離を置く時は、また話せるタイミングを伝えておく。',middle:'近づきたい時も距離を置きたい時も、タイミングを言葉にしておく。',same:'2人とも近さと距離を調整しやすいので、つながる・離れるの合図を曖昧にしないと安心しやすい。'},
    sensory:{left:'情報が重なった時は、いったん話す量を減らして整理する。',right:'相手の余裕を見ながら、その場で扱う情報量を調整する。',middle:'その時の余裕に合わせて、受け取る情報量を加減する。',same:'2人とも刺激量に合わせて切り替えやすいので、情報が多い時は一度整理してから続けるとよい。'},
    process:{left:'最初に「次はこれ」と一つ決めてから進めると安心しやすい。',right:'まず小さく動いてみて、途中でやり方を整えていく。',middle:'大まかな段取りを持ちつつ、途中で必要なら調整する。',same:'2人とも計画と柔軟さを使い分けやすいので、最初は大枠だけ決めて細部は途中で調整すると進めやすい。'}
  };

  function side(score){const n=Number(score);return n<=35?'left':n>=65?'right':'middle'}
  function label(key,score){
    const s=side(score),n=Number(score),dict=LABELS[key]||{};
    if(s!=='middle')return dict[s]||'場面に応じて使い分け';
    if(n<=47&&NUANCE[key])return NUANCE[key].low;
    if(n>=53&&NUANCE[key])return NUANCE[key].high;
    return dict.middle||'場面に応じて使い分け';
  }
  function getRows(data){
    const my=data?.my?.scores||[],pa=data?.partner?.scores||[];
    const bm=Object.fromEntries(my.map(x=>[x.key,Number(x.score)])),bp=Object.fromEntries(pa.map(x=>[x.key,Number(x.score)]));
    const rows=BASE_AXES.map(axis=>{const key=AXIS_KEY[axis];return {key,axis,type:'base',my:bm[key]??50,partner:bp[key]??50}});
    const md=data?.my?.deep||[],pd=data?.partner?.deep||[];
    if(md.length&&pd.length){
      const dm=Object.fromEntries(md.map(x=>[x.key,Number(x.score)])),dp=Object.fromEntries(pd.map(x=>[x.key,Number(x.score)]));
      Object.keys(DEEP_KEY).forEach(axis=>{const key=DEEP_KEY[axis];if(dm[key]!=null&&dp[key]!=null)rows.push({key,axis,type:'deep',my:dm[key],partner:dp[key]})});
    }
    return rows.map(r=>({...r,diff:Math.abs(r.my-r.partner),myLabel:label(r.key,r.my),partnerLabel:label(r.key,r.partner)}));
  }

  function refreshTop(){
    try{
      const card=document.getElementById('v21CompareCard');if(!card)return false;
      const data=window.getActiveCompareData?.();if(!data?.my||!data?.partner)return false;
      const box=card.querySelector('.v82-top3');if(!box)return false;
      const rows=getRows(data).sort((a,b)=>b.diff-a.diff);
      // TOP欄は「差がある」だけでなく、画面上でも左右の違いが見える項目だけを選ぶ。
      const candidates=rows.filter(r=>r.diff>=8&&r.myLabel!==r.partnerLabel).slice(0,3);
      box.innerHTML='';
      if(!candidates.length){box.innerHTML='<div class="v82-similar">大きな差は少なめ。似た入口から会話を進めやすい2人です。</div>';return true}
      candidates.forEach((r,i)=>{
        const el=document.createElement('div');el.className='v82-top-item';
        const icon=(r.type==='base'&&typeof AXES!=='undefined'&&AXES[r.key]?.icon)||(r.type==='deep'&&typeof DEEP_AXES!=='undefined'&&DEEP_AXES[r.key]?.icon)||'';
        el.innerHTML='<div class="v82-top-num">0'+(i+1)+'</div><div class="v82-top-main"><div class="v82-top-axis">'+icon+' '+(typeof escapeHtml==='function'?escapeHtml(r.axis):r.axis)+'</div><div class="v82-top-contrast"><b>'+ (typeof escapeHtml==='function'?escapeHtml(r.myLabel):r.myLabel) +'</b><span>×</span><b>'+ (typeof escapeHtml==='function'?escapeHtml(r.partnerLabel):r.partnerLabel) +'</b></div></div>';
        box.appendChild(el);
      });
      return true;
    }catch(e){console.warn('v120 top comparison refresh failed',e);return false}
  }

  function refreshAdvice(){
    try{
      const card=document.getElementById('v21CompareCard');if(!card)return false;
      const data=window.getActiveCompareData?.();if(!data?.my||!data?.partner)return false;
      const rows=getRows(data),byKey=Object.fromEntries(rows.map(r=>[r.key,r]));
      card.querySelectorAll('.v82-advice-item').forEach(item=>{
        const axis=(item.querySelector('b')?.textContent||'').replace(/^[^ぁ-んァ-ン一-龥A-Za-z0-9]+/,'').trim(),key=AXIS_KEY[axis],r=byKey[key];if(!r)return;
        const dict=ADVICE[key]||{},a=side(r.my),b=side(r.partner),ps=item.querySelectorAll('p');if(!ps.length)return;
        if(a===b){ps[0].textContent=dict.same||dict[a]||'';if(ps[1])ps[1].textContent='';}
        else{ps[0].textContent=dict[a]||dict.middle||'';if(ps[1])ps[1].textContent=dict[b]||dict.middle||'';}
        item.style.display='';
      });
      return true;
    }catch(e){console.warn('v120 advice refresh failed',e);return false}
  }

  function refresh(){const a=refreshTop();refreshAdvice();return a}
  let tries=0;
  const timer=setInterval(()=>{if(refresh()||++tries>=120)clearInterval(timer)},100);
  window.addEventListener('load',()=>{refresh();setTimeout(refresh,300);setTimeout(refresh,1000);setTimeout(refresh,2000)});
  const card=document.getElementById('v21CompareCard');
  if(card)new MutationObserver(()=>refresh()).observe(card,{subtree:true,childList:true});
})();
