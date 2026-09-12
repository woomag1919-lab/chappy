/* CoreLingual diagnosis-draft — existing-profile diagnosis edit cancel/restore */
(function(){
  'use strict';

  const KEY_PREFIXES=['cl_diag_result_','cl_diag_radar_','cl_extra_result_','cl_extra_radar_'];
  let snapshot=null;

  function getWhich(){try{return typeof target!=='undefined'&&target?target:'my'}catch{return'my'}}
  function draftKey(which){
    try{
      const name=typeof activeProfile==='function'?activeProfile(which):null;
      return 'cl_extra_draft_'+which+'_'+encodeURIComponent(name||'__none__');
    }catch{return null}
  }
  function captureSnapshot(which){
    const keys=KEY_PREFIXES.map(prefix=>prefix+which);
    const dk=draftKey(which);if(dk)keys.push(dk);
    const values={};keys.forEach(k=>{values[k]=localStorage.getItem(k)});
    snapshot={which,values,saved:false};
  }
  function restoreSnapshot(){
    if(!snapshot||snapshot.saved)return;
    Object.entries(snapshot.values).forEach(([k,v])=>{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)});
    try{
      const which=snapshot.which;
      if(typeof restoreDiagAnswers==='function')restoreDiagAnswers(which);
      if(typeof syncDiagnosisForProfile==='function'){
        const name=typeof activeProfile==='function'?activeProfile(which):null;
        const prof=name&&typeof list==='function'?list(which).find(x=>x.name===name):null;
        if(prof)syncDiagnosisForProfile(which,prof);
      }
    }catch(e){console.warn('diagnosis draft cancel UI restore failed',e)}
    try{
      if(typeof extraTarget!=='undefined')extraTarget=snapshot.which;
      const q=document.getElementById('extraQuestions');
      if(q)q.querySelectorAll('input[type="radio"]').forEach(x=>x.checked=false);
      const free=document.getElementById('extraFree');if(free)free.value='';
      const d=document.getElementById('extraDiag');if(d)d.style.display='none';
      const ad=document.getElementById('ad30');if(ad)ad.style.display='none';
      const r=document.getElementById('extraResult');if(r)r.innerHTML='';
    }catch(e){console.warn('diagnosis draft deep cancel UI cleanup failed',e)}
    snapshot=null;
  }

  function markSavedIfClosed(){
    if(!snapshot)return;
    const overlay=document.getElementById('v72DiagOverlay');
    if(overlay && overlay.classList.contains('show'))return;
    snapshot.saved=true;
    snapshot=null;
  }

  function install(){
    const open=document.getElementById('v72OpenDiag');
    const close=document.getElementById('v72DiagClose');
    const save=document.getElementById('v72DiagSaveClose');
    if(!open||!close||!save)return false;

    if(!open.__corelingualDiagnosisDraft){
      open.__corelingualDiagnosisDraft=true;
      open.addEventListener('click',()=>{
        const which=getWhich();
        captureSnapshot(which);
        setTimeout(()=>{
          try{if(typeof restoreDiagAnswers==='function')restoreDiagAnswers(which)}catch(e){console.warn('diagnosis draft base restore failed',e)}
        },30);
      });
    }
    if(!close.__corelingualDiagnosisDraft){
      close.__corelingualDiagnosisDraft=true;
      close.addEventListener('click',()=>setTimeout(restoreSnapshot,0));
    }
    if(!save.__corelingualDiagnosisDraft){
      save.__corelingualDiagnosisDraft=true;
      save.addEventListener('click',()=>setTimeout(markSavedIfClosed,0));
    }
    return true;
  }

  if(!install()){
    let tries=0;
    const timer=setInterval(()=>{if(install()||++tries>=80)clearInterval(timer)},50);
  }
})();
