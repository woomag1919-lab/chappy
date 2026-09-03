
(function(){
  function boot(){ try{if(!v29HostInviteActive() && localStorage.getItem('cl_shared_partner_profile')){localStorage.removeItem('cl_shared_partner_profile')}}catch{} renderTwoPersonComparison();restoreDiagAnswers(target); if(loadDiagRadar(target)){const m=document.getElementById('moreDiag');if(m)m.style.display='block';} }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

(function(){
  const box=document.getElementById("v23InviteControls");
  if(box && !v23InviteToken()){box.innerHTML=v23InviteCreateControls();v23BindCreateInvite();}
  // v54: 招待パートナーの送信は後半18問完了後のみ（script末尾の capture handler）
  v23CheckInvite();
  v23LoadHost();
  v26StartHostPolling();
  v26StartPartnerPolling();
})();
