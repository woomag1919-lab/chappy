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

  // Also reset immediately when profiles.js changes the active profile by clicking a saved profile.
  const originalSync=window.syncDiagnosisForProfile;
  if(typeof originalSync==='function'){
    window.syncDiagnosisForProfile=function(p,profile){
      const out=originalSync.apply(this,arguments);
      resetDeepUiForProfile(p);
      return out;
    };
  }

  // The bottom button should save both halves when the deep 18 questions have been completed.
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

          // 36問分を、現在選択中のプロフィールそのものに保存する。
          const activeName=activeProfile(which);
          if(activeName){
            const arr=list(which);
            const idx=arr.findIndex(x=>x.name===activeName);
            if(idx>=0){
              arr[idx]={
                ...arr[idx],
                state:state(which),
                scores:diagScores.map(x=>({key:x.key,score:Number(x.score)||50})),
                answers:base.slice(0,18),
                deepScores:scores.map(x=>({key:x.key,score:Number(x.score)||50})),
                deepAnswers:deep.slice(0,18),
                updatedAt:Date.now()
              };
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

  // Android Chrome is more reliable with a Blob URL than a data: URL for canvas downloads.
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

  // If both people have exactly the same short description, avoid printing the same sentence twice.
  // This is presentation-only; the underlying scores remain unchanged.
  function dedupeSameComparisonText(){
    const card=document.getElementById('v21CompareCard');
    if(!card)return;
    card.querySelectorAll('.v82-axis-row').forEach(row=>{
      const cells=row.querySelectorAll(':scope > div');
      if(cells.length>=3){
        const a=(cells[1].textContent||'').trim();
        const b=(cells[2].textContent||'').trim();
        if(a&&a===b)cells[2].textContent='共通';
      }
    });
    card.querySelectorAll('.v82-top-item').forEach(item=>{
      const bs=item.querySelectorAll('.v82-top-contrast b');
      if(bs.length>=2){
        const a=(bs[0].textContent||'').trim();
        const b=(bs[1].textContent||'').trim();
        if(a&&a===b)bs[1].textContent='共通';
      }
    });
  }
  if(typeof window.renderTwoPersonComparison==='function'){
    const originalRender=window.renderTwoPersonComparison;
    window.renderTwoPersonComparison=function(){
      const out=originalRender.apply(this,arguments);
      setTimeout(dedupeSameComparisonText,0);
      return out;
    };
  }
  setTimeout(dedupeSameComparisonText,0);

  const downloadBtn=document.getElementById('v73DownloadCompare');
  if(downloadBtn){
    // Replace the button node so the old anonymous listener from compare-export.js is removed.
    const clone=downloadBtn.cloneNode(true);
    downloadBtn.replaceWith(clone);
    clone.addEventListener('click',fixedDownloadCompareCard);
  }
})();
