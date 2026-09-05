/* CoreLingual v109 — comparison image export split.
   Logic moved mechanically from index.html; no feature/UI changes. */
(function(){
  function getActiveCompareData(){
    const myName=activeProfile('my'),paName=activeProfile('partner');
    const myOpts=compareSourceOptions('my'),paOpts=compareSourceOptions('partner');
    return {myName:myName||'あなた',paName:paName||'相手',my:myOpts.find(o=>o.id==='prof:my:'+myName)||myOpts.find(o=>o.id==='live:my'),partner:paOpts.find(o=>o.id==='prof:partner:'+paName)||paOpts.find(o=>o.id==='live:partner')};
  }

  async function buildCompareTemplateCanvas(){
    const data=getActiveCompareData();
    if(!data?.my || !data?.partner) throw new Error('比較データが取得できませんでした');

    await Promise.all([
      document.fonts.load('700 34px "Zen Kaku Gothic New"'),
      document.fonts.load('500 24px "Zen Kaku Gothic New"'),
      document.fonts.load('400 20px "Zen Kaku Gothic New"')
    ]);

    const src=new Image();
    src.src='/assets/comparison-template.png';
    await new Promise((resolve,reject)=>{src.onload=resolve;src.onerror=reject;});

    const W=1024,H=1536;
    const canvas=document.createElement('canvas');
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d');
    ctx.imageSmoothingEnabled=true;

    // The uploaded template is the finished artwork. Keep it completely intact.
    // This layer only adds data that changes per comparison.
    ctx.drawImage(src,0,0,W,H);

    const fontFamily='"Zen Kaku Gothic New","Noto Sans JP",sans-serif';
    const navy='#142d48',gray='#4d5660';
    const setFont=(size,weight='500')=>{ctx.font=`${weight} ${size}px ${fontFamily}`;};
    const text=(str,x,y,size,weight='500',color=gray,align='left')=>{
      setFont(size,weight);ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';
      ctx.fillText(String(str??''),x,y);
    };
    const fit=(str,maxW,size,weight='500',min=10)=>{
      let s=size;setFont(s,weight);
      while(s>min&&ctx.measureText(String(str??'')).width>maxW){s-=1;setFont(s,weight);}
      return s;
    };
    const wrap=(str,maxW,size,weight='500',maxLines=2,min=10)=>{
      let s=fit(str,maxW,size,weight,min);setFont(s,weight);
      const lines=[];let cur='';
      for(const ch of [...String(str??'')]){
        const t=cur+ch;
        if(ctx.measureText(t).width>maxW&&cur){
          lines.push(cur);cur=ch;
          if(lines.length===maxLines-1)break;
        }else cur=t;
      }
      if(cur)lines.push(cur);
      return {lines,size:s};
    };
    const drawLines=(lines,x,y,size,weight,color,lineH)=>lines.forEach((l,i)=>text(l,x,y+i*lineH,size,weight,color,'left'));

    const rows=[...document.querySelectorAll('#v21CompareCard .v82-axis-row')].map(el=>{
      const ds=el.querySelectorAll(':scope > div');
      return {name:(ds[0]?.textContent||'').trim(),a:(ds[1]?.textContent||'').trim(),b:(ds[2]?.textContent||'').trim()};
    });

    const axisIconSource={
      '情報の受け取り方':{x:75,y:601},
      '考え方':{x:75,y:649},
      '感情の扱い方':{x:75,y:697},
      '人との距離感':{x:75,y:745},
      '変化への対応':{x:75,y:793},
      '伝え方・受け止め方':{x:75,y:841},
      '近づき方・距離の取り方':{x:75,y:889},
      '刺激への反応':{x:75,y:937},
      '進め方・柔軟性':{x:75,y:985}
    };
    const drawAxisIcon=(name,dx,dy,size=48)=>{
      const s=axisIconSource[name];
      if(!s)return;
      // テンプレ内のアイコンをそのまま使いつつ、周囲の白だけ透明化する。
      // これでトップ3・アドバイスカードに白い四角が出ない。
      const off=document.createElement('canvas'); off.width=50; off.height=50;
      const oc=off.getContext('2d'); oc.drawImage(src,s.x,s.y,50,50,0,0,50,50);
      const im=oc.getImageData(0,0,50,50);
      for(let k=0;k<im.data.length;k+=4){
        const r=im.data[k],g=im.data[k+1],b=im.data[k+2];
        if(r>238&&g>238&&b>238) im.data[k+3]=0;
      }
      oc.putImageData(im,0,0);
      ctx.drawImage(off,dx,dy,size,size);
    };
    const clearTopX=(cy)=>{
      // 固定テンプレのXは位置が決まっているため、動的Xを中央へ置く前に
      // 元のXだけを周囲の背景色で覆う。テンプレ自体のファイルは変更しない。
      const sample=ctx.getImageData(790,cy,1,1).data;
      ctx.fillStyle=`rgb(${sample[0]},${sample[1]},${sample[2]})`;
      ctx.fillRect(674,cy-34,60,68);
    };

    // ---- Top 3 differences: fixed template artwork + dynamic text/icons only ----
    const topItems=[...document.querySelectorAll('#v21CompareCard .v82-top-item')].slice(0,3).map((el,i)=>({
      num:String(i+1).padStart(2,'0'),
      axis:(el.querySelector('.v82-top-axis')?.textContent||'').replace(/^[^ぁ-んァ-ン一-龥A-Za-z0-9]+/,'').trim(),
      a:el.querySelector('.v82-top-contrast b:nth-of-type(1)')?.textContent||'',
      b:el.querySelector('.v82-top-contrast b:nth-of-type(2)')?.textContent||''
    }));

    const topY=[286,370,454];
    topY.forEach(clearTopX);
    topItems.forEach((it,i)=>{
      const cy=topY[i];
      drawAxisIcon(it.axis,176,cy-27,48);
      const axis=wrap(it.axis,205,18,'700',2,11);
      drawLines(axis.lines,248,cy-15,axis.size,'700',navy,19);
      // 見本と同じく、左右の結果をそれぞれ固定位置に左寄せで配置。
      text(it.a,360,cy+18,fit(it.a,210,24,'700',13),'700',navy,'center');
      text('×',520,cy+18,30,'500','#b83f58','center');
      text(it.b,650,cy+18,fit(it.b,210,24,'700',13),'700',navy,'center');
    });

    // ---- Table: fixed labels, grid, icons and pills stay untouched ----
    const myName=data.myName||'あなた',paName=data.paName||'相手';
    text(myName,617,568,fit(myName,145,21,'700',12),'700','#fff','center');
    text(paName,857,568,fit(paName,145,21,'700',12),'700','#fff','center');

    const bodyTop=621,rowH=48;
    rows.slice(0,9).forEach((r,i)=>{
      const cy=bodyTop+i*rowH;
      // 見本に合わせて表の本文をほんの少しだけ大きく。長い文だけ自動で縮める。
      text(r.a,510,cy,fit(r.a,210,18,'500',12),'500',gray,'left');
      text(r.b,750,cy,fit(r.b,210,18,'500',12),'500',gray,'left');
    });

    // ---- Advice cards: the cards themselves are fixed; only their contents change ----
    const adv=[...document.querySelectorAll('#v21CompareCard .v82-advice-item')].slice(0,2).map(el=>({
      head:el.querySelector('b')?.textContent||'',
      ps:[...el.querySelectorAll('p')].map(p=>p.textContent||'')
    }));
    adv.forEach((a,i)=>{
      const x=i===0?125:575;
      const iconX=i===0?85:535;
      const bodyX=i===0?88:548;
      const head=a.head.replace(/^[^ぁ-んァ-ン一-龥A-Za-z0-9]+/,'').trim();
      drawAxisIcon(head,iconX,1168,48);
      text(head,x+55,1186,fit(head,280,22,'700',14),'700',navy,'left');

      // 見本のカード本文は「1文ずつ」大きく見せる。
      // 旧実装のように2文まとめてfitすると、全文を1行に収めようとして
      // フォントが必要以上に小さくなるため、段落ごとにサイズを決める。
      let by=1228;
      a.ps.slice(0,2).forEach(p=>{
        const w=wrap(p,385,19,'500',1,16);
        drawLines(w.lines,bodyX,by,w.size,'500',gray,31);
        by+=34;
      });
    });

    return canvas;
  }

async function downloadCompareCard(){
  const data=getActiveCompareData();if(!data.my||!data.partner){alert('2人分の比較データがまだありません。');return;}
  const overlay=document.getElementById('v73DownloadAdOverlay'),count=document.getElementById('v73DownloadAdCount');overlay?.classList.add('show');
  for(let n=5;n>=1;n--){if(count)count.textContent=String(n);await new Promise(r=>setTimeout(r,1000));}overlay?.classList.remove('show');
  try{
    const canvas=await buildCompareTemplateCanvas();
    // Android ChromeでtoBlobが無反応になるケースを避け、まずdataURLでPNG化する。
    let dataUrl;
    try{
      dataUrl=canvas.toDataURL('image/png');
      if(!dataUrl || dataUrl==='data:,') throw new Error('PNG dataURLが空です');
    }catch(blobErr){
      console.warn('toDataURL failed, falling back to JPEG',blobErr);
      dataUrl=canvas.toDataURL('image/jpeg',0.92);
    }
    const a=document.createElement('a');
    a.href=dataUrl;
    a.download='CoreLingual_2人のコミュニケーション比較.png';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>a.remove(),1000);
    const toast=document.createElement('div');toast.className='v73-download-toast';toast.textContent='比較結果を保存しました';document.body.appendChild(toast);setTimeout(()=>toast.remove(),2200);
  }catch(e){console.error('comparison image export failed',e);alert('画像の作成に失敗しました。\n'+(e?.message||e));}
}
  document.getElementById('v73DownloadCompare')?.addEventListener('click',downloadCompareCard);
})();
