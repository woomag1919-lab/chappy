/* CoreLingual v134 — tune 6-axis layouts for all comparison patterns */
(function(){
  'use strict';

  const TEMPLATE_BY_AXES={6:['/assets/comparison-6-01.png','/assets/comparison-6-02.png','/assets/comparison-6-03.png'],9:['/assets/comparison-9-01.png','/assets/comparison-9-02.png','/assets/comparison-9-03.png']};
  function templateIndexFromDifferenceCount(count){return count<=1?0:count===2?1:2;}
  function pickTemplatePath(axisCount,differenceCount){const group=TEMPLATE_BY_AXES[axisCount]||TEMPLATE_BY_AXES[9];return group[templateIndexFromDifferenceCount(differenceCount)];}
  function textFrom(el,selector){return(el?.querySelector(selector)?.textContent||'').trim();}

  async function buildCompareTemplateCanvas(){
    const data=window.getActiveCompareData?.();
    if(!data?.my||!data?.partner)throw new Error('比較データが取得できませんでした');
    await Promise.all([document.fonts.load('700 34px "Zen Kaku Gothic New"'),document.fonts.load('500 24px "Zen Kaku Gothic New"'),document.fonts.load('400 20px "Zen Kaku Gothic New"')]);
    const rows=[...document.querySelectorAll('#v21CompareCard .v82-axis-row')].map(el=>{const ds=el.querySelectorAll(':scope > div');return{name:(ds[0]?.textContent||'').trim(),a:(ds[1]?.textContent||'').trim(),b:(ds[2]?.textContent||'').trim()};});
    const topItems=[...document.querySelectorAll('#v21CompareCard .v82-top-item')].slice(0,3).map((el,i)=>({num:String(i+1).padStart(2,'0'),axis:textFrom(el,'.v82-top-axis').replace(/^[^ぁ-んァ-ン一-龥A-Za-z0-9]+/,'').trim(),a:el.querySelector('.v82-top-contrast b:nth-of-type(1)')?.textContent||'',b:el.querySelector('.v82-top-contrast b:nth-of-type(2)')?.textContent||''}));
    const axisCount=rows.length>=9?9:6;
    const differenceCount=Math.min(3,topItems.length);
    const templatePath=pickTemplatePath(axisCount,differenceCount);
    const src=new Image();src.src=templatePath;
    await new Promise((resolve,reject)=>{src.onload=resolve;src.onerror=()=>reject(new Error('比較テンプレートを読み込めませんでした: '+templatePath));});
    const W=1024,H=1536,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.drawImage(src,0,0,W,H);
    const fontFamily='"Zen Kaku Gothic New","Noto Sans JP",sans-serif',navy='#142d48',gray='#4d5660';
    const setFont=(size,weight='500')=>{ctx.font=`${weight} ${size}px ${fontFamily}`;};
    const text=(str,x,y,size,weight='500',color=gray,align='left')=>{setFont(size,weight);ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(String(str??''),x,y);};
    const fit=(str,maxW,size,weight='500',min=10)=>{let s=size;setFont(s,weight);while(s>min&&ctx.measureText(String(str??'')).width>maxW){s-=1;setFont(s,weight);}return s;};
    const wrap=(str,maxW,size,weight='500',maxLines=2,min=10)=>{let s=fit(str,maxW,size,weight,min);setFont(s,weight);const lines=[];let cur='';for(const ch of [...String(str??'')]){const t=cur+ch;if(ctx.measureText(t).width>maxW&&cur){lines.push(cur);cur=ch;if(lines.length===maxLines-1)break;}else cur=t;}if(cur)lines.push(cur);return{lines,size:s};};
    const drawLines=(lines,x,y,size,weight,color,lineH)=>lines.forEach((l,i)=>text(l,x,y+i*lineH,size,weight,color,'left'));

    const layout9=differenceCount<=1?{bodyTop:472,rowH:63,nameY:411,topY:differenceCount===0?[]:[286],iconTop:[448,508,568,628,688,748,808,868,928]}:{bodyTop:551,rowH:60,nameY:488,topY:differenceCount===2?[300,380]:[271,334,396],iconTop:[527,587,647,707,767,827,887,947,1007]};
    const layout6=differenceCount<=1?{bodyTop:530,rowH:74,nameY:462,topY:differenceCount===0?[]:[286],iconTop:[505,579,653,727,801,875]}:{bodyTop:612,rowH:69,nameY:548,topY:differenceCount===2?[286,370]:[270,334,398],iconTop:[586,655,724,793,862,931]};
    const layout=axisCount===9?layout9:layout6;
    const iconSource={};
    const iconNames=['情報の受け取り方','考え方','感情の扱い方','人との距離感','変化への対応','伝え方・受け止め方','近づき方・距離の取り方','刺激への反応','進め方・柔軟性'];
    iconNames.forEach((name,i)=>iconSource[name]={x:75,y:layout.iconTop[i]});
    const drawAxisIcon=(name,dx,dy,size=48)=>{const s=iconSource[name];if(!s)return;const off=document.createElement('canvas');off.width=50;off.height=50;const oc=off.getContext('2d');oc.drawImage(src,s.x,s.y,50,50,0,0,50,50);const im=oc.getImageData(0,0,50,50);for(let k=0;k<im.data.length;k+=4){const r=im.data[k],g=im.data[k+1],b=im.data[k+2];if(r>238&&g>238&&b>238)im.data[k+3]=0;}oc.putImageData(im,0,0);ctx.drawImage(off,dx,dy,size,size);};
    if(!topItems.length){text('大きな差は少なめ。似た入口から会話を進めやすい2人です。',512,286,24,'700',gray,'center');}
    else topItems.forEach((it,i)=>{const cy=layout.topY[i]??layout.topY[layout.topY.length-1]??286;drawAxisIcon(it.axis,176,cy-27,48);const axis=wrap(it.axis,205,18,'700',2,11);drawLines(axis.lines,248,cy-15,axis.size,'700',navy,19);text(it.a,360,cy+18,fit(it.a,210,24,'700',13),'700',navy,'center');text('×',520,cy+18,30,'500','#b83f58','center');text(it.b,650,cy+18,fit(it.b,210,24,'700',13),'700',navy,'center');});
    const myName=data.myName||'あなた',paName=data.paName||'相手';
    text(myName,617,layout.nameY,fit(myName,145,21,'700',12),'700','#fff','center');
    text(paName,857,layout.nameY,fit(paName,145,21,'700',12),'700','#fff','center');
    rows.slice(0,axisCount).forEach((r,i)=>{const cy=layout.bodyTop+i*layout.rowH;text(r.a,510,cy,fit(r.a,210,20,'500',13),'500',gray,'left');text(r.b,750,cy,fit(r.b,210,20,'500',13),'500',gray,'left');});
    const adv=[...document.querySelectorAll('#v21CompareCard .v82-advice-item')].slice(0,2).map(el=>({head:el.querySelector('b')?.textContent||'',ps:[...el.querySelectorAll('p')].map(p=>p.textContent||'')}));
    adv.forEach((a,i)=>{const x=i===0?125:575,iconX=i===0?85:535,bodyX=i===0?88:548,head=a.head.replace(/^[^ぁ-んァ-ン一-龥A-Za-z0-9]+/,'').trim();const isOneDifference=differenceCount<=1;drawAxisIcon(head,iconX,isOneDifference?1148:1168,48);text(head,x+55,isOneDifference?1170:1186,fit(head,280,22,'700',14),'700',navy,'left');let by=isOneDifference?1202:1228;const adviceSize=isOneDifference?18:19;const adviceLineH=isOneDifference?26:31;const adviceStep=isOneDifference?26:34;a.ps.slice(0,2).forEach(p=>{const w=wrap(p,385,adviceSize,'500',1,16);drawLines(w.lines,bodyX,by,w.size,'500',gray,adviceLineH);by+=adviceStep;});});
    return canvas;
  }

  async function downloadCompareCard(){
    const data=window.getActiveCompareData?.();if(!data?.my||!data?.partner){alert('2人分の比較データがまだありません。');return;}
    const overlay=document.getElementById('v73DownloadAdOverlay'),count=document.getElementById('v73DownloadAdCount');overlay?.classList.add('show');
    for(let n=5;n>=1;n--){if(count)count.textContent=String(n);await new Promise(r=>setTimeout(r,1000));}
    overlay?.classList.remove('show');
    try{const canvas=await buildCompareTemplateCanvas();let dataUrl;try{dataUrl=canvas.toDataURL('image/png');if(!dataUrl||dataUrl==='data:,')throw new Error('PNG dataURLが空です');}catch(blobErr){console.warn('toDataURL failed, falling back to JPEG',blobErr);dataUrl=canvas.toDataURL('image/jpeg',0.92);}const a=document.createElement('a');a.href=dataUrl;a.download='CoreLingual_2人のコミュニケーション比較.png';a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),1000);const toast=document.createElement('div');toast.className='v73-download-toast';toast.textContent='比較結果を保存しました';document.body.appendChild(toast);setTimeout(()=>toast.remove(),2200);}catch(e){console.error('comparison image export failed',e);alert('画像の作成に失敗しました。\n'+(e?.message||e));}
  }
  window.CoreLingualCompareExport={buildCompareTemplateCanvas,downloadCompareCard,pickTemplatePath};
  document.getElementById('v73DownloadCompare')?.addEventListener('click',downloadCompareCard);
})();
