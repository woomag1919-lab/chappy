
(function(){
  document.body.classList.add('v72-active');
  const shell=document.getElementById('v72Shell');
  if(!shell)return;
  const page1=document.getElementById('v72Page1'),page2=document.getElementById('v72Page2'),page3=document.getElementById('v72Page3'),page4=document.getElementById('v72Page4');
  const pages=[page1,page2,page3,page4];
  const dots=[...document.querySelectorAll('.v72-dot')];
  const talkOriginal=document.getElementById('talk');
  const diagOriginal=document.getElementById('diag');
  const profilePanels=[...document.querySelectorAll('#talk > .panel')];
  // The original talk/diag sections were removed from the normal flow above; rebuild references from saved IDs if present.
  const conversationPanel=document.querySelector('#v72ConversationMount') && document.querySelector('#v72ConversationMount').dataset.ready ? null : document.querySelector('#talk > .panel');
  function setNames(){
    const my=typeof activeProfile==='function'?activeProfile('my'):null;
    const partner=typeof activeProfile==='function'?activeProfile('partner'):null;
    document.getElementById('v72MyName').textContent=my||'未設定';
    document.getElementById('v72PartnerName').textContent=partner||'未設定';
    document.getElementById('v72ContextLine').textContent=(my||'自分')+' × '+(partner||'相手')+' の会話として解析します。プロフィールや特性チェックは後からでも設定できます。';
  }
  function go(i){pages[i].scrollIntoView({behavior:'smooth',block:'start'});dots.forEach((d,n)=>d.classList.toggle('on',n===i));}
  dots.forEach(d=>d.addEventListener('click',()=>go(Number(d.dataset.page))));
  document.getElementById('v72StartConversation').onclick=()=>go(1);
  document.getElementById('v72BackToInput').onclick=()=>go(1);
  document.getElementById('v72BackToResult').onclick=()=>go(2);
  document.getElementById('v72ToCompare').onclick=()=>go(3);
  // Move the original nodes into the new pages. IDs and existing event handlers remain intact.
  const talk=document.getElementById('talk');
  if(talk){
    const panels=[...talk.querySelectorAll(':scope > .panel')];
    const conv=panels[0];
    const prof=panels[1];
    if(conv){document.getElementById('v72ConversationMount').appendChild(conv);}
    const analyzeEl=document.getElementById('analyze');
    const banner=document.getElementById('bannerAd');
    const result=document.getElementById('result');
    if(analyzeEl)document.getElementById('v72AnalyzeMount').appendChild(analyzeEl);
    if(banner)document.getElementById('v72BannerMount').appendChild(banner);
    if(result)document.getElementById('v72ResultMount').appendChild(result);
    if(prof)document.getElementById('v72ProfileMount').appendChild(prof);
  }
  const diag=document.getElementById('diag');
  if(diag){
    // Move the existing diagnostic UI into the diagnostic sheet so all original functions remain usable.
    const inner=[...diag.children];
    const mount=document.getElementById('v72DiagMount');
    inner.forEach(x=>mount.appendChild(x));
  }
  function openProfile(which){
    const overlay=document.getElementById('v72ProfileOverlay');
    const title=document.getElementById('v72ProfileTitle');
    const paneMy=document.getElementById('profileMyPane'),panePartner=document.getElementById('profilePartnerPane');
    const diagBtn=document.getElementById('v72OpenDiag');
    if(which==='my'){
      profileMyPane.style.display='block'; profilePartnerPane.style.display='none'; title.textContent='👤 自分のプロフィール';
      const n=activeProfile('my'); if(n){const x=list('my').find(z=>z.name===n);if(x){apply('my',x.state);const ne=document.getElementById('myName');if(ne)ne.value=x.name;}} else {const ne=document.getElementById('myName');if(ne)ne.value='';}
      if(diagBtn){const fold=profileMyPane.querySelector('.v74-traits-fold'); if(fold) fold.parentNode.insertBefore(diagBtn,fold);}
    }else{
      profileMyPane.style.display='none'; profilePartnerPane.style.display='block'; title.textContent='👥 相手のプロフィール';
      const n=activeProfile('partner'); if(n){const x=list('partner').find(z=>z.name===n);if(x){apply('partner',x.state);const ne=document.getElementById('partnerName');if(ne)ne.value=x.name;}} else {const ne=document.getElementById('partnerName');if(ne)ne.value='';}
      if(diagBtn){const fold=profilePartnerPane.querySelector('.v74-traits-fold'); if(fold) fold.parentNode.insertBefore(diagBtn,fold);}
    }
    overlay.classList.add('show');
  }
  let pickerWhich='my';
  function openPicker(which){
    pickerWhich=which;
    const title=document.getElementById('v72PickerTitle');
    title.textContent=(which==='my'?'👤 自分':'👥 相手')+'のプロフィールを選ぶ';
    const box=document.getElementById('v72PickerChoices');box.innerHTML='';
    const arr=list(which), active=activeProfile(which);
    const add=(label,sub,fn,cls='')=>{const b=document.createElement('button');b.type='button';b.className='v72-choice '+cls;b.innerHTML=label+(sub?'<small>'+sub+'</small>':'');b.onclick=()=>{document.getElementById('v72PickerOverlay').classList.remove('show');fn();};box.appendChild(b)};
    add('＋ 新しく作る','名前をつけてプロフィールを作成',()=>openProfileNew(which),'v72-new');
    arr.forEach(x=>add((active===x.name?'● ':'')+x.name,'このプロフィールを今回の'+(which==='my'?'自分':'相手')+'として使う',()=>{setActiveProfile(which,x.name);apply(which,x.state);draw(which);renderTwoPersonComparison();setNames();}));
    if(arr.length) add('⚙️ 選択中のプロフィールを編集',active||'',()=>openProfile(which));
    document.getElementById('v72PickerOverlay').classList.add('show');
  }
  function openProfileNew(which){
    openProfile(which);
    const name=document.getElementById(which+'Name');
    const free=document.getElementById(which+'Free');
    if(name)name.value='';
    if(free)free.value='';
    document.querySelectorAll('#'+which+'Traits .chip').forEach(x=>x.classList.remove('on'));
    // Do not auto-focus the name field: opening a new profile should not summon the mobile keyboard and hide the next actions.
  }
  document.getElementById('v72MyPicker').onclick=()=>openPicker('my');
  document.getElementById('v72PartnerPicker').onclick=()=>openPicker('partner');
  document.getElementById('v72PickerClose').onclick=()=>document.getElementById('v72PickerOverlay').classList.remove('show');
  document.getElementById('v72ProfileClose').onclick=()=>{document.getElementById('v72ProfileOverlay').classList.remove('show');setNames();};
  document.getElementById('v72OpenDiag').onclick=()=>{
    document.getElementById('v72ProfileOverlay').classList.remove('show');
    const which=pickerWhich;
    if(which==='my')selfDiag.click();else otherDiag.click();
    document.getElementById('v72DiagTitle').textContent=(which==='my'?'👤 自分':'👥 相手')+'の特性チェック';
    document.getElementById('v72DiagOverlay').classList.add('show');
  };
  document.getElementById('v72DiagClose').onclick=()=>{document.getElementById('v72DiagOverlay').classList.remove('show');setNames();renderTwoPersonComparison();};
  // Reflect saves/profile switches in the top page.
  const oldSaveMy=saveMy.onclick,oldSavePartner=savePartner.onclick;
  saveMy.addEventListener('click',()=>setTimeout(setNames,50));
  savePartner.addEventListener('click',()=>setTimeout(setNames,50));
  // Result auto-scroll after the existing analysis handler finishes.
  const analyzeEl=document.getElementById('analyze');
  const resultEl=document.getElementById('result');
  if(analyzeEl && analyzeEl.onclick){
    const old=analyzeEl.onclick;
    analyzeEl.onclick=async function(e){
      const r=await old.call(this,e);
      setTimeout(()=>{const empty=document.getElementById('v72ResultEmpty');if(resultEl && resultEl.innerHTML.trim()){if(empty)empty.style.display='none';go(2);}},80);
      return r;
    };
  }
  // Comparison is already rendered by the existing app; move its live node into page 4.
  const compare=document.getElementById('v21CompareCard');
  if(compare)document.getElementById('v72CompareMount').appendChild(compare);
  // Since the original diagnostic and talk sections are now empty containers, keep them out of normal layout.
  if(talk)talk.style.display='none';
  if(diag)diag.style.display='none';
  setNames();
  function deleteProfile(which){
    const name=activeProfile(which);
    if(!name){alert('削除するプロフィールがありません。');return;}
    if(!confirm('「'+name+'」を削除しますか？\nこの操作は取り消せません。'))return;
    const arr=list(which),idx=arr.findIndex(x=>x.name===name);
    if(idx>=0){arr.splice(idx,1);localStorage.setItem('cl_'+which,JSON.stringify(arr));}
    localStorage.removeItem('cl_'+which+'_active');
    const ne=document.getElementById(which+'Name');if(ne)ne.value='';
    const fe=document.getElementById(which+'Free');if(fe)fe.value='';
    document.querySelectorAll('#'+which+'Traits .chip').forEach(x=>x.classList.remove('on'));
    draw(which);renderTwoPersonComparison();setNames();
    document.getElementById('v72ProfileOverlay')?.classList.remove('show');
    document.getElementById('v72PickerOverlay')?.classList.remove('show');
  }
  document.getElementById('deleteMyProfile')?.addEventListener('click',()=>deleteProfile('my'));
  document.getElementById('deletePartnerProfile')?.addEventListener('click',()=>deleteProfile('partner'));
  function getActiveCompareData(){
    const myName=activeProfile('my'),paName=activeProfile('partner');
    const myOpts=compareSourceOptions('my'),paOpts=compareSourceOptions('partner');
    return {myName:myName||'あなた',paName:paName||'相手',my:myOpts.find(o=>o.id==='prof:my:'+myName)||myOpts.find(o=>o.id==='live:my'),partner:paOpts.find(o=>o.id==='prof:partner:'+paName)||paOpts.find(o=>o.id==='live:partner')};
  }
  function escSvg(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
  function cardSide(score){const n=Number(score);if(n<=35)return 'left';if(n>=65)return 'right';return 'middle';}
  function cardDirection(key,score){
    const a=AXES[key]||{};const side=cardSide(score);
    if(side==='left')return a.left||'左寄り';
    if(side==='right')return a.right||'右寄り';
    return '場面に応じて使い分けやすい';
  }
  function buildCardCopy(data){
    const myScores=Object.fromEntries((data.my?.scores||[]).map(x=>[x.key,Number(x.score)||50]));
    const paScores=Object.fromEntries((data.partner?.scores||[]).map(x=>[x.key,Number(x.score)||50]));
    const defs={
      language:{
        short:{left:'はっきり派',right:'空気派'},
        feature:{left:'大事なことは、言葉ではっきり確認したい',right:'言葉だけでなく、流れや背景から受け取りたい',middle:'言葉と流れの両方を見ながら受け取りたい'},
        titles:{opp:'はっきり派 × 空気派',same:'同じ入口の2人'},
        story:{leftRight:(a,b)=>`${a}は「言葉」を手がかりに、${b}は「流れ」を手がかりに話をつかみやすい2人。`,rightLeft:(a,b)=>`${a}は「流れ」を手がかりに、${b}は「言葉」を手がかりに話をつかみやすい2人。`,same:(a,b)=>`${a}と${b}は、会話の受け取り方が近いぶん、話が早く進みやすい2人。`,middle:(a,b)=>`${a}と${b}は、言葉と流れを行き来しながら会話をつかみやすい2人。`},
        tip:{left:'大事なことほど、短く言葉にして確認する',right:'大事なことは最後に一言だけ確認する',middle:'「ここはこういう意味で合ってる？」を時々入れる'}
      },
      thinking:{
        short:{left:'整理派',right:'ひらめき派'},
        feature:{left:'理由や順番を整理してから進みたい',right:'思いついた可能性を広げながら考えたい',middle:'整理と発想を行き来しながら考えたい'},
        titles:{opp:'整理派 × ひらめき派',same:'同じ考え方の2人'},
        story:{leftRight:(a,b)=>`${a}は「筋道」を整えてから、${b}は「ひらめき」を広げながら前に進みやすい2人。`,rightLeft:(a,b)=>`${a}は「ひらめき」を広げながら、${b}は「筋道」を整えてから前に進みやすい2人。`,same:(a,b)=>`${a}と${b}は、考えるテンポが近いぶん、アイデアを共有しやすい2人。`,middle:(a,b)=>`${a}と${b}は、整理と発想を切り替えながら答えを見つけやすい2人。`},
        tip:{left:'途中のアイデアも「仮の案」として受け取る',right:'広げた案は、最後に一つだけ要点を決める',middle:'「今は案出し」「ここから決める」と区切る'}
      },
      emotion:{
        short:{left:'話して整理',right:'時間で整理'},
        feature:{left:'話しながら気持ちを言葉にして整理したい',right:'少し時間を置いてから気持ちを整理したい',middle:'話す時と考える時を使い分けて整理したい'},
        titles:{opp:'話して整理 × 時間で整理',same:'似たペースの2人'},
        story:{leftRight:(a,b)=>`${a}は「話すうちに」、${b}は「少し離れてから」気持ちを整理しやすい2人。`,rightLeft:(a,b)=>`${a}は「少し離れてから」、${b}は「話すうちに」気持ちを整理しやすい2人。`,same:(a,b)=>`${a}と${b}は、気持ちを整理するペースが近く、無理なく話しやすい2人。`,middle:(a,b)=>`${a}と${b}は、話す時間と考える時間を切り替えながら気持ちを整理しやすい2人。`},
        tip:{left:'「今は聞いてほしい」と先に伝えてみる',right:'時間が必要なら「あとで話したい」と伝える',middle:'話すか考えるか、今ほしい時間を一言で伝える'}
      },
      distance:{
        short:{left:'一緒に整理',right:'ひとりで整理'},
        feature:{left:'話しながら気持ちや状況を整理したい',right:'自分の時間を取ってから話したい',middle:'相手や状況に合わせて距離を調整したい'},
        titles:{opp:'一緒に整理 × ひとりで整理',same:'ちょうどいい距離の2人'},
        story:{leftRight:(a,b)=>`${a}は「一緒に話す」と落ち着き、${b}は「ひとりで整える」と落ち着きやすい2人。`,rightLeft:(a,b)=>`${a}は「ひとりで整える」と落ち着き、${b}は「一緒に話す」と落ち着きやすい2人。`,same:(a,b)=>`${a}と${b}は、距離の取り方が近く、お互いのペースを合わせやすい2人。`,middle:(a,b)=>`${a}と${b}は、話す時間とひとりの時間を状況に合わせて使いやすい2人。`},
        tip:{left:'返事を急がず、相手の考える時間も残す',right:'離れたい時は「落ち着いたら話す」と伝える',middle:'「今話す？あとで話す？」を一言で確認する'}
      },
      change:{
        short:{left:'地図が欲しい',right:'歩きながら'},
        feature:{left:'先の流れが見えると安心して進みやすい',right:'まず試して、途中で調整しながら進みやすい',middle:'見通しを立てつつ、必要なら柔軟に変えやすい'},
        titles:{opp:'地図が欲しい × 歩きながら',same:'似た進み方の2人'},
        story:{leftRight:(a,b)=>`${a}は「地図を見てから」、${b}は「歩きながら」進み方を決めやすい2人。`,rightLeft:(a,b)=>`${a}は「歩きながら」、${b}は「地図を見てから」進み方を決めやすい2人。`,same:(a,b)=>`${a}と${b}は、進み方の感覚が近く、予定を合わせやすい2人。`,middle:(a,b)=>`${a}と${b}は、見通しと柔軟さのバランスを取りながら進みやすい2人。`},
        tip:{left:'「今のところ」を添えて、予定に余白を残す',right:'変える前に「ここまではこのまま」と伝える',middle:'変更するときは「何が変わるか」を一言で共有する'}
      },
      communication:{
        short:{left:'まず分かって',right:'まず解決'},
        feature:{left:'気持ちを受け止めてもらってから話を進めたい',right:'何をすればいいか具体的になると話を進めやすい',middle:'気持ちと具体策の両方を見ながら話を進めたい'},
        titles:{opp:'まず分かって × まず解決',same:'同じ入口の2人'},
        story:{leftRight:(a,b)=>`${a}は「分かってもらうこと」から、${b}は「どうするか」から会話を前に進めやすい2人。`,rightLeft:(a,b)=>`${a}は「どうするか」から、${b}は「分かってもらうこと」から会話を前に進めやすい2人。`,same:(a,b)=>`${a}と${b}は、会話の入口が近いぶん、気持ちを共有しやすい2人。`,middle:(a,b)=>`${a}と${b}は、気持ちと具体策の両方を行き来しながら話を進めやすい2人。`},
        tip:{left:'「そう感じたんだね」を先に置いてみる',right:'解決策の前に「まず聞くよ」を一言添える',middle:'「聞いてほしい？一緒に考える？」を確認する'}
      }
    };
    const keys=Object.keys(defs);let best=keys[0],bestDiff=-1;
    keys.forEach(k=>{const d=Math.abs((myScores[k]??50)-(paScores[k]??50));if(d>bestDiff){best=k;bestDiff=d;}});
    const def=defs[best],ms=myScores[best]??50,ps=paScores[best]??50;
    const mySide=cardSide(ms),paSide=cardSide(ps),A=data.myName||'あなた',B=data.paName||'相手';
    const sideLabel=side=>side==='left'?def.short.left:side==='right'?def.short.right:'バランス型';
    const feature=side=>side==='left'?def.feature.left:side==='right'?def.feature.right:def.feature.middle;
    let title;
    if(mySide==='middle'&&paSide==='middle') title='似た入口の2人';
    else if(mySide===paSide) title=def.titles.same;
    else title=def.titles.opp;
    if(bestDiff<22) title='似た入口の2人';
    let story;
    if(mySide==='left'&&paSide==='right') story=def.story.leftRight(A,B);
    else if(mySide==='right'&&paSide==='left') story=def.story.rightLeft(A,B);
    else if(mySide===mySide&&paSide===mySide&&mySide!=='middle') story=def.story.same(A,B);
    else story=def.story.middle(A,B);
    let myTip=def.tip[mySide]||def.tip.middle,paTip=def.tip[paSide]||def.tip.middle;
    if(mySide===paSide&&mySide!=='middle'){
      myTip=def.tip.middle;paTip=def.tip.middle;
    }
    return {title,myName:A,paName:B,myFeature:feature(mySide),paFeature:feature(paSide),myShort:sideLabel(mySide),paShort:sideLabel(paSide),story,myTip,paTip,bestDiff};
  }
  function svgTextLines(text,maxChars){
    const out=[];let cur='';for(const ch of String(text||'')){if(ch==='\n'){if(cur)out.push(cur);cur='';continue;}if([...cur].length>=maxChars){out.push(cur);cur='';}cur+=ch;}if(cur)out.push(cur);return out;
  }
  function svgParagraph(text,x,y,maxChars,lineH,opts={}){
    const lines=svgTextLines(text,maxChars);const fill=opts.fill||'#39424d',size=opts.size||25,weight=opts.weight||500,anchor=opts.anchor||'start';
    return lines.map((line,i)=>`<text x="${x}" y="${y+i*lineH}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${escSvg(line)}</text>`).join('');
  }
  function copyComputedStyles(src,dst){
    if(!src||!dst)return;
    const cs=getComputedStyle(src);
    const props=['box-sizing','display','position','width','height','min-height','max-width','margin','padding','border','border-radius','background','background-color','color','font-family','font-size','font-weight','line-height','letter-spacing','text-align','vertical-align','white-space','word-break','overflow','grid-template-columns','grid-template-rows','gap','align-items','justify-content'];
    props.forEach(k=>{const v=cs.getPropertyValue(k);if(v)dst.style.setProperty(k,v);});
    const sc=src.children,dc=dst.children;
    for(let i=0;i<sc.length;i++)if(dc[i])copyComputedStyles(sc[i],dc[i]);
  }
  function buildCompareImageSvg(){
    const source=document.getElementById('v21CompareCard');
    if(!source)throw new Error('比較結果が見つかりません');
    const clone=source.cloneNode(true);
    clone.removeAttribute('id');
    clone.style.display='block';
    clone.style.visibility='visible';
    clone.style.width='1000px';
    clone.style.maxWidth='1000px';
    clone.style.margin='0';
    clone.style.padding='42px';
    clone.style.background='#ffffff';
    clone.style.border='0';
    clone.style.borderRadius='0';
    copyComputedStyles(source,clone);
    clone.style.display='block';
    clone.style.width='1000px';
    clone.style.maxWidth='1000px';
    clone.style.padding='42px';
    clone.style.background='#ffffff';
    clone.style.border='0';
    clone.style.borderRadius='0';
    clone.querySelectorAll('button,select,input,[aria-hidden="true"]').forEach(el=>el.remove());
    const holder=document.createElement('div');
    holder.style.position='fixed';holder.style.left='-100000px';holder.style.top='0';holder.style.width='1084px';holder.style.background='#fff';holder.style.padding='0';holder.style.visibility='hidden';holder.appendChild(clone);document.body.appendChild(holder);
    const w=1084,h=Math.max(900,Math.ceil(clone.scrollHeight||clone.getBoundingClientRect().height)+8);
    holder.remove();
    // SVGのforeignObjectはXMLとして解析されるため、HTMLのvoid要素（br/img/input等）を
    // XML互換の自己終了タグへ正規化してから埋め込む。これをしないとAndroidの画像ビューア等で
    // 「Opening and ending tag mismatch: br ... p」のようなXMLエラーになる。
    // XMLSerializerでXHTMLとして直列化する。outerHTMLのHTML表記（<br>など）を
    // 正規表現だけで直す方式はAndroidのXMLパーサーで取りこぼしが起きるため使わない。
    const serializer=new XMLSerializer();
    let html=serializer.serializeToString(clone).replace(/&nbsp;/g,' ');
    // HTML→XHTML変換で残る可能性のあるvoid要素を念のため自己終了化。
    html=html.replace(/<(br|hr|img|input|meta|link|source|area|base|col|embed|param|track|wbr)(\s[^<>]*?)?\s*>/gi,(_,tag,attrs='')=>`<${tag}${attrs || ''} />`);
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#ffffff"/><foreignObject x="0" y="0" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;box-sizing:border-box;background:#fff;">${html}</div></foreignObject></svg>`;
  }
  async function downloadCompareCard(){
    const data=getActiveCompareData();if(!data.my||!data.partner){alert('2人分の比較データがまだありません。');return;}
    const overlay=document.getElementById('v73DownloadAdOverlay'),count=document.getElementById('v73DownloadAdCount');overlay?.classList.add('show');
    for(let n=5;n>=1;n--){if(count)count.textContent=String(n);await new Promise(r=>setTimeout(r,1000));}overlay?.classList.remove('show');
    let svgUrl='';
    try{
      const svg=buildCompareImageSvg();
      const svgBlob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});svgUrl=URL.createObjectURL(svgBlob);
      const img=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=svgUrl;});
      const width=img.naturalWidth||img.width||1084,height=img.naturalHeight||img.height||900;
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);
      const png=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG生成に失敗しました')),'image/png'));
      const url=URL.createObjectURL(png),a=document.createElement('a');a.href=url;a.download='CoreLingual_2人のコミュニケーション比較.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
    }catch(e){
      console.error('comparison image export failed',e);
      if(svgUrl){const a=document.createElement('a');a.href=svgUrl;a.download='CoreLingual_2人のコミュニケーション比較.svg';document.body.appendChild(a);a.click();a.remove();}
      else alert('画像の作成に失敗しました。もう一度お試しください。');
    }finally{if(svgUrl)setTimeout(()=>URL.revokeObjectURL(svgUrl),1500);}
    const toast=document.createElement('div');toast.className='v73-download-toast';toast.textContent='比較結果を保存しました';document.body.appendChild(toast);setTimeout(()=>toast.remove(),2200);
  }
  document.getElementById('v73DownloadCompare')?.addEventListener('click',downloadCompareCard);
  // Page tracking.
  const io=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){const i=pages.indexOf(en.target);dots.forEach((d,n)=>d.classList.toggle('on',n===i));}}),{root:shell,threshold:.6});
  pages.forEach(p=>io.observe(p));
})();
