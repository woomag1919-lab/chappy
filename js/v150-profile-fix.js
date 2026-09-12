/* CoreLingual v150 — partner profile selector visibility + immediate name sync */
(function(){
  'use strict';

  const RELS={
    romantic:{label:'❤️ 恋人・パートナー'},
    friend:{label:'👫 友人関係'},
    work:{label:'💼 仕事関係'}
  };
  const REL_KEY='cl_partner_relationship';

  function activeName(){
    try{return typeof activeProfile==='function'?activeProfile('partner'):null}catch{return null}
  }
  function partnerProfiles(){
    try{return typeof list==='function'?list('partner'):[]}catch{return[]}
  }
  function currentProfile(){
    const n=activeName();
    return n?partnerProfiles().find(x=>x.name===n):null
  }
  function currentRel(){
    return currentProfile()?.relationship||localStorage.getItem(REL_KEY)||'romantic'
  }

  function updatePartnerPageName(){
    const n=activeName()||'未設定';
    ['v146PartnerName','v72PartnerName'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.textContent=n;
    });
  }

  function ensureRelationshipBox(){
    const pane=document.getElementById('profilePartnerPane');
    if(!pane)return false;

    let box=document.getElementById('clRelationshipBox');
    if(!box){
      box=document.createElement('div');
      box.id='clRelationshipBox';
      box.setAttribute('data-corelingual-v150','1');
      box.style.cssText='margin:12px 0 16px;padding:14px;border:1px solid #f0c7d8;border-radius:16px;background:#fff8fb;box-sizing:border-box;display:block;width:100%';
      box.innerHTML='<div style="font-weight:700;font-size:16px;margin-bottom:5px">この相手との関係</div><div style="font-size:13px;color:#666;margin-bottom:10px">関係性に合わせて、相手の特性チェックの質問が変わります。</div><div class="cl-relationship-options" role="radiogroup" aria-label="相手との関係" style="display:grid;grid-template-columns:1fr;gap:8px">'+Object.entries(RELS).map(([k,v])=>'<button type="button" class="cl-relationship-option" data-rel="'+k+'" role="radio" style="width:100%;padding:11px 12px;border:1px solid #ddd;border-radius:12px;background:#fff;text-align:left;font-size:15px;font-weight:600;cursor:pointer;box-sizing:border-box">'+v.label+'</button>').join('')+'</div>';

      const nameInput=document.getElementById('partnerName');
      const nameLabel=nameInput?.closest('label');
      if(nameLabel&&nameLabel.parentNode){
        nameLabel.parentNode.insertBefore(box,nameLabel.nextSibling);
      }else if(nameInput?.parentNode){
        nameInput.parentNode.insertBefore(box,nameInput.nextSibling);
      }else{
        pane.insertBefore(box,pane.firstChild);
      }

      box.querySelectorAll('[data-rel]').forEach(btn=>btn.addEventListener('click',function(){
        const rel=this.dataset.rel;
        localStorage.setItem(REL_KEY,rel);
        const p=currentProfile();
        if(p){
          const arr=partnerProfiles();
          const i=arr.findIndex(x=>x.name===p.name);
          if(i>=0){arr[i]={...arr[i],relationship:rel,updatedAt:Date.now()};localStorage.setItem('cl_partner',JSON.stringify(arr));}
        }
        refreshRelationshipBox();
        try{window.dispatchEvent(new CustomEvent('corelingual:relationship-change',{detail:{relationship:rel}}))}catch{}
      }));
    }
    refreshRelationshipBox();
    return true;
  }

  function refreshRelationshipBox(){
    const box=document.getElementById('clRelationshipBox');
    if(!box)return;
    const rel=currentRel();
    box.querySelectorAll('[data-rel]').forEach(btn=>{
      const on=btn.dataset.rel===rel;
      btn.setAttribute('aria-checked',on?'true':'false');
      btn.style.background=on?'#ffe6f0':'#fff';
      btn.style.borderColor=on?'#df4d86':'#ddd';
      btn.style.boxShadow=on?'0 0 0 2px rgba(223,77,134,.12)':'none';
    });
  }

  function syncAll(){
    updatePartnerPageName();
    ensureRelationshipBox();
    refreshRelationshipBox();
  }

  let lastActive=null;
  function watchActive(){
    const n=activeName();
    if(n!==lastActive){
      lastActive=n;
      syncAll();
    }
  }

  syncAll();
  setInterval(watchActive,250);
  let tries=0;
  const timer=setInterval(()=>{
    syncAll();
    if(++tries>=120)clearInterval(timer);
  },100);

  const obs=new MutationObserver(()=>syncAll());
  if(document.body)obs.observe(document.body,{childList:true,subtree:true});

  window.addEventListener('storage',syncAll);
  window.addEventListener('corelingual:relationship-change',syncAll);
})();
