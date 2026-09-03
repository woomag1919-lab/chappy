
/* CoreLingual_v36 — result-linked radar chart */
(function(){
  const AX=[
    {id:"context",label:"受け取り",desc:"情報の受け取り方"},
    {id:"thinking",label:"考え方",desc:"整理・根拠 ↔ 直感・可能性"},
    {id:"emotion",label:"感情",desc:"言葉にする ↔ 時間を置く"},
    {id:"distance",label:"距離感",desc:"共有・相談 ↔ 自分の時間"},
    {id:"change",label:"変化",desc:"見通し・慣れ ↔ 新しい方法"},
    {id:"communication",label:"伝え方",desc:"共感・気持ち ↔ 具体策・結論"}
  ];
  const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
  const normalize=score=>clamp((Number(score)-1)/4*100);
  function points(cx,cy,r,n){return Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r]})}
  function path(ctx,pts){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath()}
  function draw(canvas,values,compare){
    if(!canvas)return;
    const rect=canvas.getBoundingClientRect(),w=Math.max(280,rect.width||330),h=Math.max(280,rect.height||330),dpr=window.devicePixelRatio||1;
    canvas.width=w*dpr;canvas.height=h*dpr;
    const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const cx=w/2,cy=h/2+3,r=Math.min(w,h)*.30,n=6,outer=points(cx,cy,r,n);
    ctx.lineWidth=1;ctx.globalAlpha=.22;
    [25,50,75,100].forEach(s=>{path(ctx,points(cx,cy,r*s/100,n));ctx.stroke()});
    outer.forEach(p=>{ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(p[0],p[1]);ctx.stroke()});
    ctx.globalAlpha=1;
    const dataPts=vals=>vals.map((v,i)=>{const a=-Math.PI/2+i*2*Math.PI/n,rr=r*clamp(v)/100;return[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]});
    const base=dataPts(values);
    if(compare){
      ctx.setLineDash([5,4]);ctx.lineWidth=2;path(ctx,base);ctx.stroke();ctx.setLineDash([]);
      const after=dataPts(compare);ctx.globalAlpha=.13;path(ctx,after);ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=2.5;path(ctx,after);ctx.stroke();
      after.forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],3,0,Math.PI*2);ctx.fill()});
    }else{
      ctx.globalAlpha=.13;path(ctx,base);ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=2.5;path(ctx,base);ctx.stroke();
      base.forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],3,0,Math.PI*2);ctx.fill()});
    }
    ctx.font="12px system-ui,sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
    outer.forEach((p,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;ctx.fillText(AX[i].label,cx+Math.cos(a)*(r+29),cy+Math.sin(a)*(r+29))});
  }
  window.CoreLingual_v36={axes:AX,normalize,render:(canvas,before,after)=>draw(canvas,before||AX.map(()=>50),after||null)};
})();
