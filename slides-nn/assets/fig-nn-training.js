/* Figures for 03_training.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,equalY,q,setV,setR,svgOf}=lib;const {drawNet,box,grid,stepper,f2,f3}=window.MLNN;
/* dataset → shuffled mini-batches → one epoch */
FIG['epoch']=root=>{const svg=svgOf(root);const m=64,bs=16;const C=['#dae3f3','#fbe5d6','#e2f0d9','#fff2cc'];
  stepper(root,s=>{initSvg(svg,600,300);const r=rng(11);const perm=[...Array(m).keys()];if(s>=1)perm.sort(()=>r()-0.5);
    T(svg,10,20,s===0?'training set: 64 examples (one square = one row of X)':'shuffle, then cut into 4 mini-batches of 16','lab','start');
    for(let i=0;i<m;i++){const row=Math.floor(i/8),col=i%8;const b=Math.floor(perm.indexOf(i)/bs);const x=10+col*30,y=34+row*30;const active=s>=2&&s-2===b;
      E('rect',{x:x,y:y,width:27,height:27,rx:3,fill:s===0?'#c5e0b4':C[b],stroke:active?'#c00000':'#9a9a9a','stroke-width':active?2.5:0.8},svg);T(svg,x+13.5,y+18,String(i),'').style.fontSize='11px'}
    if(s>=1){arrowPx(svg,262,150,300,150,'ln sk','fk');[0,1,2,3].forEach(b=>{const on=s>=2&&s-2===b;const y=34+b*62;E('rect',{x:310,y:y,width:280,height:52,rx:6,fill:C[b],stroke:on?'#c00000':'#7f7f7f','stroke-width':on?2.5:1},svg);
      T(svg,450,y+22,'mini-batch '+(b+1)+': 16 rows','lab');T(svg,450,y+41,on?'forward → loss → backward → update':(s>=2&&b<s-2?'done: 1 update':'1 gradient step'),'')})}
    T(svg,300,292,s===0?'':s===1?'4 mini-batches = 4 parameter updates = 1 epoch':'iteration '+(s-1)+' of 4'+(s===5?': epoch over, shuffle again':''),'','middle')})};
FIG['gd-variants']=root=>{const r=rng(8);const m=200;const D=[];for(let i=0;i<m;i++){const x=randn(r);D.push([x,2+3*x+1.5*randn(r)])}
  const J=(a,b)=>D.reduce((s,[x,y])=>s+(a+b*x-y)**2,0)/(2*m);const grad=(a,b,idx)=>{let g0=0,g1=0;idx.forEach(i=>{const [x,y]=D[i];const e=a+b*x-y;g0+=e;g1+=e*x});return [g0/idx.length,g1/idx.length]};
  const all=[...Array(m).keys()];function run(bs,lr,epochs){let a=-2,b=-1.5;const path=[[a,b]];const rr=rng(3);for(let ep=0;ep<epochs;ep++){const perm=all.slice().sort(()=>rr()-0.5);for(let s=0;s<m;s+=bs){const g=grad(a,b,perm.slice(s,s+bs));a-=lr*g[0];b-=lr*g[1];path.push([a,b])}}return path}
  const paths={batch:run(200,0.25,30),sgd:run(1,0.02,2),mini:run(16,0.1,3)};const m2={l:34,r:10,t:10,b:30};const xr=[-3,5];
  const P=Plot(svgOf(root),{w:560,h:400,x:xr,y:equalY(560,400,m2,xr,1.4),m:m2});P.axes({xt:[-2,0,2,4],yt:[-2,0,2,4],xl:'θ₀ (intercept)',yl:'θ₁ (slope)'});
  const jm=J(2,3);[0.3,1,2.5,5,9,15].forEach(f=>{const pts=[];for(let i=0;i<=160;i++){const t=2*Math.PI*i/160;let lo=0,hi=12;const u=Math.cos(t),v=Math.sin(t);for(let k=0;k<40;k++){const mid=(lo+hi)/2;if(J(2+mid*u,3+mid*v)-jm<f)lo=mid;else hi=mid}pts.push([2+lo*u,3+lo*v])}P.path(pts,'ln thin sb',P.bgc).setAttribute('opacity','0.45')});
  P.dot(2,3,5,'fk',P.bg);let k='batch';const btns=root.querySelectorAll('.seg button');const info={batch:'all 200 samples per step: smooth, slow per step',sgd:'1 sample per step: many cheap, noisy updates',mini:'16 samples per step: the practical compromise'};
  function draw(){P.clear();const p=paths[k];P.path(p,'ln thin sr');P.dot(p[0][0],p[0][1],6,'fk');setR(root,'n',p.length-1);setR(root,'i',info[k]);setR(root,'j',fmt(J(...p[p.length-1]),3))}
  btns.forEach(b=>b.addEventListener('click',()=>{k=b.dataset.k;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));draw()};
/* momentum: gradient descent vs momentum on a narrow valley, with β */
FIG['momentum']=root=>{const f=(x,y)=>0.5*(0.08*x*x+2*y*y);const g=(x,y)=>[0.08*x,2*y];const m2={l:34,r:10,t:10,b:30};const xr=[-5.5,1.5];
  const P=Plot(svgOf(root),{w:600,h:340,x:xr,y:equalY(600,340,m2,xr,0),m:m2});P.axes({xt:[-5,-4,-3,-2,-1,0,1],yt:[-1,0,1],xl:'w₁ (flat direction)',yl:'w₂ (steep)'});
  [0.05,0.2,0.5,1,1.8,2.8].forEach(l=>{const pts=[];for(let i=0;i<=120;i++){const t=2*Math.PI*i/120;pts.push([Math.sqrt(2*l/0.08)*Math.cos(t),Math.sqrt(2*l/2)*Math.sin(t)])}P.path(pts,'ln thin sb',P.bgc).setAttribute('opacity','0.4')});P.dot(0,0,5,'fk',P.bg);
  const ib=q(root,'b');const lr=0.9;
  function run(beta){let x=-5,y=1.0,vx=0,vy=0;const p=[[x,y]];for(let t=0;t<40;t++){const [gx,gy]=g(x,y);vx=beta*vx+(1-beta)*gx;vy=beta*vy+(1-beta)*gy;x-=lr*vx;y-=lr*vy;if(Math.abs(x)>60)break;p.push([x,y])}return p}
  function draw(){const beta=+ib.value;setV(root,'b',fmt(beta,2));P.clear();const p0=run(0),p1=run(beta);const a=P.path(p0,'ln thin');a.setAttribute('stroke','#7f7f7f');a.setAttribute('stroke-width','2');const b=P.path(p1,'ln thin');b.setAttribute('stroke','#c00000');b.setAttribute('stroke-width','2.4');
    p1.forEach((pt,i)=>{if(i%2===0)P.dot(pt[0],pt[1],2.6,'fr')});const e0=p0[p0.length-1],e1=p1[p1.length-1];setR(root,'l0',fmt(f(e0[0],e0[1]),3));setR(root,'l1',fmt(f(e1[0],e1[1]),3));setR(root,'win',Math.round(1/(1-beta))+' steps')}
  ib.addEventListener('input',draw);draw()};
/* RMSProp: two parameters with very different gradient scales */
FIG['rms-scale']=root=>{const svg=initSvg(svgOf(root),560,250);const r=rng(2);const g1=[...Array(12)].map(()=>0.02+0.01*randn(r)),g2=[...Array(12)].map(()=>1+0.4*randn(r));
  const rms=a=>Math.sqrt(a.reduce((s,v)=>s+v*v,0)/a.length);const s1=rms(g1),s2=rms(g2);
  const P=Plot(svg,{at:[0,0],w:280,h:250,x:[0,13],y:[0,1.8],m:{l:40,r:8,t:26,b:34}});P.axes({xt:[1,6,12],yt:[0,1],xl:'step',yl:'|gradient|'});T(P.root,150,16,'raw gradients','lab');
  g1.forEach((v,i)=>P.rect(i+0.6,0,i+1.4,Math.abs(v),'fb'));g2.forEach((v,i)=>{const rc=P.rect(i+0.6,0,i+1.4,Math.abs(v),'fo');rc.setAttribute('opacity','0.6')});P.text(3,1.6,'w₂: large, ≈1','', 'start');P.text(3,0.25,'w₁: tiny, ≈0.02','', 'start');
  const Q=Plot(svg,{at:[290,0],w:270,h:250,x:[0,13],y:[0,1.8],m:{l:40,r:8,t:26,b:34}});Q.axes({xt:[1,6,12],yt:[0,1],xl:'step',yl:'|g| / √s'});T(Q.root,140,16,'divided by the running RMS','lab');
  g1.forEach((v,i)=>Q.rect(i+0.6,0,i+1.4,Math.abs(v)/s1,'fb'));g2.forEach((v,i)=>{const rc=Q.rect(i+0.6,0,i+1.4,Math.abs(v)/s2,'fo');rc.setAttribute('opacity','0.6')});Q.text(1,1.6,'both move at a similar speed','', 'start')};
FIG['optim']=root=>{const f=(x,y)=>0.5*(0.08*x*x+2*y*y);const g=(x,y)=>[0.08*x,2*y];const m2={l:34,r:10,t:10,b:30};const xr=[-5.5,1.5];
  const P=Plot(svgOf(root),{w:600,h:380,x:xr,y:equalY(600,380,m2,xr,0),m:m2});P.axes({xt:[-5,-4,-3,-2,-1,0,1],yt:[-2,-1,0,1,2],xl:'w₁',yl:'w₂'});
  [0.05,0.2,0.5,1,1.8,2.8].forEach(l=>{const pts=[];for(let i=0;i<=120;i++){const t=2*Math.PI*i/120;pts.push([Math.sqrt(2*l/0.08)*Math.cos(t),Math.sqrt(2*l/2)*Math.sin(t)])}P.path(pts,'ln thin sb',P.bgc).setAttribute('opacity','0.4')});P.dot(0,0,5,'fk',P.bg);
  const cols={gd:'#7f7f7f',mom:'#4472c4',rms:'#70ad47',adam:'#c00000'};const inp=q(root,'lr');
  function run(kind,lr){let x=-5,y=1.2;const p=[[x,y]];let vx=0,vy=0,sx=0,sy=0,mx=0,my=0;for(let t=1;t<=60;t++){const [gx,gy]=g(x,y);
      if(kind==='gd'){x-=lr*gx;y-=lr*gy}else if(kind==='mom'){vx=0.9*vx+gx;vy=0.9*vy+gy;x-=0.1*lr*vx;y-=0.1*lr*vy}
      else if(kind==='rms'){sx=0.9*sx+0.1*gx*gx;sy=0.9*sy+0.1*gy*gy;x-=lr*0.3*gx/(Math.sqrt(sx)+1e-8);y-=lr*0.3*gy/(Math.sqrt(sy)+1e-8)}
      else{mx=0.9*mx+0.1*gx;my=0.9*my+0.1*gy;sx=0.999*sx+0.001*gx*gx;sy=0.999*sy+0.001*gy*gy;const bx=mx/(1-0.9**t),by=my/(1-0.9**t),cx=sx/(1-0.999**t),cy=sy/(1-0.999**t);x-=lr*0.3*bx/(Math.sqrt(cx)+1e-8);y-=lr*0.3*by/(Math.sqrt(cy)+1e-8)}
      if(Math.abs(x)>50||Math.abs(y)>50)break;p.push([x,y])}return p}
  function draw(){const lr=Math.pow(10,+inp.value);setV(root,'lr',fmt(lr,3));P.clear();for(const k of ['gd','mom','rms','adam']){const p=run(k,lr);const pa=P.path(p,'ln thin');pa.setAttribute('stroke',cols[k]);pa.setAttribute('stroke-width','2.2');
      p.forEach((q2,i)=>{if(i%3===0){const d=P.dot(q2[0],q2[1],2.6,'');d.setAttribute('fill',cols[k])}});const e=p[p.length-1];setR(root,k,fmt(f(e[0],e[1]),4))}}inp.addEventListener('input',draw);draw()};
FIG['sched']=root=>{const P=Plot(svgOf(root),{w:500,h:280,x:[0,100],y:[0,1.1],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[0,25,50,75,100],yt:[0,0.5,1],xl:'epoch',yl:'learning rate / α₀'});
  P.fn(e=>1,'ln thin sm dash');P.fn(e=>Math.pow(0.5,Math.floor(e/25)),'ln sb',0,100,400);P.fn(e=>e<8?e/8:0.5*(1+Math.cos(Math.PI*(e-8)/92)),'ln sr',0,100,400);P.fn(e=>e<40?1:e<70?0.3:0.1,'ln sg dot2',0,100,400);
  P.text(98,1,'constant','', 'end',0,-6);P.text(30,0.52,'step decay','', 'start',0,-6);P.text(10,1.02,'warm-up + cosine','', 'start',0,-6);P.text(72,0.12,'reduce on plateau','', 'start',0,-6)};
FIG['curves']=root=>{const svg=initSvg(svgOf(root),960,260);const e=[...Array(41).keys()];
  [['Underfitting: both high',x=>0.62+0.2*Math.exp(-x/8),x=>0.66+0.2*Math.exp(-x/8)],['Good fit',x=>0.12+0.6*Math.exp(-x/6),x=>0.2+0.55*Math.exp(-x/6)],['Overfitting: the gap grows',x=>0.03+0.7*Math.exp(-x/5),x=>0.32+0.45*Math.exp(-x/5)+0.012*Math.max(0,x-8)]].forEach(([lab,tr,va],k)=>{
    const P=Plot(svg,{at:[k*320,0],w:310,h:260,x:[0,40],y:[0,1],m:{l:36,r:8,t:26,b:30}});P.axes({xt:[0,20,40],yt:[0,0.5,1],xl:'epoch',yl:'loss'});T(P.root,160,16,lab,'lab');P.path(e.map(x=>[x,tr(x)]),'ln sb');P.path(e.map(x=>[x,va(x)]),'ln so');
    if(k===0){P.text(30,0.9,'train','', 'end',0,0).style.fill='#4472c4';P.text(30,0.98,'validation','', 'start',4,0).style.fill='#ed7d31'}
    if(k===2){P.line(8,0,8,1,'ln thin sg dash');P.text(8,0.9,'early stopping','', 'start',4,0)}})};
FIG['dropout']=root=>{const svg=svgOf(root);const inp=q(root,'p');let mode='train';const btns=root.querySelectorAll('.seg button');let seed=1;
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
/* BatchNorm vs LayerNorm: which axis is normalized */
FIG['norm-axes']=root=>{const svg=initSvg(svgOf(root),620,250);const cs=22;
  const mat=(x0,title,hi)=>{T(svg,x0+4*cs,18,title,'lab');for(let i=0;i<6;i++)for(let j=0;j<8;j++){const on=hi==='col'?j===2:i===1;E('rect',{x:x0+j*cs,y:30+i*cs,width:cs-1,height:cs-1,fill:on?'#ed7d31':'#dae3f3'},svg)}
    T(svg,x0-6,30+3*cs,'examples','','end').setAttribute('transform','rotate(-90 '+(x0-6)+' '+(30+3*cs)+')');T(svg,x0+4*cs,30+6*cs+16,'features (units)','')};
  mat(40,'BatchNorm: one feature, over the batch','col');mat(340,'LayerNorm: one example, over its features','row');
  T(svg,310,225,'orange = the numbers whose mean and variance are computed (then γ, β per feature)','','middle')};
/* tensor shapes through a small MLP */
FIG['shapes-walk']=root=>{const svg=initSvg(svgOf(root),960,200);const steps=[['input','[B, 1, 28, 28]','#c5e0b4',0],['Flatten','[B, 784]','#e7e6e6',0],['Linear 784→256','[B, 256]','#8ea9db',784*256+256],['ReLU','[B, 256]','#e7e6e6',0],['Dropout 0.2','[B, 256]','#e7e6e6',0],['Linear 256→10','[B, 10]','#8ea9db',256*10+10],['CrossEntropy','scalar','#f4b183',0]];
  steps.forEach(([name,shape,c,np],k)=>{const x=10+k*136;E('rect',{x:x,y:40,width:120,height:60,rx:6,fill:c,stroke:'#404040'},svg);T(svg,x+60,64,name,'lab');T(svg,x+60,86,shape,'mono');if(np)T(svg,x+60,124,np.toLocaleString('en-US')+' params','');if(k<steps.length-1)arrowPx(svg,x+122,70,x+134,70,'ln thin sk','fk')});
  T(svg,480,170,'B = batch size, passes through untouched. Total: 203,530 parameters, 99.9 % of them in the first Linear.','','middle')};
})();
