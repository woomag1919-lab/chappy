/* CoreLingual — isolated profile-first onboarding
 * Do not modify the legacy v72 flow. Keep it hidden until setup is complete.
 */
(function(){
  'use strict';
  if(window.__corelingualProfileFirstFlowV3)return;
  window.__corelingualProfileFirstFlowV3=true;

  function css(){
    if(document.getElementById('clProfileFirstV3Style'))return;
    const s=document.createElement('style');s.id='clProfileFirstV3Style';
    s.textContent=`
      #clProfileFirstFlow{display:block!important;width:100%;max-width:760px;margin:0 auto;padding:0 18px 120px;box-sizing:border-box}
      #clProfileFirstFlow .cl3-step{display:none}.cl3-step.on{display:block}
      #clProfileFirstFlow .cl3-head{padding:28px 2px 16px}
      #clProfileFirstFlow .cl3-kicker{font-size:13px;color:#9a9fa6;letter-spacing:.08em}
      #clProfileFirstFlow h1{font-size:28px;line-height:1.35;margin:6px 0 10px;color:#252a31}
      #clProfileFirstFlow .cl3-lead{margin:0;color:#707780;line-height:1.75}
      #clProfileFirstFlow .cl3-progress{display:flex;gap:8px;margin:4px 2px 20px}.cl3-progress i{height:6px;flex:1;border-radius:99px;background:#e7e9ed}.cl3-progress i.on{background:#df4d86}
      #clProfileFirstFlow .cl3-chooser{margin:0 0 14px;padding:14px;border:1px solid #e7e9ed;border-radius:16px;background:#fff}
      #clProfileFirstFlow .cl3-chooser-title{font-weight:700;margin-bottom:9px;color:#39424d}
      #clProfileFirstFlow .cl3-profile-list{display:flex;flex-wrap:wrap;gap:8px}
      #clProfileFirstFlow .cl3-profile-list button{border:1px solid #ddd;background:#fff;border-radius:12px;padding:9px 12px;color:#39424d;font-weight:600}
      #clProfileFirstFlow .cl3-profile-list button.active{border-color:#df4d86;box-shadow:0 0 0 2px rgba(223,77,134,.12)}
      #clProfileFirstFlow .cl3-new{margin-top:10px;width:100%;border:1px dashed #df4d86;background:#fff7fa;color:#c63f72;border-radius:12px;padding:10px;font-weight:700}
      #clProfileFirstFlow .v74-profile-panel{display:block!important;width:100%!important;max-width:none!important;margin:0!important;box-sizing:border-box!important}
      #clProfileFirstFlow .v73-hidden-compat{display:none!important}
      #clProfileFirstFlow .cl3-actions{display:flex;gap:10px;margin-top:18px}
      #clProfileFirstFlow .cl3-next{flex:1;border:0;border-radius:14px;padding:15px;background:#df4d86;color:#fff;font-size:16px;font-weight:700}
      #clProfileFirstFlow .cl3-back{width:110px;border:1px solid #ddd;border-radius:14px;background:#fff;color:#555;padding:14px;font-weight:700}
      #clProfileFirstFlow .cl3-status{min-height:1.4em;margin-top:9px;color:#8a919a;font-size:13px}
      body.cl-profile-first-active #v72Shell,body.cl-profile-first-active .v72-page-dots{display:none!important}
    `;document.head.appendChild(s);
  }

  function removeOldFlow(){
    const old=document.getElementById('clProfileFirstFlow');
    if(old)old.remove();
    const oldStyle=document.getElementById('clProfileFirstFlowStyle');
    if(oldStyle)oldStyle.remove();
  }

  function renderChooser(root,p){
    const old=root.querySelector('.cl3-chooser');if(old)old.remove();
    const box=document.createElement('div');box.className='cl3-chooser';
    const title=document.createElement('div');title.className='cl3-chooser-title';title.textContent='保存済みプロフィール';box.appendChild(title);
    const listEl=document.createElement('div');listEl.className='cl3-profile-list';
    const arr=typeof list==='function'?list(p):[];const active=typeof activeProfile==='function'?activeProfile(p):null;
    if(!arr.length){const empty=document.createElement('div');empty.textContent='まだ保存されたプロフィールはありません。';empty.style.cssText='color:#8a919a;font-size:13px';listEl.appendChild(empty)}
    arr.forEach(x=>{const b=document.createElement('button');b.type='button';b.textContent=(active===x.name?'● ':'')+x.name;b.classList.toggle('active',active===x.name);b.onclick=()=>{if(typeof setActiveProfile==='function')setActiveProfile(p,x.name);if(typeof apply==='function')apply(p,x.state||{});const n=document.getElementById(p+'Name');if(n)n.value=x.name;renderChooser(root,p)};listEl.appendChild(b)});
    box.appendChild(listEl);
    const fresh=document.createElement('button');fresh.type='button';fresh.className='cl3-new';fresh.textContent='＋ 新しく作る';
    fresh.onclick=()=>{const n=document.getElementById(p+'Name');if(n)n.value='';const f=document.getElementById(p+'Free');if(f)f.value='';document.querySelectorAll('#'+p+'Traits .chip').forEach(x=>x.classList.remove('on'));renderChooser(root,p)};
    box.appendChild(fresh);root.prepend(box);
  }

  function mount(){
    const shell=document.getElementById('v72Shell');
    const profile=document.querySelector('.v74-profile-panel');
    if(!shell||!profile||!shell.parentNode)return false;
    removeOldFlow();css();
    const flow=document.createElement('section');flow.id='clProfileFirstFlow';flow.setAttribute('aria-label','プロフィール設定');
    flow.innerHTML=`
      <div class="cl3-step on" data-step="1"><div class="cl3-head"><div class="cl3-kicker">STEP 1</div><h1>まず、あなたについて</h1><p class="cl3-lead">最初に自分のプロフィールを選ぶか、新しく作ります。プロフィールや特性チェックを使わなくても、そのまま進められます。</p></div><div class="cl3-progress"><i class="on"></i><i></i></div><div id="cl3My"></div><div class="cl3-actions"><button type="button" class="cl3-next" id="cl3MyNext">次へ：相手を設定する →</button></div><div class="cl3-status" id="cl3MyStatus"></div></div>
      <div class="cl3-step" data-step="2"><div class="cl3-head"><div class="cl3-kicker">STEP 2</div><h1>次に、相手について</h1><p class="cl3-lead">今回の会話の相手を選ぶか、新しく作ります。</p></div><div class="cl3-progress"><i class="on"></i><i class="on"></i></div><div id="cl3Partner"></div><div class="cl3-actions"><button type="button" class="cl3-back" id="cl3Back">← 戻る</button><button type="button" class="cl3-next" id="cl3PartnerNext">次へ：特性チェックへ →</button></div><div class="cl3-status" id="cl3PartnerStatus"></div></div>`;
    shell.parentNode.insertBefore(flow,shell);
    const myRoot=flow.querySelector('#cl3My'),paRoot=flow.querySelector('#cl3Partner');
    myRoot.appendChild(profile);renderChooser(myRoot,'my');
    const my=document.getElementById('profileMyPane'),pa=document.getElementById('profilePartnerPane');
    const show=n=>{flow.querySelectorAll('.cl3-step').forEach(x=>x.classList.toggle('on',x.dataset.step===String(n)));if(my)my.style.setProperty('display',n===1?'block':'none','important');if(pa)pa.style.setProperty('display',n===2?'block':'none','important');if(n===2){paRoot.appendChild(profile);renderChooser(paRoot,'partner')}else if(profile.parentNode!==myRoot)myRoot.appendChild(profile);window.scrollTo(0,0)};
    document.body.classList.add('cl-profile-first-active');shell.style.setProperty('display','none','important');
    document.querySelector('.v72-page-dots')?.style.setProperty('display','none','important');show(1);
    document.getElementById('cl3MyNext').onclick=()=>{const n=document.getElementById('myName');if(!n?.value.trim()){document.getElementById('cl3MyStatus').textContent='プロフィール名を入力してください';n?.focus();return}if(typeof save==='function'&&!save('my',{close:false,toast:false}))return;show(2)};
    document.getElementById('cl3Back').onclick=()=>show(1);
    document.getElementById('cl3PartnerNext').onclick=()=>{const n=document.getElementById('partnerName');if(!n?.value.trim()){document.getElementById('cl3PartnerStatus').textContent='プロフィール名を入力してください';n?.focus();return}const rel=window.CoreLingualRelationship?.get?.();if(!rel){document.getElementById('cl3PartnerStatus').textContent='相手との関係を選択してね。';return}if(typeof save==='function'&&!save('partner',{close:false,toast:false}))return;flow.remove();profile.style.display='none';shell.style.removeProperty('display');document.body.classList.remove('cl-profile-first-active');};
    return true;
  }

  function start(){let tries=0;const run=()=>{if(mount())return;if(++tries<120)setTimeout(run,100)};run()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
