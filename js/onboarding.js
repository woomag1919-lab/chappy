/* CoreLingual — self → partner → relationship → 36 questions */
(function(){
  'use strict';
  if(window.__corelingualOnboarding)return;
  window.__corelingualOnboarding=true;
  const active=p=>{try{return typeof activeProfile==='function'?activeProfile(p):null}catch{return null}};
  const profile=p=>{const n=active(p);try{return n&&typeof list==='function'?list(p).find(x=>x.name===n):null}catch{return null}};
  const relationship=()=>window.CoreLingualRelationship?.get?.()||localStorage.getItem('cl_partner_relationship')||'romantic';
  function mount(){
    if(document.getElementById('clOnboarding'))return;
    const old=document.getElementById('v72Shell'),talk=document.getElementById('talk');
    if(!old||!talk)return;
    const css=document.createElement('style');css.textContent='#v72Shell{display:none!important}#clOnboarding{max-width:760px;margin:auto;padding:20px 18px 110px}.clo{display:none;min-height:70vh}.clo.on{display:block}.clo h2{font-size:30px;line-height:1.3;margin:8px 0 12px}.clo p{font-size:16px;line-height:1.8;color:#66707a}.clo-card{width:100%;text-align:left;background:#fff;border:1px solid #e3e6ea;border-radius:18px;padding:20px;margin:14px 0;box-shadow:0 5px 18px rgba(20,45,72,.06)}.clo-role{font-size:14px;color:#7c858d}.clo-name{font-size:23px;font-weight:800;margin-top:5px}.clo-action{color:#df4d86;font-weight:700;margin-top:8px}.clo-btn{width:100%;border:0;border-radius:14px;padding:15px 18px;font-size:17px;font-weight:800;background:#df4d86;color:#fff;margin-top:12px}.clo-btn.alt{background:#fff;color:#df4d86;border:1px solid #df4d86}.clo-rel{background:#fff6fa;border:1px solid #f2c5d8;border-radius:16px;padding:15px;margin:16px 0;line-height:1.7}.clo-status{background:#f7f8fa;border-radius:14px;padding:15px;line-height:1.8;color:#4f5962;margin-top:18px}';document.head.appendChild(css);
    const root=document.createElement('section');root.id='clOnboarding';root.innerHTML='<div class="clo on" data-s="my"><div style="color:#df4d86;font-weight:700">STEP 1 / 自分</div><h2>まず、自分のプロフィール</h2><p>今回の診断で基準にする「自分」を登録します。MBTIは使いません。</p><button class="clo-card" id="cloMy"><div class="clo-role">👤 自分</div><div class="clo-name" id="cloMyName">未設定</div><div class="clo-action">タップして選ぶ・作る →</div></button><button class="clo-btn" id="cloMyNext">自分のプロフィールを確認して次へ →</button></div><div class="clo" data-s="partner"><div style="color:#df4d86;font-weight:700">STEP 2 / 相手</div><h2>次に、相手のプロフィール</h2><p>相手を登録するとき、この相手との関係も選びます。</p><button class="clo-card" id="cloPartner"><div class="clo-role">👥 相手</div><div class="clo-name" id="cloPartnerName">未設定</div><div class="clo-action">タップして選ぶ・作る →</div></button><div class="clo-rel"><b>この相手との関係</b><div id="cloRel">未選択</div></div><button class="clo-btn" id="cloPartnerNext">相手のプロフィールを確認して次へ →</button><button class="clo-btn alt" id="cloBack">← 自分に戻る</button></div><div class="clo" data-s="diag"><div style="color:#df4d86;font-weight:700">STEP 3 / 特性チェック</div><h2>相手の特性を36問でチェック</h2><p>前半18問は関係性によって内容が変わります。後半18問は特性の深掘り18問です。</p><div class="clo-status"><b id="cloRelStatus">関係：未選択</b><br>前半18問：関係性別<br>後半18問：特性の深掘り</div><button class="clo-btn" id="cloDiag">相手の36問を始める →</button><button class="clo-btn alt" id="cloDiagBack">← 相手プロフィールに戻る</button></div>';
    talk.parentNode.insertBefore(root,talk);
    const page=s=>{root.querySelectorAll('.clo').forEach(x=>x.classList.toggle('on',x.dataset.s===s));window.scrollTo({top:0,behavior:'smooth'});sync()};
    const sync=()=>{const mn=active('my')||'未設定',pn=active('partner')||'未設定',r=relationship(),labels={romantic:'❤️ 恋人・パートナー',friend:'👫 友人関係',work:'💼 仕事関係'};document.getElementById('cloMyName').textContent=mn;document.getElementById('cloPartnerName').textContent=pn;document.getElementById('cloRel').textContent=labels[r]||'未選択';document.getElementById('cloRelStatus').textContent='関係：'+(labels[r]||'未選択')};
    document.getElementById('cloMy').onclick=()=>document.getElementById('v72MyPicker')?.click();
    document.getElementById('cloPartner').onclick=()=>document.getElementById('v72PartnerPicker')?.click();
    document.getElementById('cloMyNext').onclick=()=>active('my')?page('partner'):alert('まず自分のプロフィールを選ぶか、作成してください。');
    document.getElementById('cloBack').onclick=()=>page('my');
    document.getElementById('cloPartnerNext').onclick=()=>{const p=profile('partner');if(!p){alert('まず相手のプロフィールを選ぶか、作成してください。');return}if(!p.relationship){alert('相手との関係を選択してください。');return}page('diag')};
    document.getElementById('cloDiagBack').onclick=()=>page('partner');
    document.getElementById('cloDiag').onclick=()=>{const b=document.getElementById('v72OpenDiag');if(!b){alert('特性チェックを開始できませんでした。');return}root.dataset.started='1';b.click()};
    window.addEventListener('corelingual:profile-change',sync);window.addEventListener('corelingual:profile-save',sync);window.addEventListener('corelingual:relationship-change',sync);sync();
    const ov=document.getElementById('v72DiagOverlay');if(ov){new MutationObserver(()=>{if(root.dataset.started==='1'&&!ov.classList.contains('show')&&getComputedStyle(ov).display==='none'){root.dataset.started='';talk.style.display='block';talk.scrollIntoView({behavior:'smooth',block:'start'})}}).observe(ov,{attributes:true,attributeFilter:['class','style']})}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();