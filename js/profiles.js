function state(p){return{traits:[...document.querySelectorAll("#"+p+"Traits .on")].map(x=>x.textContent),free:document.getElementById(p+"Free").value}}
function apply(p,s){document.getElementById(p+"Free").value=s.free||"";document.querySelectorAll("#"+p+"Traits .chip").forEach(x=>x.classList.toggle("on",(s.traits||[]).includes(x.textContent)))}
function list(p){try{return JSON.parse(localStorage.getItem("cl_"+p)||"[]")}catch{return[]}}
function activeProfile(p){try{return JSON.parse(localStorage.getItem("cl_"+p+"_active")||"null")}catch{return null}}
function setActiveProfile(p,name){localStorage.setItem("cl_"+p+"_active",JSON.stringify(name))}
function draw(p){const e=document.getElementById(p+"Profiles");if(!e)return;e.innerHTML="";const active=activeProfile(p);list(p).forEach((x,idx)=>{let b=document.createElement("button");b.className="profile"+(active===x.name?" active":"");b.type="button";b.textContent=(active===x.name?"● ":"")+x.name;let timer=null,longPressed=false;const cancel=()=>{if(timer){clearTimeout(timer);timer=null}};b.addEventListener("pointerdown",()=>{longPressed=false;timer=setTimeout(()=>{longPressed=true;if(confirm("「"+x.name+"」を削除しますか？")){let a=list(p);a.splice(idx,1);localStorage.setItem("cl_"+p,JSON.stringify(a));if(active===x.name)localStorage.removeItem("cl_"+p+"_active");draw(p)}},650)});b.addEventListener("pointerup",cancel);b.addEventListener("pointercancel",cancel);b.addEventListener("pointerleave",cancel);b.addEventListener("click",()=>{if(longPressed)return;setActiveProfile(p,x.name);apply(p,x.state);draw(p)});e.appendChild(b)})}
function clearNameRequired(p){
  const input=document.getElementById(p+"Name");
  const error=document.getElementById(p+"NameError");
  if(input)input.classList.remove("v84-name-invalid");
  if(input)input.removeAttribute("aria-invalid");
  if(error)error.textContent="";
}
function showSaveNameRequired(p){
  const input=document.getElementById(p+"Name");
  const error=document.getElementById(p+"NameError");
  if(error)error.textContent="プロフィール名を入力してください";
  if(input){
    input.classList.add("v84-name-invalid");
    input.setAttribute("aria-invalid","true");
    input.focus();
    input.scrollIntoView({block:"center",behavior:"smooth"});
  }
}

function save(p,opts={}){
  const input=document.getElementById(p+"Name");
  const name=input.value.trim();
  if(!name){
    showSaveNameRequired(p);
    return false;
  }
  clearNameRequired(p);
  const btn=document.getElementById(p==="my"?"saveMy":"savePartner");
  if(btn?.dataset.saving==="1")return false;
  if(btn)btn.dataset.saving="1";
  let a=list(p);
  const existing=a.findIndex(x=>x.name===name);
  const item={name,state:state(p)};
  if(existing>=0)a[existing]=item;else a.push(item);
  a=a.slice(-5);
  localStorage.setItem("cl_"+p,JSON.stringify(a));
  setActiveProfile(p,name);
  draw(p);
  renderTwoPersonComparison();
  if(opts.close!==false){
    document.getElementById('v72ProfileOverlay')?.classList.remove('show');
    setNames();
  }
  if(opts.toast!==false){
    const toast=document.createElement('div');
    toast.className='v76-profile-toast';
    toast.textContent='✓ プロフィールを保存しました';
    document.body.appendChild(toast);
    setTimeout(()=>toast.remove(),1800);
  }
  if(btn)setTimeout(()=>{btn.dataset.saving="0"},300);
  return true;
}

saveMy.onclick=()=>save("my");savePartner.onclick=()=>save("partner");
