/* CoreLingual — profile-first onboarding v2
 * Robust bootstrap for the profile-first flow.
 * Repairs older onboarding DOM layouts before mounting the new flow.
 * Page 1: 自分
 * Page 2: 相手 + 相手との関係
 * Page 3以降: 既存の36問特性チェック
 */
(function(){
  'use strict';
  if(window.__corelingualProfileFirstFlowV2)return;
  window.__corelingualProfileFirstFlowV2=true;

  const CSS=`
    #clProfileFirstFlow{width:100%;max-width:760px;margin:0 auto;padding:0 18px 110px;box-sizing:border-box}
    #clProfileFirstFlow .cl-flow-step{display:none}
    #clProfileFirstFlow .cl-flow-step.is-active{display:block}
    #clProfileFirstFlow .cl-flow-head{padding:34px 2px 18px}
    #clProfileFirstFlow .cl-flow-kicker{font-size:13px;color:#9a9fa6;letter-spacing:.08em}
    #clProfileFirstFlow h1{font-size:28px;line-height:1.35;margin:6px 0 10px;color:#252a31}
    #clProfileFirstFlow .cl-flow-lead{margin:0;color:#707780;line-height:1.75}
    #clProfileFirstFlow .cl-flow-progress{display:flex;gap:8px;margin:4px 2px 18px}
    #clProfileFirstFlow .cl-flow-dot{height:6px;flex:1;border-radius:99px;background:#e7e9ed}
    #clProfileFirstFlow .cl-flow-dot.on{background:#df4d86}
    #clProfileFirstFlow .cl-flow-actions{display:flex;gap:10px;margin-top:16px}
    #clProfileFirstFlow button.cl-flow-next{width:100%;border:0;border-radius:14px;padding:15px 18px;background:#df4d86;color:#fff;font-size:16px;font-weight:700}
    #clProfileFirstFlow button.cl-flow-back{width:110px;border:1px solid #ddd;border-radius:14px;background:#fff;color:#555;padding:14px;font-weight:700}
    #clProfileFirstFlow .cl-flow-status{margin-top:10px;color:#8a919a;font-size:13px;min-height:1.4em}
    #clProfileFirstFlow .v74-profile-panel{display:block!important;width:100%!important;max-width:none!important;margin:0!important;box-sizing:border-box!important}
    #clProfileFirstFlow .v73-hidden-compat{display:none!important}
    body.cl-profile-first-active #v72Shell,
    body.cl-profile-first-active .v72-page-dots{display:none!important}
  `;

  function ensureStyle(){
    const old=document.getElementById('clProfileFirstFlowStyle');
    if(old)old.remove();
    if(document.getElementById('clProfileFirstFlowStyleV2'))return;
    const style=document.createElement('style');
    style.id='clProfileFirstFlowStyleV2';
    style.textContent=CSS;
    document.head.appendChild(style);
  }

  function repairOldFlow(profile,shell){
    const oldFlow=document.getElementById('clProfileFirstFlow');
    const my=document.getElementById('profileMyPane');
    const partner=document.getElementById('profilePartnerPane');
    const compat=profile?.querySelector('.v73-hidden-compat')||document.querySelector('.v73-hidden-compat');
    if(!profile||!oldFlow)return;

    /* Older versions moved the two panes out of the panel. Put them back. */
    if(compat && compat.parentNode!==profile)profile.insertBefore(compat,profile.firstChild);
    if(my && my.parentNode!==profile)profile.appendChild(my);
    if(partner && partner.parentNode!==profile)profile.appendChild(partner);

    /* Get the repaired panel out before deleting the obsolete flow. */
    if(profile.parentNode===oldFlow){
      const main=document.querySelector('main')||document.body;
      main.insertBefore(profile,shell||null);
    }
    oldFlow.remove();
  }

  function inject(){
    if(!document.body)return false;
    const shell=document.getElementById('v72Shell');
    const profile=document.querySelector('.v74-profile-panel');
    if(!shell||!profile)return false;

    ensureStyle();
    repairOldFlow(profile,shell);

    const existing=document.getElementById('clProfileFirstFlow');
    if(existing)existing.remove();

    const flow=document.createElement('section');
    flow.id='clProfileFirstFlow';
    flow.setAttribute('aria-label','プロフィール設定');
    flow.innerHTML=`
      <div class="cl-flow-step is-active" data-step="1">
        <div class="cl-flow-head">
          <div class="cl-flow-kicker">STEP 1</div>
          <h1>まず、あなたについて</h1>
          <p class="cl-flow-lead">最初に自分のプロフィールを選ぶか、新しく作ります。プロフィールや特性チェックを使わなくても、そのまま進められます。</p>
        </div>
        <div class="cl-flow-progress"><span class="cl-flow-dot on"></span><span class="cl-flow-dot"></span></div>
        <div id="clMyProfileMount"></div>
        <div class="cl-flow-actions"><button type="button" class="cl-flow-next" id="clMyNext">次へ：相手を設定する →</button></div>
        <div class="cl-flow-status" id="clMyStatus"></div>
      </div>
      <div class="cl-flow-step" data-step="2">
        <div class="cl-flow-head">
          <div class="cl-flow-kicker">STEP 2</div>
          <h1>次に、相手について</h1>
          <p class="cl-flow-lead">今回の会話の相手を選ぶか、新しく作ります。相手のプロフィールがなくても、そのまま会話を解析できます。</p>
        </div>
        <div id="clPartnerProfileMount"></div>
        <div class="cl-flow-actions">
          <button type="button" class="cl-flow-back" id="clPartnerBack">← 戻る</button>
          <button type="button" class="cl-flow-next" id="clPartnerNext">次へ：特性チェックへ →</button>
        </div>
        <div class="cl-flow-status" id="clPartnerStatus"></div>
      </div>
    `;

    shell.parentNode.insertBefore(flow,shell);
    const mount1=flow.querySelector('#clMyProfileMount');
    const mount2=flow.querySelector('#clPartnerProfileMount');
    if(!mount1||!mount2)return false;

    mount1.appendChild(profile);

    const myPane=document.getElementById('profileMyPane');
    const partnerPane=document.getElementById('profilePartnerPane');
    const dots=[...flow.querySelectorAll('.cl-flow-dot')];
    const steps=[...flow.querySelectorAll('.cl-flow-step')];

    function paneDisplay(el,value){
      if(el)el.style.setProperty('display',value,'important');
    }

    function showStep(n){
      steps.forEach(s=>s.classList.toggle('is-active',s.dataset.step===String(n)));
      dots.forEach((d,i)=>d.classList.toggle('on',i<n));
      paneDisplay(myPane,n===1?'block':'none');
      paneDisplay(partnerPane,n===2?'block':'none');
      const target=n===1?mount1:mount2;
      if(target&&profile.parentNode!==target)target.appendChild(profile);
      document.body.classList.toggle('cl-profile-first-active',true);
      window.scrollTo({top:0,behavior:'auto'});
    }

    showStep(1);
    shell.style.display='none';

    const myNext=document.getElementById('clMyNext');
    if(myNext)myNext.addEventListener('click',function(){
      const name=document.getElementById('myName');
      if(!name||!name.value.trim()){
        const status=document.getElementById('clMyStatus');
        if(status)status.textContent='プロフィール名を入力してください';
        if(name)name.focus();
        return;
      }
      const save=document.getElementById('saveMy');
      if(save)save.click();
      showStep(2);
    });

    const back=document.getElementById('clPartnerBack');
    if(back)back.addEventListener('click',function(){showStep(1)});

    const partnerNext=document.getElementById('clPartnerNext');
    if(partnerNext)partnerNext.addEventListener('click',function(){
      const name=document.getElementById('partnerName');
      if(!name||!name.value.trim()){
        const status=document.getElementById('clPartnerStatus');
        if(status)status.textContent='プロフィール名を入力してください';
        if(name)name.focus();
        return;
      }
      const rel=window.CoreLingualRelationship&&typeof window.CoreLingualRelationship.get==='function'
        ?window.CoreLingualRelationship.get():null;
      if(!rel){
        const status=document.getElementById('clPartnerStatus');
        if(status)status.textContent='相手との関係を選択してね。';
        return;
      }
      const save=document.getElementById('savePartner');
      if(save)save.click();
      flow.style.display='none';
      profile.style.display='none';
      shell.style.display='';
      document.body.classList.remove('cl-profile-first-active');
      const diag=document.getElementById('v72OpenDiag');
      if(diag)setTimeout(()=>{try{diag.click()}catch(e){}},120);
    });

    return true;
  }

  function start(){
    if(inject())return;
    let n=0;
    const timer=setInterval(()=>{if(inject()||++n>=120)clearInterval(timer)},100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
