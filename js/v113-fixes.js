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

/* CoreLingual diagnosis-draft — load stable diagnosis edit cancel/restore module */
(function(){
  try{
    if(!document.querySelector('script[data-corelingual-diagnosis-draft]')){
      const s=document.createElement('script');
      s.src='/js/diagnosis-draft.js?v=1';
      s.dataset.corelingualDiagnosisDraft='1';
      document.body.appendChild(s);
    }
  }catch(e){console.warn('diagnosis draft loader failed',e)}
})();
