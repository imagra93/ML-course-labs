/* Figures for 01_neural_networks.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,q,setV,setR,svgOf}=lib;const {drawNet,trainMLP,box,grid,heat,stepper,segs,sig,f2,f3,NET,tinyForward,drawTiny}=window.MLNN;
FIG['neuron']=root=>{const svg=initSvg(svgOf(root),560,300);const ys=[50,110,170,250];
  ys.forEach((y,i)=>{E('circle',{cx:50,cy:y,r:18,fill:i===3?'#fff':'#70ad47',stroke:'#404040'},svg);T(svg,50,y+5,i===3?'xₙ':'x'+['₁','₂','₃'][i],'lab').style.fill=i===3?'#000':'#fff';
    arrowPx(svg,70,y,240,150,'ln thin sm','fm');E('rect',{x:120,y:y-14+(150-y)*0.3,width:40,height:22,fill:'#dae3f3',stroke:'#4472c4'},svg);T(svg,140,y+2+(150-y)*0.3,'θ'+['₁','₂','₃','ₙ'][i],'')});
  T(svg,50,215,'⋮','lab big');E('circle',{cx:270,cy:150,r:30,fill:'#fff',stroke:'#404040','stroke-width':1.5},svg);T(svg,270,158,'Σ','lab big');T(svg,270,200,'z = θᵀx','');
  arrowPx(svg,300,150,355,150,'ln thin sk','fk');E('rect',{x:357,y:120,width:80,height:60,rx:6,fill:'#4472c4'},svg);T(svg,397,156,'σ(z)','lab').style.fill='#fff';T(svg,397,200,'activation','');
  arrowPx(svg,437,150,490,150,'ln thin sk','fk');T(svg,520,156,'ŷ','lab big');T(svg,280,290,'One neuron = logistic regression (a single-layer perceptron)','','middle')};
/* one neuron with numbers, stepped */
FIG['neuron-num']=root=>{const svg=svgOf(root);const X=[2,-1,0.5],W=[0.4,-0.3,1.0],b=0.1;const P=X.map((v,i)=>v*W[i]);const z=P.reduce((s,v)=>s+v,0)+b;const a=sig(z);
  stepper(root,s=>{initSvg(svg,600,300);const ys=[60,150,240];
    ys.forEach((y,i)=>{E('circle',{cx:50,cy:y,r:20,fill:'#70ad47',stroke:'#404040'},svg);T(svg,50,y+5,'x'+['₁','₂','₃'][i],'lab').style.fill='#fff';T(svg,50,y-28,String(X[i]),'lab');
      arrowPx(svg,72,y,262,150,'ln thin sm','fm');const wx=125+0.4*(0),wy=y+(150-y)*0.32;E('rect',{x:wx-22,y:wy-13,width:44,height:24,fill:'#dae3f3',stroke:'#4472c4'},svg);T(svg,wx,wy+4,String(W[i]),'');
      if(s>=1){const px=205,py=y+(150-y)*0.62;E('rect',{x:px-26,y:py-13,width:52,height:24,fill:'#fff2cc',stroke:'#bf9000'},svg);T(svg,px,py+4,f2(P[i]),'')}});
    T(svg,50,290,'inputs','');T(svg,125,290,'weights','');if(s>=1)T(svg,205,290,'products','');
    E('circle',{cx:290,cy:150,r:30,fill:s>=2?'#ffc000':'#fff',stroke:'#404040','stroke-width':1.5},svg);T(svg,290,158,'Σ','lab big');T(svg,290,200,'+ b = '+b,'');
    if(s>=2){T(svg,290,225,'z = '+f2(z),'lab')}
    arrowPx(svg,322,150,372,150,'ln thin sk','fk');E('rect',{x:374,y:120,width:80,height:60,rx:6,fill:s>=3?'#4472c4':'#9dafd6'},svg);T(svg,414,156,'σ(z)','lab').style.fill='#fff';
    arrowPx(svg,456,150,512,150,'ln thin sk','fk');T(svg,545,156,s>=3?f3(a):'ŷ','lab big');if(s>=3)T(svg,545,182,'= ŷ','');
    T(svg,300,275,s===0?'x = (2, −1, 0.5), θ = (0.4, −0.3, 1.0), b = 0.1':s===1?'multiply each input by its weight':s===2?'add everything up (plus the bias)':'squash into (0, 1) with the sigmoid','','middle')})};
FIG['mlp']=root=>{const svg=initSvg(svgOf(root),520,330);drawNet(svg,[3,4,1],{x0:60,y0:40,w:380,h:260,r:16,titles:['Input layer','Hidden layer','Output layer'],label:(l,i)=>l===0?'x'+(i+1):l===1?'a'+(i+1):'ŷ'});
  T(svg,150,320,'W⁽¹⁾ ∈ ℝ³ˣ⁴, b⁽¹⁾ ∈ ℝ⁴','');T(svg,380,320,'W⁽²⁾ ∈ ℝ⁴ˣ¹, b⁽²⁾ ∈ ℝ','')};
FIG['fwd-num']=root=>{const svg=svgOf(root);const F=tinyForward(NET);stepper(root,s=>{initSvg(svg,600,320);drawTiny(svg,NET,F,s,{hiEdge:s===1?1:s===3?2:0})})};
/* shapes: X (m×n) · W (n×h) + b = Z (m×h) */
FIG['shapes']=root=>{const svg=initSvg(svgOf(root),620,260);const blk=(x,y,w,h,c,t,rows,cols)=>{E('rect',{x:x,y:y,width:w,height:h,fill:c,stroke:'#404040'},svg);T(svg,x+w/2,y+h/2+6,t,'lab big');T(svg,x+w/2,y+h+18,cols,'');const r=T(svg,x-8,y+h/2+4,rows,'','end')};
  blk(30,60,120,150,'#e2f0d9','X',  'm','n');T(svg,175,140,'·','lab big');blk(200,90,90,90,'#dae3f3','W','n','h');T(svg,315,140,'+','lab big');blk(340,90,90,22,'#fff2cc','b','1','h');T(svg,455,140,'=','lab big');blk(490,60,90,150,'#fbe5d6','Z','m','h');
  T(svg,90,40,'m examples × n features','');T(svg,245,70,'weights','');T(svg,385,70,'bias (added to every row)','');T(svg,535,40,'m × h pre-activations','');
  T(svg,310,245,'Row i of Z is example i after the layer. The batch dimension m passes straight through.','','middle')};
/* what the hidden units learned on the circle data */
function circleData(seed,n){const r=rng(seed);const X=[],y=[];for(let i=0;i<n;i++){const a=2*r()-1,b=2*r()-1;let c=a*a+b*b<0.42?1:0;if(r()<0.04)c=1-c;X.push([a,b]);y.push(c)}return {X,y}}
FIG['hidden-feats']=root=>{const {X,y}=circleData(3,200);const mdl=trainMLP(X,y,[4],'tanh',500,0.03,7);const svg=initSvg(svgOf(root),960,300);const N=26;
  const panel=(x0,title,fn,cls)=>{const P=Plot(svg,{at:[x0,0],w:180,h:210,x:[-1,1],y:[-1,1],m:{l:6,r:6,t:26,b:6}});P.axes({grid:false});T(P.root,90,16,title,'lab');
    for(let a=0;a<N;a++)for(let b=0;b<N;b++){const xx=[-1+2*(a+0.5)/N,-1+2*(b+0.5)/N];const v=fn(xx);const rc=P.rect(-1+2*a/N,-1+2*b/N,-1+2*(a+1)/N,-1+2*(b+1)/N,'');rc.setAttribute('fill',heat(v,cls==='mono'));rc.setAttribute('stroke','none')}
    X.forEach((x,i)=>P.dot(x[0],x[1],1.8,y[i]?'fb':'fo'));return P};
  for(let j=0;j<4;j++)panel(j*190,'hidden unit a'+(j+1),x=>mdl.forward(x)[1][j]);T(svg,760+90,16,'output ŷ','lab');panel(780,'output ŷ = σ(Σ w a + b)',x=>mdl.forward(x)[2][0],'mono');
  const wv=mdl.W[1].map(r=>r[0]);T(svg,380,240,'Each hidden unit is a soft half-plane (a tilted sigmoid / tanh in x₁, x₂). The output layer adds them with weights','','middle');
  T(svg,380,262,'w = ('+wv.map(v=>f2(v)).join(', ')+') and b = '+f2(mdl.B[1][0])+': four "walls" combine into a closed region. That is what "learned features" means.','','middle');
  T(svg,380,290,'blue = +1, orange = −1 (hidden units, tanh) · dark blue = high probability (output)','','middle')};
FIG['loss-shapes']=root=>{const svg=initSvg(svgOf(root),620,270);
  const P=Plot(svg,{at:[0,0],w:310,h:270,x:[0,1],y:[0,5],m:{l:40,r:10,t:26,b:36}});P.axes({xt:[0,0.5,1],yt:[0,2,4],xl:'predicted probability ŷ',yl:'loss'});T(P.root,170,16,'Binary cross-entropy','lab');
  P.fn(p=>Math.min(5,-Math.log(p)),'ln sb',0.005,1,300);P.fn(p=>Math.min(5,-Math.log(1-p)),'ln so',0,0.995,300);P.text(0.35,3.2,'y = 1: −log ŷ','', 'start');P.text(0.65,3.2,'y = 0: −log(1−ŷ)','', 'end');
  P.dot(0.9,-Math.log(0.9),4,'fb');P.text(0.9,-Math.log(0.9),'confident & right: 0.1','', 'end',-6,-8);P.dot(0.1,-Math.log(0.1),4,'fb');P.text(0.1,-Math.log(0.1),'confident & wrong: 2.3','', 'start',8,0);
  const Q=Plot(svg,{at:[320,0],w:300,h:270,x:[-3,3],y:[0,5],m:{l:40,r:10,t:26,b:36}});Q.axes({xt:[-2,0,2],yt:[0,2,4],xl:'error ŷ − y',yl:'loss'});T(Q.root,160,16,'Mean squared error (regression)','lab');
  Q.fn(e=>Math.min(5,0.5*e*e),'ln sb',-3,3,200);Q.fn(e=>Math.min(5,Math.abs(e)),'ln so dash',-3,3,200);Q.text(1.9,2.4,'½ e²','', 'start');Q.text(2.6,2.1,'|e| (L1)','', 'end',0,18)};
const ACTS={sigmoid:[z=>1/(1+Math.exp(-z)),z=>{const s=1/(1+Math.exp(-z));return s*(1-s)},"σ′(z) = σ(z)(1 − σ(z)) ≤ 1/4"],tanh:[z=>Math.tanh(z),z=>1-Math.tanh(z)**2,"tanh′(z) = 1 − tanh²(z) ≤ 1"],
  relu:[z=>Math.max(0,z),z=>z>0?1:0,"ReLU′(z) = 0 if z < 0, 1 if z > 0"],leaky:[z=>z>0?z:0.2*z,z=>z>0?1:0.2,"LeakyReLU′(z) = 0.2 if z < 0, 1 if z > 0"],gelu:[z=>0.5*z*(1+Math.tanh(0.7978845608*(z+0.044715*z*z*z))),z=>{const h=1e-4;const g=v=>0.5*v*(1+Math.tanh(0.7978845608*(v+0.044715*v*v*v)));return (g(z+h)-g(z-h))/(2*h)},"GELU: a smooth ReLU (transformers)"],linear:[z=>z,z=>1,"g′(z) = 1"]};
FIG['act']=root=>{const P=Plot(svgOf(root),{w:540,h:340,x:[-5,5],y:[-1.5,3],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[-4,-2,0,2,4],yt:[-1,0,1,2,3],xl:'z',yl:''});P.line(-5,0,5,0,'ax',P.bg);P.line(0,-1.5,0,3,'ax',P.bg);
  let k='sigmoid';const btns=root.querySelectorAll('.seg button');function draw(){P.clear();const a=ACTS[k];P.fn(a[0],'ln sb',-5,5,400);P.fn(a[1],'ln sr dash',-5,5,400);setR(root,'d',a[2])}
  btns.forEach(b=>b.addEventListener('click',()=>{k=b.dataset.a;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));draw()};
FIG['xor']=root=>{const svg=initSvg(svgOf(root),620,300);const pts=[[0,0,0],[1,1,0],[0,1,1],[1,0,1]];
  const A=Plot(svg,{at:[0,0],w:290,h:300,x:[-0.4,1.4],y:[-0.4,1.4],m:{l:30,r:10,t:30,b:30}});A.axes({xt:[0,1],yt:[0,1],xl:'x₁',yl:'x₂'});T(A.root,150,18,'No single line separates XOR','lab');
  A.line(-0.4,1.2,1.4,-0.2,'ln thin sm dash');A.line(-0.4,0.3,1.4,1.1,'ln thin sm dash');pts.forEach(p=>A.dot(p[0],p[1],10,p[2]?'fb pt':'fo pt'));
  const B=Plot(svg,{at:[320,0],w:300,h:300,x:[-0.4,1.4],y:[-0.4,1.4],m:{l:30,r:10,t:30,b:30}});B.axes({xt:[0,1],yt:[0,1],xl:'x₁',yl:'x₂'});T(B.root,155,18,'Two hidden units: two lines','lab');
  B.poly([[-0.4,0.9],[0.9,-0.4],[1.4,-0.4],[1.4,0.1],[0.1,1.4],[-0.4,1.4]],'fbs');B.line(-0.4,0.9,0.9,-0.4,'ln sb');B.line(0.1,1.4,1.4,0.1,'ln sb');pts.forEach(p=>B.dot(p[0],p[1],10,p[2]?'fb pt':'fo pt'));
  B.text(0.5,0.5,'h₁ AND NOT h₂','lab','middle',0,4)};
FIG['playground']=root=>{const {X,y}=circleData(3,200);const P=Plot(svgOf(root),{w:430,h:430,x:[-1,1],y:[-1,1],m:{l:10,r:10,t:10,b:10}});let act='tanh';const iu=q(root,'u'),il=q(root,'l');const btns=root.querySelectorAll('.seg button');const cache={};
  function draw(){const u=+iu.value,L=+il.value;setV(root,'u',u);setV(root,'l',L);const key=act+u+'-'+L;const hidden=u===0?[]:[...Array(L)].map(()=>u);
    if(!cache[key])cache[key]=trainMLP(X,y,hidden,act,u===0?300:500,0.03,7);const mdl=cache[key];P.clear();const N=34;
    for(let a=0;a<N;a++)for(let b=0;b<N;b++){const x=[-1+2*(a+0.5)/N,-1+2*(b+0.5)/N];const p=mdl.predict(x);const rc=P.rect(-1+2*a/N,-1+2*b/N,-1+2*(a+1)/N,-1+2*(b+1)/N,p>=0.5?'fb':'fo');rc.setAttribute('opacity',(0.08+0.45*Math.abs(p-0.5)*2).toFixed(2))}
    X.forEach((x,i)=>P.dot(x[0],x[1],3.4,'pt '+(y[i]?'fb':'fo')));const acc=X.filter((x,i)=>(mdl.predict(x)>=0.5?1:0)===y[i]).length/X.length;
    setR(root,'acc',fmt(acc,3));setR(root,'loss',fmt(mdl.losses[mdl.losses.length-1],3));
    let np=0;const s=[2].concat(hidden,[1]);for(let i=0;i<s.length-1;i++)np+=s[i]*s[i+1]+s[i+1];setR(root,'np',np);setR(root,'what',u===0?'logistic regression':(act==='linear'?'still a linear model':'a neural network'))}
  btns.forEach(b=>b.addEventListener('click',()=>{act=b.dataset.a;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));iu.addEventListener('change',draw);il.addEventListener('change',draw);iu.addEventListener('input',()=>{setV(root,'u',iu.value);draw()});il.addEventListener('input',()=>{setV(root,'l',il.value);draw()});draw()};
FIG['pipeline']=root=>{const svg=initSvg(svgOf(root),600,250);const bx=(x,y,w,t,c)=>{E('rect',{x:x,y:y,width:w,height:46,rx:6,fill:c},svg);T(svg,x+w/2,y+28,t,'lab').style.fill='#fff'};
  T(svg,300,24,'Traditional machine learning','lab big');bx(20,40,90,'Input','#7f7f7f');bx(150,40,150,'Feature extraction (by hand)','#ed7d31');bx(340,40,120,'Classifier','#4472c4');bx(500,40,80,'Output','#7f7f7f');
  [[110,63,148],[300,63,338],[460,63,498]].forEach(a=>arrowPx(svg,a[0],a[1],a[2],a[1],'ln thin sk','fk'));
  T(svg,300,150,'Deep learning','lab big');bx(20,166,90,'Input','#7f7f7f');bx(150,166,310,'Feature extraction + classification (learned together)','#4472c4');bx(500,166,80,'Output','#7f7f7f');
  [[110,189,148],[460,189,498]].forEach(a=>arrowPx(svg,a[0],a[1],a[2],a[1],'ln thin sk','fk'))};
FIG['workflow']=root=>{const svg=initSvg(svgOf(root),460,330);const bx=(x,y,w,h,t,c,tc)=>{E('rect',{x:x,y:y,width:w,height:h,rx:8,fill:c,stroke:'#404040'},svg);T(svg,x+w/2,y+h/2+5,t,'lab').style.fill=tc||'#000'};
  T(svg,230,16,'Input X','');bx(140,26,180,42,'Layer (weights)','#ffe699');bx(140,88,180,42,'Layer (weights)','#ffe699');bx(140,150,180,36,'Predictions Ŷ','#fff');bx(330,150,110,36,'True targets Y','#fff');
  bx(250,220,150,40,'Loss function','#8ea9db');bx(20,220,150,40,'Optimizer','#f4b183');bx(275,286,100,30,'Loss score','#fff');
  arrowPx(svg,230,68,230,86,'ln thin sk','fk');arrowPx(svg,230,130,230,148,'ln thin sk','fk');arrowPx(svg,230,186,300,218,'ln thin sk','fk');arrowPx(svg,385,186,340,218,'ln thin sk','fk');arrowPx(svg,325,260,325,284,'ln thin sk','fk');
  arrowPx(svg,275,300,120,262,'ln thin sk','fk');arrowPx(svg,80,218,138,110,'ln thin sk','fk');T(svg,70,160,'weight update','')};
FIG['softmax-demo']=root=>{const svg=initSvg(svgOf(root),560,230);const z=[1.3,5.1,2.2,0.7,1.1];const e=z.map(Math.exp);const s=e.reduce((a,b)=>a+b,0);const names=['cat','dog','car','tree','boat'];
  z.forEach((v,i)=>{T(svg,22,41+i*40,names[i],'','end');E('rect',{x:30,y:20+i*40,width:70,height:32,fill:'#dae3f3',stroke:'#4472c4'},svg);T(svg,65,41+i*40,v.toFixed(1),'lab');const p=e[i]/s;E('rect',{x:420,y:20+i*40,width:Math.max(3,120*p),height:32,fill:'#ed7d31'},svg);T(svg,415,41+i*40,p.toFixed(2),'lab','end')});
  arrowPx(svg,105,110,175,110,'ln sk','fk');E('rect',{x:180,y:70,width:190,height:80,rx:6,fill:'#fff',stroke:'#404040'},svg);T(svg,275,105,'softmax','lab big');T(svg,275,130,'e^(z_k) / Σ e^(z_l)','');arrowPx(svg,372,110,410,110,'ln sk','fk');
  T(svg,65,14,'scores z (logits)','');T(svg,480,14,'probabilities (sum = 1)','')};
FIG['nonconvex']=root=>{const P=Plot(svgOf(root),{w:460,h:280,x:[-3,3],y:[-1.4,2.2],m:{l:30,r:14,t:14,b:36}});P.axes({grid:false,xl:'a parameter θ',yl:'loss'});
  const f=x=>0.12*x**4-0.55*x*x+0.25*x+0.2*Math.sin(3*x);P.fn(f,'ln sb',-3,3,300);let mins=[];for(let i=1;i<299;i++){const a=-3+6*(i-1)/300,b=-3+6*i/300,c=-3+6*(i+1)/300;if(f(b)<f(a)&&f(b)<f(c))mins.push(b)}
  mins.sort((a,b)=>f(a)-f(b));mins.forEach((x,k)=>{P.dot(x,f(x),5,k?'fo':'fr');P.text(x,f(x),k?'local minimum':'global minimum','', 'middle',0,20)})};
FIG['ua']=root=>{const f=x=>Math.sin(2*Math.PI*x)+0.5*x;const P=Plot(svgOf(root),{w:540,h:330,x:[0,1],y:[-1.3,1.8],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[0,0.25,0.5,0.75,1],yt:[-1,0,1],xl:'x',yl:'y'});
  P.fn(f,'ln thin sm dash',0,1,300,P.bg);const inp=q(root,'n');const sg=z=>1/(1+Math.exp(-z));
  function draw(){const N=+inp.value;setV(root,'n',N);P.clear();const k=40*N;const g=x=>{let s=0;for(let i=0;i<N;i++){const a=i/N,b=(i+1)/N;s+=f((a+b)/2)*(sg(k*(x-a))-sg(k*(x-b)))}return s};
    if(N<=6)for(let i=0;i<N;i++){const a=i/N,b=(i+1)/N,h=f((a+b)/2);P.fn(x=>h*(sg(k*(x-a))-sg(k*(x-b))),'ln thin so',0,1,300)}
    P.fn(g,'ln sr',0,1,500);setR(root,'h',2*N)}inp.addEventListener('input',draw);draw()};
})();
