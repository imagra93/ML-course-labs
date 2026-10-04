/* Figures for 07_ensembles.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,arrow,rng,randn,fmt,q,setV,setR,svgOf,waveData,buildTree,treeProb}=lib;

/* Variance of the average of B models with pairwise correlation rho */
FIG['avg']=root=>{const P=Plot(svgOf(root),{w:540,h:320,x:[1,100],y:[0,1.05],m:{l:50,r:14,t:14,b:36}});P.axes({xt:[1,20,40,60,80,100],yt:[0,0.25,0.5,0.75,1],xl:'number of models B',yl:'Var(average) / σ²'});
  const ir=q(root,'r'),ib=q(root,'b');
  function draw(){const rho=+ir.value,B=+ib.value;setV(root,'r',fmt(rho));setV(root,'b',B);P.clear();P.line(1,rho,100,rho,'ln thin so dash');P.fn(b=>rho+(1-rho)/b,'ln sb',1,100,300);
    const v=rho+(1-rho)/B;P.dot(B,v,7,'fr pt');P.text(B,v,'Var = '+fmt(v,3)+' σ²','lab',B>60?'end':'start',B>60?-10:10,-12);setR(root,'v',fmt(v,3)+' σ²');setR(root,'f',fmt(rho,2)+' σ²')}
  ir.addEventListener('input',draw);ib.addEventListener('input',draw);draw()};

/* Bootstrap samples of 10 examples */
FIG['boot']=root=>{const r=rng(99);const m=10;let n=0,sum=0;const orig=root.querySelector('[data-k="orig"]'),samp=root.querySelector('[data-k="samp"]');
  const ball=(t,out,k)=>'<span style="width:40px;height:40px;border-radius:50%;display:inline-grid;place-items:center;font-weight:700;position:relative;vertical-align:middle;line-height:1;margin:0 2px;'+(out?'background:#fbe5d6;outline:2px dashed #ed7d31':'background:#dae3f3')+'">'+t+(k>1?'<sup style="position:absolute;top:-10px;right:-10px;background:#4472c4;color:#fff;font-size:12px;line-height:1;padding:2px 4px;border-radius:3px">×'+k+'</sup>':'')+'</span>';
  orig.innerHTML=[...Array(m)].map((_,i)=>ball(i+1,false,1)).join(' ');
  function once(){const c=new Array(m).fill(0);for(let i=0;i<m;i++)c[Math.floor(r()*m)]++;n++;const o=c.filter(v=>v===0).length;sum+=o/m;return {c:c,o:o}}
  function show(res){samp.innerHTML=res.c.map((v,i)=>ball(i+1,v===0,v)).join(' ');setR(root,'n',n);setR(root,'o',res.o+' of 10');setR(root,'a',fmt(100*sum/n,1)+' %')}
  root.querySelector('[data-k="go"]').addEventListener('click',()=>show(once()));root.querySelector('[data-k="go100"]').addEventListener('click',()=>{let res;for(let i=0;i<100;i++)res=once();show(res)});show(once())};

function squares(svg,x,y,w,h,r,n){const cols=['#4472c4','#ed7d31','#ffc000','#70ad47','#5b9bd5'];for(let i=0;i<n;i++){const a=x+8+(w-26)*r(),b=y+8+(h-26)*r();E('rect',{x:a,y:b,width:14,height:14,fill:cols[Math.floor(r()*5)],transform:'rotate('+Math.floor(r()*40-20)+' '+(a+7)+' '+(b+7)+')'},svg)}}
FIG['bag-diagram']=root=>{const svg=initSvg(svgOf(root),600,400);const r=rng(5);
  E('rect',{x:190,y:10,width:200,height:90,rx:12,fill:'#f2f2f2',style:'stroke:#595959'},svg);squares(svg,190,10,200,90,r,26);T(svg,400,58,'Original dataset','lab','start');
  [40,230,440].forEach((x,k)=>{E('rect',{x:x,y:150,width:120,height:130,fill:'#fff',style:'stroke:#4472c4;stroke-width:1.5'},svg);squares(svg,x,150,120,95,r,12);
    E('rect',{x:x+10,y:250,width:100,height:24,fill:'#404040'},svg);T(svg,x+60,267,k===2?'Tree B':'Tree '+(k+1),'').style.fill='#fff';
    arrowPx(svg,290,100,x+60,148,'ln thin sb','fb');arrowPx(svg,x+60,282,300,338,'ln thin sb','fb')});
  T(svg,395,220,'· · · · · ·','lab big');T(svg,575,130,'Bootstrap samples','lab','end');T(svg,575,300,'Aggregation','lab','end');
  E('rect',{x:220,y:340,width:160,height:28,fill:'#548235'},svg);T(svg,300,359,'Average / vote','').style.fill='#fff'};
FIG['rf-vote']=root=>{const svg=initSvg(svgOf(root),560,330);E('rect',{x:230,y:6,width:100,height:24,fill:'#404040'},svg);T(svg,280,23,'DATASET','').style.fill='#fff';
  [90,280,470].forEach((cx,k)=>{arrowPx(svg,280,30,cx,58,'ln thin sk','fk');const nodes=[[cx,70],[cx-40,110],[cx+40,110],[cx-60,150],[cx-20,150],[cx+20,150],[cx+60,150]];
    [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]].forEach(([a,b])=>E('line',{x1:nodes[a][0],y1:nodes[a][1],x2:nodes[b][0],y2:nodes[b][1],class:'ln thin sk'},svg));
    nodes.forEach((p,i)=>E('circle',{cx:p[0],cy:p[1],r:8,fill:(i+k)%3===0?'#92d050':'#4472c4'},svg));T(svg,cx,182,'TREE '+(k===2?'B':k+1),'');T(svg,cx,210,'result '+(k===2?'B':k+1),'lab');
    arrowPx(svg,cx,216,cx<280?235:cx>280?325:280,262,'ln thin sk','fk')});
  E('rect',{x:170,y:264,width:220,height:26,fill:'#fff',style:'stroke:#404040'},svg);T(svg,280,282,'MAJORITY VOTE / AVERAGE','lab');arrowPx(svg,280,290,280,308,'ln thin sk','fk');
  E('rect',{x:220,y:308,width:120,height:22,fill:'#404040'},svg);T(svg,280,324,'FINAL RESULT','').style.fill='#fff'};

/* One deep tree versus a random forest on the noisy wave */
FIG['forest']=root=>{const tr=waveData(220,11,0.15),te=waveData(1000,12,0.15);const r=rng(44);const single=buildTree(tr,40);const trees=[];
  for(let b=0;b<50;b++){const bs=[];for(let i=0;i<tr.length;i++)bs.push(tr[Math.floor(r()*tr.length)]);trees.push(buildTree(bs,40,rr=>[rr()<0.5?0:1],r))}
  const P=Plot(svgOf(root),{w:420,h:420,x:[0,1],y:[0,1],m:{l:10,r:10,t:10,b:10}});const N=36;const inp=q(root,'b');let mode='forest';const btns=root.querySelectorAll('.seg button');
  const fprob=(x,B)=>{let s=0;for(let b=0;b<B;b++)s+=treeProb(trees[b],x);return s/B};const prob=(x,B)=>mode==='tree'?treeProb(single,x):fprob(x,B);
  const acc=f=>te.filter(p=>(f(p)>=0.5?1:0)===p[2]).length/te.length;setR(root,'acc1',fmt(acc(p=>treeProb(single,p)),3));
  function draw(){const B=+inp.value;setV(root,'b',B);P.clear();for(let a=0;a<N;a++)for(let c=0;c<N;c++){const x=[(a+0.5)/N,(c+0.5)/N];const p=prob(x,B);const rc=P.rect(a/N,c/N,(a+1)/N,(c+1)/N,p>=0.5?'fb':'fo');rc.setAttribute('opacity',(0.08+0.4*Math.abs(p-0.5)*2).toFixed(2))}
    P.fn(x=>0.5+0.22*Math.sin(2*Math.PI*x),'ln thin sk dash',0,1);tr.forEach(p=>P.dot(p[0],p[1],3.2,'pt '+(p[2]?'fb':'fo')));setR(root,'acc',fmt(acc(p=>fprob(p,B)),3))}
  /* B means nothing for the single tree: grey the slider out instead of leaving it live with a frozen plot */
  const row=inp.closest('.ctl');
  btns.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.m;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));inp.disabled=mode==='tree';row.style.opacity=mode==='tree'?'0.4':'';draw()}));inp.addEventListener('input',draw);draw()};

/* Bagging (parallel) versus boosting (sequential) */
FIG['seqpar']=root=>{const svg=initSvg(svgOf(root),640,350);
  const bx=(x,y,w,h,t,fill,dark)=>{E('rect',{x:x,y:y,width:w,height:h,rx:6,fill:fill||'#fff',style:'stroke:#404040;stroke-width:1.2'},svg);const e=T(svg,x+w/2,y+h/2+5,t,'lab');if(dark)e.style.fill='#fff'};
  T(svg,10,20,'Bagging / random forest: independent models, in parallel','lab','start');
  bx(10,82,80,40,'data','#f2f2f2');[40,86,132].forEach((y,k)=>{bx(170,y,120,34,['deep tree 1','deep tree 2','deep tree B'][k],'#dae3f3');arrowPx(svg,92,102,168,y+17,'ln thin sk','fk');arrowPx(svg,292,y+17,378,102,'ln thin sk','fk')});
  bx(380,82,120,40,'average','#548235',true);T(svg,510,107,'lowers the variance','','start');
  T(svg,10,206,'Boosting: weak models, one after another','lab','start');
  bx(10,248,64,40,'data','#f2f2f2');[100,220,340].forEach((x,k)=>{bx(x,248,90,40,'stump '+(k+1),'#fbe5d6');arrowPx(svg,x-24,268,x-2,268,'ln thin sk','fk');if(k)T(svg,x-13,240,'errors','','middle')});
  arrowPx(svg,432,268,456,268,'ln thin sk','fk');bx(458,248,120,40,'weighted sum','#c55a11',true);T(svg,518,308,'lowers the bias','','middle');
  T(svg,265,330,'each stump focuses on what the previous ones got wrong','','middle')};

/* AdaBoost with decision stumps on 30 points with a diagonal boundary */
FIG['ada']=root=>{const r=rng(23);const X=[];while(X.length<30){const x=[0.05+0.9*r(),0.05+0.9*r()];const s=x[0]+x[1]-1;if(Math.abs(s)<0.05)continue;X.push([x[0],x[1],s>0?1:-1])}
  const m=X.length,TMAX=20;const h=(st,p)=>p[st.j]>st.t?st.s:-st.s;
  const stump=w=>{let best=null;for(const j of [0,1]){const v=[...new Set(X.map(p=>p[j]))].sort((a,b)=>a-b);for(let i=0;i<v.length-1;i++){const t=(v[i]+v[i+1])/2;
    for(const s of [1,-1]){let e=0;X.forEach((p,k)=>{if((p[j]>t?s:-s)!==p[2])e+=w[k]});if(!best||e<best.e-1e-12)best={j:j,t:t,s:s,e:e}}}}return best};
  const R=[];let w=new Array(m).fill(1/m);
  for(let t=0;t<TMAX;t++){const st=stump(w);const e=Math.max(st.e,1e-10);st.a=0.5*Math.log((1-e)/e);st.w=w.slice();R.push(st);
    w=w.map((wi,k)=>wi*Math.exp(-st.a*X[k][2]*h(st,X[k])));const Z=w.reduce((s,v)=>s+v,0);w=w.map(v=>v/Z)}
  const F=(p,t)=>{let s=0;for(let k=0;k<t;k++)s+=R[k].a*h(R[k],p);return s};
  const svg=initSvg(svgOf(root),900,420);const mk=at=>Plot(svg,{at:at,w:420,h:420,x:[0,1],y:[0,1],m:{l:10,r:10,t:34,b:10}});const A=mk([0,0]),B=mk([470,0]);
  const tA=T(A.root,210,22,'','lab big'),tB=T(B.root,210,22,'','lab big');A.rect(0,0,1,1,'nof',A.bg).setAttribute('style','stroke:#bfbfbf');B.rect(0,0,1,1,'nof',B.bg).setAttribute('style','stroke:#bfbfbf');
  const pt=(P,p,rad,ring)=>{P.dot(p[0],p[1],rad,'pt '+(p[2]>0?'fb':'fo'));if(ring)E('circle',{cx:P.X(p[0]),cy:P.Y(p[1]),r:rad+4,class:'ln thin sk'},P.dyn)};
  const inp=q(root,'t');
  function draw(){const t=+inp.value;setV(root,'t',t);const st=R[t-1];A.clear();B.clear();
    tA.textContent='Round '+t+': stump '+t+' on the weighted data';tB.textContent='The vote of stumps 1…'+t;
    if(st.j===0){A.rect(0,0,st.t,1,st.s>0?'fos':'fbs');A.rect(st.t,0,1,1,st.s>0?'fbs':'fos');A.line(st.t,0,st.t,1,'ln sk dash')}else{A.rect(0,0,1,st.t,st.s>0?'fos':'fbs');A.rect(0,st.t,1,1,st.s>0?'fbs':'fos');A.line(0,st.t,1,st.t,'ln sk dash')}
    let nw=0;X.forEach((p,k)=>{const wrong=h(st,p)!==p[2];if(wrong)nw++;pt(A,p,Math.max(2.5,38*Math.sqrt(st.w[k])),wrong)});
    /* the vote is constant between the thresholds used so far: draw those exact cells */
    const cuts=[[0,1],[0,1]];for(let k=0;k<t;k++)cuts[R[k].j].push(R[k].t);const [gx,gy]=cuts.map(c=>[...new Set(c)].sort((a,b)=>a-b));
    for(let a=0;a<gx.length-1;a++)for(let c=0;c<gy.length-1;c++){const v=F([(gx[a]+gx[a+1])/2,(gy[c]+gy[c+1])/2],t);B.rect(gx[a],gy[c],gx[a+1],gy[c+1],v>0?'fbs':'fos')}
    B.line(0,1,1,0,'ln thin sm dash');let err=0;X.forEach(p=>{const wrong=Math.sign(F(p,t))!==p[2];if(wrong)err++;pt(B,p,5.5,wrong)});
    setR(root,'e',fmt(st.e,3));setR(root,'a',fmt(st.a,2));setR(root,'nw',nw+' of '+m);setR(root,'err',err)}
  inp.addEventListener('input',draw);draw()};

/* Gradient boosting for squared loss: trees of depth 2, at least 5 points per leaf */
FIG['boost']=root=>{const r=rng(9);const f0=x=>Math.sin(2*Math.PI*x)+0.6*x;const tr=[],va=[];for(let i=0;i<80;i++){const x=r();tr.push([x,f0(x)+0.3*randn(r)])}for(let i=0;i<500;i++){const x=r();va.push([x,f0(x)+0.3*randn(r)])}
  const grid=[...Array(201)].map((_,i)=>i/200);const DEPTH=2,MINLEAF=5,MMAX=200;
  function fitTree(xs,rs){const idx=xs.map((_,i)=>i).sort((a,b)=>xs[a]-xs[b]);
    function rec(ids,d){const mean=ids.reduce((s,i)=>s+rs[i],0)/ids.length;if(d===0||ids.length<2*MINLEAF)return {v:mean};let best=null,sl=0,sl2=0;const tot=ids.reduce((s,i)=>s+rs[i],0),tot2=ids.reduce((s,i)=>s+rs[i]*rs[i],0);
      for(let k=1;k<ids.length;k++){const v=rs[ids[k-1]];sl+=v;sl2+=v*v;if(k<MINLEAF||ids.length-k<MINLEAF)continue;if(xs[ids[k]]===xs[ids[k-1]])continue;const nl=k,nr=ids.length-k;const sse=(sl2-sl*sl/nl)+((tot2-sl2)-(tot-sl)**2/nr);if(!best||sse<best.sse)best={sse:sse,k:k}}
      if(!best)return {v:mean};const t=(xs[ids[best.k-1]]+xs[ids[best.k]])/2;return {t:t,L:rec(ids.slice(0,best.k),d-1),R:rec(ids.slice(best.k),d-1)}}
    const tree=rec(idx,DEPTH);return x=>{let nd=tree;while(nd.t!==undefined)nd=x<=nd.t?nd.L:nd.R;return nd.v}}
  const cache={};function seq(nu){if(cache[nu])return cache[nu];const ybar=tr.reduce((s,p)=>s+p[1],0)/tr.length;const Ft=tr.map(()=>ybar),Fv=va.map(()=>ybar),Fg=grid.map(()=>ybar);
    const mse=(F,D)=>F.reduce((s,v,i)=>s+(v-D[i][1])**2,0)/D.length;const out={g:[Fg.slice()],et:[mse(Ft,tr)],ev:[mse(Fv,va)]};const xs=tr.map(p=>p[0]);
    for(let t=1;t<=MMAX;t++){const rs=tr.map((p,i)=>p[1]-Ft[i]);const hh=fitTree(xs,rs);for(let i=0;i<Ft.length;i++)Ft[i]+=nu*hh(tr[i][0]);for(let i=0;i<Fv.length;i++)Fv[i]+=nu*hh(va[i][0]);for(let i=0;i<Fg.length;i++)Fg[i]+=nu*hh(grid[i]);
      out.g.push(Fg.slice());out.et.push(mse(Ft,tr));out.ev.push(mse(Fv,va))}cache[nu]=out;return out}
  const svg=initSvg(svgOf(root),620,320);const P=Plot(svg,{at:[0,0],w:380,h:320,x:[0,1],y:[-1.8,2.2],m:{l:36,r:8,t:12,b:36}});P.axes({xt:[0,0.5,1],yt:[-1,0,1,2],xl:'x',yl:'y'});P.fn(f0,'ln thin sm dash',0,1,200,P.bg);
  const Q=Plot(svg,{at:[390,0],w:230,h:320,x:[0,MMAX],y:[0,0.5],m:{l:48,r:8,t:12,b:36}});Q.axes({xt:[0,100,200],yt:[0,0.1,0.2,0.3,0.4,0.5],xl:'trees M',yl:'MSE'});
  Q.line(0,0.09,MMAX,0.09,'ln thin sm dot2',Q.bg);Q.text(MMAX,0.09,'noise σ² = 0.09','','end',-2,-5,Q.bg);
  Q.line(92,0.46,118,0.46,'ln sb',Q.bg);Q.text(124,0.46,'train','','start',0,5,Q.bg);Q.line(92,0.415,118,0.415,'ln so',Q.bg);Q.text(124,0.415,'validation','','start',0,5,Q.bg);
  const bgG=E('g',{},Q.dyn),mk=E('g',{},Q.dyn);
  let nu=0.3;const inp=q(root,'m');const btns=root.querySelectorAll('.seg button');
  function curves(){const s=seq(nu);bgG.innerHTML='';Q.path(s.et.map((v,i)=>[i,v]),'ln sb',bgG);Q.path(s.ev.map((v,i)=>[i,Math.min(v,0.5)]),'ln so',bgG);let bm=0;s.ev.forEach((v,i)=>{if(v<s.ev[bm])bm=i});setR(root,'bm',bm+' ('+fmt(s.ev[bm],3)+')')}
  function draw(){const M=+inp.value;setV(root,'m',M);const s=seq(nu);P.clear();tr.forEach(p=>P.dot(p[0],p[1],4,'pt fb'));P.path(grid.map((x,i)=>[x,s.g[M][i]]),'ln sr');
    mk.innerHTML='';Q.line(M,0,M,0.5,'ln thin sm',mk);Q.dot(M,s.et[M],5,'fb',mk);Q.dot(M,Math.min(s.ev[M],0.5),5,'fo',mk);setR(root,'tr',fmt(s.et[M],3));setR(root,'va',fmt(s.ev[M],3))}
  btns.forEach(b=>b.addEventListener('click',()=>{nu=+b.dataset.nu;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));curves();draw()}));inp.addEventListener('input',draw);curves();draw()};
})();
