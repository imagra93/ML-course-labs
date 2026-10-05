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
function label(P,x,y,s,o){o=o||{};const e=P.text(x,y,s,o.cls||'',o.anchor||'middle',o.dx||0,o.dy||0,o.g);e.setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round');
  if(o.rot)e.setAttribute('transform','rotate('+o.rot+' '+P.X(x)+' '+P.Y(y)+')');return e}
/* Axes through the origin instead of along the frame, so a line meets them where its equation says
   (x₁ + x₂ = 3 cuts them at (3, 0) and (0, 3)). Grid at the ticks, tick labels beside the axes. */
const minus=v=>String(v).replace('-','−');
function axes0(P,xr,yr,xt,yt){const g=P.bg;
  xt.forEach(v=>P.line(v,yr[0],v,yr[1],'gr',g));yt.forEach(v=>P.line(xr[0],v,xr[1],v,'gr',g));
  P.line(xr[0],0,xr[1],0,'ax',g);P.line(0,yr[0],0,yr[1],'ax',g);
  xt.forEach(v=>{if(v)T(g,P.X(v),P.Y(0)+17,minus(v))});yt.forEach(v=>{if(v)T(g,P.X(0)-6,P.Y(v)+5,minus(v),'','end')});T(g,P.X(0)-6,P.Y(0)+17,'0','','end');
  T(g,P.X(xr[1])-4,P.Y(0)-7,'x₁','lab','end');T(g,P.X(0)+7,P.Y(yr[1])+16,'x₂','lab','start')}
/* the two points where x₁ + x₂ = c meets the axes, as small open dots */
function cuts(P,c,lab,g){[[c,0],[0,c]].forEach(([a,b],k)=>{P.dot(a,b,4.5,'fw pt',g).setAttribute('style','stroke:#000;stroke-width:1.4');
  if(lab)label(P,a,b,'('+minus(a)+', '+minus(b)+')',{cls:'lab',anchor:'start',dx:k?9:8,dy:k?-7:-9,g:g})})}

/* data-later: the right panel is a .step of the slide (deck.js reveals it with →). Lines A–D are named so the class can discuss them. */
FIG['manylines']=root=>{const later=root.hasAttribute('data-later');const pts=svmData();const svg=initSvg(svgOf(root),900,380);const m={l:14,r:14,t:30,b:14};const xr=[-3.2,4.8];
  let best=null;for(let a=0;a<3600;a++){const g=maxGap(pts,a*Math.PI/1800);if(!best||g.g>best.g)best=Object.assign({phi:a*Math.PI/1800},g)}
  [0,1].forEach(k=>{const yr=equalY(440,380,m,xr,0.8);const P=Plot(svg,{at:[k*455,0],w:440,h:380,x:xr,y:yr,m:m});if(k&&later)P.root.setAttribute('class','step');P.axes({grid:false});T(P.root,220,18,k?'The optimal hyperplane: maximum margin':'Many lines separate the data','lab');
    if(!k)[-0.5,-0.2,0.25,0.5].forEach((dp,j)=>{const g=maxGap(pts,best.phi+dp);if(g.g>0){const s0=g.nmax+[0.15,0.8,0.3,0.6][j]*g.g;lineAt(P,g.u,s0,'ln thin sg');
      /* name the line at its upper-left end, away from the points */
      let pos=null;for(let x=xr[0]+0.5;x<xr[1]-0.5;x+=0.1){const y=(s0-g.u[0]*x)/g.u[1];if(y>yr[1]-0.5||y<yr[0]+0.5)continue;if(pts.every(p=>Math.hypot(p[0]-x,p[1]-y)>0.55)){pos=[x,y];break}}
      if(pos)label(P,pos[0],pos[1],'ABCD'[j],{cls:'lab big'})}});
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

FIG['hyper']=root=>{const m={l:14,r:14,t:14,b:14};const xr=[-1,5],yr=equalY(520,440,m,xr,2);const P=Plot(svgOf(root),{w:520,h:440,x:xr,y:yr,m:m});
  P.poly([[-1,4],[4,-1],[9,-1],[9,9],[-1,9]],'fbs',P.bgc);P.poly([[-3,-3],[6,-3],[-3,6]],'fos',P.bgc);axes0(P,xr,yr,[-1,1,2,3,4,5],[1,2,3,4]);
  [-2,-1,1,2].forEach(c=>{const k=3+c;P.line(k+1,-1,-1,k+1,'gr')});P.line(4,-1,-1,4,'ln sk');label(P,2.2,0.8,'x₁ + x₂ − 3 = 0',{cls:'lab',rot:45,dy:-7});cuts(P,3,true);
  arrow(P,1.5,1.5,2.4,2.4,'ln sb','fb');P.text(2.4,2.4,'w = (1, 1)','lab','start',8,6);P.dot(1.5,1.5,5,'fw pt').setAttribute('style','stroke:#000');
  P.dot(3,3,7,'fb pt');P.text(3,3,'x⁽¹⁾ = (3, 3): f = +3 → ŷ = +1','','end',-11,-10);
  P.rect(-0.12,-0.12,0.12,0.12,'fr');P.text(0,0,'x⁽²⁾ = (0, 0)','','start',12,-26);P.text(0,0,'f = −3 → ŷ = −1','','start',12,-10);
  P.text(4.9,4.2,'f > 0: ŷ = +1','lab','end');P.text(0.15,1.3,'f < 0: ŷ = −1','lab','start')};

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

/* data-hide: only the points at first; the band, the lines and the circled support vectors are one .step (the answer).
   data-yf: write y·f(x) next to every point (= 1 on the margin, > 1 elsewhere) instead of the 2/‖w‖ arrow. */
FIG['margin']=root=>{const hide=root.hasAttribute('data-hide'),yf=root.hasAttribute('data-yf');const m={l:14,r:14,t:14,b:14};const xr=[-0.6,5],yr=equalY(500,420,m,xr,2);const P=Plot(svgOf(root),{w:500,h:420,x:xr,y:yr,m:m});axes0(P,xr,yr,[1,2,3,4,5],[1,2,3,4]);
  const pos=[[3,1],[1.2,2.8],[3.5,2],[4.2,1.4],[2.6,3.1],[4.3,2.8],[3.8,3.4]],neg=[[1,1],[0.4,1.6],[0.3,0.4],[1.2,0.2],[0.2,1.0],[0.9,0.5]];
  const band=g=>{P.poly([[-1,3],[3,-1],[5,-1],[-1,5]],'fgs',g);P.line(-1,3,3,-1,'ln thin sg dash',g);P.line(-1,5,5,-1,'ln thin sg dash',g);P.line(-1,4,4,-1,'ln sk',g);cuts(P,3,false,g)};
  const pts=g=>{pos.forEach(p=>P.dot(p[0],p[1],6,'pt fb',g));neg.forEach(p=>P.rect(p[0]-0.09,p[1]-0.09,p[0]+0.09,p[1]+0.09,'fr',g))};
  /* f = x₁ + x₂ − 3, so y·f is 1 for the four circled points */
  const yfs=g=>{pos.map(p=>[p,1]).concat(neg.map(p=>[p,-1])).forEach(([p,y])=>{const v=Math.round(10*y*(p[0]+p[1]-3))/10,sv=v===1;
    label(P,p[0],p[1],sv?'1':v.toFixed(1),{cls:sv?'lab':'',anchor:'start',dx:sv?14:9,dy:5,g:g})})};
  const notes=g=>{[[3,1],[1.2,2.8],[1,1],[0.4,1.6]].forEach(p=>E('circle',{cx:P.X(p[0]),cy:P.Y(p[1]),r:11,class:'ln thin sk'},g||P.dyn));
    if(yf){yfs(g);P.text(4.9,3.75,'number: y·f(x)','','end',0,0,g)}
    else{arrow(P,0.7,1.3,1.7,2.3,'ln thin sk','fk',g);arrow(P,1.7,2.3,0.7,1.3,'ln thin sk','fk',g);label(P,1.66,1.34,'2/‖w‖',{cls:'lab',dy:5,g:g})}
    [[1.65,'w·x + b = −1'],[2.65,'w·x + b = 0'],[3.75,'w·x + b = +1']].forEach(([x1,t],k)=>label(P,x1,[2,3,4][k]-x1,t,{rot:45,dy:-5,g:g}));
    P.text(4.9,4.0,'support vectors (circled)','','end',0,0,g)};
  if(hide){pts();const G=E('g',{class:'step'},P.dyn);band(G);pts(G);notes(G)}else{band();pts();notes()}};

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

/* The dot product, by angle: w = (2, 1) is fixed, x has the same length and turns from 0° to 180° */
FIG['dotangle']=root=>{const m={l:30,r:14,t:14,b:30};const xr=[-3.9,3.4];const P=Plot(svgOf(root),{w:480,h:400,x:xr,y:equalY(480,400,m,xr,0),m:m});P.axes({xt:[-2,0,2],yt:[-2,0,2]});
  const w=[2,1],nw=Math.hypot(w[0],w[1]),a0=Math.atan2(w[1],w[0]),u=[w[0]/nw,w[1]/nw],d=[-u[1],u[0]],inp=q(root,'a');
  P.poly([[-5*d[0],-5*d[1]],[5*d[0],5*d[1]],[5*d[0]+5*u[0],5*d[1]+5*u[1]],[-5*d[0]+5*u[0],-5*d[1]+5*u[1]]],'fbs',P.bgc);
  P.poly([[-5*d[0],-5*d[1]],[5*d[0],5*d[1]],[5*d[0]-5*u[0],5*d[1]-5*u[1]],[-5*d[0]-5*u[0],-5*d[1]-5*u[1]]],'fos',P.bgc);
  P.line(-5*d[0],-5*d[1],5*d[0],5*d[1],'ln thin sm dash',P.bgc);label(P,1.2,-2.3,'w·x = 0',{cls:'',anchor:'start',dx:6,g:P.bg});
  function draw(){const al=+inp.value,rad=al*Math.PI/180,t=a0+rad,x=[nw*Math.cos(t),nw*Math.sin(t)],dot=w[0]*x[0]+w[1]*x[1];setV(root,'a',al+'°');P.clear();
    arrow(P,0,0,w[0],w[1],'ln sb','fb');arrow(P,0,0,x[0],x[1],'ln sk','fk');
    if(al>0){const arc=[];for(let i=0;i<=30;i++){const tt=a0+rad*i/30;arc.push([0.8*Math.cos(tt),0.8*Math.sin(tt)])}P.path(arc,'ln thin sk');const am=a0+rad/2;if(al>=20)label(P,1.1*Math.cos(am),1.1*Math.sin(am),'α',{cls:'lab',dy:5})}
    label(P,w[0],w[1],'w = (2, 1)',{cls:'lab',anchor:'start',dx:9,dy:-5});
    label(P,x[0],x[1],'x = ('+fmt(x[0],1)+', '+fmt(x[1],1)+')',{cls:'lab',anchor:x[0]>=0?'start':'end',dx:x[0]>=0?9:-9,dy:al<35?22:(x[1]>=0.6?-8:16)});
    setR(root,'d',fmt(dot,2));setR(root,'c',fmt(Math.cos(rad),2));
    setR(root,'v',al===90?'perpendicular: zero':al<90?'same general direction: positive':'opposite general direction: negative')}
  inp.addEventListener('input',draw);draw()};

/* What b does: w = (1, 1) stays fixed and only b moves. Top: the line x₁ + x₂ = −b slides parallel to itself.
   Bottom: the three values f = w·x + b on a number line; they all shift by the same b, and a point changes
   class when its f crosses 0 (the line passes over it). */
FIG['bshift']=root=>{const svg=initSvg(svgOf(root),520,480);const m={l:14,r:14,t:14,b:14};const xr=[-1.2,5.6],yr=equalY(520,340,m,xr,1.9);
  const P=Plot(svg,{at:[0,0],w:520,h:340,x:xr,y:yr,m:m});axes0(P,xr,yr,[-1,1,2,3,4,5],[1,2,3,4]);
  const Q=Plot(svg,{at:[0,352],w:520,h:128,x:[-7,7],y:[0,1],m:{l:14,r:14,t:30,b:34}});
  Q.rect(-7,0.3,0,1,'fos',Q.bg);Q.rect(0,0.3,7,1,'fbs',Q.bg);Q.line(-7,0.3,7,0.3,'ax',Q.bg);
  [-6,-4,-2,2,4,6].forEach(v=>{Q.line(v,0.3,v,0.18,'ax',Q.bg);T(Q.bg,Q.X(v),Q.Y(0.3)+20,minus(v))});
  Q.line(0,0.3,0,1,'ln sk',Q.bg);T(Q.bg,Q.X(0),Q.Y(0.3)+20,'0','lab');T(Q.bg,Q.X(0)+6,Q.Y(1)-8,'f = 0: on the line','lab','start');
  T(Q.bg,Q.X(-6.85),Q.Y(1)+18,'f < 0: ŷ = −1','','start');T(Q.bg,Q.X(6.85),Q.Y(1)+18,'f > 0: ŷ = +1','','end');T(Q.bg,Q.X(-7),Q.Y(1)-8,'f = w·x + b of each point','lab','start');
  const pts=[['A',[0.5,0.5]],['B',[0.5,2]],['C',[3,1.5]]];const inp=q(root,'b');const num=v=>minus(Math.round(10*v)/10);
  /* predicted class as in the rest of the deck: blue circle +1, red square −1, open circle on the line */
  const mark=(Pl,x,y,f,r)=>{const X=Pl.X(x),Y=Pl.Y(y);if(Math.abs(f)<1e-9)E('circle',{cx:X,cy:Y,r:r,class:'fw pt',style:'stroke:#000;stroke-width:1.4'},Pl.dyn);
    else if(f>0)E('circle',{cx:X,cy:Y,r:r,class:'pt fb'},Pl.dyn);else E('rect',{x:X-r,y:Y-r,width:2*r,height:2*r,class:'fr'},Pl.dyn)};
  function draw(){const b=+inp.value,c=-b;setV(root,'b',num(b));P.clear();Q.clear();
    P.poly([[c-40,40],[c+40,-40],[-60,-60]],'fos');P.poly([[c-40,40],[c+40,-40],[60,60]],'fbs');P.line(c-20,20,c+20,-20,'ln sk');
    [[c,0],[0,c]].forEach(([a,d],k)=>{if(a<xr[0]||a>xr[1]||d<yr[0]||d>yr[1])return;P.dot(a,d,4.5,'fw pt').setAttribute('style','stroke:#000;stroke-width:1.4');
      const far=!k&&a>4.4;label(P,a,d,'('+num(a)+', '+num(d)+')',{cls:'',anchor:far?'end':'start',dx:far?-12:k?9:8,dy:far?17:k?-7:-9})});
    arrow(P,0,0,1,1,'ln sb','fb');label(P,1,1,'w = (1, 1), fixed',{cls:'lab',anchor:'start',dx:6,dy:14});
    label(P,5.5,yr[1]-0.3,'the line: x₁ + x₂ '+(b<0?'− '+num(-b):'+ '+num(b))+' = 0',{cls:'lab',anchor:'end'});
    pts.forEach(([n,x],k)=>{const wx=x[0]+x[1],f=wx+b;mark(P,x[0],x[1],f,7);label(P,x[0],x[1],n+': f = '+num(f),{cls:'lab',anchor:'start',dx:11,dy:5});
      mark(Q,f,0.3,f,7);T(Q.dyn,Q.X(f),Q.Y(0.3)-12,n,'lab');
      setR(root,'f'+k,num(f));setR(root,'y'+k,f>0?'+1':f<0?'−1':'on the line')})}
  inp.addEventListener('input',draw);draw()};

/* Distance to a hyperplane as a difference of shadows: w = (1, 1), b = −3, the line x₁ + x₂ = 3 */
FIG['dist']=root=>{const m={l:14,r:14,t:14,b:14};const xr=[-0.6,5.2],yr=equalY(520,420,m,xr,1.7);const P=Plot(svgOf(root),{w:520,h:420,x:xr,y:yr,m:m});axes0(P,xr,yr,[1,2,3,4,5],[1,2,3]);
  const S0=[1.5,1.5],S1=[3,3],X=[4,2],F=[2.5,0.5];
  P.line(-0.4,-0.4,4.6,4.6,'ln thin sm dot2');label(P,3.5,3.5,'axis of w',{cls:'',anchor:'start',dx:8,dy:-2});
  P.line(-0.6,3.6,3.6,-0.6,'ln sk');label(P,5.15,0.5,'black line: the hyperplane f(x) = 0',{cls:'',anchor:'end'});
  arrow(P,0,0,1,1,'ln sb','fb');label(P,0.95,0.95,'w = (1, 1)',{cls:'lab',anchor:'start',dx:8,dy:14});
  P.line(S0[0],S0[1],S1[0],S1[1],'ln so').setAttribute('style','stroke-width:8;stroke-opacity:.7');
  P.line(X[0],X[1],S1[0],S1[1],'ln thin sk dash');P.line(X[0],X[1],F[0],F[1],'ln thin sr dash');
  /* A and B are where the line cuts the axes */
  [[0,3,'A = (0, 3)'],[3,0,'B = (3, 0)']].forEach(([x1,y1,t])=>{P.dot(x1,y1,5,'fk pt');label(P,x1,y1,t,{cls:'lab',anchor:'start',dx:9,dy:-8})});
  P.dot(S0[0],S0[1],5,'fw pt').setAttribute('style','stroke:#000;stroke-width:1.4');P.dot(S1[0],S1[1],5,'fw pt').setAttribute('style','stroke:#000;stroke-width:1.4');
  P.dot(X[0],X[1],7,'fb pt');label(P,X[0],X[1],'x = (4, 2)',{cls:'lab',anchor:'start',dx:10,dy:6});
  label(P,S0[0],S0[1],'shadow of the line: 2.12',{cls:'',anchor:'end',dx:-9,dy:20});label(P,S1[0],S1[1],'shadow of x: 4.24',{cls:'',anchor:'end',dx:-10,dy:-8});
  label(P,2.25,2.25,'2.12',{cls:'lab',anchor:'start',dx:6,dy:-6,});label(P,3.25,1.25,'r = 2.12',{cls:'lab',anchor:'start',dx:4,dy:20})};

/* Lagrange multipliers with an equality constraint: f = ½(w₁² + w₂²), g = w₁ + w₂ − 1 = 0 */
FIG['lageq']=root=>{const m={l:36,r:14,t:14,b:34};const xr=[-0.5,1.8];const P=Plot(svgOf(root),{w:500,h:440,x:xr,y:equalY(500,440,m,xr,0.6),m:m});P.axes({xt:[0,0.5,1,1.5],yt:[0,0.5,1],xl:'w₁',yl:'w₂'});
  const rt=Math.SQRT1_2;[0.35,0.5,rt,0.95,1.2,1.5].forEach(r=>{const pts=[];for(let i=0;i<=120;i++){const t=2*Math.PI*i/120;pts.push([r*Math.cos(t),r*Math.sin(t)])}P.path(pts,r===rt?'ln sb':'ln thin sb',P.bgc).setAttribute('opacity',r===rt?'1':'0.45')});
  label(P,-0.38,0.2,'rings of f',{cls:'',anchor:'start'});
  P.line(-0.5,1.5,1.8,-0.8,'ln sg');label(P,1.0,-0.02,'g = w₁ + w₂ − 1 = 0',{cls:'lab',anchor:'start',rot:-45,dy:-6,dx:6});
  arrow(P,0.5,0.5,1.0,1.0,'ln sb','fb');arrow(P,0.56,0.44,1.56,1.44,'ln so','fo');
  label(P,1.0,1.0,'∇f = (½, ½)',{cls:'lab',anchor:'end',dx:-10,dy:-8});label(P,1.56,1.44,'∇g = (1, 1)',{cls:'lab',anchor:'end',dx:-10,dy:-8});
  P.dot(0.5,0.5,7,'fr pt');label(P,0.5,0.5,'w* = (½, ½)',{cls:'lab',anchor:'end',dx:-12,dy:4})};

/* Generic Lagrange review: f = ½(w₁² + 4w₂²), rings round the free minimum 0, and the curve w₂ = ¼(w₁ − 3)² + ¾.
   They touch only at w* = (2, 1), where ∇f = (2, 4) = 4·∇g with g = w₂ − ¼(w₁ − 3)² − ¾, ∇g = (½, 1). */
const lagP=t=>0.25*(t-3)*(t-3)+0.75,lagF=(a,b)=>0.5*(a*a+4*b*b);
function lagRing(P,c,cls,g){const a=Math.sqrt(2*c),b=Math.sqrt(c/2),pts=[];for(let i=0;i<=160;i++){const s=2*Math.PI*i/160;pts.push([a*Math.cos(s),b*Math.sin(s)])}return P.path(pts,cls,g)}
function lagBase(root){const m={l:36,r:14,t:14,b:34};const xr=[-1.2,4.6];const P=Plot(svgOf(root),{w:500,h:420,x:xr,y:equalY(500,420,m,xr,1.6),m:m});
  P.axes({xt:[-1,0,1,2,3,4],yt:[0,1,2,3],xl:'w₁',yl:'w₂'});[0.5,1.5,4,7,10].forEach(c=>lagRing(P,c,'ln thin sb',P.bgc).setAttribute('opacity','0.45'));
  P.fn(lagP,'ln sg',xr[0],xr[1],200,P.bgc);label(P,-0.15,3.55,'g(w) = 0',{cls:'lab',anchor:'start',g:P.bg});label(P,-1.1,2.5,'rings of f',{anchor:'start',g:P.bg});
  P.dot(0,0,4.5,'fw pt',P.bg).setAttribute('style','stroke:#000;stroke-width:1.4');return P}
/* both arrows drawn with fixed lengths: only their directions matter */
function lagArrows(P,w,gf,gg){const tip=(v,L)=>{const n=Math.hypot(v[0],v[1]);return [w[0]+L*v[0]/n,w[1]+L*v[1]/n]};const F=tip(gf,1.0),G=tip(gg,0.6);
  arrow(P,w[0],w[1],F[0],F[1],'ln sb','fb');arrow(P,w[0],w[1],G[0],G[1],'ln so','fo');
  label(P,F[0],F[1],'∇f',{cls:'lab',anchor:'start',dx:6,dy:-4});label(P,G[0],G[1],'∇g',{cls:'lab',anchor:'end',dx:-6,dy:-4})}

/* Equality: a point slides along g = 0; the ring through it crosses the curve until ∇f ∥ ∇g */
FIG['lagcurve']=root=>{const P=lagBase(root);const inp=q(root,'t');
  function draw(){const t=+inp.value,w=[t,lagP(t)],gf=[t,4*w[1]],gg=[-0.5*(t-3),1];P.clear();setV(root,'t',fmt(t));
    const c=lagF(w[0],w[1]);lagRing(P,c,'ln sb');lagArrows(P,w,gf,gg);
    const ang=Math.acos(Math.min(1,(gf[0]*gg[0]+gf[1]*gg[1])/(Math.hypot(gf[0],gf[1])*Math.hypot(gg[0],gg[1]))))*180/Math.PI,best=ang<0.5;
    if(!best){const n=Math.hypot(1,gg[0]),tau=[1/n,-gg[0]/n],s=gf[0]*tau[0]+gf[1]*tau[1]>0?-1:1,D=[w[0]+0.9*s*tau[0],w[1]+0.9*s*tau[1]];
      arrow(P,w[0],w[1],D[0],D[1],'ln sk dash','fk');label(P,D[0],D[1],'f goes down',{anchor:s>0?'start':'end',dx:s>0?4:-4,dy:18})}
    P.dot(w[0],w[1],7,best?'fr pt':'fk pt');label(P,w[0],w[1],best?'w* = (2, 1)':'w',{cls:'lab',anchor:'end',dx:-12,dy:16});
    setR(root,'f',fmt(c));setR(root,'a',Math.round(ang)+'°')}
  inp.addEventListener('input',draw);draw()};

/* Inequality: the same f and curve, g(w) ≥ 0 allowed on one side. out = free minimum forbidden (active), in = allowed (inactive) */
FIG['lagside']=root=>{const P=lagBase(root);const btns=[...root.querySelectorAll('button[data-side]')];let side=(btns.find(b=>b.getAttribute('aria-pressed')==='true')||btns[0]).dataset.side;
  const curve=[];for(let i=0;i<=120;i++){const t=-1.2+5.8*i/120;curve.push([t,lagP(t)])}
  function draw(){const out=side==='out';P.clear();P.poly(curve.concat(out?[[4.6,-9],[-1.2,-9]]:[[4.6,9],[-1.2,9]]),'fos');
    label(P,2.4,3.6,out?'allowed: g ≥ 0':'not allowed: g < 0',{cls:'lab',anchor:'middle'});label(P,3.2,-0.45,out?'not allowed: g < 0':'allowed: g ≥ 0',{cls:'lab',anchor:'middle'});
    if(out){lagRing(P,4,'ln sb');lagArrows(P,[2,1],[2,4],[0.5,1]);P.dot(2,1,7,'fr pt');label(P,2,1,'w* = (2, 1), on the edge',{cls:'lab',anchor:'end',dx:-12,dy:16});
      label(P,0,0,'free minimum',{anchor:'start',dx:8,dy:-8})}
    else{P.dot(0,0,7,'fr pt');label(P,0,0,'w* = (0, 0), the free minimum',{cls:'lab',anchor:'start',dx:10,dy:-10})}
    setR(root,'a',out?'4':'0');setR(root,'g',out?'0':'3');setR(root,'ag','0')}
  btns.forEach(b=>b.addEventListener('click',()=>{side=b.dataset.side;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));draw()};

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

/* Bonus slide (Lab 16, time series): the same 24 days split at random and in time order. R² values are Lab 16's real outputs. */
FIG['ts-split']=root=>{const svg=initSvg(svgOf(root),560,262);const n=24,w=20,g=2,x0=16;const cx=i=>x0+i*(w+g);
  const row=(y,title,isTest,note1,note2)=>{T(svg,x0,y-14,title,'lab big','start');
    for(let i=0;i<n;i++)E('rect',{x:cx(i),y:y,width:w,height:30,rx:3,class:isTest(i)?'fo':'fb'},svg);
    T(svg,x0,y+54,note1,'lab','start');if(note2)T(svg,x0,y+76,note2,'lab','start')};
  const rnd=[3,8,12,17,21];
  row(40,'Random split (shuffled)',i=>rnd.includes(i),'test R² = 0.89: too good to be true, each test day','sits between two training days (dashed box)');
  row(170,'Time order',i=>i>=19,'test R² = 0.66: the honest score');
  /* one random test day and its two neighbours, both in training */
  E('rect',{x:cx(11)-4,y:35,width:3*w+2*g+8,height:40,rx:5,class:'ln thin sm dash'},svg);
  /* legend and time axis */
  E('rect',{x:392,y:12,width:14,height:14,rx:2,class:'fb'},svg);T(svg,412,24,'train','lab','start');
  E('rect',{x:472,y:12,width:14,height:14,rx:2,class:'fo'},svg);T(svg,492,24,'test','lab','start');
  arrowPx(svg,x0,244,cx(n-1)+w,244,'ln thin sm','fm');T(svg,cx(n-1)+w,234,'time','lab','end')};
})();
