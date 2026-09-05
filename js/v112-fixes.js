/* CoreLingual v112 — profile-specific deep-check reset/save + Android image export helpers */
(function(){
  'use strict';

  function resetDeepUiForProfile(p){
    try{
      if(typeof extraTarget !== 'undefined') extraTarget=p;
      if(typeof extraTimer !== 'undefined' && extraTimer){ clearInterval(extraTimer); extraTimer=null; }
      const q=document.getElementById('extraQuestions');
      const r=document.getElementById('extraResult');
      const d=document.getElementById('extraDiag');
      const ad=document.getElementById('ad30');
      const c=document.getElementById('ad30Countdown');
      const btn=document.getElementById('startMore');
      if(q){
        q.querySelectorAll('input[type="radio"]').forEach(x=>x.checked=false);
        const free=q.querySelector('#extraFree'); if(free)free.value='';
      }
      const free=document.getElementById('extraFree'); if(free)free.value='';
      if(r)r.innerHTML='';
      if(d)d.style.display='none';
      if(ad)ad.style.display='none';
      if(c)c.textContent='';
      if(btn)btn.disabled=false;
    }catch(e){console.warn('deep profile reset failed',e)}
  }

  function bindProfileReset(which){
    const el=document.getElementById(which==='my'?'selfDiag':'otherDiag');
    if(!el)return;
    el.addEventListener('click',()=>{
      setTimeout(()=>resetDeepUiForProfile(which),0);
    });
  }
  bindProfileReset('my');
  bindProfileReset('partner');

  const originalSync=window.syncDiagnosisForProfile;
  if(typeof originalSync==='function'){
    window.syncDiagnosisForProfile=function(p,profile){
      const out=originalSync.apply(this,arguments);
      resetDeepUiForProfile(p);
      return out;
    };
  }

  const saveClose=document.getElementById('v72DiagSaveClose');
  if(saveClose){
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
  }

  async function fixedDownloadCompareCard(){
    const data=window.getActiveCompareData?.();
    if(!data?.my||!data?.partner){alert('2人分の比較データがまだありません。');return;}
    const overlay=document.getElementById('v73DownloadAdOverlay'),count=document.getElementById('v73DownloadAdCount');
    overlay?.classList.add('show');
    for(let n=5;n>=1;n--){if(count)count.textContent=String(n);await new Promise(r=>setTimeout(r,1000));}
    overlay?.classList.remove('show');
    try{
      const canvas=await window.CoreLingualCompareExport.buildCompareTemplateCanvas();
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNGの作成に失敗しました。')),'image/png'));
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download='CoreLingual_2人のコミュニケーション比較.png';
      a.rel='noopener';
      a.style.display='none';
      document.body.appendChild(a);
      a.click();
      setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},1500);
      const toast=document.createElement('div');toast.className='v73-download-toast';toast.textContent='比較結果を保存しました';document.body.appendChild(toast);setTimeout(()=>toast.remove(),2200);
    }catch(e){console.error('comparison image export failed',e);alert('画像の作成に失敗しました。\n'+(e?.message||e));}
  }

  const downloadBtn=document.getElementById('v73DownloadCompare');
  if(downloadBtn){
    const clone=downloadBtn.cloneNode(true);
    downloadBtn.replaceWith(clone);
    clone.addEventListener('click',fixedDownloadCompareCard);
  }
})();
