/* CoreLingual — self → partner → relationship → 36-question flow */
(function(){
  'use strict';
  if(window.__corelingualProfileFlow)return;
  window.__corelingualProfileFlow=true;

  function esc(s){return String(s||'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
  function active(p){try{return typeof activeProfile==='function'?activeProfile(p):null}catch{return null}}
  function profile(p){const n=active(p);try{return n&&typeof list==='function'?list(p).find(x=>x.name===n):null}catch{return null}}
  function rel(){return window.CoreLingualRelationship?.get?.()||localStorage.getItem('cl_partner_relationship')||'romantic'}

  function style(){
    if(document.getElementById('clProfileFlowStyle'))return;
    const s=document.createElement('style');s.id='clProfileFlowStyle';s.textContent=`
      #v72Shell{display:none!important}
      #clProfileFlow{max-width:760px;margin:0 auto;padding:22px 18px 110px}
      .cl-flow-page{display:none;min-height:calc(100vh - 180px);box-sizing:border-box}
      .cl-flow-page.on{display:block}
      .cl-flow-kicker{font-size:13px;color:#df4d86;font-weight:700;letter-spacing:.12em;margin:18px 0 8px}
      .cl-flow-title{font-size:30px;line-height:1.25;margin:0 0 12px;color:#222}
      .cl-flow-lead{font-size:16px;line-height:1.8;color:#66707a;margin:0 0 22px}
      .cl-flow-card{background:#fff;border:1px solid #e3e6ea;border-radius:18px;padding:20px;box-shadow:0 5px 18px rgba(20,45,72,.06);margin:14px 0}
      .cl-flow-role{font-size:14px;color:#7c858d;margin-bottom:6px}
      .cl-flow-name{font-size:23px;font-weight:800;color:#222;min-height:30px}
      .cl-flow-action{color:#df4d86;font-weight:700;margin-top:8px}
      .cl-flow-btn{width:100%;border:0;border-radius:14px;padding:15px 18px;font-size:17px;font-weight:800;background:#df4d86;color:#fff;margin-top:14px}
      .cl-flow-btn.secondary{background:#fff;color:#df4d86;border:1px solid #df4d86}
      .cl-flow-note{font-size:13px;color:#7a838b;line-height:1.7;margin:14px 4px}
      .cl-flow-rel{margin:18px 0;padding:16px;border-radius:16px;background:#fff6fa;border:1px solid #f2c5d8}
      .cl-flow-rel b{display:block;margin-bottom:5px}.cl-flow-rel span{color:#666;font-size:14px}
      .cl-flow-status{padding:14px 16px;background:#f7f8fa;border-radius:14px;color:#4f5962;line-height:1.7;margin-top:18px}
      .cl-flow-hint{text-align:center;color:#8a9198;font-size:13px;margin-top:18px}
      #clFlowConversation{display:none;margin-top:18px}
      #clFlowConversation.on{display:block}
    `;document.head.appendChild(s);
  }

  function render(){
    style();
    const talk=document.getElementById('talk');
    if(!talk||document.getElementById('clProfileFlow'))return;
    const root=document.createElement('section');root.id='clProfileFlow';
    root.innerHTML=`
      <div class="cl-flow-page on" data-flow="my">
        <div class="cl-flow-kicker">STEP 1 / 自分</div>
        <h2 class="cl-flow-title">まず、自分のプロフィール</h2>
        <p class="cl-flow-lead">今回の診断で基準にする「自分」を登録します。ここではMBTIは使わず、CoreLingualの特性情報だけを使います。</p>
        <button type="button" class="cl-flow-card" id="clFlowMyCard" style="width:100%;text-align:left">
          <div class="cl-flow-role">👤 自分</div><div class="cl-flow-name" id="clFlowMyName">未設定</div><div class="cl-flow-action">タップしてプロフィールを選ぶ・作る →</div>
        </button>
        <button type="button" class="cl-flow-btn" id="clFlowMyNext">自分のプロフィールを確認して次へ →</button>
        <div class="cl-flow-hint">プロフィールは保存して次回も使えます。</div>
      </div>
      <div class="cl-flow-page" data-flow="partner">
        <div class="cl-flow-kicker">STEP 2 / 相手</div>
        <h2 class="cl-flow-title">次に、相手のプロフィール</h2>
        <p class="cl-flow-lead">相手の名前や特性を登録します。ここで「相手との関係」も選びます。</p>
        <button type="button" class="cl-flow-card" id="clFlowPartnerCard" style="width:100%;text-align:left">
          <div class="cl-flow-role">👥 相手</div><div class="cl-flow-name" id="clFlowPartnerName">未設定</div><div class="cl-flow-action">タップしてプロフィールを選ぶ・作る →</div>
        </button>
        <div class="cl-flow-rel"><b>この相手との関係</b><span id="clFlowRelText">まだ選択されていません</span></div>
        <button type="button" class="cl-flow-btn" id="clFlowPartnerNext">相手のプロフィールを確認して次へ →</button>
        <button type="button" class="cl-flow-btn secondary" id="clFlowBack">← 自分に戻る</button>
      </div>
      <div class="cl-flow-page" data-flow="diag">
        <div class="cl-flow-kicker">STEP 3 / 特性チェック</div>
        <h2 class="cl-flow-title">相手との関係を踏まえてチェック</h2>
        <p class="cl-flow-lead">前半18問は、選んだ関係性に合わせて内容が変わります。続く後半18問で、相手の特性をもう一段深く見ていきます。</p>
        <div class="cl-flow-status"><b id="clFlowDiagRel">関係：未設定</b><br>前半18問 → 関係性に合わせた質問<br>後半18問 → 特性の深掘り18問</div>
        <button type="button" class="cl-flow-btn" id="clFlowStartDiag">相手の36問を始める →</button>
        <button type="button" class="cl-flow-btn secondary" id="clFlowDiagBack">← 相手プロフィールに戻る</button>
      </div>
    `;
    talk.parentNode.insertBefore(root,talk);

    const setPage=name=>{root.querySelectorAll('.cl-flow-page').forEach(p=>p.classList.toggle('on',p.dataset.flow===name));window.scrollTo({top:0,behavior:'smooth'});sync()};
    const sync=()=>{
      const mn=active('my')||'未設定',pn=active('partner')||'未設定';
      const labels={romantic:'❤️ 恋人・パートナー',friend:'👫 友人関係',work:'💼 仕事関係'};
      document.getElementById('clFlowMyName').textContent=mn;
      document.getElementById('clFlowPartnerName').textContent=pn;
      const r=rel();document.getElementById('clFlowRelText').textContent=labels[r]||'まだ選択されていません';
      document.getElementById('clFlowDiagRel').textContent='関係：'+(labels[r]||'未設定');
    };

    document.getElementById('clFlowMyCard').onclick=()=>document.getElementById('v72MyPicker')?.click();
    document.getElementById('clFlowPartnerCard').onclick=()=>document.getElementById('v72PartnerPicker')?.click();
    document.getElementById('clFlowMyNext').onclick=()=>active('my')?setPage('partner'):alert('まず自分のプロフィールを選ぶか、作成してください。');
    document.getElementById('clFlowBack').onclick=()=>setPage('my');
    document.getElementById('clFlowPartnerNext').onclick=()=>{
      if(!active('partner')){alert('まず相手のプロフィールを選ぶか、作成してください。');return;}
      const p=profile('partner');if(!p?.relationship){alert('相手との関係を選択してください。');return;}
      setPage('diag');
    };
    document.getElementById('clFlowDiagBack').onclick=()=>setPage('partner');
    document.getElementById('clFlowStartDiag').onclick=()=>{
      const btn=document.getElementById('v72OpenDiag');
      if(!btn){alert('特性チェックを開始できませんでした。');return;}
      root.dataset.diagStarted='1';btn.click();
    };

    window.addEventListener('corelingual:profile-change',sync);
    window.addEventListener('corelingual:profile-save',sync);
    window.addEventListener('corelingual:relationship-change',sync);
    const obs=new MutationObserver(()=>{sync();});obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
    sync();

    const diagOverlay=document.getElementById('v72DiagOverlay');
    if(diagOverlay){
      const mo=new MutationObserver(()=>{
        if(root.dataset.diagStarted==='1' && !diagOverlay.classList.contains('show') && getComputedStyle(diagOverlay).display==='none'){
          root.dataset.diagStarted='';
          root.querySelectorAll('.cl-flow-page').forEach(p=>p.classList.remove('on'));
          document.getElementById('clFlowConversation')?.classList.add('on');
          talk.style.display='block';
          talk.scrollIntoView({behavior:'smooth',block:'start'});
        }
      });mo.observe(diagOverlay,{attributes:true,attributeFilter:['class','style']});
    }
  }

  function start(){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
  }
  start();
})();