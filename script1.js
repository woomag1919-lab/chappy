
/* v46: canonical 6-axis radar. Accepts either score arrays or keyed maps. */
window.CoreLingual_v36 = {
  axes: [
    {id:"language",label:"情報の受け取り方",left:"具体的・明確",right:"文脈・全体像"},
    {id:"thinking",label:"考え方",left:"分析・整理",right:"直感・発想"},
    {id:"emotion",label:"感情の扱い方",left:"言葉にして整理",right:"時間を置いて整理"},
    {id:"distance",label:"人との距離感",left:"共有・相談",right:"自分の時間"},
    {id:"change",label:"変化への対応",left:"見通し・慣れ",right:"新しい方法"},
    {id:"communication",label:"伝え方・受け止め方",left:"共感・気持ち",right:"具体策・結論"}
  ],
  normalize(v){ const n=Number(v); return Math.max(0,Math.min(100,Number.isFinite(n)?n:50)); },
  toValues(vals){
    if(Array.isArray(vals)){
      const by=Object.fromEntries(vals.map(x=>[x.key,Number(x.score)]));
      return this.axes.map(a=>this.normalize(by[a.id]??50));
    }
    return this.axes.map(a=>this.normalize(vals?.[a.id]??50));
  },
  render(canvas,vals){
    if(!canvas)return;
    const values=this.toValues(vals), ctx=canvas.getContext("2d"), dpr=window.devicePixelRatio||1;
    const rect=canvas.getBoundingClientRect(),w=Math.max(280,rect.width||320),h=Math.max(280,rect.height||300);
    canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const cx=w/2,cy=h/2+4,r=Math.min(w,h)*.30,n=6;
    const pts=(scale=1)=>this.axes.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*r*scale,cy+Math.sin(a)*r*scale]});
    const poly=p=>{ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath()};
    ctx.globalAlpha=.18;ctx.lineWidth=1;[.25,.5,.75,1].forEach(k=>{poly(pts(k));ctx.stroke()});
    pts(1).forEach(q=>{ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(q[0],q[1]);ctx.stroke()});
    const data=values.map((v,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;const rr=r*(.25+.75*v/100);return[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]});
    ctx.globalAlpha=.14;poly(data);ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=2.5;poly(data);ctx.stroke();
    data.forEach(q=>{ctx.beginPath();ctx.arc(q[0],q[1],3,0,Math.PI*2);ctx.fill()});
    ctx.font="12px system-ui,sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
    pts(1).forEach((q,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;ctx.fillText(this.axes[i].label,cx+Math.cos(a)*(r+30),cy+Math.sin(a)*(r+30))});
  }
};
