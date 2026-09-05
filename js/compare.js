function buildPairComparisonCard(myScores,partnerScores,partnerDeep,myDeepScores,myName='あなた',partnerName='相手'){
  if(!myScores?.length||!partnerScores?.length)return null;
  const sec=document.createElement('section');sec.className='v82-pair-card';
  const by=(arr)=>Object.fromEntries((arr||[]).map(x=>[x.key,Number(x.score)]));
  const bm=by(myScores),bp=by(partnerScores),bd=by(partnerDeep||[]);
  let myDeep=by(myDeepScores||[]);
  if(!Object.keys(myDeep).length){try{myDeep=by(JSON.parse(localStorage.getItem('cl_extra_result_my')||'null')?.scores||[])}catch{}}

  const allRows=[];
  Object.keys(AXES).forEach(key=>allRows.push({type:'base',key,diff:Math.abs((bm[key]??50)-(bp[key]??50))}));
  if(Object.keys(myDeep).length && Object.keys(bd).length){
    Object.keys(DEEP_AXES).forEach(key=>allRows.push({type:'deep',key,diff:Math.abs((myDeep[key]??50)-(bd[key]??50))}));
  }

  const sideFor=(score)=>score<=35?'left':score>=65?'right':'middle';
  const short={
    language:{left:'言葉ではっきり',right:'流れから受け取る',middle:'言葉と流れを使い分け'},
    thinking:{left:'筋道を整理',right:'ひらめきを広げる',middle:'整理と発想を行き来'},
    emotion:{left:'話して整理',right:'時間を置いて整理',middle:'話す・考えるを使い分け'},
    distance:{left:'一緒に整理',right:'ひとりで整理',middle:'状況に合わせて距離調整'},
    change:{left:'見通してから',right:'動きながら',middle:'見通しと柔軟さを両立'},
    communication:{left:'まず気持ち',right:'まず具体策',middle:'気持ちと具体策を両方見る'},
    attach:{left:'つながりを確認',right:'自分で整理してから',middle:'近さと距離を調整'},
    sensory:{left:'刺激を減らして整理',right:'その場で切り替える',middle:'刺激量で切り替える'},
    process:{left:'順番を整えてから',right:'まず動いて調整',middle:'計画と柔軟さを使い分け'}
  };
  const getLabel=(row,score)=>{
    const dict=short[row.key]||{};return dict[sideFor(score)]||'場面に応じて使い分け';
  };
  const getAxis=(row)=>row.type==='base'?AXES[row.key]:DEEP_AXES[row.key];
  const getScores=(row)=>row.type==='base'?[bm[row.key]??50,bp[row.key]??50]:[myDeep[row.key]??50,bd[row.key]??50];

  const ranked=allRows.slice().sort((a,b)=>b.diff-a.diff);
  const top=ranked.slice(0,3);
  const topRows=top.filter(r=>r.diff>=8);

  sec.innerHTML=`
    <div class="v82-compare-head">
      <div class="v82-kicker">👥 2人のコミュニケーション比較</div>
      <p class="v82-lead">同じ会話でも、自然に選びやすい「入口」が違うと、すれ違いが起きることがあります。</p>
    </div>
    <div class="v82-section-title">特に違いが出やすい3つ</div>
    <div class="v82-top3"></div>
    <div class="v82-section-title v82-list-title">9つのコミュニケーション傾向</div>
    <div class="v82-axis-head"><span></span><b>${escapeHtml(myName||'自分')}</b><b>${escapeHtml(partnerName||'相手')}</b></div>
    <div class="v82-axis-list"></div>
    <div class="v82-advice">
      <div class="v82-section-title">💡 この2人がラクになるポイント</div>
      <div class="v82-advice-grid"></div>
    </div>
    <div class="v82-footer-note">違いは、良し悪しではなく会話の入口の違い。相手の入口が分かると、伝え方も少し変えられます。</div>`;

  const topEl=sec.querySelector('.v82-top3');
  if(topRows.length){
    topRows.forEach((row,i)=>{
      const axis=getAxis(row),[ms,ps]=getScores(row),ml=getLabel(row,ms),pl=getLabel(row,ps);
      const el=document.createElement('div');el.className='v82-top-item';
      el.innerHTML=`<div class="v82-top-num">0${i+1}</div><div class="v82-top-main"><div class="v82-top-axis">${axis.icon||''} ${escapeHtml(axis.label)}</div><div class="v82-top-contrast"><b>${escapeHtml(ml)}</b><span>×</span><b>${escapeHtml(pl)}</b></div></div>`;
      topEl.appendChild(el);
    });
  }else{
    topEl.innerHTML='<div class="v82-similar">大きな差は少なめ。似た入口から会話を進めやすい2人です。</div>';
  }

  const list=sec.querySelector('.v82-axis-list');
  allRows.forEach(row=>{
    const axis=getAxis(row),[ms,ps]=getScores(row),ml=getLabel(row,ms),pl=getLabel(row,ps);
    const el=document.createElement('div');el.className='v82-axis-row';
    el.innerHTML=`<div class="v82-axis-name">${axis.icon||''} ${escapeHtml(axis.label)}</div><div>${escapeHtml(ml)}</div><div>${escapeHtml(pl)}</div>`;
    list.appendChild(el);
  });

  const adviceEl=sec.querySelector('.v82-advice-grid');
  const adviceMap={
    language:{left:'大事なことは、言葉を短くして確認する',right:'大事なことは、最後に一言だけ確認する'},
    thinking:{left:'案を出す前に、まずゴールを共有する',right:'広げた案は、最後に一つへ絞る'},
    emotion:{left:'「今は聞いてほしい」と先に伝える',right:'時間が必要なら「あとで話したい」と伝える'},
    distance:{left:'今話したい理由を一言添える',right:'離れたい時は「落ち着いたら話す」と伝える'},
    change:{left:'変更があるなら、先に知らせて余白を残す',right:'変える前に「ここまではこのまま」と伝える'},
    communication:{left:'「まず聞いてほしい」と先に伝える',right:'解決策の前に「まず聞くよ」を一言添える'},
    attach:{left:'確認したい時は、何を知りたいかを一つに絞る',right:'距離を置く時は、戻るタイミングを伝える'},
    sensory:{left:'情報が重なったら、いったん量を減らす',right:'相手の余裕を見て、話す量を調整する'},
    process:{left:'先に「次に何をするか」を一つ決める',right:'まず小さく始めて、途中で調整する'}
  };
  const adviceRows=ranked.slice(0,2);
  if(adviceRows.length){
    adviceRows.forEach(row=>{
      const axis=getAxis(row),[ms,ps]=getScores(row),dict=adviceMap[row.key]||{},ml=sideFor(ms),pl=sideFor(ps);
      const leftTip=dict[ml]||dict.left||'相手に伝わりやすい形を一つ選ぶ';
      const rightTip=dict[pl]||dict.right||'相手のペースも一度確認する';
      const el=document.createElement('div');el.className='v82-advice-item';
      el.innerHTML=`<b>${axis.icon||'💬'} ${escapeHtml(axis.label)}</b><p>${escapeHtml(leftTip)}。</p><p>${escapeHtml(rightTip)}。</p>`;
      adviceEl.appendChild(el);
    });
  }
  return sec;
}
function pairSide(score){if(score<=35)return'left';if(score>=65)return'right';return'mid'}
function pairAxisTip(key,myScore,theirScore,type){
  const a=pairSide(myScore),b=pairSide(theirScore);
  const tips={
    language:{
      'left-right':'あなたは言葉の意味や条件をはっきりさせたくなりやすく、相手は前後の流れから察しやすいことがあります。確認の回数や「言わなくても分かるはず」の期待がズレやすいポイントです。',
      'right-left':'あなたは文脈や全体像から受け取りやすく、相手は具体的な言葉や条件を求めやすいことがあります。説明が短いと相手が不安になり、長いとあなたがくどく感じることがあります。',
      'default':'情報の受け取り方が違うと、「伝わったつもり」と「まだ分からない」が同時に起きやすくなります。大事なことは一度、具体と意図の両方で確認すると安心です。'
    },
    thinking:{
      'left-right':'あなたは根拠を揃えてから進みたく、相手は感覚や可能性から動きたくなることがあります。結論の速さや「ちゃんと考えた？」の温度差が出やすいです。',
      'right-left':'あなたは直感や複数の可能性から考えやすく、相手は理由を整理してから決めたいことがあります。話が飛ぶ／固い、の印象差になりやすいです。',
      'default':'考え方の順番が違うと、同じ議題でも「まだ早い」「もう遅い」と感じることがあります。先にゴールか、先に材料か、を短く共有すると噛み合いやすいです。'
    },
    emotion:{
      'left-right':'あなたは気持ちを言葉にして整理したく、相手は一度内省してから話したいことがあります。すぐ話したいか、間が欲しいかですれ違いやすいです。',
      'right-left':'あなたは時間を置いてから感情を整理したく、相手は早めに言葉にしたいことがあります。「冷たい」「詰まる」と誤解されやすい組み合わせです。',
      'default':'感情の扱い方が違うと、沈黙やペースの差が拒絶に見えやすくなります。今は話したいか、少し置きたいかを一言あるだけで楽になります。'
    },
    distance:{
      'left-right':'あなたはその場で共有・相談したく、相手は自分の時間を確保したくなりやすいことがあります。連絡の頻度や「今話す？」のタイミングがズレやすいです。',
      'right-left':'あなたは一人の時間を大切にしやすく、相手は早めに共有して安心したくなりやすいことがあります。距離の取り方が、慎重と孤独の取り違えになりやすいです。',
      'default':'距離感の好みが違うと、近づき方も引き方も「温度差」に感じられます。今どのくらい繋がりたいかを、回数や時間で具体化すると衝突が減ります。'
    },
    change:{
      'left-right':'あなたは見通しや慣れを重視しやすく、相手は新しいやり方を試したくなりやすいことがあります。予定変更のストレスの感じ方が大きく違います。',
      'right-left':'あなたは変化や新しい方法に乗りやすく、相手は流れが決まっていると安心しやすいことがあります。「柔軟」と「不安」が同時に出やすい組み合わせです。',
      'default':'変化への耐性が違うと、同じ変更でも一方はチャンス、他方は負荷に感じます。変更点を一つに絞って伝えると、お互いに動きやすくなります。'
    },
    communication:{
      'left-right':'あなたは共感や気持ちを先に受け取りたく、相手は具体策や結論を求めたくなりやすいことがあります。「分かってほしい」と「どうすればいい」がすれ違いやすいです。',
      'right-left':'あなたは次の一手や具体策を考えやすく、相手はまず気持ちを受け止めてほしがりやすいことがあります。解決が早く感じる／冷たく感じる、の差が出やすいです。',
      'default':'伝え方の優先が違うと、善意のアドバイスがズレた反応になります。先に「聞いてほしい／案がほしい」を確認すると噛み合いやすいです。'
    },
    attach:{
      'left-right':'あなたは気になるとつながりを確かめやすく、相手は一度距離を置いて整理したくなりやすいことがあります。追いかけと後退が同時に起きやすい典型です。',
      'right-left':'あなたは自分の中で整理してから距離を調整しやすく、相手は早めに反応や安心を求めやすいことがあります。静かにするほど相手の不安が増えることがあります。',
      'default':'近づき方と引き方が違うと、会話の開始タイミングそのものが衝突しやすいです。「今すぐ／あとで」を先に決めるだけでも楽になります。'
    },
    sensory:{
      'left-right':'あなたは刺激や情報量が多いと一度減らしたくなりやすく、相手はその場で切り替えながら対応しやすいことがあります。休憩の必要性の感じ方が違います。',
      'right-left':'あなたは刺激があっても切り替えやすく、相手は情報量が重なると整理したくなりやすいことがあります。予定の密度で疲れ方に差が出やすいです。',
      'default':'刺激への反応が違うと、同じ場所・同じ予定でも回復の必要量が変わります。今日の余裕を一言共有すると、無理の押し付けが減ります。'
    },
    process:{
      'left-right':'あなたは順番や見通しを整えてから進みたく、相手はまず動いて途中で調整したくなりやすいことがあります。「準備不足」と「固すぎ」の印象差が出やすいです。',
      'right-left':'あなたは動きながら決めやすく、相手は手順が見えてから安心しやすいことがあります。計画の粒度でストレスの方向が逆になります。',
      'default':'進め方の好みが違うと、同じゴールでもプロセスの不満が残りやすいです。固定する部分と自由にしてよい部分を分けると衝突が減ります。'
    }
  };
  const bag=tips[key]||{};
  const pair=a+'-'+b;
  if(bag[pair])return bag[pair];
  if(a===b&&a!=='mid')return bag['default']||'似た方向でも、強さやタイミングが違うとすれ違うことがあります。具体的な場面で「今どうしたい？」を短く合わせるとよいです。';
  return bag['default']||'この違いは、性格の優劣ではなく、場面ごとの得意な進め方の差として見ると扱いやすくなります。';
}
function buildPairNarrative(myScores,partnerScores){
  const byMy=Object.fromEntries((myScores||[]).map(x=>[x.key,Number(x.score)]));
  const byP=Object.fromEntries((partnerScores||[]).map(x=>[x.key,Number(x.score)]));
  const rows=Object.keys(AXES).map(key=>({key,diff:Math.abs((byMy[key]??50)-(byP[key]??50))})).sort((a,b)=>b.diff-a.diff);
  const top=rows.filter(x=>x.diff>=15).slice(0,2);
  const sec=document.createElement('section');sec.className='v36-pair-card';
  sec.innerHTML='<div class="v36-pair-head">👥 2人で見ると、こうなりやすい</div><div class="v36-pair-body"></div>';
  const body=sec.querySelector('.v36-pair-body');
  const mine=buildTraitSummary(myScores,'あなた');const partner=buildTraitSummary(partnerScores,'相手');
  if(mine){const wrap=document.createElement('div');wrap.className='v36-pair-person';wrap.innerHTML='<h4>👤 あなた</h4>';const traits=mine.querySelectorAll('.v36-trait');traits.forEach(t=>wrap.appendChild(t.cloneNode(true)));body.appendChild(wrap)}
  if(partner){const wrap=document.createElement('div');wrap.className='v36-pair-person';wrap.innerHTML='<h4>👥 相手</h4>';const traits=partner.querySelectorAll('.v36-trait');traits.forEach(t=>wrap.appendChild(t.cloneNode(true)));body.appendChild(wrap)}
  const mm=document.createElement('div');mm.className='v33-mismatch';
  if(top.length){const lines=top.map(x=>{const a=AXES[x.key],m=AXIS_MEANINGS[x.key],ms=byMy[x.key],ps=byP[x.key];const mine=ms<=35?m.left:ms>=65?m.right:'場面に応じて使い分けやすい';const theirs=ps<=35?m.left:ps>=65?m.right:'場面に応じて使い分けやすい';return `<b>${a.label}</b>では、あなたは「${escapeHtml(mine)}」になりやすく、相手は「${escapeHtml(theirs)}」になりやすい組み合わせです。`}).join('<br><br>');mm.innerHTML=lines+`<br><br><b>ポイント：</b>同じ言葉でも、求めているものや受け取り方が違うと、善意のやり取りがすれ違いに見えることがあります。`;}else{mm.textContent='6つの方向では大きな差は出ていません。実際の会話では、同じ傾向でも言い方や状況によってすれ違いが起こることがあります。'}
  body.appendChild(mm);return sec;
}
function v29HostInviteActive(){const inv=v23GetInviteState();return !!(inv?.token&&inv?.ownerToken)}
function v29InvitePartnerRadar(){try{return JSON.parse(localStorage.getItem('cl_v29_invite_partner_radar')||'null')}catch{return null}}
function clearV29InviteView(){
  ['cl_v29_invite_partner_radar','cl_v29_invite_partner_extra','cl_v29_invite_partner_profile'].forEach(k=>{try{localStorage.removeItem(k)}catch{}});
  ['cl_shared_partner_profile'].forEach(k=>{try{localStorage.removeItem(k)}catch{}});
}
function compareSourceOptions(side){
  const out=[];
  try{
    const live=JSON.parse(localStorage.getItem('cl_diag_result_'+side)||'null');
    if(Array.isArray(live?.scores)&&live.scores.length){
      const deep=(()=>{try{return JSON.parse(localStorage.getItem('cl_extra_result_'+side)||'null')?.scores||[]}catch{return[]}})();
      out.push({id:'live:'+side,label:side==='my'?'いまの自分チェック':'いまの相手チェック',scores:live.scores,deep});
    }
  }catch{}
  list(side).forEach(p=>{
    if(Array.isArray(p.scores)&&p.scores.length){
      out.push({id:'prof:'+side+':'+p.name,label:p.name,scores:p.scores,deep:Array.isArray(p.deepScores)?p.deepScores:[]});
    }
  });
  // de-dupe by label preferring live first
  const seen=new Set();
  return out.filter(x=>{if(seen.has(x.label))return false;seen.add(x.label);return true});
}
function getCompareSelection(side,options){
  const key='cl_compare_sel_'+side;
  let id=null;try{id=localStorage.getItem(key)}catch{}
  if(id&&options.some(o=>o.id===id))return id;
  return options[0]?.id||'';
}
function setCompareSelection(side,id){try{localStorage.setItem('cl_compare_sel_'+side,id)}catch{}}
function deleteCompareProfile(side, profileName){
  const key=side==='my'?'my':'partner';
  const arr=list(key);
  const idx=arr.findIndex(x=>x.name===profileName);
  if(idx<0)return;
  if(!confirm('「'+profileName+'」を削除しますか？'))return;
  arr.splice(idx,1);
  localStorage.setItem('cl_'+key,JSON.stringify(arr));
  if(activeProfile(key)===profileName)localStorage.removeItem('cl_'+key+'_active');
  if(getCompareSelection(side,compareSourceOptions(side))==='prof:'+side+':'+profileName){
    try{localStorage.removeItem('cl_compare_sel_'+side)}catch{}
  }
  draw(key);
  renderTwoPersonComparison();
}
function renderCompareOptionButtons(container, options, selectedId, side){
  if(!container)return;
  container.innerHTML='';
  options.forEach(o=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='v60-compare-option'+(o.id===selectedId?' active':'');
    b.textContent=o.label;
    const saved=o.id.indexOf('prof:')===0;
    if(saved){
      const h=document.createElement('span');h.className='hint';h.textContent='タップで比較　・　長押しで削除';b.appendChild(h);
    }else{
      const h=document.createElement('span');h.className='hint';h.textContent='現在のチェック結果';b.appendChild(h);
    }
    let timer=null,longPressed=false;
    const cancel=()=>{if(timer){clearTimeout(timer);timer=null}};
    b.addEventListener('pointerdown',()=>{
      longPressed=false;
      timer=setTimeout(()=>{
        timer=null;
        if(!saved)return;
        longPressed=true;
        deleteCompareProfile(side,o.label);
      },650);
    });
    b.addEventListener('pointerup',cancel);
    b.addEventListener('pointercancel',cancel);
    b.addEventListener('pointerleave',cancel);
    b.addEventListener('click',()=>{
      if(longPressed)return;
      setCompareSelection(side,o.id);
      renderTwoPersonComparison();
    });
    container.appendChild(b);
  });
}
function renderTwoPersonComparison(){
  const card=document.getElementById('v21CompareCard'),grid=document.getElementById('v21CompareGrid'),listEl=document.getElementById('v21CompareList');
  if(!card||!grid||!listEl)return;
  const myName=activeProfile('my'),paName=activeProfile('partner');
  const myOpts=compareSourceOptions('my'),paOpts=compareSourceOptions('partner');
  const myPick=myOpts.find(o=>o.id==='prof:my:'+myName)||myOpts.find(o=>o.id==='live:my');
  const paPick=paOpts.find(o=>o.id==='prof:partner:'+paName)||paOpts.find(o=>o.id==='live:partner');
  const dl=document.getElementById('v73DownloadCompare');
  if(!myPick||!paPick){card.style.display='none';grid.innerHTML='';listEl.innerHTML='';if(dl)dl.style.display='none';return;}
  if(dl)dl.style.display='block';
  card.hidden=false;card.style.removeProperty('display');card.style.display='block';card.classList.add('v46-compare-only');
  grid.innerHTML='';listEl.innerHTML='';
  const pair=buildPairComparisonCard(myPick.scores,paPick.scores,paPick.deep,myPick.deep,myName||'あなた',paName||'相手');
  if(pair)listEl.appendChild(pair);
}

function showRadar(before,after,caption){
  /* 基本18問のプロフィールは結果カード内に表示するため、旧静的カードは使わない。 */
  renderTwoPersonComparison();
}

// v38: 追加チェックの広告ゲート状態を明示的に初期化し、DOM参照を明示化。
