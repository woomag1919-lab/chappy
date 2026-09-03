
(function(){
  const el=document.getElementById("analysisCharCount");
  if(!el)return;
  const ta=el.previousElementSibling;
  if(!ta || ta.tagName!=="TEXTAREA")return;
  const max=60000;
  function update(){
    const n=ta.value.length;
    el.textContent=n.toLocaleString()+" / "+max.toLocaleString()+"文字";
    el.classList.toggle("warn", n>=50000);
  }
  ta.setAttribute("maxlength",String(max));
  ta.addEventListener("input",update);
  update();
})();
