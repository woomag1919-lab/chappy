/* CoreLingual compatibility loader — stable diagnosis/profile modules */
(function(){
  'use strict';

  function load(src,marker){
    if(document.querySelector('script['+marker+']'))return;
    const s=document.createElement('script');
    s.src=src;
    s.setAttribute(marker,'1');
    document.body.appendChild(s);
  }

  try{
    load('/js/profile-diagnosis-reset.js?v=1','data-corelingual-profile-diagnosis-reset');
    load('/js/diagnosis-save.js?v=1','data-corelingual-diagnosis-save');
  }catch(e){console.warn('CoreLingual diagnosis compatibility loader failed',e)}
})();
