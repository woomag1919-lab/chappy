/* CoreLingual — profile-first onboarding flow
 * Page 1: 自分
 * Page 2: 相手 + 相手との関係
 * Page 3以降: 既存の36問特性チェック
 *
 * MBTIは使用しない。
 */
(function(){
  'use strict';

  if(window.__corelingualProfileFirstFlow)return;
  window.__corelingualProfileFirstFlow=true;

  const CSS=`
    #clProfileFirstFlow{
      max-width:760px;
      margin:0 auto;
      padding:24px 18px 96px;
      box-sizing:border-box;
    }
    #clProfileFirstFlow .cl-flow-head{padding:8px 2px 18px}
    #clProfileFirstFlow .cl-flow-kicker{font-size:13px;color:#9a9fa6;letter-spacing:.08em}
    #clProfileFirstFlow h1{font-size:28px;line-height:1.35;margin:6px 0 10px;color:#252a31}
    #clProfileFirstFlow .cl-flow-lead{margin:0;color:#707780;line-height:1.75}
    #clProfileFirstFlow .cl-flow-step{display:none}
    #clProfileFirstFlow .cl-flow-step.is-active{display:block}
    #clProfileFirstFlow .cl-flow-card{background:#fff;border:1px solid #e4e7eb;border-radius:18px;padding:18px;box-shadow:0 4px 18px rgba(20,45,72,.06)}
    #clProfileFirstFlow .cl-flow-actions{display:flex;gap:10px;margin-top:16px}
    #clProfileFirstFlow button.cl-flow-next{width:100%;border:0;border-radius:14px;padding:15px 18px;background:#df4d86;color:#fff;font-size:16px;font-weight:700}
    #clProfileFirstFlow button.cl-flow-back{width:110px;border:1px solid #ddd;border-radius:14px;background:#fff;color:#555;padding:14px;font-weight:700}
    #clProfileFirstFlow .cl-flow-status{margin-top:10px;color:#8a919a;font-size:13px;min-height:1.4em}
    #clProfileFirstFlow .cl-flow-progress{display:flex;gap:7px;margin:4px 0 18px}
    #clProfileFirstFlow .cl-flow-dot{height:6px;flex:1;border-radius:99px;background:#e7e9ed}
    #clProfileFirstFlow .cl-flow-dot.on{background:#df4d86}
    #clProfileFirstFlow .cl-flow-note{margin:12px 0 0;padding:12px 14px;background:#fff6fa;border-radius:12px;color:#7b5967;font-size:13px;line-height:1.65}
    #clProfileFirstFlow .cl-flow-step .person{display:block!important}
    #clProfileFirstFlow .v74-profile-panel{margin:0!important;box-shadow:none!important;border:0!important;padding:0!important;background:transparent!important}
    /* 既存profiles.jsがタブ切替で付けるdisplay:noneを、オンボーディングでは親STEPで管理する。 */
    #clProfileFirstFlow #profileMyPane,
    #clProfileFirstFlow #profilePartnerPane{display:block!important;margin-top:10px}
  `;

  function inject(){
    if(!document.body || document.getElementById('clProfileFirstFlow')){
      return !!document.getElementById('clProfileFirstFlow');
    }

    const profile=document.querySelector('.v74-profile-panel');
    const oldStart=document.getElementById('v72Page1');
    const shell=document.getElementById('v72Shell');
    if(!profile || !oldStart || !shell)return false;

    if(!document.getElementById('clProfileFirstFlowStyle')){
      const style=document.createElement('style');
      style.id='clProfileFirstFlowStyle';
      style.textContent=CSS;
      document.head.appendChild(style);
    }

    const flow=document.createElement('section');
    flow.id='clProfileFirstFlow';
    flow.setAttribute('aria-label','プロフィール設定');

    flow.innerHTML=`
      <div class="cl-flow-head">
        <div class="cl-flow-kicker">STEP 1</div>
        <h1>まず、あなたについて</h1>
        <p class="cl-flow-lead">
          最初に自分のプロフィールを選ぶか、新しく作ります。プロフィールや特性チェックを使わなくても、そのまま進められます。
        </p>
      </div>

      <div class="cl-flow-progress">
        <span class="cl-flow-dot on"></span>
        <span class="cl-flow-dot"></span>
      </div>

      <div class="cl-flow-step is-active" data-step="1">
        <div class="cl-flow-card" id="clMyFlowCard"></div>
        <div class="cl-flow-actions">
          <button type="button" class="cl-flow-next" id="clMyNext">次へ：相手を設定する →</button>
        </div>
        <div class="cl-flow-status" id="clMyStatus"></div>
      </div>

      <div class="cl-flow-step" data-step="2">
        <div class="cl-flow-head" style="padding:8px 2px 18px">
          <div class="cl-flow-kicker">STEP 2</div>
          <h1>次に、相手について</h1>
          <p class="cl-flow-lead">
            今回の会話の相手を選ぶか、新しく作ります。相手のプロフィールがなくても、そのまま会話を解析できます。
          </p>
        </div>
        <div class="cl-flow-card" id="clPartnerFlowCard"></div>
        <div class="cl-flow-note">
          ここで選んだ「相手との関係」によって、前半18問の内容が変わります。
        </div>
        <div class="cl-flow-actions">
          <button type="button" class="cl-flow-back" id="clPartnerBack">← 戻る</button>
          <button type="button" class="cl-flow-next" id="clPartnerNext">次へ：会話を入れる →</button>
        </div>
        <div class="cl-flow-status" id="clPartnerStatus"></div>
      </div>
    `;

    /* v72Shellの外に配置する。既存の縦スクロール/scroll-snapに巻き込まれないようにする。 */
    shell.parentNode.insertBefore(flow,shell);

    const my=document.getElementById('profileMyPane');
    const partner=document.getElementById('profilePartnerPane');
    const compat=profile.querySelector('.v73-hidden-compat');

    if(compat)flow.querySelector('.cl-flow-head').after(compat);
    if(my)flow.querySelector('#clMyFlowCard').appendChild(my);
    if(partner)flow.querySelector('#clPartnerFlowCard').appendChild(partner);

    /* プロフィール設定中は旧UIとv72のscroll-snapを完全に隠す。 */
    profile.style.display='none';
    oldStart.style.display='none';
    shell.style.display='none';

    /* 初期表示を必ずページ先頭に戻す。 */
    window.scrollTo({top:0,behavior:'auto'});

    const dots=[...flow.querySelectorAll('.cl-flow-dot')];
    const steps=[...flow.querySelectorAll('.cl-flow-step')];

    function showStep(n){
      steps.forEach(function(step){
        step.classList.toggle('is-active',step.dataset.step===String(n));
      });
      dots.forEach(function(dot,i){
        dot.classList.toggle('on',i<n);
      });
      window.scrollTo({top:0,behavior:'smooth'});
    }

    const myNext=document.getElementById('clMyNext');
    if(myNext){
      myNext.addEventListener('click',function(){
        const name=document.getElementById('myName');
        if(!name || !name.value.trim()){
          const status=document.getElementById('clMyStatus');
          if(status)status.textContent='名前を入力してね。';
          if(name)name.focus();
          return;
        }

        const save=document.getElementById('saveMy');
        if(save)save.click();

        const status=document.getElementById('clMyStatus');
        if(status)status.textContent='自分のプロフィールを保存しました。';

        showStep(2);

        const partnerTab=document.getElementById('profilePartnerTab');
        if(partnerTab){
          try{partnerTab.click();}catch(e){}
        }
      });
    }

    const partnerBack=document.getElementById('clPartnerBack');
    if(partnerBack){
      partnerBack.addEventListener('click',function(){
        showStep(1);
        const myTab=document.getElementById('profileMyTab');
        if(myTab){
          try{myTab.click();}catch(e){}
        }
      });
    }

    const partnerNext=document.getElementById('clPartnerNext');
    if(partnerNext){
      partnerNext.addEventListener('click',function(){
        const name=document.getElementById('partnerName');
        if(!name || !name.value.trim()){
          const status=document.getElementById('clPartnerStatus');
          if(status)status.textContent='相手の名前を入力してね。';
          if(name)name.focus();
          return;
        }

        const rel=
          window.CoreLingualRelationship &&
          typeof window.CoreLingualRelationship.get==='function'
            ? window.CoreLingualRelationship.get()
            : null;

        if(!rel){
          const status=document.getElementById('clPartnerStatus');
          if(status)status.textContent='相手との関係を選択してね。';
          return;
        }

        const save=document.getElementById('savePartner');
        if(save)save.click();

        const status=document.getElementById('clPartnerStatus');
        if(status)status.textContent='相手のプロフィールを保存しました。';

        /* プロフィール設定完了。ここで初めて既存のv72Shellを復帰させる。 */
        shell.style.display='';
        flow.style.display='none';

        const diag=document.getElementById('v72OpenDiag');
        if(diag){
          setTimeout(function(){
            try{diag.click();}catch(e){}
          },120);
        }
      });
    }

    return true;
  }

  function start(){
    if(inject())return;
    let n=0;
    const timer=setInterval(function(){
      if(inject() || ++n>=120)clearInterval(timer);
    },100);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
})();
