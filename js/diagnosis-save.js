/* CoreLingual — diagnosis save/close behavior */
(function(){
  'use strict';

  const saveClose=document.getElementById('v72DiagSaveClose');
  if(!saveClose)return;

  saveClose.onclick=()=>{
    try{
      const which=(typeof target!=='undefined'?target:'my');
      const base=[];
      for(let i=0;i<Q.length;i++){
        const x=document.querySelector(`input[name="q${i}"]:checked`);
        if(!x){alert('前半18問すべてに回答してください。1〜5で選んでね。');return;}
        base.push(Number(x.value));
      }
      diagAnswers=base;
      diagScores=axisScore(Q,base);
      localStorage.setItem('cl_diag_radar_'+which,JSON.stringify(axisValuesFromScores(diagScores)));
      localStorage.setItem('cl_diag_result_'+which,JSON.stringify({scores:diagScores,answers:base,updatedAt:Date.now()}));
      renderDiagResult(diagScores);
      applyDiagToProfile(which,diagScores);

      const extraVisible=document.getElementById('extraDiag')?.style.display==='block' || !!document.getElementById('extraQuestions')?.querySelector('input[name="ex1"]');
      if(extraVisible){
        const deep=collectExtraAnswers();
        const missing=deep.findIndex(v=>v==null);
        if(missing>=0){alert(`後半18問も最後まで回答してください。未回答は${missing+1}問目です。1〜5で選んでね。`);return;}
        const free=(document.getElementById('extraFree')?.value||'').trim();
        const scores=extraScore();
        saveExtraDraft(which,deep,free);
        renderExtraResult(scores,deep,free);
        const activeName=activeProfile(which);
        if(activeName){
          const arr=list(which);
          const idx=arr.findIndex(x=>x.name===activeName);
          if(idx>=0){
            arr[idx]={...arr[idx],state:state(which),scores:diagScores.map(x=>({key:x.key,score:Number(x.score)||50})),answers:base.slice(0,18),deepScores:scores.map(x=>({key:x.key,score:Number(x.score)||50})),deepAnswers:deep.slice(0,18),updatedAt:Date.now()};
            localStorage.setItem('cl_'+which,JSON.stringify(arr));
            draw(which);
          }
        }
        applyDiagToProfile(which,diagScores,scores);
      }

      save(which,{close:false,toast:false});
      document.getElementById('v72DiagOverlay')?.classList.remove('show');
      placeDiagButton(which);
      setNames();
      renderTwoPersonComparison();
    }catch(e){console.error('diagnosis save-close failed',e);alert(e.message||'特性チェック結果の保存に失敗しました。');}
  };
})();
