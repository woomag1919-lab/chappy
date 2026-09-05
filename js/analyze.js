function buildAiProfileTextFromStorage(p){
  try{
    const base=JSON.parse(localStorage.getItem('cl_diag_result_'+p)||'null');
    const ex=JSON.parse(localStorage.getItem('cl_extra_result_'+p)||'null');
    const free=document.getElementById(p+'Free')?.value||'';
    if(!base?.scores)return '';
    return buildAiProfileText(base.scores,p==='my'?'あなた':'相手',ex?.scores||[],free);
  }catch{return ''}
}
analyze.onclick=async()=>{analyze.disabled=true;const originalText=analyze.innerHTML;analyze.innerHTML='<span class="spinner"></span>準備中…';let note=document.getElementById("loadingNote");if(!note){note=document.createElement("div");note.id="loadingNote";note.className="loading-note";analyze.after(note)}note.textContent="会話を読み込んでいます…";try{let body={inputMode:textArea.style.display!=="none"?"text":"image",message:message.value,speaker:currentSpeaker,imageQuestion:(document.getElementById("imageQuestion")||{}).value||"",myTraits:state("my").traits,partnerTraits:state("partner").traits,myFree:myFree.value,partnerFree:partnerFree.value,diagnosisContext:{my:buildAiProfileTextFromStorage("my"),partner:buildAiProfileTextFromStorage("partner")},images:[]};
  if(body.inputMode==="image"){
    if(!selectedImages.length)throw Error("スクショを1枚以上追加してね。");
    analyze.innerHTML='<span class="spinner"></span>広告を表示中…';
    await waitAd(5,imageAd,imageAdCountdown,"短い広告のあと分析します");
    for(const f of selectedImages){const r=await new Promise(ok=>{let fr=new FileReader();fr.onload=()=>ok(fr.result.split(",")[1]);fr.readAsDataURL(f)});body.images.push({data:r,mime_type:f.type||"image/jpeg"})}
  }
  const requestBody=JSON.stringify(body);
  if(requestBody.length>3900000)throw Error("スクショの容量が大きすぎます。枚数を減らすか、画像を小さくしてもう一度試してください。");
  analyze.innerHTML='<span class="spinner"></span>分析中…';
  note.textContent=body.inputMode==="image"
    ? ("スクショ"+body.images.length+"枚をAIに送っています。"+(body.images.length>=4?"時間がかかる場合は、AIが自動で別モデルへ切り替えて再試行します…":"少し時間がかかる場合があります…"))
    : "会話をAIに送っています…";
  let r=await fetch("/api/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:requestBody});
  const responseText=await r.text();let d;try{d=JSON.parse(responseText)}catch{d={}};
  if(!r.ok){
    if(r.status===413)throw Error("スクショの容量が大きすぎます。枚数を減らすか、画像を小さくしてもう一度試してください。");
    if(r.status===429)throw Error(d.error||"AIサービスが429（利用制限）を返しました。少し時間をおいて、もう一度試してください。");
    if(r.status===504){
      let msg=d.error||"解析に時間がかかりすぎました。スクショが多い場合は枚数を減らして、しばらくしてからもう一度試してください。";
      const dg=d.diagnostic;
      if(dg && (dg.providerStatus||dg.providerMessage)){
        const parts=[];
        if(dg.providerCode)parts.push("HTTP "+dg.providerCode);
        if(dg.providerStatus)parts.push(dg.providerStatus);
        if(dg.providerMessage)parts.push(dg.providerMessage);
        msg += "\n\n【Gemini診断情報】\n"+parts.join(" / ");
        if(Array.isArray(dg.attempts) && dg.attempts.length){
          const tries=dg.attempts.map(a=>{
            const model=a.model||"unknown";
            const reason=a.reason?" / "+a.reason:"";
            const st=a.providerStatus||a.status||"";
            return model+reason+(st?" / "+st:"");
          }).join(" → ");
          if(tries)msg += "\n試行: "+tries;
        }
      }
      throw Error(msg);
    }
    if(r.status===400)throw Error(d.error||"送信した内容をAIが受け取れませんでした。スクショを減らすか、画像を小さくしてもう一度試してください。");
    if(r.status===422)throw Error(d.error||"AIから解析結果を受け取れませんでした。文字が読み取りにくい可能性があります。");
    if(r.status>=500){
      let msg=d.error||"AIサービスが一時的に利用できません。しばらく時間をおいて、もう一度試してください。";
      const dg=d.diagnostic;
      if(dg && (dg.providerStatus||dg.providerMessage||dg.providerCode)){
        const parts=[];
        if(dg.providerCode)parts.push("HTTP "+dg.providerCode);
        if(dg.providerStatus)parts.push(dg.providerStatus);
        if(dg.providerMessage)parts.push(dg.providerMessage);
        msg += "\n\n【Gemini診断情報】\n"+parts.join(" / ");
        if(dg.retryAfter)msg += "\nRetry-After: "+dg.retryAfter;
        if(Array.isArray(dg.attempts) && dg.attempts.length){
          const tries=dg.attempts.map(a=>{
            const model=a.model||"unknown";
            const reason=a.reason?" / "+a.reason:"";
            const st=a.providerStatus||a.status||"";
            return model+reason+(st?" / "+st:"");
          }).join(" → ");
          if(tries) msg += "\n試行: "+tries;
        }
      }
      throw Error(msg);
    }
    throw Error(d.error||"解析に失敗しました（HTTP "+r.status+"）。");
  }
  render(d);note.textContent="分析が完了しました。"}
  catch(e){result.innerHTML='<div class="card"><b>エラー</b><p></p></div>';result.querySelector("p").textContent=e.message;note.textContent="分析に失敗しました。"}
  finally{analyze.disabled=false;analyze.innerHTML=originalText;imageAdCountdown.textContent=""}};
