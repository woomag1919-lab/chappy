/* CoreLingual compatibility loader — stable comparison/diagnosis modules */
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
    load('/js/compare-data.js?v=1','data-corelingual-compare-data');
    load('/js/comparison-differences.js?v=1','data-corelingual-comparison-differences');
    load('/js/diagnosis-scroll.js?v=1','data-corelingual-diagnosis-scroll');
    load('/js/diagnosis-draft.js?v=1','data-corelingual-diagnosis-draft');
  }catch(e){console.warn('CoreLingual compatibility loader failed',e)}
})();
