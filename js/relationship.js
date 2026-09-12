/* CoreLingual — stable relationship feature entry point
 *
 * Owns the relationship selector, persistence bridge, and relationship-result
 * wording. Relationship-specific questions/scoring load through the stable
 * relationship-check.js entry point.
 */
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
    return n?partnerProfiles().find(x=>x.name===n):null;
  }
  function get(){
    return currentProfile()?.relationship||localStorage.getItem(REL_KEY)||'romantic';
  }

  function set(rel){
    if(!RELS[rel])rel='romantic';
    localStorage.setItem(REL_KEY,rel);
    const p=currentProfile();
    if(p){
      const arr=partnerProfiles();
      const i=arr.findIndex(x=>x.name===p.name);
      if(i>=0){
        arr[i]={...arr[i],relationship:rel,updatedAt:Date.now()};
        localStorage.setItem('cl_partner',JSON.stringify(arr));
      }
    }
    refresh();
    try{window.dispatchEvent(new CustomEvent('corelingual:relationship-change',{detail:{relationship:rel}}))}catch{}
  }

  function mount(){
    const pane=document.getElementById('profilePartnerPane');
    if(!pane)return false;
    let box=document.getElementById('clRelationshipBox');
    if(!box){
      box=document.createElement('div');
      box.id='clRelationshipBox';
      box.className='cl-relationship-box';
      box.innerHTML='<div class="cl-relationship-title">この相手との関係</div><div class="cl-relationship-note">関係性に合わせて、相手の特性チェックの質問が変わります。</div><div class="cl-relationship-options" role="radiogroup" aria-label="相手との関係">'+Object.entries(RELS).map(([k,v])=>'<button type="button" class="cl-relationship-option" data-rel="'+k+'" role="radio">'+v.label+'</button>').join('')+'</div>';
      const name=document.getElementById('partnerName');
      if(name&&name.parentNode)name.parentNode.insertBefore(box,name.nextSibling);
      else pane.insertBefore(box,pane.firstChild);
    }
    if(!box.dataset.corelingualRelationshipBound){
      box.dataset.corelingualRelationshipBound='1';
      box.querySelectorAll('[data-rel]').forEach(btn=>btn.addEventListener('click',()=>set(btn.dataset.rel)));
    }
    refresh();
    return true;
  }

  function refresh(){
    const box=document.getElementById('clRelationshipBox');
    if(!box)return;
    const rel=get();
    box.querySelectorAll('[data-rel]').forEach(btn=>{
      const on=btn.dataset.rel===rel;
      const background=on?'#ffe6f0':'#fff';
      const borderColor=on?'#df4d86':'#ddd';
      const boxShadow=on?'0 0 0 2px rgba(223,77,134,.12)':'none';
      if(btn.classList.contains('on')!==on)btn.classList.toggle('on',on);
      if(btn.getAttribute('aria-checked')!==(on?'true':'false'))btn.setAttribute('aria-checked',on?'true':'false');
      if(btn.style.background!==background)btn.style.background=background;
      if(btn.style.borderColor!==borderColor)btn.style.borderColor=borderColor;
      if(btn.style.boxShadow!==boxShadow)btn.style.boxShadow=boxShadow;
    });
  }

  function syncNames(){
    const name=activeName()||'未設定';
    ['v146PartnerName','v72PartnerName'].forEach(id=>{
      const el=document.getElementById(id);
      if(el&&el.textContent!==name)el.textContent=name;
    });
  }

  function polishResult(){
    const root=document.getElementById('extraResult');
    if(!root)return;
    const isPartner=typeof extraTarget!=='undefined'&&extraTarget==='partner';
    const isMy=typeof extraTarget!=='undefined'&&extraTarget==='my';
    root.querySelectorAll('.overview-head').forEach(el=>{
      if(el.textContent.includes('36問で見えた')){
        const text='🧩 36問で見えた、'+(isPartner?'相手':'自分')+'のコミュニケーション特性';
        if(el.textContent!==text)el.textContent=text;
      }
    });
    root.querySelectorAll('.v36-profile-apply button').forEach(btn=>{
      const text='🧩 この36問の特性チェック結果をプロフィールに反映する';
      if(btn.textContent!==text)btn.textContent=text;
    });
    if(isPartner||isMy){
      root.querySelectorAll('.v36-cause').forEach(el=>{
        const h=el.querySelector('b');
        if(h&&h.textContent.includes('本人が追加したメモ')){
          const text='📝 '+(isPartner?'相手':'自分')+'が追加したメモ';
          if(h.textContent!==text)h.textContent=text;
        }
      });
    }
  }

  function bindResultApply(){
    if(document.__corelingualRelationshipResultBound)return;
    document.__corelingualRelationshipResultBound=true;
    document.addEventListener('click',function(e){
      const btn=e.target?.closest?.('.v36-profile-apply button');
      if(!btn)return;
      e.stopImmediatePropagation();
      const p=(typeof extraTarget!=='undefined'&&extraTarget==='partner')?'partner':'my';
      const manual=typeof extractManualMemo==='function'
        ?((typeof extraFree!=='undefined'&&extraFree?.value)||extractManualMemo(document.getElementById(p==='my'?'myFree':'partnerFree')?.value||''))
        :'';
      const scores=typeof diagScores!=='undefined'&&Array.isArray(diagScores)?diagScores:[];
      const deep=typeof extraScore==='function'?extraScore():[];
      if(typeof applyDiagToProfile==='function')applyDiagToProfile(p,scores,deep);
      const freeId=p==='my'?'myFree':'partnerFree';
      const profileText=typeof buildAiProfileText==='function'?buildAiProfileText(scores,p==='my'?'自分':'相手',deep,manual):'';
      const freeEl=document.getElementById(freeId);
      if(freeEl&&profileText)freeEl.value=profileText;
      if(profileText)localStorage.setItem('cl_diag_summary_'+p,profileText);
      alert('36問の特性チェック結果をプロフィールに反映しました。');
      polishResult();
    },true);
  }

  let lastActive;
  function sync(){
    const now=activeName();
    if(now!==lastActive){lastActive=now;syncNames();}
    mount();
    polishResult();
  }

  window.CoreLingualRelationship={RELS,get,set,refresh};

  function start(){
    if(!document.body){setTimeout(start,25);return;}
    sync();
    bindResultApply();
    const obs=new MutationObserver(()=>sync());
    obs.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('storage',sync);
    window.addEventListener('corelingual:profile-change',sync);
    window.addEventListener('corelingual:profile-save',sync);
    window.addEventListener('corelingual:relationship-change',sync);
    let tries=0;
    const timer=setInterval(()=>{
      sync();
      if(++tries>=120)clearInterval(timer);
    },100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  const src='/js/relationship-check.js?v=1';
  if(!document.querySelector('script[data-corelingual-relationship-check]')){
    const s=document.createElement('script');
    s.src=src;
    s.dataset.corelingualRelationshipCheck='1';
    s.onload=()=>window.dispatchEvent(new CustomEvent('corelingual:relationship-ready'));
    s.onerror=()=>console.warn('CoreLingual relationship questionnaire failed to load:',src);
    (document.body||document.documentElement).appendChild(s);
  }
})();
