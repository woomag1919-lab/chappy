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

  /* v115 — 新しいプロフィールに前プロフィールの18問回答を残さない */
  function resetBaseDiagnosisBeforeRestore(){
    try{
      document.querySelectorAll('#questions input[type="radio"]').forEach(x=>x.checked=false);
      if(typeof diagAnswers!=='undefined') diagAnswers=[];
      if(typeof diagScores!=='undefined') diagScores=[];
      const resultEl=document.getElementById('diagResult');
      const moreEl=document.getElementById('moreDiag');
      if(resultEl) resultEl.innerHTML='';
      if(moreEl) moreEl.style.display='none';
    }catch(e){console.warn('v115 diagnosis reset failed',e)}
  }

  function wrapRestoreDiagAnswers(){
    try{
      const orig=window.restoreDiagAnswers;
      if(typeof orig!=='function' || orig.__v115Wrapped)return !!orig;
      const wrapped=function(p){
        resetBaseDiagnosisBeforeRestore();
        const result=orig(p);
        if(!result) resetBaseDiagnosisBeforeRestore();
        return result;
      };
      wrapped.__v115Wrapped=true;
      window.restoreDiagAnswers=wrapped;
      return true;
    }catch(e){console.warn('v115 restore wrapper failed',e);return false}
  }

  if(!wrapRestoreDiagAnswers()){
    let tries=0;
    const timer=setInterval(()=>{
      if(wrapRestoreDiagAnswers() || ++tries>=40) clearInterval(timer);
    },50);
  }

  /* v116 — 同名プロフィールを削除→再作成した場合も、深掘り18問の下書きを引き継がない */
  function wrapProfileSave(){
    try{
      const orig=window.save;
      if(typeof orig!=='function' || orig.__v116Wrapped)return !!orig;
      const wrapped=function(p,opts){
        try{
          const input=document.getElementById(p+'Name');
          const name=input?.value?.trim()||'';
          if(name && typeof list==='function'){
            const exists=list(p).some(x=>x?.name===name);
            if(!exists){
              const key='cl_extra_draft_'+p+'_'+encodeURIComponent(name);
              localStorage.removeItem(key);
              localStorage.removeItem('cl_extra_draft_'+p);
            }
          }
        }catch(e){console.warn('v116 draft reset failed',e)}
        return orig.apply(this,arguments);
      };
      wrapped.__v116Wrapped=true;
      window.save=wrapped;
      return true;
    }catch(e){console.warn('v116 save wrapper failed',e);return false}
  }

  if(!wrapProfileSave()){
    let tries=0;
    const timer=setInterval(()=>{
      if(wrapProfileSave() || ++tries>=40) clearInterval(timer);
    },50);
  }
})();
