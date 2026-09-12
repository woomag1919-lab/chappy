/* CoreLingual — reset deep-check UI when switching diagnosis profiles */
(function(){
  'use strict';

  function resetDeepUiForProfile(p){
    try{
      if(typeof extraTarget!=='undefined')extraTarget=p;
      if(typeof extraTimer!=='undefined'&&extraTimer){clearInterval(extraTimer);extraTimer=null;}
      const q=document.getElementById('extraQuestions');
      const r=document.getElementById('extraResult');
      const d=document.getElementById('extraDiag');
      const ad=document.getElementById('ad30');
      const c=document.getElementById('ad30Countdown');
      const btn=document.getElementById('startMore');
      if(q)q.querySelectorAll('input[type="radio"]').forEach(x=>x.checked=false);
      const free=document.getElementById('extraFree');if(free)free.value='';
      if(r)r.innerHTML='';
      if(d)d.style.display='none';
      if(ad)ad.style.display='none';
      if(c)c.textContent='';
      if(btn)btn.disabled=false;
    }catch(e){console.warn('deep profile reset failed',e)}
  }

  window.CoreLingualProfileDiagnosisReset={reset:resetDeepUiForProfile};

  function bind(which){
    const el=document.getElementById(which==='my'?'selfDiag':'otherDiag');
    if(!el||el.__corelingualProfileDiagnosisReset)return;
    el.__corelingualProfileDiagnosisReset=true;
    el.addEventListener('click',()=>setTimeout(()=>resetDeepUiForProfile(which),0));
  }

  bind('my');
  bind('partner');

  window.addEventListener('corelingual:profile-change',e=>{
    const which=e?.detail?.profile;
    if(which==='my'||which==='partner')resetDeepUiForProfile(which);
  });
})();
