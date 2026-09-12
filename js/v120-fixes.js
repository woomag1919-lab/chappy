/* CoreLingual compatibility loader — stable comparison differences module */
(function(){
  'use strict';
  if(document.querySelector('script[data-corelingual-comparison-differences]'))return;
  const s=document.createElement('script');
  s.src='/js/comparison-differences.js?v=1';
  s.setAttribute('data-corelingual-comparison-differences','1');
  document.body.appendChild(s);
})();
