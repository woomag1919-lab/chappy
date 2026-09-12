/* CoreLingual v149 — partner wording + relationship selector polish */
(function(){
  'use strict';

  const RELS={
    romantic:{label:'❤️ 恋人・パートナー'},
    friend:{label:'👫 友人関係'},
    work:{label:'💼 仕事関係'}
  };
  const REL_KEY='cl_partner_relationship';

  function activeName(){try{return typeof activeProfile==='function'?activeProfile('partner'):null}catch{return null}}
  function currentProfile(){const n=activeName();return n&&typeof list==='function'?list('partner').find(x=>x.name===n):null}
  function getRel(){return currentProfile()?.relationship||localStorage.getItem(REL_KEY)||'romantic'}

  function mountRelationship(){
    const pane=document.getElementById('profilePartnerPane');
    if(!pane)return false;
    let box=document.getElementById('clRelationshipBox');
    if(!box){
      box=document.createElement('div');
      box.id='clRelationshipBox';
      box.className='cl-relationship-box';
      box.style.cssText='margin:12px 0 16px;padding:14px;border:1px solid #f0c7d8;border-radius:16px;background:#fff8fb;box-sizing:border-box';
      box.innerHTML='<div style="font-weight:700;font-size:16px;margin-bottom:5px">この相手との関係</div><div style="font-size:13px;color:#666;margin-bottom:10px">関係性に合わせて、相手の特性チェックの質問が変わります。</div><div class="cl-relationship-options" role="radiogroup" aria-label="相手との関係" style="display:grid;grid-template-columns:1fr;gap:8px">'+Object.entries(RELS).map(([k,v])=>'<button type="button" class="cl-relationship-option" data-rel="'+k+'" role="radio" style="width:100%;padding:11px 12px;border:1px solid #ddd;border-radius:12px;background:#fff;text-align:left;font-size:15px;font-weight:600;cursor:pointer">'+v.label+'</button>').join('')+'</div>';
      const name=pane.querySelector('#partnerName');
      if(name&&name.parentNode)name.parentNode.insertBefore(box,name.nextSibling);
      else pane.insertBefore(box,pane.firstChild);
      box.querySelectorAll('[data-rel]').forEach(b=>b.addEventListener('click',()=>setRel(b.dataset.rel)));
    }
    refreshRelationship();
    return true;
  }

  function setRel(rel){
    if(!RELS[rel])rel='romantic';
    localStorage.setItem(REL_KEY,rel);
    const p=currentProfile();
    if(p&&typeof list==='function'){
      const arr=list('partner'),i=arr.findIndex(x=>x.name===p.name);
      if(i>=0){arr[i]={...arr[i],relationship:rel,updatedAt:Date.now()};localStorage.setItem('cl_partner',JSON.stringify(arr));}
    }
    refreshRelationship();
    window.dispatchEvent(new CustomEvent('corelingual:relationship-change',{detail:{relationship:rel}}));
  }

  function refreshRelationship(){
    const box=document.getElementById('clRelationshipBox');if(!box)return;
    const rel=getRel();
    box.querySelectorAll('[data-rel]').forEach(b=>{
      const on=b.dataset.rel===rel;
      b.setAttribute('aria-checked',on?'true':'false');
      b.style.background=on?'#ffe6f0':'#fff';
      b.style.borderColor=on?'#df4d86':'#ddd';
      b.style.boxShadow=on?'0 0 0 2px rgba(223,77,134,.12)':'none';
    });
  }

  /* The result renderer lives in app.js, so keep its existing logic but correct the visible wording after render. */
  function polishResult(){
    const root=document.getElementById('extraResult');
    if(!root)return;
    const isPartner=(typeof extraTarget!=='undefined'&&extraTarget==='partner');
    const isMy=(typeof extraTarget!=='undefined'&&extraTarget==='my');
    const name=isPartner?(activeName()||'相手'):'自分';
    root.querySelectorAll('.overview-head').forEach(el=>{
      if(el.textContent.includes('36問で見えた'))el.textContent='🧩 36問で見えた、'+name+'のコミュニケーション特性';
    });
    root.querySelectorAll('.v36-profile-apply button').forEach(btn=>{
      btn.textContent='🧩 この36問の結果をプロフィールに反映する';
    });
    if(isPartner||isMy){
      root.querySelectorAll('.v36-cause').forEach(el=>{
        const h=el.querySelector('b');
        if(h&&h.textContent.includes('本人が追加したメモ'))h.textContent='📝 '+name+'が追加したメモ';
      });
    }
  }

  /* Replace the old alert wording without changing the underlying save operation. */
  document.addEventListener('click',function(e){
    const btn=e.target?.closest?.('.v36-profile-apply button');
    if(!btn)return;
    e.stopImmediatePropagation();
    const p=(typeof extraTarget!=='undefined'&&extraTarget==='partner')?'partner':'my';
    const manual=(typeof extractManualMemo==='function')?((typeof extraFree!=='undefined'&&extraFree?.value)||extractManualMemo(document.getElementById(p==='my'?'myFree':'partnerFree')?.value||'')):'';
    const scores=typeof diagScores!=='undefined'&&Array.isArray(diagScores)?diagScores:[];
    const deep=typeof extraScore==='function'?extraScore():[];
    if(typeof applyDiagToProfile==='function')applyDiagToProfile(p,scores,deep);
    const freeId=p==='my'?'myFree':'partnerFree';
    const profileText=typeof buildAiProfileText==='function'?buildAiProfileText(scores,p==='my'?'自分':'相手',deep,manual):'';
    const freeEl=document.getElementById(freeId);if(freeEl&&profileText)freeEl.value=profileText;
    if(profileText)localStorage.setItem('cl_diag_summary_'+p,profileText);
    alert('36問の特性チェック結果をプロフィールに反映しました。');
    polishResult();
  },true);

  const obs=new MutationObserver(()=>{mountRelationship();polishResult();});
  function install(){mountRelationship();polishResult();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  obs.observe(document.body,{childList:true,subtree:true});
  window.CoreLingualRelationshipV149={get:getRel,set:setRel,refresh:refreshRelationship};
})();
