/* v49 — two-person trait-check invitation flow */
const V22_INVITE_KEY="cl_v23_invite";
const V22_OWNER_KEY="cl_v23_owner";
function v23OwnerToken(){let x=localStorage.getItem(V22_OWNER_KEY);if(!x||!/^[A-Za-z0-9_-]{40,60}$/.test(x)){x=(crypto.randomUUID()+crypto.randomUUID()).replace(/-/g,"").slice(0,48);localStorage.setItem(V22_OWNER_KEY,x)}return x}
function v23InviteToken(){return new URLSearchParams(location.search).get("invite")||null}
function v23SetInviteState(x){try{localStorage.setItem(V22_INVITE_KEY,JSON.stringify(x))}catch{}}
function v23GetInviteState(){try{return JSON.parse(localStorage.getItem(V22_INVITE_KEY)||"null")}catch{return null}}
function v23NewPartnerKey(){return (crypto.randomUUID()+crypto.randomUUID()).replace(/-/g,"").slice(0,48)}
function v23EnsurePartnerKey(token){
  const inv=v23GetInviteState();
  if(inv?.token===token && inv.partnerKey && /^[A-Za-z0-9_-]{40,60}$/.test(inv.partnerKey))return inv.partnerKey;
  const key=v23NewPartnerKey();
  v23SetInviteState({...inv,token,partnerKey:key});
  return key;
}
function v23InviteCreateControls(){
  return `<div class="v36-check"><input id="v23HostShare" type="checkbox" checked><label for="v23HostShare"><b>自分の結果も相手に見せる</b><br>オフなら、相手にはあなたの結果を見せません。</label></div>
<button id="v23CreateInviteBtn" class="primary">🔗 相手に特性チェックをお願いする</button>`;
}
function v23BindCreateInvite(){
  const b=document.getElementById('v23CreateInviteBtn');if(!b)return;
  b.onclick=async()=>{if(b.disabled)return;b.disabled=true;try{await v23CreateInvite()}catch(e){alert(e.message||'招待リンクを作れませんでした。');b.disabled=false}};
}
async function v23ResetInvite(){
  const inv=v23GetInviteState();
  try{if(v26HostPollTimer)clearInterval(v26HostPollTimer);v26HostPollTimer=null}catch{}
  try{if(v26PartnerPollTimer)clearInterval(v26PartnerPollTimer);v26PartnerPollTimer=null}catch{}
  // Host explicitly ends the server-side invite so the other phone can detect it.
  if(inv?.token&&inv?.ownerToken){
    try{await fetch('/api/invite',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:inv.token,ownerToken:inv.ownerToken})})}catch{}
  }
  const hadLegacyInvite=!!localStorage.getItem('cl_shared_partner_profile');
  clearV29InviteView();
  if(hadLegacyInvite){['cl_diag_radar_partner','cl_extra_radar_partner'].forEach(k=>{try{localStorage.removeItem(k)}catch{}})}
  try{localStorage.removeItem(V22_INVITE_KEY)}catch{}
  const compare=document.getElementById('v21CompareCard');if(compare){compare.style.setProperty('display','none','important');compare.hidden=true;}
  const grid=document.getElementById('v21CompareGrid');if(grid)grid.innerHTML='';
  const listEl=document.getElementById('v21CompareList');if(listEl)listEl.innerHTML='';
  const box=document.getElementById('v23InviteControls');
  if(box){box.innerHTML=v23InviteCreateControls();v23BindCreateInvite();}
  document.body.classList.remove('invite-mode','invite-questions-mode','invite-ended-mode','invite-complete-mode');
  history.replaceState({},document.title,location.pathname);
  target='my';selfDiag.classList.add('on');otherDiag.classList.remove('on');targetNote.textContent='自分自身について回答してください。';
  renderTwoPersonComparison();
  window.scrollTo({top:document.getElementById('diag')?.offsetTop||0,behavior:'auto'});
}
function v23CurrentProfilePayload(p){
  const radar=loadDiagRadar(p);
  const ex=(()=>{try{return JSON.parse(localStorage.getItem("cl_extra_radar_"+p)||"null")}catch{return null}})();
  const base=(()=>{try{return JSON.parse(localStorage.getItem("cl_diag_result_"+p)||"null")}catch{return null}})();
  const extra=(()=>{try{return JSON.parse(localStorage.getItem("cl_extra_result_"+p)||"null")}catch{return null}})();
  const deepScores=Array.isArray(extra?.scores)?extra.scores.slice(0,18):[];
  const scores=Array.isArray(base?.scores)?base.scores:[];
  return {name:activeProfile(p)||(p==="my"?"あなた":"相手"),radar:radar||null,extraRadar:ex||null,traits:state(p).traits,summary:document.getElementById(p+"Free")?.value||"",scores:scores.map(x=>({key:x.key,score:Number(x.score)||50})),answers:Array.isArray(base?.answers)?base.answers.slice(0,18):[],extraAnswers:Array.isArray(extra?.answers)?extra.answers.slice(0,18):[],deepScores:deepScores.map(x=>({key:x.key,score:x.score,count:x.count})),deepAnswers:Array.isArray(extra?.answers)?extra.answers.slice(0,18):[]};
}
async function v23CreateInvite(){
  const partnerProfileName=activeProfile('partner');
  if(!partnerProfileName){alert("先に相手プロフィールを作って、名前をつけてください。");return}
  if(!loadDiagRadar("my")){alert("先に自分の前半18問の特性チェックを終えてね。");return}
  const shareMy=!!document.getElementById("v23HostShare")?.checked;
  const owner=v23OwnerToken();
  const payload={ownerToken:owner,host:v23CurrentProfilePayload("my"),hostShare:shareMy};
  const r=await fetch("/api/invite",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||"2人用チェックを作れませんでした。");
  const url=d.url||location.origin+"?invite="+d.token;
  v23SetInviteState({token:d.token,ownerToken:owner,hostShare:shareMy,partnerProfileName});
  v26StartHostPolling();
  const shareData={title:"CoreLingual 2人で特性チェック",text:"CoreLingualで2人のコミュニケーション傾向をチェックしよう",url};
  if(navigator.share){try{await navigator.share(shareData)}catch(e){if(e?.name!=="AbortError")throw e}}else if(navigator.clipboard){await navigator.clipboard.writeText(url);alert("招待リンクをコピーしたよ！\n相手に送ってみてね。")}else prompt("このリンクを送ってね",url);
  await v23LoadHost();
}
let v26HostPollTimer=null;
let v26PartnerPollTimer=null;
function v23RenderHostStatus(d){
  if(!v29HostInviteActive())return;
  const box=document.getElementById('v23InviteControls');if(!box)return;
  const s=d?.status||{};
  const partnerName=v23GetInviteState()?.partnerProfileName||activeProfile('partner')||'相手';
  box.innerHTML=`<div class="v36-status"><b>🔗 2人用チェックを作成しました</b><br>「${escapeHtml(partnerName)}」プロフィールへの回答を待っています。<br>${s.joined?'相手が回答を完了しています。':'まだ相手の回答待ちです。'}<br>${s.partnerShared?'相手の結果を共有しています。':'相手は結果を共有していないため、比較結果はまだ表示できません。'}</div>
<button id="v23ResetInviteBtn" type="button" style="margin-top:8px;width:100%;padding:10px;border:1px solid #ddd;border-radius:11px;background:#fff;color:#59616b">↩️ 招待を終了して戻る</button>`;
  if(s.joined&&s.partnerShared&&d.partnerProfile){
    savePartnerSharedProfile(d.partnerProfile,v23GetInviteState()?.partnerProfileName||'');
    box.innerHTML+=`<div class="v36-status"><b>🎉 2人分の結果が揃いました</b><br>相手の36問の結果を「相手」プロフィールに反映し、2人の比較を表示しています。</div>`;
    const shared=document.createElement('div');shared.className='v36-shared-result';renderPartnerResultOnly(shared,d.partnerProfile,'相手');box.appendChild(shared);
    document.body.classList.add('invite-complete-mode');
    renderTwoPersonComparison();
  }
}
function v26StartHostPolling(){
  if(v26HostPollTimer)clearInterval(v26HostPollTimer);
  const inv=v23GetInviteState();if(!inv?.token||!inv?.ownerToken)return;
  v23LoadHost();
  v26HostPollTimer=setInterval(v23LoadHost,5000);
}
async function v23ShowInviteEnded(){
  try{if(v26PartnerPollTimer)clearInterval(v26PartnerPollTimer);v26PartnerPollTimer=null}catch{}
  try{localStorage.removeItem(V22_INVITE_KEY)}catch{}
  document.body.classList.remove('invite-questions-mode');
  document.body.classList.add('invite-ended-mode');
  const box=document.getElementById('v23InviteControls');
  if(box)box.innerHTML='<div class="v49-ended"><b>🔚 この招待は終了しました。</b><br>招待した側が終了したため、この2人用チェックはもう使用できません。通常の特性チェックに戻れます。</div>';
  const q=document.getElementById('diagQuestionPanel');if(q)q.style.display='none';
  const r=document.getElementById('diagResult');if(r)r.style.display='none';
  const m=document.getElementById('moreDiag');if(m)m.style.display='none';
}
async function v23LoadPartner(){
  const inv=v23GetInviteState();if(!inv?.token||inv?.ownerToken)return;
  try{
    const r=await fetch("/api/invite?token="+encodeURIComponent(inv.token),{cache:"no-store"});
    if(r.status===404){await v23ShowInviteEnded();return}
    if(!r.ok)return;
  }catch{}
}
function v26StartPartnerPolling(){
  if(v26PartnerPollTimer)clearInterval(v26PartnerPollTimer);
  const inv=v23GetInviteState();if(!inv?.token||inv?.ownerToken)return;
  v23LoadPartner();
  v26PartnerPollTimer=setInterval(v23LoadPartner,5000);
}
// 動的に描画される終了ボタン用の保険。イベント委譲で確実にリセットする。
document.addEventListener('click',(e)=>{
  const b=e.target?.closest?.('#v23ResetInviteBtn');
  if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  v23ResetInvite();
},true);
async function v23CheckInvite(){
  const t=v23InviteToken();if(!t)return false;
  document.body.classList.add('invite-mode');
  const box=document.getElementById("v23InviteControls");
  if(!box)return true;
  let d;try{const r=await fetch("/api/invite?token="+encodeURIComponent(t),{cache:"no-store"});d=await r.json();if(!r.ok)throw new Error(d.error||"招待リンクを読み込めませんでした。")}catch(e){box.innerHTML=`<div class="v36-invite-focus"><div style="font-size:19px;font-weight:800;color:#c74369;margin-bottom:8px">👋 特性チェックへの招待です</div><div class="v36-status">${escapeHtml(e.message)}</div></div>`;return true}
  box.innerHTML=`<div class="v36-invite-focus"><div style="font-size:19px;font-weight:800;color:#c74369;margin-bottom:8px">👋 特性チェックへの招待です</div><p style="margin:0 0 12px;font-size:13px;line-height:1.75">このリンクは、2人のコミュニケーション傾向を比べるための特性チェック用です。ここでは特性チェックだけを行います。</p><div class="v36-consent"><b>🔒 結果の共有は自分で選べます</b><br>あなたの回答結果は、「共有する」を選ばない限り相手には表示されません。</div><div id="v26HostSharedPreview"></div><div class="v36-check"><input id="v23ShareMy" type="checkbox"><label for="v23ShareMy"><b>回答後、自分の結果を相手に共有する</b><br>チェック後にも変更できます。</label></div><button id="v23JoinBtn" class="primary">🧩 特性チェックを始める</button></div>`;
  if(d.hostShare&&d.hostProfile){document.getElementById('v26HostSharedPreview').innerHTML='<div class="v36-status"><b>相手が自分の結果を共有しています。</b><br>チェック完了後、ここでも確認できます。</div>';}
  document.getElementById("v23JoinBtn").onclick=()=>{
    const share=!!document.getElementById("v23ShareMy").checked;
    const key=v23EnsurePartnerKey(t);
    v23SetInviteState({token:t,partnerKey:key,shareMy:share});
    document.body.classList.remove('invite-mode');document.body.classList.add('invite-questions-mode');
    document.getElementById("diag").style.display="block";document.getElementById("talk").style.display="none";
    document.getElementById("diagTab").classList.add("on");document.getElementById("talkTab").classList.remove("on");
    target="my";selfDiag.classList.add("on");otherDiag.classList.remove("on");targetNote.textContent="";
    diagResult.innerHTML='';document.getElementById('moreDiag').style.display='none';
    showDiagQuestions();
    v26StartPartnerPolling();
    window.scrollTo({top:0,behavior:"smooth"});
  };
  return true;
}
let v23PartnerSubmitPromise=null;
async function v23SubmitPartner(){
  if(v23PartnerSubmitPromise)return v23PartnerSubmitPromise;
  v23PartnerSubmitPromise=(async()=>{
    const inv=v23GetInviteState();if(!inv?.token)return;
    const share=!!inv.shareMy;
    const key=v23EnsurePartnerKey(inv.token);
    const payload={token:inv.token,partnerKey:key,partner:v23CurrentProfilePayload("my"),partnerShare:share};
    const r=await fetch("/api/invite",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"回答を保存できませんでした。");
    if(d.partnerKey){inv.partnerKey=d.partnerKey;v23SetInviteState(inv)}
    const shareResp=await fetch('/api/invite',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:inv.token,who:'partner',share,partnerKey:inv.partnerKey||key})});
    if(!shareResp.ok){const sd=await shareResp.json().catch(()=>({}));throw new Error(sd.error||'共有設定を保存できませんでした。もう一度試してね。');}
    v23SetInviteState({...inv,shareMy:share});
    const box=document.getElementById("v23InviteControls");
    if(box){
      box.innerHTML=`<div class="v55-done">
        <div class="v36-status"><b>✅ 回答を送信しました</b><br>${share?"結果を相手に共有しています。":"結果はまだ相手には共有していません。下のスイッチで変更できます。"}</div>
        <div class="v36-check"><input id="v26PartnerShareToggle" type="checkbox" ${share?'checked':''}><label for="v26PartnerShareToggle"><b>相手に自分の結果を見せる</b></label></div>
        <button type="button" id="v55UseCoreLingualBtn" class="primary">🌱 自分でも CoreLingual を使ってみる</button>
      </div>`;
      document.getElementById('v26PartnerShareToggle')?.addEventListener('change',async e=>{
        try{
          const rr=await fetch('/api/invite',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:inv.token,who:'partner',share:e.target.checked,partnerKey:inv.partnerKey||key})});
          if(!rr.ok)throw new Error('共有設定を更新できませんでした。');
          inv.shareMy=e.target.checked;v23SetInviteState(inv);
        }catch(err){e.target.checked=!e.target.checked;alert(err.message)}
      });
      document.getElementById('v55UseCoreLingualBtn')?.addEventListener('click',()=>{
        try{localStorage.removeItem(V22_INVITE_KEY)}catch{}
        const u=new URL(location.href);u.search='';u.hash='';location.href=u.toString();
      });
      document.getElementById('diagQuestionPanel')?.style.setProperty('display','none','important');
      document.getElementById('moreDiag')?.style.setProperty('display','none','important');
      document.getElementById('diagResult')?.style.setProperty('display','none','important');
      document.body.classList.remove('invite-questions-mode');
      document.body.classList.add('invite-complete-mode');
    }
  })();
  try{return await v23PartnerSubmitPromise}finally{v23PartnerSubmitPromise=null}
}
async function v23LoadHost(){
  const inv=v23GetInviteState();if(!inv?.token||!inv?.ownerToken)return;
  try{const r=await fetch("/api/invite?token="+encodeURIComponent(inv.token)+"&owner="+encodeURIComponent(inv.ownerToken),{cache:"no-store"});if(r.status===404){await v23ResetInvite();return}const d=await r.json();if(r.ok)v23RenderHostStatus(d)}catch{}
}
