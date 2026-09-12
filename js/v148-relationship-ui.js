/* CoreLingual v148 — partner relationship selector + persistence bridge */
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
  function getRelationship(){
    const p=currentProfile();
    return p?.relationship||localStorage.getItem(REL_KEY)||'romantic';
  }
  function setRelationship(rel){
    if(!RELS[rel])rel='romantic';
    localStorage.setItem(REL_KEY,rel);
    const p=currentProfile();
    if(p&&typeof list==='function'){
      const arr=list('partner');const i=arr.findIndex(x=>x.name===p.name);
      if(i>=0){arr[i]={...arr[i],relationship:rel,updatedAt:Date.now()};localStorage.setItem('cl_partner',JSON.stringify(arr));}
    }
    window.dispatchEvent(new CustomEvent('corelingual:relationship-change',{detail:{relationship:rel}}));
    refreshRelationshipUI();
  }

  function mount(){
    const pane=document.getElementById('profilePartnerPane');
    if(!pane)return false;
    let box=pane.querySelector('#clRelationshipBox');
    if(!box){
      box=document.createElement('div');box.id='clRelationshipBox';box.className='cl-relationship-box';
      box.innerHTML='<div class="cl-relationship-title">この相手との関係</div><div class="cl-relationship-note">関係性に合わせて、相手の特性チェックの質問が変わります。</div><div class="cl-relationship-options" role="radiogroup" aria-label="関係性">'+Object.entries(RELS).map(([k,v])=>`<button type="button" class="cl-relationship-option" data-rel="${k}" role="radio">${v.label}</button>`).join('')+'</div>';
      const name=pane.querySelector('#partnerName');
      if(name)name.parentNode.insertBefore(box,name);
      else pane.insertBefore(box,pane.firstChild);
      box.querySelectorAll('[data-rel]').forEach(b=>b.addEventListener('click',()=>setRelationship(b.dataset.rel)));
    }
    refreshRelationshipUI();
    return true;
  }

  function refreshRelationshipUI(){
    const box=document.getElementById('clRelationshipBox');if(!box)return;
    const p=currentProfile();const rel=p?.relationship||localStorage.getItem(REL_KEY)||'romantic';
    box.querySelectorAll('[data-rel]').forEach(b=>{const on=b.dataset.rel===rel;b.classList.toggle('on',on);b.setAttribute('aria-checked',on?'true':'false')});
    const note=box.querySelector('.cl-relationship-note');if(note)note.textContent='関係性に合わせて、相手の特性チェックの質問が変わります。';
  }

  function wrapSave(){
    try{
      const orig=window.save;
      if(typeof orig!=='function'||orig.__v148)return !!orig;
      const wrapped=function(p,opts){
        if(p==='partner'){
          const rel=document.querySelector('#clRelationshipBox [data-rel].on')?.dataset.rel||getRelationship()||'romantic';
          localStorage.setItem(REL_KEY,rel);
          const input=document.getElementById('partnerName');const name=input?.value?.trim()||'';
          if(name&&typeof list==='function'){
            const arr=list('partner');const i=arr.findIndex(x=>x.name===name);
            if(i>=0)arr[i]={...arr[i],relationship:rel};
            else arr.push({name,relationship:rel,state:{traits:[],free:''}});
            localStorage.setItem('cl_partner',JSON.stringify(arr.slice(-5)));
          }
        }
        const result=orig.apply(this,arguments);
        if(p==='partner'){
          const name=document.getElementById('partnerName')?.value?.trim();
          if(name&&typeof list==='function'){
            const arr=list('partner'),i=arr.findIndex(x=>x.name===name);
            if(i>=0){arr[i]={...arr[i],relationship:localStorage.getItem(REL_KEY)||'romantic'};localStorage.setItem('cl_partner',JSON.stringify(arr));}
          }
        }
        return result;
      };
      wrapped.__v148=true;window.save=wrapped;return true;
    }catch(e){console.warn('v148 save wrapper failed',e);return false}
  }

  function patchDiagOpen(){
    const btn=document.getElementById('v72OpenDiag');if(!btn||btn.__v148)return false;
    btn.__v148=true;
    btn.addEventListener('click',()=>{
      if(typeof target!=='undefined'&&target==='partner'){
        localStorage.setItem(REL_KEY,getRelationship());
        window.dispatchEvent(new CustomEvent('corelingual:relationship-change',{detail:{relationship:getRelationship()}}));
      }
    },true);
    return true;
  }

  function install(){
    mount();wrapSave();patchDiagOpen();
    return !!document.getElementById('clRelationshipBox');
  }

  window.CoreLingualRelationship={RELS,get:getRelationship,set:setRelationship,refresh:refreshRelationshipUI};
  if(!install()){let tries=0;const timer=setInterval(()=>{if(install()||++tries>=120)clearInterval(timer)},50)}
  const obs=new MutationObserver(()=>{mount();wrapSave();patchDiagOpen()});
  obs.observe(document.body,{childList:true,subtree:true});
})();
