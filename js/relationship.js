/* CoreLingual — stable relationship feature entry point */
(function(){
  'use strict';

  const files=[
    ['/js/v147-relationship-check.js?v=1473','corelingual-v147'],
    ['/js/v148-relationship-ui.js?v=1483','corelingual-v148'],
    ['/js/v150-profile-fix.js?v=1503','corelingual-v150']
  ];

  function load(src,key){
    return new Promise(resolve=>{
      if(document.querySelector(`script[data-${key}]`)){resolve();return;}
      const s=document.createElement('script');
      s.src=src;
      s.dataset[key]='1';
      s.onload=()=>resolve();
      s.onerror=()=>{console.warn('CoreLingual relationship module failed to load:',src);resolve()};
      (document.body||document.documentElement).appendChild(s);
    });
  }

  async function install(){
    for(const [src,key] of files)await load(src,key);
  }

  function start(){
    if(!document.body){setTimeout(start,25);return;}
    install();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
