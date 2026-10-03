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
/* One gradient-descent step on the bowl J = ½(θ−2)² (curvature a = 1): the distance to the minimum is multiplied by ρ = 1 − α */
FIG['step-bowl']=root=>{const J=t=>0.5*(t-2)*(t-2),ts=2,t0=5;
  const P=Plot(svgOf(root),{w:560,h:380,x:[-2.8,6.4],y:[-2.3,9.4],m:{l:14,r:14,t:10,b:10}});
  P.axes({noaxes:true,grid:false});P.fn(J,'ln sb',-2.8,6.4,200,P.bgc);P.line(-2.8,0,6.4,0,'ln thin sk',P.bg);
  P.line(ts,-0.2,ts,9.4,'ln thin sm dash',P.bg);P.text(ts,9.4,'θ*','lab','middle',0,12,P.bg);P.text(6.4,0,'θ','', 'end',0,-6,P.bg);
  const inp=q(root,'a');
  const seg=(y,a,b,cls,txt)=>{P.line(a,y,b,y,'ln '+cls);P.line(a,y-0.22,a,y+0.22,'ln thin '+cls);P.line(b,y-0.22,b,y+0.22,'ln thin '+cls);P.text((a+b)/2,y,txt,'lab','middle',0,-6)};
  function draw(){const al=+inp.value;setV(root,'a',fmt(al));P.clear();
    const t1=t0-al*(t0-ts),rho=1-al,e0=t0-ts,e1=t1-ts;
    P.line(t0,J(t0),t0,-1.55,'ln thin sm dot2');P.line(t1,J(t1),t1,-1.55,'ln thin sm dot2');
    arrow(P,t0,J(t0),t1,J(t1),'ln thin sr','fr');P.dot(t0,J(t0),6,'fy');P.dot(t1,J(t1),6,'fr');
    seg(-0.75,ts,t0,'sb','e = '+fmt(e0));seg(-1.55,ts,t1,'so','ρ·e = '+fmt(e1));
    setR(root,'rho',fmt(rho));setR(root,'e1',fmt(e1));
    setR(root,'b',Math.abs(rho)<1e-9?'Lands on the minimum':Math.abs(rho)<1?(rho>0?'Closer, same side':'Closer, other side'):'Farther away: diverges')}
  inp.addEventListener('input',draw);draw()};

/* The distance to the minimum after k steps, e_k = ρ^k e_0, for the three learning rates of the previous slide (e_0 = 3) */
FIG['err-steps']=root=>{const P=Plot(svgOf(root),{w:560,h:300,x:[0,10.4],y:[-7.5,7.5],m:{l:46,r:14,t:12,b:38}});
  P.axes({xt:[0,2,4,6,8,10],yt:[-6,-3,0,3,6],xl:'step k',yl:'e after k steps'});P.line(0,0,10.4,0,'ln thin sk',P.bg);
  [[0.88,'sb','fb'],[0.3,'sg','fgr'],[-1.08,'sr','fr']].forEach(([rho,s,f])=>{const pts=[];for(let k=0;k<=10;k++)pts.push([k,3*Math.pow(rho,k)]);
    P.path(pts,'ln thin '+s);pts.forEach(p=>P.dot(p[0],p[1],4,f))})};

/* A feature is just a column: y = θ0 + θ1·φ(x) with φ(x) = x, x² or x³. Left: the model as a function of x. Right: the same points against φ(x). */
const FP_X=[0.4,0.9,1.5,2.1,2.7,3.3,3.9,4.5],FP_N=[0.08,-0.10,0.10,-0.07,0.09,-0.11,0.06,-0.04];
const FP_Y=FP_X.map((x,i)=>0.3+0.12*x*x+FP_N[i]);
function fitLine(u,y){const m=u.length,mu=u.reduce((a,b)=>a+b,0)/m,my=y.reduce((a,b)=>a+b,0)/m;
  let sxx=0,sxy=0;u.forEach((v,i)=>{sxx+=(v-mu)**2;sxy+=(v-mu)*(y[i]-my)});const t1=sxy/sxx,t0=my-t1*mu;
  return {t0,t1,J:u.reduce((s,v,i)=>s+(t0+t1*v-y[i])**2,0)/(2*m)}}
FIG['feat-pow']=root=>{const svg=svgOf(root);const sup={1:'x',2:'x²',3:'x³'};
  const btns=root.querySelectorAll('.seg button'),tab=(root.closest('.slide')||root).querySelector('[data-tab]');let p=2;
  function draw(){const phi=FP_X.map(x=>Math.pow(x,p)),f=fitLine(phi,FP_Y),top=Math.pow(5,p);initSvg(svg,600,290);
    const L=Plot(svg,{at:[0,0],w:300,h:290,x:[0,5],y:[0,3.6],m:{l:40,r:10,t:30,b:40}}),R=Plot(svg,{at:[300,0],w:300,h:290,x:[0,top],y:[0,3.6],m:{l:40,r:10,t:30,b:40}});
    L.axes({xt:[0,1,2,3,4,5],yt:[0,1,2,3],xl:'x',yl:'y',title:'As a function of x'});
    R.axes({xt:[0,top/5,2*top/5,3*top/5,4*top/5,top],yt:[0,1,2,3],xl:'φ(x) = '+sup[p],yl:'y',title:'Against the new feature '+sup[p]});
    L.fn(x=>f.t0+f.t1*Math.pow(x,p),'ln sr',0,5,200);R.line(0,f.t0,top,f.t0+f.t1*top,'ln sr');
    FP_X.forEach((x,i)=>{L.dot(x,FP_Y[i],4.5,'pt fb');R.dot(phi[i],FP_Y[i],4.5,'pt fb')});
    setR(root,'t0',fmt(f.t0));setR(root,'t1',fmt(f.t1));setR(root,'j',fmt(f.J,3));
    if(tab){const rows=FP_X.slice(0,4).map((x,i)=>'<tr><td>1</td><td>'+fmt(phi[i],2)+'</td><td>'+fmt(FP_Y[i])+'</td></tr>').join('');
      tab.innerHTML='<table class="t" data-quarto-disable-processing="true" style="font-size:16px"><thead><tr><th>x₀</th><th>x₁ = '+sup[p]+'</th><th>y</th></tr></thead><tbody>'+rows+'<tr><td colspan="3" style="text-align:center">⋮</td></tr></tbody></table>'}}
  btns.forEach(b=>b.addEventListener('click',()=>{p=+b.dataset.p;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));draw()};

})();
