/* Figures for 01_supervised_learning.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,solve,fmt,q,setV,setR,svgOf}=lib;

/* The workflow, from the problem to deployment */
FIG['workflow']=root=>{const svg=initSvg(svgOf(root),1100,310);
  const S=[['1 · Define the problem','and the metric'],['2 · Get the data','and explore it'],['3 · Split','train / validation / test'],['4 · Baseline','the dumbest model'],
    ['5 · Train','fit θ on the training set'],['6 · Tune','hyperparameters on validation'],['7 · Test','once, at the very end'],['8 · Deploy','and monitor']];
  const fill=['#f2f2f2','#f2f2f2','#f2f2f2','#f2f2f2','#e2f0d9','#dae3f3','#fbe5d6','#f2f2f2'];
  const pos=k=>[20+(k%4)*275,k<4?20:176];
  S.forEach((s,k)=>{const [x,y]=pos(k);E('rect',{x:x,y:y,width:230,height:74,rx:10,fill:fill[k],style:'stroke:#595959;stroke-width:1.3'},svg);
    T(svg,x+115,y+32,s[0],'lab big');T(svg,x+115,y+57,s[1],'','middle')});
  [0,1,2,4,5,6].forEach(k=>{const [x,y]=pos(k);arrowPx(svg,x+232,y+37,x+272,y+37,'ln sk','fk')});
  E('path',{d:'M960,96 L960,134 L135,134 L135,168',class:'ln thin sk'},svg);arrowPx(svg,135,150,135,174,'ln thin sk','fk');
  E('path',{d:'M410,252 C410,300 135,300 135,256',class:'ln thin sb'},svg);arrowPx(svg,138,268,135,252,'ln thin sb','fb');T(svg,272,300,'iterate: new features, other models','','middle');
  T(svg,960,268,'new data can drift: re-check, retrain','','middle')};

/* Underfitting and overfitting: polynomial degree vs train and test error */
FIG['complexity']=root=>{const r=rng(7);const tr=[],te=[];
  for(let i=0;i<20;i++){const x=(i+0.2+0.6*r())/20;tr.push([x,Math.sin(2*Math.PI*x)+0.3*randn(r)])}for(let i=0;i<300;i++){const x=r();te.push([x,Math.sin(2*Math.PI*x)+0.3*randn(r)])}
  const basis=(x,d)=>{const t=2*x-1;const b=[1];if(d>=1)b.push(t);for(let k=1;k<d;k++)b.push(((2*k+1)*t*b[k]-k*b[k-1])/(k+1));return b};
  function fit(d){const A=[],bb=[];for(let i=0;i<=d;i++){A.push(new Array(d+1).fill(0));bb.push(0)}
    tr.forEach(([x,y])=>{const f=basis(x,d);for(let i=0;i<=d;i++){bb[i]+=f[i]*y;for(let j=0;j<=d;j++)A[i][j]+=f[i]*f[j]}});for(let i=0;i<=d;i++)A[i][i]+=1e-9;
    const c=solve(A,bb);const pred=x=>basis(x,d).reduce((s,v,i)=>s+v*c[i],0);const rm=D=>Math.sqrt(D.reduce((s,p)=>s+(pred(p[0])-p[1])**2,0)/D.length);return {pred:pred,tr:rm(tr),te:rm(te)}}
  const F=[];for(let d=0;d<=15;d++)F.push(fit(d));const TOP=1.2,cl=v=>Math.min(v,TOP);
  const svg=initSvg(svgOf(root),640,340);
  const P=Plot(svg,{at:[0,0],w:370,h:340,x:[0,1],y:[-2,2],m:{l:34,r:8,t:12,b:36}});P.axes({xt:[0,0.5,1],yt:[-2,-1,0,1,2],xl:'x',yl:'y'});P.fn(x=>Math.sin(2*Math.PI*x),'ln thin sm dash',0,1,200,P.bg);
  const Q=Plot(svg,{at:[385,0],w:255,h:340,x:[0,15],y:[0,TOP],m:{l:46,r:8,t:12,b:36}});Q.axes({xt:[0,3,6,9,12,15],yt:[0,0.3,0.6,0.9,1.2],xl:'degree (complexity)',yl:'RMSE'});
  Q.path(F.map((f,d)=>[d,f.tr]),'ln sb',Q.bg);Q.path(F.map((f,d)=>[d,cl(f.te)]),'ln so',Q.bg);
  Q.line(0,0.3,15,0.3,'ln thin sm dot2',Q.bg);Q.text(0.3,0.3,'noise σ = 0.3','','start',0,14,Q.bg);
  Q.line(3.2,1.1,5,1.1,'ln sb',Q.bg);Q.text(5.4,1.1,'train','','start',0,5,Q.bg);Q.line(3.2,0.99,5,0.99,'ln so',Q.bg);Q.text(5.4,0.99,'test (new data)','','start',0,5,Q.bg);
  const inp=q(root,'d');
  function draw(){const d=+inp.value;setV(root,'d',d);const f=F[d];P.clear();tr.forEach(p=>P.dot(p[0],p[1],5,'pt fb'));P.fn(f.pred,'ln sr',0,1,400);
    Q.clear();Q.line(d,0,d,TOP,'ln thin sm dash');Q.dot(d,f.tr,5,'fb pt');Q.dot(d,cl(f.te),5,'fo pt');if(f.te>TOP)Q.text(d,TOP,'↑ '+fmt(f.te,1),'lab','end',-7,14);
    setR(root,'tr',fmt(f.tr,3));setR(root,'te',fmt(f.te,3));setR(root,'vd',f.tr>0.45?'Underfitting':f.te>0.5?'Overfitting':'Just right')}
  inp.addEventListener('input',draw);draw()};

/* Three ways to split: random (stratified), grouped, by time */
FIG['splits']=root=>{const svg=initSvg(svgOf(root),560,310);const C={tr:'#a9f5c9',va:'#79b8f5',te:'#f8c08f'};
  const cell=(x,y,c,t)=>{E('rect',{x:x,y:y,width:24,height:24,fill:C[c],style:'stroke:#7f7f7f;stroke-width:1'},svg);if(t)T(svg,x+12,y+17,t,'','middle')};
  const r=rng(3);const lab=[...Array(14).fill('tr'),...Array(3).fill('va'),...Array(3).fill('te')];
  const rnd=lab.slice();for(let i=rnd.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[rnd[i],rnd[j]]=[rnd[j],rnd[i]]}
  const x0=10,dx=27;
  T(svg,x0,18,'Random, stratified: shuffle the rows (each part keeps the class mix)','lab','start');rnd.forEach((c,i)=>cell(x0+i*dx,26,c));
  T(svg,x0,88,'Grouped: all the rows of one customer go to the same part','lab','start');
  ['A','B','C','D','E'].forEach((g,k)=>{const part=['tr','te','tr','va','tr'][k];for(let j=0;j<4;j++)cell(x0+(k*4+j)*dx,96,part,g)});
  T(svg,x0,158,'Time: train on the past, validate and test on the future','lab','start');lab.forEach((c,i)=>cell(x0+i*dx,166,c));
  arrowPx(svg,x0,204,x0+20*dx-6,204,'ln thin sk','fk');T(svg,x0+20*dx-6,222,'time','','end');
  [['tr','train'],['va','validation'],['te','test']].forEach(([c,t],k)=>{const x=x0+k*150;E('rect',{x:x,y:258,width:20,height:20,fill:C[c],style:'stroke:#7f7f7f'},svg);T(svg,x+28,274,t,'','start')})};
})();
