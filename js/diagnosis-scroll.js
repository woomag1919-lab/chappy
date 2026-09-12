/* CoreLingual diagnosis-scroll — diagnosis sheet scroll behavior */
(function(){
  'use strict';

  function reset(){
    try{
      const overlay=document.getElementById('v72DiagOverlay'),sheet=overlay?.querySelector('.v72-sheet');
      if(sheet)sheet.scrollTop=0;
    }catch(e){console.warn('diagnosis scroll reset failed',e)}
  }

  function installReset(){
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

  function isVisible(el){return !!el && getComputedStyle(el).display!=='none' && el.getClientRects().length>0;}

  /* Former v144: after starting the deep check, reveal the newly inserted questions. */
  function scrollToDeepCheck(){
    const extra=document.getElementById('extraDiag');
    if(!isVisible(extra))return false;
    const sheet=extra.closest('.v72-sheet');
    if(sheet){
      const extraRect=extra.getBoundingClientRect();
      const sheetRect=sheet.getBoundingClientRect();
      const target=sheet.scrollTop+(extraRect.top-sheetRect.top)-90;
      sheet.scrollTo({top:Math.max(0,target),behavior:'smooth'});
    }else{
      extra.scrollIntoView({behavior:'smooth',block:'start'});
    }
    return true;
  }

  function installDeepCheckReveal(){
    const btn=document.getElementById('startMore');
    const extra=document.getElementById('extraDiag');
    if(!btn||!extra||btn.__corelingualDeepRevealBound)return;
    btn.__corelingualDeepRevealBound=true;
    let waiting=false;
    const observer=new MutationObserver(()=>{
      if(!waiting)return;
      if(scrollToDeepCheck()){waiting=false;observer.disconnect();}
    });
    const tryScroll=()=>{
      if(!waiting)return;
      if(scrollToDeepCheck()){waiting=false;observer.disconnect();}
    };
    observer.observe(extra,{attributes:true,attributeFilter:['style','class'],childList:true,subtree:true});
    btn.addEventListener('click',()=>{
      waiting=true;
      requestAnimationFrame(()=>requestAnimationFrame(tryScroll));
    });
  }

  /* Former v145: after the first 18-question results render, reveal the result section. */
  function scrollToFirstResult(){
    const result=document.getElementById('diagResult');
    if(!isVisible(result) || !result.textContent.trim())return false;
    const sheet=result.closest('.v72-sheet');
    if(sheet){
      const resultRect=result.getBoundingClientRect();
      const sheetRect=sheet.getBoundingClientRect();
      const target=sheet.scrollTop+(resultRect.top-sheetRect.top)-70;
      sheet.scrollTo({top:Math.max(0,target),behavior:'smooth'});
    }else{
      result.scrollIntoView({behavior:'smooth',block:'start'});
    }
    return true;
  }

  function installFirstResultReveal(){
    const btn=document.getElementById('runDiag');
    const result=document.getElementById('diagResult');
    if(!btn||!result||btn.__corelingualFirstResultBound)return;
    btn.__corelingualFirstResultBound=true;
    let waiting=false;
    const observer=new MutationObserver(()=>{
      if(!waiting)return;
      if(scrollToFirstResult()){waiting=false;observer.disconnect();}
    });
    observer.observe(result,{attributes:true,attributeFilter:['style','class'],childList:true,subtree:true,characterData:true});
    btn.addEventListener('click',()=>{
      waiting=true;
      requestAnimationFrame(()=>requestAnimationFrame(()=>scrollToFirstResult()));
    });
  }

  function install(){
    installReset();
    installDeepCheckReveal();
    installFirstResultReveal();
    return !!document.getElementById('v72DiagOverlay');
  }

  if(!install()){
    let tries=0;
    const timer=setInterval(()=>{
      if(install()||++tries>=40)clearInterval(timer);
    },50);
  }
  window.addEventListener('load',install);
})();
