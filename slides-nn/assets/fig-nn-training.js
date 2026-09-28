/* Figures for 03_training.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,equalY,q,setV,setR,svgOf}=lib;const {drawNet}=window.MLNN;
FIG['gd-variants']=root=>{const r=rng(8);const m=200;const D=[];for(let i=0;i<m;i++){const x=randn(r);D.push([x,2+3*x+1.5*randn(r)])}
  const J=(a,b)=>D.reduce((s,[x,y])=>s+(a+b*x-y)**2,0)/(2*m);const grad=(a,b,idx)=>{let g0=0,g1=0;idx.forEach(i=>{const [x,y]=D[i];const e=a+b*x-y;g0+=e;g1+=e*x});return [g0/idx.length,g1/idx.length]};
  const all=[...Array(m).keys()];function run(bs,lr,epochs){let a=-2,b=-1.5;const path=[[a,b]];const rr=rng(3);for(let ep=0;ep<epochs;ep++){const perm=all.slice().sort(()=>rr()-0.5);for(let s=0;s<m;s+=bs){const g=grad(a,b,perm.slice(s,s+bs));a-=lr*g[0];b-=lr*g[1];path.push([a,b])}}return path}
  const paths={batch:run(200,0.25,30),sgd:run(1,0.02,2),mini:run(16,0.1,3)};const m2={l:34,r:10,t:10,b:30};const xr=[-3,5];
  const P=Plot(svgOf(root),{w:560,h:400,x:xr,y:equalY(560,400,m2,xr,1.4),m:m2});P.axes({xt:[-2,0,2,4],yt:[-2,0,2,4],xl:'θ₀ (intercept)',yl:'θ₁ (slope)'});
  const jm=J(2,3);[0.3,1,2.5,5,9,15].forEach(f=>{const pts=[];for(let i=0;i<=160;i++){const t=2*Math.PI*i/160;let lo=0,hi=12;const u=Math.cos(t),v=Math.sin(t);for(let k=0;k<40;k++){const mid=(lo+hi)/2;if(J(2+mid*u,3+mid*v)-jm<f)lo=mid;else hi=mid}pts.push([2+lo*u,3+lo*v])}P.path(pts,'ln thin sb',P.bg).setAttribute('opacity','0.45')});
  P.dot(2,3,5,'fk',P.bg);let k='batch';const btns=root.querySelectorAll('.seg button');const info={batch:'all 200 samples per step: smooth, slow per step',sgd:'1 sample per step: many cheap, noisy updates',mini:'16 samples per step: the practical compromise'};
  function draw(){P.clear();const p=paths[k];P.path(p,'ln thin sr');P.dot(p[0][0],p[0][1],6,'fk');setR(root,'n',p.length-1);setR(root,'i',info[k]);setR(root,'j',fmt(J(...p[p.length-1]),3))}
  btns.forEach(b=>b.addEventListener('click',()=>{k=b.dataset.k;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));draw()};
FIG['optim']=root=>{const f=(x,y)=>0.5*(0.08*x*x+2*y*y);const g=(x,y)=>[0.08*x,2*y];const m2={l:34,r:10,t:10,b:30};const xr=[-5.5,1.5];
  const P=Plot(svgOf(root),{w:600,h:380,x:xr,y:equalY(600,380,m2,xr,0),m:m2});P.axes({xt:[-5,-4,-3,-2,-1,0,1],yt:[-2,-1,0,1,2],xl:'w₁',yl:'w₂'});
  [0.05,0.2,0.5,1,1.8,2.8].forEach(l=>{const pts=[];for(let i=0;i<=120;i++){const t=2*Math.PI*i/120;pts.push([Math.sqrt(2*l/0.08)*Math.cos(t),Math.sqrt(2*l/2)*Math.sin(t)])}P.path(pts,'ln thin sb',P.bg).setAttribute('opacity','0.4')});P.dot(0,0,5,'fk',P.bg);
  const cols={gd:'#7f7f7f',mom:'#4472c4',rms:'#70ad47',adam:'#c00000'};const inp=q(root,'lr');
  function run(kind,lr){let x=-5,y=1.2;const p=[[x,y]];let vx=0,vy=0,sx=0,sy=0,mx=0,my=0;for(let t=1;t<=60;t++){const [gx,gy]=g(x,y);
      if(kind==='gd'){x-=lr*gx;y-=lr*gy}else if(kind==='mom'){vx=0.9*vx+gx;vy=0.9*vy+gy;x-=0.1*lr*vx;y-=0.1*lr*vy}
      else if(kind==='rms'){sx=0.9*sx+0.1*gx*gx;sy=0.9*sy+0.1*gy*gy;x-=lr*0.3*gx/(Math.sqrt(sx)+1e-8);y-=lr*0.3*gy/(Math.sqrt(sy)+1e-8)}
      else{mx=0.9*mx+0.1*gx;my=0.9*my+0.1*gy;sx=0.999*sx+0.001*gx*gx;sy=0.999*sy+0.001*gy*gy;const bx=mx/(1-0.9**t),by=my/(1-0.9**t),cx=sx/(1-0.999**t),cy=sy/(1-0.999**t);x-=lr*0.3*bx/(Math.sqrt(cx)+1e-8);y-=lr*0.3*by/(Math.sqrt(cy)+1e-8)}
      if(Math.abs(x)>50||Math.abs(y)>50)break;p.push([x,y])}return p}
  function draw(){const lr=Math.pow(10,+inp.value);setV(root,'lr',fmt(lr,3));P.clear();for(const k of ['gd','mom','rms','adam']){const p=run(k,lr);const pa=P.path(p,'ln thin');pa.setAttribute('stroke',cols[k]);pa.setAttribute('stroke-width','2.2');
      p.forEach((q2,i)=>{if(i%3===0){const d=P.dot(q2[0],q2[1],2.6,'');d.setAttribute('fill',cols[k])}});const e=p[p.length-1];setR(root,k,fmt(f(e[0],e[1]),4))}}inp.addEventListener('input',draw);draw()};
FIG['sched']=root=>{const P=Plot(svgOf(root),{w:500,h:280,x:[0,100],y:[0,1.1],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[0,25,50,75,100],yt:[0,0.5,1],xl:'epoch',yl:'learning rate / α₀'});
  P.fn(e=>1,'ln thin sm dash');P.fn(e=>Math.pow(0.5,Math.floor(e/25)),'ln sb',0,100,400);P.fn(e=>e<8?e/8:0.5*(1+Math.cos(Math.PI*(e-8)/92)),'ln sr',0,100,400);
  P.text(98,1,'constant','', 'end',0,-6);P.text(30,0.52,'step decay','', 'start',0,-6);P.text(10,1.02,'warm-up + cosine','', 'start',0,-6)};
FIG['curves']=root=>{const svg=initSvg(svgOf(root),960,260);const e=[...Array(41).keys()];
  [['Underfitting: both high',x=>0.62+0.2*Math.exp(-x/8),x=>0.66+0.2*Math.exp(-x/8)],['Good fit',x=>0.12+0.6*Math.exp(-x/6),x=>0.2+0.55*Math.exp(-x/6)],['Overfitting: the gap grows',x=>0.03+0.7*Math.exp(-x/5),x=>0.32+0.45*Math.exp(-x/5)+0.012*Math.max(0,x-8)]].forEach(([lab,tr,va],k)=>{
    const P=Plot(svg,{at:[k*320,0],w:310,h:260,x:[0,40],y:[0,1],m:{l:36,r:8,t:26,b:30}});P.axes({xt:[0,20,40],yt:[0,0.5,1],xl:'epoch',yl:'loss'});T(P.root,160,16,lab,'lab');P.path(e.map(x=>[x,tr(x)]),'ln sb');P.path(e.map(x=>[x,va(x)]),'ln so');
    if(k===2){P.line(8,0,8,1,'ln thin sg dash');P.text(8,0.9,'early stopping','', 'start',4,0)}})};
FIG['dropout']=root=>{const svg=svgOf(root);const inp=q(root,'p');const r=rng(4);let mode='train';const btns=root.querySelectorAll('.seg button');let seed=1;
  function draw(){const p=+inp.value;setV(root,'p',fmt(p,2));initSvg(svg,560,320);const drop=new Set();const rr=rng(seed);const sizes=[3,6,6,1];
    if(mode==='train')for(let l=1;l<=2;l++)for(let i=0;i<sizes[l];i++)if(rr()<p)drop.add(l+'-'+i);
    drawNet(svg,sizes,{x0:50,y0:30,w:460,h:260,r:14,drop:drop});T(svg,280,312,mode==='train'?'Training: a new random set of units is switched off at every mini-batch':'Validation / prediction: all units are used','','middle');setR(root,'n',drop.size+' of 12')}
  root.querySelector('[data-k="new"]').addEventListener('click',()=>{seed++;draw()});btns.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.m;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));inp.addEventListener('input',draw);draw()};
FIG['bn']=root=>{const r=rng(12);const z=[...Array(400)].map(()=>3+2.5*randn(r));const mu=z.reduce((a,b)=>a+b,0)/z.length;const sd=Math.sqrt(z.reduce((a,b)=>a+(b-mu)**2,0)/z.length);const zh=z.map(v=>(v-mu)/Math.sqrt(sd*sd+1e-5));
  const svg=initSvg(svgOf(root),600,300);const hist=(P,vals,cls)=>{const B=30,lo=-6,hi=12,c=new Array(B).fill(0);vals.forEach(v=>{const k=Math.floor((v-lo)/(hi-lo)*B);if(k>=0&&k<B)c[k]++});c.forEach((n,k)=>P.rect(lo+(hi-lo)*k/B,0,lo+(hi-lo)*(k+1)/B-0.08,n,cls))};
  const A=Plot(svg,{at:[0,0],w:600,h:140,x:[-6,12],y:[0,90],m:{l:40,r:14,t:24,b:20}});A.axes({xt:[-6,-3,0,3,6,9,12],grid:false});T(A.root,300,16,'before BatchNorm: z over one mini-batch','lab');hist(A,z,'fo');
  const B2=Plot(svg,{at:[0,150],w:600,h:150,x:[-6,12],y:[0,90],m:{l:40,r:14,t:24,b:24}});B2.axes({xt:[-6,-3,0,3,6,9,12],grid:false});T(B2.root,300,16,'after: γ ẑ + β','lab');
  const ig=q(root,'g'),ib=q(root,'b');function draw(){const g=+ig.value,b=+ib.value;setV(root,'g',fmt(g,1));setV(root,'b',fmt(b,1));B2.clear();hist(B2,zh.map(v=>g*v+b),'fb');
    setR(root,'m0',fmt(mu,2));setR(root,'s0',fmt(sd,2));setR(root,'m1',fmt(b,2));setR(root,'s1',fmt(Math.abs(g),2))}ig.addEventListener('input',draw);ib.addEventListener('input',draw);draw()};
})();
