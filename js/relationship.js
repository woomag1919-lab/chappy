/* CoreLingual — relationship feature entry point
 *
 * Keep the relationship-specific implementation files versioned for now,
 * but expose one stable entry point so profiles.js does not need to know
 * about v147/v148/v149/v150 individually.
 *
 * Load order is intentional:
 *   v147 = relationship-specific questions / scoring
 *   v148 = relationship persistence bridge
 *   v149 = result wording / profile-apply polish (loaded by v148 too)
 *   v150 = profile UI visibility + immediate name sync
 */
(function(){
  'use strict';

  const files=[
    ['/js/v147-relationship-check.js?v=1472','corelingual-v147'],
    ['/js/v148-relationship-ui.js?v=1482','corelingual-v148'],
    ['/js/v150-profile-fix.js?v=1502','corelingual-v150']
  ];

  function load(src,key){
    return new Promise(resolve=>{
      if(document.querySelector(`script[data-${key}]`)){resolve();return}
      const s=document.createElement('script');
      s.src=src;
      s.dataset[key]='1';
      s.onload=()=>resolve();
      s.onerror=()=>{console.warn('CoreLingual relationship module failed to load:',src);resolve()};
      document.body.appendChild(s);
    });
  }

  async function install(){
    for(const [src,key] of files) await load(src,key);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
})();
