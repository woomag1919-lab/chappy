/* CoreLingual — onboarding v2 compatibility loader */
(function(){
  'use strict';
  if(window.__corelingualProfileFirstFlowV2Loader)return;
  window.__corelingualProfileFirstFlowV2Loader=true;
  function load(){
    if(document.querySelector('script[data-corelingual-onboarding-v3]'))return;
    const s=document.createElement('script');
    s.src='/js/onboarding-v3.js?v=1';
    s.dataset.corelingualOnboardingV3='1';
    s.onerror=()=>console.warn('CoreLingual onboarding v3 failed to load');
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
