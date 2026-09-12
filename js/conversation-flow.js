/* CoreLingual conversation flow — extracted from historical v145/v146 compatibility fixes. */
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

    partnerPicker.style.display='none';
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
