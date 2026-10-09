/* Figures for extra/06_dimensionality_reduction.html. Uses ../assets/figures.js (MLFIG), ../neural_networks/assets/nn-core.js (MLNN)
   and dimred-data.js (DRDATA, precomputed in Python with the notebook's settings). Small experiments (curse, PCA views, JL, LDA,
   perplexity) are computed here, with a fixed seed. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,q,setV,svgOf}=lib;const {TT,box,stepper,segs,pix}=window.MLNN;
const DD=window.DRDATA;
const TAB=['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'];
const CL3=['#4472c4','#ed7d31','#70ad47'];
const nf=(v,d)=>{d=d===undefined?2:d;if(Math.abs(v)<0.5*Math.pow(10,-d))v=0;return v.toFixed(d).replace('-','−')};
const ln=(svg,a,b,c,w,dash)=>E('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:c||'#9aa5b8','stroke-width':w||1.6,'stroke-dasharray':dash||''},svg);
const dot=(svg,x,y,r,fill,stroke,sw)=>E('circle',{cx:x,cy:y,r:r,fill:fill,stroke:stroke||'none','stroke-width':sw===undefined?1:sw},svg);
const halo=t=>{t.setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round');return t};
const col=(t,c)=>{t.style.fill=c;return t};
function onInput(root,k,draw){const inp=q(root,k);inp.addEventListener('input',draw);draw();return inp}
/* viridis-like colour for t in [0,1] */
const VIR=[[68,1,84],[59,82,139],[33,145,140],[94,201,98],[253,231,37]];
function vir(t){t=Math.max(0,Math.min(1,t))*4;const i=Math.min(3,Math.floor(t)),f=t-i;const a=VIR[i],b=VIR[i+1];return 'rgb('+a.map((v,k)=>Math.round(v+(b[k]-v)*f)).join(',')+')'}
/* bounding box of 2-D points -> a Plot with equal aspect, padded */
function eqPlot(svg,P,at,w,h,m,pad){m=m||{l:12,r:12,t:28,b:12};pad=pad||0.06;const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]);let x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const aw=w-m.l-m.r,ah=h-m.t-m.b;let sx=(x1-x0)/aw,sy=(y1-y0)/ah;const s=Math.max(sx,sy)*(1+2*pad);const cx=(x0+x1)/2,cy=(y0+y1)/2;
  return Plot(svg,{at:at,w:w,h:h,m:m,x:[cx-s*aw/2,cx+s*aw/2],y:[cy-s*ah/2,cy+s*ah/2]})}
const frame=(svg,x,y,w,h)=>E('rect',{x:x,y:y,width:w,height:h,fill:'#fafafa',stroke:'#d0d0d0','stroke-width':1,rx:6},svg);
/* an 8x8 digit as grey cells (0..16, dark = ink) */
function digit(svg,x0,y0,v,cs){for(let i=0;i<8;i++)for(let j=0;j<8;j++)E('rect',{x:x0+j*cs,y:y0+i*cs,width:cs,height:cs,fill:pix(1-Math.max(0,Math.min(16,v[i*8+j]))/16),stroke:'#e0e0e0','stroke-width':0.4},svg);
  E('rect',{x:x0,y:y0,width:8*cs,height:8*cs,fill:'none',stroke:'#7f7f7f','stroke-width':1},svg)}
const img=(svg,x,y,s,href)=>{E('rect',{x:x-1,y:y-1,width:s+2,height:s+2,fill:'none',stroke:'#bfbfbf'},svg);const im=E('image',{x:x,y:y,width:s,height:s,preserveAspectRatio:'none'},svg);im.setAttribute('href',href);return im};
/* median of each class, for digit labels on a map */
function classLabels(Pl,Z,y,K){for(let c=0;c<K;c++){const xs=[],ys=[];Z.forEach((p,i)=>{if(y[i]===c){xs.push(p[0]);ys.push(p[1])}});xs.sort((a,b)=>a-b);ys.sort((a,b)=>a-b);
  const mx=xs[xs.length>>1],my=ys[ys.length>>1];E('circle',{cx:Pl.X(mx),cy:Pl.Y(my),r:10,fill:'#fff','fill-opacity':0.85,stroke:TAB[c],'stroke-width':1.5},Pl.top);T(Pl.top,Pl.X(mx),Pl.Y(my)+5,String(c),'lab')}}
/* legend for the two distances between the ends of the roll */
function distLegend(svg,R,y){const g=ln(svg,[150,y-5],[190,y-5],'#ffc000',4);ln(svg,[370,y-5],[410,y-5],'#c00000',2.5,'6 5');
  col(T(svg,196,y,'along the sheet: '+R.geo.toFixed(1),'lab','start'),'#7f6000');col(T(svg,416,y,'straight line: '+R.euc.toFixed(1),'lab','start'),'#c00000')}
/* the Swiss roll in an oblique view: (x, z) face-on, height y drawn diagonally */
const RP=(p)=>[p[0]+0.3*p[1],-p[2]+0.15*p[1]];

/* ---------- where we are ---------- */
FIG['dr-where']=root=>{const svg=initSvg(svgOf(root),1160,225);const ex=DD.dg.ex[1].x;
  T(svg,92,20,'one digit: 8 × 8 pixels','lab');digit(svg,24,34,ex,17);
  arrowPx(svg,172,102,214,102,'ln thin sk','fk');
  T(svg,388,20,'= 64 numbers: a point in ℝ⁶⁴','lab');
  for(let k=0;k<64;k++){const r=Math.floor(k/16),c=k%16;E('rect',{x:226+c*20,y:44+r*22,width:19,height:21,fill:pix(1-ex[k]/16),stroke:'#bfbfbf','stroke-width':0.6},svg)}
  T(svg,388,152,'1,797 such points: highly correlated pixels,','');T(svg,388,170,'far fewer than 64 real degrees of freedom','');
  arrowPx(svg,560,102,650,102,'ln sb','fb');T(svg,605,90,'reduce','lab');T(svg,605,124,'64 → 2','');
  const Z=DD.tsne['30'],y=DD.tsne.y;const Pl=eqPlot(svg,Z,[680,0],470,222,{l:8,r:8,t:24,b:4},0.03);
  E('rect',{x:4,y:22,width:462,height:200,fill:'#fafafa',stroke:'#d0d0d0',rx:6},Pl.bg);
  Z.forEach((p,i)=>{const c=Pl.dot(p[0],p[1],1.9,'');c.setAttribute('fill',TAB[y[i]])});classLabels(Pl,Z,y,10);
  T(svg,915,16,'1,797 digits in 2-D (t-SNE): ten islands','lab')};

/* ---------- curse of dimensionality ---------- */
FIG['dr-curse']=root=>{const svg=svgOf(root);const DS=[2,10,100,1000],LAB={2:86.55,10:3.36,100:1.41,1000:1.11};const n=200;const H={};
  DS.forEach(d=>{const r=rng(17+d);const X=[...Array(n)].map(()=>{const a=new Float64Array(d);for(let j=0;j<d;j++)a[j]=r();return a});const ds=[];
    for(let i=0;i<n;i++)for(let k=i+1;k<n;k++){let s=0;const a=X[i],b=X[k];for(let j=0;j<d;j++){const t=a[j]-b[j];s+=t*t}ds.push(Math.sqrt(s))}
    const m=ds.reduce((a,b)=>a+b,0)/ds.length;const sd=Math.sqrt(ds.reduce((a,b)=>a+(b-m)*(b-m),0)/ds.length);const nb=44,w=2.2/nb;const h=new Array(nb).fill(0);
    ds.forEach(v=>{const b=Math.floor(v/m/w);if(b>=0&&b<nb)h[b]++});H[d]={h:h.map(c=>c/ds.length/w),rel:sd/m,mx:Math.max(...ds)/Math.min(...ds),w:w}});
  const cols={2:'#4472c4',10:'#ed7d31',100:'#70ad47',1000:'#c00000'};
  onInput(root,'d',()=>{const d=DS[+q(root,'d').value];setV(root,'d','d = '+d);const P=Plot(svg,{w:620,h:360,x:[0,2.2],y:[0,13],m:{l:46,r:14,t:56,b:40}});
    P.axes({xt:[0,0.5,1,1.5,2],yt:[0,4,8,12],xl:'pairwise distance / mean distance',yl:'density'});
    DS.forEach(dd=>{const G=H[dd];const pts=[];G.h.forEach((v,b)=>{pts.push([b*G.w,Math.min(v,13)]);pts.push([(b+1)*G.w,Math.min(v,13)])});
      const p=P.path(pts,'ln thin',P.bg);p.setAttribute('stroke',cols[dd]);p.setAttribute('stroke-opacity',dd===d?1:0.3);p.setAttribute('stroke-width',dd===d?2.6:1.2);
      if(dd===d){const poly=[[0,0]].concat(pts,[[pts[pts.length-1][0],0]]);const pg=P.poly(poly,'');pg.setAttribute('fill',cols[dd]);pg.setAttribute('fill-opacity',0.18)}});
    const G=H[d];T(P.top,333,20,'200 random points in [0, 1]^'+d+' · d = '+d,'lab');
    T(P.top,333,42,'std / mean of the distances = '+nf(G.rel,3)+' · farthest / nearest from a query (lab) = '+LAB[d]+'×','');
    const legend=[[2,'d = 2'],[10,'d = 10'],[100,'d = 100'],[1000,'d = 1000']];legend.forEach(([dd,t],i)=>{const y=80+i*20;ln(P.top,[470,y-5],[494,y-5],cols[dd],dd===d?3:1.5);T(P.top,500,y,t,dd===d?'lab':'','start')})})};

/* ---------- PCA: two views ---------- */
const CLOUD=(()=>{const r=rng(5);const L=[[Math.sqrt(3),0],[1.6/Math.sqrt(3),Math.sqrt(1.4-2.56/3)]];const P=[];
  for(let i=0;i<160;i++){const a=randn(r),b=randn(r);P.push([L[0][0]*a,L[1][0]*a+L[1][1]*b])}
  const m=[0,1].map(j=>P.reduce((s,p)=>s+p[j],0)/P.length);const X=P.map(p=>[p[0]-m[0],p[1]-m[1]]);
  const n=X.length;const S=[[0,0],[0,0]];X.forEach(p=>{S[0][0]+=p[0]*p[0];S[0][1]+=p[0]*p[1];S[1][1]+=p[1]*p[1]});S[0][0]/=n-1;S[0][1]/=n-1;S[1][1]/=n-1;S[1][0]=S[0][1];
  const tr=S[0][0]+S[1][1],det=S[0][0]*S[1][1]-S[0][1]*S[0][1];const l1=tr/2+Math.sqrt(tr*tr/4-det),l2=tr/2-Math.sqrt(tr*tr/4-det);
  const ang=Math.atan2(l1-S[0][0],S[0][1]);return {X,S,tr,l1,l2,ang}})();
const varAt=(S,th)=>{const c=Math.cos(th),s=Math.sin(th);return c*c*S[0][0]+2*c*s*S[0][1]+s*s*S[1][1]};
FIG['dr-views']=root=>{const svg=svgOf(root);const {X,S,tr,l1,l2,ang}=CLOUD;
  onInput(root,'a',()=>{const a=+q(root,'a').value;setV(root,'a',a+'°');initSvg(svg,620,360);const th=a*Math.PI/180;const w=[Math.cos(th),Math.sin(th)];
    const P=Plot(svg,{at:[0,0],w:360,h:360,x:[-5.4,5.4],y:[-5.6,5.6],m:{l:14,r:14,t:30,b:14}});E('rect',{x:14,y:30,width:332,height:316,fill:'#fafafa',stroke:'#d0d0d0',rx:6},P.bg);
    P.line(-8*w[0],-8*w[1],8*w[0],8*w[1],'ln sb');
    X.forEach(p=>{const z=p[0]*w[0]+p[1]*w[1];P.line(p[0],p[1],z*w[0],z*w[1],'ln thin sr').setAttribute('stroke-opacity',0.45)});
    X.forEach(p=>P.dot(p[0],p[1],2.6,'fm'));X.forEach(p=>{const z=p[0]*w[0]+p[1]*w[1];P.dot(z*w[0],z*w[1],2.2,'fb')});
    T(P.top,180,20,'centred cloud, its projections on w and the residuals','lab');
    const cap=varAt(S,th),err=tr-cap;
    const Q=Plot(svg,{at:[372,0],w:248,h:220,x:[0,180],y:[0,tr*1.08],m:{l:40,r:8,t:30,b:38}});Q.axes({xt:[0,45,90,135,180],yt:[0,1,2,3,4],xl:'angle of w (degrees)'});
    Q.fn(t=>varAt(S,t*Math.PI/180),'ln sb',0,180,180);Q.fn(t=>tr-varAt(S,t*Math.PI/180),'ln so',0,180,180);Q.line(a,0,a,tr*1.08,'ln thin sk dash');
    Q.dot(a,cap,5,'fb pt');Q.dot(a,err,5,'fo pt');T(Q.root,124,18,'captured (blue) and error (orange)','');
    const bx=412,bw=200,by=262;const sc=bw/tr;E('rect',{x:bx,y:by,width:cap*sc,height:30,fill:'#4472c4'},svg);E('rect',{x:bx+cap*sc,y:by,width:err*sc,height:30,fill:'#ed7d31'},svg);
    E('rect',{x:bx,y:by,width:bw,height:30,fill:'none',stroke:'#404040'},svg);
    T(svg,bx,by-8,'captured '+nf(cap)+' + error '+nf(err),'lab','start');T(svg,bx,by+50,'= tr S = '+nf(tr)+' for every w','','start');
    T(svg,bx,by+72,'best: w = v₁ at '+nf(((ang*180/Math.PI)+180)%180,1)+'°, λ₁ = '+nf(l1),'','start')})};

/* ---------- the covariance ellipse and the variance along w ---------- */
FIG['dr-ellipse']=root=>{const svg=initSvg(svgOf(root),480,400);const l1=4.312,l2=0.380,an=34.63*Math.PI/180;
  const S=[[l1*Math.cos(an)**2+l2*Math.sin(an)**2,(l1-l2)*Math.cos(an)*Math.sin(an)],[0,0]];S[1][0]=S[0][1];S[1][1]=l1*Math.sin(an)**2+l2*Math.cos(an)**2;
  const P=Plot(svg,{at:[0,0],w:480,h:400,x:[-2.7,2.7],y:[-2.25,2.25],m:{l:10,r:10,t:30,b:30}});
  P.line(-2.6,0,2.6,0,'ax',P.bg);P.line(0,-2.2,0,2.2,'ax',P.bg);
  const el=[];for(let i=0;i<=200;i++){const t=2*Math.PI*i/200;const a=Math.sqrt(l1)*Math.cos(t),b=Math.sqrt(l2)*Math.sin(t);el.push([a*Math.cos(an)-b*Math.sin(an),a*Math.sin(an)+b*Math.cos(an)])}
  const pe=P.path(el,'ln thin sm');pe.setAttribute('fill','#dae3f3');pe.setAttribute('fill-opacity',0.6);
  const pol=[];for(let i=0;i<=360;i++){const t=Math.PI*i/180;const r=Math.sqrt(varAt(S,t));pol.push([r*Math.cos(t),r*Math.sin(t)])}P.path(pol,'ln sg');
  const v1=[Math.cos(an),Math.sin(an)],v2=[-Math.sin(an),Math.cos(an)];
  arrowPx(P.top,P.X(0),P.Y(0),P.X(Math.sqrt(l1)*v1[0]),P.Y(Math.sqrt(l1)*v1[1]),'ln sr','fr');arrowPx(P.top,P.X(0),P.Y(0),P.X(Math.sqrt(l2)*v2[0]),P.Y(Math.sqrt(l2)*v2[1]),'ln sr','fr');
  halo(col(T(P.top,P.X(Math.sqrt(l1)*v1[0])+8,P.Y(Math.sqrt(l1)*v1[1])-6,'v₁: √λ₁ = 2.08','lab','start'),'#c00000'));
  halo(col(T(P.top,P.X(Math.sqrt(l2)*v2[0])-8,P.Y(Math.sqrt(l2)*v2[1])-8,'v₂: √λ₂ = 0.62','lab','end'),'#c00000'));
  const tw=110*Math.PI/180,rw=Math.sqrt(varAt(S,tw));arrowPx(P.top,P.X(0),P.Y(0),P.X(rw*Math.cos(tw)),P.Y(rw*Math.sin(tw)),'ln thin sk','fk');
  halo(T(P.top,P.X(rw*Math.cos(tw))-6,P.Y(rw*Math.sin(tw))-8,'a direction w: std √(wᵀSw) = '+nf(rw),'','end'));
  T(svg,240,20,'lab cloud: λ₁ = 4.312, λ₂ = 0.380, v₁ at 34.6°','lab');
  col(T(svg,240,392,'green: std along every direction w; it peaks at v₁','','middle'),'#548235')};

/* ---------- eigen vs SVD shapes ---------- */
FIG['dr-svd']=root=>{const svg=initSvg(svgOf(root),1160,200);const y0=14,H=140;
  const blk=(x,w,h,fill,lab,sub)=>{E('rect',{x:x,y:y0+(H-h)/2,width:w,height:h,fill:fill,stroke:'#404040','stroke-width':1.2},svg);TT(svg,x+w/2,y0+H+22,lab,'lab');if(sub)T(svg,x+w/2,y0+H+40,sub,'')};
  let x=40;blk(x,90,H,'#e2f0d9','X_c: n × d','centred data');x+=90;T(svg,x+22,y0+H/2+8,'=','lab big');x+=44;
  blk(x,60,H,'#dae3f3','U: n × r','orthonormal');x+=60;T(svg,x+16,y0+H/2+8,'·','lab big');x+=32;
  blk(x,60,60,'#fff','Σ: r × r','diagonal σⱼ');for(let i=0;i<5;i++)E('rect',{x:x+i*12,y:y0+(H-60)/2+i*12,width:12,height:12,fill:'#4472c4',opacity:1-i*0.17},svg);x+=60;T(svg,x+16,y0+H/2+8,'·','lab big');x+=32;
  blk(x,90,60,'#fbe5d6','V^⊤: r × d','rows = directions');x+=90;
  E('line',{x1:x+48,y1:10,x2:x+48,y2:190,stroke:'#d0d0d0','stroke-width':1.5},svg);x+=96;
  blk(x,90,90,'#fff2cc','S: d × d','covariance');x+=90;T(svg,x+22,y0+H/2+8,'=','lab big');x+=44;
  blk(x,90,90,'#fbe5d6','V: d × d','eigenvectors');x+=90;T(svg,x+16,y0+H/2+8,'·','lab big');x+=32;
  blk(x,90,90,'#fff','Λ = Σ² / (n − 1)','eigenvalues');for(let i=0;i<6;i++)E('rect',{x:x+i*15,y:y0+(H-90)/2+i*15,width:15,height:15,fill:'#ed7d31',opacity:1-i*0.14},svg);x+=90;T(svg,x+16,y0+H/2+8,'·','lab big');x+=32;
  blk(x,90,90,'#fbe5d6','V^⊤','')};

/* ---------- scree plot and digit reconstruction ---------- */
FIG['dr-scree']=root=>{const svg=svgOf(root);const G=DD.dg;let g=1;
  function draw(){const k=+q(root,'k').value;setV(root,'k',k);initSvg(svg,620,370);
    const P=Plot(svg,{at:[0,0],w:380,h:370,x:[0.3,40.7],y:[0,0.16],m:{l:58,r:44,t:34,b:40}});P.axes({xt:[1,10,20,30,40],yt:[0,0.05,0.1,0.15],xl:'component j',yl:'explained variance ratio'});
    let cum=0;const cp=[];G.evr.slice(0,40).forEach((v,j)=>{cum+=v;cp.push([j+1,cum*0.16]);const r=P.rect(j+0.6,0,j+1.4,v,'');r.setAttribute('fill',j<k?'#4472c4':'#c9d6ee')});
    P.path(cp,'ln so');P.dot(k,cp[k-1][1],5,'fo pt');[0,0.5,1].forEach(v=>{T(P.top,380-40,P.Y(v*0.16)+4,(v*100)+' %','','start')});
    col(T(P.top,P.X(14),P.Y(0.16*0.62),'cumulative (right axis)','','start'),'#c55a11');
    const ck=G.evr.slice(0,k).reduce((a,b)=>a+b,0);T(P.top,214,20,'first '+k+' components: '+nf(100*ck,1)+' % of the variance','lab');
    const ex=G.ex[g];const rec=G.mean.map((m,p)=>{let s=m;for(let j=0;j<k;j++)s+=ex.z[j]*G.comp[j][p];return s});
    T(svg,500,52,'original','lab');digit(svg,440,62,ex.x,15);T(svg,500,218,'k = '+k,'lab');digit(svg,440,228,rec,15);
    let e=0;rec.forEach((v,p)=>{e+=(v-ex.x[p])**2});T(svg,500,364,'squared error '+nf(e,0),'')}
  segs(root,'g',v=>{g=+v;draw()});onInput(root,'k',draw)};

/* ---------- wine: raw vs standardised ---------- */
FIG['dr-wine']=root=>{const svg=svgOf(root);const W=DD.wine;
  const draw=m=>{initSvg(svg,620,360);const Z=W[m],L=m==='raw'?W.load_raw:W.load_std,ev=m==='raw'?W.evr_raw:W.evr_std;
    const xs=Z.map(p=>p[0]),ys=Z.map(p=>p[1]);const px=(Math.max(...xs)-Math.min(...xs))*0.06,py=(Math.max(...ys)-Math.min(...ys))*0.08;
    const P=Plot(svg,{at:[0,0],w:330,h:360,x:[Math.min(...xs)-px,Math.max(...xs)+px],y:[Math.min(...ys)-py,Math.max(...ys)+py*3.2],m:{l:40,r:10,t:30,b:34}});P.axes({xt:[],yt:[]});
    Z.forEach((p,i)=>{const c=P.dot(p[0],p[1],3.4,'pt');c.setAttribute('fill',CL3[W.y[i]])});
    T(P.root,186,354,'PC1 ('+nf(100*ev[0],1)+' %)','lab');const t=T(P.root,24,190,'PC2 ('+nf(100*ev[1],1)+' %)','lab');t.setAttribute('transform','rotate(-90 24 190)');
    T(P.root,185,20,m==='raw'?'raw features':'standardised features','lab');
    [0,1,2].forEach(c=>{dot(svg,52,48+c*18,5,CL3[c]);T(svg,62,53+c*18,'cultivar '+c,'','start')});
    const x0=536,sc=80;T(svg,490,20,'loadings of PC1','lab');ln(svg,[x0,34],[x0,346],'#595959',1.2);
    L.forEach((v,j)=>{const y=40+j*23.5;E('rect',{x:Math.min(x0,x0+v*sc),y:y,width:Math.abs(v*sc),height:17,fill:v>0?'#ed7d31':'#4472c4'},svg);
      T(svg,452,y+13,W.names[j],'','end').style.fontSize='13px'})};
  const cur=segs(root,'m',draw);draw(cur()||'raw')};

/* ---------- eigenfaces ---------- */
FIG['dr-faces']=root=>{const svg=svgOf(root);const F=DD.faces;
  onInput(root,'k',()=>{const i=+q(root,'k').value;const R=F.rec[i];setV(root,'k','k = '+R.k);initSvg(svg,1160,300);
    T(svg,370,22,'mean face and the first six eigenfaces (grey = 0, light +, dark −)','lab');
    img(svg,10,40,100,F.mean);T(svg,60,160,'mean','');F.eig.forEach((h,j)=>{img(svg,128+j*104,40,96,h);T(svg,176+j*104,160,'eigenface '+(j+1),'')});
    E('line',{x1:780,y1:16,x2:780,y2:290,stroke:'#d0d0d0','stroke-width':1.5},svg);
    T(svg,885,22,'original','lab');img(svg,805,40,160,F.orig);T(svg,1065,22,'k = '+R.k,'lab');img(svg,985,40,160,R.img);
    T(svg,1065,226,nf(100*R.cum,1)+' % of the variance','lab');T(svg,1065,248,'MSE '+R.mse.toFixed(4),'');
    T(svg,885,226,'face 0 of 400','');
    T(svg,370,200,'Each face = mean + z₁ · eigenface 1 + z₂ · eigenface 2 + …','lab');
    T(svg,370,226,'the first ones carry lighting and the overall shape; glasses appear in eigenfaces 7 and 8','');
    const ks=F.rec.map(r=>r.k);const x0=40,x1=740,y=270;ln(svg,[x0,y],[x1,y],'#bfbfbf',2);
    ks.forEach((k,j)=>{const x=x0+(x1-x0)*j/(ks.length-1);dot(svg,x,y,j===i?7:4,j===i?'#4472c4':'#bfbfbf');T(svg,x,y+24,String(k),j===i?'lab':'')});T(svg,x0-12,y+5,'k','','end')})};

/* ---------- probabilistic PCA ---------- */
FIG['dr-ppca']=root=>{const svg=initSvg(svgOf(root),480,400);const r=rng(9);
  E('circle',{cx:90,cy:150,r:62,fill:'#dae3f3',stroke:'#4472c4','stroke-width':1.2},svg);const Z=[];for(let i=0;i<26;i++){const a=randn(r)*0.42,b=randn(r)*0.42;Z.push([a,b]);dot(svg,90+a*62,150+b*62,3.2,'#4472c4')}
  ln(svg,[24,150],[156,150],'#9aa5b8',1);ln(svg,[90,84],[90,216],'#9aa5b8',1);T(svg,90,236,'latent z ∈ ℝ²','lab');T(svg,90,256,'z ~ N(0, I)','');
  arrowPx(svg,160,150,232,150,'ln sb','fb');halo(T(svg,196,176,'Wz + μ','lab'));
  const O=[362,170],A=[90,-30],B=[-42,-64];const pl=(u,v)=>[O[0]+u*A[0]+v*B[0],O[1]+u*A[1]+v*B[1]];
  E('polygon',{points:[pl(-1.1,-1.1),pl(1.1,-1.1),pl(1.1,1.1),pl(-1.1,1.1)].map(p=>p.join(',')).join(' '),fill:'#e2f0d9','fill-opacity':0.8,stroke:'#70ad47'},svg);
  Z.forEach(([a,b],i)=>{const p=pl(a*1.6,b*1.6);const nz=[randn(r)*9,randn(r)*9];dot(svg,p[0],p[1],2.4,'#70ad47');ln(svg,p,[p[0]+nz[0],p[1]+nz[1]],'#c00000',1);dot(svg,p[0]+nz[0],p[1]+nz[1],3,'#c00000')});
  T(svg,350,62,'a k-dim plane in ℝᵈ (here 2 in 3)','lab');T(svg,350,290,'+ noise ε ~ N(0, σ²I)','lab').style.fill='#c00000';
  T(svg,240,336,'x ~ N(μ, WWᵀ + σ²I)','lab big');T(svg,240,362,'σ² → 0: back to PCA; σ²_ML = mean of the discarded λ','');};

/* ---------- limits: outlier and curve ---------- */
FIG['dr-limits']=root=>{const svg=svgOf(root);const r=rng(21);const base=[];for(let i=0;i<70;i++){const a=randn(r)*2.0,b=randn(r)*0.45;const c=Math.cos(0.35),s=Math.sin(0.35);base.push([a*c-b*s,a*s+b*c])}
  const arc=[];for(let i=0;i<70;i++){const t=0.15*Math.PI+0.7*Math.PI*i/69;arc.push([3.6*Math.cos(t)+0.12*randn(r),3.6*Math.sin(t)-2+0.12*randn(r)])}
  const pc1=P0=>{const n=P0.length;const m=[0,1].map(j=>P0.reduce((s,p)=>s+p[j],0)/n);let a=0,b=0,c=0;P0.forEach(p=>{const x=p[0]-m[0],y=p[1]-m[1];a+=x*x;b+=x*y;c+=y*y});
    const tr=a+c,det=a*c-b*b;const l1=tr/2+Math.sqrt(tr*tr/4-det);return {m,ang:Math.atan2(l1-a,b),share:l1/tr}};
  const draw=mode=>{initSvg(svg,620,360);const D=mode==='arc'?arc:mode==='out'?base.concat([[6.6,-4.2]]):base;
    const P=Plot(svg,{w:620,h:360,x:[-7.2,7.2],y:[-4.6,4.6],m:{l:14,r:14,t:34,b:14}});E('rect',{x:14,y:34,width:592,height:312,fill:'#fafafa',stroke:'#d0d0d0',rx:6},P.bg);
    const A=pc1(D),B=pc1(base);const dl=(R,cls)=>P.line(R.m[0]-9*Math.cos(R.ang),R.m[1]-9*Math.sin(R.ang),R.m[0]+9*Math.cos(R.ang),R.m[1]+9*Math.sin(R.ang),cls);
    if(mode==='out')dl(B,'ln thin sm dash');dl(A,'ln sr');
    D.forEach((p,i)=>{const c=P.dot(p[0],p[1],i===70&&mode==='out'?7:3.4,'pt');c.setAttribute('fill',i===70&&mode==='out'?'#c00000':'#4472c4')});
    const deg=v=>nf(((v*180/Math.PI)+180)%180,1);
    const title=mode==='ok'?'70 points: PC1 at '+deg(A.ang)+'°, it keeps '+nf(100*A.share,1)+' % of the variance':mode==='out'?'+ one outlier: PC1 turns from '+deg(B.ang)+'° to '+deg(A.ang)+'° (dashed: without it)':'points on an arc: PC1 keeps only '+nf(100*A.share,1)+' %, the curve is lost';
    T(svg,310,22,title,'lab');if(mode==='out')halo(col(T(P.top,P.X(6.6)-12,P.Y(-4.2)+5,'outlier','lab','end'),'#c00000'))};
  const cur=segs(root,'c',draw);draw(cur()||'ok')};

/* ---------- Johnson-Lindenstrauss ---------- */
FIG['dr-jl']=root=>{const svg=svgOf(root);const KS=[5,10,20,50,100,200,500,1000];const d=1000,n=60;const r=rng(3);
  const X=[...Array(n)].map((_,i)=>{const a=new Float64Array(d);const c=i%3;for(let j=0;j<d;j++)a[j]=randn(r)+(j%3===c?1.5:0);return a});
  const d0=[];for(let i=0;i<n;i++)for(let k=i+1;k<n;k++){let s=0;for(let j=0;j<d;j++){const t=X[i][j]-X[k][j];s+=t*t}d0.push(s)}
  const cache={};function ratios(k){if(cache[k])return cache[k];const rr=rng(100+k);const Y=X.map(()=>new Float64Array(k));
    for(let j=0;j<d;j++){const row=new Float64Array(k);for(let c=0;c<k;c++)row[c]=randn(rr)/Math.sqrt(k);for(let i=0;i<n;i++){const v=X[i][j];if(v===0)continue;const y=Y[i];for(let c=0;c<k;c++)y[c]+=v*row[c]}}
    const out=[];let p=0;for(let i=0;i<n;i++)for(let k2=i+1;k2<n;k2++){let s=0;for(let c=0;c<k;c++){const t=Y[i][c]-Y[k2][c];s+=t*t}out.push(s/d0[p++])}return cache[k]=out}
  onInput(root,'k',()=>{const k=KS[+q(root,'k').value];setV(root,'k','k = '+k);const R=ratios(k);
    const m=R.reduce((a,b)=>a+b,0)/R.length,sd=Math.sqrt(R.reduce((a,b)=>a+(b-m)**2,0)/R.length),worst=Math.max(...R.map(v=>Math.abs(v-1)));
    const nb=50,w=2.5/nb,h=new Array(nb).fill(0);R.forEach(v=>{const b=Math.floor(v/w);if(b>=0&&b<nb)h[b]++});const dens=h.map(c=>c/R.length/w);const ym=Math.max(2,Math.max(...dens)*1.12);
    const P=Plot(svg,{w:620,h:360,x:[0,2.5],y:[0,ym],m:{l:46,r:14,t:56,b:40}});P.axes({xt:[0,0.5,1,1.5,2,2.5],yt:[],xl:'projected / original squared distance (1,770 pairs)',yl:'density'});
    P.rect(1-Math.sqrt(2/k),0,1+Math.sqrt(2/k),ym,'fgs',P.bgc);dens.forEach((v,b)=>{if(v>0)P.rect(b*w,0,(b+1)*w,v,'fb')});P.line(1,0,1,ym,'ln thin sk');
    T(P.top,333,20,'60 points in d = 1000 → random projection to k = '+k,'lab');
    T(P.top,333,42,'std '+nf(sd,3)+' (theory √(2/k) = '+nf(Math.sqrt(2/k),3)+') · worst pair off by '+nf(worst,2),'');
    P.text(1+Math.sqrt(2/k),ym*0.92,' ±√(2/k)','','start');})};

/* ---------- LDA vs PCA ---------- */
FIG['dr-lda']=root=>{const svg=svgOf(root);const r=rng(12);const C=[[],[]];const th=0.5;const u=[Math.cos(th),Math.sin(th)],v=[-Math.sin(th),Math.cos(th)];
  for(let c=0;c<2;c++)for(let i=0;i<70;i++){const a=randn(r)*2.2+(c?0.5:-0.5),b=randn(r)*0.45+(c?0.95:-0.95);C[c].push([a*u[0]+b*v[0],a*u[1]+b*v[1]])}
  const all=C[0].concat(C[1]);const mean=P0=>[0,1].map(j=>P0.reduce((s,p)=>s+p[j],0)/P0.length);const m0=mean(C[0]),m1=mean(C[1]),m=mean(all);
  const scat=(P0,mu)=>{let a=0,b=0,c=0;P0.forEach(p=>{const x=p[0]-mu[0],y=p[1]-mu[1];a+=x*x;b+=x*y;c+=y*y});return [[a,b],[b,c]]};
  const S0=scat(C[0],m0),S1=scat(C[1],m1),Sw=[[S0[0][0]+S1[0][0],S0[0][1]+S1[0][1]],[S0[1][0]+S1[1][0],S0[1][1]+S1[1][1]]];const St=scat(all,m);
  const det=Sw[0][0]*Sw[1][1]-Sw[0][1]*Sw[1][0];const dm=[m1[0]-m0[0],m1[1]-m0[1]];let wl=[(Sw[1][1]*dm[0]-Sw[0][1]*dm[1])/det,(-Sw[1][0]*dm[0]+Sw[0][0]*dm[1])/det];
  let nl=Math.hypot(...wl);wl=[wl[0]/nl,wl[1]/nl];const tr=St[0][0]+St[1][1],dt=St[0][0]*St[1][1]-St[0][1]**2,l1=tr/2+Math.sqrt(tr*tr/4-dt);let wp=[St[0][1],l1-St[0][0]];nl=Math.hypot(...wp);wp=[wp[0]/nl,wp[1]/nl];
  const J=w=>{const b=70*((m0[0]-m[0])*w[0]+(m0[1]-m[1])*w[1])**2+70*((m1[0]-m[0])*w[0]+(m1[1]-m[1])*w[1])**2;const ww=w[0]*w[0]*Sw[0][0]+2*w[0]*w[1]*Sw[0][1]+w[1]*w[1]*Sw[1][1];return b/ww};
  const draw=mode=>{initSvg(svg,620,360);const w=mode==='lda'?wl:wp;
    const P=Plot(svg,{at:[0,0],w:620,h:250,x:[-6.6,6.6],y:[-2.55,2.55],m:{l:14,r:14,t:30,b:8}});E('rect',{x:14,y:30,width:592,height:212,fill:'#fafafa',stroke:'#d0d0d0',rx:6},P.bg);
    P.line(-9*w[0],-9*w[1],9*w[0],9*w[1],mode==='lda'?'ln sg':'ln sr');
    C.forEach((Pc,c)=>Pc.forEach(p=>{const d=P.dot(p[0],p[1],3.2,'pt');d.setAttribute('fill',CL3[c])}));
    T(svg,310,20,(mode==='lda'?'LDA direction':'PCA direction (largest variance)')+' · Fisher ratio J(w) = '+nf(J(w),2),'lab');
    const pr=C.map(Pc=>Pc.map(p=>p[0]*w[0]+p[1]*w[1]));const lo=-6,hi=6,nb=36,bw=(hi-lo)/nb;
    const Q=Plot(svg,{at:[0,250],w:620,h:110,x:[lo,hi],y:[0,15],m:{l:14,r:14,t:6,b:26}});Q.line(lo,0,hi,0,'ax');
    pr.forEach((vals,c)=>{const h=new Array(nb).fill(0);vals.forEach(x=>{const b=Math.floor((x-lo)/bw);if(b>=0&&b<nb)h[b]++});h.forEach((cnt,b)=>{if(!cnt)return;const rr=Q.rect(lo+b*bw,0,lo+(b+1)*bw,cnt,'');rr.setAttribute('fill',CL3[c]);rr.setAttribute('fill-opacity',0.55)})});
    T(svg,310,354,'the two classes projected on w (histograms)','')};
  const cur=segs(root,'m',draw);draw(cur()||'pca')};

/* ---------- NMF vs eigenfaces ---------- */
FIG['dr-nmf']=root=>{const svg=initSvg(svgOf(root),480,330);const F=DD.faces;
  T(svg,240,20,'PCA: eigenfaces 1–6 (signed, holistic)','lab');F.eig.forEach((h,j)=>img(svg,6+j*79,32,72,h));
  T(svg,240,140,'NMF: components 1–6 (non-negative parts)','lab');F.nmf.forEach((h,j)=>img(svg,6+j*79,152,72,h));
  T(svg,240,250,'NMF images: dark = large weight; each one is a local part','');
  T(svg,240,272,'a face = sum of parts, never a difference','');
  T(svg,240,306,'Olivetti, k = 16; PCA error 92.15, NMF 93.76','lab')};

/* ---------- the manifold hypothesis ---------- */
FIG['dr-manifold']=root=>{const svg=initSvg(svgOf(root),620,380);const R=DD.roll;const S=R.x.map(RP);
  const P=eqPlot(svg,S,[0,0],620,380,{l:10,r:10,t:30,b:40},0.04);const tmin=Math.min(...R.t),tmax=Math.max(...R.t);
  const order=R.x.map((p,i)=>i).sort((a,b)=>R.x[b][1]-R.x[a][1]);order.forEach(i=>{const c=P.dot(S[i][0],S[i][1],2.3,'');c.setAttribute('fill',vir((R.t[i]-tmin)/(tmax-tmin)));c.setAttribute('fill-opacity',0.75)});
  const pth=R.path.map(i=>S[i]);const pp=P.path(pth,'ln');pp.setAttribute('stroke','#ffc000');pp.setAttribute('stroke-width',4);
  const [a,b]=R.ends;P.line(S[a][0],S[a][1],S[b][0],S[b][1],'ln sr dash');[a,b].forEach(i=>P.dot(S[i][0],S[i][1],6,'fk pt'));
  distLegend(svg,R,368);
  T(svg,310,20,'Swiss roll: 1,500 points, colour = position t along the roll','lab')};

/* ---------- kernel PCA ---------- */
FIG['dr-kpca']=root=>{const svg=svgOf(root);const K=DD.kpca;const ACC={lin:0.450,'0.1':0.440,'1':0.465,'2':1.000,'10':0.755,'50':0.705};
  const draw=g=>{initSvg(svg,620,360);const P=eqPlot(svg,K.x,[0,40],230,250,{l:8,r:8,t:28,b:8},0.05);E('rect',{x:8,y:28,width:214,height:214,fill:'#fafafa',stroke:'#d0d0d0',rx:6},P.bg);
    K.x.forEach((p,i)=>{const c=P.dot(p[0],p[1],2.4,'');c.setAttribute('fill',CL3[K.y[i]])});T(svg,115,56,'data: two rings','lab');
    arrowPx(svg,232,175,262,175,'ln thin sk','fk');
    const Z=K.emb[g];const Q=eqPlot(svg,Z,[268,0],352,330,{l:30,r:10,t:30,b:30},0.05);Q.axes({xt:[],yt:[]});
    Z.forEach((p,i)=>{const c=Q.dot(p[0],p[1],2.6,'');c.setAttribute('fill',CL3[K.y[i]])});
    T(Q.root,186,20,g==='lin'?'linear PCA: just a rotation':'kernel PCA, RBF, γ = '+g,'lab');T(Q.root,186,324,'component 1','');const t=T(Q.root,18,175,'component 2','');t.setAttribute('transform','rotate(-90 18 175)');
    T(svg,115,320,'accuracy on component 1:','');T(svg,115,344,nf(ACC[g],3)+' (lab)','lab')};
  const cur=segs(root,'g',draw);draw(cur()||'lin')};

/* ---------- classical MDS: cities ---------- */
FIG['dr-mds']=root=>{const svg=initSvg(svgOf(root),480,400);const C=DD.cities;const P=eqPlot(svg,C.true.concat(C.mds),[0,0],480,400,{l:10,r:10,t:30,b:30},0.12);
  E('rect',{x:10,y:30,width:460,height:340,fill:'#fafafa',stroke:'#d0d0d0',rx:6},P.bg);
  const off={'A Coruña':[10,-8,'start'],'Barcelona':[0,24,'middle'],'Bilbao':[0,-14,'middle'],'Madrid':[10,5,'start'],'Málaga':[0,22,'middle'],'Murcia':[10,16,'start'],'Pamplona':[10,-2,'start'],
    'Salamanca':[-10,5,'end'],'Sevilla':[-10,8,'end'],'Valencia':[10,5,'start'],'Valladolid':[-10,-8,'end'],'Zaragoza':[10,-8,'start']};
  C.names.forEach((nm,i)=>{const t=C.true[i],m=C.mds[i];P.line(t[0],t[1],m[0],m[1],'ln thin sm');const c1=P.dot(t[0],t[1],7,'nof');c1.setAttribute('stroke','#1f1f1f');c1.setAttribute('stroke-width',1.5);P.dot(m[0],m[1],4,'fr');
    const o=off[nm]||[8,4,'start'];halo(T(P.top,P.X(t[0])+o[0],P.Y(t[1])+o[1],nm,'',o[2]))});
  T(svg,240,20,'circles: true positions · red: classical MDS from distances','lab');T(svg,240,392,'after a Procrustes rotation; disparity '+C.disp,'')};

/* ---------- Isomap, step by step ---------- */
FIG['dr-iso']=root=>{const svg=svgOf(root);const R=DD.roll;const S=R.x.map(RP);const tmin=Math.min(...R.t),tmax=Math.max(...R.t);const tc=i=>vir((R.t[i]-tmin)/(tmax-tmin));
  const order=R.x.map((p,i)=>i).sort((a,b)=>R.x[b][1]-R.x[a][1]);
  const roll=(at,w,h,s)=>{const P=eqPlot(svg,S,at,w,h,{l:6,r:6,t:30,b:6},0.03);order.forEach(i=>{const c=P.dot(S[i][0],S[i][1],w>400?2.2:1.6,'');c.setAttribute('fill',tc(i));c.setAttribute('fill-opacity',s>=1&&w>400?0.35:0.75)});return P};
  const emb=(Z,at,w,h,title)=>{const P=eqPlot(svg,Z,at,w,h,{l:6,r:6,t:30,b:6},0.04);E('rect',{x:6,y:30,width:w-12,height:h-36,fill:'#fafafa',stroke:'#d0d0d0',rx:6},P.bg);
    Z.forEach((p,i)=>{const c=P.dot(p[0],p[1],1.8,'');c.setAttribute('fill',tc(i))});T(svg,at[0]+w/2,at[1]+20,title,'lab');return P};
  stepper(root,s=>{initSvg(svg,620,370);setV(root,'s',s+' / 5');
    if(s<=2){const P=roll([0,0],620,s===2?345:370,s);T(svg,310,20,['the Swiss roll (colour = position along the roll)','1 · k-nearest-neighbour graph, k = 10 (one strip shown)','2 · geodesic: shortest path through the graph'][s],'lab');
      if(s>=1)R.edges.forEach(([a,b])=>{const l=P.line(S[a][0],S[a][1],S[b][0],S[b][1],'ln thin');l.setAttribute('stroke','#1f3864');l.setAttribute('stroke-width',0.7)});
      if(s===2){const pp=P.path(R.path.map(i=>S[i]),'ln');pp.setAttribute('stroke','#ffc000');pp.setAttribute('stroke-width',4);const [a,b]=R.ends;P.line(S[a][0],S[a][1],S[b][0],S[b][1],'ln sr dash');
        distLegend(svg,R,362)}}
    else{const P=roll([0,30],250,300,s);T(svg,125,20,s===5?'k = 40: a short circuit':'the roll','lab');
      if(s===5){const [a,b]=R.short;P.line(S[a][0],S[a][1],S[b][0],S[b][1],'ln sr');P.dot(S[a][0],S[a][1],4,'fr');P.dot(S[b][0],S[b][1],4,'fr')}
      arrowPx(svg,252,185,276,185,'ln thin sk','fk');
      if(s===3)emb(R.iso,[278,0],342,370,'3 · Isomap (k = 10): unrolled, ρ = 0.9999');
      if(s===4)emb(R.pca,[278,0],342,370,'PCA: the layers overlap, ρ = 0.21');
      if(s===5)emb(R.iso40,[278,0],342,370,'Isomap, k = 40: folded, ρ = 0.27')}})};

/* ---------- perplexity and sigma ---------- */
FIG['dr-perp']=root=>{const svg=svgOf(root);const r=rng(8);const pts=[];
  for(let i=0;i<10;i++){const a=2*Math.PI*r(),d=0.4+0.8*r();pts.push([1.1+d*Math.cos(a)*0.8,0.3+d*Math.sin(a)*0.8,0])}
  for(let i=0;i<17;i++){const a=2*Math.PI*r(),d=1.4*Math.sqrt(r());pts.push([-3.4+d*Math.cos(a),-1.4+d*Math.sin(a),1])}
  for(let i=0;i<20;i++){const a=2*Math.PI*r(),d=1.8*Math.sqrt(r());pts.push([5.6+d*Math.cos(a),1.0+d*Math.sin(a),2])}
  const D2=pts.map(p=>p[0]*p[0]+p[1]*p[1]);const PER=[2,5,10,20,40];
  const solve=perp=>{let lo=0,hi=Infinity,b=1,p=null,H=0;for(let it=0;it<200;it++){const w=D2.map(d=>Math.exp(-d*b));const s=w.reduce((a,c)=>a+c,0);p=w.map(v=>v/s);H=-p.reduce((a,v)=>a+(v>0?v*Math.log(v):0),0);
      if(Math.abs(H-Math.log(perp))<1e-6)break;if(H>Math.log(perp)){lo=b;b=hi===Infinity?b*2:(b+hi)/2}else{hi=b;b=(b+lo)/2}}return {p,sig:1/Math.sqrt(2*b),perp:Math.exp(H)}};
  const GN=['close cluster','middle group','far group'],GC=['#ed7d31','#4472c4','#70ad47'];
  onInput(root,'p',()=>{const perp=PER[+q(root,'p').value];setV(root,'p',String(perp));const S=solve(perp);
    const P=Plot(svg,{w:620,h:360,x:[-6.2,8.6],y:[-4.5,4.2],m:{l:10,r:10,t:36,b:10}});E('rect',{x:10,y:36,width:600,height:314,fill:'#fafafa',stroke:'#d0d0d0',rx:6},P.bg);
    [1,2].forEach(k=>{const rx=P.X(k*S.sig)-P.X(0),ry=P.Y(0)-P.Y(k*S.sig);E('ellipse',{cx:P.X(0),cy:P.Y(0),rx:rx,ry:ry,fill:k===1?'#fff2cc':'none','fill-opacity':0.6,stroke:'#bf9000','stroke-width':1.3,'stroke-dasharray':k===2?'5 4':''},P.dyn)});
    pts.forEach((p,j)=>{const rr=2+26*Math.sqrt(S.p[j]);const c=P.dot(p[0],p[1],rr,'');c.setAttribute('fill',GC[p[2]]);c.setAttribute('fill-opacity',0.75);c.setAttribute('stroke','#fff')});
    P.dot(0,0,6,'fk');halo(T(P.top,P.X(0),P.Y(0)+22,'point i','lab'));
    const share=[0,1,2].map(g=>pts.reduce((a,p,j)=>a+(p[2]===g?S.p[j]:0),0));
    T(svg,310,24,'perplexity '+perp+' → σᵢ = '+nf(S.sig,2)+' (circles: σᵢ and 2σᵢ) · area = p(j | i)','lab');
    share.forEach((v,g)=>{const x=40+g*190;dot(svg,x,330,6,GC[g]);T(svg,x+12,335,GN[g]+': '+nf(100*v,1)+' %','','start')})})};

/* ---------- Gaussian vs Student-t kernel ---------- */
FIG['dr-kernels']=root=>{const svg=initSvg(svgOf(root),480,400);const P=Plot(svg,{at:[0,0],w:480,h:400,x:[0,11],y:[-3,0.15],m:{l:52,r:14,t:40,b:42}});
  P.axes({xt:[0,2,4,6,8,10],yt:[-3,-2,-1,0],fy:v=>['0.001','0.01','0.1','1'][v+3],xl:'distance r',yl:'similarity (log scale)'});
  P.fn(x=>Math.max(-3.5,Math.log10(Math.exp(-x*x/2))),'ln sb',0,4,200);P.fn(x=>Math.log10(1/(1+x*x)),'ln so',0,11,200);
  const rg=Math.sqrt(-2*Math.log(0.01)),rt=Math.sqrt(99);P.line(0,-2,11,-2,'ln thin sk dash');P.dot(rg,-2,5,'fb pt');P.dot(rt,-2,5,'fo pt');
  P.line(rg,-2,rg,-3,'ln thin sb dash');P.line(rt,-2,rt,-3,'ln thin so dash');
  arrowPx(P.top,P.X(rg)+8,P.Y(-2)+26,P.X(rt)-8,P.Y(-2)+26,'ln thin sk','fk');halo(T(P.top,(P.X(rg)+P.X(rt))/2,P.Y(-2)+48,nf(rt/rg,1)+'× farther','lab'));
  halo(col(T(P.top,P.X(rg)+6,P.Y(-2)-10,'r = '+nf(rg,1),'lab','start'),'#2f5597'));halo(col(T(P.top,P.X(rt)-6,P.Y(-2)-10,'r = '+nf(rt,1),'lab','end'),'#c55a11'));
  ln(P.top,[P.X(5.2),P.Y(-0.2)],[P.X(6.2),P.Y(-0.2)],'#4472c4',2.5);col(T(P.top,P.X(6.4),P.Y(-0.2)+5,'Gaussian e^(−r²/2), high-D','','start'),'#2f5597');
  ln(P.top,[P.X(5.2),P.Y(-0.5)],[P.X(6.2),P.Y(-0.5)],'#ed7d31',2.5);col(T(P.top,P.X(6.4),P.Y(-0.5)+5,'Student-t 1/(1 + r²), low-D','','start'),'#c55a11');
  T(svg,262,24,'for a similarity of 0.01:','lab')};

/* ---------- t-SNE perplexity ---------- */
FIG['dr-tsne']=root=>{const svg=svgOf(root);const Y=DD.tsne.y;const Q={5:0.543,30:0.584,100:0.541};
  const draw=p=>{initSvg(svg,620,370);const Z=DD.tsne[p];const P=eqPlot(svg,Z,[0,0],620,370,{l:8,r:8,t:32,b:6},0.03);E('rect',{x:8,y:32,width:604,height:332,fill:'#fafafa',stroke:'#d0d0d0',rx:6},P.bg);
    Z.forEach((z,i)=>{const c=P.dot(z[0],z[1],2.1,'');c.setAttribute('fill',TAB[Y[i]])});classLabels(P,Z,Y,10);
    T(svg,310,22,'1,797 digits, perplexity '+p+' · 10-NN preservation '+Q[p].toFixed(3)+' (lab)','lab')};
  const cur=segs(root,'p',draw);draw(cur()||'30')};

/* ---------- what t-SNE does not show ---------- */
FIG['dr-lies']=root=>{const svg=svgOf(root);const L=DD.lies;const ys=[...Array(300)].map((_,i)=>i<150?0:1),yd=[...Array(300)].map((_,i)=>Math.floor(i/100));
  const draw=m=>{initSvg(svg,620,340);const X=m==='sizes'?L.size_x:L.dist_x,Z=m==='sizes'?L.size_e:L.dist_e,y=m==='sizes'?ys:yd;
    const P=eqPlot(svg,X,[0,0],300,300,{l:8,r:8,t:32,b:8},0.06);E('rect',{x:8,y:32,width:284,height:260,fill:'#fafafa',stroke:'#d0d0d0',rx:6},P.bg);X.forEach((p,i)=>{const c=P.dot(p[0],p[1],2.4,'');c.setAttribute('fill',CL3[y[i]])});
    const Q=eqPlot(svg,Z,[320,0],300,300,{l:8,r:8,t:32,b:8},0.06);E('rect',{x:8,y:32,width:284,height:260,fill:'#fafafa',stroke:'#d0d0d0',rx:6},Q.bg);Z.forEach((p,i)=>{const c=Q.dot(p[0],p[1],2.4,'');c.setAttribute('fill',CL3[y[i]])});
    arrowPx(svg,296,165,324,165,'ln thin sk','fk');
    T(svg,150,22,m==='sizes'?'data: σ = 1 and σ = 0.1':'data: gaps of 10 and 50','lab');T(svg,470,22,'t-SNE map (perplexity 30)','lab');
    T(svg,150,318,m==='sizes'?'spread ratio 10.5':'gap ratio 4.9','lab');T(svg,470,318,m==='sizes'?'spread ratio 0.89':'gap ratio 1.02','lab')};
  const cur=segs(root,'m',draw);draw(cur()||'sizes')};

/* ---------- UMAP ---------- */
FIG['dr-umap']=root=>{const svg=initSvg(svgOf(root),480,400);
  const N=[[60,70],[100,46],[118,96],[70,120],[150,66],[300,60],[340,40],[360,96],[318,118],[400,74]];
  const Ed=[[0,1,0.9],[0,2,0.6],[0,3,1],[1,2,0.8],[1,4,0.5],[2,3,0.7],[2,4,0.9],[5,6,1],[5,7,0.7],[5,8,0.9],[6,7,0.6],[7,8,0.8],[7,9,1],[6,9,0.5],[4,5,0.12]];
  E('rect',{x:10,y:24,width:460,height:130,fill:'#fafafa',stroke:'#d0d0d0',rx:6},svg);T(svg,240,16,'1 · fuzzy kNN graph in high dimension','lab');
  Ed.forEach(([a,b,w])=>ln(svg,N[a],N[b],'#4472c4',0.6+4*w));N.forEach((p,i)=>dot(svg,p[0],p[1],8,i<5?'#ed7d31':'#70ad47','#fff',1.5));
  halo(T(svg,225,52,'weak edge 0.12','','middle'));T(svg,240,148,'edge width = membership weight w_ij ∈ [0, 1]','');
  arrowPx(svg,240,160,240,188,'ln sb','fb');
  E('rect',{x:10,y:208,width:460,height:150,fill:'#fafafa',stroke:'#d0d0d0',rx:6},svg);T(svg,240,226,'2 · layout in 2-D: minimise the cross-entropy','lab');
  const M=[[70,290],[106,270],[110,318],[60,330],[140,296],[330,282],[366,262],[380,312],[340,326],[410,290]];
  Ed.forEach(([a,b,w])=>{if(w>0.3)ln(svg,M[a],M[b],'#bfbfbf',1.2)});M.forEach((p,i)=>dot(svg,p[0],p[1],7,i<5?'#ed7d31':'#70ad47','#fff',1.5));
  arrowPx(svg,180,296,152,296,'ln sg','fgr');col(T(svg,184,288,'neighbours attract','','start'),'#548235');
  arrowPx(svg,298,306,256,306,'ln sr','fr');arrowPx(svg,192,320,236,320,'ln sr','fr');col(T(svg,246,346,'a sampled non-neighbour repels','','middle'),'#c00000');
  T(svg,240,386,'SGD over edges + negative sampling: no sum over all n² pairs','')};

/* ---------- measuring embeddings (lab numbers) ---------- */
FIG['dr-quality']=root=>{const svg=initSvg(svgOf(root),480,420);const M=['PCA','Isomap','t-SNE'],MC=['#a5a5a5','#70ad47','#ed7d31'];
  const panel=(y0,title,vals)=>{T(svg,250,y0+14,title,'lab');const X0=70,W=380,H=118,yb=y0+46+H;ln(svg,[X0,yb],[X0+W,yb],'#595959',1.2);
    [0,0.5,1].forEach(v=>{ln(svg,[X0,yb-v*H],[X0+W,yb-v*H],'#ececec',1);T(svg,X0-6,yb-v*H+4,String(v),'','end')});
    ['digits','Swiss roll'].forEach((g,gi)=>{const gx=X0+20+gi*190;vals[gi].forEach((v,mi)=>{const x=gx+mi*52;E('rect',{x:x,y:yb-v*H,width:44,height:v*H,fill:MC[mi]},svg);T(svg,x+22,yb-v*H-5,v.toFixed(2),'')});T(svg,gx+74,yb+20,g,'lab')})};
  panel(0,'kNN preservation Q₁₀ (local)',[[0.118,0.181,0.584],[0.409,0.853,0.859]]);
  panel(200,'distance correlation (global)',[[0.582,0.502,0.510],[0.376,0.999,0.886]]);
  M.forEach((m,i)=>{E('rect',{x:130+i*90,y:402,width:14,height:14,fill:MC[i]},svg);T(svg,150+i*90,414,m,'','start')})};
})();
