/* Figures for extra/02_clustering.html (clustering). Uses ../assets/figures.js (MLFIG), ../neural_networks/assets/nn-core.js (MLNN)
   and clustering-data.js (CLDATA: the lab's datasets and results, exported by executing the lab notebook).
   The six points p1..p6, the 1-D linkage example and the 12-point labelling are the ones of the notebook. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,q,setV,svgOf}=lib;const {heat,TT,box,stepper,segs}=window.MLNN;
const CD=window.CLDATA;

/* ---------- helpers ---------- */
const PAL=['#4472c4','#ed7d31','#70ad47','#7030a0','#bf9000','#c00000','#5b9bd5','#e377c2','#843c0c','#264478'];
const RGB=PAL.map(h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
const NOISE='#b4b4b4';
const LC='0123456789abcdefghijklmnopqrstuvwxyz';
const labs=s=>[...s].map(c=>c==='-'?-1:LC.indexOf(c));
const col=l=>l<0?NOISE:PAL[l%PAL.length];
const nf=(v,d)=>{d=d===undefined?2:d;if(Math.abs(v)<0.5*Math.pow(10,-d))v=0;return v.toFixed(d).replace('-','−')};
const ln=(svg,a,b,c,w,dash)=>E('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:c||'#9aa5b8','stroke-width':w||1.6,'stroke-dasharray':dash||''},svg);
const dot=(svg,x,y,r,fill,stroke,sw)=>E('circle',{cx:x,cy:y,r:r,fill:fill,stroke:stroke||'none','stroke-width':sw===undefined?1:sw},svg);
const halo=t=>{t.setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round');return t};
const lab=(svg,x,y,s,cls,anchor,fill)=>{const t=T(svg,x,y,s,cls||'',anchor);if(fill)t.style.fill=fill;return t};
function onInput(root,k,draw){const inp=q(root,k);inp.addEventListener('input',draw);draw();return inp}
const sq=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2;
const dist=(a,b)=>Math.sqrt(sq(a,b));
/* a data frame inside a pixel box: equal aspect by default */
function frame(P,x0,y0,w,h,o){o=o||{};let a,b,c,d;if(o.bounds)[a,b,c,d]=o.bounds;else{a=Infinity;b=-Infinity;c=Infinity;d=-Infinity;P.forEach(p=>{a=Math.min(a,p[0]);b=Math.max(b,p[0]);c=Math.min(c,p[1]);d=Math.max(d,p[1])})}
  const pad=o.pad===undefined?0.05:o.pad;const dx=(b-a)||1,dy=(d-c)||1;a-=pad*dx;b+=pad*dx;c-=pad*dy;d+=pad*dy;
  let sx=w/(b-a),sy=h/(d-c);if(o.equal!==false){const s=Math.min(sx,sy);sx=sy=s}
  const ox=x0+(w-(b-a)*sx)/2,oy=y0+(h-(d-c)*sy)/2;
  return {X:v=>ox+(v-a)*sx,Y:v=>oy+(d-v)*sy,s:Math.min(sx,sy),box:[a,b,c,d],px:[ox,oy,(b-a)*sx,(d-c)*sy],P:p=>[ox+(p[0]-a)*sx,oy+(d-p[1])*sy]}}
function cross(svg,x,y,r,c){E('path',{d:`M${x-r},${y-r}L${x+r},${y+r}M${x-r},${y+r}L${x+r},${y-r}`,stroke:c||NOISE,'stroke-width':1.4},svg)}
/* points coloured by labels (or by a colour function); noise as crosses */
function pts(svg,F,X,L,o){o=o||{};const r=o.r||3;X.forEach((p,i)=>{const l=L?L[i]:0;const x=F.X(p[0]),y=F.Y(p[1]);
  if(L&&l<0){cross(svg,x,y,r*0.85,NOISE);return}const c=o.color?o.color(i):(L?col(l):(o.fill||'#7f7f7f'));dot(svg,x,y,r,c,o.stroke||'#fff',o.sw===undefined?0.6:o.sw)})}
function cmark(svg,x,y,c,s){s=s||8;E('path',{d:`M${x-s},${y-s}L${x+s},${y+s}M${x-s},${y+s}L${x+s},${y-s}`,stroke:'#1f1f1f','stroke-width':5.5,'stroke-linecap':'round'},svg);
  E('path',{d:`M${x-s},${y-s}L${x+s},${y+s}M${x-s},${y+s}L${x+s},${y-s}`,stroke:c||'#fff','stroke-width':3,'stroke-linecap':'round'},svg)}
function rect(svg,F,fill,stroke){const [x,y,w,h]=F.px;return E('rect',{x:x,y:y,width:w,height:h,fill:fill||'#fff',stroke:stroke||'#d0d0d0','stroke-width':1},svg)}
/* Voronoi cells of centroids C inside the data box: clip the box by the bisector half-planes */
function clipPoly(P,a,b,c){const out=[];for(let i=0;i<P.length;i++){const A=P[i],B=P[(i+1)%P.length];const fa=a*A[0]+b*A[1]-c,fb=a*B[0]+b*B[1]-c;
  if(fa<=0)out.push(A);if((fa<0&&fb>0)||(fa>0&&fb<0)){const t=fa/(fa-fb);out.push([A[0]+t*(B[0]-A[0]),A[1]+t*(B[1]-A[1])])}}return out}
function voronoi(C,bx){return C.map((ci,i)=>{let P=[[bx[0],bx[2]],[bx[1],bx[2]],[bx[1],bx[3]],[bx[0],bx[3]]];
  C.forEach((cj,j)=>{if(j===i)return;P=clipPoly(P,cj[0]-ci[0],cj[1]-ci[1],(cj[0]**2+cj[1]**2-ci[0]**2-ci[1]**2)/2)});return P})}
function drawCells(svg,F,C,o){o=o||{};voronoi(C,F.box).forEach((P,i)=>{if(P.length<3)return;E('polygon',{points:P.map(p=>F.P(p).map(v=>v.toFixed(1)).join(',')).join(' '),fill:o.fill?o.fill(i):PAL[i%10],'fill-opacity':o.op===undefined?0.12:o.op,stroke:'#7f7f7f','stroke-width':1},svg)})}
const nearest=(x,C)=>{let b=0,bd=Infinity;C.forEach((c,j)=>{const d=sq(x,c);if(d<bd){bd=d;b=j}});return b};
const mixCol=g=>{let r=0,gg=0,b=0;g.forEach((w,j)=>{r+=w*RGB[j][0];gg+=w*RGB[j][1];b+=w*RGB[j][2]});return `rgb(${Math.round(r)},${Math.round(gg)},${Math.round(b)})`};
/* 2x2 covariance -> ellipse (n sigma) in a frame with equal aspect */
function ellipse(svg,F,mu,S,c,o){o=o||{};const a=S[0][0],b=S[0][1],d=S[1][1];const tr=(a+d)/2,dt=Math.sqrt(((a-d)/2)**2+b*b);const l1=tr+dt,l2=Math.max(tr-dt,1e-9);
  const ang=Math.abs(b)<1e-12?(a>=d?0:Math.PI/2):Math.atan2(l1-a,b);const ns=o.nsig||2;const cx=F.X(mu[0]),cy=F.Y(mu[1]);
  E('ellipse',{cx:cx,cy:cy,rx:ns*Math.sqrt(l1)*F.s,ry:ns*Math.sqrt(l2)*F.s,transform:`rotate(${(-ang*180/Math.PI).toFixed(2)} ${cx.toFixed(1)} ${cy.toFixed(1)})`,fill:'none',stroke:c,'stroke-width':o.w||2.4,'stroke-dasharray':o.dash||''},svg)}
function gpdf(x,mu,S){const a=S[0][0],b=S[0][1],d=S[1][1];const det=a*d-b*b;const u=x[0]-mu[0],v=x[1]-mu[1];return Math.exp(-0.5*(d*u*u-2*b*u*v+a*v*v)/det)/(2*Math.PI*Math.sqrt(det))}
function panelBox(svg,x,y,w,h,title,hi){E('rect',{x:x,y:y,width:w,height:h,rx:8,fill:hi?'#f5f8fd':'#fafafa',stroke:hi?'#4472c4':'#d0d0d0','stroke-width':hi?1.6:1},svg);if(title)lab(svg,x+w/2,y+22,title,'lab')}
/* toy generators for the illustrative pictures */
function blob(r,cx,cy,s,n){return [...Array(n)].map(()=>[cx+s*randn(r),cy+s*randn(r)])}
function moons(r,n,noise){const A=[];for(let i=0;i<n;i++){const t=Math.PI*r();if(i%2===0)A.push([Math.cos(t)+noise*randn(r),Math.sin(t)+noise*randn(r),0]);else A.push([1-Math.cos(t)+noise*randn(r),0.5-Math.sin(t)+noise*randn(r),1])}return A}

/* six points of the worked examples */
const X6=[[1,1],[2,1],[1,2],[5,4],[6,5],[5,6]],N6=['p1','p2','p3','p4','p5','p6'];

/* ---------- where we are ---------- */
FIG['cl-where']=root=>{const svg=initSvg(svgOf(root),1160,230);const r=rng(3);
  const P=[].concat(blob(r,-1.6,0.9,0.42,26).map(p=>[p[0],p[1],0,0]),blob(r,0.3,-0.9,0.45,26).map(p=>[p[0],p[1],1,0]),blob(r,1.6,1.0,0.42,26).map(p=>[p[0],p[1],2,1]));
  const W=360,G=40;const titles=['supervised: learn y from x','unsupervised: only x','clustering: find the groups'];
  for(let k=0;k<3;k++){const x0=k*(W+G);panelBox(svg,x0+2,4,W-4,222,titles[k],k===2);const F=frame(P,x0+20,36,W-40,180,{pad:0.08});
    if(k===0){/* two classes and a boundary */const cls=p=>p[3];
      ln(svg,[F.X(0.5),F.Y(2.0)],[F.X(1.55),F.Y(-2.0)],'#1f1f1f',2,'7 5');
      P.forEach(p=>{const x=F.X(p[0]),y=F.Y(p[1]);if(cls(p))E('rect',{x:x-3.6,y:y-3.6,width:7.2,height:7.2,fill:PAL[1],stroke:'#fff','stroke-width':0.6},svg);else dot(svg,x,y,3.8,PAL[0],'#fff',0.6)});
      halo(lab(svg,F.X(1.75),F.Y(-1.55),'y = class','', 'middle','#595959'))}
    else if(k===1){P.forEach(p=>dot(svg,F.X(p[0]),F.Y(p[1]),3.8,'#8c8c8c','#fff',0.6))}
    else{const C=[0,1,2].map(j=>{const m=P.filter(p=>p[2]===j);return [m.reduce((s,p)=>s+p[0],0)/m.length,m.reduce((s,p)=>s+p[1],0)/m.length]});
      P.forEach(p=>dot(svg,F.X(p[0]),F.Y(p[1]),3.8,PAL[[0,2,3][p[2]]],'#fff',0.6));C.forEach((c,j)=>cmark(svg,F.X(c[0]),F.Y(c[1]),PAL[[0,2,3][j]],7))}
    if(k<2)arrowPx(svg,x0+W+4,115,x0+W+G-6,115,'ln thin sk','fk')}};

/* ---------- application cards ---------- */
FIG['cl-app']=root=>{const svg=initSvg(svgOf(root),350,110);const k=root.dataset.app;const r=rng(k.length*7+3);
  if(k==='seg'){const G=[[60,50,'young urban'],[175,62,'families'],[290,48,'seniors']];G.forEach(([cx,cy,t],j)=>{for(let i=0;i<16;i++)dot(svg,cx+16*randn(r),cy+11*randn(r),3.4,PAL[[1,2,0][j]],'#fff',0.6);lab(svg,cx,104,t,'')})}
  else if(k==='docs'){for(let i=0;i<6;i++){const x=14+(i%2)*34,y=10+Math.floor(i/2)*32;E('rect',{x:x,y:y,width:26,height:28,fill:'#fff',stroke:'#7f7f7f'},svg);[0,1,2].forEach(l=>ln(svg,[x+5,y+7+l*7],[x+(l===2?14:21),y+7+l*7],'#9a9a9a',1.3))}
    arrowPx(svg,90,55,128,55,'ln thin sk','fk');[['glass',PAL[0]],['theft',PAL[1]],['water',PAL[2]]].forEach(([t,c],j)=>{const x=148+j*68;for(let s=0;s<3;s++)E('rect',{x:x+s*4,y:22+s*5,width:30,height:34,fill:'#fff',stroke:c,'stroke-width':1.6},svg);lab(svg,x+19,86,t,'','middle',c)})}
  else if(k==='quant'){for(let i=0;i<30;i++){const t=i/29;E('rect',{x:10+i*4.6,y:24,width:4.8,height:44,fill:`hsl(${Math.round(20+200*t)},${55+25*Math.sin(7*t)}%,${42+18*Math.cos(5*t)}%)`},svg)}
    lab(svg,79,90,'100,000 colours','');arrowPx(svg,156,46,190,46,'ln thin sk','fk');['#b46a3c','#6d8a4a','#5a7fae','#d8c9a6'].forEach((c,i)=>E('rect',{x:204+i*34,y:24,width:32,height:44,fill:c,stroke:'#fff'},svg));lab(svg,272,90,'k = 4: 2 bits per pixel','')}
  else if(k==='label'){[[60,52],[175,40],[290,56]].forEach(([cx,cy],j)=>{for(let i=0;i<14;i++)dot(svg,cx+15*randn(r),cy+12*randn(r),3.2,'#a6a6a6','#fff',0.6);dot(svg,cx,cy,6,PAL[[0,1,2][j]],'#1f1f1f',1.2);
      halo(lab(svg,cx,cy-16,['claim','quote','complaint'][j],'', 'middle',PAL[[0,1,2][j]]))});lab(svg,175,104,'label 3 points, propagate to 42','')}
  else if(k==='anom'){for(let i=0;i<40;i++)dot(svg,120+28*randn(r),55+16*randn(r),3.2,PAL[0],'#fff',0.6);[[250,22],[292,74],[40,88]].forEach(([x,y])=>{dot(svg,x,y,5.5,'#c00000','#fff',1);lab(svg,x+12,y+5,'?','lab','start','#c00000')});lab(svg,120,104,'dense: normal','')}
  else if(k==='emb'){for(let i=0;i<3;i++){const y=14+i*30;E('rect',{x:12,y:y,width:24,height:24,fill:['#dae3f3','#fbe5d6','#e2f0d9'][i],stroke:'#7f7f7f'},svg);E('circle',{cx:24,cy:y+12,r:6,fill:PAL[i]},svg)}
    arrowPx(svg,46,52,84,52,'ln thin sk','fk');box(svg,88,36,64,32,'network','#f2f2f2',{cls:''});arrowPx(svg,156,52,190,52,'ln thin sk','fk');
    [[230,30],[300,40],[262,82]].forEach(([cx,cy],j)=>{for(let i=0;i<12;i++)dot(svg,cx+11*randn(r),cy+8*randn(r),3,PAL[j],'#fff',0.5)});lab(svg,262,106,'vectors, then clusters','')}};

/* ---------- three notions of cluster ---------- */
FIG['cl-kinds']=root=>{const svg=initSvg(svgOf(root),1160,255);const r=rng(9);const W=372,G=22;
  const titles=['compact: close to a centre','connected: chains of neighbours','dense: dense regions, noise between'];
  titles.forEach((t,k)=>panelBox(svg,k*(W+G)+2,4,W-4,246,t,false));
  /* compact */let x0=0;const cs=[[-1.3,0.6],[1.2,0.9],[0,-1.1]];const B=[];cs.forEach((c,j)=>blob(r,c[0],c[1],0.38,24).forEach(p=>B.push([p[0],p[1],j])));
  let F=frame(B,x0+24,40,W-48,200,{pad:0.1});cs.forEach((c,j)=>{E('circle',{cx:F.X(c[0]),cy:F.Y(c[1]),r:0.85*F.s,fill:PAL[j],'fill-opacity':0.08,stroke:PAL[j],'stroke-dasharray':'5 4'},svg)});
  B.forEach(p=>dot(svg,F.X(p[0]),F.Y(p[1]),3.4,PAL[p[2]],'#fff',0.6));cs.forEach((c,j)=>cmark(svg,F.X(c[0]),F.Y(c[1]),PAL[j],6));
  /* connected: two moons with nearest-neighbour edges */x0=W+G;const M=moons(r,90,0.06);F=frame(M,x0+24,40,W-48,200,{pad:0.06});
  M.forEach((p,i)=>{const d=M.map((q2,j)=>[sq(p,q2),j]).filter(a=>a[1]!==i).sort((a,b)=>a[0]-b[0]).slice(0,2);d.forEach(([dd,j])=>{if(M[j][2]===p[2])ln(svg,F.P(p),F.P(M[j]),'#c9d1de',1.2)})});
  M.forEach(p=>dot(svg,F.X(p[0]),F.Y(p[1]),3.4,PAL[p[2]===0?0:1],'#fff',0.6));
  /* dense */x0=2*(W+G);const D=[];blob(r,-0.9,0.3,0.32,40).forEach(p=>D.push([p[0],p[1],0]));for(let i=0;i<45;i++){const t=-0.3+2.2*r();D.push([0.9+0.55*Math.cos(t)+0.09*randn(r),-0.2+0.9*Math.sin(t)+0.09*randn(r),1])}
  for(let i=0;i<16;i++)D.push([-2+4*r(),-1.5+3*r(),-1]);F=frame(D,x0+24,40,W-48,200,{pad:0.06});
  D.forEach(p=>{if(p[2]<0)cross(svg,F.X(p[0]),F.Y(p[1]),3.2,'#8c8c8c');else dot(svg,F.X(p[0]),F.Y(p[1]),3.4,PAL[p[2]===0?2:3],'#fff',0.6)})};

/* ---------- units: the policyholders ---------- */
FIG['cl-scale']=root=>{const svg=svgOf(root);const P=CD.pol;const n=P.age.length;
  const mean=a=>a.reduce((s,v)=>s+v,0)/a.length,sd=a=>{const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length)};
  const ma=mean(P.age),sa=sd(P.age),mp=mean(P.prem),sp=sd(P.prem);
  const ABC=[[25,800,'a'],[62,820,'b'],[26,1100,'c']];
  const draw=u=>{const tx=u==='std'?(a=>(a-ma)/sa):(a=>a),ty=u==='std'?(p=>(p-mp)/sp):u==='keur'?(p=>p/1000):(p=>p);
    const xr=u==='std'?[-1.9,2.2]:[12,76],yr=u==='std'?[-1.95,1.95]:u==='keur'?[0.22,1.58]:[220,1580];
    const Pl=Plot(svg,{w:620,h:380,x:xr,y:yr,m:{l:64,r:14,t:34,b:44}});
    const xt=u==='std'?[-1.5,-0.5,0.5,1.5]:[20,30,40,50,60,70],yt=u==='std'?[-1.5,-0.5,0.5,1.5]:u==='keur'?[0.4,0.8,1.2]:[400,800,1200];
    Pl.axes({xt:xt,yt:yt,fx:v=>nf(v,u==='std'?1:0),fy:v=>u==='keur'?v.toFixed(1):u==='std'?nf(v,1):String(v),xl:u==='std'?'age (standardised)':'age (years)',yl:u==='std'?'premium (standardised)':u==='keur'?'premium (k€)':'premium (€)'});
    let L=P.lab[u];if(L[0]!==0)L=L.map(v=>1-v);
    for(let i=0;i<n;i++){const c=Pl.dot(tx(P.age[i]),ty(P.prem[i]),3.6,'pt');c.setAttribute('fill',PAL[L[i]])}
    ABC.forEach(([a,p,t])=>{const c=Pl.dot(tx(a),ty(p),7,'');c.setAttribute('fill','#fff');c.setAttribute('stroke','#1f1f1f');c.setAttribute('stroke-width','2.5');halo(Pl.text(tx(a),ty(p),t,'lab','start',10,-8))});
    T(Pl.top,342,22,'k-means, k = 2 · ARI with the age groups = '+P.ari[u].toFixed(2),'lab')};
  const cur=segs(root,'u',draw);draw(cur()||'eur')};

/* ---------- the objective: six points ---------- */
FIG['cl-wcss']=root=>{const svg=initSvg(svgOf(root),480,400);const L=[0,0,0,1,1,1],C=[[4/3,4/3],[16/3,5]];
  const F=frame([[0,0],[7,7]],18,34,284,330,{pad:0});rect(svg,F,'#fff','#e3e3e3');
  for(let v=1;v<7;v++){ln(svg,[F.X(v),F.Y(0)],[F.X(v),F.Y(7)],'#f0f0f0',1);ln(svg,[F.X(0),F.Y(v)],[F.X(7),F.Y(v)],'#f0f0f0',1)}
  X6.forEach((p,i)=>ln(svg,F.P(p),F.P(C[L[i]]),PAL[L[i]],1.6,'5 4'));X6.forEach((p,i)=>dot(svg,F.X(p[0]),F.Y(p[1]),7,PAL[L[i]],'#fff',1.2));
  C.forEach((c,j)=>cmark(svg,F.X(c[0]),F.Y(c[1]),PAL[j],8));
  const off=[[-12,18],[10,18],[-12,-10],[10,16],[12,4],[12,-6]];X6.forEach((p,i)=>halo(lab(svg,F.X(p[0])+off[i][0],F.Y(p[1])+off[i][1],N6[i],'',off[i][0]<0?'end':'start')));
  halo(lab(svg,F.X(C[0][0])+14,F.Y(C[0][1])-12,'μ₁','lab','start',PAL[0]));halo(lab(svg,F.X(C[1][0])-14,F.Y(C[1][1])-12,'μ₂','lab','end',PAL[1]));
  lab(svg,160,22,'the best split: centroids = cluster means','lab');
  const tx=318;lab(svg,tx,64,'point','lab','start');lab(svg,470,64,'‖x − μ‖²','lab','end');ln(svg,[tx,72],[472,72],'#7f7f7f',1);let J=0;
  X6.forEach((p,i)=>{const d=sq(p,C[L[i]]);J+=d;const y=96+i*28;lab(svg,tx,y,N6[i]+' → μ'+(L[i]+1),'','start',PAL[L[i]]);lab(svg,470,y,nf(d,3),'','end')});
  ln(svg,[tx,272],[472,272],'#7f7f7f',1);lab(svg,tx,298,'J','lab','start');lab(svg,470,298,nf(J,3),'lab','end');
  lab(svg,395,330,'any other centroids','');lab(svg,395,350,'or split: larger J','')};

/* ---------- Lloyd with numbers ---------- */
FIG['cl-lloyd6']=root=>{const svg=svgOf(root);
  const upd=(L,C)=>C.map((c,j)=>{const m=X6.filter((_,i)=>L[i]===j);return m.length?[m.reduce((s,p)=>s+p[0],0)/m.length,m.reduce((s,p)=>s+p[1],0)/m.length]:c});
  const C0=[[1,1],[2,1]];const L1=X6.map(p=>nearest(p,C0));const C1=upd(L1,C0);const L2=X6.map(p=>nearest(p,C1));const C2=upd(L2,C1);const L3=X6.map(p=>nearest(p,C2));
  const S=[{C:C0,L:null,t:'start: μ₁ = (1, 1), μ₂ = (2, 1)'},{C:C0,L:L1,t:'1 · assign to the nearest centroid',a:1},{C:C1,L:L1,prev:C0,t:'1 · update: centroid = mean of its points'},
           {C:C1,L:L2,t:'2 · assign: p2 changes cluster',a:1},{C:C2,L:L2,prev:C1,t:'2 · update'},{C:C2,L:L3,t:'3 · assign: no change, stop',a:1}];
  stepper(root,s=>{initSvg(svg,620,380);const st=S[s];const F=frame([[0,0],[7,7]],12,40,300,326,{pad:0});
    drawCells(svg,F,st.C,{op:0.13});E('rect',{x:F.px[0],y:F.px[1],width:F.px[2],height:F.px[3],fill:'none',stroke:'#d0d0d0'},svg);
    lab(svg,310,22,st.t,'lab');
    if(st.prev)st.C.forEach((c,j)=>{if(sq(c,st.prev[j])>1e-9)arrowPx(svg,F.X(st.prev[j][0]),F.Y(st.prev[j][1]),F.X(c[0]),F.Y(c[1]),'ln thin sk','fk')});
    X6.forEach((p,i)=>dot(svg,F.X(p[0]),F.Y(p[1]),7,st.L?PAL[st.L[i]]:'#8c8c8c','#fff',1.2));
    const off=[[-10,20],[10,20],[-12,-8],[12,18],[12,4],[12,-6]];X6.forEach((p,i)=>halo(lab(svg,F.X(p[0])+off[i][0],F.Y(p[1])+off[i][1],N6[i],'',off[i][0]<0?'end':'start')));
    st.C.forEach((c,j)=>cmark(svg,F.X(c[0]),F.Y(c[1]),PAL[j],8));
    /* table: squared distances to both centroids */const tx=338;lab(svg,tx,70,'point','lab','start');TT(svg,500,70,'‖x − μ_1‖²','lab','middle');TT(svg,584,70,'‖x − μ_2‖²','lab','middle');ln(svg,[tx,78],[616,78],'#7f7f7f',1);
    let J=0;X6.forEach((p,i)=>{const d=st.C.map(c=>sq(p,c));const y=104+i*30;const L=st.L?st.L[i]:null;lab(svg,tx,y,N6[i]+' ('+p[0]+', '+p[1]+')','','start');
      d.forEach((v,j)=>{const on=L===j;if(on&&st.a)E('rect',{x:[462,546][j],y:y-17,width:76,height:24,rx:4,fill:PAL[j],'fill-opacity':0.18,stroke:PAL[j]},svg);lab(svg,[500,584][j],y,nf(v,2),on?'lab':'','middle',on?'#1f1f1f':'#8c8c8c')});if(L!==null)J+=d[L]});
    ln(svg,[tx,284],[616,284],'#7f7f7f',1);if(st.L){lab(svg,tx,310,'J = '+String(+J.toFixed(2)),'lab big','start')}else lab(svg,tx,310,'no assignment yet','','start');
    lab(svg,tx,340,st.L?(st.a?'shaded: the nearest centroid':'distances to the new centroids'):'two Voronoi cells: left and right','','start')})};

/* ---------- Voronoi cells and bad starts (four blobs) ---------- */
FIG['cl-voronoi']=root=>{const svg=svgOf(root);const X=CD.X4;let init='bad';
  function draw(){const it=+q(root,'it').value;setV(root,'it',it);initSvg(svg,620,390);const R=CD.vor[init];const last=R.C.length-1;const t=Math.min(it,last);const C=R.C[t];
    const F=frame(X,8,34,604,350,{pad:0.04});drawCells(svg,F,C,{op:0.12});
    const L=X.map(p=>nearest(p,C));pts(svg,F,X,L,{r:3.6});
    for(let j=0;j<C.length;j++){const tr=R.C.slice(0,t+1).map(c=>F.P(c[j]));if(tr.length>1)E('polyline',{points:tr.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' '),fill:'none',stroke:'#1f1f1f','stroke-width':1.6,'stroke-dasharray':'4 3'},svg);
      const s0=F.P(R.C[0][j]);dot(svg,s0[0],s0[1],6,'none','#1f1f1f',1.6)}
    C.forEach((c,j)=>cmark(svg,F.X(c[0]),F.Y(c[1]),PAL[j],8));
    const J=R.J[2*t];const msg=(init==='bad'?'random start':'k-means++ start')+' · '+(t===0?'start':t+(t===1?' update':' updates'))+' · J = '+J.toFixed(1)+(it>=last?(J>1.01*CD.vor.Jbest?' · stuck: a local minimum':' · converged: the best J'):'');
    halo(lab(svg,310,22,msg,'lab'))}
  segs(root,'init',v=>{init=v;draw()});onInput(root,'it',draw)};

/* ---------- k-means++ draws (nine blobs) ---------- */
FIG['cl-kpp']=root=>{const svg=svgOf(root);const K=CD.kpp;const X=K.X;const G=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)G.push([3*i,3*j]);const blobOf=X.map(p=>nearest(p,G));
  stepper(root,s=>{initSvg(svg,620,390);const F=frame(X,8,34,604,350,{pad:0.03});const C=K.idx.slice(0,s).map(i=>X[i]);
    let P=null;if(s>=1&&s<9){const D2=X.map(p=>Math.min(...C.map(c=>sq(p,c))));const Z=D2.reduce((a,b)=>a+b,0);P=D2.map(v=>v/Z)}
    const pm=P?Math.max(...P):1;
    X.forEach((p,i)=>{const x=F.X(p[0]),y=F.Y(p[1]);if(P){const t=Math.sqrt(P[i]/pm);dot(svg,x,y,2.2+3.2*t,heat(0.12+0.88*t,true),'#fff',0.4)}else dot(svg,x,y,3,s===9?col(nearest(p,C)):'#8c8c8c','#fff',0.5)});
    C.forEach((c,j)=>{cmark(svg,F.X(c[0]),F.Y(c[1]),'#fff',7);halo(lab(svg,F.X(c[0])+11,F.Y(c[1])-9,String(j+1),'lab','start'))});
    let msg;if(s===0)msg='450 points in 9 blobs; no centre yet';else if(s===9)msg='9 centres, one per blob · after Lloyd: J = '+K.Jend.toFixed(1)+', the best';
    else{const covered=new Set(K.idx.slice(0,s).map(i=>blobOf[i]));let m=0;P.forEach((v,i)=>{if(!covered.has(blobOf[i]))m+=v});msg=s+(s===1?' centre':' centres')+' · P(next centre in a blob without one) = '+m.toFixed(2)}
    halo(lab(svg,310,22,msg,'lab'))})};
FIG['cl-kpp-hist']=root=>{const K=CD.kpp;const b=K.bins;const nb=b.length-1;const mx=Math.max(...K.hist.random,...K.hist['k-means++']);
  const Pl=Plot(svgOf(root),{w:480,h:170,x:[1,3.2],y:[0,mx*1.08],m:{l:44,r:10,t:10,b:38}});Pl.axes({xt:[1,1.5,2,2.5,3],yt:[0,50,100],fx:v=>v.toFixed(1),xl:'final J / best J (200 runs each)'});
  for(let i=0;i<nb;i++){const w=(b[i+1]-b[i])/2;[['random','#a5a5a5',0],['k-means++',PAL[0],1]].forEach(([k,c,o])=>{const v=K.hist[k][i];if(!v)return;const r2=Pl.rect(b[i]+o*w,0,b[i]+(o+1)*w,v,'');r2.setAttribute('fill',c)})}
  E('rect',{x:300,y:14,width:12,height:12,fill:'#a5a5a5'},Pl.top);T(Pl.top,318,25,'random: best in '+K.ok.random+' %','','start');E('rect',{x:300,y:34,width:12,height:12,fill:PAL[0]},Pl.top);T(Pl.top,318,45,'k-means++: '+K.ok['k-means++']+' %','','start')};

/* ---------- choosing k ---------- */
FIG['cl-choosek']=root=>{const svg=svgOf(root);const X=CD.X4;const CK=CD.choosek;
  onInput(root,'k',()=>{const k=+q(root,'k').value;setV(root,'k',k);initSvg(svg,620,380);const F=frame(X,4,34,370,340,{pad:0.04});rect(svg,F,'#fff','#e3e3e3');
    pts(svg,F,X,labs(CK.lab[k]),{r:3.4});CK.C[k].forEach((c,j)=>cmark(svg,F.X(c[0]),F.Y(c[1]),PAL[j],7));halo(lab(svg,190,22,'k = '+k+' · J = '+CK.J[k-1].toFixed(1)+(k>1?' · silhouette '+CK.sil[k-2].toFixed(3):''),'lab'));
    const A=Plot(svg,{at:[388,8],w:232,h:182,x:[0.5,8.5],y:[0,2400],m:{l:46,r:6,t:22,b:34}});A.axes({xt:[1,2,3,4,5,6,7,8],yt:[0,1000,2000],xl:'k',grid:true});T(A.top,140,14,'best J (WCSS)','lab');
    A.path(CK.J.map((v,i)=>[i+1,v]),'ln sb',A.bg);CK.J.forEach((v,i)=>A.dot(i+1,v,i+1===k?6.5:3,i+1===k?'fo pt':'fb'));
    const B=Plot(svg,{at:[388,196],w:232,h:182,x:[0.5,8.5],y:[0.35,0.72],m:{l:46,r:6,t:22,b:34}});B.axes({xt:[1,2,3,4,5,6,7,8],yt:[0.4,0.5,0.6,0.7],fy:v=>v.toFixed(1),xl:'k'});T(B.top,140,14,'mean silhouette','lab');
    B.path(CK.sil.map((v,i)=>[i+2,v]),'ln sg',B.bg);CK.sil.forEach((v,i)=>B.dot(i+2,v,i+2===k?6.5:3,i+2===k?'fo pt':'fgr'))})};

/* ---------- the silhouette with numbers ---------- */
function silhouette(X,L){const n=X.length;const ks=[...new Set(L)];return X.map((p,i)=>{const own=X.filter((_,j)=>j!==i&&L[j]===L[i]);if(!own.length)return {a:0,b:0,s:0};
  const a=own.reduce((s,q2)=>s+dist(p,q2),0)/own.length;const b=Math.min(...ks.filter(c=>c!==L[i]).map(c=>{const m=X.filter((_,j)=>L[j]===c);return m.reduce((s,q2)=>s+dist(p,q2),0)/m.length}));return {a,b,s:(b-a)/Math.max(a,b)}})}
FIG['cl-sil']=root=>{const svg=svgOf(root);const L=[0,0,0,1,1,1];const S=silhouette(X6,L);
  stepper(root,s=>{initSvg(svg,620,380);const F=frame([[0,0],[7,7]],10,40,300,326,{pad:0});rect(svg,F,'#fff','#e3e3e3');const p=X6[1];
    if(s>=1)[0,2].forEach(j=>{ln(svg,F.P(p),F.P(X6[j]),PAL[0],2.2);const m=[(F.X(p[0])+F.X(X6[j][0]))/2,(F.Y(p[1])+F.Y(X6[j][1]))/2];halo(lab(svg,m[0]+(j===0?0:12),m[1]+(j===0?20:0),nf(dist(p,X6[j]),3),'','middle',PAL[0]))});
    if(s>=2)[3,4,5].forEach(j=>{ln(svg,F.P(p),F.P(X6[j]),PAL[1],1.8,'6 4');const o={3:[0.5,10,16,'start'],4:[0.92,-10,-10,'end'],5:[0.6,-8,-4,'end']}[j];const t=o[0];const m=[F.X(p[0])+t*(F.X(X6[j][0])-F.X(p[0])),F.Y(p[1])+t*(F.Y(X6[j][1])-F.Y(p[1]))];halo(lab(svg,m[0]+o[1],m[1]+o[2],nf(dist(p,X6[j]),3),'',o[3],PAL[1]))});
    X6.forEach((q2,i)=>dot(svg,F.X(q2[0]),F.Y(q2[1]),i===1?9:7,PAL[L[i]],i===1?'#1f1f1f':'#fff',i===1?2:1.2));
    const off=[[-10,20],[2,24],[-12,-8],[12,18],[12,4],[-10,-10]];X6.forEach((q2,i)=>halo(lab(svg,F.X(q2[0])+off[i][0],F.Y(q2[1])+off[i][1],N6[i],i===1?'lab':'',off[i][0]<0?'end':'start')));
    lab(svg,160,24,s===0?'the final clustering of the six points':s===1?'a(p2) = (1 + 1.414) / 2 = 1.207':s===2?'b(p2) = (4.243 + 5.657 + 5.831) / 3 = 5.243':'s(p2) = (5.243 − 1.207) / 5.243 = 0.770','lab');
    /* bars of s(i) */const bx=360,by=60;lab(svg,490,44,'s(i) of the six points','lab');const W=220;ln(svg,[bx+30,by],[bx+30,by+252],'#595959',1.2);
    S.forEach((v,i)=>{const y=by+10+i*40;lab(svg,bx+22,y+17,N6[i],i===1?'lab':'','end');if(s>=3||(s===0&&false)){E('rect',{x:bx+30,y:y,width:W*v.s,height:26,fill:PAL[L[i]],'fill-opacity':i===1?1:0.75},svg);lab(svg,bx+36+W*v.s,y+18,nf(v.s,3),i===1?'lab':'','start')}});
    if(s>=3){const m=S.reduce((a,v)=>a+v.s,0)/6;ln(svg,[bx+30+W*m,by],[bx+30+W*m,by+252],'#c00000',1.6,'5 4');halo(lab(svg,bx+30+W*m,by+272,'mean '+nf(m,3),'','middle','#c00000'))}
    else lab(svg,bx+140,by+140,s===0?'':'','')})};

/* ---------- what k-means assumes ---------- */
FIG['cl-fail']=root=>{const svg=initSvg(svgOf(root),1160,290);const W=280,G=13.3;
  ['aniso','varied','moons','circles'].forEach((name,k)=>{const x0=k*(W+G);const X=CD.toy[name];const R=CD.fail[name];const F=frame(X,x0+6,30,W-12,254,{pad:0.04});
    drawCells(svg,F,R.C,{op:0.12});E('rect',{x:F.px[0],y:F.px[1],width:F.px[2],height:F.px[3],fill:'none',stroke:'#d0d0d0'},svg);pts(svg,F,X,labs(R.lab),{r:2.6,sw:0.4});
    R.C.forEach((c,j)=>cmark(svg,F.X(c[0]),F.Y(c[1]),PAL[j],6));lab(svg,x0+W/2,20,name+' · k-means ARI = '+nf(R.ari,2),'lab')})};

/* ---------- colour quantisation ---------- */
FIG['cl-quant']=root=>{const svg=svgOf(root);const Q=CD.quant;const KS=[0,2,4,8,16,64];
  onInput(root,'q',()=>{const qi=+q(root,'q').value;const k=KS[qi];setV(root,'q',qi?k:'all');initSvg(svg,620,390);const w=440,h=w*Q.h/Q.w;
    E('image',{href:qi?Q.img[k]:Q.orig,x:0,y:34,width:w,height:h,preserveAspectRatio:'none'},svg);E('rect',{x:0,y:34,width:w,height:h,fill:'none',stroke:'#bfbfbf'},svg);
    const row=qi?Q.rows.find(r=>r[0]===k):null;lab(svg,220,22,qi?('k = '+k+' colours · '+row[1]+' bit'+(row[1]>1?'s':'')+' per pixel · '+row[2].toFixed(1)+' × smaller'):'original: 96,615 distinct colours, 24 bits per pixel','lab');
    lab(svg,220,34+h+26,qi?('error: RMSE '+row[3].toFixed(1)+' grey levels out of 255'):'k-means on 10,000 sampled pixels, then each pixel → its centroid','');
    lab(svg,536,52,qi?'the palette':'','lab');if(qi){const P=Q.pal[k];const n=P.length;const cols2=n<=16?(n<=4?1:2):8;const sz=n<=4?44:n<=16?34:18;const rows=Math.ceil(n/cols2);
      P.forEach((c,i)=>{const cx=536-cols2*sz/2+(i%cols2)*sz,cy=66+Math.floor(i/cols2)*(sz+(n<=16?4:2));E('rect',{x:cx,y:cy,width:sz-3,height:sz-3,fill:`rgb(${Math.round(255*c[0])},${Math.round(255*c[1])},${Math.round(255*c[2])})`,stroke:'#7f7f7f','stroke-width':0.6},svg)})}})};

/* ---------- a 1-D mixture and its responsibilities ---------- */
const npdf=(x,m,s)=>Math.exp(-0.5*((x-m)/s)**2)/(s*Math.sqrt(2*Math.PI));
FIG['cl-gmm1d']=root=>{const svg=svgOf(root);const pi=[0.6,0.4],mu=[0,3],sg=[1,0.8];
  onInput(root,'x',()=>{const x=+q(root,'x').value;setV(root,'x',nf(x,1));initSvg(svg,620,380);
    const Pl=Plot(svg,{at:[0,0],w:620,h:290,x:[-3,6],y:[0,0.32],m:{l:50,r:14,t:30,b:40}});Pl.axes({xt:[-2,0,2,4,6],yt:[0,0.1,0.2,0.3],fy:v=>v.toFixed(1),xl:'x',yl:'density'});
    const f1=v=>pi[0]*npdf(v,mu[0],sg[0]),f2=v=>pi[1]*npdf(v,mu[1],sg[1]);
    const area=(f,c)=>{const p=[[-3,0]];for(let i=0;i<=240;i++){const v=-3+9*i/240;p.push([v,f(v)])}p.push([6,0]);const g=Pl.poly(p,'',Pl.bg);g.setAttribute('fill',c);g.setAttribute('fill-opacity','0.18')};
    area(f1,PAL[0]);area(f2,PAL[1]);Pl.fn(f1,'ln sb',-3,6,240,Pl.bg);Pl.fn(f2,'ln so',-3,6,240,Pl.bg);Pl.fn(v=>f1(v)+f2(v),'ln sk thin',-3,6,240,Pl.bg);
    Pl.text(-1.15,0.255,'π₁N(x | 0, 1)','', 'end',0,0).style.fill=PAL[0];Pl.text(4.05,0.2,'π₂N(x | 3, 0.8)','','start',0,0).style.fill=PAL[1];halo(Pl.text(1.5,0.29,'p(x) = sum of the two','','middle',0,0));
    const a=f1(x),b=f2(x),g1=a/(a+b);Pl.line(x,0,x,0.3,'ln thin sr dash');Pl.dot(x,a,5.5,'fb pt');Pl.dot(x,b,5.5,'fo pt');
    T(Pl.top,330,20,'at x = '+nf(x,1)+':  π₁N₁ = '+a.toFixed(4)+',  π₂N₂ = '+b.toFixed(4),'lab');
    const y0=322,W=420,x0=150;lab(svg,x0-10,y0+19,'responsibility','lab','end');E('rect',{x:x0,y:y0,width:W*g1,height:28,fill:PAL[0]},svg);E('rect',{x:x0+W*g1,y:y0,width:W*(1-g1),height:28,fill:PAL[1]},svg);
    lab(svg,x0+W/2,y0+52,'γ = ('+g1.toFixed(3)+', '+(1-g1).toFixed(3)+')','lab');if(g1>0.12)lab(svg,x0+6,y0+19,'γ₁','lab','start','#fff');if(g1<0.88)lab(svg,x0+W-6,y0+19,'γ₂','lab','end','#fff')})};

/* ---------- EM on the lab's 300 points ---------- */
FIG['cl-em']=root=>{const svg=svgOf(root);const Gm=CD.gmm;const X=Gm.X;
  onInput(root,'it',()=>{const it=+q(root,'it').value;setV(root,'it',it);initSvg(svg,620,390);const P=Gm.it[it];
    const F=frame(X.concat([[-3,-4.2],[7,6.6]]),4,30,400,356,{pad:0});
    X.forEach(p=>{const w=P.pi.map((pj,j)=>pj*gpdf(p,P.mu[j],P.S[j]));const z=w.reduce((a,b)=>a+b,0);dot(svg,F.X(p[0]),F.Y(p[1]),3.4,mixCol(w.map(v=>v/z)),'#fff',0.4)});
    P.mu.forEach((m,j)=>{ellipse(svg,F,m,P.S[j],PAL[j]);cmark(svg,F.X(m[0]),F.Y(m[1]),PAL[j],7)});
    halo(lab(svg,310,22,'iteration '+it+' · ℓ = '+nf(Gm.ll[it],1)+' · π = ('+P.pi.map(v=>v.toFixed(2)).join(', ')+')','lab'));
    const A=Plot(svg,{at:[408,200],w:212,h:150,x:[0,43],y:[-1400,-950],m:{l:52,r:8,t:20,b:30}});E('rect',{x:0,y:0,width:212,height:150,fill:'#fff','fill-opacity':0.9,stroke:'#d0d0d0'},A.bg);
    A.axes({xt:[0,20,40],yt:[-1350,-1150,-950],fy:v=>String(v).replace('-','−'),xl:'iteration'});T(A.top,130,14,'log-likelihood ℓ','lab');A.path(Gm.ll.map((v,i)=>[i,v]),'ln sb',A.bg);A.dot(it,Gm.ll[it],5,'fo pt')})};

/* ---------- the EM lower bound, in 1-D ---------- */
FIG['cl-elbo']=root=>{const svg=svgOf(root);const x=[-1.2,-0.5,0.2,0.8,1.4,3.1,3.8,4.4,5.0],m2=4;
  const lp=(xi,m)=>Math.log(0.5*npdf(xi,m,1));const ll=m=>x.reduce((s,xi)=>s+Math.log(0.5*npdf(xi,m,1)+0.5*npdf(xi,m2,1)),0);
  const qof=m=>x.map(xi=>{const a=0.5*npdf(xi,m,1),b=0.5*npdf(xi,m2,1);return a/(a+b)});
  const bound=(q1,m)=>x.reduce((s,xi,i)=>{const q=q1[i];return s+q*(lp(xi,m)-Math.log(q))+(1-q)*(lp(xi,m2)-Math.log(1-q))},0);
  const ms=[2.6];for(let k=0;k<4;k++){const q1=qof(ms[k]);ms.push(q1.reduce((s,v,i)=>s+v*x[i],0)/q1.reduce((s,v)=>s+v,0))}
  stepper(root,s=>{initSvg(svg,480,400);const Pl=Plot(svg,{w:480,h:400,x:[-1.5,4],y:[-36,-15],m:{l:50,r:12,t:52,b:40}});
    Pl.axes({xt:[-1,0,1,2,3,4],yt:[-35,-30,-25,-20,-15],fy:v=>String(v).replace('-','−'),xl:'μ₁ (the other parameters fixed)',yl:'log-likelihood'});
    Pl.fn(ll,'ln sb',-1.5,4,300,Pl.bgc);halo(Pl.text(-1.2,ll(-1.2),'ℓ(μ₁)','lab','start',8,-10)).style.fill=PAL[0];
    const nb=s===0?0:Math.ceil(s/2)+(s===5?1:0);const cs=[PAL[1],PAL[2],PAL[3],PAL[4]];
    for(let b=0;b<Math.min(nb,4);b++){const q1=qof(ms[b]);const p=Pl.fn(m=>bound(q1,m),'ln thin',-1.5,4,300);p.setAttribute('stroke',cs[b]);p.setAttribute('stroke-width',b===nb-1?2.4:1.4);if(b<nb-1)p.setAttribute('opacity','0.55');Pl.dot(ms[b],ll(ms[b]),5,'pt').setAttribute('fill',cs[b])}
    const cur=s===0?0:s===1?0:s===2?1:s===3?1:s===4?2:4;
    for(let k=0;k<=cur;k++)Pl.dot(ms[k],ll(ms[k]),k===cur?6.5:4,'fk pt');
    if(s===2||s===4){const k=cur;const q1=qof(ms[k-1]);Pl.line(ms[k],bound(q1,ms[k]),ms[k],ll(ms[k]),'ln thin sk');Pl.dot(ms[k],bound(q1,ms[k]),5,'pt').setAttribute('fill',cs[k-1])}
    const msg=s===0?'start: μ₁ = 2.6, ℓ = '+nf(ll(ms[0]),2):s===1?'E-step: bound B(q, μ₁) touches ℓ at μ₁ = 2.6':s===2?'M-step: top of the bound, μ₁ = '+nf(ms[1],3)+', ℓ = '+nf(ll(ms[1]),2):s===3?'E-step: a new bound touches at '+nf(ms[1],3):s===4?'M-step: μ₁ = '+nf(ms[2],3)+', ℓ = '+nf(ll(ms[2]),2):'converged: μ₁ = '+nf(ms[4],3)+', ℓ = '+nf(ll(ms[4]),2);
    T(Pl.top,245,18,msg,'lab');T(Pl.top,245,40,'9 points, two components: σ = 1, π = ½, μ₂ = 4 fixed','')})};

/* ---------- k-means as the hard limit of EM ---------- */
FIG['cl-hard']=root=>{const svg=svgOf(root);const X=CD.X4;const SG=[3,1.5,1,0.5,0.2,0.05];const cache={};
  const run=sg=>{if(cache[sg])return cache[sg];let C=CD.soft.C0.map(c=>c.slice());let G=null;
    for(let it=0;it<100;it++){G=X.map(p=>{const lg=C.map(c=>-sq(p,c)/(2*sg*sg));const m=Math.max(...lg);const e=lg.map(v=>Math.exp(v-m));const z=e.reduce((a,b)=>a+b,0);return e.map(v=>v/z)});
      C=C.map((c,j)=>{let s=0,a=0,b=0;G.forEach((g,i)=>{s+=g[j];a+=g[j]*X[i][0];b+=g[j]*X[i][1]});return [a/s,b/s]})}
    G=X.map(p=>{const lg=C.map(c=>-sq(p,c)/(2*sg*sg));const m=Math.max(...lg);const e=lg.map(v=>Math.exp(v-m));const z=e.reduce((a,b)=>a+b,0);return e.map(v=>v/z)});
    return cache[sg]={C,G}};
  onInput(root,'sg',()=>{const k=+q(root,'sg').value;const sg=SG[k];setV(root,'sg',sg);initSvg(svg,620,390);const R=run(sg);const F=frame(X,8,34,604,350,{pad:0.04});
    X.forEach((p,i)=>dot(svg,F.X(p[0]),F.Y(p[1]),3.8,mixCol(R.G[i]),'#fff',0.4));
    CD.soft.Ckm.forEach(c=>dot(svg,F.X(c[0]),F.Y(c[1]),12,'none','#1f1f1f',1.6));R.C.forEach((c,j)=>cmark(svg,F.X(c[0]),F.Y(c[1]),PAL[j],7));
    const mm=R.G.reduce((s,g)=>s+Math.max(...g),0)/X.length;const dmax=Math.max(...R.C.map((c,j)=>Math.max(Math.abs(c[0]-CD.soft.Ckm[j][0]),Math.abs(c[1]-CD.soft.Ckm[j][1]))));
    halo(lab(svg,310,22,'σ = '+sg+' · mean max responsibility '+mm.toFixed(3)+' · centres vs k-means: '+(dmax<0.005?'equal to 2 decimals':'off by up to '+dmax.toFixed(2)),'lab'));
    halo(lab(svg,610,380,'rings: the k-means centroids','','end'))})};

/* ---------- covariance types and BIC ---------- */
FIG['cl-bic']=root=>{const svg=svgOf(root);const B=CD.bic;const X=CD.gmm.X;const TY=['spherical','diag','tied','full'];const TC={spherical:PAL[4],diag:PAL[2],tied:PAL[3],full:PAL[5]};
  const draw=ct=>{initSvg(svg,620,380);const R=B[ct];const F=frame(X,2,34,330,342,{pad:0.04});rect(svg,F,'#fff','#e3e3e3');pts(svg,F,X,labs(R.lab),{r:2.8,sw:0.3});
    R.mu.forEach((m,j)=>ellipse(svg,F,m,R.S[j],'#1f1f1f',{w:2}));halo(lab(svg,167,22,ct+', k = 3: '+R.p+' parameters, BIC '+R.bic[2].toFixed(0),'lab'));
    const all=TY.flatMap(t=>B[t].bic);const A=Plot(svg,{at:[344,10],w:276,h:366,x:[0.5,8.5],y:[2040,Math.max(...all)+30],m:{l:52,r:10,t:22,b:36}});
    A.axes({xt:[1,2,3,4,5,6,7,8],yt:[2100,2300,2500],xl:'k (components)'});T(A.top,150,14,'BIC (lower is better)','lab');
    TY.forEach(t=>{const p=A.path(B[t].bic.map((v,i)=>[i+1,v]),'ln',A.bg);p.setAttribute('stroke',TC[t]);p.setAttribute('stroke-width',t===ct?3.2:1.4);if(t!==ct)p.setAttribute('opacity','0.5');
      const bi=B[t].bic.indexOf(Math.min(...B[t].bic));const d=A.dot(bi+1,B[t].bic[bi],t===ct?6:3.5,'pt');d.setAttribute('fill',TC[t])});
    const lp={spherical:[6.6,2210],diag:[4.9,2250],tied:[6.4,2050],full:[2.2,2080]};TY.forEach(t=>{const tt=A.text(lp[t][0],lp[t][1],t,t===ct?'lab':'','start',0,0);tt.style.fill=TC[t];halo(tt)})};
  const cur=segs(root,'ct',draw);draw(cur()||'full')};

/* ---------- agglomerative clustering on six numbers ---------- */
FIG['cl-link1d']=root=>{const svg=svgOf(root);const x=CD.x1d;let m='single';
  function draw(){const s=+q(root,'s').value;setV(root,'s',s+' / 5');initSvg(svg,620,380);const Z=CD.Z1d[m];const n=6;
    const X=v=>60+v*(552/21);const hmax=Z[4][2];const Y=h=>318-h*(250/hmax);
    ln(svg,[X(-0.8),334],[X(21.8),334],'#595959',1.2);x.forEach(v=>{ln(svg,[X(v),329],[X(v),339],'#595959',1.2);lab(svg,X(v),360,String(v),'lab')});
    ln(svg,[42,Y(0)],[42,Y(hmax)],'#595959',1);[0,0.25,0.5,0.75,1].forEach(f=>{const h=f*hmax;ln(svg,[38,Y(h)],[42,Y(h)],'#595959',1);lab(svg,35,Y(h)+4,h.toFixed(h<10?1:0),'','end')});
    lab(svg,8,Y(hmax)-16,m==='ward'?'height √(2ΔJ)':'merge distance','','start');
    const pos={},hgt={},mem={};x.forEach((v,i)=>{pos[i]=X(v);hgt[i]=0;mem[i]=[v]});
    const fmt=v=>String(+v.toFixed(2));const tags=[];
    for(let k=0;k<s;k++){const [a,b,h]=Z[k];const id=n+k;const xa=pos[a],xb=pos[b];const y=Y(h);const c=k===s-1?'#c00000':'#1f1f1f';
      ln(svg,[xa,Y(hgt[a])],[xa,y],c,2);ln(svg,[xb,Y(hgt[b])],[xb,y],c,2);ln(svg,[xa,y],[xb,y],c,2);pos[id]=(xa+xb)/2;hgt[id]=h;mem[id]=mem[a].concat(mem[b]).sort((p,q2)=>p-q2);
      const hv=m==='ward'?(h*h/2):h;tags.push([(xa+xb)/2,y-7,(m==='ward'?'ΔJ ':'')+fmt(hv),c])}
    tags.forEach(([tx,ty,t,c])=>halo(lab(svg,tx,ty,t,'','middle',c)));
    x.forEach(v=>dot(svg,X(v),334,7,'#4472c4','#fff',1.5));
    let msg;if(s===0)msg=m+' linkage: six clusters of one point';else{const [a,b,h]=Z[s-1];const A=mem[a]||[x[a]],Bm=mem[b]||[x[b]];const hv=m==='ward'?h*h/2:h;
      msg='merge '+s+': {'+A.join(', ')+'} + {'+Bm.join(', ')+'} at '+(m==='ward'?'ΔJ = ':'')+String(+hv.toFixed(2));if(s===5){const [a2,b2]=Z[4];msg='2 clusters: {'+mem[a2].join(', ')+'} and {'+mem[b2].join(', ')+'}'}}
    lab(svg,330,24,msg,'lab')}
  segs(root,'m',v=>{m=v;draw()});onInput(root,'s',draw)};

/* ---------- dendrogram of 30 points with a cut ---------- */
FIG['cl-dendro']=root=>{const svg=svgOf(root);const Z=CD.Z30,X=CD.X30;const n=X.length;
  const order=[];(function rec(id){if(id<n){order.push(id);return}const [a,b]=Z[id-n];rec(a);rec(b)})(2*n-2);
  const xpos={};order.forEach((id,i)=>xpos[id]=36+i*(290/(n-1)));
  onInput(root,'h',()=>{const h=+q(root,'h').value;setV(root,'h',nf(h,1));initSvg(svg,620,380);const Y=v=>340-v*(300/16);
    /* clusters below the cut: union of merges with height < h */const par=[...Array(2*n-1)].map((_,i)=>i);const find=i=>par[i]===i?i:(par[i]=find(par[i]));
    Z.forEach(([a,b,hh],k)=>{if(hh<h){par[find(a)]=n+k;par[find(b)]=n+k}});
    const roots=order.map(i=>find(i));const ids=[...new Set(roots)];const cl={};order.forEach((i,k)=>cl[i]=ids.indexOf(roots[k]));
    const sub={};for(let i=0;i<n;i++)sub[i]=cl[i];Z.forEach(([a,b,hh],k)=>{sub[n+k]=(hh<h&&sub[a]===sub[b])?sub[a]:-1});
    const pos=Object.assign({},xpos),hg={};for(let i=0;i<n;i++)hg[i]=0;
    Z.forEach(([a,b,hh],k)=>{const id=n+k;pos[id]=(pos[a]+pos[b])/2;hg[id]=hh;const c=sub[id]>=0?PAL[sub[id]%10]:'#8c8c8c';
      ln(svg,[pos[a],Y(hg[a])],[pos[a],Y(hh)],c,1.6);ln(svg,[pos[b],Y(hg[b])],[pos[b],Y(hh)],c,1.6);ln(svg,[pos[a],Y(hh)],[pos[b],Y(hh)],c,1.6)});
    order.forEach(i=>dot(svg,xpos[i],Y(0)+5,3,PAL[cl[i]%10]));
    ln(svg,[26,Y(0)],[26,Y(16)],'#595959',1);[0,4,8,12,16].forEach(v=>{ln(svg,[22,Y(v)],[26,Y(v)],'#595959',1);lab(svg,20,Y(v)+4,String(v),'','end')});
    ln(svg,[28,Y(h)],[330,Y(h)],'#c00000',2,'7 5');halo(lab(svg,326,Y(h)-7,'cut at h = '+nf(h,1),'','end','#c00000'));
    const F=frame(X,356,40,262,326,{pad:0.06});rect(svg,F,'#fff','#e3e3e3');pts(svg,F,X,X.map((_,i)=>cl[i]),{r:5,sw:1});
    lab(svg,470,24,ids.length+(ids.length===1?' cluster':' clusters')+' below the cut','lab');lab(svg,170,24,'Ward dendrogram of 30 points','lab')})};

/* ---------- the chaining effect ---------- */
FIG['cl-chain']=root=>{const svg=svgOf(root);const C=CD.chain;
  const draw=m=>{initSvg(svg,620,330);[['bridge',0],['moons',318]].forEach(([d,x0])=>{const R=C[d];const F=frame(R.X,x0+4,34,294,290,{pad:0.05});rect(svg,F,'#fff','#e3e3e3');
      pts(svg,F,R.X,labs(R.lab[m]),{r:2.8,sw:0.4});lab(svg,x0+151,22,d+' · '+(m==='ward'?'Ward':m)+' · ARI = '+R.ari[m].toFixed(2),'lab')})};
  const cur=segs(root,'m',draw);draw(cur()||'ward')};

/* ---------- DBSCAN widget: computed here ---------- */
function dbscan(X,eps,ms){const n=X.length;const nb=X.map(p=>X.map((q2,j)=>dist(p,q2)<=eps+1e-12?j:-1).filter(j=>j>=0));const core=nb.map(l=>l.length>=ms);const L=new Array(n).fill(-1);let c=0;
  for(let i=0;i<n;i++){if(!core[i]||L[i]>=0)continue;L[i]=c;const Q=[i];while(Q.length){const p=Q.pop();nb[p].forEach(j=>{if(L[j]<0){L[j]=c;if(core[j])Q.push(j)}})}c++}return {L,core,nc:c}}
FIG['cl-dbscan']=root=>{const svg=svgOf(root);const X=CD.dbs;const ms=4;
  const kd=X.map(p=>X.map(q2=>dist(p,q2)).sort((a,b)=>a-b)[ms-1]).sort((a,b)=>a-b);
  onInput(root,'eps',()=>{const eps=+q(root,'eps').value;setV(root,'eps',eps.toFixed(2));initSvg(svg,620,380);const R=dbscan(X,eps,ms);
    const F=frame(X,4,34,396,340,{pad:0.05});rect(svg,F,'#fff','#e3e3e3');
    const gd=E('g',{opacity:0.16},svg);X.forEach((p,i)=>{if(R.core[i])E('circle',{cx:F.X(p[0]),cy:F.Y(p[1]),r:eps*F.s,fill:col(R.L[i])},gd)});
    let nc=0,nbd=0,nn=0;X.forEach((p,i)=>{const x=F.X(p[0]),y=F.Y(p[1]);if(R.core[i]){nc++;dot(svg,x,y,3.8,col(R.L[i]),'#fff',0.6)}else if(R.L[i]>=0){nbd++;dot(svg,x,y,3.6,'#fff',col(R.L[i]),1.8)}else{nn++;cross(svg,x,y,4,'#7f7f7f')}});
    halo(lab(svg,200,22,'ε = '+eps.toFixed(2)+': '+R.nc+(R.nc===1?' cluster':' clusters')+' · '+nc+' core, '+nbd+' border, '+nn+' noise','lab'));
    const A=Plot(svg,{at:[410,20],w:210,h:340,x:[0,X.length],y:[0,0.8],m:{l:44,r:6,t:34,b:40}});A.axes({xt:[0,50,100],yt:[0,0.2,0.4,0.6,0.8],fy:v=>v.toFixed(1),xl:'points, sorted'});
    T(A.top,118,14,'distance to 3rd neighbour','lab');A.path(kd.map((v,i)=>[i,Math.min(v,0.8)]),'ln sb',A.bg);A.line(0,eps,X.length,eps,'ln thin sr dash');A.text(4,eps,'ε','lab','start',0,-6).style.fill='#c00000'})};

/* ---------- DBSCAN vs HDBSCAN on varying densities ---------- */
FIG['cl-hdb']=root=>{const svg=initSvg(svgOf(root),1160,275);const H=CD.hdb;const keys=Object.keys(H.lab);const W=372,G=22;
  keys.forEach((k,j)=>{const x0=j*(W+G);const F=frame(H.X,x0+6,32,W-12,238,{pad:0.04,equal:false});rect(svg,F,'#fff','#e3e3e3');pts(svg,F,H.X,labs(H.lab[k]),{r:2.6,sw:0.3});
    const nm=k.startsWith('HDBSCAN')?'HDBSCAN, min size 15':k.replace('eps','ε');lab(svg,x0+W/2,20,nm+' · ARI '+H.ari[k].toFixed(2)+' · noise '+H.noise[k].toFixed(0)+' %','lab')})};

/* ---------- spectral clustering of 200 moons ---------- */
FIG['cl-spectral']=root=>{const svg=svgOf(root);const S=CD.spec;const X=S.X;const fm=Math.max(...S.f.map(Math.abs));
  const cross2=S.E.filter(([a,b])=>S.y[a]!==S.y[b]);
  stepper(root,s=>{initSvg(svg,620,390);const F=frame(X,4,30,612,244,{pad:0.03});rect(svg,F,'#fff','#e3e3e3');
    if(s>=2){const g=E('g',{},svg);S.E.forEach(([a,b])=>ln(g,F.P(X[a]),F.P(X[b]),s===2?'#b8c2d4':'#dfe4ec',s===2?1.1:0.9));cross2.forEach(([a,b])=>ln(svg,F.P(X[a]),F.P(X[b]),'#c00000',3))}
    X.forEach((p,i)=>{let c='#7f7f7f';if(s===1)c=PAL[S.km[i]];else if(s===3||s===4)c=heat(Math.sign(S.f[i])*Math.sqrt(Math.abs(S.f[i])/fm));else if(s===5)c=PAL[S.f[i]>0?1:0];dot(svg,F.X(p[0]),F.Y(p[1]),s===2?3:4,c,s===3||s===4?'#7f7f7f':'#fff',0.5)});
    if(s>=2&&cross2.length){const [a,b]=cross2[0];const m=[(F.X(X[a][0])+F.X(X[b][0]))/2,(F.Y(X[a][1])+F.Y(X[b][1]))/2];halo(lab(svg,m[0]+12,m[1]+22,'the only edge across','','start','#c00000'))}
    const msg=['200 points from two noisy moons','k-means on the coordinates: ARI '+S.ariKm.toFixed(3),'8-nearest-neighbour graph: '+S.E.length+' edges, '+cross2.length+' across',
      'colour = Fiedler vector (blue negative, orange positive)','sorted, the Fiedler vector is a step','sign of the Fiedler vector: ARI 1.000'][s];halo(lab(svg,310,20,msg,'lab'));
    if(s>=4){const ord=S.f.map((v,i)=>[v,i]).sort((a,b)=>a[0]-b[0]);const A=Plot(svg,{at:[0,282],w:330,h:108,x:[0,200],y:[-fm*1.1,fm*1.1],m:{l:50,r:8,t:18,b:22}});
      A.axes({xt:[],yt:[-0.08,0,0.08],fy:v=>nf(v,2),grid:false});T(A.top,190,12,'Fiedler vector, sorted (colour = true moon)','');A.line(0,0,200,0,'ln thin sm',A.bg);ord.forEach(([v,i],k)=>{const d=A.dot(k,v,2.4,'');d.setAttribute('fill',PAL[S.y[i]])})}
    if(s>=3){const A=Plot(svg,{at:[350,282],w:270,h:108,x:[-0.6,9.6],y:[0,Math.max(...S.lam)*1.1],m:{l:44,r:6,t:18,b:22}});A.axes({xt:[],yt:[0,0.3,0.6],fy:v=>v.toFixed(1),grid:false});
      T(A.top,150,12,'10 smallest eigenvalues of L','');S.lam.forEach((v,i)=>{const r2=A.rect(i-0.35,0,i+0.35,Math.max(v,0.004),'');r2.setAttribute('fill',i<2?PAL[0]:'#bfbfbf')});
      halo(A.text(-0.4,Math.max(...S.lam)*0.62,'λ₁ = '+S.lam[1].toFixed(4),'','start',0,0))}})};

/* ---------- eigenvalues and the embedding ---------- */
FIG['cl-eigs']=root=>{const svg=initSvg(svgOf(root),480,420);const S=CD.spec,N=CD.njw;
  const A=Plot(svg,{at:[0,0],w:480,h:190,x:[-0.6,9.6],y:[0,Math.max(...S.lam)*1.12],m:{l:46,r:10,t:28,b:34}});A.axes({xt:[0,1,2,3,4,5,6,7,8,9],yt:[0,0.2,0.4,0.6],fy:v=>v.toFixed(1),xl:'index of the eigenvalue'});
  T(A.top,250,18,'200 noisy moons, 8-NN graph: L = D − A','lab');S.lam.forEach((v,i)=>{const r2=A.rect(i-0.35,0,i+0.35,Math.max(v,0.004),'');r2.setAttribute('fill',i<2?PAL[0]:'#bfbfbf')});
  halo(A.text(-0.3,0.5,'λ₀ = 0, λ₁ = '+S.lam[1].toFixed(4)+', then a gap','','start',0,0));
  const r=rng(2);const U=N.U.map(p=>[p[0]+0.03*randn(r),p[1]+0.03*randn(r)]);const F=frame(U.concat([[-1.15,-1.15],[1.15,1.15]]),150,226,190,176,{pad:0});rect(svg,F,'#fff','#e3e3e3');
  ln(svg,[F.X(-1.15),F.Y(0)],[F.X(1.15),F.Y(0)],'#ececec',1);ln(svg,[F.X(0),F.Y(-1.15)],[F.X(0),F.Y(1.15)],'#ececec',1);
  pts(svg,F,U,N.y,{r:2.6,sw:0.3});lab(svg,240,214,'toy moons (500 points), rows of U (+ jitter)','lab');
  lab(svg,14,262,'eigenvalues of L_sym:','','start');lab(svg,14,282,N.eig.slice(0,3).map(v=>nf(v,4)).join(', ')+' …','','start');
  lab(svg,470,300,'two components:','','end');lab(svg,470,320,'each moon is','','end');lab(svg,470,340,'one spot','','end')};

/* ---------- internal indices on the moons ---------- */
FIG['cl-internal']=root=>{const svg=initSvg(svgOf(root),620,268);const X=CD.toy.moons;
  const rows=[['silhouette (high)',0.496,0.385,3],['Davies–Bouldin (low)',0.812,1.028,3],['Calinski–Harabasz (high)',690.8,429.5,1]];
  [['k-means’ straight cut',labs(CD.internal.km),0],['the true moons',labs(CD.toyY.moons),1]].forEach(([t,L,j])=>{const x0=j*312;const F=frame(X,x0+6,30,296,140,{pad:0.04});rect(svg,F,'#fff','#e3e3e3');pts(svg,F,X,L,{r:2.4,sw:0.3});
    lab(svg,x0+154,20,t,'lab');rows.forEach(([n,a,b,d],k)=>{const y=196+k*24;const v=j===0?a:b;const win=j===0;lab(svg,x0+12,y,n,'','start');lab(svg,x0+296,y,v.toFixed(d),win?'lab':'','end',win?'#548235':'#8c8c8c')})});
  lab(svg,310,264,'green = the better score: all three prefer the wrong answer','','middle','#548235')};
FIG['cl-stab']=root=>{const S=CD.stab;const ks=Object.keys(S).map(Number);const Pl=Plot(svgOf(root),{w:480,h:215,x:[1.5,7.5],y:[0.55,1.12],m:{l:46,r:10,t:16,b:38}});
  Pl.axes({xt:ks,yt:[0.6,0.8,1.0],fy:v=>v.toFixed(1),xl:'k',yl:'ARI'});Pl.path(ks.map(k=>[k,S[k][0]]),'ln sb',Pl.bg);
  ks.forEach(k=>{const [m,s]=S[k];Pl.line(k,Math.max(0.55,m-s),k,Math.min(1.12,m+s),'ln thin sb');Pl.dot(k,m,k===4?6:4,k===4?'fo pt':'fb pt')});Pl.text(4,S[4][0],nf(S[4][0],3),'lab','start',10,-8)};

/* ---------- external indices on twelve points ---------- */
function comb2(v){return v*(v-1)/2}
function contingency(y,p){const ys=[...new Set(y)].sort((a,b)=>a-b),ps=[...new Set(p)].sort((a,b)=>a-b);return {ys,ps,N:ys.map(a=>ps.map(b=>y.filter((v,i)=>v===a&&p[i]===b).length))}}
function ari(y,p){const {N}=contingency(y,p);const n=y.length;const sij=N.flat().reduce((s,v)=>s+comb2(v),0);const a=N.map(r=>r.reduce((s,v)=>s+v,0)),b=N[0].map((_,j)=>N.reduce((s,r)=>s+r[j],0));
  const sa=a.reduce((s,v)=>s+comb2(v),0),sb=b.reduce((s,v)=>s+comb2(v),0),e=sa*sb/comb2(n);return (sij-e)/(0.5*(sa+sb)-e)}
function nmi(y,p){const {N}=contingency(y,p);const n=y.length;const a=N.map(r=>r.reduce((s,v)=>s+v,0)/n),b=N[0].map((_,j)=>N.reduce((s,r)=>s+r[j],0)/n);let mi=0;
  N.forEach((r,i)=>r.forEach((v,j)=>{if(v>0)mi+=v/n*Math.log((v/n)/(a[i]*b[j]))}));const h=q2=>-q2.reduce((s,v)=>s+(v>0?v*Math.log(v):0),0);return mi>1e-12?mi/(0.5*(h(a)+h(b))):0}
function matched(y,p){const {N}=contingency(y,p);const R=N.length,C=N[0].length;let best=0;
  const rec=(i,used,s)=>{if(i===R){best=Math.max(best,s);return}let any=false;for(let j=0;j<C;j++)if(!used.has(j)){any=true;used.add(j);rec(i+1,used,s+N[i][j]);used.delete(j)}if(!any||R>C)rec(i+1,used,s)};rec(0,new Set(),0);return best/y.length}
FIG['cl-ext']=root=>{const svg=svgOf(root);const y=[0,0,0,0,1,1,1,1,2,2,2,2];
  const PR={renamed:[2,2,2,2,0,0,0,0,1,1,1,1],one:[0,0,0,1,1,1,1,1,2,2,2,2],merged:[0,0,0,0,1,1,1,1,1,1,1,1],split:[0,0,3,3,1,1,1,1,2,2,2,2],random:[2,1,1,0,0,0,0,0,0,2,1,2]};
  const draw=k=>{initSvg(svg,620,380);const p=PR[k];
    ['class A','class B','class C'].forEach((t,g)=>{const x0=14+g*202;E('rect',{x:x0,y:34,width:190,height:66,rx:8,fill:'#fafafa',stroke:'#bfbfbf'},svg);lab(svg,x0+95,26,t,'lab');
      for(let i=0;i<4;i++){const idx=g*4+i;const cx=x0+32+i*42;dot(svg,cx,67,15,PAL[p[idx]],'#fff',1.2);lab(svg,cx,72,String(p[idx]),'lab','middle','#fff')}});
    lab(svg,310,124,'circle colour and number = predicted cluster','');
    const {ps,N}=contingency(y,p);const tx=40,ty=164,cw=46,ch=30;lab(svg,tx+(ps.length*cw)/2+50,ty-14,'contingency table','lab');
    ps.forEach((c,j)=>{lab(svg,tx+66+j*cw+cw/2,ty+18,'cl. '+c,'','middle',PAL[c])});['A','B','C'].forEach((t,i)=>{lab(svg,tx+40,ty+ch+i*ch+20,t,'lab','end');
      ps.forEach((c,j)=>{const v=N[i][j];E('rect',{x:tx+66+j*cw,y:ty+ch+i*ch,width:cw,height:ch,fill:v?heat(Math.min(1,v/4),true):'#fff',stroke:'#7f7f7f','stroke-width':0.8},svg);lab(svg,tx+66+j*cw+cw/2,ty+ch+i*ch+20,String(v),'','middle',v>2?'#fff':'#1f1f1f')})});
    const raw=p.filter((v,i)=>v===y[i]).length/12;const M=[['raw accuracy',raw],['matched accuracy',matched(y,p)],['ARI',ari(y,p)],['NMI',nmi(y,p)]];
    const bx=420;M.forEach(([n,v],i)=>{const yy=176+i*46;lab(svg,bx-8,yy+16,n,'lab','end');E('rect',{x:bx,y:yy,width:150,height:24,fill:'#f2f2f2'},svg);E('rect',{x:bx,y:yy,width:150*Math.max(0,v),height:24,fill:i===2?PAL[1]:PAL[0]},svg);lab(svg,bx+158,yy+17,v.toFixed(i<2?2:3),'lab','start')})};
  const cur=segs(root,'p',draw);draw(cur()||'renamed')};

/* ---------- the grid: 7 algorithms x 6 datasets ---------- */
FIG['cl-grid']=root=>{const svg=initSvg(svgOf(root),1160,510);const G=CD.grid;const L0=92,T0=24;const cw=(1160-L0)/G.algos.length,chh=(510-T0)/G.sets.length;
  G.algos.forEach((a,c)=>lab(svg,L0+c*cw+cw/2,16,a,'lab'));
  G.sets.forEach((d,r)=>{lab(svg,L0-8,T0+r*chh+chh/2+5,d,'lab','end');const X=CD.toy[d];
    G.algos.forEach((a,c)=>{const x0=L0+c*cw,y0=T0+r*chh;const side=chh-6;const F=frame(X,x0+4,y0+3,side,side,{pad:0.04});E('rect',{x:x0+3,y:y0+2,width:cw-6,height:chh-4,fill:'#fafafa',stroke:'#e0e0e0'},svg);
      const Lb=labs(G.lab[d+'|'+a]);X.forEach((p,i)=>{const l=Lb[i];if(l<0)dot(svg,F.X(p[0]),F.Y(p[1]),1.1,'#c8c8c8');else dot(svg,F.X(p[0]),F.Y(p[1]),1.5,col(l))});
      const v=G.ari[d+'|'+a];const txt=v===null?G.ncl[a]+' cl.':nf(v,2);const good=v!==null&&v>=0.9;lab(svg,x0+cw-8,y0+chh/2+6,txt,good?'lab':'','end',good?'#548235':v!==null&&v<0.6?'#c00000':'#595959')})})};

/* ---------- digits ---------- */
FIG['cl-digits']=root=>{const svg=svgOf(root);const Dg=CD.digits;const yd=[...Dg.y].map(Number),km=labs(Dg.km);
  const draw=v=>{initSvg(svg,620,400);const noise=v==='noise';const E2=noise?Dg.noise.E:Dg.E;const L=noise?labs(Dg.noise.lab):v==='km'?km:yd;
    const F=frame(E2,4,30,380,366,{pad:0.04});rect(svg,F,'#fff','#e3e3e3');E2.forEach((p,i)=>{const l=L[i];if(l<0)cross(svg,F.X(p[0]),F.Y(p[1]),2,'#c8c8c8');else dot(svg,F.X(p[0]),F.Y(p[1]),noise?2.4:1.9,col(l))});
    lab(svg,194,20,noise?'t-SNE of ONE 10-D Gaussian: HDBSCAN finds 17 clusters':v==='km'?'t-SNE map, colour = k-means cluster':'t-SNE map, colour = true digit','lab');
    if(v==='truth')for(let d=0;d<10;d++){const m=E2.filter((_,i)=>yd[i]===d);const cx=m.map(p=>p[0]).sort((a,b)=>a-b)[m.length>>1],cy=m.map(p=>p[1]).sort((a,b)=>a-b)[m.length>>1];halo(lab(svg,F.X(cx),F.Y(cy)+5,String(d),'lab big'))}
    if(noise){['500 points, no structure','perplexity 2','HDBSCAN on the map:','17 clusters, 30 % noise','in the original space:','no cluster at all'].forEach((t,i)=>lab(svg,504,90+i*30+(i>1?14:0)+(i>3?14:0),t,i%2?'':'lab'));return}
    lab(svg,504,20,'k-means centroids','lab');const cs=8.4;
    Dg.C.forEach((c,j)=>{const x0=404+(j%2)*112,y0=34+Math.floor(j/2)*73;const N=Dg.N.map(r=>r[j]);const tot=N.reduce((a,b)=>a+b,0);const pur=Math.max(...N)/tot;
      c.forEach((v,i)=>E('rect',{x:x0+(i%8)*cs,y:y0+Math.floor(i/8)*cs,width:cs,height:cs,fill:`rgb(${Math.round(255*(1-v/16))},${Math.round(255*(1-v/16))},${Math.round(255*(1-v/16))})`},svg));
      E('rect',{x:x0,y:y0,width:8*cs,height:8*cs,fill:'none',stroke:v==='km'?PAL[j]:'#bfbfbf','stroke-width':v==='km'?2.2:1},svg);
      lab(svg,x0+8*cs+5,y0+22,'“'+Dg.match[j]+'”','lab','start');lab(svg,x0+8*cs+5,y0+44,Math.round(100*pur)+' %','','start')})};
  const cur=segs(root,'view',draw);draw(cur()||'truth')};

/* ---------- Gower: two policyholders ---------- */
FIG['cl-gower']=root=>{const svg=initSvg(svgOf(root),480,200);const G=CD.gower;
  lab(svg,8,18,'feature','lab','start');lab(svg,150,18,'row 0','lab');lab(svg,226,18,'row 150','lab');lab(svg,390,18,'δ','lab');
  G.cols.forEach((c,i)=>{const y=40+i*26;const a=G.rows[0][i],b=G.rows[1][i];lab(svg,8,y+4,c+(G.range[c]?' (range '+(G.range[c][1]-G.range[c][0])+')':''),'','start');
    lab(svg,150,y+4,String(a),'');lab(svg,226,y+4,String(b),'');E('rect',{x:280,y:y-9,width:150,height:16,fill:'#f2f2f2'},svg);E('rect',{x:280,y:y-9,width:150*G.delta[i],height:16,fill:i<3?PAL[0]:PAL[1]},svg);lab(svg,436,y+4,nf(G.delta[i],3),'','start')});
  ln(svg,[8,170],[472,170],'#7f7f7f',1);lab(svg,8,192,'Gower = mean of the five δ','lab','start');lab(svg,436,192,nf(G.G,3),'lab','start')};
})();
