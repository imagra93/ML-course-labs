/* Figure library. In a slide, write <svg class="fig" data-fig="NAME"></svg> or
   <div class="widget" data-fig="NAME">…controls…</div>; the matching function below draws it. */
(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
function E(tag,a,p){const e=document.createElementNS(NS,tag);if(a)for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function T(parent,x,y,s,cls,anchor){const t=E('text',{x:x,y:y,'text-anchor':anchor||'middle'},parent);if(cls)t.setAttribute('class',cls);t.textContent=s;return t}
function initSvg(svg,w,h){svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.innerHTML='';return svg}
let clipN=0;
function Plot(svg,o){
  const w=o.w,h=o.h,m=Object.assign({l:46,r:14,t:14,b:36},o.m||{});
  let root=svg;if(o.at){root=E('g',{transform:'translate('+o.at[0]+','+o.at[1]+')'},svg)}else{initSvg(svg,w,h)}
  const id='cp'+(clipN++);const defs=E('defs',{},root);const cp=E('clipPath',{id:id},defs);E('rect',{x:m.l,y:m.t,width:w-m.l-m.r,height:h-m.t-m.b},cp);
  const bg=E('g',{},root),bgc=E('g',{'clip-path':'url(#'+id+')'},root),dyn=E('g',{'clip-path':'url(#'+id+')'},root),top=E('g',{},root);
  const x0=o.x[0],x1=o.x[1],y0=o.y[0],y1=o.y[1];const lx=!!o.logx;
  const X=v=>{const t=lx?(Math.log10(v)-Math.log10(x0))/(Math.log10(x1)-Math.log10(x0)):(v-x0)/(x1-x0);return m.l+t*(w-m.l-m.r)};
  const Y=v=>{const r=h-m.b-(v-y0)/(y1-y0)*(h-m.t-m.b);return Math.max(-4000,Math.min(4000,r))};
  const P={X,Y,w,h,m,bg,bgc,dyn,top,root,
    clear(){dyn.innerHTML='';top.innerHTML=''},
    axes(opt){opt=opt||{};const xt=opt.xt||[],yt=opt.yt||[],fx=opt.fx||(v=>v),fy=opt.fy||(v=>v);
      if(opt.grid!==false){yt.forEach(v=>E('line',{x1:m.l,x2:w-m.r,y1:Y(v),y2:Y(v),class:'gr'},bg));xt.forEach(v=>E('line',{y1:m.t,y2:h-m.b,x1:X(v),x2:X(v),class:'gr'},bg))}
      if(opt.noaxes!==true){E('line',{x1:m.l,x2:w-m.r,y1:h-m.b,y2:h-m.b,class:'ax'},bg);E('line',{x1:m.l,x2:m.l,y1:m.t,y2:h-m.b,class:'ax'},bg)}
      xt.forEach(v=>T(bg,X(v),h-m.b+(opt.xl?Math.min(18,m.b-19):18),fx(v)));yt.forEach(v=>T(bg,m.l-7,Y(v)+4,fy(v),'','end'));
      if(opt.xl)T(bg,(m.l+w-m.r)/2,h-2,opt.xl,'lab');
      if(opt.yl){const cy=(m.t+h-m.b)/2;const tw=yt.reduce((a,v)=>Math.max(a,String(fy(v)).length),0)*6.3;const lx=Math.max(9,Math.min(13,m.l-7-tw-6));const t=T(bg,lx,cy,opt.yl,'lab');t.setAttribute('transform','rotate(-90 '+lx+' '+cy+')')}
      if(opt.title)T(bg,(m.l+w-m.r)/2,m.t-4,opt.title,'lab')},
    path(pts,cls,g){let d='';pts.forEach(p=>{if(!isFinite(p[1]))return;d+=(d?'L':'M')+X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)});return E('path',{d:d,class:cls},g||dyn)},
    fn(f,cls,a,b,n,g){a=(a===undefined)?x0:a;b=(b===undefined)?x1:b;n=n||240;const pts=[];for(let i=0;i<=n;i++){const x=lx?Math.pow(10,Math.log10(a)+(Math.log10(b)-Math.log10(a))*i/n):a+(b-a)*i/n;pts.push([x,f(x)])}return P.path(pts,cls,g)},
    dot(x,y,r,cls,g){return E('circle',{cx:X(x),cy:Y(y),r:r,class:cls},g||dyn)},
    line(xa,ya,xb,yb,cls,g){return E('line',{x1:X(xa),y1:Y(ya),x2:X(xb),y2:Y(yb),class:cls},g||dyn)},
    text(x,y,s,cls,anchor,dx,dy,g){return T(g||top,X(x)+(dx||0),Y(y)+(dy||0),s,cls||'',anchor)},
    rect(xa,ya,xb,yb,cls,g){return E('rect',{x:Math.min(X(xa),X(xb)),y:Math.min(Y(ya),Y(yb)),width:Math.abs(X(xb)-X(xa)),height:Math.abs(Y(yb)-Y(ya)),class:cls},g||dyn)},
    poly(pts,cls,g){return E('polygon',{points:pts.map(p=>X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join(' '),class:cls},g||dyn)}};
  return P}
function arrowPx(g,X1,Y1,X2,Y2,cls,fcls){E('line',{x1:X1,y1:Y1,x2:X2,y2:Y2,class:cls},g);const a=Math.atan2(Y2-Y1,X2-X1),L=11,W=5.5;
  const p=[[X2,Y2],[X2-L*Math.cos(a)+W*Math.sin(a),Y2-L*Math.sin(a)-W*Math.cos(a)],[X2-L*Math.cos(a)-W*Math.sin(a),Y2-L*Math.sin(a)+W*Math.cos(a)]];
  E('polygon',{points:p.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' '),class:fcls},g)}
function arrow(P,xa,ya,xb,yb,cls,fcls,g){arrowPx(g||P.dyn,P.X(xa),P.Y(ya),P.X(xb),P.Y(yb),cls,fcls)}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function randn(r){let u=0;while(!u)u=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*r())}
function solve(A,b){const n=b.length;A=A.map(r=>r.slice());b=b.slice();
  for(let i=0;i<n;i++){let p=i;for(let k=i+1;k<n;k++)if(Math.abs(A[k][i])>Math.abs(A[p][i]))p=k;let t=A[i];A[i]=A[p];A[p]=t;t=b[i];b[i]=b[p];b[p]=t;
    for(let k=i+1;k<n;k++){const f=A[k][i]/A[i][i];for(let j=i;j<n;j++)A[k][j]-=f*A[i][j];b[k]-=f*b[i]}}
  const x=new Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=b[i];for(let j=i+1;j<n;j++)s-=A[i][j]*x[j];x[i]=s/A[i][i]}return x}
const fmt=(v,d)=>(Math.abs(v)<1e-12?0:v).toFixed(d===undefined?2:d);
function equalY(w,h,m,xr,yc){const aw=w-m.l-m.r,ah=h-m.t-m.b;const span=(xr[1]-xr[0])*ah/aw;return [yc-span/2,yc+span/2]}
const q=(root,k)=>root.querySelector('[data-k="'+k+'"]');
/* Output boxes may live outside the widget (e.g. in the text column): fall back to the whole slide. */
const scope=(root,sel)=>{let n=root.querySelectorAll(sel);if(!n.length){const s=root.closest('.slide');if(s)n=s.querySelectorAll(sel)}return n};
const setV=(root,k,v)=>scope(root,'[data-v="'+k+'"]').forEach(e=>e.textContent=v);
const setR=(root,k,v)=>scope(root,'[data-r="'+k+'"]').forEach(e=>e.textContent=v);
const svgOf=root=>root.tagName.toLowerCase()==='svg'?root:root.querySelector('svg');

const FIG={};

/* ---------- supervised learning ---------- */
FIG['sl-diagram']=root=>{const svg=initSvg(svgOf(root),520,330);
  const box=(x,y,w,t1,t2)=>{E('rect',{x:x-w/2,y:y-30,width:w,height:60,class:'fw',style:'stroke:#404040;stroke-width:1.5'},svg);T(svg,x,t2?y-4:y+6,t1,'lab');if(t2)T(svg,x,y+18,t2,'lab')};
  box(260,40,150,'Training','set');box(260,150,150,'Learning','algorithm');
  E('rect',{x:235,y:235,width:50,height:50,class:'fw',style:'stroke:#404040;stroke-width:1.5'},svg);T(svg,260,267,'h','lab big');
  arrowPx(svg,260,70,260,118,'ln thin sk','fk');arrowPx(svg,260,180,260,233,'ln thin sk','fk');
  arrowPx(svg,120,260,233,260,'ln thin sk','fk');arrowPx(svg,287,260,400,260,'ln thin sk','fk');
  T(svg,100,265,'x','lab big','end');T(svg,100,290,'living area','','end');T(svg,100,308,'of a house','','end');
  T(svg,410,265,'predicted y','lab big','start');T(svg,410,290,'predicted price','','start');T(svg,410,308,'of the house','','start')};

/* ---------- linear regression ---------- */
FIG['lr-divider']=root=>{const P=Plot(svgOf(root),{w:380,h:300,x:[0,10],y:[0,10],m:{l:20,r:20,t:20,b:20}});
  arrow(P,0.3,0.3,0.3,9.8,'ln thin sb','fb',P.bg);arrow(P,0.3,0.3,9.8,0.3,'ln thin sb','fb',P.bg);P.text(0.3,9.8,'Y','', 'end',-8,8);P.text(9.8,0.3,'X','', 'middle',0,20);
  const r=rng(2);for(let i=0;i<70;i++){const x=1.5+7*r();P.dot(x,1+0.8*x+0.6*randn(r),3,'fy')}arrow(P,1.2,1.8,9.2,8.4,'ln thin sr','fr')};
FIG['house']=root=>{const P=Plot(svgOf(root),{w:560,h:380,x:[0,5800],y:[0,850],m:{l:56,r:14,t:26,b:40}});
  P.axes({xt:[0,1000,2000,3000,4000,5000],yt:[0,200,400,600,800],fy:v=>v?v+'k':'0',xl:'Living area (sq ft)',yl:'Price',title:'Living Area vs Price (synthetic)'});
  const r=rng(24);for(let i=0;i<600;i++){const a=Math.exp(7.2+0.33*randn(r));const p=Math.max(30,(18+0.105*a)*(1+0.28*randn(r)));P.dot(Math.min(a,5700),Math.min(p,830),2.6,'fb')}
  [[4480,760],[4660,745],[4700,160],[5650,170]].forEach(p=>P.dot(p[0],p[1],2.8,'fb'))};
FIG['fit-iter']=root=>{const r=rng(31);const D=[];for(let i=0;i<300;i++){const x=-2+4*r();D.push([x,6+2.3*x+1.6*randn(r)])}
  const m=D.length;let t0=0,t1=0;const hist=[[0,0]];for(let k=0;k<80;k++){let g0=0,g1=0;D.forEach(([x,y])=>{const e=t0+t1*x-y;g0+=e;g1+=e*x});t0-=0.08*g0/m;t1-=0.08*g1/m;hist.push([t0,t1])}
  const J=(a,b)=>D.reduce((s,[x,y])=>s+(a+b*x-y)**2,0)/(2*m);
  const P=Plot(svgOf(root),{w:560,h:380,x:[-3,3],y:[-2,16],m:{l:40,r:14,t:26,b:36}});P.axes({xt:[-3,-2,-1,0,1,2,3],yt:[-2,0,2,4,6,8,10,12,14,16],xl:'x',yl:'y'});
  D.forEach(([x,y])=>P.dot(x,y,2.3,'fb',P.bg));const inp=q(root,'k');const ttl=T(P.top,288,18,'','lab');
  function draw(){const k=+inp.value;const [a,b]=hist[k];setV(root,'k',k);P.dyn.innerHTML='';P.line(-2,a-2*b,2,a+2*b,'ln sr');ttl.textContent='Fit at iteration '+k;
    setR(root,'t0',fmt(a));setR(root,'t1',fmt(b));setR(root,'j',fmt(J(a,b)))}inp.addEventListener('input',draw);draw()};
FIG['resid']=root=>{const r=rng(14);const D=[0.6,1.1,1.7,2.2,2.8,3.3,3.9,4.4].map(x=>[x,1.5*x+0.55*randn(r)]);const m=D.length;
  const Sxx=D.reduce((s,p)=>s+p[0]*p[0],0),Sxy=D.reduce((s,p)=>s+p[0]*p[1],0);const ts=Sxy/Sxx;const J=t=>D.reduce((s,p)=>s+(t*p[0]-p[1])**2,0)/(2*m);
  const svg=initSvg(svgOf(root),560,300);const P=Plot(svg,{at:[0,0],w:300,h:300,x:[0,5],y:[0,8.5],m:{l:34,r:8,t:10,b:34}});P.axes({xt:[0,1,2,3,4,5],yt:[0,2,4,6,8],xl:'x',yl:'y'});
  const jm=Math.max(J(0),J(3))*1.05;const Q=Plot(svg,{at:[300,0],w:260,h:300,x:[0,3],y:[0,jm],m:{l:40,r:8,t:10,b:34}});Q.axes({xt:[0,1,2,3],yt:[0,Math.round(jm/2),Math.round(jm)],xl:'θ',yl:'J(θ)'});
  Q.fn(J,'ln sb',0,3,200,Q.bg);Q.line(ts,0,ts,jm,'ln thin sg dash',Q.bg);setR(root,'ts',fmt(ts,3));const inp=q(root,'t');
  function draw(){const t=+inp.value;setV(root,'t',fmt(t));P.clear();
    D.forEach(([x,y])=>{const px=P.X(x),py=P.Y(y),ph=P.Y(t*x);const s=Math.abs(py-ph);E('rect',{x:px,y:Math.min(py,ph),width:s,height:s,class:'fos',style:'stroke:var(--orange);stroke-width:1'},P.dyn);P.line(x,y,x,t*x,'ln thin so dot2')});
    P.fn(x=>t*x,'ln sr');D.forEach(([x,y])=>P.dot(x,y,5,'pt fb'));Q.clear();Q.dot(t,J(t),6,'fr pt');setR(root,'j',fmt(J(t),3))}
  inp.addEventListener('input',draw);draw()};
FIG['convex']=root=>{const svg=initSvg(svgOf(root),420,150);
  const A=Plot(svg,{at:[0,0],w:200,h:150,x:[-1.2,1.2],y:[-0.1,1.5],m:{l:10,r:10,t:22,b:10}});A.axes({grid:false});A.fn(x=>x*x,'ln sb');A.dot(0,0,4,'fr');T(A.root,100,14,'Convex','lab');A.text(0,0,'minimiser','', 'middle',0,-8);
  const B=Plot(svg,{at:[215,0],w:205,h:150,x:[-1.3,1.3],y:[-0.9,1.5],m:{l:10,r:10,t:22,b:10}});B.axes({grid:false});const f=x=>1.3*x**4-1.1*x*x+0.25*x;B.fn(f,'ln sb');
  const mins=[];for(let i=1;i<260;i++){const a=-1.3+2.6*(i-1)/260,b=-1.3+2.6*i/260,c=-1.3+2.6*(i+1)/260;if(f(b)<f(a)&&f(b)<f(c))mins.push(b)}
  mins.sort((u,v)=>f(u)-f(v));mins.forEach((x,k)=>{B.dot(x,f(x),4,'fr');B.text(x,f(x),k===0?'global min':'local min','', 'middle',0,16)});T(B.root,102,14,'Non-convex','lab')};
FIG['gd1']=root=>{const J=t=>0.5*(t-2)*(t-2);const P=Plot(svgOf(root),{w:560,h:360,x:[-2.5,6.5],y:[0,11],m:{l:40,r:14,t:14,b:36}});
  P.axes({xt:[-2,0,2,4,6],yt:[0,5,10],xl:'θ',yl:'J(θ)'});P.fn(J,'ln sb',-2.5,6.5,200,P.bg);P.line(2,0,2,11,'ln thin sm dash',P.bg);P.text(2,0,'minimum','', 'start',6,-8,P.bg);P.text(-1.5,J(-1.5),'random initial value','', 'start',10,4,P.bg);
  const inp=q(root,'a');
  function draw(){const a=+inp.value;setV(root,'a',fmt(a));P.clear();let t=-1.5;const pts=[[t,J(t)]];for(let k=0;k<16;k++){t=t-a*(t-2);pts.push([t,J(t)]);if(Math.abs(t)>1e3)break}
    for(let k=0;k<pts.length-1;k++){if(Math.abs(pts[k+1][0])>50)break;arrow(P,pts[k][0],pts[k][1],pts[k+1][0],pts[k+1][1],'ln thin sr','fr')}
    pts.forEach((p,k)=>P.dot(p[0],p[1],k===0?6:4,k===0?'fk':'fr'));setR(root,'f',fmt(1-a));
    setR(root,'b',Math.abs(a-1)<1e-9?'Lands on the minimum in one step':a<1?'Converges smoothly':a<2-1e-9?'Overshoots, oscillates, converges':Math.abs(a-2)<1e-9?'Bounces forever':'Diverges')}
  inp.addEventListener('input',draw);draw()};
FIG['alpha3']=root=>{const svg=initSvg(svgOf(root),1000,300);const J=t=>0.5*(t-2)*(t-2);
  [['Too low',0.12,'A small learning rate needs many updates'],['Just right',0.7,'The optimal rate reaches the minimum swiftly'],['Too high',2.08,'Too large a rate causes divergent behaviour']].forEach(([lab,a,cap],k)=>{
    const P=Plot(svg,{at:[k*335,0],w:320,h:300,x:[-1.3,5.3],y:[0,6.5],m:{l:24,r:8,t:28,b:48}});P.axes({grid:false});P.fn(J,'ln sb',-1.3,5.3);T(P.root,160,18,lab,'lab big');
    let t=5,pts=[[t,J(t)]];for(let i=0;i<(k===2?4:12);i++){t=t-a*(t-2);pts.push([t,J(t)])}for(let i=0;i<pts.length-1;i++)arrow(P,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],'ln thin sr','fr');
    P.dot(5,J(5),5,'fy');T(P.root,160,288,cap,'','middle');T(P.root,14,40,'J(θ)','','start');T(P.root,305,262,'θ','','end')})};
FIG['loss-curves']=root=>{const svg=initSvg(svgOf(root),620,300);
  const P=Plot(svg,{at:[0,0],w:330,h:300,x:[0,100],y:[0,1.3],m:{l:40,r:10,t:10,b:36}});P.axes({grid:false,xl:'epoch',yl:'loss'});
  P.path([[0,1],[12,1.3]],'ln so');
  P.fn(e=>0.35+0.65*Math.exp(-e/70),'ln sb');P.fn(e=>0.48+0.52*Math.exp(-e/6),'ln sg');P.fn(e=>0.12+0.88*Math.exp(-e/14),'ln sr');
  P.text(14,1.25,'very high learning rate','', 'start');P.text(62,0.64,'low learning rate','', 'start');P.text(55,0.46,'high learning rate','', 'start');P.text(22,0.1,'good learning rate','', 'start');
  const Q=Plot(svg,{at:[330,0],w:290,h:300,x:[1e-6,1e-1],y:[0.4,1.15],logx:true,m:{l:40,r:10,t:10,b:36}});Q.axes({xt:[1e-6,1e-4,1e-2],fx:v=>v.toExponential(0),yt:[0.4,0.6,0.8,1.0],xl:'learning rate (log)',yl:'loss'});
  const r=rng(5);const pts=[];for(let i=0;i<=120;i++){const lr=Math.pow(10,-6+5*i/120);const l=Math.log10(lr);let v=0.72-0.3/(1+Math.exp(-(l+3.4)*3))+(l>-2.3?0.5*Math.pow(l+2.3,2)*1.8:0)+0.015*randn(r);pts.push([lr,Math.min(v,1.15)])}Q.path(pts,'ln sb')};
FIG['feat-log']=root=>{const P=Plot(svgOf(root),{w:460,h:330,x:[0,510],y:[-6.5,3],m:{l:40,r:10,t:10,b:36}});P.axes({xt:[0,100,200,300,400,500],yt:[-6,-4,-2,0,2],xl:'x',yl:'y'});
  const r=rng(8);for(let i=0;i<350;i++){const x=2+500*r();P.dot(x,-5+1.0*Math.log(x)+0.9*randn(r)*0.9-0,2.4,'nof',P.bg).setAttribute('style','stroke:#404040;stroke-width:.8')}
  P.fn(x=>-5+Math.log(x),'ln sk',2,505);P.fn(x=>-5.05+Math.log(x)*1.01,'ln sr dash',2,505)};
FIG['lin-poly']=root=>{const svg=initSvg(svgOf(root),440,190);const xs=[0.5,1.2,2,2.7,3.4,4.1,4.6],ys=xs.map(x=>0.3+0.12*x*x);
  [['Simple linear model',x=>-0.2+0.62*x,'y = b₀ + b₁x'],['Polynomial model',x=>0.3+0.12*x*x,'y = b₀ + b₁x + b₂x²']].forEach(([lab,f,eq],k)=>{
    const P=Plot(svg,{at:[k*225,0],w:215,h:190,x:[0,5],y:[0,3.4],m:{l:14,r:6,t:24,b:14}});P.axes({grid:false});T(P.root,110,16,lab,'lab');P.fn(f,'ln sr thin');xs.forEach((x,i)=>P.dot(x,ys[i],3.5,'fgr'));P.text(4.9,0.4,eq,'', 'end')})};
FIG['gd2']=root=>{const m={l:30,r:14,t:14,b:30};const xr=[-3.2,3.2];const P=Plot(svgOf(root),{w:560,h:380,x:xr,y:equalY(560,380,m,xr,0),m:m});P.axes({xt:[-3,0,3],yt:[-2,0,2],xl:'w₁',yl:'w₂'});
  let mode='raw';const e0=[-2.8,0.6];const btns=root.querySelectorAll('.seg button');
  function draw(){const L=mode==='raw'?[1,25]:[1,1.6];const a=1.6/Math.max(L[0],L[1]);P.clear();const J0=0.5*(L[0]*e0[0]**2+L[1]*e0[1]**2);
    for(let k=1;k<=10;k++){const lev=J0*(k/10)**2*1.6;const pts=[];for(let i=0;i<=120;i++){const t=2*Math.PI*i/120;pts.push([Math.sqrt(2*lev/L[0])*Math.cos(t),Math.sqrt(2*lev/L[1])*Math.sin(t)])}P.path(pts,'ln thin sb').setAttribute('opacity','0.5')}
    let e=e0.slice();const path=[e.slice()];let n=0;const n0=Math.hypot(e0[0],e0[1]);while(Math.hypot(e[0],e[1])>0.01*n0&&n<400){e=[e[0]*(1-a*L[0]),e[1]*(1-a*L[1])];path.push(e.slice());n++}
    P.path(path,'ln thin sr');path.slice(0,60).forEach((p,k)=>P.dot(p[0],p[1],k===0?6:3.5,k===0?'fk':'fr'));P.dot(0,0,5,'fk');
    setR(root,'k',fmt(Math.max(L[0],L[1])/Math.min(L[0],L[1]),1));setR(root,'n',String(n))}
  btns.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));draw()};
FIG['overfit']=root=>{const r=rng(7);const tr=[],te=[];for(let i=0;i<20;i++){const x=(i+0.2+0.6*r())/20;tr.push([x,Math.sin(2*Math.PI*x)+0.3*randn(r)])}
  for(let i=0;i<300;i++){const x=r();te.push([x,Math.sin(2*Math.PI*x)+0.3*randn(r)])}
  const basis=(x,d)=>{const t=2*x-1;const b=[1];if(d>=1)b.push(t);for(let k=1;k<d;k++)b.push(((2*k+1)*t*b[k]-k*b[k-1])/(k+1));return b};
  function fit(d,lam){const A=[],bb=[];for(let i=0;i<=d;i++){A.push(new Array(d+1).fill(0));bb.push(0)}tr.forEach(([x,y])=>{const f=basis(x,d);for(let i=0;i<=d;i++){bb[i]+=f[i]*y;for(let j=0;j<=d;j++)A[i][j]+=f[i]*f[j]}});
    for(let i=0;i<=d;i++)A[i][i]+=(i>0?lam:0)+1e-9;const c=solve(A,bb);const pred=x=>basis(x,d).reduce((s,v,i)=>s+v*c[i],0);const rm=D=>Math.sqrt(D.reduce((s,p)=>s+(pred(p[0])-p[1])**2,0)/D.length);return {pred:pred,tr:rm(tr),te:rm(te)}}
  const P=Plot(svgOf(root),{w:600,h:360,x:[0,1],y:[-2,2],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[0,0.25,0.5,0.75,1],yt:[-2,-1,0,1,2],xl:'x',yl:'y'});P.fn(x=>Math.sin(2*Math.PI*x),'ln thin sm dash',0,1,200,P.bg);
  const id=q(root,'d'),il=q(root,'l');
  function draw(){const d=+id.value,le=+il.value,lam=le<=-6?0:Math.pow(10,le);setV(root,'d',d);setV(root,'l',lam===0?'0':lam<0.01?lam.toExponential(0):fmt(lam,2));const f=fit(d,lam);P.clear();P.fn(f.pred,'ln sr',0,1,400);tr.forEach(p=>P.dot(p[0],p[1],5,'pt fb'));
    setR(root,'tr',fmt(f.tr,3));setR(root,'te',f.te>9?'> 9':fmt(f.te,3));/* train RMSE above 0.45 (noise σ = 0.3): can't fit even the training data; else test RMSE above 0.5: fails on new data */
    setR(root,'vd',f.tr>0.45?'Underfitting':(f.te>0.5?'Overfitting':'Just right'))}
  id.addEventListener('input',draw);il.addEventListener('input',draw);draw()};
FIG['l1l2']=root=>{const svg=initSvg(svgOf(root),960,330);const c=[2.3,1.0],A=[[1,-0.6],[-0.6,1]],t=1.2;const J=(a,b)=>{const u=a-c[0],v=b-c[1];return A[0][0]*u*u+2*A[0][1]*u*v+A[1][1]*v*v};
  [['L1 norm · sparsity inducing',1,'fb'],['L2 norm · weight sharing',2,'fo'],['L1 + L2 · compromise',3,'fy']].forEach(([lab,kind,fc],k)=>{
    const m={l:10,r:10,t:30,b:10};const xr=[-1.7,3.6];const yr=equalY(310,330,m,xr,0.9);const P=Plot(svg,{at:[k*325,0],w:310,h:330,x:xr,y:yr,m:m});
    P.line(xr[0],0,xr[1],0,'ax',P.bg);P.line(0,yr[0],0,yr[1],'ax',P.bg);let best=null;const N=3000;const shape=[];
    for(let i=0;i<N;i++){const a=2*Math.PI*i/N,cs=Math.cos(a),sn=Math.sin(a);let s;if(kind===1)s=t/(Math.abs(cs)+Math.abs(sn));else if(kind===2)s=t;else{const n1=Math.abs(cs)+Math.abs(sn);s=t/(0.5*n1+0.5)}
      const p=[s*cs,s*sn];shape.push(p);const v=J(p[0],p[1]);if(!best||v<best[2])best=[p[0],p[1],v]}
    P.poly(shape,fc).setAttribute('opacity','0.85');
    [1,2.2,3.8,5.6].forEach(f=>{const L=best[2]*f;const pts=[];for(let i=0;i<=180;i++){const a=2*Math.PI*i/180,u=Math.cos(a),v=Math.sin(a);const qq=A[0][0]*u*u+2*A[0][1]*u*v+A[1][1]*v*v;const rr=Math.sqrt(L/qq);pts.push([c[0]+rr*u,c[1]+rr*v])}P.path(pts,'ln thin sb')});
    P.dot(c[0],c[1],5,'fb');P.text(c[0],c[1],'θ OLS','', 'start',7,-6);P.dot(best[0],best[1],6,'fgr pt');T(P.root,155,18,lab,'lab');P.text(xr[1],0,'θ₁','', 'end',-4,16);P.text(0,yr[1],'θ₂','', 'start',6,16)})};
FIG['r2']=root=>{const P=Plot(svgOf(root),{w:420,h:300,x:[0,10],y:[0,10],m:{l:20,r:20,t:14,b:24}});P.axes({grid:false});
  const f=x=>1.2+0.85*x;P.fn(f,'ln sk thin dash');P.line(0,4.6,10,4.6,'ln sk thin');P.text(0,4.6,'ȳ','lab','start',4,-6);P.text(9.6,f(9.6),'ŷ','lab','end',-4,-8);
  [[1.5,2.6],[3,3.4],[4.2,5.3],[5.5,4.2],[2.4,1.6]].forEach(p=>P.dot(p[0],p[1],4,'fk'));const xi=7.2,yi=9.4;P.dot(xi,yi,5,'fr');P.text(xi,yi,'yᵢ','lab','end',-8,0);
  P.line(xi+0.25,4.6,xi+0.25,yi,'ln sb');P.line(xi-0.25,4.6,xi-0.25,f(xi),'ln sg');P.line(xi-0.25,f(xi),xi-0.25,yi,'ln so');
  P.text(xi+0.35,7,'total variation','', 'start');P.text(xi-0.4,5.6,'explained','', 'end');P.text(xi-0.4,8.8,'unexplained','', 'end')};

/* ---------- shared: CART builder (used by trees and ensembles) ---------- */
function waveLabel(x1,x2){return x2>0.5+0.22*Math.sin(2*Math.PI*x1)?1:0}
function waveData(n,seed,flip){const r=rng(seed);const a=[];for(let i=0;i<n;i++){const x=[r(),r()];let c=waveLabel(x[0],x[1]);if(r()<flip)c=1-c;a.push([x[0],x[1],c])}return a}
function buildTree(pts,maxDepth,featFn,r){
  function rec(P,depth){const n=P.length,n1=P.filter(p=>p[2]).length;const node={n:n,maj:n1*2>=n?1:0,p1:n1/n};
    if(depth>=maxDepth||n1===0||n1===n||n<2)return node;const g0=1-(n1/n)**2-(1-n1/n)**2;let best=null;
    const feats=featFn?featFn(r):[0,1];
    for(const j of feats){const s=P.slice().sort((a,b)=>a[j]-b[j]);let l1=0;for(let i=1;i<n;i++){l1+=s[i-1][2];if(s[i][j]===s[i-1][j])continue;const nl=i,nr=n-i,r1=n1-l1;
      const gl=1-(l1/nl)**2-(1-l1/nl)**2,gr=1-(r1/nr)**2-(1-r1/nr)**2;const w=(nl*gl+nr*gr)/n;if(!best||w<best.w)best={w:w,j:j,t:(s[i][j]+s[i-1][j])/2}}}
    if(!best||g0-best.w<=1e-12)return node;node.j=best.j;node.t=best.t;node.L=rec(P.filter(p=>p[best.j]<=best.t),depth+1);node.R=rec(P.filter(p=>p[best.j]>best.t),depth+1);return node}
  return rec(pts,0)}
function treeProb(root,x,d){let nd=root,k=0;d=d===undefined?1e9:d;while(nd.L&&k<d){nd=x[nd.j]<=nd.t?nd.L:nd.R;k++}return nd.p1}
function treeBoxes(root,d,cb){(function rec(nd,k,b){if(!nd.L||k>=d){cb(nd,b);return}
  if(nd.j===0){rec(nd.L,k+1,[b[0],nd.t,b[2],b[3]]);rec(nd.R,k+1,[nd.t,b[1],b[2],b[3]])}else{rec(nd.L,k+1,[b[0],b[1],b[2],nd.t]);rec(nd.R,k+1,[b[0],b[1],nd.t,b[3]])}})(root,0,[0,1,0,1])}
function halfPlane(P,a,b,c,cls){/* region a*x+b*y+c>=0 */const n=Math.hypot(a,b);const u=[a/n,b/n],d=[-u[1],u[0]];const p0=[-c*u[0]/n,-c*u[1]/n];const E1=60;
  return P.poly([[p0[0]-E1*d[0],p0[1]-E1*d[1]],[p0[0]+E1*d[0],p0[1]+E1*d[1]],[p0[0]+E1*d[0]+E1*u[0],p0[1]+E1*d[1]+E1*u[1]],[p0[0]-E1*d[0]+E1*u[0],p0[1]-E1*d[1]+E1*u[1]]],cls)}
function fitLogit(X,y,lam,iters){/* Newton, X rows with leading 1 */const n=X[0].length;let w=new Array(n).fill(0);lam=lam||1e-4;
  for(let it=0;it<(iters||40);it++){const g=new Array(n).fill(0),H=[];for(let i=0;i<n;i++)H.push(new Array(n).fill(0));
    X.forEach((x,i)=>{const z=x.reduce((s,v,k)=>s+v*w[k],0);const p=1/(1+Math.exp(-z));for(let a=0;a<n;a++){g[a]+=(p-y[i])*x[a];for(let b=0;b<n;b++)H[a][b]+=p*(1-p)*x[a]*x[b]}});
    for(let a=0;a<n;a++){g[a]+=lam*w[a];H[a][a]+=lam}const st=solve(H,g);w=w.map((v,k)=>v-st[k])}return w}
const sig=z=>1/(1+Math.exp(-z));
FIG['ovr']=root=>{const svg=initSvg(svgOf(root),700,330);const pm=root.hasAttribute('data-pm');/* data-pm: SVM-style labels +1 / −1 */const r=rng(4);const C=[[[0.25,0.75],'fgr','Class 1'],[[0.3,0.25],'fb','Class 2'],[[0.75,0.6],'fo','Class 3']];const pts=[];
  C.forEach((c,k)=>{for(let i=0;i<7;i++)pts.push([c[0][0]+0.07*randn(r),c[0][1]+0.07*randn(r),k])});
  const P=Plot(svg,{at:[0,40],w:260,h:260,x:[0,1],y:[0,1],m:{l:14,r:10,t:10,b:14}});P.axes({grid:false});pts.forEach(p=>P.dot(p[0],p[1],6,'pt '+C[p[2]][1]));T(P.root,130,-14,'K = 3 classes','lab');
  const lines=[[1,-1,0.1],[1,1,-0.95],[-1,0.3,0.45]];
  C.forEach((c,k)=>{const Q=Plot(svg,{at:[300+Math.floor(k/1)*0,k*110],w:190,h:110,x:[0,1],y:[0,1],m:{l:10,r:6,t:6,b:6}});Q.axes({grid:false});
    pts.forEach(p=>{const d=Q.dot(p[0],p[1],4.5,p[2]===k?'pt '+c[1]:'nof');if(p[2]!==k)d.setAttribute('style','stroke:#8c8c8c;stroke-width:1.2')});
    T(Q.root,200,50,c[2]+' vs the rest','lab','start');T(Q.root,200,72,pm?'+1 for '+c[2].toLowerCase()+', −1 for the rest':'label 1 for '+c[2].toLowerCase()+', 0 for the rest','','start')});
  arrowPx(svg,262,170,298,70,'ln thin sm','fm');arrowPx(svg,262,170,298,170,'ln thin sm','fm');arrowPx(svg,262,170,298,280,'ln thin sm','fm')};
FIG['cv-lambda']=root=>{const r=rng(7);const tr=[],va=[];for(let i=0;i<20;i++){const x=(i+0.2+0.6*r())/20;tr.push([x,Math.sin(2*Math.PI*x)+0.3*randn(r)])}for(let i=0;i<300;i++){const x=r();va.push([x,Math.sin(2*Math.PI*x)+0.3*randn(r)])}
  const d=15;const basis=x=>{const t=2*x-1;const b=[1,t];for(let k=1;k<d;k++)b.push(((2*k+1)*t*b[k]-k*b[k-1])/(k+1));return b};
  const pts=[];for(let le=-8;le<=1.01;le+=0.25){const lam=Math.pow(10,le);const A=[],bb=[];for(let i=0;i<=d;i++){A.push(new Array(d+1).fill(0));bb.push(0)}tr.forEach(([x,y])=>{const f=basis(x);for(let i=0;i<=d;i++){bb[i]+=f[i]*y;for(let j=0;j<=d;j++)A[i][j]+=f[i]*f[j]}});
    for(let i=1;i<=d;i++)A[i][i]+=lam;A[0][0]+=1e-9;const c=solve(A,bb);const pr=x=>basis(x).reduce((s,v,i)=>s+v*c[i],0);const rm=D=>Math.sqrt(D.reduce((s,p)=>s+(pr(p[0])-p[1])**2,0)/D.length);pts.push([lam,rm(tr),rm(va)])}
  const P=Plot(svgOf(root),{w:520,h:320,x:[1e-8,10],y:[0,1],logx:true,m:{l:44,r:14,t:14,b:40}});P.axes({xt:[1e-8,1e-6,1e-4,1e-2,1],fx:v=>'1e'+Math.round(Math.log10(v)),yt:[0,0.25,0.5,0.75,1],xl:'λ (log scale), degree-15 polynomial',yl:'RMSE'});
  P.path(pts.map(p=>[p[0],p[1]]),'ln sb');P.path(pts.map(p=>[p[0],Math.min(p[2],1.2)]),'ln so');let b=pts[0];pts.forEach(p=>{if(p[2]<b[2])b=p});P.line(b[0],0,b[0],1,'ln thin sg dash');P.text(b[0],0.8,'best λ on validation','', 'end',-6,0);
  P.text(2e-8,0.9,'overfitting','', 'start');P.text(6,0.9,'underfitting','', 'end')};
window.MLFIG={FIG:FIG,lib:{E,T,initSvg,Plot,arrowPx,arrow,rng,randn,solve,fmt,equalY,q,setV,setR,svgOf,sig,waveLabel,waveData,buildTree,treeProb,treeBoxes,halfPlane,fitLogit},init:function(){document.querySelectorAll('[data-fig]').forEach(el=>{const f=FIG[el.dataset.fig];if(!f){console.warn('unknown figure',el.dataset.fig);return}try{f(el)}catch(err){console.error('figure '+el.dataset.fig+' failed',err)}})}};
})();
