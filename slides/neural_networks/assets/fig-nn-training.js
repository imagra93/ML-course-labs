/* Figures for 03_training.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,equalY,q,setV,setR,svgOf}=lib;const {drawNet,box,grid,stepper,segs,f2,f3,heat,trainMLP,TT}=window.MLNN;
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
  const P=Plot(svgOf(root),{w:560,h:400,x:xr,y:equalY(560,400,m2,xr,1.4),m:m2});P.axes({xt:[-2,0,2,4],yt:[0,2,4],xl:root.hasAttribute('data-wb')?'b (intercept)':'θ₀ (intercept)',yl:root.hasAttribute('data-wb')?'w (slope)':'θ₁ (slope)'});
  const jm=J(2,3);[0.3,1,2.5,5,9,15].forEach(f=>{const pts=[];for(let i=0;i<=160;i++){const t=2*Math.PI*i/160;let lo=0,hi=12;const u=Math.cos(t),v=Math.sin(t);for(let k=0;k<40;k++){const mid=(lo+hi)/2;if(J(2+mid*u,3+mid*v)-jm<f)lo=mid;else hi=mid}pts.push([2+lo*u,3+lo*v])}P.path(pts,'ln thin sb',P.bgc).setAttribute('opacity','0.45')});
  P.dot(2,3,5,'fk',P.bg);let k='batch';const btns=root.querySelectorAll('.seg button');const info={batch:'all 200 samples per step: smooth, slow per step',sgd:'1 sample per step: many cheap, noisy updates',mini:'16 samples per step: the practical compromise'};
  function draw(){P.clear();const p=paths[k];P.path(p,'ln thin sr');P.dot(p[0][0],p[0][1],6,'fk');setR(root,'n',p.length-1);setR(root,'i',info[k]);setR(root,'j',fmt(J(...p[p.length-1]),3))}
  btns.forEach(b=>b.addEventListener('click',()=>{k=b.dataset.k;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));draw()};
/* the training loop in time: the tiny 2-2-1 network of chapters 1–2 (same starting weights) trained for real on 64 rows
   (class 1 around (−1, 1), class 0 around (1, −1)), mini-batches of 16, α = 1, 3 epochs = 12 iterations.
   Slider t = 0…60: iteration i = ⌈t/5⌉ and stage t − 5(i − 1): 1 mini-batch · 2 forward · 3 loss · 4 backward · 5 update.
   Elements of the slide with data-hl = the current stage get the class "now" ("e": first stage of an epoch, "0": t = 0) */
FIG['train-loop']=root=>{const svg=svgOf(root);const slide=root.closest('.slide')||root;
  const r=rng(3),X=[],Y=[];for(let i=0;i<64;i++){const y=i%2,c=y?[-1,1]:[1,-1];X.push([c[0]+0.8*randn(r),c[1]+0.8*randn(r)]);Y.push(y)}
  /* p = w11 w12 w21 w22 (W⁽¹⁾, w_ij: input i → hidden j) · b1 b2 (b⁽¹⁾) · v1 v2 (W⁽²⁾) · c (b⁽²⁾); tanh hidden, sigmoid output, mean BCE */
  let p=[0.5,-0.3,0.2,0.4,0.1,-0.1,0.7,-0.5,0.2];const rs=rng(22),perms=[],its=[];
  for(let e=0;e<3;e++){const perm=[...Array(64).keys()];for(let i=63;i>0;i--){const j=Math.floor(rs()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}perms.push(perm);
    for(let b=0;b<4;b++){const g=new Array(9).fill(0);let L=0;
      perm.slice(16*b,16*b+16).forEach(k=>{const [x1,x2]=X[k],a=[Math.tanh(x1*p[0]+x2*p[2]+p[4]),Math.tanh(x1*p[1]+x2*p[3]+p[5])],yh=1/(1+Math.exp(-(a[0]*p[6]+a[1]*p[7]+p[8]))),d=(yh-Y[k])/16;
        L-=Math.log(Y[k]?yh:1-yh)/16;g[6]+=d*a[0];g[7]+=d*a[1];g[8]+=d;[0,1].forEach(j=>{const dj=d*p[6+j]*(1-a[j]*a[j]);g[j]+=dj*x1;g[2+j]+=dj*x2;g[4+j]+=dj})});
      const q=p.map((v,n)=>v-g[n]);its.push({e:e,b:b,L:L,g:g,w0:p,w1:q});p=q}}
  const C=['#dae3f3','#fbe5d6','#e2f0d9','#fff2cc'],CS=['#4472c4','#ed7d31','#70ad47','#bf9000'],STAGE=['start','mini-batch','forward','loss','backward','update'];
  const arr=(x1,y1,x2,y2,c,w)=>{E('line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:c,'stroke-width':w},svg);const a=Math.atan2(y2-y1,x2-x1),cs=Math.cos(a),sn=Math.sin(a),L=8+2*w,W=3+w;
    E('polygon',{points:[[x2,y2],[x2-L*cs+W*sn,y2-L*sn-W*cs],[x2-L*cs-W*sn,y2-L*sn+W*cs]].map(q=>q.map(v=>v.toFixed(1)).join(',')).join(' '),fill:c},svg)};
  const label=(x,y,s,c,cls,anchor)=>{const tt=T(svg,x,y,s,cls===undefined?'lab':cls,anchor);if(c)tt.style.fill=c;return tt};
  stepper(root,t=>{initSvg(svg,700,424);const i=Math.max(1,Math.ceil(t/5)),k=t?t-5*(i-1):0,I=its[i-1],e=I.e,b=I.b;
    setV(root,'s',STAGE[k]);
    slide.querySelectorAll('[data-hl]').forEach(el=>{const h=el.dataset.hl;el.classList.toggle('now',t?h===String(k)||(h==='e'&&k===1&&b===0):h==='0')});
    setR(root,'ep',(e+1)+' of 3');setR(root,'mb',t?(b+1)+' of 4':'–');setR(root,'up',String(i-1+(k===5?1:0)));setR(root,'rows',String(16*(i-1+(k>=2?1:0))));
    /* the training set: one square per row, coloured by its mini-batch in this epoch; used mini-batches fade */
    label(14,22,'training set: 64 rows','','lab','start');
    perms[e].forEach((row,pos)=>{const bb=Math.floor(pos/16),cur=t>0&&bb===b;
      E('rect',{x:14+(row%8)*19,y:32+Math.floor(row/8)*19,width:17,height:17,rx:2.5,fill:C[bb],stroke:cur?'#404040':'#9a9a9a','stroke-width':cur?2:0.7,opacity:t>0&&(bb<b||(cur&&k===5))?0.25:1},svg)});
    const st=t===0?['4 mini-batches of 16,','shuffled for epoch 1']:k===5&&b===3?['epoch '+(e+1)+' done:','all 64 rows used once']:k===1&&b===0&&e>0?['epoch '+(e+1)+' of 3:','shuffled again']:['epoch '+(e+1)+' of 3','rows used: '+(16*b+(k===5?16:0))+' of 64'];
    label(14,204,st[0],'#1f1f1f','lab','start');label(14,221,st[1],null,'','start');
    /* mini-batch → network (forward on top, backward below) → loss */
    const bc=t?CS[b]:'#bfbfbf';arr(170,105,266,105,bc,t?3:2);label(218,93,t?'mini-batch '+(b+1):'mini-batches',bc);label(218,124,'16 rows',null,'');
    drawNet(svg,[2,2,1],{x0:290,y0:35,w:210,h:140,r:16,label:(l,n)=>l===0?'x'+'₁₂'[n]:l===1?'a'+'₁₂'[n]:'ŷ',
      edgeStyle:()=>k===2?{stroke:'#4472c4',width:2.4}:k===4?{stroke:'#c00000',width:2.4}:k===5?{stroke:'#ffc000',width:3}:{stroke:'#9dafd6',width:1.2}});
    arr(282,26,512,26,k===2?'#4472c4':'#d0d0d0',k===2?3:2);label(397,16,'forward: the 16 rows at once',k===2?'#4472c4':'#a6a6a6');
    arr(518,105,543,105,k>=3?'#ed7d31':'#bfbfbf',2);
    E('rect',{x:546,y:80,width:96,height:50,rx:6,fill:k===3?'#fbe5d6':'#fff',stroke:k===3?'#ed7d31':'#bfbfbf','stroke-width':k===3?2.5:1.2},svg);
    label(594,99,'loss','#1f1f1f');label(594,121,t&&k>=3?'L = '+f2(I.L):'L = –','#1f1f1f').style.fontWeight='700';label(594,148,'vs their 16 labels',null,'');
    const bw=k===4?'#c00000':'#d0d0d0';E('line',{x1:594,y1:156,x2:594,y2:176,stroke:bw,'stroke-width':k===4?3:2},svg);arr(594,176,282,176,bw,k===4?3:2);
    label(438,193,'backward: one gradient per weight',k===4?'#c00000':'#a6a6a6');
    /* the 9 weights: before, the gradient, after (w − α∇L with α = 1) */
    const cx=n=>310+40*n+4*((n>=4)+(n>=6)+(n>=8));
    [['W^{[1]}',0,4],['b^{[1]}',4,2],['W^{[2]}',6,2],['b^{[2]}',8,1]].forEach(([s,a,n])=>TT(svg,(cx(a)+cx(a+n-1)+38)/2,212,s,''));
    const strip=(y,lab,vals,fill,c,stroke,bold)=>{label(300,y+14,lab,'#1f1f1f','lab','end');vals.forEach((v,n)=>{E('rect',{x:cx(n),y:y,width:38,height:18,fill:fill,stroke:stroke},svg);
      const tt=label(cx(n)+19,y+13.5,f2(v),c,'');tt.style.fontSize='12px';if(bold)tt.style.fontWeight='700'})};
    strip(218,'weights w',I.w0,'#fff',k===5?'#8c8c8c':'#1f1f1f','#bfbfbf');
    if(k>=4)strip(240,'gradient ∇L',I.g,'#fff','#c00000',k===4?'#c00000':'#bfbfbf');
    if(k===5)strip(262,'w − α∇L',I.w1,'#fff2cc','#1f1f1f','#ffc000',true);
    /* the run: the loss of every mini-batch, in its colour, grouped by epoch (with the epoch's mean once it is over) */
    const P=Plot(svg,{at:[0,288],w:700,h:136,x:[0.5,12.5],y:[0,1],m:{l:46,r:12,t:20,b:34}});
    [0,1,2].forEach(n=>{P.rect(0.5+4*n,0,4.5+4*n,1,'',P.bg).setAttribute('fill',n%2?'#efefef':'#f8f8f8');const over=t>=20*(n+1),m=its.slice(4*n,4*n+4).reduce((s,I2)=>s+I2.L,0)/4;
      T(P.root,P.X(2.5+4*n),14,'epoch '+(n+1)+(over?' · mean loss '+f2(m):''),'lab');if(over)P.line(0.6+4*n,m,4.4+4*n,m,'ln thin sk dash')});
    P.axes({xt:[1,2,3,4,5,6,7,8,9,10,11,12],yt:[0,0.5,1],grid:false,xl:'iteration (one mini-batch, one update)',yl:'loss'});
    if(t)P.line(i,0,i,1,'').setAttribute('style','stroke:#ffc000;stroke-width:8;opacity:.35');
    const done=its.filter((I2,n)=>t>=5*n+3);if(done.length>1)P.path(done.map((I2,n)=>[n+1,I2.L]),'ln thin sm');
    done.forEach((I2,n)=>P.dot(n+1,I2.L,5.5,'pt').setAttribute('fill',CS[I2.b]))})};
/* momentum (PyTorch form: v ← βv + g, θ ← θ − αv) vs plain gradient descent on a very narrow valley */
FIG['momentum']=root=>{const L1=0.01,L2=2,lr=0.9,T=60;const f=(x,y)=>0.5*(L1*x*x+L2*y*y);const m2={l:34,r:10,t:10,b:30};const xr=[-5.6,1.6];
  const P=Plot(svgOf(root),{w:600,h:340,x:xr,y:equalY(600,340,m2,xr,0),m:m2});P.axes({xt:[-5,-4,-3,-2,-1,0,1],yt:[-1,0,1],xl:'w₁ (flat direction)',yl:'w₂ (steep)'});
  [0.002,0.01,0.03,0.08,0.2,0.5,1].forEach(l=>{const pts=[];for(let i=0;i<=160;i++){const t=2*Math.PI*i/160;pts.push([Math.sqrt(2*l/L1)*Math.cos(t),Math.sqrt(2*l/L2)*Math.sin(t)])}P.path(pts,'ln thin sb',P.bgc).setAttribute('opacity','0.4')});P.dot(0,0,5,'fk',P.bg);
  const ib=q(root,'b');
  function run(beta){let x=-5,y=0.4,vx=0,vy=0;const p=[[x,y]];for(let t=0;t<T;t++){vx=beta*vx+L1*x;vy=beta*vy+L2*y;x-=lr*vx;y-=lr*vy;if(Math.abs(x)>60)break;p.push([x,y])}return p}
  function draw(){const beta=+ib.value;setV(root,'b',fmt(beta,2));P.clear();const p0=run(0),p1=run(beta);const a=P.path(p0,'ln thin');a.setAttribute('stroke','#7f7f7f');a.setAttribute('stroke-width','2');p0.forEach((pt,i)=>{if(i%3===0){const d=P.dot(pt[0],pt[1],2.2,'');d.setAttribute('fill','#7f7f7f')}});
    const b=P.path(p1,'ln thin');b.setAttribute('stroke','#c00000');b.setAttribute('stroke-width','2.4');p1.forEach((pt,i)=>{if(i%2===0)P.dot(pt[0],pt[1],2.6,'fr')});
    const e0=p0[p0.length-1],e1=p1[p1.length-1];setR(root,'l0',fmt(f(e0[0],e0[1]),4));setR(root,'l1',fmt(f(e1[0],e1[1]),4));setR(root,'win','×'+fmt(1/(1-beta),1))}
  ib.addEventListener('input',draw);draw()};
/* exponential moving average of a noisy signal, with and without bias correction */
FIG['ema']=root=>{const r=rng(4);const T=80;const g=[];for(let t=1;t<=T;t++){const mean=t<=45?1:-0.5;g.push(mean+0.9*randn(r))}
  const P=Plot(svgOf(root),{w:600,h:330,x:[0,T+1],y:[-3,3.2],m:{l:40,r:12,t:14,b:36}});P.axes({xt:[0,20,40,60,80],yt:[-2,-1,0,1,2,3],xl:'step t',yl:'gradient'});P.line(0,0,T+1,0,'ax',P.bg);
  g.forEach((v,i)=>P.dot(i+1,v,2.6,'fm',P.bg));P.path([[0,1],[45,1]],'ln thin sg dash',P.bg);P.path([[45,-0.5],[T+1,-0.5]],'ln thin sg dash',P.bg);P.text(79,-0.5,'true mean','', 'end',0,16,P.bg).style.fill='#548235';
  const ib=q(root,'b');
  function draw(){const beta=+ib.value;setV(root,'b',fmt(beta,2));P.clear();let m=0;const raw=[[0,0]],cor=[];g.forEach((v,i)=>{m=beta*m+(1-beta)*v;raw.push([i+1,m]);cor.push([i+1,m/(1-Math.pow(beta,i+1))])});
    const a=P.path(raw,'ln');a.setAttribute('stroke','#c00000');const b=P.path(cor,'ln dash');b.setAttribute('stroke','#4472c4');
    setR(root,'win','≈ '+Math.round(1/(1-beta))+' steps');setR(root,'m1',fmt(raw[1][1],2));setR(root,'c1',fmt(cor[0][1],2))}
  ib.addEventListener('input',draw);draw()};
/* RMSProp: two parameters with very different gradient scales, before and after dividing by the running RMS */
FIG['rms-scale']=root=>{const svg=initSvg(svgOf(root),600,250);const r=rng(2);const n=10;const g1=[...Array(n)].map(()=>Math.abs(0.02+0.007*randn(r))),g2=[...Array(n)].map(()=>Math.abs(1+0.35*randn(r)));
  const rms=a=>Math.sqrt(a.reduce((s,v)=>s+v*v,0)/a.length);const s1=rms(g1),s2=rms(g2);const lg=v=>Math.log10(Math.max(v,0.003));
  const P=Plot(svg,{at:[0,0],w:295,h:250,x:[0.3,n+0.7],y:[-2.5,0.5],m:{l:44,r:6,t:26,b:34}});P.axes({xt:[1,5,10],yt:[-2,-1,0],fy:v=>v===0?'1':v===-1?'0.1':'0.01',xl:'step',yl:'|gradient| (log)'});T(P.root,160,16,'raw gradients: 50× apart','lab');
  g1.forEach((v,i)=>P.rect(i+1-0.36,-2.5,i+1-0.02,lg(v),'fb'));g2.forEach((v,i)=>P.rect(i+1+0.02,-2.5,i+1+0.36,lg(v),'fo'));
  const Q=Plot(svg,{at:[305,0],w:295,h:250,x:[0.3,n+0.7],y:[0,1.8],m:{l:44,r:6,t:26,b:34}});Q.axes({xt:[1,5,10],yt:[0,0.5,1,1.5],xl:'step',yl:'|g| / √s'});T(Q.root,160,16,'divided by their running RMS','lab');
  g1.forEach((v,i)=>Q.rect(i+1-0.36,0,i+1-0.02,v/s1,'fb'));g2.forEach((v,i)=>Q.rect(i+1+0.02,0,i+1+0.36,v/s2,'fo'));Q.line(0.3,1,n+0.7,1,'ln thin sm dash');
  const lgd=E('g',{},svg);E('rect',{x:360,y:30,width:12,height:12,fill:'#4472c4'},lgd);T(lgd,378,40,'w₁ (tiny gradients)','','start');E('rect',{x:480,y:30,width:12,height:12,fill:'#ed7d31'},lgd);T(lgd,498,40,'w₂ (large)','','start')};
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
    const P=Plot(svg,{at:[k*320,0],w:310,h:260,x:[0,40],y:[0,1],m:{l:50,r:8,t:26,b:40}});P.axes({xt:[0,20,40],yt:[0,0.5,1],xl:'epoch',yl:'loss'});T(P.root,160,16,lab,'lab');P.path(e.map(x=>[x,tr(x)]),'ln sb');P.path(e.map(x=>[x,va(x)]),'ln so');
    if(k===0){P.text(30,0.9,'train','', 'end',0,0).style.fill='#4472c4';P.text(30,0.98,'validation','', 'start',4,0).style.fill='#ed7d31'}
    if(k===2){P.line(8,0,8,1,'ln thin sg dash');P.text(8,0.9,'early stopping','', 'start',4,0)}})};
FIG['dropout']=root=>{const svg=svgOf(root);const inp=q(root,'p');let mode='train';const btns=root.querySelectorAll('.seg button');let seed=1;
  function draw(){const p=+inp.value;setV(root,'p',fmt(p,2));initSvg(svg,560,320);const drop=new Set();const rr=rng(seed);const sizes=[3,6,6,1];
    if(mode==='train')for(let l=1;l<=2;l++)for(let i=0;i<sizes[l];i++)if(rr()<p)drop.add(l+'-'+i);
    drawNet(svg,sizes,{x0:50,y0:30,w:460,h:260,r:14,drop:drop});T(svg,280,312,mode==='train'?'Training: a new random set of units is switched off at every mini-batch':'Validation / prediction: all units are used, and nothing is rescaled','','middle');setR(root,'n',drop.size+' of 12')}
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
FIG['shapes-walk']=root=>{const svg=initSvg(svgOf(root),980,200);const steps=[['input','[B, 1, 28, 28]','#c5e0b4',0],['Flatten','[B, 784]','#e7e6e6',0],['Linear 784→256','[B, 256]','#8ea9db',784*256+256],['ReLU','[B, 256]','#e7e6e6',0],['Dropout 0.2','[B, 256]','#e7e6e6',0],['Linear 256→10','[B, 10]','#8ea9db',256*10+10],['CrossEntropy','scalar','#f4b183',0]];
  steps.forEach(([name,shape,c,np],k)=>{const x=6+k*139;E('rect',{x:x,y:40,width:128,height:60,rx:6,fill:c,stroke:'#404040'},svg);T(svg,x+64,64,name,'lab');T(svg,x+64,86,shape,'mono');if(np)T(svg,x+64,124,np.toLocaleString('en-US')+' params','');if(k<steps.length-1)arrowPx(svg,x+129,70,x+138,70,'ln thin sk','fk')});
  T(svg,490,170,'B = batch size, passes through untouched. Total: 203,530 parameters, 98.7 % of them in the first Linear.','','middle')};
/* overfitting and weight decay: a 2-24-24-1 tanh network on 40 noisy "moons" points */
function moons(n,seed,noise){const r=rng(seed);const X=[],y=[];for(let i=0;i<n;i++){const c=i%2;const t=Math.PI*r();let a,b;if(c===0){a=Math.cos(t);b=Math.sin(t)}else{a=1-Math.cos(t);b=0.5-Math.sin(t)}a+=noise*randn(r);b+=noise*randn(r);X.push([(a-0.5)/1.1,(b-0.25)/1.1]);y.push(c)}return {X,y}}
FIG['overfit-l2']=root=>{const tr=moons(40,5,0.28),te=moons(600,99,0.28);const LAM=[0,0.001,0.003,0.01,0.03,0.1];const cache={};const inp=q(root,'l');
  const P=Plot(svgOf(root),{w:420,h:360,x:[-1.25,1.45],y:[-1.05,1.25],m:{l:6,r:6,t:6,b:6}});const acc=(m,D)=>D.X.filter((x,i)=>(m.predict(x)>=0.5?1:0)===D.y[i]).length/D.X.length;
  function draw(){const k=+inp.value;const lam=LAM[k];setV(root,'l',lam===0?'0':String(lam));if(!cache[k])cache[k]=trainMLP(tr.X,tr.y,[24,24],'tanh',1500,0.01,3,lam);const m=cache[k];P.clear();const N=40;
    for(let a=0;a<N;a++)for(let b=0;b<N;b++){const x=[-1.25+2.7*(a+0.5)/N,-1.05+2.3*(b+0.5)/N];const p=m.predict(x);const rc=P.rect(-1.25+2.7*a/N,-1.05+2.3*b/N,-1.25+2.7*(a+1)/N,-1.05+2.3*(b+1)/N,p>=0.5?'fb':'fo');rc.setAttribute('opacity',(0.1+0.45*Math.abs(p-0.5)*2).toFixed(2))}
    te.X.forEach((x,i)=>{const d=P.dot(x[0],x[1],1.6,te.y[i]?'fb':'fo');d.setAttribute('opacity','0.35')});tr.X.forEach((x,i)=>P.dot(x[0],x[1],5,'pt '+(tr.y[i]?'fb':'fo')));
    const a1=acc(m,tr),a2=acc(m,te);setR(root,'tr',fmt(a1,3));setR(root,'te',fmt(a2,3));let w2=0;m.W.forEach(W=>W.forEach(rw=>rw.forEach(v=>w2+=v*v)));setR(root,'w',fmt(Math.sqrt(w2),1));
    setR(root,'vd',k===0?'overfitting':k===2?'about right':k>=4?'underfitting':k===1?'still overfitting':'slightly too simple')}
  inp.addEventListener('input',draw);draw()};
/* EMA, step by step: 30 days of temperatures, the weight each past day gets in today's average (v₀ = 0 takes the rest), raw or bias-corrected.
   Controls: slider t (day), seg data-b (β), seg data-c (0 = raw, 1 = with the bias correction) */
const TEMPS=[10,12,11,14,13,15,14,16,15,17,19,18,17,19,20,18,21,20,22,21,19,22,23,21,24,22,23,25,24,26];
FIG['ema-steps']=root=>{const n=TEMPS.length;const svg=initSvg(svgOf(root),600,320);
  const P=Plot(svg,{at:[0,0],w:600,h:176,x:[-0.8,n+0.6],y:[0,28],m:{l:44,r:12,t:10,b:34}});P.axes({xt:[0,5,10,15,20,25,30],yt:[0,7,14,21,28],xl:'day t',yl:'temperature (°C)'});
  TEMPS.forEach((v,i)=>P.dot(i+1,v,3.4,'fm',P.bg));let Q=null;const it=q(root,'t');
  const gb=segs(root,'b',draw),gc=segs(root,'c',draw);
  function draw(){const t=+it.value,b=+(gb()||0.9),c=gc()==='1';setV(root,'t',t);
    let v=0;const raw=[[0,0]],cor=[];TEMPS.slice(0,t).forEach((x,i)=>{v=b*v+(1-b)*x;raw.push([i+1,v]);cor.push([i+1,v/(1-Math.pow(b,i+1))])});
    P.clear();P.line(t,0,t,28,'ln thin sm dash');P.path(raw,'ln').setAttribute('stroke','#c00000');P.dot(t,raw[t][1],5,'fr pt');
    if(c){P.path(cor,'ln dash').setAttribute('stroke','#4472c4');P.dot(t,cor[t-1][1],5,'fb pt')}P.dot(t,TEMPS[t-1],5,'fk');
    const s=1-Math.pow(b,t);const w=[Math.pow(b,t)];for(let k=1;k<=t;k++)w.push((1-b)*Math.pow(b,t-k));
    const top=Math.max(w[0],...w.slice(1).map(x=>c?x/s:x))*1.2;if(Q)Q.root.remove();
    Q=Plot(svg,{at:[0,176],w:600,h:144,x:[-0.8,n+0.6],y:[0,top],m:{l:44,r:12,t:16,b:32}});
    Q.axes({xt:[0,5,10,15,20,25,30],fx:k=>k?k:'v₀',yt:[0,top/2.4,top/1.2],fy:y=>fmt(y,2),xl:'weight of each day in vₜ (gray: the weight left on v₀ = 0)'});
    w.forEach((x,k)=>{if(c&&!k)return;Q.rect(k-0.36,0,k+0.36,c?x/s:x,c?'fb':k?'fr':'fm').setAttribute('opacity',k?'0.8':'0.6')});
    Q.text(0.7,top*0.86,c?'v₀ = 0: weight 0 after the correction':'v₀ = 0 keeps '+Math.round(100*w[0])+' % of the weight','', 'start');
    setR(root,'x',TEMPS[t-1]+' °C');setR(root,'v',fmt(raw[t][1],2));setR(root,'s',fmt(s,3));setR(root,'vh',fmt(cor[t-1][1],2))}
  it.addEventListener('input',draw);draw()};
/* Data augmentation on 28×28 pictures (Fashion-MNIST style, in colour). Every click on a transformation draws new random parameters;
   the strip keeps the last 8 versions. seg data-s: picture; seg data-op: transformation. Flipping the digit changes its label. */
function augPics(){const N=28;const img=()=>[...Array(N)].map(()=>[...Array(N)].map(()=>[0,0,0]));
  const inPoly=(x,y,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,yi]=P[i],[xj,yj]=P[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
  const shirt=img(),boot=img(),seven=img();
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const px=x+0.5,py=y+0.5;
    const body=px>=9&&px<=19&&py>=7&&py<=25,sl=inPoly(px,py,[[9.5,7],[3.5,11],[6,15],[9.5,12.5]])||inPoly(px,py,[[18.5,7],[24.5,11],[22,15],[18.5,12.5]]);
    if((body||sl)&&((px-14)/2.6)**2+((py-6.6)/2)**2>=1){let c=[0.27,0.45,0.85];if(py>=15&&py<17)c=[0.95,0.95,0.95];if(px>=10.5&&px<=13&&py>=9&&py<=11.5)c=[0.93,0.49,0.19];shirt[y][x]=c}
    const shaft=px>=6&&px<=13&&py>=4&&py<=21,foot=px>=6&&px<=21&&py>=15&&py<=21,toe=((px-21)/4.5)**2+((py-18.5)/3)**2<1&&py<=21;
    if(shaft||foot||toe){let c=[0.6,0.36,0.16];if(py<5.5)c=[0.42,0.24,0.1];if(px>=10.5&&px<=12.5&&[8,11,14].some(l=>Math.abs(py-l)<0.6))c=[0.92,0.86,0.7];boot[y][x]=c}
    if(px>=5&&px<=25.5&&py>21&&py<=23.5)boot[y][x]=[0.3,0.3,0.3];
    const dx=12-20.5,dy=23.5-6,u=Math.max(0,Math.min(1,((px-20.5)*dx+(py-6)*dy)/(dx*dx+dy*dy))),dist=Math.hypot(px-20.5-u*dx,py-6-u*dy);
    const ink=Math.max(px>=7&&px<=21&&py>=5&&py<=7.5?1:0,Math.min(1,Math.max(0,(2.3-dist)/0.7)));seven[y][x]=[ink,ink,ink]}
  return {shirt,boot,seven}}
FIG['aug-play']=root=>{const N=28,svg=initSvg(svgOf(root),600,330);const PICS=augPics(),NAME={shirt:'T-shirt',boot:'ankle boot',seven:'7'},ART={shirt:'a',boot:'an',seven:'a'};const r=rng(7);
  const sample=(I,u,v)=>{const x0=Math.floor(u-0.5),y0=Math.floor(v-0.5),fx=u-0.5-x0,fy=v-0.5-y0,o=[0,0,0];
    [[0,0,(1-fx)*(1-fy)],[1,0,fx*(1-fy)],[0,1,(1-fx)*fy],[1,1,fx*fy]].forEach(([a,b,w])=>{const xx=x0+a,yy=y0+b;if(xx<0||yy<0||xx>=N||yy>=N)return;for(let c=0;c<3;c++)o[c]+=w*I[yy][xx][c]});return o};
  const warp=(I,f)=>[...Array(N)].map((_,y)=>[...Array(N)].map((_,x)=>{const [u,v]=f(x+0.5,y+0.5);return sample(I,u,v)}));
  const each=(I,f)=>I.map(row=>row.map(p=>f(p.slice())));const cl=v=>Math.max(0,Math.min(1,v));
  const OPS={
    flip:I=>[I.map(row=>row.slice().reverse()),'horizontal flip'],
    rotate:I=>{const a=(r()<0.5?-1:1)*(6+14*r()),t=a*Math.PI/180,c=Math.cos(t),s=Math.sin(t);return [warp(I,(x,y)=>[14+c*(x-14)+s*(y-14),14-s*(x-14)+c*(y-14)]),'rotate '+(a>0?'+':'−')+Math.abs(a).toFixed(0)+'°']},
    crop:I=>{const k=0.62+0.22*r(),ox=N*(1-k)*r(),oy=N*(1-k)*r();return [warp(I,(x,y)=>[ox+x*k,oy+y*k]),'crop '+Math.round(100*k)+' % of the side, resized to 28 × 28']},
    colour:(I,gray)=>{const b=1+(r()<0.5?-1:1)*(0.15+0.3*r()),h=(r()<0.5?-1:1)*(30+70*r()),t=h*Math.PI/180,c=Math.cos(t),s=Math.sin(t),k=1/3,q3=Math.sqrt(k);
      const M=[[c+(1-c)*k,k*(1-c)-q3*s,k*(1-c)+q3*s],[k*(1-c)+q3*s,c+k*(1-c),k*(1-c)-q3*s],[k*(1-c)-q3*s,k*(1-c)+q3*s,c+k*(1-c)]];
      return [each(I,p=>M.map(row=>cl(b*(row[0]*p[0]+row[1]*p[1]+row[2]*p[2])))),'brightness ×'+b.toFixed(2)+(gray?'':', hue '+(h>0?'+':'−')+Math.abs(h).toFixed(0)+'°')]},
    noise:I=>[each(I,p=>{const e=0.22*randn(r);return p.map(v=>cl(v+e))}),'Gaussian noise, σ = 0.22'],
    cutout:I=>{const k=8+Math.floor(4*r()),x0=Math.floor((N-k)*r()),y0=Math.floor((N-k)*r());return [I.map((row,y)=>row.map((p,x)=>x>=x0&&x<x0+k&&y>=y0&&y<y0+k?[0.5,0.5,0.5]:p)),'cut-out: a '+k+' × '+k+' gray square']}};
  const draw=(g,I,x0,y0,cs)=>{I.forEach((row,y)=>row.forEach((p,x)=>E('rect',{x:x0+x*cs,y:y0+y*cs,width:cs+0.3,height:cs+0.3,fill:'rgb('+p.map(v=>Math.round(255*v)).join(',')+')'},g)))};
  const gpic=E('g',{'shape-rendering':'crispEdges'},svg),ghist=E('g',{'shape-rendering':'crispEdges'},svg),gtxt=E('g',{},svg);let hist=[];
  T(svg,128,16,'what the network gets: 28 × 28 pixels','lab');T(svg,356,16,'original','lab');T(svg,300,262,'the last 8 versions it saw (one per epoch)','lab');
  const gs=segs(root,'s',()=>{hist=[];apply()}),go=segs(root,'op',apply);
  function apply(){const s=gs()||'shirt',op=go()||'none',I0=PICS[s],gray=s==='seven';let I=I0,done=[],flipped=false;
    if(op==='random'){const pick=[['flip',0.5],['crop',0.7],['rotate',0.7],['colour',0.7],['noise',0.3],['cutout',0.3]].filter(([,p])=>r()<p).map(([o])=>o);if(!pick.length)pick.push('rotate');
      pick.forEach(o=>{const [J,d]=OPS[o](I,gray);I=J;done.push(d);if(o==='flip')flipped=true})}
    else if(op!=='none'){const [J,d]=OPS[op](I,gray);I=J;done.push(d);flipped=op==='flip'}
    const bad=flipped&&s==='seven';if(op!=='none'){hist.push({I,bad});if(hist.length>8)hist.shift()}
    gpic.innerHTML='';draw(gpic,I,16,26,8);E('rect',{x:16,y:26,width:224,height:224,fill:'none',stroke:bad?'#c00000':'#7f7f7f','stroke-width':bad?4:1},gpic);
    draw(gpic,I0,300,26,4);E('rect',{x:300,y:26,width:112,height:112,fill:'none',stroke:'#7f7f7f'},gpic);
    gtxt.innerHTML='';T(gtxt,300,176,'label: '+NAME[s],'lab big','start');
    const ok=T(gtxt,300,204,bad?'✗ not a 7 any more: a wrong label':'✓ still '+ART[s]+' '+NAME[s]+': same label','lab','start');ok.style.fill=bad?'#c00000':'#548235';
    ghist.innerHTML='';hist.forEach((h,k)=>{const x0=18+k*72;draw(ghist,h.I,x0,268,2.2);E('rect',{x:x0,y:268,width:61.6,height:61.6,fill:'none',stroke:h.bad?'#c00000':'#bfbfbf','stroke-width':h.bad?3:1},ghist)});
    setR(root,'ops',op==='none'?'nothing (the original)':done.join(' · '));setR(root,'lab',bad?'wrong!':'kept')}
  apply()};
/* Learning curves you can steer: model size × one remedy. Schematic shapes (not a real run).
   seg data-m: small | right | big; seg data-fx: none | data (more data or augmentation) | reg (weight decay, dropout) | stop (early stopping) */
FIG['curves-play']=root=>{const E0=60,ep=[...Array(E0+1).keys()];
  const base={small:{tf:0.55,ta:0.30,tt:6,vf:0.60,va:0.30,vt:6,rise:0},right:{tf:0.12,ta:0.70,tt:8,vf:0.20,va:0.65,vt:8,rise:0},big:{tf:0.02,ta:0.80,tt:5,vf:0.30,va:0.55,vt:5,rise:0.007}};
  const fix={data:{small:{tf:0.02},right:{tf:0.02,vf:-0.04},big:{tf:0.07,vf:-0.10,rise:-0.0062}},reg:{small:{tf:0.06,vf:0.05},right:{tf:0.04,vf:-0.01},big:{tf:0.12,vf:-0.08,rise:-0.0065}}};
  const P=Plot(svgOf(root),{w:560,h:250,x:[0,E0],y:[0,1],m:{l:44,r:14,t:14,b:38}});P.axes({xt:[0,10,20,30,40,50,60],yt:[0,0.5,1],xl:'epoch',yl:'loss'});P.text(60,0.95,'train','lab','end',-90,0,P.bg).style.fill='#4472c4';P.text(60,0.95,'validation','lab','end',-4,0,P.bg).style.fill='#ed7d31';
  const gm=segs(root,'m',draw),gr=segs(root,'fx',draw);
  function draw(){const m=gm()||'big',rm=gr()||'none',p=Object.assign({},base[m]),d=(fix[rm]||{})[m]||{};Object.keys(d).forEach(k=>{p[k]+=d[k]});
    const tr=e=>p.tf+p.ta*Math.exp(-e/p.tt),va=e=>p.vf+p.va*Math.exp(-e/p.vt)+p.rise*Math.max(0,e-10);let best=0;ep.forEach(e=>{if(va(e)<va(best))best=e});
    const stop=rm==='stop'&&best<E0,end=stop?best:E0;P.clear();P.path(ep.map(e=>[e,tr(e)]),'ln sb');P.path(ep.map(e=>[e,va(e)]),'ln so');
    if(rm==='stop'){P.line(best,0,best,1,'ln thin sg dash');P.text(best,0.94,stop?'stop here, keep epoch '+best:'no rise: nothing to stop','', stop?'start':'end',stop?5:-5,0);if(stop)P.dot(best,va(best),5,'fgr pt')}
    const te=tr(end),ve=va(end),rising=va(E0)-va(best)>0.03;
    setR(root,'tr',fmt(te,2)+(stop?' (epoch '+best+')':''));setR(root,'va',fmt(ve,2)+(stop?' (epoch '+best+')':''));
    setR(root,'vd',te>0.4?'underfitting: both high':stop?'overfitting, but the best epoch is kept':rising||ve-te>0.2?'overfitting: the gap grows':'good fit')}
  draw()};
})();
