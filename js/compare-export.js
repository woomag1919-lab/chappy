/* CoreLingual v135 — align exported comparison text to the approved 1024x1536 templates */
(function(){
  'use strict';

  const TEMPLATE_BY_AXES={
    6:['/assets/comparison-6-01.png','/assets/comparison-6-02.png','/assets/comparison-6-03.png'],
    9:['/assets/comparison-9-01.png','/assets/comparison-9-02.png','/assets/comparison-9-03.png']
  };
  const templateIndexFromDifferenceCount=count=>count<=1?0:count===2?1:2;
  const pickTemplatePath=(axisCount,differenceCount)=>{
    const group=TEMPLATE_BY_AXES[axisCount]||TEMPLATE_BY_AXES[9];
    return group[templateIndexFromDifferenceCount(differenceCount)];
  };
  const textFrom=(el,selector)=>(el?.querySelector(selector)?.textContent||'').trim();

  async function loadTemplate(path){
    const src=new Image();
    src.src=path;
    await new Promise((resolve,reject)=>{src.onload=resolve;src.onerror=()=>reject(new Error('比較テンプレートを読み込めませんでした: '+path));});
    return src;
  }

  async function buildCompareTemplateCanvas(){
    const data=window.getActiveCompareData?.();
    if(!data?.my||!data?.partner)throw new Error('比較データが取得できませんでした');

    await Promise.all([
      document.fonts.load('700 34px "Zen Kaku Gothic New"'),
      document.fonts.load('500 24px "Zen Kaku Gothic New"'),
      document.fonts.load('400 20px "Zen Kaku Gothic New"')
    ]);

    const rows=[...document.querySelectorAll('#v21CompareCard .v82-axis-row')].map(el=>{
      const ds=el.querySelectorAll(':scope > div');
      return{
        name:(ds[0]?.textContent||'').trim(),
        a:(ds[1]?.textContent||'').trim(),
        b:(ds[2]?.textContent||'').trim()
      };
    });

    const topItems=[...document.querySelectorAll('#v21CompareCard .v82-top-item')].slice(0,3).map((el,i)=>({
      num:String(i+1).padStart(2,'0'),
      axis:textFrom(el,'.v82-top-axis').replace(/^[^ぁ-んァ-ン一-龥A-Za-z0-9]+/,'').trim(),
      a:el.querySelector('.v82-top-contrast b:nth-of-type(1)')?.textContent||'',
      b:el.querySelector('.v82-top-contrast b:nth-of-type(2)')?.textContent||''
    }));

    const axisCount=rows.length>=9?9:6;
    const differenceCount=Math.min(3,topItems.length);
    const templatePath=pickTemplatePath(axisCount,differenceCount);
    const src=await loadTemplate(templatePath);

    const W=1024,H=1536;
    const canvas=document.createElement('canvas');
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d');
    ctx.imageSmoothingEnabled=true;
    ctx.drawImage(src,0,0,W,H);

    const fontFamily='"Zen Kaku Gothic New","Noto Sans JP",sans-serif';
    const navy='#142d48',gray='#4d5660';
    const setFont=(size,weight='500')=>{ctx.font=`${weight} ${size}px ${fontFamily}`;};
    const text=(str,x,y,size,weight='500',color=gray,align='left')=>{
      setFont(size,weight);
      ctx.fillStyle=color;
      ctx.textAlign=align;
      ctx.textBaseline='middle';
      ctx.fillText(String(str??''),x,y);
    };
    const fit=(str,maxW,size,weight='500',min=10)=>{
      let s=size;
      setFont(s,weight);
      while(s>min&&ctx.measureText(String(str??'')).width>maxW){s-=1;setFont(s,weight);}
      return s;
    };
    function wrap(str,maxW,size,weight='500',maxLines=2,min=10){
      const source=String(str??'');
      let s=fit(source,maxW,size,weight,min);
      setFont(s,weight);
      const lines=[];
      let cur='';
      for(const ch of [...source]){
        const next=cur+ch;
        if(ctx.measureText(next).width<=maxW){
          cur=next;
          continue;
        }
        if(cur)lines.push(cur);
        cur=ch;
        if(lines.length>=maxLines-1)break;
      }
      if(cur)lines.push(cur);
      if(lines.length>maxLines)lines.length=maxLines;
      if(lines.length===maxLines){
        let last=lines[maxLines-1]||'';
        while(last.length>1&&ctx.measureText(last+'…').width>maxW)last=last.slice(0,-1);
        if(source.length>lines.join('').length)lines[maxLines-1]=last+'…';
      }
      return{lines,size:s};
    }
    const drawCenteredLines=(lines,x,centerY,size,weight,color,lineH,align='left')=>{
      const total=(lines.length-1)*lineH;
      const firstY=centerY-total/2;
      lines.forEach((line,i)=>text(line,x,firstY+i*lineH,size,weight,color,align));
    };

    /*
      The three approved 6-axis templates have fixed vertical centers.
      Do not move the whole page based on content. The variable text is
      centered inside those fixed rows so the baked-in left labels and the
      generated A/B text always share the same row center.
    */
    const layout6={
      1:{topY:[326],bodyCenters:[530,604,678,752,826,900],nameY:462,advice:{iconY:1148,titleY:1170,bodyY:1202,lineH:25}},
      2:{topY:[333,424],bodyCenters:[612,681,750,819,888,957],nameY:548,advice:{iconY:1168,titleY:1186,bodyY:1222,lineH:25}},
      3:{topY:[288,366,444],bodyCenters:[612,681,750,819,888,957],nameY:548,advice:{iconY:1168,titleY:1186,bodyY:1222,lineH:25}}
    };
    const layout9={
      1:{topY:[286],bodyCenters:[472,535,598,661,724,787,850,913,976],nameY:411,advice:{iconY:1148,titleY:1170,bodyY:1202,lineH:25}},
      2:{topY:[300,380],bodyCenters:[551,611,671,731,791,851,911,971,1031],nameY:488,advice:{iconY:1168,titleY:1186,bodyY:1222,lineH:27}},
      3:{topY:[271,334,396],bodyCenters:[551,611,671,731,791,851,911,971,1031],nameY:488,advice:{iconY:1168,titleY:1186,bodyY:1222,lineH:27}}
    };
    const layout=(axisCount===9?layout9:layout6)[differenceCount]||(axisCount===9?layout9:layout6)[1];

    const iconSource={};
    const iconNames=['情報の受け取り方','考え方','感情の扱い方','人との距離感','変化への対応','伝え方・受け止め方','近づき方・距離の取り方','刺激への反応','進め方・柔軟性'];
    const iconTop=axisCount===9
      ? (differenceCount===1?[448,508,568,628,688,748,808,868,928]:[527,587,647,707,767,827,887,947,1007])
      : (differenceCount===1?[505,579,653,727,801,875]:[586,655,724,793,862,931]);
    iconNames.forEach((name,i)=>iconSource[name]={x:75,y:iconTop[i]});

    const drawAxisIcon=(name,dx,dy,size=48)=>{
      const s=iconSource[name];
      if(!s)return;
      const off=document.createElement('canvas');off.width=50;off.height=50;
      const oc=off.getContext('2d');
      oc.drawImage(src,s.x,s.y,50,50,0,0,50,50);
      const im=oc.getImageData(0,0,50,50);
      for(let k=0;k<im.data.length;k+=4){
        const r=im.data[k],g=im.data[k+1],b=im.data[k+2];
        if(r>238&&g>238&&b>238)im.data[k+3]=0;
      }
      oc.putImageData(im,0,0);
      ctx.drawImage(off,dx,dy,size,size);
    };

    if(!topItems.length){
      text('大きな差は少なめ。似た入口から会話を進めやすい2人です.',512,326,22,'700',gray,'center');
    }else{
      topItems.forEach((it,i)=>{
        const cy=layout.topY[i]??layout.topY[layout.topY.length-1];
        drawAxisIcon(it.axis,176,cy-27,48);
        const axis=wrap(it.axis,205,18,'700',2,11);
        drawCenteredLines(axis.lines,248,cy-10,axis.size,'700',navy,19,'left');
        text(it.a,360,cy+18,fit(it.a,210,24,'700',13),'700',navy,'center');
        text('×',520,cy+18,30,'500','#b83f58','center');
        text(it.b,650,cy+18,fit(it.b,210,24,'700',13),'700',navy,'center');
      });
    }

    const myName=data.myName||'あなた',paName=data.paName||'相手';
    text(myName,617,layout.nameY,fit(myName,145,21,'700',12),'700','#fff','center');
    text(paName,857,layout.nameY,fit(paName,145,21,'700',12),'700','#fff','center');

    /* Table: use the template's baked icon centers as the single source of truth. */
    rows.slice(0,axisCount).forEach((r,i)=>{
      const cy=layout.bodyCenters[i];
      if(cy==null)return;
      const a=wrap(r.a,210,20,'500',2,13);
      const b=wrap(r.b,210,20,'500',2,13);
      drawCenteredLines(a.lines,510,cy,a.size,'500',gray,24,'left');
      drawCenteredLines(b.lines,750,cy,b.size,'500',gray,24,'left');
    });

    const adv=[...document.querySelectorAll('#v21CompareCard .v82-advice-item')].slice(0,2).map(el=>({
      head:el.querySelector('b')?.textContent||'',
      ps:[...el.querySelectorAll('p')].map(p=>p.textContent||'')
    }));
    adv.forEach((a,i)=>{
      const x=i===0?125:575;
      const iconX=i===0?85:535;
      const bodyX=i===0?88:548;
      const head=a.head.replace(/^[^ぁ-んァ-ン一-龥A-Za-z0-9]+/,'').trim();
      const iconY=layout.advice.iconY;
      drawAxisIcon(head,iconX,iconY,48);
      text(head,x+55,layout.advice.titleY,fit(head,280,22,'700',14),'700',navy,'left');

      /* Keep the entire advice text block inside the card. */
      const parts=[];
      a.ps.slice(0,2).forEach(p=>{
        const w=wrap(p,385,17,'500',2,14);
        parts.push(...w.lines);
      });
      const lines=parts.slice(0,3);
      drawCenteredLines(lines,bodyX,layout.advice.bodyY,17,'500',gray,layout.advice.lineH,'left');
    });

    return canvas;
  }

  async function downloadCompareCard(){
    const data=window.getActiveCompareData?.();
    if(!data?.my||!data?.partner){alert('2人分の比較データがまだありません。');return;}
    const overlay=document.getElementById('v73DownloadAdOverlay'),count=document.getElementById('v73DownloadAdCount');
    overlay?.classList.add('show');
    for(let n=5;n>=1;n--){if(count)count.textContent=String(n);await new Promise(r=>setTimeout(r,1000));}
    overlay?.classList.remove('show');
    try{
      const canvas=await buildCompareTemplateCanvas();
      let dataUrl;
      try{
        dataUrl=canvas.toDataURL('image/png');
        if(!dataUrl||dataUrl==='data:,')throw new Error('PNG dataURLが空です');
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
      const toast=document.createElement('div');
      toast.className='v73-download-toast';
      toast.textContent='比較結果を保存しました';
      document.body.appendChild(toast);
      setTimeout(()=>toast.remove(),2200);
    }catch(e){
      console.error('comparison image export failed',e);
      alert('画像の作成に失敗しました。\n'+(e?.message||e));
    }
  }

  window.CoreLingualCompareExport={buildCompareTemplateCanvas,downloadCompareCard,pickTemplatePath};
  document.getElementById('v73DownloadCompare')?.addEventListener('click',downloadCompareCard);
})();
