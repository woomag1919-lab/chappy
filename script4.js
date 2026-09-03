
/* v53: 招待された側は前半18問→広告→後半18問まで完了してから送信する。
   「自分/相手」切替や通常の4種類のプロフィール入口は招待画面では使わせない。 */
(function(){
  function isInvitePartner(){
    const inv=v23GetInviteState();
    return !!(inv?.token && !inv?.ownerToken);
  }
  function answerBase(){
    const answers=[];
    for(let i=0;i<Q.length;i++){
      const x=document.querySelector(`input[name="q${i}"]:checked`);
      if(!x){alert(`前半18問すべてに回答してください。未回答は${i+1}問目です。`);return false;}
      answers.push(Number(x.value));
    }
    target='my';
    diagAnswers=answers;
    diagScores=axisScore(Q,answers);
    localStorage.setItem('cl_diag_radar_my',JSON.stringify(axisValuesFromScores(diagScores)));
    localStorage.setItem('cl_diag_result_my',JSON.stringify({scores:diagScores,answers,updatedAt:Date.now()}));
    try{applyDiagToProfile('my',diagScores)}catch(e){console.warn(e)}
    const more=document.getElementById('moreDiag');
    if(more)more.style.setProperty('display','block','important');
    const qp=document.getElementById('diagQuestionPanel');
    if(qp)qp.style.setProperty('display','none','important');
    return true;
  }
  function answerDeep(){
    const answers=collectExtraAnswers();
    const missing=answers.findIndex(v=>v==null);
    if(missing>=0){
      saveExtraDraft('my',answers,(document.getElementById('extraFree')?.value||'').trim());
      alert(`後半18問すべてに回答してください。未回答は${missing+1}問目です。`);
      return false;
    }
    const free=(document.getElementById('extraFree')?.value||'').trim();
    saveExtraDraft('my',answers,free);
    extraTarget='my';
    renderExtraResult(extraScore(),answers,free);
    return true;
  }
  async function submitAfter36(){
    try{
      await v23SubmitPartner();
      document.body.classList.remove('invite-questions-mode');
      document.body.classList.add('invite-complete-mode');
      const qp=document.getElementById('diagQuestionPanel');
      if(qp)qp.style.setProperty('display','none','important');
      const more=document.getElementById('moreDiag');
      if(more)more.style.setProperty('display','none','important');
      const result=document.getElementById('diagResult');
      if(result)result.style.setProperty('display','none','important');
      window.scrollTo({top:0,behavior:'smooth'});
    }catch(e){
      alert(e.message||'36問の結果を送信できませんでした。もう一度試してね。');
    }
  }
  document.addEventListener('click',e=>{
    if(!isInvitePartner())return;
    const baseBtn=e.target?.closest?.('#runDiag');
    if(baseBtn){
      e.preventDefault();e.stopImmediatePropagation();
      if(answerBase()){
        setTimeout(()=>{
          try{startExtra()}catch(err){alert(err.message||'後半18問を開始できませんでした。');}
        },50);
      }
      return;
    }
    const deepBtn=e.target?.closest?.('#runExtra');
    if(deepBtn){
      e.preventDefault();e.stopImmediatePropagation();
      if(answerDeep())setTimeout(submitAfter36,100);
    }
  },true);

  const forceInviteView=()=>{
    if(!isInvitePartner())return;
    target='my';
    selfDiag.classList.remove('on');
    otherDiag.classList.remove('on');
    const m=document.getElementById('moreDiag');
    if(m)m.style.setProperty('display','block','important');
  };
  setTimeout(forceInviteView,200);
  setTimeout(forceInviteView,1000);
})();
