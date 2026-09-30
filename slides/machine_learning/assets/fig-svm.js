/* Figures for 08_svm.html. Class +1 = blue circles, class −1 = red squares. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,arrow,rng,randn,fmt,equalY,q,setV,setR,svgOf}=lib;
function maxGap(pts,phi){const u=[Math.cos(phi),Math.sin(phi)];let pmin=Infinity,nmax=-Infinity,ip=-1,iq=-1;
  pts.forEach((p,i)=>{const s=u[0]*p[0]+u[1]*p[1];if(p[2]>0){if(s<pmin){pmin=s;ip=i}}else{if(s>nmax){nmax=s;iq=i}}});return {g:pmin-nmax,pmin,nmax,ip,iq,u}}
function svmData(){const r=rng(21);const pts=[];let a=0,b=0;while(a<12){const p=[2.4+0.62*randn(r),2.1+0.62*randn(r),1];if(p[0]+p[1]>3.0){pts.push(p);a++}}while(b<12){const p=[-0.9+0.62*randn(r),-0.5+0.62*randn(r),-1];if(p[0]+p[1]<0.3){pts.push(p);b++}}return pts}
function lineAt(P,u,s,cls){const d=[-u[1],u[0]],p=[s*u[0],s*u[1]];return P.line(p[0]-30*d[0],p[1]-30*d[1],p[0]+30*d[0],p[1]+30*d[1],cls)}
function bandAt(P,u,s1,s2,cls){const d=[-u[1],u[0]],e=30;const a=[s1*u[0],s1*u[1]],b=[s2*u[0],s2*u[1]];P.poly([[a[0]-e*d[0],a[1]-e*d[1]],[a[0]+e*d[0],a[1]+e*d[1]],[b[0]+e*d[0],b[1]+e*d[1]],[b[0]-e*d[0],b[1]-e*d[1]]],cls)}
const dotC=(P,p,r)=>p[2]>0?P.dot(p[0],p[1],r||6,'pt fb'):P.rect(p[0]-0.09,p[1]-0.09,p[0]+0.09,p[1]+0.09,'fr');
/* text with a white halo, readable on top of lines; optional rotation (degrees) */
function label(P,x,y,s,o){o=o||{};const e=P.text(x,y,s,o.cls||'',o.anchor||'middle',o.dx||0,o.dy||0);e.setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round');
  if(o.rot)e.setAttribute('transform','rotate('+o.rot+' '+P.X(x)+' '+P.Y(y)+')');return e}

FIG['manylines']=root=>{const pts=svmData();const svg=initSvg(svgOf(root),900,380);const m={l:14,r:14,t:30,b:14};const xr=[-3.2,4.8];
  let best=null;for(let a=0;a<3600;a++){const g=maxGap(pts,a*Math.PI/1800);if(!best||g.g>best.g)best=Object.assign({phi:a*Math.PI/1800},g)}
  [0,1].forEach(k=>{const P=Plot(svg,{at:[k*455,0],w:440,h:380,x:xr,y:equalY(440,380,m,xr,0.8),m:m});P.axes({grid:false});T(P.root,220,18,k?'The optimal hyperplane: maximum margin':'Many lines separate the data','lab');
    if(!k)[-0.5,-0.2,0.25,0.5].forEach((dp,j)=>{const g=maxGap(pts,best.phi+dp);if(g.g>0)lineAt(P,g.u,g.nmax+[0.15,0.8,0.3,0.6][j]*g.g,'ln thin sg')});
    else{bandAt(P,best.u,best.nmax,best.pmin,'fgs');lineAt(P,best.u,best.nmax,'ln thin sg dash');lineAt(P,best.u,best.pmin,'ln thin sg dash');lineAt(P,best.u,(best.pmin+best.nmax)/2,'ln sg');
      [best.ip,best.iq].forEach(i=>E('circle',{cx:P.X(pts[i][0]),cy:P.Y(pts[i][1]),r:11,class:'ln thin sk'},P.dyn))}
    pts.forEach(p=>dotC(P,p))})};

FIG['hyper23']=root=>{const svg=initSvg(svgOf(root),900,330);const r=rng(6);
  const P=Plot(svg,{at:[0,0],w:420,h:330,x:[0,7],y:[0,7],m:{l:30,r:10,t:30,b:30}});P.axes({xt:[0,2,4,6],yt:[0,2,4,6]});T(P.root,210,18,'A hyperplane in ℝ² is a line','lab');
  P.line(0.8,6.2,6.2,0.4,'ln sg');for(let i=0;i<14;i++){const x=4.2+2.4*r(),y=4+2.6*r();P.dot(x,y,5,'pt fb')}for(let i=0;i<14;i++){const x=0.4+2.4*r(),y=0.3+2.2*r();P.rect(x-0.1,y-0.1,x+0.1,y+0.1,'fr')}
  const g=E('g',{transform:'translate(470,0)'},svg);T(g,210,18,'A hyperplane in ℝ³ is a plane','lab');
  const pr=(x,y,z)=>[60+30*x+14*y,300-28*z-11*y],pl=(x,y)=>2.8+0.12*x+0.08*y;
  [[[8.5,0,0],'x₁',12,5],[[0,8.5,0],'x₂',10,0],[[0,0,8.5],'x₃',0,-8]].forEach(([b,lab,dx,dy])=>{const p=pr(0,0,0),e=pr(...b);E('line',{x1:p[0],y1:p[1],x2:e[0],y2:e[1],class:'ax'},g);T(g,e[0]+dx,e[1]+dy,lab,'','middle')});
  const below=[],above=[];for(let i=0;i<14;i++){const x=1.2+4*r(),y=0.3+1.7*r();below.push([x,y,0.3+1.2*r()])}for(let i=0;i<14;i++){const x=3+4.5*r(),y=3.5+4*r();above.push([x,y,pl(x,y)+1.2+1.5*r()])}
  below.forEach(p=>{const s=pr(...p);E('rect',{x:s[0]-4,y:s[1]-4,width:8,height:8,fill:'#c00000'},g)});
  E('polygon',{points:[[0,0],[8,0],[8,8],[0,8]].map(c=>pr(c[0],c[1],pl(c[0],c[1])).join(',')).join(' '),fill:'#70ad47','fill-opacity':0.4,stroke:'#548235'},g);
  above.forEach(p=>{const s=pr(...p);E('circle',{cx:s[0],cy:s[1],r:5,fill:'#4472c4',stroke:'#fff'},g)});
  T(g,300,325,'squares below the plane, circles above','','middle')};

FIG['hyper']=root=>{const m={l:36,r:14,t:14,b:34};const xr=[-1,5];const P=Plot(svgOf(root),{w:520,h:440,x:xr,y:equalY(520,440,m,xr,2),m:m});P.axes({xt:[-1,0,1,2,3,4,5],yt:[0,1,2,3,4],xl:'x₁',yl:'x₂'});
  P.poly([[-1,4],[4,-1],[9,-1],[9,9],[-1,9]],'fbs');P.poly([[-3,-3],[6,-3],[-3,6]],'fos');
  [-2,-1,1,2].forEach(c=>{const k=3+c;P.line(k+1,-1,-1,k+1,'gr')});P.line(4,-1,-1,4,'ln sk');label(P,-0.9,4.02,'x₁ + x₂ − 3 = 0',{cls:'lab',anchor:'start'});
  arrow(P,1.5,1.5,2.4,2.4,'ln sb','fb');P.text(2.4,2.4,'w = (1, 1)','lab','start',8,6);P.dot(1.5,1.5,5,'fw pt').setAttribute('style','stroke:#000');
  P.dot(3,3,7,'fb pt');P.text(3,3,'x⁽¹⁾ = (3, 3): f = +3 → ŷ = +1','','end',-11,-10);
  P.rect(-0.12,-0.12,0.12,0.12,'fr');P.text(0,0,'x⁽²⁾ = (0, 0): f = −3 → ŷ = −1','','start',12,18);
  P.text(4.9,4.2,'f > 0: ŷ = +1','lab','end');P.text(-0.9,0.9,'f < 0: ŷ = −1','lab','start')};

FIG['dotprod']=root=>{const m={l:30,r:14,t:14,b:30};const xr=[-0.5,4];const P=Plot(svgOf(root),{w:480,h:380,x:xr,y:equalY(480,380,m,xr,1.4),m:m});P.axes({xt:[0,1,2,3,4],yt:[0,1,2,3],grid:true});
  const w=[2,1],x=[0.6,2.6];const nw=Math.hypot(...w);const u=[w[0]/nw,w[1]/nw];const s=x[0]*u[0]+x[1]*u[1];const f=[s*u[0],s*u[1]];
  P.line(-0.5*u[0],-0.5*u[1],4.3*u[0],4.3*u[1],'ln thin sm dot2');
  P.line(0,0,f[0],f[1],'ln so').setAttribute('style','stroke-width:9;stroke-opacity:.75');
  arrow(P,0,0,w[0],w[1],'ln sb','fb');arrow(P,0,0,x[0],x[1],'ln sk','fk');P.line(x[0],x[1],f[0],f[1],'ln thin sk dash');
  const v=[x[0]-f[0],x[1]-f[1]],nv=Math.hypot(...v),a=0.14,vv=[v[0]/nv*a,v[1]/nv*a],uu=[-u[0]*a,-u[1]*a];
  P.path([[f[0]+vv[0],f[1]+vv[1]],[f[0]+vv[0]+uu[0],f[1]+vv[1]+uu[1]],[f[0]+uu[0],f[1]+uu[1]]],'ln thin sk');
  const a0=Math.atan2(w[1],w[0]),a1=Math.atan2(x[1],x[0]),arc=[];for(let i=0;i<=30;i++){const t=a0+(a1-a0)*i/30;arc.push([0.45*Math.cos(t),0.45*Math.sin(t)])}P.path(arc,'ln thin sk');
  const am=(a0+a1)/2;P.text(0.64*Math.cos(am),0.64*Math.sin(am),'α','lab','middle',0,5);
  P.text(x[0],x[1],'x = (0.6, 2.6)','lab','start',8,0);P.text(w[0],w[1],'w = (2, 1)','lab','start',8,5);
  P.text(f[0]*0.55,f[1]*0.55,'shadow = ‖x‖ cos α = '+fmt(s,2),'','start',14,24)};

FIG['margin']=root=>{const m={l:36,r:14,t:14,b:34};const xr=[-0.3,5];const P=Plot(svgOf(root),{w:500,h:420,x:xr,y:equalY(500,420,m,xr,2),m:m});P.axes({xt:[0,1,2,3,4,5],yt:[0,1,2,3,4],xl:'x₁',yl:'x₂',grid:false});
  P.poly([[-1,3],[3,-1],[5,-1],[-1,5]],'fgs');P.line(-1,3,3,-1,'ln thin sg dash');P.line(-1,5,5,-1,'ln thin sg dash');P.line(-1,4,4,-1,'ln sk');
  const pos=[[3,1],[1.2,2.8],[3.5,2],[4.2,1.4],[2.6,3.1],[4.3,2.8],[3.8,3.4]],neg=[[1,1],[0.4,1.6],[0.3,0.4],[1.2,0.2],[0.2,1.0],[0.9,0.5]];
  pos.forEach(p=>P.dot(p[0],p[1],6,'pt fb'));neg.forEach(p=>P.rect(p[0]-0.09,p[1]-0.09,p[0]+0.09,p[1]+0.09,'fr'));
  [[3,1],[1.2,2.8],[1,1],[0.4,1.6]].forEach(p=>E('circle',{cx:P.X(p[0]),cy:P.Y(p[1]),r:11,class:'ln thin sk'},P.dyn));
  arrow(P,0.7,1.3,1.7,2.3,'ln thin sk','fk');arrow(P,1.7,2.3,0.7,1.3,'ln thin sk','fk');label(P,1.66,1.34,'2/‖w‖',{cls:'lab',dy:5});
  [[1.65,'w·x + b = −1'],[2.65,'w·x + b = 0'],[3.75,'w·x + b = +1']].forEach(([x1,t],k)=>label(P,x1,[2,3,4][k]-x1,t,{rot:45,dy:-5}));
  P.text(4.9,4.0,'support vectors (circled)','','end')};

FIG['angle']=root=>{const pts=svmData();const m={l:14,r:14,t:14,b:14};const xr=[-3.6,5.2];const svg=initSvg(svgOf(root),900,420);
  const P=Plot(svg,{at:[0,0],w:470,h:420,x:xr,y:equalY(470,420,m,xr,0.8),m:m});
  const Gs=[];let best=null;for(let a=0;a<360;a++){const g=maxGap(pts,a*Math.PI/180);Gs.push([a,g.g]);if(!best||g.g>best.g)best={a:a,g:g.g}}const gmin=Math.min(...Gs.map(g=>g[1]));
  const Q=Plot(svg,{at:[490,60],w:410,h:260,x:[0,359],y:[gmin,best.g*1.2],m:{l:44,r:10,t:10,b:36}});Q.axes({xt:[0,90,180,270,359],yt:[Math.ceil(gmin),0,Math.floor(best.g)],fx:v=>v+'°',xl:'direction of w',yl:'gap between classes'});
  Q.line(0,0,359,0,'ax',Q.bg);Q.path(Gs,'ln sb',Q.bg);Q.line(best.a,gmin,best.a,best.g*1.2,'ln thin sg dash',Q.bg);Q.text(best.a,best.g*1.1,'widest: '+best.a+'°','','start',6,0,Q.bg);
  const c0=[0.75,0.8];const inp=q(root,'p');
  function draw(){const a=+inp.value;setV(root,'p',a+'°');const g=maxGap(pts,a*Math.PI/180);const u=g.u;P.clear();
    if(g.g>0){bandAt(P,u,g.nmax,g.pmin,'fgs');lineAt(P,u,g.nmax,'ln thin sg dash');lineAt(P,u,g.pmin,'ln thin sg dash');lineAt(P,u,(g.nmax+g.pmin)/2,'ln sg')}else{bandAt(P,u,g.pmin,g.nmax,'fos');P.text(xr[0]+0.3,-2.3,'the classes overlap in this direction','','start')}
    P.line(c0[0]-9*u[0],c0[1]-9*u[1],c0[0]+9*u[0],c0[1]+9*u[1],'ln thin sm');pts.forEach(p=>{const s=(p[0]-c0[0])*u[0]+(p[1]-c0[1])*u[1];P.dot(c0[0]+s*u[0],c0[1]+s*u[1],3,p[2]>0?'fb':'fr')});
    arrow(P,c0[0],c0[1],c0[0]+1.3*u[0],c0[1]+1.3*u[1],'ln sk','fk');pts.forEach(p=>dotC(P,p));[g.ip,g.iq].forEach(i=>E('circle',{cx:P.X(pts[i][0]),cy:P.Y(pts[i][1]),r:11,class:'ln thin sk'},P.dyn));
    Q.clear();Q.dot(a,g.g,6,'fr pt');setR(root,'w',g.g>0?fmt(g.g,2):'no margin')}inp.addEventListener('input',draw);draw()};

/* Lagrange multipliers in 1-D: an active and an inactive constraint */
FIG['lag1d']=root=>{const svg=initSvg(svgOf(root),520,430);
  [[1,'minimize ½w²  subject to  w ≥ 1'],[-1,'minimize ½w²  subject to  w ≥ −1']].forEach(([c,title],k)=>{
    const P=Plot(svg,{at:[0,k*218],w:520,h:212,x:[-2.2,2.2],y:[-0.2,2.5],m:{l:36,r:14,t:28,b:36}});P.axes({xt:[-2,-1,0,1,2],yt:[0,1,2],xl:k?'w':''});T(P.root,275,18,title,'lab');
    P.rect(-2.2,-0.2,c,2.5,'fos',P.bg);P.fn(w=>0.5*w*w,'ln sb',-2.2,2.2,200);P.line(c,-0.2,c,2.5,'ln thin sk dash');
    P.text(-2.1,2.2,'not allowed','','start');P.text(2.15,2.2,'allowed','','end');const o=Math.max(c,0);
    if(c>0){P.dot(0,0,5,'fw pt').setAttribute('style','stroke:#000;stroke-width:1.2');P.text(0,0,'free minimum','','middle',0,-12)}
    P.dot(o,0.5*o*o,7,'fr pt');P.text(o,0.5*o*o,c>0?'w* = 1 (active)':'w* = 0 (inactive)','lab','start',10,c>0?-4:-8)})};

/* The two-point dual worked by hand */
FIG['svm2pts']=root=>{const m={l:40,r:14,t:14,b:36};const xr=[-2.6,2.6];const P=Plot(svgOf(root),{w:460,h:440,x:xr,y:equalY(460,440,m,xr,0),m:m});P.axes({xt:[-2,-1,0,1,2],yt:[-2,-1,0,1,2],xl:'x₁',yl:'x₂'});
  P.poly([[-5,3],[3,-5],[5,-3],[-3,5]],'fgs');P.line(-5,3,3,-5,'ln thin sg dash');P.line(-3,5,5,-3,'ln thin sg dash');P.line(-5,5,5,-5,'ln sk');
  arrow(P,-1.3,-0.7,0.7,1.3,'ln thin sk','fk');arrow(P,0.7,1.3,-1.3,-0.7,'ln thin sk','fk');label(P,-0.72,0.72,'2/‖w‖ = 2.83',{cls:'lab',rot:45,dy:-6});
  P.dot(1,1,7,'pt fb');P.rect(-1.11,-1.11,-0.89,-0.89,'fr');[[1,1],[-1,-1]].forEach(p=>E('circle',{cx:P.X(p[0]),cy:P.Y(p[1]),r:12,class:'ln thin sk'},P.dyn));
  arrow(P,0,0,0.5,0.5,'ln sb','fb');label(P,0.55,0.4,'w = (½, ½)',{cls:'lab',anchor:'start',dx:6,dy:10});
  label(P,1,1,'x₁ (y = +1)',{cls:'lab',anchor:'start',dx:14,dy:-8});label(P,-1,-1,'x₂ (y = −1)',{cls:'lab',anchor:'start',dx:14,dy:20});
  [[2.35,'f = +1',2],[1.35,'f = 0',0],[0.35,'f = −1',-2]].forEach(([x1,t,c])=>label(P,x1,c-x1,t,{rot:45,dy:-5}))};

FIG['lift1d']=root=>{const P=Plot(svgOf(root),{w:480,h:360,x:[-3,3],y:[-1,9.5],m:{l:36,r:14,t:14,b:34}});P.axes({xt:[-3,-2,-1,0,1,2,3],yt:[0,3,6,9],xl:'x',yl:'x²'});P.line(-3,0,3,0,'ax');
  [-2.7,-2.2,-1.8,1.9,2.3,2.8,-1.0,-0.5,-0.1,0.4,0.8,1.2].forEach(x=>{const c=Math.abs(x)<1.4;P.line(x,0,x,x*x,'gr');const cl=c?'fb':'fr';P.dot(x,0,5,'pt '+cl);P.dot(x,x*x,6,'pt '+cl)});
  P.fn(x=>x*x,'ln thin sm dash');P.line(-3,2.4,3,2.4,'ln sg');const q2=Math.sqrt(2.4);P.line(-q2,-0.8,-q2,0.6,'ln sg');P.line(q2,-0.8,q2,0.6,'ln sg');
  P.text(0,2.4,'one flat line up here…','','middle',0,-10);P.text(q2,-0.8,'…is two thresholds down here','','start',6,-2)};

FIG['circles']=root=>{const r=rng(13);const pts=[];for(let i=0;i<50;i++){const a=2*Math.PI*r(),rad=0.85+0.15*r();pts.push([rad*Math.cos(a),rad*Math.sin(a),-1])}for(let i=0;i<50;i++){pts.push([0.18*randn(r),0.18*randn(r),1])}
  const svg=initSvg(svgOf(root),900,360);const A=Plot(svg,{at:[0,0],w:350,h:360,x:[-1.2,1.2],y:[-1.2,1.2],m:{l:44,r:10,t:30,b:34}});A.axes({xt:[-1,0,1],yt:[-1,0,1],xl:'x₁',yl:'x₂'});T(A.root,197,18,'No line separates them in ℝ²','lab');
  A.line(-1.2,-0.9,0.9,1.2,'ln thin sm dash');A.line(-1.2,-0.35,1.2,0.6,'ln thin sm dash');
  const rc=Math.sqrt(-Math.log(0.72)),cp=[];for(let i=0;i<=120;i++){const t=2*Math.PI*i/120;cp.push([rc*Math.cos(t),rc*Math.sin(t)])}A.path(cp,'ln sg');
  pts.forEach(p=>p[2]>0?A.dot(p[0],p[1],3.6,'fb'):A.rect(p[0]-0.022,p[1]-0.022,p[0]+0.022,p[1]+0.022,'fr'));
  const B=Plot(svg,{at:[380,0],w:520,h:360,x:[-1.2,1.2],y:[-0.05,1.1],m:{l:60,r:10,t:30,b:34}});B.axes({xt:[-1,0,1],yt:[0,0.5,1],xl:'x₁',yl:'x₃ = exp(−x₁² − x₂²)'});T(B.root,290,18,'Add x₃: now a flat plane separates them','lab');
  pts.forEach(p=>{const z=Math.exp(-(p[0]*p[0]+p[1]*p[1]));p[2]>0?B.dot(p[0],z,3.6,'fb'):B.rect(p[0]-0.022,z-0.011,p[0]+0.022,z+0.011,'fr')});B.line(-1.2,0.72,1.2,0.72,'ln sg');B.text(1.15,0.72,'x₃ = 0.72','','end',0,-6)};

FIG['rbf']=root=>{const sv=[[-3.4,-1],[-2.6,-1],[2.5,-1],[3.3,-1],[-1.0,1],[-0.3,1],[0.5,1],[1.2,1]];const P=Plot(svgOf(root),{w:600,h:340,x:[-4.5,4.5],y:[-1.9,2.3],m:{l:40,r:14,t:14,b:36}});
  P.axes({xt:[-4,-2,0,2,4],yt:[-1,0,1,2],xl:'x',yl:'f(x)'});const inp=q(root,'g');
  function draw(){const g=Math.pow(10,+inp.value);setV(root,'g',g<10?fmt(g,2):fmt(g,1));P.clear();const f=x=>sv.reduce((s,z)=>s+z[1]*Math.exp(-g*((x-z[0])**2)),0);
    const pp=[[-4.5,0]],pn=[[-4.5,0]];for(let i=0;i<=400;i++){const x=-4.5+9*i/400,v=f(x);pp.push([x,Math.max(v,0)]);pn.push([x,Math.min(v,0)])}pp.push([4.5,0]);pn.push([4.5,0]);
    P.poly(pp,'fbs');P.poly(pn,'fos');P.line(-4.5,0,4.5,0,'ax');sv.forEach(z=>P.fn(x=>z[1]*Math.exp(-g*((x-z[0])**2)),'ln thin '+(z[1]>0?'sb':'sr'),-4.5,4.5,300));P.fn(f,'ln sk',-4.5,4.5,400);
    sv.forEach(z=>z[1]>0?P.dot(z[0],0,6,'pt fb'):P.rect(z[0]-0.1,-0.09,z[0]+0.1,0.09,'fr'));P.text(-4.3,2.05,'shaded blue: f > 0, predict +1','','start')}inp.addEventListener('input',draw);draw()};

/* Soft-margin linear SVM trained by dual coordinate descent (bias as a constant feature) */
FIG['softc']=root=>{const r=rng(5);const X=[],y=[];for(let i=0;i<25;i++){X.push([1.0+randn(r),0.9+randn(r),1]);y.push(1)}for(let i=0;i<25;i++){X.push([-1.0+randn(r),-0.8+randn(r),1]);y.push(-1)}
  function train(C){const n=X.length;const al=new Array(n).fill(0);const w=[0,0,0];const Qd=X.map(x=>x[0]*x[0]+x[1]*x[1]+x[2]*x[2]);
    for(let ep=0;ep<400;ep++){let mx=0;for(let i=0;i<n;i++){const G=y[i]*(w[0]*X[i][0]+w[1]*X[i][1]+w[2]*X[i][2])-1;const na=Math.min(Math.max(al[i]-G/Qd[i],0),C);const d=na-al[i];if(d!==0){for(let k=0;k<3;k++)w[k]+=d*y[i]*X[i][k];al[i]=na;mx=Math.max(mx,Math.abs(d))}}if(mx<1e-7)break}return {w:w,al:al}}
  const m={l:14,r:14,t:14,b:14};const xr=[-4,4.2];const P=Plot(svgOf(root),{w:540,h:420,x:xr,y:equalY(540,420,m,xr,0),m:m});const inp=q(root,'c');
  function draw(){const C=Math.pow(10,+inp.value);setV(root,'c',C<10?fmt(C,2):fmt(C,0));const res=train(C);const w=res.w;P.clear();const nw=Math.hypot(w[0],w[1]);const u=[w[0]/nw,w[1]/nw];
    bandAt(P,u,(-1-w[2])/nw,(1-w[2])/nw,'fgs');lineAt(P,u,(1-w[2])/nw,'ln thin sg dash');lineAt(P,u,(-1-w[2])/nw,'ln thin sg dash');lineAt(P,u,-w[2]/nw,'ln sg');
    let nsv=0,err=0,inside=0;X.forEach((x,i)=>{dotC(P,[x[0],x[1],y[i]],5.5);const mu=y[i]*(w[0]*x[0]+w[1]*x[1]+w[2]);if(res.al[i]>1e-6){nsv++;E('circle',{cx:P.X(x[0]),cy:P.Y(x[1]),r:10,class:'ln thin sk'},P.dyn)}if(mu<0)err++;else if(mu<1)inside++});
    setR(root,'w',fmt(2/nw,2));setR(root,'s',nsv);setR(root,'e',err);setR(root,'i',inside)}inp.addEventListener('input',draw);draw()};

FIG['hinge']=root=>{const P=Plot(svgOf(root),{w:520,h:330,x:[-2.5,3],y:[-0.1,4],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[-2,-1,0,1,2,3],yt:[0,1,2,3,4],xl:'margin μ = y·f(x)',yl:'loss'});
  P.path([[-2.5,1],[0,1],[0,0],[3,0]],'ln sm');P.fn(u=>Math.max(0,1-u),'ln sb');P.fn(u=>Math.log2(1+Math.exp(-u)),'ln so');P.line(1,-0.1,1,4,'ln thin sm dot2');P.text(1,3.7,'μ = 1','','start',5,0)};
})();
