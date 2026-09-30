/* Figures for 02_linear_regression.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrow,rng,randn,solve,fmt,q,setV,setR,svgOf}=lib;

/* The simplest model h = θx on three points: squared errors and the parabola J(θ), with its slope */
const D3=[[1,1],[2,3],[3,7]];
FIG['simple']=root=>{const m=D3.length;const J=t=>D3.reduce((s,[x,y])=>s+(t*x-y)**2,0)/(2*m),dJ=t=>D3.reduce((s,[x,y])=>s+(t*x-y)*x,0)/m;
  const svg=initSvg(svgOf(root),600,330);
  const P=Plot(svg,{at:[0,0],w:300,h:330,x:[0,3.6],y:[0,11],m:{l:34,r:8,t:12,b:36}});P.axes({xt:[0,1,2,3],yt:[0,2,4,6,8,10],xl:'x',yl:'y'});
  const Q=Plot(svg,{at:[310,0],w:290,h:330,x:[0,3.5],y:[0,10.5],m:{l:40,r:8,t:12,b:36}});Q.axes({xt:[0,1,2,3],yt:[0,2,4,6,8,10],xl:'θ',yl:'J(θ)'});
  Q.fn(J,'ln sb',0,3.5,200,Q.bg);Q.line(2,0,2,10.5,'ln thin sg dash',Q.bg);Q.text(2,9.9,'θ* = 2','','start',6,0,Q.bg);
  const inp=q(root,'t');
  function draw(){const t=+inp.value;setV(root,'t',fmt(t));P.clear();Q.clear();
    D3.forEach(([x,y])=>{const px=P.X(x),py=P.Y(y),ph=P.Y(t*x);const s=Math.abs(py-ph);E('rect',{x:px,y:Math.min(py,ph),width:s,height:s,class:'fos',style:'stroke:var(--orange);stroke-width:1'},P.dyn);P.line(x,y,x,t*x,'ln thin so dot2')});
    P.fn(x=>t*x,'ln sr',0,3.6);D3.forEach(([x,y])=>P.dot(x,y,6,'pt fb'));P.text(0.15,10.2,'h(x) = '+fmt(t)+' · x','lab','start');
    const g=dJ(t);Q.line(t-0.45,J(t)-0.45*g,t+0.45,J(t)+0.45*g,'ln sk');Q.dot(t,J(t),7,'fr pt');
    setR(root,'j',fmt(J(t),2));setR(root,'g',fmt(g,2))}
  inp.addEventListener('input',draw);draw()};

/* The cost of the general model with two parameters is a bowl too: contours of J(θ0, θ1) and the gradient-descent path */
FIG['bowl2']=root=>{const r=rng(31);const D=[];for(let i=0;i<300;i++){const x=-2+4*r();D.push([x,6+2.3*x+1.6*randn(r)])}const m=D.length;
  let t0=0,t1=0;const hist=[[0,0]];for(let k=0;k<80;k++){let g0=0,g1=0;D.forEach(([x,y])=>{const e=t0+t1*x-y;g0+=e;g1+=e*x});t0-=0.08*g0/m;t1-=0.08*g1/m;hist.push([t0,t1])}
  const sx=D.reduce((s,p)=>s+p[0],0)/m,sxx=D.reduce((s,p)=>s+p[0]*p[0],0)/m,sy=D.reduce((s,p)=>s+p[1],0)/m,sxy=D.reduce((s,p)=>s+p[0]*p[1],0)/m;
  const opt=solve([[1,sx],[sx,sxx]],[sy,sxy]);const H=[[1,sx],[sx,sxx]];
  const P=Plot(svgOf(root),{w:460,h:340,x:[-1,8],y:[-1.2,4.2],m:{l:40,r:12,t:12,b:36}});P.axes({xt:[0,2,4,6,8],yt:[-1,0,1,2,3,4],xl:'θ₀ (intercept)',yl:'θ₁ (slope)'});
  [0.5,2,5,10,18,28].forEach(L=>{const pts=[];for(let i=0;i<=120;i++){const a=2*Math.PI*i/120,u=[Math.cos(a),Math.sin(a)];const quad=H[0][0]*u[0]*u[0]+2*H[0][1]*u[0]*u[1]+H[1][1]*u[1]*u[1];const rr=Math.sqrt(2*L/quad);pts.push([opt[0]+rr*u[0],opt[1]+rr*u[1]])}
    P.path(pts,'ln thin sb',P.bgc).setAttribute('opacity','0.55')});
  P.path(hist,'ln thin sr');hist.forEach((h,k)=>{if(k%4===0||k<6)P.dot(h[0],h[1],k?3:6,k?'fr':'fk')});
  P.dot(opt[0],opt[1],6,'fgr pt');P.text(opt[0],opt[1],'minimum θ*','lab','start',10,-8);P.text(0,0,'start θ = (0, 0)','','start',8,16)};

/* Regression metrics on five houses; toggle one large error */
FIG['reg-errors']=root=>{const Y=[200,150,300,250,100],P0=[210,140,280,260,110],P1=[210,140,280,260,200];let o=0;const btns=root.querySelectorAll('.seg button');
  const P=Plot(svgOf(root),{w:520,h:330,x:[0.4,5.6],y:[0,350],m:{l:52,r:14,t:14,b:36}});P.axes({xt:[1,2,3,4,5],yt:[0,100,200,300],fx:v=>'house '+v,yl:'price (k€)'});
  P.line(0.4,200,5.6,200,'ln thin sm dash',P.bg);P.text(3.5,200,'mean ȳ = 200','','middle',0,17,P.bg);
  function draw(){const Ph=o?P1:P0;P.clear();
    Y.forEach((y,i)=>{const x=i+1,p=Ph[i],big=Math.abs(y-p)>50;P.line(x,y,x,p,big?'ln sr':'ln so');P.dot(x,y,7,'pt fb');
      E('rect',{x:P.X(x)-6,y:P.Y(p)-6,width:12,height:12,class:'fo'},P.dyn);P.text(x,(y+p)/2,'error '+(y-p>0?'+':'')+(y-p),big?'lab':'','start',10,5)});
    const e=Y.map((y,i)=>y-Ph[i]),n=Y.length,sst=Y.reduce((s,y)=>s+(y-200)**2,0),sse=e.reduce((s,v)=>s+v*v,0);
    setR(root,'mae',fmt(e.reduce((s,v)=>s+Math.abs(v),0)/n,1));setR(root,'rmse',fmt(Math.sqrt(sse/n),1));setR(root,'r2',fmt(1-sse/sst,3));
    setR(root,'mape',fmt(100*e.reduce((s,v,i)=>s+Math.abs(v)/Y[i],0)/n,1)+' %')}
  btns.forEach(b=>b.addEventListener('click',()=>{o=+b.dataset.o;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));draw()};
})();
