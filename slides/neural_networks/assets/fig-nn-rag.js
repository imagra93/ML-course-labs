/* Figures for the RAG part of 06_transformers.html. They use the real data of Lab 15 (assets/rag-data.js):
   24 coffee-shop pages, 16 questions, the neural sentence encoder and word TF-IDF. Nothing here is made up
   except the schematic ones (rag-options, contrastive), which say so. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,q,setV,setR,svgOf}=lib;
const {grid,heat,box,stepper,segs,f2,f3}=window.MLNN;
const R=window.MLNN_RAG;
const TAGC=['#ed7d31','#4472c4','#70ad47','#bf9000','#7f7f7f'],TAGN=['sweets & bakery','work & study','specialty coffee & beans','early / late / 24 h','pets, kids, leisure'];
const bullets=(svg,x,y,items,dy)=>items.forEach(([m,t],i)=>{const g=T(svg,x,y+i*(dy||34),m,'lab','start');g.style.fill=m==='✓'?'#385723':'#c00000';T(svg,x+22,y+i*(dy||34),t,'','start')});

/* ---------- three ways to give an LLM your data (schematic) ---------- */
FIG['rag-options']=root=>{const svg=initSvg(svgOf(root),1000,330);
  const panel=(k,title,sub)=>{const x=10+k*332;E('rect',{x:x,y:4,width:322,height:322,rx:10,fill:k===2?'#f2f8ee':'#fafafa',stroke:k===2?'#70ad47':'#d0d0d0','stroke-width':k===2?2.5:1},svg);T(svg,x+161,30,title,'lab');T(svg,x+161,50,sub,'');return x};
  let x=panel(0,'1 · Retrain the model','"closed-book exam": memorize it all');
  box(svg,x+14,78,108,44,'your\ndocuments','#ffe699',{cls:''});arrowPx(svg,x+124,100,x+170,100,'ln thin sk','fk');T(svg,x+147,92,'train','');box(svg,x+172,70,136,60,'LLM\n(weights change)','#dae3f3',{cls:''});
  bullets(svg,x+16,176,[['✓','learns a style or a format'],['✗','expensive, needs experts and GPUs'],['✗','facts are frozen at training time'],['✗','cannot say where an answer came from']]);
  x=panel(1,'2 · Paste everything in the prompt','"open book", but you carry the whole library');
  for(let i=0;i<12;i++){E('rect',{x:x+14+(i%4)*24,y:72+Math.floor(i/4)*20,width:20,height:16,fill:'#ffe699',stroke:'#bf9000'},svg)}
  arrowPx(svg,x+112,100,x+158,100,'ln thin sk','fk');E('rect',{x:x+160,y:70,width:70,height:60,fill:'#fff',stroke:'#404040','stroke-dasharray':'4 3'},svg);T(svg,x+195,104,'prompt','');
  for(let i=0;i<5;i++)E('rect',{x:x+236+(i%2)*24,y:72+Math.floor(i/2)*20,width:20,height:16,fill:'#f8cbad',stroke:'#c00000'},svg);T(svg,x+260,138,'does not fit','','middle').style.fill='#c00000';
  bullets(svg,x+16,176,[['✓','simple: no search needed'],['✗','thousands of pages do not fit'],['✗','you pay for every token, at every question'],['✗','the model gets lost in very long prompts']]);
  x=panel(2,'3 · RAG: retrieve, then paste','"open book": find the right page, paste only that');
  for(let i=0;i<9;i++){E('rect',{x:x+14+(i%3)*24,y:72+Math.floor(i/3)*20,width:20,height:16,fill:i===4?'#ffc000':'#ffe699',stroke:'#bf9000'},svg)}
  E('circle',{cx:x+110,cy:100,r:14,fill:'none',stroke:'#404040','stroke-width':2.5},svg);E('line',{x1:x+120,y1:110,x2:x+132,y2:122,stroke:'#404040','stroke-width':3.5},svg);
  [0,1,2].forEach(i=>E('rect',{x:x+150,y:72+i*20,width:50,height:16,fill:'#ffc000',stroke:'#bf9000'},svg));arrowPx(svg,x+204,100,x+232,100,'ln thin sk','fk');box(svg,x+234,76,76,48,'question\n+ 3 chunks','#fff2cc',{cls:''});
  bullets(svg,x+16,176,[['✓','update = edit a document'],['✓','answers can cite the chunks'],['✓','short prompt: cheap and fast'],['✗','only as good as the retrieval']])};

/* ---------- text -> vector: the real numbers of Lab 15 ---------- */
FIG['embed-strip']=root=>{const svg=initSvg(svgOf(root),1000,326);const n=24,cw=20,x0=440;
  const strip=(y,v)=>v.forEach((a,i)=>E('rect',{x:x0+i*cw,y:y,width:cw-1,height:24,fill:heat(a/0.16)},svg));
  const prod=(y,a,b)=>a.forEach((u,i)=>E('rect',{x:x0+i*cw,y:y,width:cw-1,height:16,fill:heat(u*b[i]/0.012)},svg));
  box(svg,10,18,290,40,'"Where can I try Vietnamese coffee?"','#fbe5d6',{cls:''});
  box(svg,10,92,290,58,'Mundo en Taza: specialty café with\ncoffees from all over the world…\nVietnamese coffee with condensed milk','#e2f0d9',{cls:''});
  box(svg,10,192,290,58,'Rincón Sin Gluten: 100 % gluten-free\nbakery and café, suitable for coeliacs.\nCakes, bread and waffles every day','#e2f0d9',{cls:''});
  box(svg,322,18,78,232,'sentence\nencoder\n\n(a trained\ntransformer)','#dae3f3',{cls:''});
  [38,121,221].forEach(y=>{arrowPx(svg,302,y,320,y,'ln thin sk','fk');arrowPx(svg,402,y,436,y,'ln thin sk','fk')});
  T(svg,x0,12,'the first 24 of the 384 numbers of each text (orange > 0, blue < 0)','','start');
  strip(26,R.vq);T(svg,x0-6,43,'q','lab','end');
  strip(98,R.v12);T(svg,x0-6,115,'d','lab','end');prod(128,R.vq,R.v12);T(svg,x0-6,141,'q×d','','end');
  T(svg,x0,166,'sum of the products over all 384 numbers = cosine = '+f2(R.cos12),'lab','start').style.fill='#385723';
  strip(198,R.v17);T(svg,x0-6,215,'d','lab','end');prod(228,R.vq,R.v17);T(svg,x0-6,241,'q×d','','end');
  T(svg,x0,266,'sum of the products over all 384 numbers = cosine = '+f2(R.cos17),'lab','start').style.fill='#c00000';
  T(svg,x0,296,'the cosine is the sum of these products: mostly orange for a text about the same thing,','','start');
  T(svg,x0,314,'a mix of both colours for an unrelated one (length-1 vectors: dot product = cosine)','','start')};

/* ---------- contrastive training (schematic) ---------- */
FIG['contrastive']=root=>{const svg=initSvg(svgOf(root),1000,330);const r=rng(11);const COL=['#ed7d31','#4472c4','#70ad47','#bf9000'],NAMES=['Vietnamese coffee','bike repair','gluten-free','open at night'];
  const before=[],after=[];const cx=[[0.25,0.3],[0.75,0.3],[0.25,0.72],[0.75,0.72]];
  for(let k=0;k<4;k++){before.push([[r(),r()],[r(),r()]]);const c=cx[k];after.push([[c[0]-0.03,c[1]-0.02],[c[0]+0.03,c[1]+0.025]])}
  [['Before training',before,20,false],['After training',after,540,true]].forEach(([ttl,P,x0,ok])=>{
    E('rect',{x:x0,y:44,width:440,height:230,rx:8,fill:'#fff',stroke:'#c0c0c0'},svg);T(svg,x0+220,30,ttl,'lab');
    P.forEach((pr,k)=>{const A=[x0+20+pr[0][0]*400,60+pr[0][1]*198],B=[x0+20+pr[1][0]*400,60+pr[1][1]*198];
      E('line',{x1:A[0],y1:A[1],x2:B[0],y2:B[1],stroke:COL[k],'stroke-width':ok?1.5:1.2,'stroke-dasharray':ok?'':'5 4'},svg);
      E('circle',{cx:A[0],cy:A[1],r:7,fill:COL[k],stroke:'#fff','stroke-width':1.5},svg);E('rect',{x:B[0]-6,y:B[1]-6,width:12,height:12,fill:COL[k],stroke:'#fff','stroke-width':1.5},svg);
      if(ok)T(svg,(A[0]+B[0])/2,Math.min(A[1],B[1])-14,NAMES[k],'','middle')})});
  arrowPx(svg,468,159,530,159,'ln sk','fk');T(svg,499,146,'training','','middle');
  E('circle',{cx:30,cy:304,r:6,fill:'#7f7f7f'},svg);T(svg,42,308,'a question','','start');E('rect',{x:140,y:298,width:12,height:12,fill:'#7f7f7f'},svg);T(svg,158,308,'the text that answers it (same colour = same meaning)','','start');
  T(svg,980,308,'schematic: in reality 384 dimensions, millions of pairs','','end')};

/* ---------- dot product, cosine, Euclidean distance ---------- */
FIG['sim-measures']=root=>{const A=[1,2],la=Math.hypot(A[0],A[1]),pa=Math.atan2(A[1],A[0]);const svg=svgOf(root);
  const ith=q(root,'th'),ir=q(root,'r'),get=segs(root,'m',()=>draw());
  function draw(){const th=+ith.value,r=+ir.value,mode=get(),t=th*Math.PI/180,W=mode==='unit'?1.45:3.2;setV(root,'th',fmt(th,1)+'°');setV(root,'r',fmt(r,1));
    const P=Plot(svg,{w:500,h:500,x:[-W,W],y:[-W,W],m:{l:8,r:8,t:8,b:8}});P.axes({grid:false,noaxes:true});P.line(-W,0,W,0,'ax',P.bg);P.line(0,-W,0,W,'ax',P.bg);
    const arr=(x,y,cls,fcls)=>arrowPx(P.dyn,P.X(0),P.Y(0),P.X(x),P.Y(y),cls,fcls);
    const Bv=[r*la*Math.cos(pa+t),r*la*Math.sin(pa+t)];const a=mode==='unit'?[A[0]/la,A[1]/la]:A,b=mode==='unit'?[Bv[0]/(r*la),Bv[1]/(r*la)]:Bv;
    const dot=a[0]*b[0]+a[1]*b[1],cs=Math.cos(t),eu=Math.hypot(a[0]-b[0],a[1]-b[1]);
    if(mode==='unit'){const pts=[];for(let i=0;i<=120;i++)pts.push([Math.cos(2*Math.PI*i/120),Math.sin(2*Math.PI*i/120)]);P.path(pts,'ln thin sm dash');P.text(0,-1,'length 1','', 'middle',0,18)}
    const L=Math.hypot(b[0],b[1]),k=L>W*0.95?W*0.95/L:1,bd=[b[0]*k,b[1]*k];
    P.line(a[0],a[1],bd[0],bd[1],'ln thin so dash');arr(a[0],a[1],'ln sk','fk');arr(bd[0],bd[1],'ln sr','fr');
    P.text(a[0],a[1],'a','lab','middle',12,-8);P.text(bd[0],bd[1],k<1?'b (×'+fmt(r,0)+' longer, cut here)':'b','lab','middle',14,-8);
    const ra=0.3*W/1.45*1.45,a0=Math.atan2(a[1],a[0]),pts=[];for(let i=0;i<=20;i++){const u=a0+t*i/20;pts.push([ra*Math.cos(u)*0.5,ra*Math.sin(u)*0.5])}P.path(pts,'ln thin sk');
    setR(root,'dot',fmt(dot,2));setR(root,'cos',fmt(cs,2));setR(root,'eu',fmt(eu,2));setR(root,'eu2',mode==='unit'?fmt(eu*eu,2)+' = 2 − 2cos':fmt(eu*eu,2))}
  ith.addEventListener('input',draw);ir.addEventListener('input',draw);draw()};

/* ---------- the embedding space of Lab 15 and the search for the nearest chunks ---------- */
FIG['embed-search']=root=>{const svg=svgOf(root);const iq=q(root,'q'),ik=q(root,'k');
  function draw(){const qi=+iq.value,k=+ik.value;setV(root,'q',R.qen[qi]);setV(root,'k',k);initSvg(svg,1000,440);
    const MP=Plot(svg,{at:[0,0],w:520,h:440,x:[-0.46,0.48],y:[-0.34,0.62],m:{l:6,r:6,t:30,b:50}});MP.axes({grid:false,noaxes:true});
    E('rect',{x:6,y:30,width:508,height:360,fill:'#fff',stroke:'#c8c8c8'},svg);T(svg,260,20,'2-D shadow of the 384-D space (PCA keeps '+Math.round(R.var*100)+' % of the variance)','lab');
    const s=R.S[qi],order=s.map((v,i)=>i).sort((a,b)=>s[b]-s[a]),top=order.slice(0,k),rel=R.rel[qi],rank=Math.min(...rel.map(d=>order.indexOf(d)))+1;
    const px=i=>MP.X(R.pd[i][0]),py=i=>MP.Y(R.pd[i][1]),qx=MP.X(R.pq[qi][0]),qy=MP.Y(R.pq[qi][1]);
    top.forEach(i=>E('line',{x1:qx,y1:qy,x2:px(i),y2:py(i),stroke:'#c00000','stroke-width':1.2},svg));
    R.names.map((nm,i)=>i).sort((a,b)=>top.includes(a)-top.includes(b)).forEach(i=>{const isTop=top.includes(i),isRel=rel.includes(i);
      if(isRel)E('circle',{cx:px(i),cy:py(i),r:12,fill:'none',stroke:'#00a651','stroke-width':3},svg);
      E('circle',{cx:px(i),cy:py(i),r:isTop?10:6,fill:TAGC[R.tag[i]],stroke:isTop?'#000':'#fff','stroke-width':isTop?2:1.2},svg);
      if(isTop)T(svg,px(i),py(i)+5,String(order.indexOf(i)+1),'lab w')});
    E('polygon',{points:[[qx,qy-10],[qx+10,qy],[qx,qy+10],[qx-10,qy]].map(p=>p.join(',')).join(' '),fill:'#c00000',stroke:'#fff','stroke-width':1.5},svg);
    TAGN.forEach((n,t)=>{const x=14+(t%3)*172,y=408+Math.floor(t/3)*20;E('circle',{cx:x+5,cy:y-4,r:5,fill:TAGC[t]},svg);T(svg,x+14,y,n,'','start').style.fontSize='12px'});
    T(svg,540,18,'cosine similarity to the question (red ◆)    ✓ = a right chunk','lab','start');
    order.forEach((d,rk)=>{const y=34+rk*17,isTop=rk<k,isRel=rel.includes(d);if(isTop)E('rect',{x:538,y:y-12,width:456,height:16,fill:'#fff2cc'},svg);
      T(svg,566,y,String(rk+1),'','end');T(svg,574,y,R.short[d],isTop?'lab':'','start').style.fontSize='13px';
      E('rect',{x:710,y:y-10,width:Math.max(1,s[d]/0.85*220),height:12,fill:TAGC[R.tag[d]]},svg);T(svg,714+s[d]/0.85*220,y,f2(s[d]),'','start').style.fontSize='12px';if(isRel)T(svg,980,y,'✓','lab','end').style.fill='#00a651'});
    setR(root,'rank',String(rank));setR(root,'hit',rank<=k?'yes':'no');root.querySelectorAll('[data-q-es]').forEach(e=>e.textContent=R.qes[qi])}
  iq.addEventListener('input',draw);ik.addEventListener('input',draw);draw()};

/* ---------- chunking: size and overlap ---------- */
FIG['chunking']=root=>{const svg=svgOf(root);const WORDS=189,PER=63,cw=14.6;const ANS={hours:[22,36,'"Abre de lunes a viernes de 8:00 a 19:00 y cierra los fines de semana."  =  open Mon–Fri 8:00–19:00, closed at weekends'],tasting:[83,98,'"Organiza catas de café los sábados a las 11:00, 15 € por persona con reserva previa."  =  tastings on Saturdays at 11:00, 15 € per person']};
  const is=q(root,'size'),io=q(root,'ov'),get=segs(root,'a',()=>draw());
  function draw(){const size=+is.value,ov=Math.min(+io.value,size-5),a=ANS[get()];setV(root,'size',size);setV(root,'ov',ov);initSvg(svg,980,240);
    const step=size-ov,ch=[];for(let i=0;i<Math.max(WORDS-ov,1);i+=step)ch.push([i,Math.min(i+size,WORDS)-1]);
    T(svg,20,16,'a guide of 189 words (6 coffee-shop pages); one square = one word; gold = the sentence that answers the question','','start');
    for(let w=0;w<WORDS;w++){const r=Math.floor(w/PER),c=w%PER;E('rect',{x:20+c*cw,y:26+r*62,width:cw-1.5,height:20,fill:w>=a[0]&&w<=a[1]?'#ffc000':'#e7e6e6'},svg)}
    ch.forEach(([s0,e0],k)=>{for(let r=Math.floor(s0/PER);r<=Math.floor(e0/PER);r++){const lo=Math.max(s0,r*PER),hi=Math.min(e0,r*PER+PER-1);
      E('rect',{x:20+(lo%PER)*cw,y:26+r*62+24+(k%2)*8,width:(hi-lo+1)*cw-1.5,height:6,fill:k%2?'#ed7d31':'#4472c4'},svg)}});
    const inside=ch.filter(([s0,e0])=>s0<=a[0]&&e0>=a[1]);
    T(svg,20,208,'blue and orange bars = consecutive chunks; where two bars overlap, those words belong to both chunks','','start');
    T(svg,20,228,a[2],'','start').style.fill='#7f6000';
    setR(root,'n',String(ch.length));setR(root,'step',String(step));setR(root,'in',inside.length?'yes (chunk '+(ch.indexOf(inside[0])+1)+')':'NO: cut in two')}
  is.addEventListener('input',draw);io.addEventListener('input',draw);draw()};

/* ---------- approximate nearest neighbours: an inverted file index ---------- */
FIG['ivf']=root=>{const svg=svgOf(root);const r=rng(5),C=12,pts=[];
  const cen0=[];for(let i=0;i<4;i++)for(let j=0;j<3;j++)cen0.push([1.25+i*2.5+0.5*(r()-0.5),1+j*2+0.5*(r()-0.5)]);
  cen0.forEach(c=>{for(let k=0;k<30;k++)pts.push([c[0]+0.38*randn(r),c[1]+0.34*randn(r)])});
  let cen=[];const pick=rng(8);for(let c=0;c<C;c++)cen.push(pts[Math.floor(pick()*pts.length)].slice());
  const d2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2;let lab=new Array(pts.length).fill(0);
  for(let it=0;it<12;it++){lab=pts.map(p=>{let b=0;for(let c=1;c<C;c++)if(d2(p,cen[c])<d2(p,cen[b]))b=c;return b});cen=cen.map((c,k)=>{const m=pts.filter((_,i)=>lab[i]===k);return m.length?[m.reduce((s,p)=>s+p[0],0)/m.length,m.reduce((s,p)=>s+p[1],0)/m.length]:c})}
  const K=5,run=(qp,np)=>{const near=cen.map((c,k)=>[d2(qp,c),k]).sort((a,b)=>a[0]-b[0]).slice(0,np).map(a=>a[1]);const exact=pts.map((p,i)=>[d2(qp,p),i]).sort((a,b)=>a[0]-b[0]).slice(0,K).map(a=>a[1]);
    const cand=pts.map((p,i)=>i).filter(i=>near.includes(lab[i]));const got=cand.map(i=>[d2(qp,pts[i]),i]).sort((a,b)=>a[0]-b[0]).slice(0,K).map(a=>a[1]);return {near,exact,got,cand,hit:exact.filter(i=>got.includes(i)).length}};
  const cand=rng(99),Q=[];let tries=0;
  while(Q.length<4&&tries++<4000){const qp=[0.5+9*cand(),0.4+5.2*cand()];const a=run(qp,1).hit,b=run(qp,2).hit;
    if(Q.length===0&&a===K)Q.push(qp);else if(Q.length===1&&a<=3&&b===K)Q.push(qp);else if(Q.length===2&&a===4&&b===K)Q.push(qp);else if(Q.length===3&&a<=3&&b<K)Q.push(qp)}
  while(Q.length<4)Q.push([5,3]);
  const COLS=['#fbe5d6','#dae3f3','#e2f0d9','#fff2cc','#ede1f6','#d9f0f0','#f8d7e3','#e4ebd0','#d3dff0','#f3e2cc','#dde7dc','#f0d8d8'];
  const iq=q(root,'qi'),inp=q(root,'np');
  function draw(){const qi=+iq.value-1,np=+inp.value;setV(root,'qi',String(qi+1));setV(root,'np',String(np));initSvg(svg,740,440);const qp=Q[qi],res=run(qp,np);
    const X=x=>10+x/10*720,Y=y=>432-y/6*432;
    for(let gx=0;gx<80;gx++)for(let gy=0;gy<48;gy++){const p=[(gx+0.5)/8,(gy+0.5)/8];let b=0;for(let c=1;c<C;c++)if(d2(p,cen[c])<d2(p,cen[b]))b=c;
      E('rect',{x:10+gx*9,y:432-(gy+1)*9,width:9.2,height:9.2,fill:res.near.includes(b)?COLS[b]:'#f6f6f6'},svg)}
    pts.forEach((p,i)=>E('circle',{cx:X(p[0]),cy:Y(p[1]),r:3.2,fill:res.near.includes(lab[i])?'#404040':'#c8c8c8'},svg));
    cen.forEach(c=>{E('path',{d:'M'+(X(c[0])-6)+','+Y(c[1])+'h12M'+X(c[0])+','+(Y(c[1])-6)+'v12',stroke:'#000','stroke-width':2.2},svg)});
    res.exact.forEach(i=>{const ok=res.got.includes(i);E('circle',{cx:X(pts[i][0]),cy:Y(pts[i][1]),r:8,fill:'none',stroke:ok?'#00a651':'#c00000','stroke-width':3,'stroke-dasharray':ok?'':'3 2'},svg)});
    E('polygon',{points:[[X(qp[0]),Y(qp[1])-11],[X(qp[0])+11,Y(qp[1])],[X(qp[0]),Y(qp[1])+11],[X(qp[0])-11,Y(qp[1])]].map(p=>p.join(',')).join(' '),fill:'#c00000',stroke:'#fff','stroke-width':1.5},svg);
    setR(root,'scan',res.cand.length+' of '+pts.length+' ('+Math.round(100*res.cand.length/pts.length)+' %)');setR(root,'cells',np+' of '+C);setR(root,'found',res.hit+' of '+K)}
  iq.addEventListener('input',draw);inp.addEventListener('input',draw);draw()};

/* ---------- hit rate@k and MRR on four toy questions ---------- */
FIG['rank-strip']=root=>{const svg=svgOf(root);const ranks=[1,3,1,null],ik=q(root,'k');
  function draw(){const k=+ik.value;setV(root,'k',k);initSvg(svg,760,250);
    for(let c=1;c<=10;c++)T(svg,150+(c-1)*40+17,22,String(c),'');T(svg,10,22,'rank in the results →','','start');
    ranks.forEach((rk,i)=>{const y=34+i*46;T(svg,40,y+24,'q'+(i+1),'lab','end');
      for(let c=1;c<=10;c++){const x=150+(c-1)*40,rel=rk===c,cut=c<=k;E('rect',{x:x,y:y,width:34,height:34,fill:rel?'#70ad47':(cut?'#dae3f3':'#f2f2f2'),stroke:cut?'#4472c4':'#d0d0d0','stroke-width':cut?1.6:1},svg);if(rel)T(svg,x+17,y+23,'✓','lab w')}
      const hit=rk!==null&&rk<=k;T(svg,570,y+14,hit?'hit':'miss','lab','start').style.fill=hit?'#385723':'#c00000';T(svg,570,y+32,rk?'1/rank = '+(rk===1?'1':'1/'+rk+' = '+f2(1/rk)):'not in the top 10: 0','','start')});
    E('line',{x1:150+k*40-3,x2:150+k*40-3,y1:30,y2:216,stroke:'#4472c4','stroke-width':2.5,'stroke-dasharray':'5 3'},svg);T(svg,150+k*40-3,238,'the LLM gets the chunks left of this line','','middle');
    const hits=ranks.filter(rk=>rk&&rk<=k).length;setR(root,'h',hits+'/4 = '+f2(hits/4));setR(root,'m','(1 + 0.33 + 1 + 0) / 4 = '+f2(ranks.reduce((s,rk)=>s+(rk?1/rk:0),0)/4))}
  ik.addEventListener('input',draw);draw()};

/* ---------- Lab 15 results: four ways to embed text ---------- */
FIG['methods']=root=>{const svg=initSvg(svgOf(root),620,330);const M=[['word TF-IDF','#a5a5a5',[0.562,0.75,0.75,0.667]],['character n-grams','#70ad47',[0.812,1,1,0.906]],['LSA (12 dims)','#ffc000',[0.562,0.75,0.812,0.69]],['neural encoder','#4472c4',[0.812,0.938,1,0.891]]];
  const P=Plot(svg,{at:[0,0],w:620,h:290,x:[0,4],y:[0,1.08],m:{l:44,r:10,t:10,b:40}});P.axes({grid:true,yt:[0,0.25,0.5,0.75,1]});
  ['hit rate@1','hit rate@3','hit rate@5','MRR'].forEach((g,gi)=>{T(svg,P.X(gi+0.5),282,g,'lab');M.forEach(([n,c,v],mi)=>{const x0=P.X(gi+0.1+mi*0.2),w=P.X(gi+0.3)-P.X(gi+0.1)-2;E('rect',{x:x0,y:P.Y(v[gi]),width:w,height:P.Y(0)-P.Y(v[gi]),fill:c},svg);T(svg,x0+w/2,P.Y(v[gi])-4,f2(v[gi]).replace('0.','.'),'').style.fontSize='11px'})});
  M.forEach(([n,c],i)=>{E('rect',{x:30+i*150,y:304,width:12,height:12,fill:c},svg);T(svg,48+i*150,315,n,'','start')})};

/* ---------- Lab 15: the question-document similarity matrices ---------- */
FIG['sim-heatmaps']=root=>{const svg=initSvg(svgOf(root),1000,360);const cs=16,nq=R.qes.length,nd=R.names.length;
  [['word TF-IDF',R.Sw,10],['neural encoder',R.S,520]].forEach(([ttl,S,x0])=>{T(svg,x0+nd*cs/2+30,22,ttl,'lab');
    S.forEach((row,i)=>row.forEach((v,j)=>E('rect',{x:x0+30+j*cs,y:36+i*cs,width:cs-0.8,height:cs-0.8,fill:heat(Math.min(1,v/0.8),true)},svg)));
    R.rel.forEach((rel,i)=>rel.forEach(j=>E('rect',{x:x0+30+j*cs,y:36+i*cs,width:cs-0.8,height:cs-0.8,fill:'none',stroke:'#c00000','stroke-width':2},svg)));
    for(let i=0;i<nq;i++)T(svg,x0+24,36+i*cs+12,String(i+1),'','end').style.fontSize='11px';
    T(svg,x0+30+nd*cs/2,36+nq*cs+18,'24 documents →','');T(svg,x0+8,36+nq*cs/2,'16 questions','').setAttribute('transform','rotate(-90 '+(x0+8)+' '+(36+nq*cs/2)+')')});
  T(svg,500,350,'red boxes = the documents that answer each question (from the lab)','','middle')};
/* ---------- hybrid search: keyword ranking + meaning ranking, fused with reciprocal rank fusion (real Lab 15 similarities) ---------- */
FIG['hybrid']=root=>{const svg=svgOf(root);const get=segs(root,'q',()=>draw());const K=60;
  const order=S=>S.map((v,j)=>j).sort((a,b)=>S[b]-S[a]||a-b);
  function draw(){const qi=+get(),rel=R.rel[qi];initSvg(svg,1000,330);
    const ow=order(R.Sw[qi]),on=order(R.S[qi]),sc=new Array(R.names.length).fill(0);ow.forEach((d,r)=>sc[d]+=1/(K+r+1));on.forEach((d,r)=>sc[d]+=1/(K+r+1));const of=order(sc);
    const col=(x0,w,ttl,sub,ord,val)=>{T(svg,x0+w/2,20,ttl,'lab big');T(svg,x0+w/2,40,sub,'');
      ord.slice(0,5).forEach((d,r)=>{const y=54+r*42,ok=rel.includes(d);box(svg,x0,y,w,34,'',ok?'#e2f0d9':'#fafafa',{stroke:ok?'#00a651':'#c8c8c8',sw:ok?2:1});
        T(svg,x0+12,y+22,String(r+1),'lab','start');T(svg,x0+32,y+22,R.short[d]+(ok?'  ✓':''),'lab','start');T(svg,x0+w-10,y+22,val(d),'','end')})};
    col(8,286,'keywords: word TF-IDF','shared words (Lab 15)',ow,d=>f2(R.Sw[qi][d]));
    col(318,286,'meaning: neural encoder','cosine of embeddings (Lab 15)',on,d=>f2(R.S[qi][d]));
    col(628,364,'fused: reciprocal rank fusion','score = 1/(60 + keyword rank) + 1/(60 + meaning rank)',of,d=>'1/'+(K+ow.indexOf(d)+1)+' + 1/'+(K+on.indexOf(d)+1)+' = '+sc[d].toFixed(4));
    T(svg,306,146,'+','lab big');T(svg,616,146,'→','lab big');
    const rk=o=>Math.min(...rel.map(d=>o.indexOf(d)))+1;setR(root,'rw',String(rk(ow)));setR(root,'rn',String(rk(on)));setR(root,'rf',String(rk(of)));
    T(svg,500,284,'question: "'+R.qen[qi]+'"  (asked in Spanish: "'+R.qes[qi]+'")','lab');
    T(svg,500,308,'✓ = a page that answers it. Ranks over all 24 pages; ties (pages that share no word with the question) keep the page order.','','middle')}
  draw()};
})();
