/* Figures for 07_ensembles.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,q,setV,setR,svgOf,waveData,buildTree,treeProb}=lib;
FIG['avg']=root=>{const P=Plot(svgOf(root),{w:540,h:330,x:[1,100],y:[0,1.05],m:{l:44,r:14,t:14,b:36}});P.axes({xt:[1,20,40,60,80,100],yt:[0,0.25,0.5,0.75,1],xl:'number of models B',yl:'Var / σ²'});
  const ir=q(root,'r'),ib=q(root,'b');function draw(){const rho=+ir.value,B=+ib.value;setV(root,'r',fmt(rho));setV(root,'b',B);P.clear();P.line(1,rho,100,rho,'ln thin so dash');P.fn(b=>rho+(1-rho)/b,'ln sb',1,100,300);
    const v=rho+(1-rho)/B;P.dot(B,v,7,'fr pt');P.text(B,v,'Var = '+fmt(v,3)+' σ²','lab',B>60?'end':'start',B>60?-10:10,-10);P.text(100,rho,'floor ρσ²','', 'end',-4,-6)}
  ir.addEventListener('input',draw);ib.addEventListener('input',draw);draw()};
FIG['boot']=root=>{const r=rng(99);const m=10;let n=0,sum=0;const orig=root.querySelector('[data-k="orig"]'),samp=root.querySelector('[data-k="samp"]');
  const ball=(t,cls,sup)=>'<span style="width:40px;height:40px;border-radius:50%;display:inline-grid;place-items:center;font-weight:700;position:relative;'+(cls?'background:#fbe5d6;outline:2px dashed #ed7d31':'background:#dae3f3')+'">'+t+(sup?'<sup style="position:absolute;top:-8px;right:-8px;background:#4472c4;color:#fff;font-size:12px;padding:1px 5px">×'+sup+'</sup>':'')+'</span>';
  orig.innerHTML=[...Array(m)].map((_,i)=>ball(i+1)).join(' ');
  function once(){const c=new Array(m).fill(0);for(let i=0;i<m;i++)c[Math.floor(r()*m)]++;n++;const o=c.filter(v=>v===0).length;sum+=o/m;return {c:c,o:o}}
  function show(res){samp.innerHTML=res.c.map((v,i)=>ball(i+1,v===0,v>1?v:0)).join(' ');setR(root,'n',n);setR(root,'o',res.o+' of 10');setR(root,'a',fmt(100*sum/n,1)+' %')}
  root.querySelector('[data-k="go"]').addEventListener('click',()=>show(once()));root.querySelector('[data-k="go100"]').addEventListener('click',()=>{let res;for(let i=0;i<100;i++)res=once();show(res)});show(once())};
function squares(svg,x,y,w,h,r,n){const cols=['#4472c4','#ed7d31','#ffc000','#70ad47','#5b9bd5'];for(let i=0;i<n;i++){const a=x+8+(w-26)*r(),b=y+8+(h-26)*r();E('rect',{x:a,y:b,width:14,height:14,fill:cols[Math.floor(r()*5)],transform:'rotate('+Math.floor(r()*40-20)+' '+(a+7)+' '+(b+7)+')'},svg)}}
FIG['bag-diagram']=root=>{const svg=initSvg(svgOf(root),600,400);const r=rng(5);
  E('rect',{x:190,y:10,width:200,height:90,rx:12,fill:'#f2f2f2',style:'stroke:#595959'},svg);squares(svg,190,10,200,90,r,26);T(svg,400,58,'Original dataset','lab','start');
  [40,230,440].forEach((x,k)=>{E('rect',{x:x,y:150,width:120,height:130,fill:'#fff',style:'stroke:#4472c4;stroke-width:1.5'},svg);squares(svg,x,150,120,95,r,12);
    E('rect',{x:x+10,y:250,width:100,height:24,fill:'#404040'},svg);T(svg,x+60,267,k===2?'Classifier K':'Classifier '+(k+1),'').style.fill='#fff';
    arrowPx(svg,290,100,x+60,148,'ln thin sb','fb');arrowPx(svg,x+60,282,300,338,'ln thin sb','fb')});
  T(svg,395,220,'· · · · · ·','lab big');T(svg,575,130,'Bootstrapping','lab','end');T(svg,575,300,'Aggregation','lab','end');
  E('rect',{x:240,y:340,width:120,height:28,fill:'#548235'},svg);T(svg,300,359,'Ensemble model','').style.fill='#fff'};
FIG['rf-vote']=root=>{const svg=initSvg(svgOf(root),560,330);E('rect',{x:230,y:6,width:100,height:24,fill:'#404040'},svg);T(svg,280,23,'DATASET','').style.fill='#fff';
  [90,280,470].forEach((cx,k)=>{arrowPx(svg,280,30,cx,58,'ln thin sk','fk');const nodes=[[cx,70],[cx-40,110],[cx+40,110],[cx-60,150],[cx-20,150],[cx+20,150],[cx+60,150]];
    [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]].forEach(([a,b])=>E('line',{x1:nodes[a][0],y1:nodes[a][1],x2:nodes[b][0],y2:nodes[b][1],class:'ln thin sk'},svg));
    nodes.forEach((p,i)=>E('circle',{cx:p[0],cy:p[1],r:8,fill:(i+k)%3===0?'#92d050':'#4472c4'},svg));T(svg,cx,182,'TREE '+(k===2?'N':k+1),'');T(svg,cx,210,'result '+(k===2?'N':k+1),'lab');
    arrowPx(svg,cx,216,cx<280?235:cx>280?325:280,262,'ln thin sk','fk')});
  E('rect',{x:170,y:264,width:220,height:26,fill:'#fff',style:'stroke:#404040'},svg);T(svg,280,282,'MAJORITY VOTE / AVERAGE','lab');arrowPx(svg,280,290,280,308,'ln thin sk','fk');
  E('rect',{x:220,y:308,width:120,height:22,fill:'#404040'},svg);T(svg,280,324,'FINAL RESULT','').style.fill='#fff'};
FIG['forest']=root=>{const tr=waveData(220,11,0.15),te=waveData(600,12,0.15);const r=rng(44);const single=buildTree(tr,20);const trees=[];
  for(let b=0;b<50;b++){const bs=[];for(let i=0;i<tr.length;i++)bs.push(tr[Math.floor(r()*tr.length)]);trees.push(buildTree(bs,20,rr=>[rr()<0.5?0:1],r))}
  const P=Plot(svgOf(root),{w:420,h:420,x:[0,1],y:[0,1],m:{l:10,r:10,t:10,b:10}});const N=36;const inp=q(root,'b');let mode='forest';const btns=root.querySelectorAll('.seg button');
  function prob(x,B){if(mode==='tree')return treeProb(single,x);let s=0;for(let b=0;b<B;b++)s+=treeProb(trees[b],x);return s/B}
  function draw(){const B=+inp.value;setV(root,'b',B);P.clear();for(let a=0;a<N;a++)for(let c=0;c<N;c++){const x=[(a+0.5)/N,(c+0.5)/N];const p=prob(x,B);const rc=P.rect(a/N,c/N,(a+1)/N,(c+1)/N,p>=0.5?'fb':'fo');rc.setAttribute('opacity',(0.08+0.4*Math.abs(p-0.5)*2).toFixed(2))}
    P.fn(x=>0.5+0.22*Math.sin(2*Math.PI*x),'ln thin sk dash',0,1);tr.forEach(p=>P.dot(p[0],p[1],3.2,'pt '+(p[2]?'fb':'fo')));
    const acc=te.filter(p=>(prob(p,B)>=0.5?1:0)===p[2]).length/te.length;setR(root,'acc',fmt(acc,3))}
  btns.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.m;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));inp.addEventListener('input',draw);draw()};
FIG['boost-diagram']=root=>{const svg=initSvg(svgOf(root),620,300);const r=rng(3);
  [0,1,2].forEach(k=>{const x=20+k*210;T(svg,x+70,18,k===0?'Original data':'Weighted data','lab');for(let i=0;i<24;i++){const big=k>0&&i%4===0;E('circle',{cx:x+20+120*r(),cy:30+60*r(),r:big?8:5,fill:['#c00000','#4472c4','#70ad47'][i%3],'fill-opacity':0.85},svg)}
    E('rect',{x:x+10,y:104,width:130,height:26,fill:'#7f7f7f'},svg);T(svg,x+75,122,'Classifier '+(k+1),'').style.fill='#fff';
    E('rect',{x:x+10,y:146,width:130,height:56,fill:'#fff',style:'stroke:#70ad47;stroke-width:1.5'},svg);T(svg,x+75,180,'✓ correct','');
    E('rect',{x:x+10,y:212,width:130,height:56,fill:'#fff',style:'stroke:#c00000;stroke-width:1.5'},svg);T(svg,x+75,246,'✗ mistakes: weight ↑','');
    if(k<2)arrowPx(svg,x+142,240,x+220,60,'ln thin sm','fm')});T(svg,310,292,'Each model learns from the mistakes of the previous one. Then combine them all.','','middle')};
FIG['adaboost']=root=>{const svg=initSvg(svgOf(root),620,250);const r=rng(21);const pts=[];for(let i=0;i<16;i++){const x=r(),y=r();pts.push([x,y,(x+y>1.05)?1:0])}
  const panel=(k,title,lines,big)=>{const P=Plot(svg,{at:[k*155,20],w:150,h:190,x:[0,1],y:[0,1],m:{l:6,r:6,t:6,b:6}});P.rect(0,0,1,1,'fw',P.bg);P.axes({grid:false});T(P.root,75,-6,title,'','middle');
    lines.forEach(l=>P.line(l[0],l[1],l[2],l[3],'ln sk dash'));pts.forEach((p,i)=>P.dot(p[0],p[1],big&&big.includes(i)?7:4,p[2]?'fr':'fgr'))};
  const wrong1=pts.map((p,i)=>[i,(p[0]>0.55?1:0)!==p[2]]).filter(z=>z[1]).map(z=>z[0]);
  panel(0,'Weak learner #1',[[0.55,0,0.55,1]]);panel(1,'Re-weighted data',[],wrong1);panel(2,'Weak learner #2',[[0,0.5,1,0.5]],wrong1);panel(3,'Strong learner',[[0,1.05,1.05,0]]);
  T(svg,310,240,'Stumps (one split each); weights grow on the misclassified points; the final vote is weighted.','','middle')};
FIG['boost']=root=>{const r=rng(9);const f0=x=>Math.sin(2*Math.PI*x)+0.6*x;const tr=[],va=[];for(let i=0;i<60;i++){const x=r();tr.push([x,f0(x)+0.3*randn(r)])}for(let i=0;i<300;i++){const x=r();va.push([x,f0(x)+0.3*randn(r)])}
  const grid=[...Array(201)].map((_,i)=>i/200);
  function fitTree(xs,rs,depth){const idx=xs.map((_,i)=>i).sort((a,b)=>xs[a]-xs[b]);
    function rec(ids,d){const mean=ids.reduce((s,i)=>s+rs[i],0)/ids.length;if(d===0||ids.length<4)return {v:mean};let best=null,sl=0,sl2=0;const tot=ids.reduce((s,i)=>s+rs[i],0),tot2=ids.reduce((s,i)=>s+rs[i]*rs[i],0);
      for(let k=1;k<ids.length;k++){const v=rs[ids[k-1]];sl+=v;sl2+=v*v;if(xs[ids[k]]===xs[ids[k-1]])continue;const nl=k,nr=ids.length-k;const sse=(sl2-sl*sl/nl)+((tot2-sl2)-(tot-sl)**2/nr);if(!best||sse<best.sse)best={sse:sse,k:k}}
      if(!best)return {v:mean};const t=(xs[ids[best.k-1]]+xs[ids[best.k]])/2;return {t:t,L:rec(ids.slice(0,best.k),d-1),R:rec(ids.slice(best.k),d-1)}}
    const tree=rec(idx,depth);return x=>{let nd=tree;while(nd.t!==undefined)nd=x<=nd.t?nd.L:nd.R;return nd.v}}
  const cache={};function seq(nu){if(cache[nu])return cache[nu];const ybar=tr.reduce((s,p)=>s+p[1],0)/tr.length;const Ft=tr.map(()=>ybar),Fv=va.map(()=>ybar),Fg=grid.map(()=>ybar);
    const mse=(F,D)=>F.reduce((s,v,i)=>s+(v-D[i][1])**2,0)/D.length;const out={g:[Fg.slice()],et:[mse(Ft,tr)],ev:[mse(Fv,va)]};const xs=tr.map(p=>p[0]);
    for(let t=1;t<=200;t++){const rs=tr.map((p,i)=>p[1]-Ft[i]);const h=fitTree(xs,rs,2);for(let i=0;i<Ft.length;i++)Ft[i]+=nu*h(tr[i][0]);for(let i=0;i<Fv.length;i++)Fv[i]+=nu*h(va[i][0]);for(let i=0;i<Fg.length;i++)Fg[i]+=nu*h(grid[i]);
      out.g.push(Fg.slice());out.et.push(mse(Ft,tr));out.ev.push(mse(Fv,va))}cache[nu]=out;return out}
  const svg=initSvg(svgOf(root),620,320);const P=Plot(svg,{at:[0,0],w:380,h:320,x:[0,1],y:[-1.8,2.2],m:{l:36,r:8,t:12,b:36}});P.axes({xt:[0,0.5,1],yt:[-1,0,1,2],xl:'x',yl:'y'});P.fn(f0,'ln thin sm dash',0,1,200,P.bg);
  const Q=Plot(svg,{at:[390,0],w:230,h:320,x:[0,200],y:[0,0.7],m:{l:40,r:8,t:12,b:36}});Q.axes({xt:[0,100,200],yt:[0,0.35,0.7],xl:'trees M',yl:'MSE'});const bgG=E('g',{},Q.dyn),mk=E('g',{},Q.dyn);
  let nu=0.3;const inp=q(root,'m');const btns=root.querySelectorAll('.seg button');
  function curves(){const s=seq(nu);bgG.innerHTML='';Q.path(s.et.map((v,i)=>[i,v]),'ln sb',bgG);Q.path(s.ev.map((v,i)=>[i,v]),'ln so',bgG);let bm=0;s.ev.forEach((v,i)=>{if(v<s.ev[bm])bm=i});setR(root,'bm',bm)}
  function draw(){const M=+inp.value;setV(root,'m',M);const s=seq(nu);P.clear();tr.forEach(p=>P.dot(p[0],p[1],4,'pt fb'));P.path(grid.map((x,i)=>[x,s.g[M][i]]),'ln sr');
    mk.innerHTML='';Q.line(M,0,M,0.7,'ln thin sm',mk);Q.dot(M,s.et[M],5,'fb',mk);Q.dot(M,Math.min(s.ev[M],0.7),5,'fo',mk);setR(root,'tr',fmt(s.et[M],3));setR(root,'va',fmt(s.ev[M],3))}
  btns.forEach(b=>b.addEventListener('click',()=>{nu=+b.dataset.nu;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));curves();draw()}));inp.addEventListener('input',draw);curves();draw()};
})();
