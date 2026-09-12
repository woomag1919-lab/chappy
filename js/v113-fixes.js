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
        return {myName:myName||'あなた',paName:paName||'相手',my:myOpts.find(o=>o.id==='prof:my:'+myName)||myOpts.find(o=>o.id==='live:my'),partner:paOpts.find(o=>o.id==='prof:partner:'+paName)||paOpts.find(o=>o.id==='live:partner')};
      };
      return true;
    }catch(e){console.warn('v113 compare data bridge failed',e);return false}
  }
  if(!exposeCompareData()){let tries=0;const timer=setInterval(()=>{if(exposeCompareData()||++tries>=20)clearInterval(timer)},50)}

  function resetBaseDiagnosisBeforeRestore(){try{document.querySelectorAll('#questions input[type="radio"]').forEach(x=>x.checked=false);if(typeof diagAnswers!=='undefined')diagAnswers=[];if(typeof diagScores!=='undefined')diagScores=[];const resultEl=document.getElementById('diagResult'),moreEl=document.getElementById('moreDiag');if(resultEl)resultEl.innerHTML='';if(moreEl)moreEl.style.display='none'}catch(e){console.warn('v115 diagnosis reset failed',e)}}
  function wrapRestoreDiagAnswers(){try{const orig=window.restoreDiagAnswers;if(typeof orig!=='function'||orig.__v115Wrapped)return !!orig;const wrapped=function(p){resetBaseDiagnosisBeforeRestore();const result=orig(p);if(!result)resetBaseDiagnosisBeforeRestore();return result};wrapped.__v115Wrapped=true;window.restoreDiagAnswers=wrapped;return true}catch(e){console.warn('v115 restore wrapper failed',e);return false}}
  if(!wrapRestoreDiagAnswers()){let tries=0;const timer=setInterval(()=>{if(wrapRestoreDiagAnswers()||++tries>=40)clearInterval(timer)},50)}

  function wrapProfileSave(){try{const orig=window.save;if(typeof orig!=='function'||orig.__v116Wrapped)return !!orig;const wrapped=function(p,opts){try{const input=document.getElementById(p+'Name'),name=input?.value?.trim()||'';if(name&&typeof list==='function'){const exists=list(p).some(x=>x?.name===name);if(!exists){localStorage.removeItem('cl_extra_draft_'+p+'_'+encodeURIComponent(name));localStorage.removeItem('cl_extra_draft_'+p)}}}catch(e){console.warn('v116 draft reset failed',e)}return orig.apply(this,arguments)};wrapped.__v116Wrapped=true;window.save=wrapped;return true}catch(e){console.warn('v116 save wrapper failed',e);return false}}
  if(!wrapProfileSave()){let tries=0;const timer=setInterval(()=>{if(wrapProfileSave()||++tries>=40)clearInterval(timer)},50)}

  function resetDiagSheetScroll(){try{const overlay=document.getElementById('v72DiagOverlay'),sheet=overlay?.querySelector('.v72-sheet');if(sheet)sheet.scrollTop=0}catch(e){console.warn('v117 diagnosis scroll reset failed',e)}}
  function installDiagScrollReset(){try{const overlay=document.getElementById('v72DiagOverlay');if(!overlay||overlay.__v117ScrollReset)return !!overlay;overlay.__v117ScrollReset=true;const reset=()=>{resetDiagSheetScroll();requestAnimationFrame(resetDiagSheetScroll);setTimeout(resetDiagSheetScroll,50)};const openBtn=document.getElementById('v72OpenDiag');if(openBtn)openBtn.addEventListener('click',reset,true);new MutationObserver(()=>{if(overlay.classList.contains('show'))reset()}).observe(overlay,{attributes:true,attributeFilter:['class']});return true}catch(e){console.warn('v117 diagnosis scroll hook failed',e);return false}}
  if(!installDiagScrollReset()){let tries=0;const timer=setInterval(()=>{if(installDiagScrollReset()||++tries>=40)clearInterval(timer)},50)}

  function normalizeComparisonHeadings(){try{const card=document.getElementById('v21CompareCard');if(!card)return;card.querySelectorAll('.v82-section-title').forEach(el=>{const t=(el.textContent||'').trim();if(t==='特に違いが出やすい3つ')el.textContent='特に違いが出やすいポイント';if(t==='9つのコミュニケーション傾向')el.textContent='コミュニケーション傾向'})}catch(e){console.warn('v118 comparison heading normalize failed',e)}}
  function installComparisonHeadingFix(){try{normalizeComparisonHeadings();if(window.__v118CompareHeadingFix)return true;window.__v118CompareHeadingFix=true;const card=document.getElementById('v21CompareCard');if(card)new MutationObserver(normalizeComparisonHeadings).observe(card,{subtree:true,childList:true,characterData:true});return true}catch(e){return false}}
  if(!installComparisonHeadingFix()){let tries=0;const timer=setInterval(()=>{if(installComparisonHeadingFix()||++tries>=40)clearInterval(timer)},50)}
})();

/* CoreLingual v119 — 比較アドバイス文言を、意味を保ったまま言い回しを整理 */
(function(){
  'use strict';
  const adviceMap={
    language:{left:'要点を短く区切って伝えると、行き違いを減らしやすい。',right:'話の最後に、認識が合っているか一度確かめる。'},
    thinking:{left:'まず目的をそろえてから、具体的な案を出していく。',right:'いくつかの案を広げたあと、最後に選択肢を絞り込む。'},
    emotion:{left:'気持ちを受け止めてほしい時は、最初にそう伝えておく。',right:'少し考える時間がほしい時は、あとで話すことを先に知らせる。'},
    distance:{left:'今話したい理由を添えると、相手も意図をつかみやすい。',right:'距離を置く時は、いつ頃また話すかを伝えておく。'},
    change:{left:'予定が変わる時は、早めに知らせて心の準備をしてもらう。',right:'変える部分と変えない部分を分けて伝えると進めやすい。'},
    communication:{left:'「まず聞いてほしい」と伝えてから、気持ちを話す。',right:'解決策を出す前に、相手の話を受け止める時間をつくる。'},
    attach:{left:'確認したいことを一つに絞ると、安心につながりやすい。',right:'少し距離を置く時は、また話せるタイミングを伝えておく。'},
    sensory:{left:'情報が重なった時は、いったん話す量を減らして整理する。',right:'相手の余裕を見ながら、その場で扱う情報量を調整する。'},
    process:{left:'最初に「次はこれ」と一つ決めてから進めると安心しやすい。',right:'まず小さく動いてみて、途中でやり方を整えていく。'}
  };
  const middle={language:'大事な点だけ、短く確認しておくと行き違いを防ぎやすい。',thinking:'目的を共有したうえで、考えを広げたり整理したりすると進めやすい。',emotion:'話すか少し置くか、その時の気持ちに合わせてペースを決める。',distance:'今の距離感に合わせて、話すタイミングを調整する。',change:'見通しを持ちながら、必要なところだけ柔軟に変えていく。',communication:'気持ちと具体策のどちらを先に扱うか、場面に合わせて決める。',attach:'近づきたい時も距離を置きたい時も、タイミングを言葉にしておく。',sensory:'その時の余裕に合わせて、受け取る情報量を加減する。',process:'大まかな段取りを持ちつつ、途中で必要なら調整する。'};
  const axisKey={'情報の受け取り方':'language','考え方':'thinking','感情の扱い方':'emotion','人との距離感':'distance','変化への対応':'change','伝え方・受け止め方':'communication','近づき方・距離の取り方':'attach','刺激への反応':'sensory','進め方・柔軟性':'process'};
  const leftLabel={language:'言葉ではっきり',thinking:'筋道を整理',emotion:'話して整理',distance:'一緒に整理',change:'見通してから',communication:'まず気持ち',attach:'つながりを確認',sensory:'刺激を減らして整理',process:'順番を整えてから'};
  const rightLabel={language:'流れから受け取る',thinking:'ひらめきを広げる',emotion:'時間を置いて整理',distance:'ひとりで整理',change:'動きながら',communication:'まず具体策',attach:'自分で整理してから',sensory:'その場で切り替える',process:'まず動いて調整'};
  function sideFromText(text,key){const s=String(text||'').trim();if(s===leftLabel[key])return'left';if(s===rightLabel[key])return'right';return'middle'}
  function refreshAdvice(){try{const card=document.getElementById('v21CompareCard');if(!card)return false;card.querySelectorAll('.v82-advice-item').forEach(item=>{const axis=(item.querySelector('b')?.textContent||'').replace(/^[^ぁ-んァ-ン一-龥A-Za-z0-9]+/,'').trim(),key=axisKey[axis];if(!key)return;const axisRow=[...card.querySelectorAll('.v82-axis-row')].find(r=>r.querySelector('.v82-axis-name')?.textContent?.includes(axis));if(!axisRow)return;const cells=axisRow.querySelectorAll(':scope > div'),ps=item.querySelectorAll('p'),a=sideFromText(cells[1]?.textContent,key),b=sideFromText(cells[2]?.textContent,key);if(ps[0])ps[0].textContent=a==='middle'?middle[key]:adviceMap[key][a];if(ps[1])ps[1].textContent=b==='middle'?middle[key]:adviceMap[key][b]}) ;return true}catch(e){console.warn('v119 advice refresh failed',e);return false}}
  let tries=0;const timer=setInterval(()=>{if(refreshAdvice()||++tries>=80)clearInterval(timer)},100);window.addEventListener('load',refreshAdvice);
})();

/* CoreLingual v120 — load comparison difference visibility fix */
(function(){
  try{
    if(!document.querySelector('script[data-corelingual-v120]')){
      const s=document.createElement('script');
      /* Cache-bust the feature file so deployed browsers cannot keep the pre-fix v120 bundle. */
      s.src='/js/v120-fixes.js?v=1202';
      s.dataset.corelingualV120='1';
      document.body.appendChild(s);
    }
  }catch(e){console.warn('v120 loader failed',e)}
})();

/* CoreLingual v121 — existing-profile diagnosis edit is a draft; × cancels it completely. */
(function(){
  'use strict';

  const KEY_PREFIXES=['cl_diag_result_','cl_diag_radar_','cl_extra_result_','cl_extra_radar_'];
  let snapshot=null;

  function getWhich(){try{return typeof target!=='undefined'&&target?target:'my'}catch{return'my'}}
  function draftKey(which){
    try{
      const name=typeof activeProfile==='function'?activeProfile(which):null;
      return 'cl_extra_draft_'+which+'_'+encodeURIComponent(name||'__none__');
    }catch{return null}
  }
  function captureSnapshot(which){
    const keys=KEY_PREFIXES.map(prefix=>prefix+which);
    const dk=draftKey(which);if(dk)keys.push(dk);
    const values={};keys.forEach(k=>{values[k]=localStorage.getItem(k)});
    snapshot={which,values,saved:false};
  }
  function restoreSnapshot(){
    if(!snapshot||snapshot.saved)return;
    Object.entries(snapshot.values).forEach(([k,v])=>{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)});
    try{
      const which=snapshot.which;
      if(typeof restoreDiagAnswers==='function')restoreDiagAnswers(which);
      if(typeof syncDiagnosisForProfile==='function'){
        const name=typeof activeProfile==='function'?activeProfile(which):null;
        const prof=name&&typeof list==='function'?list(which).find(x=>x.name===name):null;
        if(prof)syncDiagnosisForProfile(which,prof);
      }
    }catch(e){console.warn('v121 diagnosis cancel UI restore failed',e)}
    try{
      if(typeof extraTarget!=='undefined')extraTarget=snapshot.which;
      const q=document.getElementById('extraQuestions');
      if(q)q.querySelectorAll('input[type="radio"]').forEach(x=>x.checked=false);
      const free=document.getElementById('extraFree');if(free)free.value='';
      const d=document.getElementById('extraDiag');if(d)d.style.display='none';
      const ad=document.getElementById('ad30');if(ad)ad.style.display='none';
      const r=document.getElementById('extraResult');if(r)r.innerHTML='';
    }catch(e){console.warn('v121 deep cancel UI cleanup failed',e)}
    snapshot=null;
  }

  function markSavedIfClosed(){
    if(!snapshot)return;
    const overlay=document.getElementById('v72DiagOverlay');
    if(overlay && overlay.classList.contains('show'))return;
    snapshot.saved=true;
    snapshot=null;
  }

  function install(){
    const open=document.getElementById('v72OpenDiag');
    const close=document.getElementById('v72DiagClose');
    const save=document.getElementById('v72DiagSaveClose');
    if(!open||!close||!save)return false;

    if(!open.__v121){
      open.__v121=true;
      open.addEventListener('click',()=>{
        const which=getWhich();
        captureSnapshot(which);
        setTimeout(()=>{
          try{if(typeof restoreDiagAnswers==='function')restoreDiagAnswers(which)}catch(e){console.warn('v121 base diagnosis restore failed',e)}
        },30);
      });
    }
    if(!close.__v121){
      close.__v121=true;
      close.addEventListener('click',()=>setTimeout(restoreSnapshot,0));
    }
    if(!save.__v121){
      save.__v121=true;
      save.addEventListener('click',()=>setTimeout(markSavedIfClosed,0));
    }
    return true;
  }

  if(!install()){let tries=0;const timer=setInterval(()=>{if(install()||++tries>=80)clearInterval(timer)},50)}
})();
