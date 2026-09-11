/* CoreLingual v120.3 — comparison difference/advice fix */
(function(){
  'use strict';
  const BASE_AXES=['情報の受け取り方','考え方','感情の扱い方','人との距離感','変化への対応','伝え方・受け止め方'];
  const DEEP_AXES=['近づき方・距離の取り方','刺激への反応','進め方・柔軟性'];
  const KEY={'情報の受け取り方':'language','考え方':'thinking','感情の扱い方':'emotion','人との距離感':'distance','変化への対応':'change','伝え方・受け止め方':'communication','近づき方・距離の取り方':'attach','刺激への反応':'sensory','進め方・柔軟性':'process'};
  const LABELS={language:{left:'言葉ではっきり',right:'流れから受け取る',middle:'言葉と流れを使い分け',low:'やや言葉寄り',high:'やや流れ寄り'},thinking:{left:'筋道を整理',right:'ひらめきを広げる',middle:'整理と発想を行き来',low:'やや整理寄り',high:'やや発想寄り'},emotion:{left:'話して整理',right:'時間を置いて整理',middle:'話す・考えるを使い分け',low:'やや話す寄り',high:'やや時間を置く寄り'},distance:{left:'一緒に整理',right:'ひとりで整理',middle:'状況に合わせて距離調整',low:'やや共有寄り',high:'やや一人の時間寄り'},change:{left:'見通してから',right:'動きながら',middle:'見通しと柔軟さを両立',low:'やや見通し寄り',high:'やや柔軟寄り'},communication:{left:'まず気持ち',right:'まず具体策',middle:'気持ちと具体策を両方見る',low:'やや気持ち寄り',high:'やや具体策寄り'},attach:{left:'つながりを確認',right:'自分で整理してから',middle:'近さと距離を調整',low:'ややつながり寄り',high:'やや距離寄り'},sensory:{left:'刺激を減らして整理',right:'その場で切り替える',middle:'刺激量で切り替える',low:'やや刺激を減らす寄り',high:'やや切り替える寄り'},process:{left:'順番を整えてから',right:'まず動いて調整',middle:'計画と柔軟さを使い分け',low:'やや順番寄り',high:'やや柔軟寄り'}};
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
  const side=n=>Number(n)<=35?'left':Number(n)>=65?'right':'middle';
  function label(key,n){const d=LABELS[key]||{},v=Number(n);if(v<=35)return d.left||'';if(v>=65)return d.right||'';if(v<=47)return d.low||d.middle||'';if(v>=53)return d.high||d.middle||'';return d.middle||'';}
  function rows(data){
    const my=Object.fromEntries((data?.my?.scores||[]).map(x=>[x.key,Number(x.score)])),pa=Object.fromEntries((data?.partner?.scores||[]).map(x=>[x.key,Number(x.score)]));
    const out=BASE_AXES.map(axis=>{const k=KEY[axis],a=my[k]??50,b=pa[k]??50;return{axis,key:k,type:'base',my:a,partner:b,diff:Math.abs(a-b),myLabel:label(k,a),partnerLabel:label(k,b)}});
    const md=Object.fromEntries((data?.my?.deep||[]).map(x=>[x.key,Number(x.score)])),pd=Object.fromEntries((data?.partner?.deep||[]).map(x=>[x.key,Number(x.score)]));
    if(Object.keys(md).length&&Object.keys(pd).length)DEEP_AXES.forEach(axis=>{const k=KEY[axis];if(md[k]!=null&&pd[k]!=null){const a=md[k],b=pd[k];out.push({axis,key:k,type:'deep',my:a,partner:b,diff:Math.abs(a-b),myLabel:label(k,a),partnerLabel:label(k,b)})}});
    return out;
  }
  function getData(){try{return window.getActiveCompareData?.()||null}catch{return null}}
  function icon(r){try{return r.type==='base'&&typeof AXES!=='undefined'?(AXES[r.key]?.icon||''):r.type==='deep'&&typeof DEEP_AXES!=='undefined'?(DEEP_AXES[r.key]?.icon||''):''}catch{return''}}
  function refreshTop(card,d){
    const box=card.querySelector('.v82-top3');if(!box)return false;
    const candidates=rows(d).sort((a,b)=>b.diff-a.diff).filter(r=>r.diff>=8&&r.myLabel!==r.partnerLabel).slice(0,3);
    const sig=candidates.map(r=>r.key+'|'+r.my+'|'+r.partner+'|'+r.myLabel+'|'+r.partnerLabel).join(';;')||'__none__';
    if(box.dataset.v120Signature===sig)return true;
    box.dataset.v120Signature=sig;box.innerHTML='';
    if(!candidates.length){box.innerHTML='<div class="v82-similar">大きな差は少なめ。似た入口から会話を進めやすい2人です。</div>';return true}
    candidates.forEach((r,i)=>{const el=document.createElement('div');el.className='v82-top-item';el.innerHTML='<div class="v82-top-num">0'+(i+1)+'</div><div class="v82-top-main"><div class="v82-top-axis">'+icon(r)+' '+r.axis+'</div><div class="v82-top-contrast"><b>'+r.myLabel+'</b><span>×</span><b>'+r.partnerLabel+'</b></div></div>';box.appendChild(el)});
    return true;
  }
  function refreshAdvice(card,d){
    const items=[...card.querySelectorAll('.v82-advice-item')];if(!items.length)return false;
    const ranked=rows(d).sort((a,b)=>b.diff-a.diff).slice(0,2);
    items.forEach((item,i)=>{const r=ranked[i];if(!r)return;const dict=ADVICE[r.key]||{},a=side(r.my),b=side(r.partner),texts=a===b?[dict.same||dict[a]||'']:[dict[a]||dict.middle||'',dict[b]||dict.middle||''];const ps=item.querySelectorAll('p');if(ps[0]&&ps[0].textContent!==texts[0])ps[0].textContent=texts[0];if(ps[1]){if(ps[1].textContent!==texts[1])ps[1].textContent=texts[1]||'';ps[1].style.display=texts[1]?'':'none'}});
    return true;
  }
  function refresh(){const card=document.getElementById('v21CompareCard'),d=getData();if(!card||!d?.my||!d?.partner)return false;refreshTop(card,d);refreshAdvice(card,d);return true}
  function installObserver(){try{const card=document.getElementById('v21CompareCard');if(!card||card.__v120Observer)return false;const observer=new MutationObserver(()=>refresh());observer.observe(card,{subtree:true,childList:true,characterData:true});card.__v120Observer=observer;refresh();return true}catch(e){console.warn('v120 observer failed',e);return false}}
  let tries=0;const timer=setInterval(()=>{const ok=installObserver();if(ok||++tries>=120)clearInterval(timer)},100);
  window.addEventListener('load',()=>{installObserver();[0,300,800,1500,2500].forEach(t=>setTimeout(refresh,t))});
})();

/* v145 — after finishing the deep 18 questions, scroll to the generated result */
(function(){
  'use strict';
  function installDeepResultScroll(){
    const btn=document.getElementById('runExtra');
    const result=document.getElementById('extraResult');
    if(!btn||!result||btn.__v145ScrollBound)return !!btn;
    btn.__v145ScrollBound=true;
    btn.addEventListener('click',()=>{
      setTimeout(()=>{
        if(!result.children.length)return;
        result.style.scrollMarginTop='18px';
        result.scrollIntoView({behavior:'smooth',block:'start'});
      },80);
    });
    return true;
  }
  if(!installDeepResultScroll()){
    let tries=0;
    const timer=setInterval(()=>{if(installDeepResultScroll()||++tries>=120)clearInterval(timer)},100);
  }
})();

/* v146 — split the conversation setup into two guided pages: self -> partner */
(function(){
  'use strict';
  function install(){
    const shell=document.getElementById('v72Shell');
    const page1=document.getElementById('v72Page1');
    const oldPage2=document.getElementById('v72Page2');
    const page3=document.getElementById('v72Page3');
    const page4=document.getElementById('v72Page4');
    const myPicker=document.getElementById('v72MyPicker');
    const partnerPicker=document.getElementById('v72PartnerPicker');
    const start=document.getElementById('v72StartConversation');
    if(!shell||!page1||!oldPage2||!page3||!page4||!myPicker||!partnerPicker||!start)return false;
    if(shell.dataset.v146Installed==='1')return true;
    shell.dataset.v146Installed='1';

    const oldPartner=partnerPicker.parentElement;
    if(oldPartner)oldPartner.remove();
    const title=page1.querySelector('.v72-title');
    const lead=page1.querySelector('.v72-lead');
    const kicker=page1.querySelector('.v72-kicker');
    if(kicker)kicker.textContent='STEP 1';
    if(title)title.textContent='まず、あなたについて';
    if(lead)lead.textContent='最初に自分のプロフィールを選ぶか、新しく作ります。プロフィールや特性チェックを使わなくても、そのまま進められます。';
    if(start)start.textContent='次へ：相手を設定する →';

    const page2=document.createElement('section');
    page2.className='v72-page';
    page2.id='v146PartnerPage';
    page2.innerHTML='<div class="v72-page-inner"><div class="v72-kicker">STEP 2</div><h2 class="v72-title">次に、相手について</h2><p class="v72-lead">今回の会話の相手を選ぶか、新しく作ります。相手のプロフィールがなくても、そのまま会話を解析できます。</p><div class="v72-person-row"><button type="button" class="v72-person-card" id="v146PartnerPicker"><div class="v72-person-role">👥 相手</div><div class="v72-person-name" id="v146PartnerName">未設定</div><div class="v72-person-action">タップして選ぶ・作る →</div></button></div><button type="button" class="primary" id="v146ToConversation">次へ：会話を入れる →</button><div class="v72-swipe-hint"><div class="v72-arrow">↑</div>上へスワイプ / スクロールでも次へ進めます</div></div>';
    page1.after(page2);

    const pName=document.getElementById('v146PartnerName');
    const originalPartnerName=document.getElementById('v72PartnerName');
    function sync(){
      const n=typeof activeProfile==='function'?activeProfile('partner'):null;
      if(pName)pName.textContent=n||'未設定';
      if(originalPartnerName)originalPartnerName.textContent=n||'未設定';
    }
    function scrollTo(el){el?.scrollIntoView({behavior:'smooth',block:'start'});}
    start.onclick=()=>scrollTo(page2);
    document.getElementById('v146ToConversation').onclick=()=>scrollTo(oldPage2);
    document.getElementById('v72BackToInput').onclick=()=>scrollTo(oldPage2);
    document.getElementById('v72BackToResult').onclick=()=>scrollTo(page3);
    document.getElementById('v72ToCompare').onclick=()=>scrollTo(page4);

    document.getElementById('v146PartnerPicker').onclick=()=>document.getElementById('v72PartnerPicker').click();
    document.getElementById('v72PartnerPicker').style.display='none';
    sync();
    document.getElementById('v72PickerClose')?.addEventListener('click',sync);
    document.getElementById('v72ProfileClose')?.addEventListener('click',sync);
    document.getElementById('v72OpenDiag')?.addEventListener('click',()=>setTimeout(sync,80));
    document.getElementById('savePartner')?.addEventListener('click',()=>setTimeout(sync,80));

    const oldDots=document.querySelector('.v72-page-dots');
    if(oldDots){
      const dots=document.createElement('div');
      dots.className='v72-page-dots';
      dots.setAttribute('aria-hidden','true');
      [page1,page2,oldPage2,page3,page4].forEach((p,i)=>{
        const d=document.createElement('button');d.className='v72-dot'+(i===0?' on':'');d.dataset.page=String(i);d.type='button';
        d.addEventListener('click',()=>scrollTo(p));dots.appendChild(d);
      });
      oldDots.replaceWith(dots);
    }
    const pager=document.querySelector('.v72-page-dots');
    const visiblePages=[page1,page2,oldPage2,page3,page4];
    if(pager){
      const dots=[...pager.querySelectorAll('.v72-dot')];
      const io=new IntersectionObserver(entries=>entries.forEach(en=>{
        if(!en.isIntersecting)return;
        const i=visiblePages.indexOf(en.target);
        dots.forEach((d,n)=>d.classList.toggle('on',n===i));
      }),{root:shell,threshold:.6});
      visiblePages.forEach(p=>io.observe(p));
    }
    return true;
  }
  if(!install()){
    let tries=0;
    const timer=setInterval(()=>{if(install()||++tries>=120)clearInterval(timer)},100);
  }
})();

/* v147 — restore self card and make the 5-step pager authoritative */
(function(){
  'use strict';
  function install(){
    const shell=document.getElementById('v72Shell');
    const page1=document.getElementById('v72Page1');
    const partnerPage=document.getElementById('v146PartnerPage');
    const oldPage2=document.getElementById('v72Page2');
    const page3=document.getElementById('v72Page3');
    const page4=document.getElementById('v72Page4');
    const my=document.getElementById('v72MyPicker');
    if(!shell||!page1||!partnerPage||!oldPage2||!page3||!page4||!my)return false;

    const row=page1.querySelector('.v72-person-row');
    if(row&& !row.contains(my)) row.insertBefore(my,row.firstChild);
    if(my.parentElement!==row){
      if(row)row.appendChild(my);
      else{
        const inner=page1.querySelector('.v72-page-inner');
        const newRow=document.createElement('div');newRow.className='v72-person-row';newRow.appendChild(my);inner?.insertBefore(newRow,document.getElementById('v72StartConversation'));
      }
    }
    my.style.display='';

    const selfCard=my.closest('.v72-person-card');
    if(selfCard){selfCard.style.display='';selfCard.style.visibility='visible';}

    const oldPagers=[...document.querySelectorAll('.v72-page-dots')];
    oldPagers.forEach((p,i)=>{if(i>0)p.remove();});
    let pager=oldPagers[0];
    if(!pager){
      pager=document.createElement('div');pager.className='v72-page-dots';pager.setAttribute('aria-hidden','true');document.body.appendChild(pager);
    }
    pager.innerHTML='';
    const pages=[page1,partnerPage,oldPage2,page3,page4];
    pages.forEach((p,i)=>{
      const d=document.createElement('button');
      d.type='button';d.className='v72-dot'+(i===0?' on':'');d.dataset.page=String(i);
      d.addEventListener('click',()=>p.scrollIntoView({behavior:'smooth',block:'start'}));
      pager.appendChild(d);
    });
    if(pager.__v147IO) return true;
    pager.__v147IO=new IntersectionObserver(entries=>{
      const hit=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!hit)return;
      const i=pages.indexOf(hit.target);
      [...pager.querySelectorAll('.v72-dot')].forEach((d,n)=>d.classList.toggle('on',n===i));
    },{root:shell,threshold:[.55,.7,.9]});
    pages.forEach(p=>pager.__v147IO.observe(p));
    return true;
  }
  if(!install()){
    let tries=0;
    const timer=setInterval(()=>{if(install()||++tries>=120)clearInterval(timer)},100);
  }
})();
