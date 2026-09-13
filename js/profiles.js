/* CoreLingual — profile state / save / selection */
function state(p){
  return {
    traits:[...document.querySelectorAll('#'+p+'Traits .on')].map(x=>x.textContent),
    free:document.getElementById(p+'Free')?.value||''
  };
}

function apply(p,s){
  const free=document.getElementById(p+'Free');
  if(free)free.value=s?.free||'';
  document.querySelectorAll('#'+p+'Traits .chip').forEach(x=>x.classList.toggle('on',(s?.traits||[]).includes(x.textContent)));
}

function list(p){
  try{return JSON.parse(localStorage.getItem('cl_'+p)||'[]')}catch{return[]}
}

function activeProfile(p){
  try{return JSON.parse(localStorage.getItem('cl_'+p+'_active')||'null')}catch{return null}
}

function setActiveProfile(p,name){
  localStorage.setItem('cl_'+p+'_active',JSON.stringify(name));
}

function syncDiagnosisForProfile(p,profile){
  const baseKey='cl_diag_result_'+p;
  const radarKey='cl_diag_radar_'+p;
  const extraKey='cl_extra_result_'+p;
  const extraRadarKey='cl_extra_radar_'+p;
  const scores=Array.isArray(profile?.scores)?profile.scores:[];
  const answers=Array.isArray(profile?.answers)?profile.answers:[];
  const deepScores=Array.isArray(profile?.deepScores)?profile.deepScores:[];
  const deepAnswers=Array.isArray(profile?.deepAnswers)?profile.deepAnswers:[];

  if(scores.length){
    localStorage.setItem(baseKey,JSON.stringify({
      scores:scores.map(x=>({key:x.key,score:Number(x.score)||50})),
      answers:answers.slice(0,18),
      updatedAt:Number(profile.updatedAt)||Date.now()
    }));
    try{
      const radar=Array.isArray(profile.radar)&&profile.radar.length
        ?profile.radar
        :(typeof axisValuesFromScores==='function'?axisValuesFromScores(scores):null);
      if(radar)localStorage.setItem(radarKey,JSON.stringify(radar));
    }catch{}
  }else{
    localStorage.removeItem(baseKey);
    localStorage.removeItem(radarKey);
  }

  if(deepScores.length){
    localStorage.setItem(extraKey,JSON.stringify({
      kind:'deep',
      scores:deepScores.map(x=>({key:x.key,score:Number(x.score)||50})),
      answers:deepAnswers.slice(0,18),
      free:profile?.state?.free||'',
      updatedAt:Number(profile.updatedAt)||Date.now()
    }));
    localStorage.setItem(extraRadarKey,JSON.stringify({deep:deepScores}));
  }else{
    localStorage.removeItem(extraKey);
    localStorage.removeItem(extraRadarKey);
  }

  try{
    if(typeof restoreDiagAnswers==='function')restoreDiagAnswers(p);
  }catch(e){console.warn('diagnosis restore failed',e)}
}

function draw(p){
  const e=document.getElementById(p+'Profiles');
  if(!e)return;
  e.innerHTML='';
  const active=activeProfile(p);

  list(p).forEach((x,idx)=>{
    const b=document.createElement('button');
    b.className='profile'+(active===x.name?' active':'');
    b.type='button';
    b.textContent=(active===x.name?'● ':'')+x.name;
    let timer=null,longPressed=false;

    const cancel=()=>{
      if(timer){clearTimeout(timer);timer=null}
    };

    b.addEventListener('pointerdown',()=>{
      longPressed=false;
      timer=setTimeout(()=>{
        longPressed=true;
        if(confirm('「'+x.name+'」を削除しますか？')){
          const a=list(p);
          a.splice(idx,1);
          localStorage.setItem('cl_'+p,JSON.stringify(a));
          if(active===x.name){
            localStorage.removeItem('cl_'+p+'_active');
            syncDiagnosisForProfile(p,{});
          }
          draw(p);
          if(typeof renderTwoPersonComparison==='function')renderTwoPersonComparison();
          if(typeof setNames==='function')setNames();
        }
      },650);
    });

    b.addEventListener('pointerup',cancel);
    b.addEventListener('pointercancel',cancel);
    b.addEventListener('pointerleave',cancel);

    b.addEventListener('click',()=>{
      if(longPressed)return;
      setActiveProfile(p,x.name);
      apply(p,x.state||{});
      syncDiagnosisForProfile(p,x);
      draw(p);
      if(typeof renderTwoPersonComparison==='function')renderTwoPersonComparison();
      if(typeof setNames==='function')setNames();
      window.dispatchEvent(new CustomEvent('corelingual:profile-change',{detail:{profile:p,name:x.name}}));
    });

    e.appendChild(b);
  });
}

function clearNameRequired(p){
  const input=document.getElementById(p+'Name');
  const error=document.getElementById(p+'NameError');
  if(input)input.classList.remove('v84-name-invalid');
  if(input)input.removeAttribute('aria-invalid');
  if(error)error.textContent='';
}

function showSaveNameRequired(p){
  const input=document.getElementById(p+'Name');
  const error=document.getElementById(p+'NameError');
  if(error)error.textContent='プロフィール名を入力してください';
  if(input){
    input.classList.add('v84-name-invalid');
    input.setAttribute('aria-invalid','true');
    input.focus();
    input.scrollIntoView({block:'center',behavior:'smooth'});
  }
}

function save(p,opts={}){
  const input=document.getElementById(p+'Name');
  const name=input?.value?.trim()||'';
  if(!name){showSaveNameRequired(p);return false}
  clearNameRequired(p);

  const btn=document.getElementById(p==='my'?'saveMy':'savePartner');
  if(btn?.dataset.saving==='1')return false;
  if(btn)btn.dataset.saving='1';

  let a=list(p);
  const existing=a.findIndex(x=>x.name===name);
  const old=existing>=0?a[existing]:null;

  // New profile names must not inherit a stale deep-check draft from a prior profile.
  if(existing<0){
    try{
      localStorage.removeItem('cl_extra_draft_'+p+'_'+encodeURIComponent(name));
      localStorage.removeItem('cl_extra_draft_'+p);
    }catch(e){console.warn('new profile draft reset failed',e)}
  }

  const relationship=p==='partner'
    ?(document.querySelector('#clRelationshipBox [data-rel].on')?.dataset.rel||old?.relationship||localStorage.getItem('cl_partner_relationship')||'romantic')
    :null;

  const item={
    name,
    state:state(p),
    ...(old?.scores?{scores:old.scores}:{}),
    ...(old?.answers?{answers:old.answers}:{}),
    ...(old?.deepScores?{deepScores:old.deepScores}:{}),
    ...(old?.deepAnswers?{deepAnswers:old.deepAnswers}:{}),
    ...(old?.updatedAt?{updatedAt:old.updatedAt}:{}),
    ...(p==='partner'?{relationship}: {})
  };

  if(existing>=0)a[existing]=item;else a.push(item);
  a=a.slice(-5);
  localStorage.setItem('cl_'+p,JSON.stringify(a));
  setActiveProfile(p,name);
  syncDiagnosisForProfile(p,item);
  draw(p);
  if(typeof renderTwoPersonComparison==='function')renderTwoPersonComparison();

  if(opts.close!==false){
    document.getElementById('v72ProfileOverlay')?.classList.remove('show');
    if(typeof setNames==='function')setNames();
  }

  if(opts.toast!==false){
    const toast=document.createElement('div');
    toast.className='v76-profile-toast';
    toast.textContent='✓ プロフィールを保存しました';
    document.body.appendChild(toast);
    setTimeout(()=>toast.remove(),1800);
  }

  if(btn)setTimeout(()=>{btn.dataset.saving='0'},300);
  window.dispatchEvent(new CustomEvent('corelingual:profile-save',{detail:{profile:p,name}}));
  return true;
}

function bindProfileActions(){
  const saveMy=document.getElementById('saveMy');
  const savePartner=document.getElementById('savePartner');
  if(saveMy&&!saveMy.__corelingualBound){saveMy.__corelingualBound=true;saveMy.onclick=()=>save('my');}
  if(savePartner&&!savePartner.__corelingualBound){savePartner.__corelingualBound=true;savePartner.onclick=()=>save('partner');}
  draw('my');
  draw('partner');
}

function loadRelationshipFeature(){
  if(document.querySelector('script[data-corelingual-relationship]'))return;
  const s=document.createElement('script');
  s.src='/js/relationship.js?v=1';
  s.dataset.corelingualRelationship='1';
  s.onload=()=>window.dispatchEvent(new CustomEvent('corelingual:relationship-ready'));
  s.onerror=()=>console.warn('CoreLingual relationship feature failed to load');
  document.body.appendChild(s);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{
    bindProfileActions();
    loadRelationshipFeature();
  },{once:true});
}else{
  bindProfileActions();
  loadRelationshipFeature();
}
