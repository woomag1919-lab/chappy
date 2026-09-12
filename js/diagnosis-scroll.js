/* CoreLingual diagnosis-scroll — reset diagnosis sheet to the top when opened */
(function(){
  'use strict';
  function reset(){
    try{
      const overlay=document.getElementById('v72DiagOverlay'),sheet=overlay?.querySelector('.v72-sheet');
      if(sheet)sheet.scrollTop=0;
    }catch(e){console.warn('diagnosis scroll reset failed',e)}
  }
  function install(){
    try{
      const overlay=document.getElementById('v72DiagOverlay');
      if(!overlay||overlay.__corelingualDiagnosisScroll)return !!overlay;
      overlay.__corelingualDiagnosisScroll=true;
      const run=()=>{reset();requestAnimationFrame(reset);setTimeout(reset,50)};
      document.getElementById('v72OpenDiag')?.addEventListener('click',run,true);
      new MutationObserver(()=>{if(overlay.classList.contains('show'))run()}).observe(overlay,{attributes:true,attributeFilter:['class']});
      return true;
    }catch(e){console.warn('diagnosis scroll hook failed',e);return false}
  }
  if(!install()){
    let tries=0;
    const timer=setInterval(()=>{if(install()||++tries>=40)clearInterval(timer)},50);
  }
})();
