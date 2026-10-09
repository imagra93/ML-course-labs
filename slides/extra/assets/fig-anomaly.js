/* Figures for extra/05_anomaly_detection.html (anomaly detection). Uses ../assets/figures.js (MLFIG), ../neural_networks/assets/nn-core.js (MLNN)
   and anomaly-data.js (ANDATA: arrays exported from the lab notebook, same seeds). Detectors that are cheap (k-NN, KDE, GMM, LOF, Isolation Forest)
   are recomputed here on the lab's data; the one-class SVM, MCD, MNIST, Satellite, claims and time-series results come from the lab. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,q,setV,svgOf}=lib;const {TT,box,stepper,segs}=window.MLNN;
const AD=window.ANDATA;
const C={b:'#4472c4',o:'#ed7d31',r:'#c00000',g:'#548235',gl:'#70ad47',y:'#ffc000',k:'#1f1f1f',m:'#7f7f7f',p:'#7030a0'};
const nf=(v,d)=>{d=d===undefined?2:d;if(Math.abs(v)<0.5*Math.pow(10,-d))v=0;return v.toFixed(d).replace('-','−')};
const th=v=>Math.round(v).toLocaleString('en-US');
const pc=(v,d)=>nf(100*v,d===undefined?1:d)+' %';
const ln=(g,x1,y1,x2,y2,c,w,dash)=>E('line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:c||'#9aa5b8','stroke-width':w||1.4,'stroke-dasharray':dash||''},g);
const dot=(g,x,y,r,fill,stroke,sw)=>E('circle',{cx:x,cy:y,r:r,fill:fill,stroke:stroke||'#fff','stroke-width':sw===undefined?1:sw},g);
const halo=t=>{t.setAttribute('style',(t.getAttribute('style')||'')+';paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round');return t};
const tc=(t,c)=>{t.style.fill=c;return t};
function onInput(root,k,draw){const inp=q(root,k);inp.addEventListener('input',draw);draw();return inp}
const cross=(g,x,y,s,c,w)=>{ln(g,x-s,y-s,x+s,y+s,'#fff',(w||2.2)+2.4);ln(g,x-s,y+s,x+s,y-s,'#fff',(w||2.2)+2.4);ln(g,x-s,y-s,x+s,y+s,c,w||2.2);ln(g,x-s,y+s,x+s,y-s,c,w||2.2)};
let clipN=0;
function clipRect(svg,x,y,w,h){const id='anclip'+(clipN++);const d=E('defs',{},svg);const cp=E('clipPath',{id:id},d);E('rect',{x:x,y:y,width:w,height:h},cp);return E('g',{'clip-path':'url(#'+id+')'},svg)}
/* equal-aspect frame: fit the data ranges xr, yr into the box (x0, y0, w, h) */
function frame(x0,y0,w,h,xr,yr){const s=Math.min(w/(xr[1]-xr[0]),h/(yr[1]-yr[0]));const W=s*(xr[1]-xr[0]),H=s*(yr[1]-yr[0]);const ox=x0+(w-W)/2,oy=y0+(h-H)/2;
  return {X:x=>ox+(x-xr[0])*s,Y:y=>oy+H-(y-yr[0])*s,ox:ox,oy:oy,W:W,H:H,s:s}}
/* raster image of a grid (values at linspace points, row j = y index) */
function raster(g,F,lo,hi,nx,ny,col){const cv=document.createElement('canvas');cv.width=nx;cv.height=ny;const ctx=cv.getContext('2d');const im=ctx.createImageData(nx,ny);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const c=col(j*nx+i);const o=4*((ny-1-j)*nx+i);im.data[o]=c[0];im.data[o+1]=c[1];im.data[o+2]=c[2];im.data[o+3]=255}
  ctx.putImageData(im,0,0);const dx=(hi[0]-lo[0])/(nx-1),dy=(hi[1]-lo[1])/(ny-1);
  const x1=F.X(lo[0]-dx/2),x2=F.X(hi[0]+dx/2),y1=F.Y(hi[1]+dy/2),y2=F.Y(lo[1]-dy/2);
  E('image',{href:cv.toDataURL(),x:x1,y:y1,width:x2-x1,height:y2-y1,preserveAspectRatio:'none'},g)}
/* marching squares: contour of the grid at a level */
function contour(g,F,v,lo,hi,nx,ny,level,stroke,w,dash){const xs=i=>lo[0]+i*(hi[0]-lo[0])/(nx-1),ys=j=>lo[1]+j*(hi[1]-lo[1])/(ny-1);let d='';
  const P=(i,j,i2,j2)=>{const a=v[j*nx+i]-level,b=v[j2*nx+i2]-level;const t=a/(a-b);return [F.X(xs(i)+t*(xs(i2)-xs(i))),F.Y(ys(j)+t*(ys(j2)-ys(j)))]};
  for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){const a=v[j*nx+i]>level,b=v[j*nx+i+1]>level,c=v[(j+1)*nx+i+1]>level,e=v[(j+1)*nx+i]>level;
    const pts=[];if(a!==b)pts.push(P(i,j,i+1,j));if(b!==c)pts.push(P(i+1,j,i+1,j+1));if(c!==e)pts.push(P(i+1,j+1,i,j+1));if(e!==a)pts.push(P(i,j+1,i,j));
    for(let k=0;k+1<pts.length;k+=2)d+='M'+pts[k][0].toFixed(1)+','+pts[k][1].toFixed(1)+'L'+pts[k+1][0].toFixed(1)+','+pts[k+1][1].toFixed(1)}
  if(d)E('path',{d:d,fill:'none',stroke:stroke||C.k,'stroke-width':w||1.6,'stroke-dasharray':dash||'','stroke-linecap':'round'},g)}
/* colour scale for "how anomalous" (percentile of the training scores): white = most normal, orange = beyond every training point */
const STOPS=[[0,[255,255,255]],[0.5,[253,246,238]],[0.8,[252,226,201]],[0.95,[248,186,140]],[1,[240,140,84]]];
function warm(t){t=Math.max(0,Math.min(1,t));for(let k=1;k<STOPS.length;k++)if(t<=STOPS[k][0]){const a=STOPS[k-1],b=STOPS[k],u=(t-a[0])/(b[0]-a[0]);return a[1].map((c,i)=>Math.round(c+u*(b[1][i]-c)))}return STOPS[4][1]}
const sortNum=a=>Float64Array.from(a).sort();
function pctile(st,v){let lo=0,hi=st.length;while(lo<hi){const m=(lo+hi)>>1;if(st[m]<=v)lo=m+1;else hi=m}return lo/st.length}
function auc(y,s){const idx=s.map((v,i)=>i).sort((a,b)=>s[a]-s[b]);let r=0,np=0,nn=0;const rank=new Array(s.length);let i=0;while(i<idx.length){let j=i;while(j+1<idx.length&&s[idx[j+1]]===s[idx[i]])j++;for(let k=i;k<=j;k++)rank[idx[k]]=(i+j)/2+1;i=j+1}
  y.forEach((v,k)=>{if(v){r+=rank[k];np++}else nn++});return (r-np*(np+1)/2)/(np*nn)}
const rankOf=(s,i)=>1+s.filter(v=>v>s[i]).length;
/* maths */
const erf=x=>{const s=Math.sign(x);x=Math.abs(x);const t=1/(1+0.3275911*x);const y=1-((((1.061405429*t-1.453152027)*t+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return s*y};
const Phi=x=>0.5*(1+erf(x/Math.SQRT2));const phi=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
function lnGamma(z){const g=7,c=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  if(z<0.5)return Math.log(Math.PI/Math.sin(Math.PI*z))-lnGamma(1-z);z-=1;let x=c[0];for(let i=1;i<g+2;i++)x+=c[i]/(z+i);const t=z+g+0.5;return 0.5*Math.log(2*Math.PI)+(z+0.5)*Math.log(t)-t+Math.log(x)}
function gammaP(a,x){if(x<=0)return 0;if(x<a+1){let s=1/a,t=s;for(let n=1;n<500;n++){t*=x/(a+n);s+=t;if(t<s*1e-14)break}return s*Math.exp(-x+a*Math.log(x)-lnGamma(a))}
  let b=x+1-a,c=1e300,d=1/b,h=d;for(let i=1;i<500;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-300)d=1e-300;c=b+an/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<1e-14)break}
  return 1-Math.exp(-x+a*Math.log(x)-lnGamma(a))*h}
const chi2pdf=(x,d)=>x<=0?0:Math.exp((d/2-1)*Math.log(x)-x/2-(d/2)*Math.LN2-lnGamma(d/2));
function chi2ppf(p,d){let lo=0,hi=d+30*Math.sqrt(2*d)+60;for(let i=0;i<100;i++){const m=(lo+hi)/2;if(gammaP(d/2,m/2)<p)lo=m;else hi=m}return (lo+hi)/2}
const cfac=n=>n>2?2*(Math.log(n-1)+0.5772156649)-2*(n-1)/n:(n===2?1:0);
function covOf(P){const n=P.length;const mu=[0,0];P.forEach(p=>{mu[0]+=p[0]/n;mu[1]+=p[1]/n});const S=[[0,0],[0,0]];P.forEach(p=>{const a=p[0]-mu[0],b=p[1]-mu[1];S[0][0]+=a*a/n;S[0][1]+=a*b/n;S[1][1]+=b*b/n});S[1][0]=S[0][1];return {mu:mu,S:S}}
function maha(p,mu,S){const a=p[0]-mu[0],b=p[1]-mu[1];const det=S[0][0]*S[1][1]-S[0][1]*S[1][0];return Math.sqrt((S[1][1]*a*a-2*S[0][1]*a*b+S[0][0]*b*b)/det)}
/* an ellipse (x - mu)^T S^-1 (x - mu) = r^2 as a polygon in frame F */
function ellipse(g,F,mu,S,r,stroke,w,dash){const a=S[0][0],b=S[0][1],c=S[1][1];const tr=(a+c)/2,dd=Math.sqrt(((a-c)/2)**2+b*b);const l1=tr+dd,l2=tr-dd;const ang=Math.abs(b)<1e-12?(a>=c?0:Math.PI/2):Math.atan2(l1-a,b);
  let d='';for(let i=0;i<=120;i++){const t=2*Math.PI*i/120;const u=r*Math.sqrt(l1)*Math.cos(t),v=r*Math.sqrt(l2)*Math.sin(t);const x=mu[0]+u*Math.cos(ang)-v*Math.sin(ang),y=mu[1]+u*Math.sin(ang)+v*Math.cos(ang);d+=(i?'L':'M')+F.X(x).toFixed(1)+','+F.Y(y).toFixed(1)}
  E('path',{d:d,fill:'none',stroke:stroke,'stroke-width':w||2,'stroke-dasharray':dash||''},g)}
const legendRow=(g,x,y,kind,label,c)=>{if(kind==='dot')dot(g,x,y,5,c,'#fff',1);else if(kind==='x')cross(g,x,y,5,c,2);else if(kind==='line')ln(g,x-10,y,x+10,y,c,2.5);else if(kind==='dash')ln(g,x-10,y,x+10,y,c,2.5,'6 4');else if(kind==='ring'){dot(g,x,y,6,'none',c,1.8)}else if(kind==='rect')E('rect',{x:x-8,y:y-6,width:16,height:12,fill:c,stroke:'#bfbfbf'},g);T(g,x+16,y+5,label,'','start')};

/* ---------- the two-density data set (lab sections 4 to 8) ---------- */
const X2=AD.x2,G2=AD.g2,Y2=G2.map(v=>v>=2?1:0),N2=X2.length;const GCOL=[C.b,C.gl,C.k,C.k];
const XR=[-4.5,11],YR=[-4.5,10],NX=84,NY=78,LO=[XR[0],YR[0]],HI=[XR[1],YR[1]];
const GRID=[];for(let j=0;j<NY;j++)for(let i=0;i<NX;i++)GRID.push([LO[0]+i*(HI[0]-LO[0])/(NX-1),LO[1]+j*(HI[1]-LO[1])/(NY-1)]);
const dist2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2;
let NB=null;/* for every grid cell: the 60 nearest training points (sorted) */
function nbGrid(){if(NB)return NB;NB={d:[],i:[]};const idx=[...Array(N2).keys()];GRID.forEach(p=>{const d=X2.map(x=>Math.sqrt(dist2(p,x)));const o=idx.slice().sort((a,b)=>d[a]-d[b]).slice(0,60);NB.i.push(o);NB.d.push(o.map(k=>d[k]))});return NB}
let NBT=null;/* training points: neighbours excluding themselves */
function nbTrain(){if(NBT)return NBT;NBT={d:[],i:[]};const idx=[...Array(N2).keys()];X2.forEach((p,s)=>{const d=X2.map(x=>Math.sqrt(dist2(p,x)));const o=idx.filter(k=>k!==s).sort((a,b)=>d[a]-d[b]).slice(0,61);NBT.i.push(o);NBT.d.push(o.map(k=>d[k]))});return NBT}
function drawPoints(g,F,o){o=o||{};X2.forEach((p,i)=>{if(G2[i]<2)dot(g,F.X(p[0]),F.Y(p[1]),o.r||2.6,GCOL[G2[i]],'#fff',0.6)});
  X2.forEach((p,i)=>{if(G2[i]===3)cross(g,F.X(p[0]),F.Y(p[1]),4.5,C.k,2);if(G2[i]===2){cross(g,F.X(p[0]),F.Y(p[1]),4.5,C.r,2.2)}})}
function mapLegend(g,x,y){legendRow(g,x,y,'dot','dense cluster',C.b);legendRow(g,x,y+22,'dot','sparse cluster',C.gl);legendRow(g,x,y+44,'x','local outlier',C.r);legendRow(g,x,y+66,'x','global outlier',C.k);legendRow(g,x,y+88,'line','flags 10 points',C.k)}
function colorBar(g,x,y,w){for(let i=0;i<40;i++){const c=warm(i/39);E('rect',{x:x+i*w/40,y:y,width:w/40+0.5,height:12,fill:'rgb('+c.join(',')+')'},g)}E('rect',{x:x,y:y,width:w,height:12,fill:'none',stroke:'#bfbfbf'},g);T(g,x,y+28,'normal','','start');T(g,x+w,y+28,'anomalous','','end')}
/* draw a score map: grid scores sg, training scores st (higher = more anomalous) */
function scoreMap(svg,F,sg,st){const sorted=sortNum(st);const g=clipRect(svg,F.ox,F.oy,F.W,F.H);raster(g,F,LO,HI,NX,NY,k=>warm(pctile(sorted,sg[k])));
  contour(g,F,sg,LO,HI,NX,NY,sorted[N2-10]-1e-12,C.k,1.6);E('rect',{x:F.ox,y:F.oy,width:F.W,height:F.H,fill:'none',stroke:'#bfbfbf'},svg);drawPoints(svg,F)}

/* ---------- where we are: the pipeline ---------- */
FIG['an-where']=root=>{const svg=initSvg(svgOf(root),1160,215);const r=rng(3);
  const panel=(x,w,title)=>{E('rect',{x:x,y:30,width:w,height:160,rx:8,fill:'#fafafa',stroke:'#d0d0d0'},svg);T(svg,x+w/2,20,title,'lab')};
  panel(10,220,'claims, no labels');const pts=[];for(let i=0;i<70;i++)pts.push([120+38*randn(r),110+26*randn(r)]);pts.push([205,52],[40,170],[200,172]);
  pts.forEach(p=>dot(svg,Math.max(20,Math.min(220,p[0])),Math.max(40,Math.min(182,p[1])),3.5,'#a5a5a5','#fff',0.6));
  arrowPx(svg,236,110,268,110,'ln thin sk','fk');
  box(svg,272,80,150,60,'detector\nlearns "normal"','#dae3f3',{cls:'lab',stroke:C.b,lh:20});
  arrowPx(svg,428,110,460,110,'ln thin sk','fk');
  panel(464,230,'a score per claim');const sc=pts.map(p=>Math.hypot((p[0]-120)/38,(p[1]-110)/26));
  pts.forEach((p,i)=>{const t=Math.min(1,sc[i]/3.2);const c=warm(0.8+0.2*t);dot(svg,464+Math.max(10,Math.min(220,p[0]))-10,Math.max(40,Math.min(182,p[1])),3.8,'rgb('+c.join(',')+')',t>0.75?C.r:'#bfbfbf',t>0.75?1.4:0.6)});
  arrowPx(svg,700,110,732,110,'ln thin sk','fk');
  panel(736,220,'ranked');const order=sc.map((v,i)=>i).sort((a,b)=>sc[b]-sc[a]).slice(0,12);
  order.forEach((i,k)=>{const w=Math.min(150,48*sc[i]);E('rect',{x:752,y:40+k*12.3,width:w,height:9,fill:k<4?C.r:'#bfbfbf'},svg)});
  E('path',{d:'M912,40 h10 v48 h-10',fill:'none',stroke:C.r,'stroke-width':1.6},svg);T(svg,928,69,'top k','','start').style.fill=C.r;
  arrowPx(svg,962,110,994,110,'ln thin sk','fk');
  panel(998,152,'investigators');[[1048,100],[1100,100]].forEach(([x,y])=>{dot(svg,x,y-14,10,'#7f7f7f','#fff',1);E('path',{d:'M'+(x-16)+','+(y+22)+' q16,-34 32,0',fill:'#7f7f7f'},svg)});
  T(svg,1074,150,'review k a day','');T(svg,1074,170,'verdicts = labels','');
  E('path',{d:'M1074,192 C1074,212 347,212 347,145',fill:'none',stroke:C.m,'stroke-width':1.4,'stroke-dasharray':'5 4'},svg);arrowPx(svg,347,152,347,144,'ln thin sm','fm');
  halo(T(svg,710,209,'feedback: labels improve the detector (Part E)',''))};

/* ---------- three kinds of anomaly ---------- */
FIG['an-kinds']=root=>{const svg=initSvg(svgOf(root),1160,250);const W=370;
  const panel=(k,title)=>{const x=k*395;E('rect',{x:x+4,y:4,width:W,height:240,rx:8,fill:'#fafafa',stroke:'#d0d0d0'},svg);T(svg,x+4+W/2,26,title,'lab');return x+4};
  let x0=panel(0,'point');const r=rng(8);const A=Plot(svg,{at:[x0,30],w:W,h:212,x:[0,30],y:[0,16],m:{l:44,r:12,t:6,b:34}});A.axes({xt:[0,10,20,30],yt:[0,5,10,15],xl:'vehicle value (k€)',yl:'claim (k€)',grid:false});
  for(let i=0;i<90;i++){const v=5+20*r();A.dot(v,Math.max(0.2,0.12*v*Math.exp(0.45*randn(r))),3,'fm')}const p=A.dot(13,12,6,'');p.setAttribute('fill',C.r);p.setAttribute('stroke','#fff');halo(A.text(13,12,'€12k on a €13k car','lab','start',10,-6));
  x0=panel(1,'contextual');const B=Plot(svg,{at:[x0,30],w:W,h:212,x:[0,365],y:[0,150],m:{l:44,r:12,t:6,b:34}});B.axes({xt:[0,90,180,270,365],fx:v=>['Jan','Apr','Jul','Oct','Dec'][[0,90,180,270,365].indexOf(v)],yt:[50,100,150],xl:'day of the year',yl:'claims/day',grid:false});
  const r2=rng(2);const pts=[];for(let d=0;d<365;d+=2){const mu=80*(1+0.35*Math.cos(2*Math.PI*(d-15)/365))*((d%7)>4?0.6:1);pts.push([d,mu+6*randn(r2)])}B.path(pts,'ln thin sm');
  B.line(0,140,365,140,'ln thin so dash');B.text(10,140,'global threshold','','start',0,-6).style.fill=C.o;const s=B.dot(200,98,6,'');s.setAttribute('fill',C.r);s.setAttribute('stroke','#fff');halo(B.text(200,98,'100 in July','lab','middle',0,-12));
  x0=panel(2,'collective');const Cc=Plot(svg,{at:[x0,30],w:W,h:212,x:[0,90],y:[0.4,5.6],m:{l:66,r:12,t:6,b:34}});Cc.axes({xt:[0,30,60,90],yt:[],xl:'day',grid:false});
  const r3=rng(5);['garage A','garage B','garage C','garage D','garage E'].forEach((gname,k)=>{T(Cc.root,60,Cc.Y(5-k)+5,gname,'','end');const n=[9,7,3,6,8][k];for(let i=0;i<n;i++)Cc.dot(90*r3(),5-k,3.5,'fm')});
  E('rect',{x:Cc.X(52),y:Cc.Y(3)-10,width:Cc.X(70)-Cc.X(52),height:20,rx:6,fill:'#fbe5d6',stroke:C.r},Cc.bg);for(let i=0;i<9;i++){const c=Cc.dot(53.5+i*1.9,3,3.5,'');c.setAttribute('fill',C.r);c.setAttribute('stroke','#fff')}
  halo(Cc.text(61,3.45,'9 young policies in 3 weeks','lab','middle',0,-8))};

/* ---------- three settings ---------- */
FIG['an-settings']=root=>{const svg=initSvg(svgOf(root),1160,200);const r=rng(11);const base=[];for(let i=0;i<40;i++)base.push([randn(r)*0.9,randn(r)*0.7]);const an=[[2.6,1.6],[-2.4,1.9],[2.2,-1.9]];
  const panel=(k,title)=>{const x=k*390;E('rect',{x:x+4,y:4,width:372,height:190,rx:8,fill:'#fafafa',stroke:'#d0d0d0'},svg);T(svg,x+190,26,title,'lab');return frame(x+20,36,340,150,[-3.4,3.4],[-2.6,2.6])};
  let F=panel(0,'supervised: labels for both');base.forEach(p=>dot(svg,F.X(p[0]),F.Y(p[1]),4,C.b));an.forEach(p=>cross(svg,F.X(p[0]),F.Y(p[1]),5,C.r,2.4));
  F=panel(1,'novelty: clean normal data');base.forEach(p=>dot(svg,F.X(p[0]),F.Y(p[1]),4,C.b));const nx=F.X(2.5),ny=F.Y(-1.6);dot(svg,nx,ny,9,'#fff',C.k,1.6);T(svg,nx,ny+5,'?','lab');halo(T(svg,nx,ny-16,'new case','','middle'));
  F=panel(2,'outlier detection: unlabelled');base.concat(an).forEach(p=>dot(svg,F.X(p[0]),F.Y(p[1]),4,'#a5a5a5'));an.forEach(p=>dot(svg,F.X(p[0]),F.Y(p[1]),10,'none',C.m,1.2));halo(T(svg,F.X(0),F.Y(-2.45),'anomalies hidden in the training data',''))};

/* ---------- base rates ---------- */
FIG['an-baserate']=root=>{const svg=svgOf(root);const PI=[0.1,0.03,0.01,0.003,0.001,0.0003];let fpr=0.01;const tpr=0.9,N=100000;
  function draw(){const p=PI[+q(root,'p').value];setV(root,'p',pc(p,p<0.001?2:1));initSvg(svg,620,370);
    const nf_=N*p,no=N-nf_,tp=tpr*nf_,fn=nf_-tp,fp=fpr*no,prec=tp/(tp+fp);
    T(svg,310,20,'100,000 claims · base rate '+pc(p,p<0.001?2:1)+' · TPR 90 % · FPR '+pc(fpr,1),'lab');
    T(svg,20,56,'frauds: '+th(nf_),'lab','start');T(svg,190,56,'caught '+th(tp),'','start').style.fill=C.r;T(svg,330,56,'missed '+th(fn),'','start');
    T(svg,20,84,'honest: '+th(no),'lab','start');T(svg,190,84,'false alarms '+th(fp),'','start').style.fill='#595959';T(svg,330,84,'correctly ignored '+th(no-fp),'','start');
    const tot=tp+fp,W=580;T(svg,20,120,'the alerts: '+th(tot),'lab','start');const wr=W*tp/tot;
    E('rect',{x:20,y:130,width:Math.max(1.5,wr),height:30,fill:C.r},svg);E('rect',{x:20+wr,y:130,width:W-wr,height:30,fill:'#d9d9d9',stroke:'#bfbfbf'},svg);
    if(wr>80)T(svg,20+wr/2,150,th(tp)+' frauds','').style.fill='#fff';else T(svg,24+wr,176,'← '+th(tp)+' frauds','','start').style.fill=C.r;
    if(W-wr>120)T(svg,20+wr+(W-wr)/2,150,th(fp)+' false alarms','');
    const t=T(svg,310,206,'precision of the alerts: '+pc(prec),'lab big');t.style.fill=prec<0.2?C.r:C.k;
    const Pl=Plot(svg,{at:[0,214],w:620,h:156,x:[0.0001,0.3],y:[0,1],logx:true,m:{l:66,r:16,t:8,b:34}});Pl.axes({xt:[0.0001,0.001,0.01,0.1],fx:v=>pc(v,v<0.001?2:(v<0.01?1:0)),yt:[0.5,1],fy:v=>(100*v)+' %',xl:'base rate π (log scale)',yl:'precision'});
    [[0.01,C.o,'FPR 1 %'],[0.001,C.gl,'FPR 0.1 %']].forEach(([f,c,lab])=>{const P=Pl.fn(x=>tpr*x/(tpr*x+f*(1-x)),'ln thin',0.0001,0.3,120);P.setAttribute('stroke',c);P.setAttribute('stroke-width',f===fpr?3:1.4)});
    Pl.text(0.0004,0.86,'FPR 0.1 %','','start').style.fill=C.g;Pl.text(0.035,0.42,'FPR 1 %','','start').style.fill=C.o;
    const d=Pl.dot(p,prec,6,'');d.setAttribute('fill',C.k);d.setAttribute('stroke','#fff')}
  segs(root,'f',v=>{fpr=+v/100;draw()});onInput(root,'p',draw)};

/* ---------- z-score masking ---------- */
FIG['an-mask']=root=>{const svg=svgOf(root);const base=AD.base50;let m=1;
  const zs=x=>{const n=x.length,mu=x.reduce((a,b)=>a+b,0)/n,sd=Math.sqrt(x.reduce((a,b)=>a+(b-mu)**2,0)/n);return {mu:mu,sd:sd,z:v=>(v-mu)/sd}};
  const med=a=>{const s=a.slice().sort((p,q2)=>p-q2),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2};
  const rz=x=>{const md=med(x),mad=med(x.map(v=>Math.abs(v-md)));return {md:md,mad:mad,z:v=>0.6745*(v-md)/mad}};
  function draw(){const v=+q(root,'v').value;setV(root,'v',v);initSvg(svg,620,380);const x=base.concat(new Array(m).fill(v));const Z=zs(x),R=rz(x);
    const X=t=>40+(t+4)*560/46;T(svg,310,16,'50 values from N(0, 1) and '+m+' outlier'+(m>1?'s':'')+' at v = '+v,'lab');
    const lo=Z.mu-3*Z.sd,hi=Z.mu+3*Z.sd;E('rect',{x:X(Math.max(-4,lo)),y:28,width:X(Math.min(42,hi))-X(Math.max(-4,lo)),height:24,fill:'#fbe5d6',stroke:C.o},svg);
    const rl=R.md-3.5*R.mad/0.6745,rh=R.md+3.5*R.mad/0.6745;E('rect',{x:X(rl),y:56,width:X(rh)-X(rl),height:24,fill:'#e2f0d9',stroke:C.gl},svg);
    T(svg,X(Math.min(42,hi))+6,45,'mean ± 3σ','','start').style.fill='#c55a11';T(svg,X(rh)+6,73,'median ± 3.5 MAD/0.6745','','start').style.fill=C.g;
    ln(svg,X(-4),100,X(42),100,'#595959',1);[0,10,20,30,40].forEach(t=>{ln(svg,X(t),100,X(t),105,'#595959',1);T(svg,X(t),120,String(t),'')});
    base.forEach((b,i)=>dot(svg,X(b),94-(i%3)*4,2.6,C.b,'none',0));for(let i=0;i<m;i++)dot(svg,X(v),94-i*7,4,C.r,'#fff',1);
    const Pl=Plot(svg,{at:[0,128],w:620,h:252,x:[1,40],y:[0,26],m:{l:48,r:118,t:10,b:36}});Pl.axes({xt:[10,20,30,40],yt:[0,3,10,20],xl:'value v of the outliers',yl:'score of the outliers'});
    const zc=t=>zs(base.concat(new Array(m).fill(t))).z(t),rc=t=>rz(base.concat(new Array(m).fill(t))).z(t);
    Pl.line(1,3,40,3,'ln thin sk');Pl.line(1,Math.sqrt(50/m),40,Math.sqrt(50/m),'ln thin sb dot2');
    Pl.fn(zc,'ln sb',1,40,120);Pl.fn(rc,'ln sg',1,40,120);
    const zv=zc(v),rv=rc(v);const d1=Pl.dot(v,zv,5.5,'');d1.setAttribute('fill',C.b);d1.setAttribute('stroke','#fff');const d2=Pl.dot(v,Math.min(rv,26),5.5,'');d2.setAttribute('fill',C.gl);d2.setAttribute('stroke','#fff');
    const tx=T(Pl.root,510,Pl.Y(Math.sqrt(50/m))-5,'√(50/m) = '+nf(Math.sqrt(50/m)),'','start');tx.style.fill=C.b;
    T(Pl.root,510,Pl.Y(3)+16,'3-sigma rule','','start');
    T(Pl.root,510,40,'z = '+nf(zv),'lab','start').style.fill=C.b;T(Pl.root,510,62,'robust z = '+nf(rv,1),'lab','start').style.fill=C.g;
    T(Pl.root,510,84,zv>3?'flagged by z':'missed by z','','start').style.fill=zv>3?C.k:C.r}
  segs(root,'m',val=>{m=+val;draw()});onInput(root,'v',draw)};

/* ---------- robust z with numbers ---------- */
FIG['an-robust']=root=>{const svg=svgOf(root);const A=AD.amounts;const n=A.length;const mu=A.reduce((a,b)=>a+b,0)/n,sd=Math.sqrt(A.reduce((a,b)=>a+(b-mu)**2,0)/n);
  const s_=A.slice().sort((a,b)=>a-b);const md=(s_[4]+s_[5])/2;const dev=A.map(v=>Math.abs(v-md)).sort((a,b)=>a-b);const mad=(dev[4]+dev[5])/2;
  const qt=p=>{const h=(n-1)*p,lo=Math.floor(h);return s_[lo]+(h-lo)*(s_[lo+1]-s_[lo])};const q1=qt(0.25),q3=qt(0.75),fl=q1-1.5*(q3-q1),fh=q3+1.5*(q3-q1);
  stepper(root,s=>{initSvg(svg,620,340);const X=v=>40+(v+200)*550/3600;
    ln(svg,X(-200),120,X(3400),120,'#595959',1);[0,1000,2000,3000].forEach(t=>{ln(svg,X(t),120,X(t),125,'#595959',1);T(svg,X(t),142,'€'+th(t),'')});
    if(s>=1){E('rect',{x:X(-200),y:52,width:X(3400)-X(-200),height:22,fill:'#fbe5d6',stroke:C.o},svg);halo(T(svg,X(1400),68,'mean ± 3σ = [−1,919, 3,991]: everything inside','')).style.fill='#c55a11';ln(svg,X(mu),48,X(mu),120,C.o,2);halo(T(svg,X(mu),42,'mean '+th(mu),'')).style.fill='#c55a11'}
    if(s>=2){const lo=md-3.5*mad/0.6745,hi=md+3.5*mad/0.6745;E('rect',{x:X(lo),y:80,width:X(hi)-X(lo),height:22,fill:'#e2f0d9',stroke:C.gl},svg);ln(svg,X(md),78,X(md),120,C.g,2);T(svg,X(hi)+8,96,'median ± 3.5 MAD/0.6745 = ['+th(lo)+', '+th(hi)+']','','start').style.fill=C.g}
    if(s>=3){[fl,fh].forEach(v=>ln(svg,X(v),30,X(v),150,C.k,1.6,'5 4'));halo(T(svg,X(fh)+6,166,'Tukey fences ['+th(fl)+', '+th(fh)+']','','start'))}
    A.forEach((v,i)=>{const big=v>2000;dot(svg,X(v),114-(big?0:(i%2)*7),5,big?C.r:C.b,'#fff',1);if(s>=3&&big)dot(svg,X(v),114,10,'none',C.k,1.6)});
    const rows=[[420,'smallest'],[650,'largest ordinary'],[2900,''],[3100,'']];const cx=[60,250,350,450,540];
    ['claim (€)','','z','robust z','flagged'].forEach((h,k)=>{if(h)T(svg,cx[k],186,h,'lab',k===0?'start':'middle')});ln(svg,40,194,600,194,'#7f7f7f',1);
    rows.forEach(([v,lab],k)=>{const y=218+k*28;T(svg,cx[0],y,th(v),'','start');if(lab)T(svg,cx[0]+60,y,lab,'','start');
      if(s>=1)T(svg,cx[2],y,nf((v-mu)/sd),'').style.fill=Math.abs((v-mu)/sd)>3?C.r:C.k;if(s>=2){const t=T(svg,cx[3],y,nf(0.6745*(v-md)/mad,1),'');t.style.fill=Math.abs(0.6745*(v-md)/mad)>3.5?C.r:C.k}
      if(s>=3)T(svg,cx[4],y,(v<fl||v>fh)?'yes':'no','').style.fill=(v<fl||v>fh)?C.r:C.k})})};

/* ---------- Mahalanobis vs Euclidean ---------- */
FIG['an-maha']=root=>{const svg=svgOf(root);const X=AD.xcor;const {mu,S}=covOf(X);const L=[[Math.sqrt(S[0][0]),0],[0,0]];L[1][0]=S[1][0]/L[0][0];L[1][1]=Math.sqrt(S[1][1]-L[1][0]**2);
  const wh=p=>{const a=p[0]-mu[0],b=p[1]-mu[1];const z1=a/L[0][0];return [z1,(b-L[1][0]*z1)/L[1][1]]};const AB=[[2.2,2.2],[1.2,-1.2]];
  const draw=w=>{initSvg(svg,620,380);const whiten=w==='wh';const F=frame(10,24,400,348,whiten?[-4.6,4.6]:[-4,4],whiten?[-4.4,4.4]:[-3.5,3.5]);
    T(svg,210,16,whiten?'whitened: z = L⁻¹(x − μ)':(w==='eu'?'Euclidean distance: circles 1, 2, 3':'Mahalanobis distance: ellipses 1, 2, 3'),'lab');
    E('rect',{x:F.ox,y:F.oy,width:F.W,height:F.H,fill:'#fff',stroke:'#d0d0d0'},svg);const g=clipRect(svg,F.ox,F.oy,F.W,F.H);
    X.forEach(p=>{const z=whiten?wh(p):p;dot(g,F.X(z[0]),F.Y(z[1]),2.2,'#a5a5a5','none',0)});
    [1,2,3].forEach(r=>{if(w==='ma')ellipse(g,F,mu,S,r,C.b,1.6);else ellipse(g,F,whiten?[0,0]:mu,[[1,0],[0,1]],r,C.b,1.6)});
    const dE=AB.map(p=>Math.hypot(p[0]-mu[0],p[1]-mu[1])),dM=AB.map(p=>maha(p,mu,S));
    AB.forEach((p,k)=>{const z=whiten?wh(p):p;dot(svg,F.X(z[0]),F.Y(z[1]),6,C.r,'#fff',1.4);const val=w==='eu'?dE[k]:dM[k];let ly=F.Y(z[1])+(k?18:-8);if(ly>F.oy+F.H-6)ly=F.Y(z[1])-10;if(ly<F.oy+16)ly=F.Y(z[1])+20;halo(T(svg,Math.min(F.X(z[0])+10,F.ox+F.W-70),ly,'AB'[k]+': '+nf(val),'lab','start'))});
    const x0=430;T(svg,x0,60,'distance from the centre','lab','start');T(svg,x0,92,'','','start');
    [['','Euclid.','Mahal.']].concat(AB.map((p,k)=>['AB'[k],nf(dE[k]),nf(dM[k])])).forEach((row,r)=>row.forEach((c,j)=>{const t=T(svg,x0+[0,70,140][j],96+r*28,c,r===0?'':'lab','start');if(r>0&&j===(w==='eu'?1:2))t.style.fill=C.r}));
    T(svg,x0,200,'correlation 0.8:','','start');T(svg,x0,220,'A lies along the cloud,','','start');T(svg,x0,240,'B goes against it','','start');
    if(whiten){T(svg,x0,280,'after whitening the cloud','','start');T(svg,x0,300,'is round, and D_M is the','','start');T(svg,x0,320,'plain distance ‖z‖','','start')}};
  const cur=segs(root,'w',draw);draw(cur()||'eu')};

/* ---------- the chi-squared threshold ---------- */
FIG['an-chi2']=root=>{const svg=svgOf(root);const X=AD.xcor;const {mu,S}=covOf(X);const lab2=X.map(p=>maha(p,mu,S)**2);const cache={};
  const sim=d=>{if(cache[d])return cache[d];const r=rng(100+d);const a=[];for(let i=0;i<3000;i++){let s=0;for(let j=0;j<d;j++){const z=randn(r);s+=z*z}a.push(s)}return cache[d]=a};
  onInput(root,'d',()=>{const d=+q(root,'d').value;setV(root,'d',d);initSvg(svg,620,370);const data=d===2?lab2:sim(d);const qd=chi2ppf(0.975,d);
    const xmax=Math.max(12,qd*1.45);const nb=40,bw=xmax/nb;const h=new Array(nb).fill(0);data.forEach(v=>{const b=Math.floor(v/bw);if(b<nb)h[b]++});const dens=h.map(c=>c/(data.length*bw));
    let ymax=0;for(let i=1;i<200;i++)ymax=Math.max(ymax,chi2pdf(i*xmax/200,d));ymax=Math.max(ymax,...dens)*1.12;if(d===1)ymax=Math.min(ymax,1.2);
    const Pl=Plot(svg,{w:620,h:370,x:[0,xmax],y:[0,ymax],m:{l:54,r:16,t:56,b:42}});Pl.axes({xt:[0,xmax/4,xmax/2,3*xmax/4,xmax].map(v=>Math.round(v)),yt:[0,ymax/2].map(v=>+v.toFixed(2)),xl:'squared Mahalanobis distance D²',yl:'density'});
    dens.forEach((v,i)=>Pl.rect(i*bw,0,(i+1)*bw,Math.min(v,ymax),'fw').setAttribute('style','fill:#d9d9d9;stroke:#a5a5a5;stroke-width:0.6'));
    const P=Pl.fn(x=>Math.min(chi2pdf(x,d),ymax*1.2),'ln sb',xmax/400,xmax,300);
    Pl.line(qd,0,qd,ymax,'ln thin sr dash');const above=data.filter(v=>v>qd).length/data.length;
    T(Pl.root,310,20,'d = '+d+': the 97.5 % quantile of χ²('+d+') is '+nf(qd)+'  (D = '+nf(Math.sqrt(qd))+')','lab');
    T(Pl.root,310,42,(d===2?'the lab\'s 500 points':'3,000 simulated Gaussian points')+': '+pc(above)+' above (2.5 % expected) · mean D² = '+nf(data.reduce((a,b)=>a+b,0)/data.length,1),'')})};

/* ---------- MCD vs contamination ---------- */
FIG['an-mcd']=root=>{const svg=svgOf(root);const M=AD.mcd;const thr=Math.sqrt(chi2ppf(0.975,2));
  onInput(root,'c',()=>{const L=M.levels[+q(root,'c').value];setV(root,'c',L.m+' ('+nf(L.pct,1)+' %)');initSvg(svg,620,380);
    const F=frame(8,28,400,346,[-3.8,4.6],[-4,3.6]);T(svg,210,18,'300 normal points + '+L.m+' outliers ('+nf(L.pct,1)+' %)','lab');
    E('rect',{x:F.ox,y:F.oy,width:F.W,height:F.H,fill:'#fff',stroke:'#d0d0d0'},svg);const g=clipRect(svg,F.ox,F.oy,F.W,F.H);
    M.xin.forEach(p=>dot(g,F.X(p[0]),F.Y(p[1]),2.4,'#a5a5a5','none',0));M.xout.slice(0,L.m).forEach(p=>dot(g,F.X(p[0]),F.Y(p[1]),2.8,C.r,'none',0));
    ellipse(g,F,L.mc,L.Sc,thr,C.o,2.4,'7 5');ellipse(g,F,L.mr,L.Sr,thr,C.b,2.4);
    const x0=430;legendRow(svg,x0+10,60,'dash','classical 97.5 %',C.o);legendRow(svg,x0+10,84,'line','MCD 97.5 %',C.b);legendRow(svg,x0+10,108,'dot','planted outliers',C.r);
    T(svg,x0,150,'outliers flagged','lab','start');T(svg,x0,176,'classical: '+L.fc+' of '+L.m,'','start').style.fill='#c55a11';T(svg,x0,198,'MCD: '+L.fr+' of '+L.m,'','start').style.fill=C.b;
    T(svg,x0,236,'normal points flagged','lab','start');T(svg,x0,262,'classical: '+L.fpc+' of 300','','start').style.fill='#c55a11';T(svg,x0,284,'MCD: '+L.fpr+' of 300','','start').style.fill=C.b;
    T(svg,x0,322,'(7.5 expected by chance)','','start')})};

/* ---------- distance and density maps ---------- */
FIG['an-density']=root=>{const svg=svgOf(root);const cache={};const k=10,h=0.4;const gm=AD.gmm2;
  const gmmNLL=p=>{let s=0;gm.w.forEach((w,c)=>{const S=gm.S[c],m=gm.mu[c];const det=S[0][0]*S[1][1]-S[0][1]**2;const a=p[0]-m[0],b=p[1]-m[1];const q2=(S[1][1]*a*a-2*S[0][1]*a*b+S[0][0]*b*b)/det;s+=w*Math.exp(-q2/2)/(2*Math.PI*Math.sqrt(det))});return -Math.log(s+1e-300)};
  const kdeNLL=p=>{let s=0;for(let i=0;i<N2;i++)s+=Math.exp(-dist2(p,X2[i])/(2*h*h));return -Math.log(s/(N2*2*Math.PI*h*h)+1e-300)};
  function scores(m){if(cache[m])return cache[m];let sg,st;
    if(m==='knn'){const nb=nbGrid(),nt=nbTrain();sg=nb.d.map(d=>Math.log(d[k-1]));st=nt.d.map(d=>Math.log(d[k-1]))}
    else if(m==='kde'){sg=GRID.map(kdeNLL);st=X2.map(kdeNLL)}else{sg=GRID.map(gmmNLL);st=X2.map(gmmNLL)}
    return cache[m]={sg:sg,st:st}}
  const NAME={knn:'k-NN distance (k = 10)',kde:'kernel density (h = 0.4), −log p',gmm:'Gaussian mixture (2), −log p'};
  const draw=m=>{initSvg(svg,620,380);const {sg,st}=scores(m);const F=frame(4,26,404,350,XR,YR);T(svg,206,17,NAME[m],'lab');scoreMap(svg,F,sg,st);
    const loc=[...Array(N2).keys()].filter(i=>G2[i]===2);const x0=428;mapLegend(svg,x0+10,46);
    T(svg,x0,176,'ranks of the 2 local','lab','start');T(svg,x0,196,'outliers (1 = top):','lab','start');T(svg,x0,224,loc.map(i=>rankOf(st,i)).join(' and '),'lab big','start').style.fill=C.r;
    T(svg,x0,256,'AUC '+nf(auc(Y2,st),3),'','start');colorBar(svg,x0,300,170)};
  const cur=segs(root,'s',draw);draw(cur()||'knn')};

/* ---------- LOF worked example (6 points) ---------- */
FIG['an-lof6']=root=>{const svg=svgOf(root);const P=AD.lof6.P,NM=['A','B','C','D','E','F'],k=2;const n=P.length;
  const D=P.map(a=>P.map(b=>Math.hypot(a[0]-b[0],a[1]-b[1])));const nb=P.map((_,i)=>[...Array(n).keys()].filter(j=>j!==i).sort((a,b)=>D[i][a]-D[i][b]).slice(0,k));
  const kd=nb.map((o,i)=>D[i][o[k-1]]);const reach=nb.map((o,i)=>o.map(j=>Math.max(D[i][j],kd[j])));const lrd=reach.map(r=>1/(r.reduce((a,b)=>a+b,0)/k));const lof=nb.map((o,i)=>o.reduce((s,j)=>s+lrd[j],0)/k/lrd[i]);
  const off={A:[-16,18],B:[-16,-10],C:[14,18],D:[14,20],E:[12,-10],F:[0,-14]};
  stepper(root,s=>{initSvg(svg,620,380);const F=frame(4,10,416,366,[-1.6,9],[-1.6,7.6]);E('rect',{x:F.ox,y:F.oy,width:F.W,height:F.H,fill:'#fff',stroke:'#d0d0d0'},svg);const g=clipRect(svg,F.ox,F.oy,F.W,F.H);
    if(s>=1)P.forEach((p,i)=>E('circle',{cx:F.X(p[0]),cy:F.Y(p[1]),r:kd[i]*F.s,fill:'none',stroke:'#a5a5a5','stroke-width':1,'stroke-dasharray':'3 3'},g));
    if(s>=1)nb.forEach((o,i)=>o.forEach((j,t)=>{const a=P[i],b=P[j];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const ux=(b[0]-a[0])/L,uy=(b[1]-a[1])/L;
      const hot=(i>=4)||(s===2&&i===0);arrowPx(svg,F.X(a[0]+ux*0.18),F.Y(a[1]+uy*0.18),F.X(b[0]-ux*0.2),F.Y(b[1]-uy*0.2),hot?'ln thin so':'ln thin sm',hot?'fo':'fm');
      if(s===2&&hot&&!(i===0&&t===1)){const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;const lab=i===0?'2, not 1':nf(reach[i][t]);const right=(i===0)||(t===0);halo(T(svg,F.X(mx)+(i===0?0:(right?7:-7)),F.Y(my)+(i===0?24:(i===5&&t===1?16:-6)),lab,'lab',i===0?'middle':(right?'start':'end'))).style.fill='#c55a11'}}));
    P.forEach((p,i)=>{const c=s>=4?(lof[i]>2?C.r:lof[i]>1.2?C.o:C.b):C.b;dot(svg,F.X(p[0]),F.Y(p[1]),8,c,'#fff',1.5);halo(T(svg,F.X(p[0])+off[NM[i]][0],F.Y(p[1])+off[NM[i]][1],NM[i],'lab'))});
    const x0=428,cw=[0,44,96,146];['','d₂','lrd','LOF'].forEach((hh,j)=>T(svg,x0+cw[j]+(j?20:4),40,hh,'lab'));ln(svg,x0,48,614,48,'#7f7f7f',1);
    NM.forEach((nm,i)=>{const y=74+i*28;T(svg,x0+4,y,nm,'lab');if(s>=1)T(svg,x0+cw[1]+20,y,nf(kd[i],2),'');if(s>=3)T(svg,x0+cw[2]+20,y,nf(lrd[i],3),'');if(s>=4){const t=T(svg,x0+cw[3]+20,y,nf(lof[i],2),'lab');t.style.fill=lof[i]>2?C.r:lof[i]>1.2?'#c55a11':C.k}});
    const msg=['six points, k = 2','circles of radius d₂; arrows to N₂','orange: reach = max(d, d₂ of the target)','lrd = 1 / mean reach','LOF = mean lrd of neighbours / own lrd'][s];T(svg,528,268,msg.length>30?msg.slice(0,msg.lastIndexOf(' ',30)):msg,'');if(msg.length>30)T(svg,528,288,msg.slice(msg.lastIndexOf(' ',30)+1),'')})};

/* ---------- LOF map with k ---------- */
FIG['an-lofmap']=root=>{const svg=svgOf(root);const cache={};
  function lofs(k){if(cache[k])return cache[k];const nt=nbTrain(),nb=nbGrid();const kd=nt.d.map(d=>d[k-1]);
    const lrdT=nt.i.map((o,s)=>1/(o.slice(0,k).reduce((a,j,t)=>a+Math.max(nt.d[s][t],kd[j]),0)/k));const st=nt.i.map((o,s)=>o.slice(0,k).reduce((a,j)=>a+lrdT[j],0)/k/lrdT[s]);
    const sg=nb.i.map((o,c)=>{const lr=1/(o.slice(0,k).reduce((a,j,t)=>a+Math.max(nb.d[c][t],kd[j]),0)/k);return Math.log(o.slice(0,k).reduce((a,j)=>a+lrdT[j],0)/k/lr)});
    return cache[k]={st:st,sg:sg}}
  onInput(root,'k',()=>{const k=+q(root,'k').value;setV(root,'k',k);initSvg(svg,620,380);const {st,sg}=lofs(k);const F=frame(4,26,404,350,XR,YR);T(svg,206,17,'log LOF, k = '+k,'lab');scoreMap(svg,F,sg,st.map(Math.log));
    const loc=[...Array(N2).keys()].filter(i=>G2[i]===2);const med=a=>{const s=a.slice().sort((p,q2)=>p-q2);return (s[(s.length-1)>>1]+s[s.length>>1])/2};const x0=428;mapLegend(svg,x0+10,46);
    T(svg,x0,176,'ranks of the 2 local','lab','start');T(svg,x0,196,'outliers (1 = top):','lab','start');T(svg,x0,224,loc.map(i=>rankOf(st,i)).join(' and '),'lab big','start').style.fill=C.r;
    T(svg,x0,256,'AUC '+nf(auc(Y2,st),3),'','start');T(svg,x0,280,'median LOF: dense '+nf(med(st.filter((_,i)=>G2[i]===0))),'','start');T(svg,x0,300,'sparse '+nf(med(st.filter((_,i)=>G2[i]===1))),'','start');colorBar(svg,x0,322,170)})};

/* ---------- isolation: random cuts ---------- */
FIG['an-isolate']=root=>{const svg=svgOf(root);const r=rng(21);const pts=[];for(let i=0;i<60;i++)pts.push([Math.max(0.3,Math.min(9.7,4.2+1.25*randn(r))),Math.max(0.3,Math.min(9.7,5+1.1*randn(r)))]);pts.push([8.9,1.3]);
  const T_OUT=pts.length-1;let T_IN=0,best=1e9;pts.forEach((p,i)=>{const d=Math.hypot(p[0]-4.2,p[1]-5);if(i<60&&d<best){best=d;T_IN=i}});
  function isolate(t,seed){const rr=rng(seed);let S=[...pts.keys()],reg=[0,10,0,10];const cuts=[];while(S.length>1&&cuts.length<30){const f=rr()<0.5?0:1;const v=S.map(i=>pts[i][f]);const lo=Math.min(...v),hi=Math.max(...v);if(lo===hi)break;const c=lo+(hi-lo)*rr();
      cuts.push({f:f,c:c,reg:reg.slice()});const left=pts[t][f]<c;S=S.filter(i=>(pts[i][f]<c)===left);if(f===0){if(left)reg[1]=c;else reg[0]=c}else{if(left)reg[3]=c;else reg[2]=c}cuts[cuts.length-1].n=S.length}return {cuts:cuts,reg:reg}}
  let seed=1;for(let s0=1;s0<400;s0++){if(isolate(T_OUT,s0).cuts.length===3&&isolate(T_IN,s0+1000).cuts.length===9){seed=s0;break}}
  const R={out:isolate(T_OUT,seed),in:isolate(T_IN,seed+1000)};let tgt='out';
  function draw(){const s=+q(root,'s').value;initSvg(svg,620,380);const run=R[tgt];const h=run.cuts.length;const sh=Math.min(s,h);setV(root,'s',s);
    const F=frame(6,8,400,366,[0,10],[0,10]);E('rect',{x:F.ox,y:F.oy,width:F.W,height:F.H,fill:'#fff',stroke:'#bfbfbf'},svg);
    let reg=[0,10,0,10];for(let k=0;k<sh;k++){const cu=run.cuts[k];reg=cu.reg;}const cur=sh>0?(()=>{const cu=run.cuts[sh-1];const rg=cu.reg.slice();const left=pts[tgt==='out'?T_OUT:T_IN][cu.f]<cu.c;if(cu.f===0){if(left)rg[1]=cu.c;else rg[0]=cu.c}else{if(left)rg[3]=cu.c;else rg[2]=cu.c}return rg})():[0,10,0,10];
    E('rect',{x:F.X(cur[0]),y:F.Y(cur[3]),width:F.X(cur[1])-F.X(cur[0]),height:F.Y(cur[2])-F.Y(cur[3]),fill:'#fff2cc',stroke:'none'},svg);
    for(let k=0;k<sh;k++){const cu=run.cuts[k],rg=cu.reg;if(cu.f===0)ln(svg,F.X(cu.c),F.Y(rg[2]),F.X(cu.c),F.Y(rg[3]),k===sh-1?C.o:'#7f7f7f',k===sh-1?2.6:1.4);else ln(svg,F.X(rg[0]),F.Y(cu.c),F.X(rg[1]),F.Y(cu.c),k===sh-1?C.o:'#7f7f7f',k===sh-1?2.6:1.4)}
    const ti=tgt==='out'?T_OUT:T_IN;pts.forEach((p,i)=>{if(i!==ti)dot(svg,F.X(p[0]),F.Y(p[1]),3.4,'#a5a5a5','#fff',0.6)});dot(svg,F.X(pts[ti][0]),F.Y(pts[ti][1]),7,C.r,'#fff',1.6);
    const x0=428;T(svg,x0,40,tgt==='out'?'target: the outlier':'target: a central point','lab','start');T(svg,x0,72,'cuts so far: '+sh,'','start');
    T(svg,x0,96,'points still with it: '+(sh?run.cuts[sh-1].n:pts.length),'','start');
    if(s>=h){const t=T(svg,x0,138,'isolated after '+h+' cuts','lab','start');t.style.fill=C.r;T(svg,x0,162,'path length h = '+h,'','start')}
    T(svg,x0,220,'one random tree;','','start');T(svg,x0,240,'the forest averages','','start');T(svg,x0,260,'h over many trees','','start');legendRow(svg,x0+10,300,'line','the latest cut',C.o);legendRow(svg,x0+10,324,'rect','the box that holds it','#fff2cc')}
  segs(root,'t',v=>{tgt=v;draw()});onInput(root,'s',draw)};

/* ---------- the score formula ---------- */
FIG['an-ifscore']=root=>{const svg=svgOf(root);let psi=256;
  function draw(){const h=+q(root,'h').value;setV(root,'h',nf(h,1));initSvg(svg,620,370);const c=cfac(psi);
    const Pl=Plot(svg,{w:620,h:370,x:[0,20],y:[0,1],m:{l:54,r:16,t:60,b:42}});Pl.axes({xt:[0,5,10,15,20],yt:[0,0.25,0.5,0.75,1],xl:'mean path length E[h(x)]',yl:'score s'});
    [16,256,4096].forEach(p=>{const P=Pl.fn(e=>Math.pow(2,-e/cfac(p)),'ln thin',0,20,200);P.setAttribute('stroke',p===psi?C.k:'#bfbfbf');P.setAttribute('stroke-width',p===psi?2.6:1.2)});
    Pl.line(0,0.5,20,0.5,'ln thin sm dot2');Pl.line(c,0,c,1,'ln thin sm dot2');Pl.text(c,0.04,'c(ψ) = '+nf(c),'','start',5,0);
    const sv=Math.pow(2,-h/c);const d=Pl.dot(h,sv,6.5,'');d.setAttribute('fill',sv>0.6?C.r:sv<0.45?C.b:C.k);d.setAttribute('stroke','#fff');
    T(Pl.root,310,22,'ψ = '+psi+': c(ψ) = '+nf(c)+', trees stop at depth '+Math.ceil(Math.log2(psi)),'lab');
    T(Pl.root,310,44,'s = 2^(−'+nf(h,1)+' / '+nf(c)+') = '+nf(sv,3)+(sv>0.6?': isolated early, suspicious':sv<0.45?': deep, a normal point':': about average'),'')}
  segs(root,'p',v=>{psi=+v;draw()});onInput(root,'h',draw)};

/* ---------- Isolation Forest map with T trees ---------- */
FIG['an-ifmap']=root=>{const svg=svgOf(root);const TREES=[1,3,10,30,100];let PG=null,PT=null;
  function build(){if(PG)return;const r=rng(7);const psi=256,maxD=Math.ceil(Math.log2(psi));PG=[];PT=[];
    for(let t=0;t<100;t++){const idx=[...Array(N2).keys()];for(let i=0;i<psi;i++){const j=i+Math.floor(r()*(N2-i));const tmp=idx[i];idx[i]=idx[j];idx[j]=tmp}const sub=idx.slice(0,psi);
      const node=(S,d)=>{if(d>=maxD||S.length<=1)return {n:S.length};const f=r()<0.5?0:1;let lo=1e9,hi=-1e9;S.forEach(i=>{const v=X2[i][f];if(v<lo)lo=v;if(v>hi)hi=v});if(lo===hi)return {n:S.length};const c=lo+(hi-lo)*r();
        return {f:f,c:c,L:node(S.filter(i=>X2[i][f]<c),d+1),R:node(S.filter(i=>X2[i][f]>=c),d+1)}};
      const tree=node(sub,0);const path=p=>{let nd=tree,d=0;while(nd.f!==undefined){nd=p[nd.f]<nd.c?nd.L:nd.R;d++}return d+cfac(nd.n)};
      PG.push(GRID.map(path));PT.push(X2.map(path))}}
  onInput(root,'t',()=>{const T_=TREES[+q(root,'t').value];setV(root,'t',T_);build();initSvg(svg,620,380);const c=cfac(256);
    const mean=(M,i)=>{let s=0;for(let t=0;t<T_;t++)s+=M[t][i];return s/T_};const sg=GRID.map((_,i)=>Math.pow(2,-mean(PG,i)/c)),st=X2.map((_,i)=>Math.pow(2,-mean(PT,i)/c));
    const F=frame(4,26,404,350,XR,YR);T(svg,206,17,'Isolation Forest, '+T_+(T_>1?' trees':' tree')+', ψ = 256','lab');scoreMap(svg,F,sg,st);
    const loc=[...Array(N2).keys()].filter(i=>G2[i]===2);const x0=428;mapLegend(svg,x0+10,46);
    T(svg,x0,176,'ranks of the 2 local','lab','start');T(svg,x0,196,'outliers (1 = top):','lab','start');T(svg,x0,224,loc.map(i=>rankOf(st,i)).join(' and '),'lab big','start').style.fill=C.r;
    T(svg,x0,256,'AUC '+nf(auc(Y2,st),3),'','start');colorBar(svg,x0,300,170)})};

/* ---------- one-class SVM ---------- */
FIG['an-ocsvm']=root=>{const svg=svgOf(root);const O=AD.ocsvm;let nu='0.05',gam='1';const dec={};
  const grid=key=>{if(dec[key])return dec[key];const b=atob(O.fits[key].q);const a=new Float64Array(b.length);for(let i=0;i<b.length;i++){const v=b.charCodeAt(i);a[i]=v>127?v-256:v}return dec[key]=a};
  function draw(){const key=nu+'|'+(gam==='1'?'1.0':gam==='10'?'10.0':gam);const fit=O.fits[key];const v=grid(key);initSvg(svg,620,380);
    const F=frame(4,26,404,350,[O.lo[0],O.hi[0]],[O.lo[1],O.hi[1]]);T(svg,206,17,'one-class SVM, ν = '+nu+', γ = '+gam,'lab');const g=clipRect(svg,F.ox,F.oy,F.W,F.H);
    raster(g,F,O.lo,O.hi,O.nx,O.ny,k=>v[k]<0?[246,213,213]:[255,255,255]);contour(g,F,v,O.lo,O.hi,O.nx,O.ny,0,C.r,2);E('rect',{x:F.ox,y:F.oy,width:F.W,height:F.H,fill:'none',stroke:'#bfbfbf'},svg);
    drawPoints(svg,F);fit.svi.forEach(i=>dot(svg,F.X(X2[i][0]),F.Y(X2[i][1]),5.5,'none',C.k,1));
    const x0=428;legendRow(svg,x0+10,46,'rect','outside (f < 0)','#f6d5d5');legendRow(svg,x0+10,70,'line','boundary f = 0',C.r);legendRow(svg,x0+10,94,'ring','support vector',C.k);
    T(svg,x0,140,'strictly outside: '+pc(fit.out),'lab','start');T(svg,x0,164,'support vectors: '+pc(fit.sv),'lab','start');
    const ok=fit.out<=+nu&&+nu<=fit.sv;const t=T(svg,x0,196,pc(fit.out)+' ≤ ν = '+(+nu*100)+' % ≤ '+pc(fit.sv),'','start');t.style.fill=ok?C.g:C.r;T(svg,x0,216,ok?'the ν-property holds':'','','start').style.fill=C.g;
    T(svg,x0,256,'AUC on the 10 anomalies:','','start');T(svg,x0,278,nf(fit.auc,3),'lab','start');T(svg,x0,320,'(standardised features,','','start');T(svg,x0,340,'as in the lab)','','start')}
  segs(root,'n',x=>{nu=x;draw()});segs(root,'g',x=>{gam=x;draw()});draw()};

/* ---------- PCA reconstruction error ---------- */
FIG['an-pca']=root=>{const svg=svgOf(root);const X=AD.xcor;const {mu,S}=covOf(X);const a=S[0][0],b=S[0][1],c=S[1][1];const l1=(a+c)/2+Math.sqrt(((a-c)/2)**2+b*b);let v=[b,l1-a];const nv=Math.hypot(v[0],v[1]);v=[v[0]/nv,v[1]/nv];
  const proj=p=>{const t=(p[0]-mu[0])*v[0]+(p[1]-mu[1])*v[1];return {t:t,x:[mu[0]+t*v[0],mu[1]+t*v[1]]}};const AB=[[2.2,2.2],[1.2,-1.2]];
  const draw=w=>{initSvg(svg,620,380);const F=frame(6,10,404,364,[-4,4],[-3.6,3.6]);E('rect',{x:F.ox,y:F.oy,width:F.W,height:F.H,fill:'#fff',stroke:'#d0d0d0'},svg);const g=clipRect(svg,F.ox,F.oy,F.W,F.H);
    if(w!=='pc')X.forEach(p=>{const pr=proj(p).x;ln(g,F.X(p[0]),F.Y(p[1]),F.X(pr[0]),F.Y(pr[1]),'#d9d9d9',0.8)});
    X.forEach(p=>dot(g,F.X(p[0]),F.Y(p[1]),2.2,'#a5a5a5','none',0));ln(g,F.X(mu[0]-6*v[0]),F.Y(mu[1]-6*v[1]),F.X(mu[0]+6*v[0]),F.Y(mu[1]+6*v[1]),C.b,2.4);
    AB.forEach((p,k)=>{const pr=proj(p);if(w!=='pc')ln(svg,F.X(p[0]),F.Y(p[1]),F.X(pr.x[0]),F.Y(pr.x[1]),C.r,2.6);if(w==='both')ln(svg,F.X(mu[0]),F.Y(mu[1]),F.X(pr.x[0]),F.Y(pr.x[1]),C.o,3);
      dot(svg,F.X(p[0]),F.Y(p[1]),6,C.r,'#fff',1.4);halo(T(svg,F.X(p[0])+10,F.Y(p[1])+(k?18:-8),'AB'[k],'lab','start'))});
    const x0=430;legendRow(svg,x0+10,40,'line','1st principal direction',C.b);if(w!=='pc')legendRow(svg,x0+10,64,'line','residual x − x̂',C.r);if(w==='both')legendRow(svg,x0+10,88,'line','position along it',C.o);
    AB.forEach((p,k)=>{const pr=proj(p);const e=(p[0]-pr.x[0])**2+(p[1]-pr.x[1])**2;const y=136+k*96;T(svg,x0,y,'point '+'AB'[k],'lab','start');
      if(w!=='pc')T(svg,x0,y+24,'error ‖x − x̂‖² = '+nf(e),'','start').style.fill=C.r;if(w==='both'){T(svg,x0,y+46,'along the line: '+nf(Math.abs(pr.t)),'','start').style.fill='#c55a11';T(svg,x0,y+68,'Mahalanobis: '+nf(maha(p,mu,S)),'','start')}})};
  const cur=segs(root,'v',draw);draw(cur()||'pc')};

/* ---------- autoencoder: threshold on the reconstruction error ---------- */
FIG['an-recthr']=root=>{const svg=svgOf(root);const M=AD.mn;const err=M.err,an=M.digit.map(d=>d!==8);const n1=an.filter(Boolean).length,n0=an.length-n1;
  const bw=0.0025,nb=48;const h0=new Array(nb).fill(0),h1=new Array(nb).fill(0);err.forEach((e,i)=>{const b=Math.min(nb-1,Math.floor(e/bw));if(an[i])h1[b]++;else h0[b]++});
  onInput(root,'t',()=>{const t=+q(root,'t').value;setV(root,'t',nf(t,3));initSvg(svg,620,380);
    const d0=h0.map(c=>c/(n0*bw)),d1=h1.map(c=>c/(n1*bw));const ym=Math.max(...d0,...d1)*1.08;
    const Pl=Plot(svg,{w:620,h:380,x:[0,0.12],y:[0,ym],m:{l:54,r:16,t:92,b:42}});Pl.axes({xt:[0,0.03,0.06,0.09,0.12],fx:v=>v.toFixed(2),yt:[Math.round(ym/2)],xl:'reconstruction error (mean squared, per pixel)',yl:'density'});
    E('rect',{x:Pl.X(t),y:Pl.Y(ym),width:Pl.X(0.12)-Pl.X(t),height:Pl.Y(0)-Pl.Y(ym),fill:'#fff2cc','fill-opacity':0.6},Pl.bgc);
    d0.forEach((v,i)=>Pl.rect(i*bw,0,(i+1)*bw,v,'').setAttribute('style','fill:#4472c4;fill-opacity:0.55'));d1.forEach((v,i)=>Pl.rect(i*bw,0,(i+1)*bw,v,'').setAttribute('style','fill:#c00000;fill-opacity:0.5'));
    Pl.line(t,0,t,ym,'ln sk');let tp=0,fp=0;err.forEach((e,i)=>{if(e>t){if(an[i])tp++;else fp++}});
    T(Pl.root,40,22,'test eights (normal)','','start').style.fill=C.b;T(Pl.root,40,44,'other digits (10 %)','','start').style.fill=C.r;Pl.text(t,ym*0.95,'flagged →','','start',6,0);
    const x0=250;T(Pl.root,x0,22,'alerts '+(tp+fp)+' · precision '+(tp+fp?pc(tp/(tp+fp)):'–'),'lab','start');T(Pl.root,x0,44,'recall '+pc(tp/n1)+' · false alarms '+pc(fp/n0)+' of the eights','lab','start');
    if(Math.abs(t-M.tau)<0.0006)T(Pl.root,x0,66,'τ = 95th percentile of the validation eights','','start').style.fill='#7f6000'})};

/* ---------- autoencoder diagram ---------- */
FIG['an-aenet']=root=>{const svg=initSvg(svgOf(root),480,120);const L=[[784,'784'],[128,'128'],[16,'16'],[128,'128'],[784,'784']];const xs=[60,150,240,330,420];
  L.forEach(([n,lab],k)=>{const h=10+74*Math.sqrt(n/784);E('rect',{x:xs[k]-14,y:52-h/2,width:28,height:h,fill:k===2?'#fff2cc':k<2?'#dae3f3':'#e2f0d9',stroke:'#595959'},svg);T(svg,xs[k],104,lab,'');
    if(k<4){const h2=10+74*Math.sqrt(L[k+1][0]/784);E('polygon',{points:[[xs[k]+14,52-h/2],[xs[k+1]-14,52-h2/2],[xs[k+1]-14,52+h2/2],[xs[k]+14,52+h/2]].map(p=>p.join(',')).join(' '),fill:'#f2f2f2',stroke:'#bfbfbf'},svg)}});
  T(svg,22,57,'x','lab big');T(svg,462,57,'x̂','lab big');T(svg,105,118,'encoder','');T(svg,375,118,'decoder','');T(svg,240,14,'code','')};

/* ---------- the blind spot: gallery + per-digit AUC ---------- */
FIG['an-blind']=root=>{const svg=initSvg(svgOf(root),1160,262);const G=AD.mn.gal;
  const img=(b64,k,x,y,s)=>{const raw=atob(b64);const cv=document.createElement('canvas');cv.width=28;cv.height=28;const ctx=cv.getContext('2d');const im=ctx.createImageData(28,28);
    for(let i=0;i<784;i++){const v=255-raw.charCodeAt(k*784+i);im.data[4*i]=v;im.data[4*i+1]=v;im.data[4*i+2]=v;im.data[4*i+3]=255}ctx.putImageData(im,0,0);
    E('image',{href:cv.toDataURL(),x:x,y:y,width:s,height:s,preserveAspectRatio:'none'},svg);E('rect',{x:x,y:y,width:s,height:s,fill:'none',stroke:'#bfbfbf'},svg)};
  [['missed','missed anomalies, the smallest errors (all ones) · input | output',C.r],['easy','easy catches: the largest errors',C.k],['false','false alarms: eights with the largest errors',C.m]].forEach(([key,title,c],r)=>{const y0=6+r*86;T(svg,8,y0+12,title,'lab','start').style.fill=c;
    for(let j=0;j<6;j++){const x=8+j*94;img(G[key].x,j,x,y0+20,40);img(G[key].r,j,x+44,y0+20,40);T(svg,x+42,y0+76,'error '+nf(G[key].e[j],3),'')}});
  const A=AD.mn.auc;const dg=Object.keys(A);const Pl=Plot(svg,{at:[590,0],w:570,h:262,x:[-0.6,dg.length-0.4],y:[0.3,1.02],m:{l:52,r:8,t:30,b:30}});
  Pl.axes({xt:[],yt:[0.4,0.5,0.6,0.7,0.8,0.9,1],xl:'',yl:'ROC-AUC vs the eights'});Pl.line(-0.6,0.5,dg.length-0.4,0.5,'ln thin sk dot2');
  const cols=['#a5a5a5',C.b,C.gl];dg.forEach((d,i)=>{A[d].forEach((v,j)=>Pl.rect(i+(j-1)*0.27-0.13,0.3,i+(j-1)*0.27+0.13,v,'').setAttribute('style','fill:'+cols[j]));T(Pl.root,Pl.X(i),252,d,'lab').style.fill=d==='1'?C.r:C.k});
  [['PCA (16)',cols[0]],['autoencoder',cols[1]],['AE error / ink',cols[2]]].forEach(([t,c],j)=>{E('rect',{x:110+j*150,y:8,width:14,height:12,fill:c},Pl.root);T(Pl.root,130+j*150,19,t,'','start')});
  halo(Pl.text(1,0.463,'0.46','lab','middle',0,-6)).style.fill=C.r};

/* ---------- ROC vs PR ---------- */
FIG['an-rocpr']=root=>{const svg=svgOf(root);const PI=[0.5,0.2,0.1,0.01,0.003,0.001];const ts=[];for(let t=-4;t<=7;t+=0.02)ts.push(t);
  onInput(root,'p',()=>{const p=PI[+q(root,'p').value];setV(root,'p',pc(p,p<0.01?1:0));initSvg(svg,620,380);
    const tpr=t=>1-Phi(t-2),fpr=t=>1-Phi(t),prec=t=>tpr(t)*p/(tpr(t)*p+fpr(t)*(1-p));let ap=0;for(let i=0;i<ts.length-1;i++){ap+=(tpr(ts[i])-tpr(ts[i+1]))*prec((ts[i]+ts[i+1])/2)}
    const A=Plot(svg,{at:[0,40],w:310,h:340,x:[0,1],y:[0,1],m:{l:50,r:14,t:34,b:42}});A.axes({xt:[0,0.5,1],yt:[0,0.5,1],xl:'false positive rate',yl:'recall (TPR)'});
    A.path(ts.map(t=>[fpr(t),tpr(t)]),'ln sb');A.line(0,0,1,1,'ln thin sm dot2');const d1=A.dot(fpr(2),tpr(2),6,'');d1.setAttribute('fill',C.k);d1.setAttribute('stroke','#fff');T(A.root,170,20,'ROC: AUC 0.921','lab');
    const B=Plot(svg,{at:[310,40],w:310,h:340,x:[0,1],y:[0,1],m:{l:50,r:14,t:34,b:42}});B.axes({xt:[0,0.5,1],yt:[0,0.5,1],xl:'recall',yl:'precision'});
    B.path(ts.map(t=>[tpr(t),prec(t)]),'ln so');B.line(0,p,1,p,'ln thin sm dot2');const d2=B.dot(tpr(2),prec(2),6,'');d2.setAttribute('fill',C.k);d2.setAttribute('stroke','#fff');T(B.root,170,20,'PR: AP '+nf(ap,3),'lab');
    T(svg,310,18,'normal ~ N(0, 1), anomalies ~ N(2, 1), base rate '+pc(p,p<0.01?1:0)+' · black dot: τ = 2, precision '+pc(prec(2)),'')})};

/* ---------- precision@k on Satellite ---------- */
FIG['an-patk']=root=>{const svg=svgOf(root);const H=AD.sat.hits;const names=Object.keys(H);const short={'kNN distance (k=10)':'k-NN distance','Isolation Forest':'Isolation Forest','one-class SVM (nu=0.05)':'one-class SVM','GMM (5 comp.), -log p':'GMM, −log p','ensemble of 3: mean z':'ensemble of 3 (mean z)'};
  const cols=[C.b,C.gl,C.o,C.p,C.k];
  onInput(root,'k',()=>{const k=+q(root,'k').value;setV(root,'k',k);initSvg(svg,620,380);
    const Pl=Plot(svg,{at:[0,0],w:620,h:228,x:[0,400],y:[0,1],m:{l:66,r:14,t:10,b:38}});Pl.axes({xt:[0,100,200,300,400],yt:[0,0.5,1],fy:v=>(100*v)+' %',xl:'alert budget k',yl:'precision@k'});
    names.forEach((nm,j)=>{const P=Pl.path(H[nm].map((h,i)=>[i+1,h/(i+1)]),'ln thin');P.setAttribute('stroke',cols[j]);P.setAttribute('stroke-width',2)});Pl.line(k,0,k,1,'ln thin sk dash');
    const y0=250,cx=[20,300,420,520];T(svg,cx[0],y0,'detector','lab','start');T(svg,cx[1],y0,'P@'+k,'lab');T(svg,cx[2],y0,'found','lab');T(svg,cx[3],y0,'recall@'+k,'lab');ln(svg,10,y0+7,610,y0+7,'#7f7f7f',1);
    names.forEach((nm,j)=>{const y=y0+28+j*21;const h=H[nm][k-1];ln(svg,cx[0],y-5,cx[0]+18,y-5,cols[j],3);T(svg,cx[0]+26,y,short[nm],'','start');T(svg,cx[1],y,pc(h/k,0),'');T(svg,cx[2],y,h+' / '+k,'');T(svg,cx[3],y,pc(h/AD.sat.pos,0),'')})})};

/* ---------- Satellite: ROC-AUC vs AP ---------- */
FIG['an-satbars']=root=>{const svg=initSvg(svgOf(root),620,430);const Tb=AD.sat.table;const rows=['Mahalanobis','robust Mahalanobis (MCD)','kNN distance (k=10)','LOF (k=20)','Isolation Forest','one-class SVM (nu=0.05)','GMM (5 comp.), -log p','PCA error (12 comp.)','ensemble of 3: mean z','ensemble of all 8: mean rank'];
  const lab={'Mahalanobis':'Mahalanobis','robust Mahalanobis (MCD)':'robust Mahalanobis','kNN distance (k=10)':'k-NN distance','LOF (k=20)':'LOF','Isolation Forest':'Isolation Forest','one-class SVM (nu=0.05)':'one-class SVM','GMM (5 comp.), -log p':'GMM, −log p','PCA error (12 comp.)':'PCA error','ensemble of 3: mean z':'ensemble of 3, mean z','ensemble of all 8: mean rank':'ensemble of 8, mean rank'};
  const X=v=>196+v*384;T(svg,X(0.5),18,'Satellite, 75 anomalies in 5,100 (1.5 %)','lab');
  [0,0.25,0.5,0.75,1].forEach(v=>{ln(svg,X(v),30,X(v),392,'#ececec',1);T(svg,X(v),410,String(v),'')});
  rows.forEach((r,i)=>{const y=34+i*35.5;const [a,ap]=Tb[r];E('rect',{x:X(0),y:y,width:X(a)-X(0),height:13,fill:'#bfbfbf'},svg);E('rect',{x:X(0),y:y+14,width:X(ap)-X(0),height:13,fill:i>=8?C.k:C.b},svg);
    T(svg,X(0)-8,y+19,lab[r],i>=8?'lab':'','end');T(svg,X(a)+4,y+11,nf(a,3),'','start');T(svg,X(ap)+4,y+25,nf(ap,3),'lab','start').style.fill=r.startsWith('GMM')?C.r:C.k});
  ln(svg,X(0),30,X(0),392,'#595959',1.2);E('rect',{x:300,y:416,width:14,height:10,fill:'#bfbfbf'},svg);T(svg,320,425,'ROC-AUC','','start');E('rect',{x:400,y:416,width:14,height:10,fill:C.b},svg);T(svg,420,425,'average precision','','start')};

/* ---------- few labels ---------- */
FIG['an-few']=root=>{const svg=initSvg(svgOf(root),620,420);const F=AD.few;const names=Object.keys(F);const cols=[C.gl,C.b,C.r];const ms=['5','10','20','40'];const full=[0.947,0.974,0.676];
  const Pl=Plot(svg,{w:620,h:420,x:[-0.6,3.6],y:[0.15,1.02],m:{l:54,r:14,t:40,b:40}});Pl.axes({xt:[],yt:[0.2,0.4,0.6,0.8,1],xl:'labelled anomalies m (300 random draws each)',yl:'measured ROC-AUC'});
  names.forEach((nm,j)=>{const ln_=Pl.line(-0.6,full[j],3.6,full[j],'ln thin dash');ln_.setAttribute('stroke',cols[j]);ms.forEach((m,i)=>{const s=F[nm][m];const x=i+(j-1)*0.26;
    Pl.line(x,s[0],x,s[4],'ln thin sk');const r=Pl.rect(x-0.1,s[1],x+0.1,s[3],'');r.setAttribute('style','fill:'+cols[j]+';fill-opacity:0.55;stroke:'+cols[j]);Pl.line(x-0.1,s[2],x+0.1,s[2],'ln thin sk')})});
  ms.forEach((m,i)=>T(Pl.root,Pl.X(i),400,'m = '+m,'lab'));
  [['Isolation Forest',cols[0]],['k-NN distance',cols[1]],['LOF',cols[2]]].forEach(([t,c],j)=>{E('rect',{x:60+j*140,y:12,width:14,height:12,fill:c,'fill-opacity':0.6},Pl.root);T(Pl.root,80+j*140,23,t,'','start')});
  ln(Pl.root,470,18,494,18,'#7f7f7f',1.4,'6 5');T(Pl.root,500,23,'all 75 labels','','start')};

/* ---------- costs ---------- */
FIG['an-cost']=root=>{const svg=svgOf(root);const D=AD.cl;const V=D.V,LP=D.localprec,K=V.map((_,i)=>5*(i+1));
  onInput(root,'k',()=>{const k=+q(root,'k').value;setV(root,'k',k);initSvg(svg,620,380);const i=Math.round(k/5)-1;const caught=D.hits_eng[k-1];
    const A=Plot(svg,{at:[0,28],w:620,h:190,x:[0,1500],y:[0,1000],m:{l:74,r:14,t:6,b:30}});A.axes({xt:[0,500,1000,1500],yt:[0,500,1000],fy:v=>'€'+v+'k',yl:'net value V(k)'});
    A.path(K.map((kk,j)=>[kk,V[j]/1000]),'ln sb');A.line(D.kbest,0,D.kbest,1000,'ln thin sr dash');A.text(D.kbest,80,'k* = '+D.kbest,'','start',5,0).style.fill=C.r;const d=A.dot(k,V[i]/1000,6,'');d.setAttribute('fill',C.k);d.setAttribute('stroke','#fff');
    const B=Plot(svg,{at:[0,214],w:620,h:166,x:[0,1500],y:[0,1],m:{l:74,r:14,t:6,b:40}});B.axes({xt:[0,500,1000,1500],yt:[0,0.5,1],fy:v=>(100*v)+' %',xl:'alert budget k (alerts ranked by the Isolation Forest)',yl:'local precision'});
    B.path(K.map((kk,j)=>[kk,LP[j]]),'ln thin so');B.line(0,D.breakeven,1500,D.breakeven,'ln thin sr dash');halo(B.text(560,D.breakeven,'break-even precision '+pc(D.breakeven),'','start',0,-6)).style.fill=C.r;B.line(k,0,k,1,'ln thin sk dash');
    T(svg,310,18,'top '+k+': '+caught+' frauds caught (precision '+pc(caught/k)+'), V = €'+th(V[i]),'lab')})};

/* ---------- features: raw vs engineered ---------- */
FIG['an-feat']=root=>{const svg=initSvg(svgOf(root),620,430);const D=AD.cl;
  const A=Plot(svg,{at:[0,0],w:620,h:210,x:[0,600],y:[0,1],m:{l:66,r:14,t:26,b:36}});A.axes({xt:[0,200,400,600],yt:[0,0.5,1],fy:v=>(100*v)+' %',xl:'alert budget k',yl:'precision@k'});
  [['hits_raw','#a5a5a5','raw columns'],['hits_eng',C.b,'engineered features']].forEach(([key,c,lab],j)=>{const P=A.path(D[key].slice(0,600).map((h,i)=>[i+1,h/(i+1)]),'ln');P.setAttribute('stroke',c);E('rect',{x:120+j*200,y:4,width:14,height:12,fill:c},A.root);T(A.root,140+j*200,15,lab,'','start')});
  A.line(200,0,200,1,'ln thin sk dot2');
  const B=Plot(svg,{at:[0,214],w:620,h:216,x:[-0.6,3.6],y:[0,1.18],m:{l:66,r:14,t:30,b:44}});B.axes({xt:[],yt:[0,0.5,1],fy:v=>(100*v)+' %',yl:'recall in top 200'});
  const R=D.res;const pats=D.patterns;const short=['early, total loss','repeat claimant','inflated glass','ring garage'];
  pats.forEach((p,i)=>{[['raw columns','#a5a5a5'],['engineered features',C.b]].forEach(([nm,c],j)=>{const v=R[nm]['recall@200: '+p];B.rect(i+(j-0.5)*0.36-0.17,0,i+(j-0.5)*0.36+0.17,v,'').setAttribute('style','fill:'+c);T(B.root,B.X(i+(j-0.5)*0.36),B.Y(v)-4,pc(v,0),'')});T(B.root,B.X(i),B.h-22,short[i],'lab')});
  T(B.root,310,14,'which fraud patterns are found (top 200)','')};

/* ---------- explaining alerts ---------- */
FIG['an-explain']=root=>{const svg=initSvg(svgOf(root),1160,300);const D=AD.cl;const nm=D.eng;
  D.expl.forEach((ex,k)=>{const x0=k*390;E('rect',{x:x0+4,y:4,width:376,height:292,rx:8,fill:'#fafafa',stroke:'#d0d0d0'},svg);T(svg,x0+192,26,'claim '+ex.id+' · score '+nf(ex.score,3),'lab');T(svg,x0+192,46,'truth: '+ex.pattern,'').style.fill=C.r;
    const o=ex.contrib.map((v,i)=>i).sort((a,b)=>ex.contrib[b]-ex.contrib[a]);const mx=Math.max(...ex.contrib);const X=v=>x0+150+Math.max(0,v)/mx*170;
    o.forEach((f,j)=>{const y=62+j*28;T(svg,x0+142,y+14,nm[f],'','end');const w=X(ex.contrib[f])-X(0);E('rect',{x:X(0),y:y,width:Math.max(1,w),height:18,fill:ex.contrib[f]>0.004?C.r:'#bfbfbf'},svg);T(svg,X(ex.contrib[f])+5,y+14,nf(ex.val[f],2),'','start')});
    const r=ex.raw;const l1=r.claim_type+', €'+th(r.claim_amount)+' on a €'+th(r.vehicle_value)+' car';const l2='policy '+th(r.policy_age_days)+' days old, '+r.n_claims_12m+' claims this year, reported after '+th(r.report_delay_days)+' d';
    T(svg,x0+192,246,l1,'lab');T(svg,x0+192,268,l2,'');T(svg,x0+192,288,'bar = score drop if set to the median · label = value','').style.fontSize='13px'})};

/* ---------- drift and seasonality ---------- */
FIG['an-ts']=root=>{const svg=svgOf(root);const D=AD.ts;const y=D.y,n=y.length;const truth=new Set(D.truth);const t0=new Date(D.start+'T00:00:00');
  const m=(D.glob[0]+D.glob[1])/2,sd=(D.glob[1]-D.glob[0])/6;
  const zOf={glob:i=>(y[i]-m)/sd,roll:i=>D.roll[i]===null?NaN:(y[i]-D.roll[i])/Math.sqrt(D.roll[i]),cal:i=>(y[i]-D.cal[i])/Math.sqrt(D.cal[i])};
  const draw=mode=>{initSvg(svg,620,380);const z=[...Array(n).keys()].map(zOf[mode]);const thr=mode==='glob'?3:D.thr;const flag=z.map((v,i)=>i>=365&&Math.abs(v)>thr);
    const A=Plot(svg,{at:[0,22],w:620,h:200,x:[0,n],y:[0,170],m:{l:54,r:12,t:6,b:14}});A.axes({xt:[0,365,730,1095],fx:()=>'',yt:[50,100,150],yl:'claims / day'});
    A.rect(0,0,365,170,'').setAttribute('style','fill:#f2f2f2');A.path(y.map((v,i)=>[i,v]),'ln thin').setAttribute('style','stroke:#404040;stroke-width:0.7');
    if(mode==='glob'){A.line(0,D.glob[1],n,D.glob[1],'ln thin so dash')}else{const base=mode==='roll'?D.roll:D.cal;const P=A.path(base.map((v,i)=>[i,v===null?NaN:v]),'ln thin');P.setAttribute('style','stroke:#4472c4;stroke-width:0.9;stroke-opacity:0.75')}
    const B=Plot(svg,{at:[0,214],w:620,h:166,x:[0,n],y:[-9,9],m:{l:54,r:12,t:8,b:34}});B.axes({xt:[182,547,912],fx:v=>String(2023+[182,547,912].indexOf(v)),yt:[-6,-3,0,3,6],yl:'z'});
    B.path(z.map((v,i)=>[i,isNaN(v)?NaN:Math.max(-9,Math.min(9,v))]),'ln thin sb').setAttribute('stroke-width','0.7');B.line(0,thr,n,thr,'ln thin sk dot2');B.line(0,-thr,n,-thr,'ln thin sk dot2');
    let tp=0,fp=0;for(let i=365;i<n;i++){if(truth.has(i)){const hit=flag[i];if(hit)tp++;[A,B].forEach((P,k)=>{const yy=k?Math.max(-9,Math.min(9,z[i])):y[i];const d=P.dot(i,isNaN(yy)?0:yy,4.5,'');d.setAttribute('fill',hit?C.r:'#fff');d.setAttribute('stroke',C.r);d.setAttribute('stroke-width','1.8')})}else if(flag[i]){fp++;[A,B].forEach((P,k)=>{const yy=k?Math.max(-9,Math.min(9,z[i])):y[i];const d=P.dot(i,yy,5,'');d.setAttribute('fill','none');d.setAttribute('stroke',C.k);d.setAttribute('stroke-width','1.6')})}}
    const name={glob:'global mean ± 3σ',roll:'rolling baseline: same weekday, last 4 weeks',cal:'calendar model fitted on 2023 (grey)'}[mode];
    T(svg,310,16,name+': '+tp+' of 8 found, '+(fp===0?'no false alarm':fp+' false alarm'+(fp>1?'s':'')),'lab')};
  const cur=segs(root,'m',draw);draw(cur()||'glob')};

/* ---------- feedback loop ---------- */
FIG['an-loop']=root=>{const svg=initSvg(svgOf(root),480,420);const N=[[240,50,'unsupervised detector','(Isolation Forest)','#dae3f3',C.b],[410,180,'ranked alerts','top k a day','#fff2cc','#bf9000'],[300,330,'investigators','verdicts','#f2f2f2','#7f7f7f'],[100,330,'labels','fraud / not fraud','#fbe5d6',C.o],[70,180,'supervised model','(gradient boosting)','#e2f0d9',C.g]];
  const W=150,H=56;N.forEach(([x,y,a,b,f,s])=>{E('rect',{x:x-W/2,y:y-H/2,width:W,height:H,rx:8,fill:f,stroke:s,'stroke-width':1.6},svg);T(svg,x,y-3,a,'lab');T(svg,x,y+17,b,'')});
  const ar=(i,j,dx1,dy1,dx2,dy2)=>arrowPx(svg,N[i][0]+dx1,N[i][1]+dy1,N[j][0]+dx2,N[j][1]+dy2,'ln thin sk','fk');
  ar(0,1,60,28,-20,-28);ar(1,2,-10,28,40,-28);ar(2,3,-75,0,75,0);ar(3,4,-20,-28,10,28);ar(4,1,75,0,-75,0);
  halo(T(svg,240,155,'scores','')).style.fill=C.m;halo(T(svg,382,96,'scores','','start')).style.fill=C.m;
  T(svg,240,404,'keep the unsupervised detector for new patterns;','');T(svg,240,384,'audit a random sample to avoid label bias','')};

/* ---------- supervised vs unsupervised AP ---------- */
FIG['an-supbars']=root=>{const svg=initSvg(svgOf(root),620,170);const S=AD.cl.sup;const rows=[['Isolation Forest (no labels)','Isolation Forest, no labels','#a5a5a5'],['boosting on the 500 investigated alerts','boosting, 500 investigated alerts','#5b9bd5'],['boosting on all past labels','boosting, all past labels',C.b]];
  const X=v=>250+v*320;rows.forEach(([k,lab,c],i)=>{const y=14+i*46;E('rect',{x:X(0),y:y,width:X(S[k])-X(0),height:30,fill:c},svg);T(svg,X(0)-8,y+20,lab,'','end');T(svg,X(S[k])+6,y+20,nf(S[k],3),'lab','start')});
  ln(svg,X(0),8,X(0),150,'#595959',1.2);T(svg,X(0.5),164,'average precision on the future claims','')};
})();
