/* CoreLingual v113 — expose comparison data to export layer */
(function(){
  'use strict';

  function exposeCompareData(){
    try{
      if(typeof activeProfile!=='function' || typeof compareSourceOptions!=='function') return false;
      window.getActiveCompareData=function(){
        const myName=activeProfile('my');
        const paName=activeProfile('partner');
        const myOpts=compareSourceOptions('my');
        const paOpts=compareSourceOptions('partner');
        return {myName:myName||'あなた',paName:paName||'相手',my:myOpts.find(o=>o.id==='prof:my:'+myName)||myOpts.find(o=>o.id==='live:my'),partner:paOpts.find(o=>o.id==='prof:partner:'+paName)||paOpts.find(o=>o.id==='live:partner')};
      };
      return true;
    }catch(e){console.warn('v113 compare data bridge failed',e);return false}
  }
  if(!exposeCompareData()){let tries=0;const timer=setInterval(()=>{if(exposeCompareData()||++tries>=20)clearInterval(timer)},50)}

  function resetBaseDiagnosisBeforeRestore(){try{document.querySelectorAll('#questions input[type="radio"]').forEach(x=>x.checked=false);if(typeof diagAnswers!=='undefined')diagAnswers=[];if(typeof diagScores!=='undefined')diagScores=[];const resultEl=document.getElementById('diagResult'),moreEl=document.getElementById('moreDiag');if(resultEl)resultEl.innerHTML='';if(moreEl)moreEl.style.display='none'}catch(e){console.warn('v115 diagnosis reset failed',e)}}
  function wrapRestoreDiagAnswers(){try{const orig=window.restoreDiagAnswers;if(typeof orig!=='function'||orig.__v115Wrapped)return !!orig;const wrapped=function(p){resetBaseDiagnosisBeforeRestore();const result=orig(p);if(!result)resetBaseDiagnosisBeforeRestore();return result};wrapped.__v115Wrapped=true;window.restoreDiagAnswers=wrapped;return true}catch(e){console.warn('v115 restore wrapper failed',e);return false}}
  if(!wrapRestoreDiagAnswers()){let tries=0;const timer=setInterval(()=>{if(wrapRestoreDiagAnswers()||++tries>=40)clearInterval(timer)},50)}

  function resetDiagSheetScroll(){try{const overlay=document.getElementById('v72DiagOverlay'),sheet=overlay?.querySelector('.v72-sheet');if(sheet)sheet.scrollTop=0}catch(e){console.warn('v117 diagnosis scroll reset failed',e)}}
  function installDiagScrollReset(){try{const overlay=document.getElementById('v72DiagOverlay');if(!overlay||overlay.__v117ScrollReset)return !!overlay;overlay.__v117ScrollReset=true;const reset=()=>{resetDiagSheetScroll();requestAnimationFrame(resetDiagSheetScroll);setTimeout(resetDiagSheetScroll,50)};const openBtn=document.getElementById('v72OpenDiag');if(openBtn)openBtn.addEventListener('click',reset,true);new MutationObserver(()=>{if(overlay.classList.contains('show'))reset()}).observe(overlay,{attributes:true,attributeFilter:['class']});return true}catch(e){console.warn('v117 diagnosis scroll hook failed',e);return false}}
  if(!installDiagScrollReset()){let tries=0;const timer=setInterval(()=>{if(installDiagScrollReset()||++tries>=40)clearInterval(timer)},50)}
})();

/* CoreLingual v120 — load comparison difference visibility fix */
(function(){
  try{
    if(!document.querySelector('script[data-corelingual-v120]')){
      const s=document.createElement('script');
      s.src='/js/v120-fixes.js?v=1202';
      s.dataset.corelingualV120='1';
      document.body.appendChild(s);
    }
  }catch(e){console.warn('v120 loader failed',e)}
})();

/* CoreLingual v121 — existing-profile diagnosis edit is a draft; × cancels it completely. */
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
    }catch(e){console.warn('v121 diagnosis cancel UI restore failed',e)}
    try{
      if(typeof extraTarget!=='undefined')extraTarget=snapshot.which;
      const q=document.getElementById('extraQuestions');
      if(q)q.querySelectorAll('input[type="radio"]').forEach(x=>x.checked=false);
      const free=document.getElementById('extraFree');if(free)free.value='';
      const d=document.getElementById('extraDiag');if(d)d.style.display='none';
      const ad=document.getElementById('ad30');if(ad)ad.style.display='none';
      const r=document.getElementById('extraResult');if(r)r.innerHTML='';
    }catch(e){console.warn('v121 deep cancel UI cleanup failed',e)}
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

    if(!open.__v121){
      open.__v121=true;
      open.addEventListener('click',()=>{
        const which=getWhich();
        captureSnapshot(which);
        setTimeout(()=>{
          try{if(typeof restoreDiagAnswers==='function')restoreDiagAnswers(which)}catch(e){console.warn('v121 base diagnosis restore failed',e)}
        },30);
      });
    }
    if(!close.__v121){
      close.__v121=true;
      close.addEventListener('click',()=>setTimeout(restoreSnapshot,0));
    }
    if(!save.__v121){
      save.__v121=true;
      save.addEventListener('click',()=>setTimeout(markSavedIfClosed,0));
    }
    return true;
  }

  if(!install()){let tries=0;const timer=setInterval(()=>{if(install()||++tries>=80)clearInterval(timer)},50)}
})();
