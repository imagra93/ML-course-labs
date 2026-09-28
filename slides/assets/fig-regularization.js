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
})();
