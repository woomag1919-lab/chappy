/* CoreLingual compare-data — active profile bridge for comparison/export */
(function(){
  'use strict';
  function expose(){
    try{
      if(typeof activeProfile!=='function'||typeof compareSourceOptions!=='function')return false;
      window.getActiveCompareData=function(){
        const myName=activeProfile('my'),paName=activeProfile('partner');
        const myOpts=compareSourceOptions('my'),paOpts=compareSourceOptions('partner');
        return {
          myName:myName||'あなた',
          paName:paName||'相手',
          my:myOpts.find(o=>o.id==='prof:my:'+myName)||myOpts.find(o=>o.id==='live:my'),
          partner:paOpts.find(o=>o.id==='prof:partner:'+paName)||paOpts.find(o=>o.id==='live:partner')
        };
      };
      return true;
    }catch(e){console.warn('compare data bridge failed',e);return false}
  }
  if(!expose()){
    let tries=0;
    const timer=setInterval(()=>{if(expose()||++tries>=20)clearInterval(timer)},50);
  }
})();
