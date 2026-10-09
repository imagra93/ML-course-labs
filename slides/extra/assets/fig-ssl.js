/* Figures for extra/08_self_supervised.html (self-supervised and contrastive learning). Uses ../assets/figures.js (MLFIG),
   ../neural_networks/assets/nn-core.js (MLNN) and ssl-data.js (SSLDATA: images, views and results exported from the Extra 8 notebook).
   The toy batch of the InfoNCE slides (4 images, 2 views, 3-D projections, tau = 0.5) is the one of section 2 of the notebook. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,q,setV,svgOf}=lib;const {heat,TT,box,stepper,segs}=window.MLNN;
const SD=window.SSLDATA||{};

/* ---------- helpers ---------- */
const nf=(v,d)=>{d=d===undefined?2:d;if(Math.abs(v)<0.5*Math.pow(10,-d))v=0;return v.toFixed(d).replace('-','−')};
const ln=(svg,a,b,c,w,dash)=>E('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:c||'#9aa5b8','stroke-width':w||1.6,'stroke-dasharray':dash||''},svg);
const dot=(svg,x,y,r,fill,stroke,sw)=>E('circle',{cx:x,cy:y,r:r,fill:fill,stroke:stroke||'#fff','stroke-width':sw===undefined?1.5:sw},svg);
const halo=t=>{t.setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:6px;stroke-linejoin:round');return t};
function onInput(root,k,draw){const inp=q(root,k);inp.addEventListener('input',draw);draw();return inp}
const COL=['#4472c4','#c00000','#548235','#bf9000','#7030a0','#ed7d31'],SOFT=['#dae3f3','#f8d3d3','#dcebd2','#fff0c2','#e6d9f0','#fbe5d6'];
/* a 28×28 image (flat array, values 0..100, 100 = ink) drawn dark on white; px = size of one pixel */
function img(svg,x,y,px,im,o){o=o||{};const g=E('g',{},svg);const n=o.n||28;
  E('rect',{x:x,y:y,width:n*px,height:n*px,fill:'#fff'},g);
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const v=im[i*n+j];if(v>2){const c=Math.round(255*(1-v/100));E('rect',{x:x+j*px,y:y+i*px,width:px+0.25,height:px+0.25,fill:'rgb('+c+','+c+','+c+')'},g)}}
  E('rect',{x:x,y:y,width:n*px,height:n*px,fill:'none',stroke:o.stroke||'#7f7f7f','stroke-width':o.sw||1},g);return g}
const blank=n=>new Array(n*n).fill(0);

/* ---------- the toy batch: 4 images, two views each, 3-D projections z ---------- */
const ZA=[[1,0.2,0],[0.1,1,0.1],[0,0.1,1],[0.7,0.7,0]],ZB=[[0.9,0.4,0.1],[0.2,0.9,0],[0.1,0.3,0.9],[0.4,0.8,0.3]],TAU=0.5;
const VN=['1a','2a','3a','4a','1b','2b','3b','4b'];
const unit=v=>{const n=Math.hypot(...v);return v.map(x=>x/n)};
const ZN=ZA.concat(ZB).map(unit);const SIM=ZN.map(a=>ZN.map(b=>a.reduce((s,x,k)=>s+x*b[k],0)));
const posOf=i=>(i+4)%8;
function rowSoft(i,tau){const ex=SIM[i].map((s,k)=>k===i?0:Math.exp(s/tau));const Z=ex.reduce((a,b)=>a+b,0);return ex.map(v=>v/Z)}
const SOFTM=SIM.map((_,i)=>rowSoft(i,TAU));const LOSS=SOFTM.map((p,i)=>-Math.log(p[posOf(i)]));const LMEAN=LOSS.reduce((a,b)=>a+b,0)/8;

/* ---------- similarity matrix of the batch, step by step ---------- */
FIG['ssl-sim']=root=>{const svg=svgOf(root);
  stepper(root,s=>{initSvg(svg,620,404);setV(root,'s',s+' / 3');const x0=74,y0=62,cw=50,ch=33;
    const ttl=['cosine similarities sᵢⱼ of the 8 views','positives: the other view of the same image','softmax of sᵢⱼ / τ along each row (τ = 0.5)','loss of each row: ℓᵢ = −log (probability of the positive)'][s];
    T(svg,310,20,ttl,'lab');
    for(let i=0;i<8;i++)for(let j=0;j<8;j++){const x=x0+j*cw,y=y0+i*ch;const self=i===j;let fill='#fff',txt='',tc='#1f1f1f';
      if(self){fill='#e7e6e6';txt='—';tc='#8c8c8c'}
      else if(s<2){const v=SIM[i][j];fill=heat(Math.max(0,v),true);txt=nf(v,2);tc=v>0.62?'#fff':'#1f1f1f'}
      else{const p=SOFTM[i][j];fill=heat(Math.min(1,p*2.2),true);txt=nf(p,2);tc=p>0.28?'#fff':'#1f1f1f'}
      E('rect',{x:x,y:y,width:cw,height:ch,fill:fill,stroke:'#bfbfbf','stroke-width':0.8},svg);const t=T(svg,x+cw/2,y+ch/2+5,txt,'');t.style.fill=tc}
    if(s>=1)for(let i=0;i<8;i++){const j=posOf(i);E('rect',{x:x0+j*cw+1.5,y:y0+i*ch+1.5,width:cw-3,height:ch-3,fill:'none',stroke:'#ed7d31','stroke-width':3.5},svg)}
    VN.forEach((v,k)=>{const c=COL[k%4];const tr=T(svg,x0-8,y0+k*ch+ch/2+5,v,'lab','end');tr.style.fill=c;const tc=T(svg,x0+k*cw+cw/2,y0-8,v,'lab');tc.style.fill=c});
    ln(svg,[x0,y0+4*ch],[x0+8*cw,y0+4*ch],'#404040',1.6);ln(svg,[x0+4*cw,y0],[x0+4*cw,y0+8*ch],'#404040',1.6);
    if(s>=3){const lx=x0+8*cw+22;T(svg,lx+34,y0-8,'ℓᵢ','lab');LOSS.forEach((l,i)=>{E('rect',{x:lx,y:y0+i*ch,width:68,height:ch,fill:'#fbe5d6',stroke:'#bfbfbf','stroke-width':0.8},svg);T(svg,lx+34,y0+i*ch+ch/2+5,nf(l,3),'lab')});
      const t=T(svg,lx+34,y0+8*ch+24,'L = '+nf(LMEAN,3),'lab');t.style.fill='#c55a11';T(svg,lx+34,y0+8*ch+44,'(mean)','')}
    const cap=['the diagonal (a view with itself) is never used','each row has 1 positive and 2N − 2 = 6 negatives','each row sums to 1: a 7-way classification of "which one is my other view?"','a perfect encoder gives p = 1 for every positive, so L = 0; chance level is log 7 = 1.946'][s];
    T(svg,x0+4*cw,y0+8*ch+62,cap,'')})};

/* ---------- temperature: one row of the softmax ---------- */
FIG['ssl-tau']=root=>{const svg=svgOf(root);const i=0;const order=[4,3,7,5,1,6,2];
  onInput(root,'t',()=>{const tau=+q(root,'t').value;setV(root,'t',tau.toFixed(2));const p=rowSoft(i,tau);
    const Pl=Plot(svg,{w:620,h:390,x:[0,7],y:[0,1],m:{l:54,r:14,t:66,b:66}});Pl.axes({yt:[0,0.25,0.5,0.75,1],xt:[],yl:'softmax probability'});
    Pl.line(0,1/7,7,1/7,'ln thin sm dash',Pl.bg);Pl.text(7,0.97,'dashed line: uniform, 1/7','', 'end',-4,0,Pl.bg);
    order.forEach((k,c)=>{const pos=k===posOf(i);const r=Pl.rect(c+0.18,0,c+0.82,p[k],'');r.setAttribute('fill',pos?'#ed7d31':'#4472c4');
      Pl.text(c+0.5,Math.min(p[k],0.93),nf(p[k],3),'lab','middle',0,-6);const t=T(Pl.top,Pl.X(c+0.5),Pl.Y(0)+20,VN[k]+(pos?' (+)':''),'lab');t.style.fill=COL[k%4];
      T(Pl.top,Pl.X(c+0.5),Pl.Y(0)+38,'s = '+nf(SIM[i][k],2),'')});
    const L=-Math.log(p[4]);const ratio=Math.exp((SIM[i][3]-SIM[i][2])/tau);
    T(svg,310,20,'anchor 1a: softmax of sᵢₖ / τ over its 7 candidates, τ = '+tau.toFixed(2),'lab');
    const t1=T(svg,310,44,'loss ℓ = −log p(1b) = '+nf(L,3)+'   ·   4a is pushed '+(ratio<100?nf(ratio,1):Math.round(ratio).toLocaleString('en-US'))+'× harder than 3a','');t1.style.fill='#1f1f1f';
    T(svg,310,386,'s = cosine similarity to 1a; push on a negative ∝ its probability','')})};

/* ---------- pull and push on the circle: NT-Xent on 6 images × 2 views in 2-D ---------- */
const CN=6;
function circTraj(seed,lr,steps,tau){const r=rng(seed);const th=[];for(let i=0;i<CN;i++){const a=2*Math.PI*r();th[i]=a;th[i+CN]=a+(r()<0.5?-1:1)*(0.9+1.2*r())}
  const M=2*CN;const out=[];
  for(let t=0;t<=steps;t++){const S=[...Array(M)].map((_,i)=>[...Array(M)].map((_,k)=>Math.cos(th[i]-th[k])));let L=0;const G=[...Array(M)].map(()=>new Array(M).fill(0));
    for(let i=0;i<M;i++){const p=(i+CN)%M;let Z=0;for(let k=0;k<M;k++)if(k!==i)Z+=Math.exp(S[i][k]/tau);L+=-(S[i][p]/tau-Math.log(Z));
      for(let k=0;k<M;k++)if(k!==i)G[i][k]=(Math.exp(S[i][k]/tau)/Z-(k===p?1:0))/tau/M}
    const g=th.map((_,m)=>{let s=0;for(let k=0;k<M;k++)if(k!==m)s+=(G[m][k]+G[k][m])*(-Math.sin(th[m]-th[k]));return s});
    let al=0;for(let i=0;i<CN;i++)al+=2-2*Math.cos(th[i]-th[i+CN]);al/=CN;
    let un=0,np=0;for(let i=0;i<M;i++)for(let k=i+1;k<M;k++){un+=Math.exp(-2*(2-2*Math.cos(th[i]-th[k])));np++}un=Math.log(un/np);
    out.push({th:th.slice(),L:L/M,g:g,al:al,un:un});for(let m=0;m<M;m++)th[m]-=lr*g[m]}
  return out}
FIG['ssl-circle']=root=>{const svg=svgOf(root);const TR=circTraj(3,0.2,200,0.5);const cx=170,cy=196,R=140;
  onInput(root,'k',()=>{const k=+q(root,'k').value;setV(root,'k',k);initSvg(svg,620,400);const S=TR[k];
    E('circle',{cx:cx,cy:cy,r:R,fill:'none',stroke:'#bfbfbf','stroke-width':1.5},svg);
    const P=S.th.map(a=>[cx+R*Math.cos(a),cy-R*Math.sin(a)]);
    for(let i=0;i<CN;i++)ln(svg,P[i],P[i+CN],COL[i],1.6,'5 4');
    const gmax=Math.max(...TR[0].g.map(Math.abs));
    S.th.forEach((a,m)=>{const g=-S.g[m];const L=Math.min(60,70*Math.abs(g)/gmax);if(L>5){const dir=Math.sign(g);const t=[-Math.sin(a)*dir,-Math.cos(a)*dir];
      arrowPx(svg,P[m][0],P[m][1],P[m][0]+t[0]*L,P[m][1]+t[1]*L,'ln thin sk','fk')}});
    S.th.forEach((a,m)=>{const c=COL[m%CN];if(m<CN)dot(svg,P[m][0],P[m][1],9,c);else E('rect',{x:P[m][0]-9,y:P[m][1]-9,width:18,height:18,fill:'none',stroke:c,'stroke-width':3},svg)});
    T(svg,cx,22,'step '+k+': 12 views on the unit circle','lab');
    T(svg,cx,388,'● view a   ■ view b   → gradient step','');
    const Pl=Plot(svg,{at:[350,0],w:270,h:250,x:[0,200],y:[0.9,3],m:{l:44,r:10,t:30,b:40}});Pl.axes({xt:[0,100,200],yt:[1,2,3],xl:'step',yl:'loss'});
    Pl.path(TR.map((s,t)=>[t,s.L]),'ln sb',Pl.bg);Pl.dot(k,S.L,6,'fo pt');T(Pl.root,145,20,'NT-Xent loss, τ = 0.5','lab');
    const rows=[['loss',nf(S.L,3)],['alignment',nf(S.al,3)],['uniformity',nf(S.un,3)]];
    rows.forEach(([a,b],j)=>{T(svg,450,290+j*28,a,'lab','end');T(svg,466,290+j*28,b,'lab','start')});
    T(svg,486,364,'alignment: mean ‖z − z⁺‖²','');TT(svg,486,386,'uniformity: log mean e^{−2‖zᵢ − zⱼ‖²}','')})};

/* ---------- image helpers on the exported digits ---------- */
const DIG=SD.digits||[...Array(20)].map(()=>blank(28));
const rot90=(im,k)=>{let a=im.slice();for(let t=0;t<k;t++){const b=new Array(784);for(let i=0;i<28;i++)for(let j=0;j<28;j++)b[i*28+j]=a[j*28+(27-i)];a=b}return a};
function tok(svg,x,y,w,t,fill,o){o=o||{};box(svg,x,y,w,o.h||28,t,fill||'#fff',{cls:o.cls||'',stroke:o.stroke||'#7f7f7f',rx:4})}
function trap(svg,x,y,w,h,lab,fill,narrow){const d=narrow?h*0.22:0;E('polygon',{points:[[x,y],[x+w,y+d],[x+w,y+h-d],[x,y+h]].map(p=>p.join(',')).join(' '),fill:fill||'#dae3f3',stroke:'#4472c4','stroke-width':1.5},svg);if(lab)TT(svg,x+w/2,y+h/2+6,lab,'lab')}
function vbar(svg,x,y,n,c,ch,fill){for(let i=0;i<n;i++)E('rect',{x:x,y:y+i*(ch||11),width:16,height:ch||11,fill:fill||heat(0.25+0.6*((i*37)%10)/10,true),stroke:c||'#4472c4','stroke-width':0.8},svg)}

/* ---------- where we are: five self-supervised objectives ---------- */
FIG['ssl-where']=root=>{const svg=initSvg(svgOf(root),1160,200);const W=232;
  const panel=(k,title,sub,hi)=>{const x0=k*W;E('rect',{x:x0+6,y:4,width:W-12,height:190,rx:8,fill:hi?'#f2f8ee':'#fafafa',stroke:hi?'#548235':'#d0d0d0','stroke-width':hi?2:1},svg);T(svg,x0+W/2,28,title,'lab');T(svg,x0+W/2,182,sub,'');return x0};
  let x0=panel(0,'word2vec','predict the neighbours');const w1=['the','cat','sat','on','mat'];w1.forEach((w,i)=>tok(svg,x0+16+i*40,74,36,w,i===2?'#fff2cc':(i===1||i===3)?'#dae3f3':'#fff',{stroke:i===2?'#bf9000':'#7f7f7f'}));
  [1,3].forEach(i=>{const a=[x0+16+2*40+18,72],b=[x0+16+i*40+18,72];E('path',{d:'M'+a[0]+','+a[1]+' Q'+(a[0]+b[0])/2+','+(a[1]-34)+' '+b[0]+','+(b[1]-2),fill:'none',stroke:'#4472c4','stroke-width':1.6},svg);arrowPx(svg,b[0]+(i<2?2:-2),b[1]-8,b[0],b[1]-1,'ln thin sb','fb')});
  T(svg,x0+W/2,134,'centre word → context words','');
  x0=panel(1,'BERT','predict the masked token');['the','?','sat','on'].forEach((w,i)=>tok(svg,x0+24+i*47,60,42,w,i===1?'#d9d9d9':'#fff'));arrowPx(svg,x0+24+47+21,92,x0+24+47+21,116,'ln thin sk','fk');tok(svg,x0+24+47,120,42,'cat','#fbe5d6',{stroke:'#ed7d31'});
  x0=panel(2,'GPT','predict the next token');['the','cat','sat'].forEach((w,i)=>tok(svg,x0+16+i*44,74,40,w,'#fff'));arrowPx(svg,x0+152,88,x0+170,88,'ln thin sk','fk');tok(svg,x0+174,74,40,'on','#e2f0d9',{stroke:'#548235'});
  x0=panel(3,'autoencoder','reconstruct the input');img(svg,x0+20,62,1.9,DIG[0]);trap(svg,x0+80,62,34,54,'',null,true);trap(svg,x0+118,62,34,54,'',null,false);
  E('polygon',{points:[[x0+118,74],[x0+152,62],[x0+152,116],[x0+118,104]].map(p=>p.join(',')).join(' '),fill:'#dae3f3',stroke:'#4472c4','stroke-width':1.5},svg);img(svg,x0+160,62,1.9,DIG[0]);T(svg,x0+W/2,140,'image → code → image','');
  x0=panel(4,'contrastive · new','two views must match',true);const A=SD.aug;
  if(A){img(svg,x0+14,62,1.9,A.v1[2]);img(svg,x0+74,62,1.9,A.v2[2]);img(svg,x0+166,62,1.9,DIG[1]);}
  ln(svg,[x0+18,126],[x0+124,126],'#548235',2.5);T(svg,x0+71,146,'same image','lab').style.fill='#548235';T(svg,x0+147,96,'≠','lab big').style.fill='#c00000';T(svg,x0+192,146,'other','lab').style.fill='#c00000'};

/* ---------- the protocol: pretrain, then probe or fine-tune ---------- */
FIG['ssl-protocol']=root=>{const svg=initSvg(svgOf(root),1160,230);
  T(svg,160,22,'unlabelled pool (lab: 60,000 digits)','lab');
  for(let r=0;r<4;r++)for(let c=0;c<8;c++){const k=(r*8+c)%20;img(svg,16+c*37,36+r*37,1.2,DIG[k],{stroke:'#bfbfbf',sw:0.6})}
  T(svg,160,200,'no labels: "which digit" is unknown','');
  arrowPx(svg,322,110,392,110,'ln sk','fk');T(svg,357,98,'pretrain','lab');T(svg,357,134,'SSL loss','');
  trap(svg,398,62,110,96,'encoder f','#dae3f3',true);
  arrowPx(svg,512,96,566,60,'ln thin sk','fk');arrowPx(svg,512,124,566,168,'ln thin sk','fk');
  box(svg,570,26,300,66,'','#f5f8fd',{stroke:'#4472c4'});T(svg,720,52,'linear probe','lab');T(svg,720,76,'f frozen + logistic regression on h','');
  box(svg,570,136,300,66,'','#fef8f3',{stroke:'#ed7d31'});T(svg,720,162,'fine-tuning','lab');T(svg,720,186,'f + a linear layer, all weights trained','');
  T(svg,952,22,'a few labelled examples','lab','start');[[0,'7'],[1,'2'],[2,'1'],[3,'0']].forEach(([k,l],i)=>{img(svg,952+i*38,40,1.2,DIG[k]);T(svg,969+i*38,90,l,'lab')});
  T(svg,952,114,'m per class (lab: 10, 100, 1,000)','','start');
  arrowPx(svg,944,62,876,60,'ln thin sm','fm');arrowPx(svg,944,88,876,160,'ln thin sm','fm');
  T(svg,952,170,'→ test accuracy,','lab','start');T(svg,952,192,'against training from scratch','','start')};

/* ---------- pretext tasks ---------- */
FIG['ssl-pretext']=root=>{const svg=svgOf(root);const im=DIG[0];
  const draw=k=>{initSvg(svg,620,360);
    if(k==='rot'){T(svg,310,22,'rotation: input = rotated image, label = which rotation','lab');for(let r=0;r<4;r++){img(svg,24+r*150,50,4,rot90(im,r));T(svg,80+r*150,188,'label '+r,'lab');T(svg,80+r*150,208,(90*r)+'°','')}
      box(svg,160,240,300,40,'CNN → softmax over 4 classes','#dae3f3',{cls:'lab',stroke:'#4472c4'});T(svg,310,312,'to know where "up" is, the network must find the strokes','');T(svg,310,334,'but up-ness can also come from low-level cues','')}
    else if(k==='jig'){T(svg,310,22,'jigsaw: input = shuffled tiles, label = which permutation','lab');const perm=[4,8,0,6,2,7,1,5,3];const ts=9,px=4;
      const tile=(x0,y0,p,gap)=>{for(let a=0;a<3;a++)for(let b=0;b<3;b++){const t=p[a*3+b];const sr=Math.floor(t/3),sc=t%3;const sub=[];for(let i=0;i<ts;i++)for(let j=0;j<ts;j++)sub.push(im[(sr*ts+i)*28+sc*ts+j]);const x=x0+b*(ts*px+gap),y=y0+a*(ts*px+gap);img(svg,x,y,px,sub,{n:ts});const tn=halo(T(svg,x+9,y+18,String(t+1),'lab'));tn.style.fill='#c55a11'}};
      tile(30,56,[0,1,2,3,4,5,6,7,8],6);T(svg,148,200,'tiles in order','');arrowPx(svg,282,130,330,130,'ln sk','fk');tile(344,56,perm,6);T(svg,462,200,'shuffled: input','');
      box(svg,130,236,360,40,'predict the permutation (one of a fixed set)','#dae3f3',{cls:'lab',stroke:'#4472c4'});T(svg,310,312,'the tiles are cut with gaps, so edges cannot simply be matched','')}
    else if(k==='col'){T(svg,310,22,'colourisation: input = grey image, target = its colours','lab');img(svg,60,56,4.5,im);arrowPx(svg,200,120,410,120,'ln sk','fk');T(svg,305,108,'predict the colour channels','');
      const g=E('g',{},svg);E('rect',{x:430,y:56,width:126,height:126,fill:'#fff',stroke:'#7f7f7f'},g);for(let i=0;i<28;i++)for(let j=0;j<28;j++){const v=im[i*28+j];if(v>2)E('rect',{x:430+j*4.5,y:56+i*4.5,width:4.75,height:4.75,fill:i<14?'#c55a11':'#4472c4','fill-opacity':(v/100).toFixed(2)},g)}
      T(svg,123,214,'grey input','');T(svg,493,214,'colour target','');T(svg,310,262,'illustration only: MNIST digits have no colour','');T(svg,310,290,'on photos: grass is green, sky is blue; the network must recognise them','')}
    else{T(svg,310,22,'inpainting: input = image with a hidden region, target = the region','lab');const m=im.slice();for(let i=9;i<19;i++)for(let j=9;j<19;j++)m[i*28+j]=0;
      img(svg,60,56,4.5,m);E('rect',{x:60+9*4.5,y:56+9*4.5,width:45,height:45,fill:'#d9d9d9',stroke:'#7f7f7f'},svg);T(svg,60+14*4.5,56+14*4.5+6,'?','lab big');
      arrowPx(svg,200,120,410,120,'ln sk','fk');T(svg,305,108,'encoder–decoder','');img(svg,430,56,4.5,im);E('rect',{x:430+9*4.5,y:56+9*4.5,width:45,height:45,fill:'none',stroke:'#ed7d31','stroke-width':3},svg);
      T(svg,123,214,'input','');T(svg,493,214,'target: the hidden pixels','');T(svg,310,262,'loss on the hidden region only','');T(svg,310,290,'MAE (Part D) is this idea, done right for transformers','')}};
  const cur=segs(root,'p',draw);draw(cur()||'rot')};

/* ---------- two views: the augmentation pipeline ---------- */
FIG['ssl-aug']=root=>{const svg=svgOf(root);const A=SD.aug||{orig:blank(28),v1:[blank(28),blank(28),blank(28)],v2:[blank(28),blank(28),blank(28)]};
  stepper(root,s=>{initSvg(svg,620,390);const px=3.6,W=28*px,xs=[194,334,474],ys=[50,236];
    img(svg,14,140,4.2,A.orig);T(svg,73,282,'image x','lab');
    ['crop + rotation','brightness, contrast','erasing'].forEach((t,c)=>{const tt=T(svg,xs[c]+W/2,30,t,'lab');if(s<c+1)tt.style.fill='#bfbfbf'});
    [[A.v1,0,'t'],[A.v2,1,'t′']].forEach(([V,r,lab])=>{arrowPx(svg,136,200+(r?20:-20),xs[0]-6,ys[r]+W/2,'ln thin sm','fm');const tl=T(svg,160,r?262:150,lab,'lab big');
      for(let c=0;c<3;c++){if(s>=c+1){img(svg,xs[c],ys[r],px,V[c],{stroke:s===4&&c===2?'#ed7d31':'#7f7f7f',sw:s===4&&c===2?3:1});if(c<2&&s>=c+2)arrowPx(svg,xs[c]+W+4,ys[r]+W/2,xs[c+1]-6,ys[r]+W/2,'ln thin sm','fm')}
        else E('rect',{x:xs[c],y:ys[r],width:W,height:W,fill:'#fafafa',stroke:'#e3e3e3','stroke-dasharray':'4 4'},svg)}
      T(svg,xs[2]+W/2,ys[r]+W+20,r?'view x̃′ = t′(x)':'view x̃ = t(x)','')});
    if(s===4){E('path',{d:'M'+(xs[2]+W+8)+','+(ys[0]+W/2)+' h14 V'+(ys[1]+W/2)+' h-14',fill:'none',stroke:'#ed7d31','stroke-width':2.5},svg);const t=T(svg,xs[2]+W/2,(ys[0]+W+ys[1])/2+16,'positive pair','lab');t.style.fill='#c55a11'}
    setV(root,'s',s+' / 4')})};

/* ---------- SimCLR architecture ---------- */
FIG['ssl-arch']=root=>{const svg=initSvg(svgOf(root),1160,290);const A=SD.aug;
  img(svg,20,90,3,A?A.orig:blank(28));T(svg,62,196,'image x','lab');
  const rows=[30,170];rows.forEach((y,r)=>{arrowPx(svg,110,132+(r?14:-14),186,y+42,'ln thin sm','fm');TT(svg,140,r?206:78,r?'t′ ∼ T':'t ∼ T','');
    img(svg,192,y,3,A?(r?A.v2[2]:A.v1[2]):blank(28));T(svg,234,y+102,r?'view x̃′':'view x̃','');
    arrowPx(svg,282,y+42,318,y+42,'ln thin sk','fk');trap(svg,322,y,96,84,'f','#dae3f3',true);
    arrowPx(svg,422,y+42,452,y+42,'ln thin sk','fk');vbar(svg,458,y+2,7,'#4472c4',11.5);TT(svg,466,y+102,r?'h′':'h','lab');
    arrowPx(svg,480,y+42,512,y+42,'ln thin sk','fk');box(svg,516,y+20,60,44,'g','#e2f0d9',{cls:'lab',stroke:'#548235'});
    arrowPx(svg,580,y+42,612,y+42,'ln thin sk','fk');vbar(svg,618,y+14,5,'#548235',11.5,'#e2f0d9');TT(svg,626,y+90,r?'z′':'z','lab')});
  ln(svg,[370,118],[370,166],'#4472c4',1.5,'4 4');T(svg,380,147,'shared weights','','start');
  arrowPx(svg,640,72,708,118,'ln thin sk','fk');arrowPx(svg,640,212,708,160,'ln thin sk','fk');
  box(svg,712,104,190,62,'','#fbe5d6',{stroke:'#ed7d31'});T(svg,807,130,'NT-Xent loss','lab');T(svg,807,152,'z and z′ agree, vs the batch','');
  T(svg,940,60,'h: the representation','lab','start');T(svg,940,82,'kept, used for probes and fine-tuning','','start');
  T(svg,940,128,'g and z: only for the loss','lab','start');T(svg,940,150,'thrown away after pretraining','','start');
  T(svg,940,196,'every image of the batch, twice:','lab','start');T(svg,940,218,'2N views, 2N − 2 negatives each','','start')};

/* ---------- MAE: masking patches ---------- */
FIG['ssl-mae']=root=>{const svg=svgOf(root);const im=DIG[4];const r=rng(5);const perm=[...Array(49).keys()];for(let i=48;i>0;i--){const j=Math.floor(r()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}
  onInput(root,'r',()=>{const ratio=+q(root,'r').value;setV(root,'r',ratio+' %');initSvg(svg,620,380);const nm=Math.round(49*ratio/100);const masked=new Set(perm.slice(0,nm));const px=7;
    T(svg,118,24,'input: '+nm+' of 49 patches masked','lab');img(svg,20,44,px,im);
    for(let p=0;p<49;p++){const a=Math.floor(p/7),b=p%7;const x=20+b*28,y=44+a*28;if(masked.has(p))E('rect',{x:x,y:y,width:28,height:28,fill:'#bfbfbf',stroke:'#fff','stroke-width':1},svg);else E('rect',{x:x,y:y,width:28,height:28,fill:'none',stroke:'#dae3f3','stroke-width':1},svg)}
    const vis=perm.slice(nm).sort((a,b)=>a-b);T(svg,310,24,'encoder input','lab');
    vis.forEach((p,k)=>{const a=Math.floor(k/7),b=k%7;const sub=[];const pa=Math.floor(p/7),pb=p%7;for(let i=0;i<4;i++)for(let j=0;j<4;j++)sub.push(im[(pa*4+i)*28+pb*4+j]);img(svg,248+b*18,44+a*18,4,sub,{n:4,stroke:'#4472c4'})});
    T(svg,310,190,vis.length+' tokens','lab');T(svg,310,210,(Math.round(100*vis.length/49))+' % of the compute','');
    T(svg,502,24,'target: the masked pixels','lab');img(svg,404,44,px,im);
    for(let p=0;p<49;p++){if(!masked.has(p))continue;const a=Math.floor(p/7),b=p%7;E('rect',{x:404+b*28+1,y:44+a*28+1,width:26,height:26,fill:'none',stroke:'#ed7d31','stroke-width':2},svg)}
    arrowPx(svg,222,140,242,140,'ln thin sm','fm');arrowPx(svg,376,140,398,140,'ln thin sm','fm');
    T(svg,310,272,'7 × 7 patches of 4 × 4 pixels (a ViT on 224 × 224 photos: 14 × 14 patches of 16 × 16)','');
    T(svg,310,300,'loss: mean squared error on the orange patches only','');
    const t=T(svg,310,340,ratio<40?'easy: missing patches can be interpolated from their neighbours':ratio<=80?'MAE default 75 %: the encoder sees a quarter of the image':'too little left to recover the digit','lab');t.style.fill=ratio>=70&&ratio<=80?'#c55a11':'#1f1f1f'})};

/* ---------- CLIP: image-text matrix (schematic) ---------- */
FIG['ssl-clip']=root=>{const svg=svgOf(root);const names=['seven','two','one','zero'];
  const draw=m=>{initSvg(svg,620,390);
    if(m==='train'){T(svg,310,20,'one batch: 4 images and their 4 captions (schematic)','lab');const x0=210,y0=64,c=62;
      names.forEach((n,j)=>{tok(svg,x0+j*c+4,y0-40,c-8,'T'+(j+1),'#e2f0d9',{stroke:'#548235',cls:'lab'})});
      [0,1,2,3].forEach(i=>{img(svg,x0-62,y0+i*c+5,1.85,DIG[i]);T(svg,x0-72,y0+i*c+37,'I'+(i+1),'lab','end')});
      for(let i=0;i<4;i++)for(let j=0;j<4;j++){const on=i===j;E('rect',{x:x0+j*c,y:y0+i*c,width:c,height:c,fill:on?'#4472c4':'#eef2f9',stroke:on?'#ed7d31':'#bfbfbf','stroke-width':on?3:0.8},svg);TT(svg,x0+j*c+c/2,y0+i*c+c/2+5,'I_'+(i+1)+'·T_'+(j+1),on?'w':'')}
      ['7','2','1','0'].forEach((n,j)=>T(svg,476,y0+12+j*26,'T'+(j+1)+': "a handwritten '+n+'"','','start'));
      T(svg,476,y0+130,'InfoNCE along rows','lab','start');T(svg,476,y0+152,'(image → text) and','','start');T(svg,476,y0+174,'columns (text → image)','','start');
      T(svg,310,y0+4*c+30,'dark = high similarity wanted: the true pairs; light = negatives (the other captions)','');
      T(svg,310,y0+4*c+52,'CLIP: N = 32,768 pairs per batch, 400 million pairs in total','')}
    else{T(svg,310,20,'zero-shot: one prompt per class, no training example (schematic)','lab');img(svg,40,110,4,DIG[4]);T(svg,96,250,'new image','lab');
      arrowPx(svg,160,166,200,166,'ln thin sk','fk');trap(svg,204,128,60,76,'',null,true);TT(svg,234,222,'image enc.','');
      const sims=[0.12,0.10,0.15,0.18,0.62,0.20,0.14,0.11,0.16,0.33];const mx=4;
      sims.forEach((v,k)=>{const y=52+k*29;T(svg,420,y+15,'"a photo of the digit '+k+'"','','end');E('rect',{x:430,y:y,width:150*v/0.62,height:20,fill:k===mx?'#ed7d31':'#9dafd6'},svg)});
      arrowPx(svg,268,166,300,166,'ln thin sk','fk');T(svg,310,352,'bar length = similarity (schematic) · predicted class: 4','lab');T(svg,310,374,'the text encoder embeds the 10 prompts once','')}};
  const cur=segs(root,'m',draw);draw(cur()||'train')};

/* ---------- negatives: SimCLR batch vs MoCo queue ---------- */
FIG['ssl-moco']=root=>{const svg=initSvg(svgOf(root),480,410);
  T(svg,240,20,'SimCLR: negatives = the rest of the batch','lab');
  for(let i=0;i<8;i++){const x=30+i*54;const c=i===0?'#ed7d31':i===1?'#ed7d31':'#9dafd6';E('rect',{x:x,y:40,width:44,height:30,fill:c,stroke:'#fff'},svg);T(svg,x+22,60,i<2?(i?'1b':'1a'):(Math.floor(i/2)+1)+(i%2?'b':'a'),'').style.fill='#fff'}
  T(svg,240,96,'2N views; batch size = number of negatives + 1','');T(svg,240,118,'large N needs large memory: SimCLR used 4,096 images','');
  ln(svg,[16,140],[464,140],'#d0d0d0',1);
  T(svg,240,166,'MoCo: negatives = a queue of past keys','lab');
  box(svg,16,186,150,40,'query encoder','#dae3f3',{cls:'',stroke:'#4472c4'});box(svg,16,256,150,40,'momentum encoder','#e2f0d9',{cls:'',stroke:'#548235'});
  arrowPx(svg,91,228,91,252,'ln thin sm','fm');TT(svg,104,245,'θ_k ← 0.999 θ_k + 0.001 θ_q','','start');
  for(let i=0;i<13;i++)E('rect',{x:196+i*20,y:266,width:18,height:22,fill:i<2?'#70ad47':'#c5e0b4',stroke:'#fff'},svg);
  arrowPx(svg,170,276,192,276,'ln thin sm','fm');T(svg,320,316,'queue: 65,536 keys from past batches','');T(svg,320,338,'newest batch in, oldest batch out','');
  arrowPx(svg,170,206,300,206,'ln thin sm','fm');box(svg,304,188,150,36,'InfoNCE vs queue','#fbe5d6',{cls:'',stroke:'#ed7d31'});arrowPx(svg,380,262,380,228,'ln thin sm','fm');
  T(svg,240,382,'the slow key encoder keeps old keys comparable with new ones','');T(svg,240,402,'batch 256 is enough','')};

/* ---------- SimSiam ---------- */
FIG['ssl-siam']=root=>{const svg=initSvg(svgOf(root),480,410);const A=SD.aug;
  [0,1].forEach(r=>{const x=r?300:60;img(svg,x+22,318,2.2,A?(r?A.v2[2]:A.v1[2]):blank(28));T(svg,x+14,354,r?'view 2':'view 1','','end');
    arrowPx(svg,x+53,316,x+53,300,'ln thin sk','fk');trap(svg,x,250,106,46,'f',null,false);arrowPx(svg,x+53,246,x+53,222,'ln thin sk','fk');box(svg,x+8,184,90,34,'projector','#e2f0d9',{cls:'',stroke:'#548235'});TT(svg,x+112,206,r?'z_2':'z_1','lab','start')});
  ln(svg,[166,273],[300,273],'#4472c4',1.5,'4 4');T(svg,233,266,'shared','');
  arrowPx(svg,113,180,113,150,'ln thin sk','fk');box(svg,58,112,110,34,'predictor q','#fff2cc',{cls:'',stroke:'#bf9000'});TT(svg,180,134,'p_1','lab','start');
  arrowPx(svg,353,180,353,104,'ln thin sk','fk');E('rect',{x:318,y:120,width:70,height:24,fill:'#c00000',rx:4},svg);T(svg,353,137,'stop-grad','').style.fill='#fff';
  arrowPx(svg,113,108,200,58,'ln thin sk','fk');arrowPx(svg,353,100,280,58,'ln thin sk','fk');box(svg,150,8,180,50,'','#fbe5d6',{stroke:'#ed7d31'});TT(svg,240,30,'−cos(p_1, sg(z_2))','lab');T(svg,240,50,'+ the same, views swapped','');
  T(svg,420,166,'no gradient','','middle').style.fill='#c00000';T(svg,420,184,'through z₂','').style.fill='#c00000';
  T(svg,240,404,'BYOL: the right branch is a moving average of the left network','')};

/* ---------- DINO ---------- */
FIG['ssl-dino']=root=>{const svg=initSvg(svgOf(root),480,410);const A=SD.aug;
  T(svg,240,20,'crops of one image','lab');
  [0,1].forEach(k=>img(svg,36+k*76,36,2.3,A?(k?A.v2[0]:A.v1[0]):blank(28)));[0,1,2,3].forEach(k=>{const im=A?A.orig:blank(28);const sub=[];const oi=[4,10,6,12][k],oj=[6,4,12,10][k];for(let i=0;i<14;i++)for(let j=0;j<14;j++)sub.push(im[(oi+i)*28+oj+j]);img(svg,214+k*58,48,3,sub,{n:14})});
  T(svg,98,118,'2 global crops','');T(svg,330,118,'local crops','');
  box(svg,40,150,160,40,'student θ','#dae3f3',{cls:'lab',stroke:'#4472c4'});box(svg,280,150,160,40,'teacher ξ','#e2f0d9',{cls:'lab',stroke:'#548235'});
  arrowPx(svg,120,124,120,146,'ln thin sm','fm');arrowPx(svg,330,124,160,148,'ln thin sm','fm');arrowPx(svg,98,124,330,146,'ln thin sm','fm');
  T(svg,240,214,'ξ ← moving average of θ (no gradient)','');
  box(svg,40,236,160,40,'softmax(·/τ_s)','#fff',{cls:'',stroke:'#4472c4'});box(svg,280,236,160,40,'centre, softmax(·/τ_t)','#fff',{cls:'',stroke:'#548235'});
  arrowPx(svg,120,194,120,232,'ln thin sk','fk');arrowPx(svg,360,194,360,232,'ln thin sk','fk');
  arrowPx(svg,120,280,200,318,'ln thin sk','fk');arrowPx(svg,360,280,280,318,'ln thin sk','fk');box(svg,150,322,180,36,'cross-entropy','#fbe5d6',{cls:'lab',stroke:'#ed7d31'});
  T(svg,240,384,'centring: no output dominates; τ_t < τ_s sharpens','');T(svg,240,404,'student matches the teacher across crops','')};

/* ---------- VICReg terms on toy clouds ---------- */
FIG['ssl-vic']=root=>{const svg=svgOf(root);const r=rng(9);const n=200;const base=[...Array(n)].map(()=>[randn(r),randn(r)]);
  const clouds={full:base.map(p=>[0.6+0.02*p[0],-0.4+0.02*p[1]]),dim:base.map(p=>[1.1*p[0],0.95*p[0]+0.15*p[1]]),ok:base.map(p=>[p[0],p[1]])};
  const stats=Z=>{const m=[0,1].map(j=>Z.reduce((s,p)=>s+p[j],0)/n);const C=[[0,0],[0,0]];Z.forEach(p=>{for(let a=0;a<2;a++)for(let b=0;b<2;b++)C[a][b]+=(p[a]-m[a])*(p[b]-m[b])/(n-1)});
    const sd=[0,1].map(j=>Math.sqrt(C[j][j]+1e-4));const v=[0,1].reduce((s,j)=>s+Math.max(0,1-sd[j]),0)/2;const c=2*C[0][1]*C[0][1]/2;return {sd,v,c,rho:C[0][1]/Math.sqrt(C[0][0]*C[1][1]+1e-12)}};
  const draw=k=>{initSvg(svg,620,370);const Z=clouds[k];const S=stats(Z);
    const Pl=Plot(svg,{at:[0,0],w:340,h:350,x:[-3.5,3.5],y:[-3.5,3.5],m:{l:40,r:10,t:30,b:40}});Pl.axes({xt:[-3,0,3],yt:[-3,0,3],xl:'dimension 1',yl:'dimension 2'});
    Z.forEach(p=>Pl.dot(p[0],p[1],3.2,'fb'));T(Pl.root,185,20,{full:'complete collapse',dim:'dimensional collapse',ok:'healthy'}[k]+' (a batch of 200)','lab');
    const rows=[['std of dim 1',nf(S.sd[0],2)],['std of dim 2',nf(S.sd[1],2)],['correlation',nf(S.rho,2)],['variance term',nf(S.v,3)],['covariance term',nf(S.c,3)]];
    rows.forEach(([a,b],j)=>{T(svg,500,70+j*34,a,'lab','end');const t=T(svg,516,70+j*34,b,'lab','start');if(j===3&&S.v>0.05)t.style.fill='#c00000';if(j===4&&S.c>0.05)t.style.fill='#c00000'});
    T(svg,480,262,'variance: (1/d) Σ max(0, 1 − std)','');T(svg,480,284,'covariance: (1/d) Σ_{j≠k} C²_{jk}','');T(svg,480,318,'red = penalised by VICReg','')};
  const cur=segs(root,'c',draw);draw(cur()||'ok')};

/* ---------- lab results (SSLDATA, exported from the notebook) ---------- */
const TAB10=['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'];
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length,sdev=a=>{const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)*(v-m),0)/a.length)};
function bars(svg,groups,series,o){const Pl=Plot(svg,{w:o.w,h:o.h,x:[0,groups.length],y:o.y,m:o.m||{l:52,r:12,t:44,b:58}});Pl.axes({yt:o.yt,xt:[],yl:o.yl});
  const nb=series.length,bw=0.78/nb;groups.forEach((gname,gi)=>{series.forEach((s,si)=>{const v=s.v[gi];const x0=gi+0.11+si*bw;const r=Pl.rect(x0,o.y[0],x0+bw*0.92,v,'');r.setAttribute('fill',s.c);
      Pl.text(x0+bw*0.46,v,nf(v,1),'','middle',0,-5)});const lines=String(gname).split('\n');lines.forEach((l,k)=>T(Pl.top,Pl.X(gi+0.5),Pl.Y(o.y[0])+18+k*17,l,k?'':'lab'))});
  let lx=o.legendX||Pl.m.l;series.forEach(s=>{E('rect',{x:lx,y:12,width:14,height:14,fill:s.c},Pl.top);const t=T(Pl.top,lx+19,24,s.n,'','start');lx+=s.n.length*7.2+40});
  if(o.note)T(Pl.top,o.w-12,o.h-6,o.note,'','end');return Pl}

FIG['ssl-head']=root=>{const svg=svgOf(root);const F=SD.full;if(!F)return;const keys=['raw pixels','random encoder h','SimCLR z (after head)','SimCLR h (before head)'];
  bars(svg,['pixels\n784-d','random h\n64-d','SimCLR z\nafter head','SimCLR h\nbefore head'],[{n:'linear probe',c:'#4472c4',v:keys.map(k=>100*F[k][0])},{n:'kNN (k = 20)',c:'#ed7d31',v:keys.map(k=>100*F[k][1])}],
    {w:480,h:330,y:[80,100],yt:[80,85,90,95,100],yl:'test accuracy (%)',note:'all 60,000 labels · axis from 80 %'})};

FIG['ssl-abl']=root=>{const svg=svgOf(root);const A=SD.abl;if(!A)return;const ks=['full T','no crop / rotation','crop + rotation only'];
  bars(svg,['kNN, all labels','probe, m = 10'],[{n:'full T',c:'#4472c4',v:[100*A[ks[0]][0],100*A[ks[0]][1]]},{n:'no crop/rot.',c:'#c00000',v:[100*A[ks[1]][0],100*A[ks[1]][1]]},{n:'crop/rot. only',c:'#548235',v:[100*A[ks[2]][0],100*A[ks[2]][1]]}],
    {w:480,h:330,y:[75,100],yt:[75,80,85,90,95,100],yl:'test accuracy (%)',note:'300 steps each · axis from 75 %'})};

FIG['ssl-geo']=root=>{const svg=svgOf(root);const G=SD.geo;if(!G)return;
  const Pl=Plot(svg,{w:480,h:300,x:[-4.2,0.4],y:[-0.06,0.55],m:{l:52,r:14,t:16,b:54}});Pl.axes({xt:[-4,-3,-2,-1,0],yt:[0,0.25,0.5],yl:'alignment'});T(Pl.bg,(Pl.m.l+480-Pl.m.r)/2,292,'uniformity (lower = more spread)','lab');
  Pl.line(-3.876,-0.03,-3.876,0.55,'ln thin sm dash',Pl.bg);Pl.text(-3.82,0.5,'uniform on the sphere','','start',0,0,Pl.bg);
  const pts=[['random encoder (z)','random network','#7f7f7f','end',-10,-10],['SimCLR (z)','SimCLR','#4472c4','start',10,4],['SimSiam (z)','SimSiam','#548235','start',10,4],['no stop-gradient (z)','no stop-grad','#c00000','end',-10,20]];
  pts.forEach(([k,lab,c,an,dx,dy])=>{const v=G[k];if(!v)return;const d=Pl.dot(v[1],v[0],7,'pt');d.setAttribute('fill',c);const t=Pl.text(v[1],v[0],lab+' ('+nf(v[0],2)+', '+nf(v[1],2)+')','lab',an,dx,dy);t.style.fill=c;halo(t)})};

FIG['ssl-collapse']=root=>{const svg=svgOf(root);const Cd=SD.collapse;if(!Cd)return;
  const draw=w=>{initSvg(svg,620,380);
    if(w==='spec'){const all=[].concat(...Object.values(Cd.spec)).filter(v=>v>0);const lo=Math.floor(Math.log10(Math.min(...all))),hi=Math.ceil(Math.log10(Math.max(...all)));const SUP={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
      const Pl=Plot(svg,{at:[0,0],w:620,h:370,x:[1,64],y:[lo,hi],m:{l:60,r:16,t:40,b:46}});const yt=[];for(let k=lo;k<=hi;k++)yt.push(k);Pl.axes({xt:[1,16,32,48,64],yt:yt,fy:v=>'10'+String(v).split('').map(ch=>SUP[ch]).join(''),xl:'principal direction (sorted)',yl:'spread σₖ / √n'});
      [['SimCLR z','#4472c4','SimCLR'],['SimSiam z','#548235','SimSiam'],['no stop-gradient z','#c00000','no stop-grad']].forEach(([k,c,lab],j)=>{const p=Cd.spec[k];Pl.path(p.map((v,i)=>[i+1,Math.log10(Math.max(v,Math.pow(10,lo)))]),'ln').setAttribute('stroke',c);
        const t=T(svg,600,60+j*24,lab+': total spread '+nf(Cd.spec[k].reduce((u,v)=>u+v,0),2),'lab','end');t.style.fill=c});
      T(svg,330,24,'spectrum of 2,000 normalised embeddings (log scale)','lab');return}
    const Pl=Plot(svg,{at:[0,0],w:620,h:370,x:[0,300],y:[0,0.14],m:{l:60,r:16,t:40,b:46}});Pl.axes({xt:[0,100,200,300],yt:[0,0.05,0.1],xl:'training step',yl:'std of normalised z'});
    Pl.line(0,0.125,300,0.125,'ln thin sm dash',Pl.bg);Pl.text(4,0.125,'1/√64: spread over the sphere','','start',0,-6,Pl.bg);
    const S=[['ssl','#4472c4','SimCLR (negatives)',Cd.ssl_step,Cd.ssl],['siam','#548235','SimSiam (stop-grad)',Cd.siam_step,Cd.siam],['nosg','#c00000','no stop-gradient',Cd.siam_step,Cd.nosg]];
    S.forEach(([k,c,lab,xs,ys],j)=>{const on=w==='all'||w===k||(w==='siam'&&k==='nosg');const p=Pl.path(xs.map((x,i)=>[x,ys[i]]),'ln');p.setAttribute('stroke',c);p.setAttribute('stroke-width',on?3:1.4);p.setAttribute('stroke-opacity',on?1:0.3);
      xs.forEach((x,i)=>{const d=Pl.dot(x,ys[i],on?3.5:2,'');d.setAttribute('fill',c);d.setAttribute('fill-opacity',on?1:0.3)});
      const t=T(svg,600,176+j*24,lab+': '+nf(ys[ys.length-1],3),'lab','end');t.style.fill=c;if(!on)t.style.opacity=0.45});
    T(svg,330,24,w==='nosg'?'without the stop-gradient the embeddings shrink to one point':w==='siam'?'with the stop-gradient the spread stays':'spread of the embeddings during training','lab')};
  const cur=segs(root,'w',draw);draw(cur()||'all')};

FIG['ssl-few']=root=>{const svg=svgOf(root);const R=SD.few;if(!R)return;const M=[10,100,1000];
  const S=[['probe · pixels','#7f7f7f','pixels + probe','5 4',1],['probe · random encoder','#404040','random encoder + probe','2 4',1],['supervised from scratch','#c00000','from scratch','',2],['probe · SimCLR','#4472c4','SimCLR + probe','',3],['kNN · SimCLR','#4472c4','SimCLR + kNN','6 3',3],['fine-tuned SimCLR','#ed7d31','SimCLR fine-tuned','',4]];
  stepper(root,s=>{const Pl=Plot(svg,{w:620,h:390,x:[7,1400],y:[60,100],logx:true,m:{l:56,r:16,t:20,b:46}});
    Pl.axes({xt:M,fx:v=>v===1000?'1,000':String(v),yt:[60,70,80,90,100],xl:'labelled examples per class, m (log scale)',yl:'test accuracy (%)'});setV(root,'s',s+' / 4');
    let ly=0;S.forEach(([k,c,lab,dash,st])=>{if(s<st)return;const mu=M.map(m=>100*mean(R[k][String(m)])),sd=M.map(m=>100*sdev(R[k][String(m)]));
      const p=Pl.path(M.map((m,i)=>[m,mu[i]]),'ln');p.setAttribute('stroke',c);p.setAttribute('stroke-dasharray',dash);if(dash)p.setAttribute('stroke-width',2);
      M.forEach((m,i)=>{if(sd[i]>0.05)Pl.line(m,mu[i]-sd[i],m,mu[i]+sd[i],'ln thin').setAttribute('stroke',c);const d=Pl.dot(m,mu[i],4.5,'pt');d.setAttribute('fill',c)});
      const y=Pl.Y(60)-18-22*(5-ly);E('line',{x1:330,x2:362,y1:y-5,y2:y-5,stroke:c,'stroke-width':2.5,'stroke-dasharray':dash},Pl.top);
      const t=T(Pl.top,370,y,lab+'  '+mu.map(v=>nf(v,1)).join(' · '),'','start');t.style.fill='#1f1f1f';ly++});
    if(s>0)T(Pl.top,370,Pl.Y(60)-18-22*6,'m = 10 · 100 · 1,000:','lab','start')})};

FIG['ssl-tsne']=root=>{const svg=svgOf(root);const D=SD.tsne;if(!D)return;
  const draw=e=>{const P=D[e];const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]);const pad=4;
    const Pl=Plot(svg,{w:620,h:390,x:[Math.min(...xs)-pad,Math.max(...xs)+pad],y:[Math.min(...ys)-pad,Math.max(...ys)+pad],m:{l:10,r:10,t:30,b:10}});
    E('rect',{x:10,y:30,width:600,height:350,fill:'none',stroke:'#d0d0d0'},Pl.bg);
    P.forEach((p,i)=>{const d=Pl.dot(p[0],p[1],2.6,'');d.setAttribute('fill',TAB10[D.y[i]]);d.setAttribute('fill-opacity',0.8)});
    const L=[];for(let c=0;c<10;c++){const pc=P.filter((_,i)=>D.y[i]===c);const mx=pc.map(p=>p[0]).sort((a,b)=>a-b)[Math.floor(pc.length/2)],my=pc.map(p=>p[1]).sort((a,b)=>a-b)[Math.floor(pc.length/2)];L.push([Pl.X(mx),Pl.Y(my)])}
    for(let it=0;it<30;it++)for(let a=0;a<10;a++)for(let b=a+1;b<10;b++){const dx=L[b][0]-L[a][0],dy=L[b][1]-L[a][1];if(Math.abs(dx)<16&&Math.abs(dy)<22){const sy=dy>=0?1:-1;L[a][1]-=2*sy;L[b][1]+=2*sy}}
    L.forEach((p,c)=>{const t=T(Pl.top,p[0],p[1]+7,String(c),'lab big');t.setAttribute('style','fill:#1f1f1f;font-size:21px;paint-order:stroke;stroke:#fff;stroke-width:6px;font-weight:700')});
    T(Pl.top,310,20,'t-SNE of h, 1,000 test digits · '+(e==='ssl'?'SimCLR encoder':'random encoder')+' · colour = true digit','lab')};
  const cur=segs(root,'e',draw);draw(cur()||'rand')};
})();
