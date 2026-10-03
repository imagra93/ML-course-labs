/* Figures for 05_regularization.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,rng,randn,solve,fmt,q,setV,setR,svgOf}=lib;
FIG['shrink']=root=>{const P=Plot(svgOf(root),{w:500,h:400,x:[-3,3],y:[-3,3],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[-3,-2,-1,0,1,2,3],yt:[-3,-2,-1,0,1,2,3],xl:'z = OLS coefficient',yl:'regularized θ'});
  const inp=q(root,'l');function draw(){const l=+inp.value;setV(root,'l',fmt(l));P.clear();P.rect(-l,-3,l,3,'fos');P.fn(z=>z,'ln thin sm dash');P.fn(z=>z/(1+l),'ln sb');P.fn(z=>Math.sign(z)*Math.max(Math.abs(z)-l,0),'ln sr');
    if(l>0.15)P.text(0,-2.6,'Lasso: θ = 0 here','', 'middle')}inp.addEventListener('input',draw);draw()};
function pathsData(){const r=rng(21);const m=60,n=8;const X=[],y=[];const th=[3,-2,0,1.5,0,0,0,0];
  for(let i=0;i<m;i++){const x=[];for(let j=0;j<n;j++)x.push(randn(r));x[5]=x[0]+0.25*randn(r);X.push(x);y.push(x.reduce((s,v,j)=>s+v*th[j],0)+1.2*randn(r))}
  for(let j=0;j<n;j++){const mu=X.reduce((s,x)=>s+x[j],0)/m;const sd=Math.sqrt(X.reduce((s,x)=>s+(x[j]-mu)**2,0)/m);X.forEach(x=>x[j]=(x[j]-mu)/sd)}
  const ym=y.reduce((a,b)=>a+b,0)/m;return {X:X,y:y.map(v=>v-ym),m:m,n:n,th:th}}
FIG['paths']=root=>{const {X,y,m,n,th}=pathsData();const XtX=[],Xty=[];for(let a=0;a<n;a++){XtX.push(new Array(n).fill(0));Xty.push(0)}
  X.forEach((x,i)=>{for(let a=0;a<n;a++){Xty[a]+=x[a]*y[i];for(let b=0;b<n;b++)XtX[a][b]+=x[a]*x[b]}});
  const grid=[];for(let le=-3;le<=1.001;le+=0.05)grid.push(Math.pow(10,le));
  const ridge=grid.map(l=>solve(XtX.map((row,a)=>row.map((v,b)=>v+(a===b?m*l:0))),Xty));
  let w=new Array(n).fill(0);const lasso=grid.slice().reverse().map(l=>{for(let it=0;it<60;it++)for(let j=0;j<n;j++){let rho=0;X.forEach((x,i)=>{const pred=x.reduce((s,v,k)=>s+v*w[k],0);rho+=x[j]*(y[i]-pred+x[j]*w[j])});rho/=m;const zj=XtX[j][j]/m;w[j]=Math.sign(rho)*Math.max(Math.abs(rho)-l,0)/zj}return w.slice()}).reverse();
  const svg=initSvg(svgOf(root),960,320);const cols=['#4472c4','#ed7d31','#a5a5a5','#70ad47','#7f7f7f','#c00000','#bf9000','#5b9bd5'];
  [['Ridge (L2): everything shrinks smoothly',ridge],['Lasso (L1): coefficients switch off one by one',lasso]].forEach(([lab,W],k)=>{
    const P=Plot(svg,{at:[k*480,0],w:470,h:320,x:[1e-3,10],y:[-2.8,3.6],logx:true,m:{l:40,r:10,t:26,b:36}});P.axes({xt:[1e-3,1e-2,1e-1,1,10],fx:v=>String(v),yt:[-2,0,2],xl:'λ (log scale)',yl:'θⱼ'});T(P.root,250,16,lab,'lab');P.line(1e-3,0,10,0,'ax');
    for(let j=0;j<n;j++){const p=P.path(W.map((wv,i)=>[grid[i],wv[j]]),'ln');p.setAttribute('stroke',cols[j]);if(th[j]===0)p.setAttribute('stroke-dasharray','6 5')}})};
FIG['priors']=root=>{const P=Plot(svgOf(root),{w:460,h:280,x:[-4,4],y:[0,1.05],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[-4,-2,0,2,4],yt:[0,0.5,1],xl:'θⱼ',yl:'prior density'});
  P.fn(t=>Math.exp(-t*t/2),'ln sb');P.fn(t=>Math.exp(-Math.abs(t)*1.2),'ln sr');P.text(1.3,0.62,'Gaussian → L2','', 'start');P.text(0.35,0.95,'Laplace → L1 (sharp peak at 0)','', 'start')};
FIG['resid-diag']=root=>{const svg=initSvg(svgOf(root),960,230);const r=rng(31);
  [['Healthy: a structureless band',x=>0,x=>0.5],['Curve: non-linearity',x=>1.6*(x-0.5)*(x-0.5)*4-0.9,x=>0.3],['Funnel: heteroscedasticity',x=>0,x=>0.1+1.2*x]].forEach(([lab,mu,sd],k)=>{
    const P=Plot(svg,{at:[k*320,0],w:310,h:230,x:[0,1],y:[-2.4,2.4],m:{l:30,r:8,t:26,b:30}});P.axes({grid:false,xl:'fitted value',yl:'residual'});P.line(0,0,1,0,'gr');
    for(let i=0;i<70;i++){const x=r();P.dot(x,mu(x)+sd(x)*randn(r),3,'fb')}T(P.root,160,16,lab,'lab')})};
/* L1 vs L2 for one feature: g(θ) = ½(θ−z)² + λ|θ| (Lasso) and ½(θ−z)² + (λ/2)θ² (Ridge). The minimum of the red curve sticks at the kink when |z| ≤ λ. */
FIG['lasso-kink']=root=>{const P=Plot(svgOf(root),{w:600,h:380,x:[-3,3],y:[0,6.5],m:{l:40,r:14,t:14,b:40}});
  P.axes({xt:[-3,-2,-1,0,1,2,3],yt:[0,2,4,6],xl:'θ',yl:'cost'});
  const iz=q(root,'z'),il=q(root,'l');
  function draw(){const z=+iz.value,lam=+il.value;setV(root,'z',fmt(z,1));setV(root,'l',fmt(lam));P.clear();
    const data=t=>0.5*(t-z)*(t-z),lasso=t=>data(t)+lam*Math.abs(t),ridge=t=>data(t)+0.5*lam*t*t;
    const thL=Math.sign(z)*Math.max(Math.abs(z)-lam,0),thR=z/(1+lam);
    P.fn(data,'ln thin sm dash',-3,3,240);P.fn(t=>lam*Math.abs(t),'ln thin so',-3,3,240);P.fn(ridge,'ln thin sb',-3,3,240);P.fn(lasso,'ln sr',-3,3,240);
    P.line(thL,0,thL,lasso(thL),'ln thin sr dot2');P.dot(thR,ridge(thR),5,'fb pt');P.dot(thL,lasso(thL),6,'fr pt');P.dot(z,0,5,'fk');P.text(z,0,'z','lab','middle',0,-10);
    setR(root,'tl',fmt(thL));setR(root,'tr',fmt(thR));
    setR(root,'b',lam===0?'No penalty':Math.abs(z)<=lam+1e-9?'Stuck at the corner':'Pulled λ towards 0')}
  iz.addEventListener('input',draw);il.addEventListener('input',draw);draw()};

/* 5-fold cross-validation of the degree-15 polynomial of the "Choosing λ" figure: the real fold errors for a grid of λ */
FIG['cv-table']=root=>{const r=rng(7);const tr=[];for(let i=0;i<20;i++){const x=(i+0.2+0.6*r())/20;tr.push([x,Math.sin(2*Math.PI*x)+0.3*randn(r)])}
  const d=15,basis=x=>{const t=2*x-1;const b=[1,t];for(let k=1;k<d;k++)b.push(((2*k+1)*t*b[k]-k*b[k-1])/(k+1));return b};
  function fit(D,lam){const A=[],bb=[];for(let i=0;i<=d;i++){A.push(new Array(d+1).fill(0));bb.push(0)}D.forEach(([x,y])=>{const f=basis(x);for(let i=0;i<=d;i++){bb[i]+=f[i]*y;for(let j=0;j<=d;j++)A[i][j]+=f[i]*f[j]}});
    for(let i=1;i<=d;i++)A[i][i]+=lam;A[0][0]+=1e-9;const c=solve(A,bb);return x=>basis(x).reduce((s,v,i)=>s+v*c[i],0)}
  const rm=(pr,D)=>Math.sqrt(D.reduce((s,p)=>s+(pr(p[0])-p[1])**2,0)/D.length);
  const grid=[-6,-4,-3,-2,-1,0,1],rows=grid.map(le=>{const lam=Math.pow(10,le),f=[0,1,2,3,4].map(k=>rm(fit(tr.filter((_,i)=>i%5!==k),lam),tr.filter((_,i)=>i%5===k)));return {le,f,mean:f.reduce((a,b)=>a+b,0)/5}});
  const best=rows.reduce((b,x)=>x.mean<b.mean?x:b,rows[0]),num=v=>v>=10?fmt(v,0):fmt(v,2);
  root.innerHTML='<table class="t" data-quarto-disable-processing="true" style="font-size:17px"><thead><tr><th>λ</th><th>fold 1</th><th>fold 2</th><th>fold 3</th><th>fold 4</th><th>fold 5</th><th>mean</th></tr></thead><tbody>'+
    rows.map(x=>'<tr'+(x===best?' style="background:var(--gold-soft);font-weight:700"':'')+'><td>10<sup>'+String(x.le).replace('-','−')+'</sup></td>'+x.f.map(v=>'<td>'+num(v)+'</td>').join('')+'<td>'+num(x.mean)+'</td></tr>').join('')+'</tbody></table>'};

/* Collinearity: same X, new noise, 80 times. The estimated (θ1, θ2) scatter along θ1 + θ2 = const when x1 and x2 are nearly the same feature; Ridge tightens the cloud. */
FIG['collinear']=root=>{const m=40,R=80,r0=rng(3),z1=[],z2=[];for(let i=0;i<m;i++){z1.push(randn(r0));z2.push(randn(r0))}
  const mean=a=>a.reduce((s,v)=>s+v,0)/a.length,dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const c1=z1.map(v=>v-mean(z1)),n1=Math.sqrt(dot(c1,c1)/m),u1=c1.map(v=>v/n1);
  const c2=z2.map(v=>v-mean(z2)),pr=dot(c2,u1)/m,o2=c2.map((v,i)=>v-pr*u1[i]),n2=Math.sqrt(dot(o2,o2)/m),u2=o2.map(v=>v/n2);
  const r1=rng(11),EPS=[];for(let k=0;k<R;k++){const e=[];for(let i=0;i<m;i++)e.push(randn(r1));EPS.push(e)}
  const svg=initSvg(svgOf(root),600,300);
  const A=Plot(svg,{at:[0,0],w:290,h:300,x:[-3.2,3.2],y:[-3.2,3.2],m:{l:40,r:8,t:26,b:40}}),B=Plot(svg,{at:[300,0],w:300,h:300,x:[-5,7],y:[-5,7],m:{l:40,r:8,t:26,b:40}});
  const ir=q(root,'r'),il=q(root,'l'),sd=a=>{const mu=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-mu)**2,0)/(a.length-1))};
  function draw(){const r=+ir.value,lam=+il.value;setV(root,'r',fmt(r,3));setV(root,'l',String(lam));
    const x1=u1,x2=u1.map((v,i)=>r*v+Math.sqrt(1-r*r)*u2[i]);
    const solveFor=l=>{const a11=dot(x1,x1)+l,a12=dot(x1,x2),a22=dot(x2,x2)+l,det=a11*a22-a12*a12;
      return EPS.map(e=>{const b1=dot(x1,x1)+dot(x1,x2)+dot(x1,e),b2=dot(x2,x1)+dot(x2,x2)+dot(x2,e);return [(a22*b1-a12*b2)/det,(a11*b2-a12*b1)/det]})};
    const est=solveFor(0),rdg=lam>0?solveFor(lam):null;
    A.clear();B.clear();A.bg.innerHTML='';B.bg.innerHTML='';
    A.axes({xt:[-3,-2,-1,0,1,2,3],yt:[-3,-2,-1,0,1,2,3],xl:'x₁',yl:'x₂',title:'The two features (40 examples)'});
    B.axes({xt:[-4,-2,0,2,4,6],yt:[-4,-2,0,2,4,6],xl:'estimated θ₁',yl:'estimated θ₂',title:'80 repeats: new noise, same X'});
    x1.forEach((v,i)=>A.dot(v,x2[i],3.5,'pt fb'));
    B.line(-5,7,7,-5,'ln thin sm dash',B.bg);B.text(5.5,-3.3,'θ₁+θ₂ = 2','', 'end',0,0,B.bg);
    est.forEach(p=>B.dot(p[0],p[1],3.2,'pt fo'));if(rdg)rdg.forEach(p=>B.dot(p[0],p[1],3.2,'pt fgr'));B.dot(1,1,8,'nof').setAttribute('style','stroke:#000;stroke-width:2');B.text(1,1,'true (1, 1)','lab','start',11,-8);
    setR(root,'vif',fmt(1/(1-r*r),1));setR(root,'s1',fmt(sd(est.map(p=>p[0])),2));setR(root,'s12',fmt(sd(est.map(p=>p[0]+p[1])),2));setR(root,'sr',rdg?fmt(sd(rdg.map(p=>p[0])),2):'–')}
  ir.addEventListener('input',draw);il.addEventListener('input',draw);draw()};

})();
