/* CoreLingual — legacy compatibility fixes entry point
 * Keep the historical fix modules versioned, but load them through one stable entry point.
 * Order matters: v112 -> v113 (v113 then loads the v120+ compatibility bundle).
 */
(function(){
  'use strict';
  const files=[
    ['/js/v112-fixes.js?v=1122','corelingual-v112'],
    ['/js/v113-fixes.js?v=1132','corelingual-v113']
  ];
  function load(src,key){
    return new Promise(resolve=>{
      if(document.querySelector(`script[data-${key}]`)){resolve();return}
      const s=document.createElement('script');
      s.src=src;
      s.dataset[key]='1';
      s.onload=()=>resolve();
      s.onerror=()=>{console.warn('CoreLingual compatibility module failed to load:',src);resolve()};
      document.body.appendChild(s);
    });
  }
  async function install(){for(const [src,key] of files)await load(src,key)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
