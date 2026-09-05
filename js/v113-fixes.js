/* CoreLingual v113 — expose comparison data to export layer */
(function(){
  'use strict';

  function exposeCompareData(){
    try{
      if(typeof activeProfile!=='function' || typeof compareSourceOptions!=='function') return false;
      window.getActiveCompareData=function(){
        const myName=activeProfile('my');
        const paName=activeProfile('partner');
        const myOpts=compareSourceOptions('my');
        const paOpts=compareSourceOptions('partner');
        return {
          myName:myName||'あなた',
          paName:paName||'相手',
          my:myOpts.find(o=>o.id==='prof:my:'+myName)||myOpts.find(o=>o.id==='live:my'),
          partner:paOpts.find(o=>o.id==='prof:partner:'+paName)||paOpts.find(o=>o.id==='live:partner')
        };
      };
      return true;
    }catch(e){
      console.warn('v113 compare data bridge failed',e);
      return false;
    }
  }

  if(!exposeCompareData()){
    let tries=0;
    const timer=setInterval(()=>{
      if(exposeCompareData() || ++tries>=20) clearInterval(timer);
    },50);
  }
})();
