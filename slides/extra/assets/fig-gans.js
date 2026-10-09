/* Figures for extra/04_gans.html (generative adversarial networks). Uses ../assets/figures.js (MLFIG), ../neural_networks/assets/nn-core.js (MLNN)
   and gans-data.js (GANSDATA: the runs of the Extra 4 notebook). Colours: real data blue, generator / fakes orange, discriminator green, critic purple. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,q,setV,svgOf}=lib;const {TT,box,stepper,segs,cube}=window.MLNN;
const GD=window.GANSDATA;
const BL='#4472c4',OR='#ed7d31',GR='#548235',GRL='#70ad47',PU='#7030a0',RD='#c00000',GY='#7f7f7f',GO='#bf9000';
const nf=(v,d)=>{d=d===undefined?2:d;if(Math.abs(v)<0.5*Math.pow(10,-d))v=0;return v.toFixed(d).replace('-','−')};
const ln=(svg,a,b,c,w,dash)=>E('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:c||'#9aa5b8','stroke-width':w||1.6,'stroke-dasharray':dash||''},svg);
const dot=(svg,x,y,r,fill,stroke,sw)=>E('circle',{cx:x,cy:y,r:r,fill:fill,stroke:stroke||'#fff','stroke-width':sw===undefined?1.2:sw},svg);
const halo=t=>{t.setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:6px;stroke-linejoin:round');return t};
const col=(t,c)=>{t.style.fill=c;return t};
function onInput(root,k,draw){const inp=q(root,k);inp.addEventListener('input',draw);draw();return inp}
const sig=a=>1/(1+Math.exp(-a));
/* normal and mixture helpers (the notebook's p_data = 0.4 N(−2, 0.5²) + 0.6 N(2, 0.5²)) */
function erf(x){const s=x<0?-1:1;x=Math.abs(x);const t=1/(1+0.3275911*x);const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return s*y}
const Phi=z=>0.5*(1+erf(z/Math.SQRT2));const npdf=(x,m,s)=>Math.exp(-(x-m)*(x-m)/(2*s*s))/(s*Math.sqrt(2*Math.PI));
const MIX=[[0.4,-2,0.5],[0.6,2,0.5]];
const pmix=x=>MIX.reduce((a,[w,m,s])=>a+w*npdf(x,m,s),0);const Fmix=x=>MIX.reduce((a,[w,m,s])=>a+w*Phi((x-m)/s),0);
function Finv(u){let lo=-8,hi=8;for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(Fmix(mid)<u)lo=mid;else hi=mid}return (lo+hi)/2}
/* an image (data URI) inside an svg */
const img=(svg,x,y,w,h,href)=>{const im=E('image',{x:x,y:y,width:w,height:h,preserveAspectRatio:'none'},svg);im.setAttribute('href',href);im.style.imageRendering='pixelated';return im};

/* ---------- where we are: autoencoder, VAE, GAN ---------- */
FIG['gan-where']=root=>{const svg=initSvg(svgOf(root),1160,215);const W=386;
  const panel=(k,title,sub,hi)=>{const x0=k*W;E('rect',{x:x0+6,y:4,width:W-12,height:205,rx:8,fill:hi?'#fdf5ee':'#fafafa',stroke:hi?OR:'#d0d0d0','stroke-width':hi?2:1},svg);T(svg,x0+W/2,30,title,'lab');T(svg,x0+W/2,196,sub,'');return x0};
  const pic=(x,y,s,c)=>{const r=rng(s);for(let i=0;i<4;i++)for(let j=0;j<4;j++)E('rect',{x:x+j*9,y:y+i*9,width:9,height:9,fill:c==='blur'?'#bfbfbf':(r()<0.45?'#404040':'#f2f2f2'),stroke:'#fff','stroke-width':0.5},svg)};
  const zv=(x,y)=>{for(let i=0;i<4;i++)E('rect',{x:x,y:y+i*10,width:12,height:10,fill:['#dae3f3','#8eaadb','#c9d6ee','#4472c4'][i],stroke:'#fff'},svg)};
  let x0=panel(0,'Autoencoder (Extra 3)','compress x to z, reconstruct: no new samples');
  pic(x0+22,86,2);arrowPx(svg,x0+62,104,x0+86,104,'ln thin sm','fm');box(svg,x0+88,86,62,36,'enc','#dae3f3',{cls:''});arrowPx(svg,x0+152,104,x0+172,104,'ln thin sm','fm');zv(x0+176,84);
  arrowPx(svg,x0+192,104,x0+212,104,'ln thin sm','fm');box(svg,x0+214,86,62,36,'dec','#dae3f3',{cls:''});arrowPx(svg,x0+278,104,x0+302,104,'ln thin sm','fm');pic(x0+306,86,2);
  T(svg,x0+40,142,'x','');T(svg,x0+182,142,'z','');T(svg,x0+324,142,'x̂','');
  x0=panel(1,'VAE (Extra 3)','ELBO = reconstruction − KL; samples blurry');
  T(svg,x0+60,82,'z ~ N(0, I)','');zv(x0+54,90);arrowPx(svg,x0+72,110,x0+130,110,'ln thin sm','fm');box(svg,x0+132,92,80,36,'decoder','#dae3f3',{cls:''});
  arrowPx(svg,x0+214,110,x0+268,110,'ln thin sm','fm');pic(x0+272,92,5,'blur');T(svg,x0+290,150,'a blurry sample','');T(svg,x0+172,150,'explicit density bound','');
  x0=panel(2,'GAN (Extra 4)','a game between two networks; samples sharp',true);
  zv(x0+26,62);T(svg,x0+32,52,'z','');arrowPx(svg,x0+42,82,x0+62,82,'ln thin sm','fm');box(svg,x0+64,64,46,36,'G','#fbe5d6',{cls:'lab'});arrowPx(svg,x0+112,82,x0+134,82,'ln thin sm','fm');
  pic(x0+138,64,9);T(svg,x0+156,116,'fake','');pic(x0+138,128,4);T(svg,x0+156,180,'real','');
  arrowPx(svg,x0+178,82,x0+226,108,'ln thin sm','fm');arrowPx(svg,x0+178,146,x0+226,122,'ln thin sm','fm');box(svg,x0+228,96,46,36,'D','#e2f0d9',{cls:'lab'});
  arrowPx(svg,x0+276,114,x0+296,114,'ln thin sm','fm');T(svg,x0+300,110,'P(real)','','start');T(svg,x0+300,128,'= 0.73','','start')};

/* ---------- explicit density vs implicit sampler ---------- */
FIG['gan-explicit']=root=>{const svg=initSvg(svgOf(root),620,300);
  const A=Plot(svg,{at:[0,0],w:300,h:300,x:[-4.5,4.5],y:[0,0.55],m:{l:16,r:10,t:40,b:40}});A.axes({grid:false,xt:[-4,-2,0,2,4]});
  A.fn(pmix,'ln sb',-4.5,4.5,300);const x0=1.4;A.line(x0,0,x0,pmix(x0),'ln thin sr dash');A.dot(x0,pmix(x0),5,'fr pt');A.text(x0,pmix(x0),'p(x) = '+nf(pmix(x0),2),'lab','end',-8,-4);
  T(A.root,150,18,'explicit: a formula for p(x)','lab');T(A.root,150,296,'evaluate any x; sample too (VAE, flows, PixelCNN)','');
  const B=Plot(svg,{at:[320,0],w:300,h:300,x:[-4.5,4.5],y:[0,0.55],m:{l:16,r:10,t:40,b:40}});B.axes({grid:false,xt:[-4,-2,0,2,4]});
  const r=rng(8);const xs=[];for(let i=0;i<400;i++){const k=r()<0.4?0:1;xs.push(MIX[k][1]+MIX[k][2]*randn(r))}
  const bw=0.3;for(let b=-4.5;b<4.5;b+=bw){const n=xs.filter(v=>v>=b&&v<b+bw).length;if(n)B.rect(b+0.02,0,b+bw-0.02,n/(400*bw),'fos')}
  xs.slice(0,60).forEach((v,i)=>B.dot(v,0.02+0.012*(i%4),2.6,'fo'));B.text(1.4,0.47,'p(x) = ?','lab big','middle',0,0);
  T(B.root,150,18,'implicit: only a sampler x = G(z)','lab');T(B.root,150,296,'samples, histograms, no formula (GAN)','')};

/* ---------- a generator is a push-forward ---------- */
FIG['gan-push']=root=>{const svg=svgOf(root);const r=rng(3);const Z=[...Array(20000)].map(()=>randn(r));const zg=[...Array(241)].map((_,i)=>-3+6*i/240);const Gs=zg.map(z=>Finv(Phi(z)));
  const GsAt=z=>{const u=(z+3)/6*240;const i=Math.max(0,Math.min(239,Math.floor(u)));const f=u-i;return Gs[i]*(1-f)+Gs[i+1]*f};
  const GsZ=Z.map(z=>Math.abs(z)<3?GsAt(z):Finv(Phi(z)));
  onInput(root,'t',()=>{const t=+q(root,'t').value;setV(root,'t',t.toFixed(2));initSvg(svg,620,380);
    const P=Plot(svg,{at:[0,0],w:450,h:282,x:[-3,3],y:[-4.2,4.2],m:{l:52,r:8,t:30,b:14}});P.axes({xt:[],yt:[-4,-2,0,2,4],yl:'x = G(z)'});
    P.line(-3,-3,3,3,'ln thin sm dash',P.bg);P.path(zg.map((z,i)=>[z,(1-t)*z+t*Gs[i]]),'ln sg');
    TT(P.top,240,18,'G_t(z) = (1 − t) z + t G*(z),   t = '+t.toFixed(2),'lab');
    /* noise density below, aligned with the z axis */
    const yb=330,hb=50;const pts=zg.map(z=>[P.X(z),yb-hb*npdf(z,0,1)/0.4]);E('polygon',{points:[[P.X(-3),yb]].concat(pts,[[P.X(3),yb]]).map(p=>p.join(',')).join(' '),fill:'#d9d9d9'},svg);
    ln(svg,[P.X(-3),yb],[P.X(3),yb],'#595959',1.2);[-3,-2,-1,0,1,2,3].forEach(z=>T(svg,P.X(z),yb+17,String(z).replace('-','−'),''));T(svg,P.X(0),yb+36,'noise z ~ N(0, 1)','lab');
    /* histogram of x = G_t(z) on the right, aligned with the x axis of the map */
    const bw=0.15,x0=462,L=140;const cnt={};GsZ.forEach((g,i)=>{const v=(1-t)*Z[i]+t*g;const b=Math.floor((v+4.2)/bw);cnt[b]=(cnt[b]||0)+1});
    Object.keys(cnt).forEach(b=>{const lo=-4.2+b*bw;if(lo<-4.2||lo>=4.2)return;const d=cnt[b]/(Z.length*bw);E('rect',{x:x0,y:P.Y(lo+bw),width:Math.min(L,L*d/0.55),height:Math.max(0.5,P.Y(lo)-P.Y(lo+bw)-0.6),fill:OR,opacity:0.75},svg)});
    const pp=[];for(let i=0;i<=200;i++){const x=-4.2+8.4*i/200;pp.push([x0+L*pmix(x)/0.55,P.Y(x)].join(','))}E('polyline',{points:pp.join(' '),fill:'none',stroke:'#1f1f1f','stroke-width':1.6,'stroke-dasharray':'5 4'},svg);
    ln(svg,[x0,P.Y(-4.2)],[x0,P.Y(4.2)],'#595959',1.2);T(svg,x0+70,18,'density of x','lab');T(svg,x0+70,P.Y(-4.2)+20,'bars: G_t(z)','');TT(svg,x0+70,P.Y(-4.2)+38,'dashed: p_{data}','')})};

/* ---------- uses ---------- */
FIG['gan-use']=root=>{const svg=initSvg(svgOf(root),350,110);const k=root.dataset.use;
  const face=(cx,cy,s,c)=>{E('ellipse',{cx:cx,cy:cy,rx:20*s,ry:25*s,fill:c||'#f8cbad',stroke:'#7f6000','stroke-width':1},svg);dot(svg,cx-7*s,cy-5*s,2.6*s,'#404040',null,0);dot(svg,cx+7*s,cy-5*s,2.6*s,'#404040',null,0);E('path',{d:'M'+(cx-8*s)+','+(cy+9*s)+' q'+8*s+','+7*s+' '+16*s+',0',fill:'none',stroke:'#843c0c','stroke-width':1.5},svg);E('path',{d:'M'+(cx-20*s)+','+(cy-8*s)+' q'+20*s+','+(-30*s)+' '+40*s+',0',fill:'#7f6000',opacity:0.8},svg)};
  const pix=(x,y,n,cs,seed,soft)=>{const r=rng(seed);for(let i=0;i<n;i++)for(let j=0;j<n;j++){const v=0.5+0.5*Math.sin(i*0.9+j*0.7+seed)*Math.cos(j*0.5);const g=Math.round(70+150*(soft?v:(r()<0.5?v:1-v)));E('rect',{x:x+j*cs,y:y+i*cs,width:cs,height:cs,fill:'rgb('+g+','+Math.round(g*0.95)+','+Math.round(g*0.85)+')'},svg)}};
  if(k==='synth'){[[46,58,1,'#f8cbad'],[112,58,1,'#e2c09a'],[178,58,1,'#fbe5d6']].forEach(([x,y,s,c])=>face(x,y,s,c));T(svg,112,104,'faces of people who do not exist','');box(svg,240,36,100,40,'StyleGAN, 2019','#fff2cc',{cls:''})}
  else if(k==='sr'){pix(20,20,6,12,3);arrowPx(svg,98,56,128,56,'ln thin sk','fk');pix(134,20,24,3,3,true);T(svg,56,104,'low resolution','');T(svg,170,104,'×4, sharp edges','');box(svg,240,36,100,40,'SRGAN, 2017','#fff2cc',{cls:''})}
  else if(k==='aug'){const cl=[[30,'#4472c4',6],[90,'#70ad47',5],[150,'#c00000',1]];cl.forEach(([x,c,n],i)=>{for(let j=0;j<n;j++)E('rect',{x:x+(j%3)*14,y:64-Math.floor(j/3)*14,width:12,height:12,fill:c},svg)});
    for(let j=1;j<5;j++)E('rect',{x:150+(j%3)*14,y:64-Math.floor(j/3)*14,width:12,height:12,fill:'none',stroke:RD,'stroke-width':1.5,'stroke-dasharray':'3 2'},svg);
    T(svg,50,98,'common','');T(svg,110,98,'common','');T(svg,172,98,'rare + fakes','');box(svg,240,30,100,50,'rare damage,\nrare tumours','#fff2cc',{cls:'',lh:19})}
  else if(k==='tab'){const r=rng(2);for(let i=0;i<5;i++)for(let j=0;j<4;j++){E('rect',{x:24+j*36,y:14+i*17,width:36,height:17,fill:i===0?'#dae3f3':'#fff',stroke:'#bfbfbf'},svg);if(i)T(svg,42+j*36,27+i*17,String(Math.floor(10+r()*80)),'').style.fontSize='13px'}
    E('path',{d:'M196,30 l22,-8 l22,8 v22 q-2,22 -22,30 q-20,-8 -22,-30 z',fill:'#e2f0d9',stroke:GR,'stroke-width':1.5},svg);T(svg,218,60,'?','lab');box(svg,252,30,92,50,'synthetic\ntables','#fff2cc',{cls:'',lh:19})}
  else if(k==='i2i'){E('rect',{x:20,y:16,width:70,height:70,fill:'#fff',stroke:'#404040'},svg);E('path',{d:'M30,70 L45,40 L60,60 L72,30 L82,70 Z',fill:'none',stroke:'#404040','stroke-width':1.6},svg);
    arrowPx(svg,96,51,126,51,'ln thin sk','fk');const g=E('g',{},svg);E('rect',{x:132,y:16,width:70,height:70,fill:'#9dc3e6'},g);E('path',{d:'M132,86 L147,48 L162,66 L174,34 L202,86 Z',fill:'#548235'},g);dot(svg,190,30,8,'#ffc000',null,0);
    T(svg,55,104,'sketch','');T(svg,167,104,'photo','');box(svg,240,30,100,50,'pix2pix,\nCycleGAN','#fff2cc',{cls:'',lh:19})}
  else if(k==='loss'){box(svg,18,30,70,40,'model','#dae3f3',{cls:''});arrowPx(svg,90,50,114,50,'ln thin sk','fk');pix(118,26,8,6,5,true);arrowPx(svg,170,50,194,50,'ln thin sk','fk');box(svg,196,30,40,40,'D','#e2f0d9',{cls:'lab'});
    E('path',{d:'M216,72 C216,100 54,100 54,72',fill:'none',stroke:RD,'stroke-width':1.6,'stroke-dasharray':'5 4'},svg);T(svg,135,106,'"looks real" as an extra loss','');box(svg,246,30,96,50,'VQGAN, latent\ndiffusion','#fff2cc',{cls:'',lh:19})}};

/* ---------- the GAN architecture ---------- */
FIG['gan-arch']=root=>{const svg=initSvg(svgOf(root),1160,230);
  const zv=(x,y)=>{for(let i=0;i<6;i++)E('rect',{x:x,y:y+i*14,width:18,height:14,fill:['#dae3f3','#8eaadb','#c9d6ee','#4472c4','#b4c7e7','#2f5597'][i],stroke:'#fff'},svg)};
  const pic=(x,y,s,c)=>{const r=rng(s);for(let i=0;i<5;i++)for(let j=0;j<5;j++)E('rect',{x:x+j*11,y:y+i*11,width:11,height:11,fill:r()<0.42?(c||'#404040'):'#f2f2f2',stroke:'#fff','stroke-width':0.5},svg)};
  zv(60,40);T(svg,69,30,'z ~ N(0, I)','lab');T(svg,69,148,'noise','');
  arrowPx(svg,86,82,150,82,'ln sk','fk');box(svg,154,52,120,60,'','#fbe5d6',{});TT(svg,214,89,'G_θ','lab big');T(svg,214,130,'generator','');
  arrowPx(svg,276,82,350,82,'ln sk','fk');pic(356,55,9,'#843c0c');T(svg,383,130,'fake  G(z)','lab');
  pic(356,150,4);TT(svg,383,222,'real  x ~ p_{data}','lab');T(svg,240,190,'training set','');arrowPx(svg,300,178,348,178,'ln thin sm','fm');
  arrowPx(svg,418,82,530,118,'ln sk','fk');arrowPx(svg,418,178,530,142,'ln sk','fk');box(svg,534,100,120,60,'','#e2f0d9',{});TT(svg,594,137,'D_φ','lab big');T(svg,594,178,'discriminator','');
  arrowPx(svg,656,130,712,130,'ln sk','fk');T(svg,720,126,'D(x) = P(real)','lab','start');T(svg,720,148,'one number in (0, 1)','','start');
  box(svg,900,40,240,66,'','#e2f0d9',{stroke:GR});T(svg,1020,64,'D: real → 1, fake → 0','lab');T(svg,1020,88,'maximise V (a classifier)','');
  box(svg,900,124,240,66,'','#fbe5d6',{stroke:OR});T(svg,1020,148,'G: make D say 1 on fakes','lab');T(svg,1020,172,'minimise V','');
  E('path',{d:'M594,98 C594,14 214,14 214,50',fill:'none',stroke:RD,'stroke-width':2,'stroke-dasharray':'7 5'},svg);arrowPx(svg,214,40,214,50,'ln thin sr','fr');
  halo(col(T(svg,404,22,'G learns only through the gradient of D','lab'),RD))};

/* ---------- one round of the game with numbers ---------- */
FIG['gan-toy']=root=>{const svg=svgOf(root);const xr=[1.5,2.5],zt=[-0.5,0.5];const w0=1,b0=-1,eta=1;
  const xf=zt.map(z=>z);const Dr=xr.map(x=>sig(w0*x+b0)),Df=xf.map(x=>sig(w0*x+b0));
  const gw=-((1-Dr[0])*xr[0]+(1-Dr[1])*xr[1])/2+(Df[0]*xf[0]+Df[1]*xf[1])/2,gb=-((1-Dr[0])+(1-Dr[1]))/2+(Df[0]+Df[1])/2;const w1=w0-eta*gw,b1=b0-eta*gb;
  const Df1=xf.map(x=>sig(w1*x+b1));const gth=-((1-Df1[0])+(1-Df1[1]))/2*w1;const th1=-eta*gth;const xf2=zt.map(z=>th1+z);const Df2=xf2.map(x=>sig(w1*x+b1));
  stepper(root,s=>{initSvg(svg,620,350);const P=Plot(svg,{at:[0,0],w:620,h:350,x:[-1.6,3.6],y:[0,1.08],m:{l:52,r:14,t:30,b:44}});
    P.axes({xt:[-1,0,1,2,3],yt:[0,0.5,1],xl:'x',yl:'D(x)'});
    if(s<2)P.fn(x=>sig(w0*x+b0),'ln sg',-1.6,3.6,200);else{P.fn(x=>sig(w0*x+b0),'ln thin sg dash',-1.6,3.6,200);P.fn(x=>sig(w1*x+b1),'ln sg',-1.6,3.6,200)}
    P.line(1,0,1,1.05,'ln thin sm dot2');P.text(1,1.04,'wx + b = 0','','start',5,4);
    const Dnow=s>=2?(x=>sig(w1*x+b1)):(x=>sig(w0*x+b0));
    xr.forEach(x=>{const c=P.dot(x,Dnow(x),8,'pt');c.setAttribute('fill',BL);if(s>=1)P.text(x,Dnow(x),nf(Dnow(x),3),'lab','middle',0,-14)});
    const fx=s>=3?xf2:xf;if(s>=3)xf.forEach((x,i)=>{const c=P.dot(x,Dnow(x),7,'pt');c.setAttribute('fill',OR);c.setAttribute('fill-opacity','0.3');lib.arrow(P,x+0.08,0.08,xf2[i]-0.1,0.08,'ln thin so','fo')});
    fx.forEach(x=>{const c=P.dot(x,Dnow(x),8,'pt');c.setAttribute('fill',OR);if(s>=1)P.text(x,Dnow(x),nf(Dnow(x),3),'lab','middle',0,22)});
    const ttl=['real x = 1.5, 2.5 (blue) · fakes θ + z = −0.5, 0.5 (orange)','D(x) = σ(x − 1): the fakes already look fake','D step: w 1 → '+nf(w1,3)+', b stays −1: steeper','G step: θ 0 → '+nf(th1,3)+', the fakes move right'][s];
    T(P.top,330,18,ttl,'lab');
    if(s===3)P.text(-1.5,0.95,'D on the new fakes: '+nf(Df2[0],3)+', '+nf(Df2[1],3),'','start',0,0)})};

/* ---------- the 1-D GAN during training ---------- */
FIG['gan-1d']=root=>{const svg=svgOf(root);const S=GD.steps;
  onInput(root,'k',()=>{const k=+q(root,'k').value;const st=S[k];setV(root,'k',st);initSvg(svg,620,360);
    const P=Plot(svg,{w:620,h:360,x:[-5,5],y:[0,1.05],m:{l:48,r:14,t:30,b:42}});P.axes({xt:[-4,-2,0,2,4],yt:[0,0.25,0.5,0.75,1],xl:'x'});
    P.poly([[-5,0]].concat(GD.grid.map((x,i)=>[x,GD.pd[i]]),[[5,0]]),'fbs',P.bg);P.path(GD.grid.map((x,i)=>[x,GD.pd[i]]),'ln thin sb',P.bg);
    P.line(-5,0.5,5,0.5,'ln thin sm dot2',P.bg);
    P.path(GD.grid.map((x,i)=>[x,Math.min(1.04,GD.pg[k][i])]),'ln so');P.path(GD.grid.map((x,i)=>[x,GD.D[k][i]]),'ln sg');
    TT(P.top,334,18,'iteration '+st+' · JS(p_{data} ‖ p_g) = '+nf(GD.js[k],3),'lab');
    const lg=[[BL,'p_{data}'],[OR,'p_g'],[GRL,'D(x)']];lg.forEach(([c,t],i)=>{const y=52+i*20;ln(svg,[536,y-5],[560,y-5],c,3);TT(svg,566,y,t,'','start')})})};

/* ---------- the optimal discriminator: maximise a log y + b log(1 − y) ---------- */
FIG['gan-dstar']=root=>{const svg=svgOf(root);
  const draw=()=>{const a=+q(root,'a').value,b=+q(root,'b').value;setV(root,'a',a.toFixed(2));setV(root,'b',b.toFixed(2));initSvg(svg,620,350);
    const f=y=>a*Math.log(y)+b*Math.log(1-y);const ys=a+b>0?a/(a+b):0.5;const fmax=a+b>0?f(Math.min(0.999,Math.max(0.001,ys))):0;
    const lo=Math.min(-3,fmax-2.5);const P=Plot(svg,{w:620,h:350,x:[0,1],y:[lo,Math.max(0.2,fmax+0.4)],m:{l:56,r:16,t:30,b:42}});
    const yt=[];for(let v=Math.ceil(lo);v<=Math.max(0.2,fmax+0.4);v++)yt.push(v);P.axes({xt:[0,0.25,0.5,0.75,1],yt:yt,fy:v=>String(v).replace('-','−'),xl:'y = D(x)',yl:'contribution to V at this x'});
    P.fn(f,'ln sg',0.002,0.998,400);if(a+b>0){P.line(ys,lo,ys,fmax,'ln thin sr dash');P.dot(ys,fmax,6,'fr pt');P.text(ys,lo,'D* = '+nf(ys,3),'lab',ys>0.75?'end':'start',ys>0.75?-6:6,-10)}
    TT(P.top,330,18,'f(y) = '+a.toFixed(2)+' log y + '+b.toFixed(2)+' log(1 − y)','lab')};
  onInput(root,'a',draw);onInput(root,'b',draw)};

/* ---------- the lab check of D* ---------- */
FIG['gan-dstar-lab']=root=>{const svg=initSvg(svgOf(root),620,400);const d=GD.dstar;
  const P=Plot(svg,{at:[0,0],w:620,h:340,x:[-5,5],y:[0,1.05],m:{l:48,r:14,t:30,b:42}});P.axes({xt:[-4,-2,0,2,4],yt:[0,0.5,1],xl:'x'});
  let run=null;GD.grid.forEach((x,i)=>{if(!d.mask[i]){if(run===null)run=x}else if(run!==null){P.rect(run-0.05,0,x-0.05,1.05,'',P.bg).setAttribute('fill','#ededed');run=null}});if(run!==null)P.rect(run-0.05,0,5,1.05,'',P.bg).setAttribute('fill','#ededed');
  P.poly([[-5,0]].concat(GD.grid.map((x,i)=>[x,GD.pd[i]]),[[5,0]]),'fbs',P.bg);P.path(GD.grid.map((x,i)=>[x,d.pg[i]]),'ln thin so');
  P.path(GD.grid.map((x,i)=>[x,d.Dstar[i]]),'ln sk dash');const tr=P.path(GD.grid.map((x,i)=>[x,d.Dtr[i]]),'ln sg');tr.setAttribute('opacity','0.85');
  T(P.top,334,18,'G frozen at iteration 200 · mean |D − D*| = '+nf(d.mae,3),'lab');
  const lg=[[BL,'p_{data}',''],[OR,'p_g',''],['#1f1f1f','D* = p_{data} / (p_{data} + p_g)','6 5'],[GRL,'D trained 3000 steps','']];lg.forEach(([c,t,da],i)=>{const x=i%2?330:60,y=368+(i>>1)*22;ln(svg,[x,y-5],[x+24,y-5],c,3,da);TT(svg,x+30,y,t,'','start')});
  T(svg,600,52,'grey: no samples, D free','','end')};

/* ---------- JS during training ---------- */
FIG['gan-js']=root=>{const svg=initSvg(svgOf(root),480,320);const S=GD.steps;
  const P=Plot(svg,{at:[0,0],w:480,h:312,x:[10,4000],y:[0,0.75],logx:true,m:{l:50,r:14,t:30,b:42}});P.axes({xt:[10,100,1000],fx:v=>String(v),yt:[0,0.2,0.4,0.6],xl:'iteration (log scale)',yl:'JS (nats)'});
  P.line(10,Math.log(2),4000,Math.log(2),'ln thin sr dash',P.bg);P.text(4000,Math.log(2),'log 2 = 0.693: no overlap','','end',-4,-6,P.bg);
  P.path(S.map((s,i)=>[Math.max(s,10),GD.js[i]]).filter((p,i)=>S[i]>=10),'ln sk');P.dot(4000,GD.js[S.length-1],5,'fk');halo(P.text(4000,0.2,'iteration 4000: '+nf(GD.js[S.length-1],3),'lab','end',0,0));
  TT(P.top,252,18,'JS(p_{data} ‖ p_g) of the 1-D GAN','lab')};

/* ---------- saturating vs non-saturating ---------- */
FIG['gan-sat']=root=>{const svg=svgOf(root);
  onInput(root,'d',()=>{const d=+q(root,'d').value;setV(root,'d',d.toFixed(3));initSvg(svg,620,330);
    const A=Plot(svg,{at:[0,0],w:310,h:330,x:[0,1],y:[-5,5],m:{l:44,r:10,t:30,b:42}});A.axes({xt:[0,0.5,1],yt:[-4,-2,0,2,4],fy:v=>String(v).replace('-','−'),xl:'D(G(z))'});
    A.fn(v=>Math.log(1-v),'ln sr',0.001,0.999);A.fn(v=>-Math.log(v),'ln sb',0.007,0.999);A.dot(d,Math.max(-5,Math.log(1-d)),5,'fr pt');A.dot(d,Math.min(5,-Math.log(d)),5,'fb pt');
    T(A.top,160,18,'generator losses (minimised)','lab');A.text(0.97,-2.8,'minimax: log(1 − D)','','end',0,0).style.fill=RD;A.text(0.25,3.9,'non-saturating: −log D','','start',0,0).style.fill=BL;
    const B=Plot(svg,{at:[310,0],w:310,h:330,x:[0,1],y:[0,1.05],m:{l:44,r:10,t:30,b:42}});B.axes({xt:[0,0.5,1],yt:[0,0.5,1],xl:'D(G(z))'});
    B.fn(v=>v,'ln sr');B.fn(v=>1-v,'ln sb');B.line(d,0,d,1.05,'ln thin sm dash');B.dot(d,d,5,'fr pt');B.dot(d,1-d,5,'fb pt');
    T(B.top,160,18,'|∂ loss / ∂ logit|','lab');B.text(d,1-d,nf(1-d,3),'lab',d>0.6?'end':'start',d>0.6?-8:8,-6).style.fill=BL;B.text(d,d,nf(d,3),'lab',d>0.6?'end':'start',d>0.6?-8:8,14).style.fill=RD})};

/* ---------- the ring of 8 Gaussians ---------- */
FIG['gan-ring']=root=>{const svg=svgOf(root);const RG=GD.ring;let kind='vanilla';const C=[...Array(8)].map((_,i)=>[2*Math.cos(i*Math.PI/4),2*Math.sin(i*Math.PI/4)]);
  function draw(){const k=+q(root,'s').value;const R=RG[kind];const st=R.steps[k];setV(root,'s',st);initSvg(svg,620,380);
    const P=Plot(svg,{at:[0,0],w:380,h:380,x:[-3,3],y:[-3,3],m:{l:40,r:10,t:34,b:36}});P.axes({xt:[-2,0,2],yt:[-2,0,2]});
    C.forEach(c=>{const e=P.dot(c[0],c[1],P.X(0.15)-P.X(0),'');e.setAttribute('fill','none');e.setAttribute('stroke',BL);e.setAttribute('stroke-width','1.6')});
    R.x[k].forEach(p=>{const c=P.dot(Math.max(-3,Math.min(3,p[0])),Math.max(-3,Math.min(3,p[1])),2.4,'');c.setAttribute('fill',kind==='vanilla'?OR:PU);c.setAttribute('fill-opacity','0.6')});
    T(P.top,205,20,(kind==='vanilla'?'vanilla GAN':'WGAN-GP')+' · generator step '+st,'lab');
    /* per-mode counts as bars */
    const x0=400,y0=60;T(svg,505,y0-26,'high-quality samples per mode','lab');const cnt=R.counts[k];const mx=250;
    cnt.forEach((v,i)=>{const y=y0+i*30;T(svg,x0+14,y+15,'mode '+(i+1),'','start');E('rect',{x:x0+70,y:y,width:Math.min(140,140*v/mx),height:20,fill:kind==='vanilla'?OR:PU,opacity:v>=10?0.9:0.35},svg);T(svg,x0+76+Math.min(140,140*v/mx),y+15,String(v),'','start')});
    const m=R.modes[k],hq=R.hq[k];const t=T(svg,505,y0+8*30+22,m+' of 8 modes covered','lab');t.style.fill=m===8?GR:RD;T(svg,505,y0+8*30+44,'quality: '+nf(hq,2)+' of samples near a mode','')}
  segs(root,'kind',v=>{kind=v;draw()});onInput(root,'s',draw)};

/* ---------- forward vs reverse KL ---------- */
FIG['gan-kl']=root=>{const svg=svgOf(root);const p=x=>0.5*npdf(x,-2,0.6)+0.5*npdf(x,2,0.6);const xs=[...Array(601)].map((_,i)=>-6+12*i/600),dx=0.02;
  const KL=(a,b)=>xs.reduce((s,x)=>{const pa=a(x),pb=b(x);return pa>1e-300?s+pa*Math.log(pa/Math.max(pb,1e-300))*dx:s},0);
  let best={f:null,r:null};let bf=1e9,br=1e9;for(let m=-3;m<=3.001;m+=0.1)for(let s=0.3;s<=3.001;s+=0.05){const qd=x=>npdf(x,m,s);const f=KL(p,qd),r=KL(qd,p);if(f<bf){bf=f;best.f=[m,s,f]}if(r<br){br=r;best.r=[m,s,r]}}
  const draw=v=>{initSvg(svg,620,330);const P=Plot(svg,{w:620,h:330,x:[-5,5],y:[0,0.75],m:{l:40,r:14,t:30,b:42}});P.axes({xt:[-4,-2,0,2,4],yt:[0,0.25,0.5,0.75],xl:'x'});
    P.poly([[-5,0]].concat(xs.filter(x=>Math.abs(x)<=5).map(x=>[x,p(x)]),[[5,0]]),'fbs',P.bg);P.fn(p,'ln thin sb',-5,5,300,P.bg);
    const [m,s,val]=v==='f'?best.f:best.r;P.fn(x=>npdf(x,m,s),'ln so',-5,5,300);
    T(P.top,330,18,v==='f'?'min over q of KL(p ‖ q): q covers both modes (mode covering)':'min over q of KL(q ‖ p): q picks one mode (mode seeking)','lab');
    P.text(-4.9,0.54,'best Gaussian: μ = '+nf(m,1)+', σ = '+nf(s,2)+', KL = '+nf(val,3),'','start',0,0);P.text(-4.9,0.66,'blue: p (two modes)','','start',0,0).style.fill=BL;P.text(-4.9,0.6,'orange: the best single Gaussian q','','start',0,0).style.fill=OR};
  const cur=segs(root,'kl',draw);draw(cur()||'f')};

/* ---------- the bilinear game ---------- */
FIG['gan-bilinear']=root=>{const svg=svgOf(root);const eta=0.2,TMAX=100;
  const run=kind=>{let x=1,y=0,xp=1,yp=0;const o=[[x,y]];for(let t=0;t<TMAX;t++){if(kind==='sim'){[x,y]=[x-eta*y,y+eta*x]}else if(kind==='alt'){x=x-eta*y;y=y+eta*x}else if(kind==='eg'){const xh=x-eta*y,yh=y+eta*x;[x,y]=[x-eta*yh,y+eta*xh]}else{const xn=x-2*eta*y+eta*yp,yn=y+2*eta*x-eta*xp;xp=x;yp=y;x=xn;y=yn}o.push([x,y])}return o};
  const TR={sim:run('sim'),alt:run('alt'),eg:run('eg'),opt:run('opt')};const NAME={sim:'simultaneous',alt:'alternating',eg:'extragradient',opt:'optimistic'};let m='sim';
  function draw(){const t=+q(root,'t').value;setV(root,'t',t);initSvg(svg,620,370);const L=m==='sim'?8:1.3;const tr=TR[m];
    const P=Plot(svg,{at:[0,0],w:380,h:370,x:[-L,L],y:[-L,L],m:{l:44,r:10,t:34,b:42}});const tk=m==='sim'?[-8,-4,0,4,8]:[-1,0,1];P.axes({xt:tk,yt:tk,fx:v=>String(v).replace('-','−'),fy:v=>String(v).replace('-','−'),xl:'x (minimises xy)',yl:'y (maximises xy)'});
    const circ=[];for(let i=0;i<=100;i++){const a=2*Math.PI*i/100;circ.push([Math.cos(a),Math.sin(a)])}P.path(circ,'ln thin sm dot2',P.bg);
    P.path(tr.slice(0,t+1),'ln thin '+(m==='sim'?'sr':m==='alt'?'so':m==='eg'?'sg':'sb'));tr.slice(0,t+1).forEach((p,i)=>{if(i%5===0)P.dot(p[0],p[1],2.2,'fm')});P.dot(tr[t][0],tr[t][1],6,'fk pt');
    const st=E('text',{x:P.X(0),y:P.Y(0)+6,'text-anchor':'middle','font-size':'18px'},P.top);st.textContent='★';st.style.fill=GO;
    T(P.top,205,20,NAME[m]+' steps, η = 0.2','lab');
    const r=Math.hypot(tr[t][0],tr[t][1]);const x0=400;T(svg,x0,64,'distance to (0, 0)','lab','start');T(svg,x0,92,'after '+t+' steps: '+nf(r,3),'lab','start');
    const pred={sim:'(1 + η²)^{t/2} = '+nf(Math.pow(1+eta*eta,t/2),3),alt:'det = 1: a closed orbit',eg:'(1 − η² + η⁴)^{t/2} = '+nf(Math.pow(1-eta*eta+eta**4,t/2),3),opt:'shrinks for small η'}[m];TT(svg,x0,120,pred,'','start');
    const Q=Plot(svg,{at:[392,150],w:228,h:200,x:[0,TMAX],y:[-2.3,2.1],m:{l:40,r:8,t:12,b:40}});Q.axes({xt:[0,50,100],yt:[-2,-1,0,1,2],fy:v=>v===0?'1':'10'+(v<0?'⁻':'')+['','¹','²'][Math.abs(v)],xl:'step'});
    Object.keys(TR).forEach(k=>{const p=Q.path(TR[k].map((v,i)=>[i,Math.log10(Math.hypot(v[0],v[1])+1e-9)]),'ln thin '+(k==='sim'?'sr':k==='alt'?'so':k==='eg'?'sg':'sb'));if(k!==m)p.setAttribute('opacity','0.3')});Q.dot(t,Math.log10(r+1e-9),4,'fk');
    T(Q.top,124,4,'distance, log scale','')}
  segs(root,'m',v=>{m=v;draw()});onInput(root,'t',draw)};

/* ---------- JS vs W1 when the supports separate ---------- */
FIG['gan-jsw']=root=>{const svg=svgOf(root);const JS=th=>Math.min(Math.abs(th),1)*Math.log(2);
  onInput(root,'th',()=>{const th=+q(root,'th').value;setV(root,'th',nf(th,2));initSvg(svg,620,380);
    const A=Plot(svg,{at:[0,0],w:620,h:130,x:[-3,4],y:[0,1.4],m:{l:48,r:14,t:30,b:30}});A.axes({grid:false,xt:[-3,-2,-1,0,1,2,3,4],fy:v=>v});
    A.rect(0,0,1,1,'fbs');A.rect(th,0,th+1,1,'fos');A.line(0,1,1,1,'ln sb');A.line(th,1,th+1,1,'ln so');A.text(0.5,1,'p = U[0, 1]','','middle',0,-6).style.fill=BL;A.text(th+0.5,1,'q_θ','lab','middle',0,22).style.fill=OR;
    T(A.top,334,18,'q_θ = U[θ, θ + 1], θ = '+nf(th,2)+(Math.abs(th)>=1?': no overlap':''),'lab');
    const B=Plot(svg,{at:[0,140],w:620,h:240,x:[-2.5,2.5],y:[0,2.6],m:{l:48,r:14,t:16,b:42}});B.axes({xt:[-2,-1,0,1,2],yt:[0,0.693,1,2],fy:v=>v===0.693?'log 2':String(v),xl:'θ'});
    B.fn(JS,'ln',-2.5,2.5,400).setAttribute('stroke',PU);B.fn(t=>Math.abs(t),'ln sg',-2.5,2.5,200);B.dot(th,JS(th),6,'pt').setAttribute('fill',PU);B.dot(th,Math.abs(th),6,'fgr pt');
    B.text(0,2.4,'green: W₁ = |θ|   ·   purple: JS, flat at log 2 once |θ| ≥ 1','','middle',0,0);
    halo(B.text(0,2.05,'now: W₁ = '+nf(Math.abs(th),2)+',  JS = '+nf(JS(th),3),'lab','middle',0,0))})};

/* ---------- the earth mover's distance, step by step ---------- */
FIG['gan-emd']=root=>{const svg=svgOf(root);const p=[0.4,0.3,0.2,0.1,0],qq=[0,0.1,0.2,0.3,0.4];const Fp=[],Fq=[];p.reduce((a,v,i)=>(Fp[i]=a+v),0);qq.reduce((a,v,i)=>(Fq[i]=a+v),0);
  const plan=[[0,1,0.1],[0,2,0.2],[0,3,0.1],[1,3,0.2],[1,4,0.1],[2,4,0.2],[3,4,0.1]];
  stepper(root,s=>{initSvg(svg,620,420);const X=i=>70+i*110,bw=44,base=170,H=300;
    T(svg,310,20,'p (blue): the pile   ·   q (orange): the hole','lab');ln(svg,[20,base],[600,base],'#595959',1.2);
    p.forEach((v,i)=>{if(v)E('rect',{x:X(i)-bw,y:base-H*v,width:bw-2,height:H*v,fill:BL,opacity:0.8},svg);T(svg,X(i)-bw/2,base-H*v-6,nf(v,1),'').style.fill=BL;
      if(qq[i])E('rect',{x:X(i)+2,y:base-H*qq[i],width:bw-2,height:H*qq[i],fill:OR,opacity:0.8},svg);T(svg,X(i)+bw/2,base-H*qq[i]-6,nf(qq[i],1),'').style.fill=OR;T(svg,X(i),base+18,'bin '+i,'')});
    if(s>=3){plan.forEach(([a,b,m],k)=>{const y0=base+24,d=16+5*k;E('path',{d:'M'+(X(a)-bw/2)+','+y0+' C'+(X(a)-bw/2)+','+(y0+d)+' '+(X(b)+bw/2)+','+(y0+d)+' '+(X(b)+bw/2)+','+y0,fill:'none',stroke:RD,'stroke-width':1+10*m,opacity:0.55},svg)});
      T(svg,310,262,'one optimal plan: 0.1 + 0.4 + 0.3 + 0.4 + 0.3 + 0.4 + 0.1 = 2.0','')}
    if(s>=1){const y0=410,Hc=110;ln(svg,[20,y0],[600,y0],'#595959',1.2);T(svg,24,292,'CDFs','lab','start');
      const step=(F,c,da)=>{let d='M'+(X(0)-55)+','+y0;F.forEach((v,i)=>{d+=' L'+(X(i)-55)+','+(y0-Hc*v)+' L'+(X(i)+55)+','+(y0-Hc*v)});E('path',{d:d,fill:'none',stroke:c,'stroke-width':2.5,'stroke-dasharray':da||''},svg)};
      if(s>=2)Fp.forEach((v,i)=>{const a=Math.min(v,Fq[i]),b=Math.max(v,Fq[i]);if(b-a>1e-9){E('rect',{x:X(i)-55,y:y0-Hc*b,width:110,height:Hc*(b-a),fill:GO,opacity:0.3},svg);halo(T(svg,X(i),y0-Hc*(a+b)/2+5,nf(b-a,1),'lab'))}});
      step(Fp,BL);step(Fq,OR,'6 4');if(s>=2)T(svg,600,292,'W₁ = Σ |F_p − F_q| = 0.4 + 0.6 + 0.6 + 0.4 = 2.0','lab','end')}})};

/* ---------- D* is flat where the fakes are; the critic has a slope ---------- */
FIG['gan-critic']=root=>{const svg=initSvg(svgOf(root),620,340);
  const P=Plot(svg,{w:620,h:340,x:[-0.5,3.5],y:[-2.2,2.2],m:{l:48,r:14,t:30,b:42}});P.axes({xt:[0,1,2,3],yt:[-2,-1,0,1,2],fy:v=>String(v).replace('-','−'),xl:'x'});
  P.rect(0,-2.2,1,-1.6,'fbs');P.rect(2,-2.2,3,-1.6,'fos');P.text(0.5,-1.9,'real U[0, 1]','','middle',0,5).style.fill=BL;P.text(2.5,-1.9,'fake U[2, 3]','','middle',0,5).style.fill=OR;
  P.path([[-0.5,1],[1.25,1],[1.75,0],[3.5,0]],'ln sg');P.fn(x=>1.5-x,'ln',-0.5,3.5,10).setAttribute('stroke',PU);
  P.text(1.8,0,'standard D*: 0 on the fakes, flat: gradient 0','','start',0,-8).style.fill=GR;P.text(-0.45,1,'D* = 1 on real','','start',0,-8).style.fill=GR;
  P.text(1.4,1.6,'critic f(x) = 1.5 − x: slope 1 everywhere','','start',0,0).style.fill=PU;
  T(P.top,334,18,'E_p f − E_q f = 1 − (−1) = 2 = W₁','lab')};

/* ---------- gradient penalty on interpolates ---------- */
FIG['gan-gp']=root=>{const svg=initSvg(svgOf(root),480,330);const r=rng(12);
  const real=[...Array(7)].map((_,i)=>{const a=-0.3+0.32*i;return [130+120*Math.cos(a)+6*randn(r),190-120*Math.sin(a)+6*randn(r)]});
  const fake=[...Array(7)].map(()=>[330+40*randn(r),230+40*randn(r)]);
  real.forEach((p,i)=>{const f=fake[(i*3)%7];ln(svg,p,f,'#bfbfbf',1.2,'4 3');const e=0.25+0.5*r();const h=[e*p[0]+(1-e)*f[0],e*p[1]+(1-e)*f[1]];dot(svg,h[0],h[1],5,PU)});
  real.forEach(p=>dot(svg,p[0],p[1],7,BL));fake.forEach(p=>dot(svg,p[0],p[1],7,OR));
  TT(svg,240,24,'x̂ = ε x + (1 − ε) G(z),   ε ~ U(0, 1)','lab');T(svg,90,300,'real x','lab').style.fill=BL;T(svg,380,300,'fakes G(z)','lab').style.fill=OR;T(svg,240,300,'x̂','lab').style.fill=PU;
  TT(svg,240,324,'penalty λ (‖∇f(x̂)‖ − 1)² at each purple point','')};

/* ---------- transposed convolution, step by step ---------- */
FIG['gan-convt']=root=>{const svg=svgOf(root);const X=[[1,2],[3,4]];const cs=46;
  stepper(root,s=>{initSvg(svg,620,360);const out=[...Array(5)].map(()=>new Array(5).fill(0));const cov=[...Array(5)].map(()=>new Array(5).fill(0));
    const order=[[0,0],[0,1],[1,0],[1,1]];order.slice(0,s).forEach(([i,j])=>{for(let a=0;a<3;a++)for(let b=0;b<3;b++){out[2*i+a][2*j+b]+=X[i][j];cov[2*i+a][2*j+b]++}});
    const cur=s>0?order[s-1]:null;T(svg,70,40,'input 2 × 2','lab');
    X.forEach((r,i)=>r.forEach((v,j)=>{const on=cur&&cur[0]===i&&cur[1]===j;E('rect',{x:24+j*cs,y:54+i*cs,width:cs,height:cs,fill:on?'#fff2cc':'#dae3f3',stroke:on?GO:'#7f7f7f','stroke-width':on?3:1},svg);T(svg,24+j*cs+cs/2,54+i*cs+cs/2+6,String(v),'lab')}));
    T(svg,70,190,'kernel 3 × 3','lab');for(let a=0;a<3;a++)for(let b=0;b<3;b++){E('rect',{x:34+b*24,y:204+a*24,width:24,height:24,fill:'#e2f0d9',stroke:'#7f7f7f'},svg);T(svg,46+b*24,221+a*24,'1','')}
    T(svg,70,298,'stride 2, padding 0','');const x0=250,y0=54,c2=52;T(svg,x0+130,40,'output 5 × 5 = (2 − 1)·2 + 3','lab');
    for(let a=0;a<5;a++)for(let b=0;b<5;b++){const inPatch=cur&&a>=2*cur[0]&&a<2*cur[0]+3&&b>=2*cur[1]&&b<2*cur[1]+3;
      E('rect',{x:x0+b*c2,y:y0+a*c2,width:c2,height:c2,fill:cov[a][b]===0?'#fff':cov[a][b]===1?'#dae3f3':cov[a][b]===2?'#8eaadb':'#4472c4',stroke:inPatch?GO:'#7f7f7f','stroke-width':inPatch?3:1},svg);
      if(cov[a][b]){const t=T(svg,x0+b*c2+c2/2,y0+a*c2+c2/2+6,String(out[a][b]),'lab');if(cov[a][b]>=3)t.style.fill='#fff'}}
    T(svg,x0+130,y0+5*c2+26,s===0?'each input pixel will paste a scaled kernel':s<4?'pasting x = '+X[cur[0]][cur[1]]+' × kernel; overlaps add up':'darker = more overlapping copies: uneven','')})};

/* ---------- DCGAN architecture ---------- */
FIG['gan-dcgan']=root=>{const svg=initSvg(svgOf(root),1160,300);const sc=2.6;
  T(svg,20,26,'Generator','lab','start').style.fill=OR;
  const blocks=[[60,'z: 64','',8,60,6,'#dae3f3'],[200,'128 × 7 × 7','Linear, BN, ReLU',7*sc,7*sc,30,'#fbe5d6'],[380,'64 × 14 × 14','ConvT 4/2/1, BN, ReLU',14*sc,14*sc,18,'#fbe5d6'],[560,'1 × 28 × 28','ConvT 4/2/1, tanh',28*sc,28*sc,3,'#fff2cc']];
  blocks.forEach(([x,l,s,w,h,d,c],i)=>{const y=110-h/2;cube(svg,x,y,w,h,d,c);T(svg,x+w/2,186,l,'lab');if(s)T(svg,x+w/2,206,s,'');if(i<3)arrowPx(svg,x+w+d*0.6+8,110,blocks[i+1][0]-10,110,'ln thin sk','fk')});
  T(svg,700,26,'Discriminator','lab','start').style.fill=GR;
  const dblk=[[700,'1 × 28 × 28','image',28*sc,28*sc,3,'#fff2cc'],[850,'64 × 14 × 14','Conv 4/2/1, LeakyReLU',14*sc,14*sc,18,'#e2f0d9'],[1000,'128 × 7 × 7','Conv 4/2/1, BN, LReLU',7*sc,7*sc,30,'#e2f0d9'],[1110,'1 logit','Linear',10,10,4,'#e2f0d9']];
  dblk.forEach(([x,l,s,w,h,d,c],i)=>{const y=110-h/2;cube(svg,x,y,w,h,d,c);T(svg,x+w/2,186+(i===3?30:0),l,'lab');if(s)T(svg,x+w/2,206+(i===3?30:0),s,'');if(i<3)arrowPx(svg,x+w+d*0.6+6,110,dblk[i+1][0]-8,110,'ln thin sk','fk')});
  T(svg,330,262,GD.params.G.toLocaleString('en')+' parameters','');T(svg,930,262,GD.params.D.toLocaleString('en')+' parameters','');
  T(svg,580,290,'4/2/1 = kernel 4, stride 2, padding 1: the size doubles (G) or halves (D)','')};

/* ---------- DCGAN samples at checkpoints ---------- */
FIG['gan-samples']=root=>{const svg=svgOf(root);const DC=GD.dc;
  onInput(root,'k',()=>{const k=+q(root,'k').value;const it=DC.its[k];setV(root,'k',it);initSvg(svg,620,350);
    img(svg,10,30,600,225,DC.img[k]);const ep=it%937===0&&it>0?' (epoch '+(it/937)+')':'';
    T(svg,310,20,'24 samples, the same z at every checkpoint · iteration '+it+ep,'lab');
    const sc=DC.score[k];T(svg,310,284,'FID-like '+nf(sc[0],1)+'   ·   precision '+nf(sc[2],2)+'   ·   recall '+nf(sc[3],2),'lab');
    T(svg,310,308,'real vs real: FID-like '+nf(GD.realreal[0],2)+', precision '+nf(GD.realreal[2],2)+', recall '+nf(GD.realreal[3],2),'');
    T(svg,310,334,'(features: the 64-d layer of a small MNIST classifier)','')})};
FIG['gan-image']=root=>{const svg=svgOf(root);const key=root.dataset.img;const [w,h]=key==='interp'?[620,124]:key==='cgan'?[300,375]:[480,160];initSvg(svg,w,h);img(svg,0,0,w,h,GD[key])};

/* ---------- conditional GAN diagram ---------- */
FIG['gan-cond']=root=>{const svg=initSvg(svgOf(root),620,250);
  box(svg,20,40,80,40,'z','#dae3f3',{cls:'lab'});box(svg,20,120,80,40,'y = 7','#fff2cc',{cls:'lab'});arrowPx(svg,102,60,168,90,'ln thin sk','fk');arrowPx(svg,102,140,168,110,'ln thin sk','fk');
  box(svg,172,74,80,52,'G','#fbe5d6',{cls:'lab big'});arrowPx(svg,254,100,300,100,'ln thin sk','fk');box(svg,304,80,70,40,'fake 7?','#fff',{cls:''});
  arrowPx(svg,376,100,452,120,'ln thin sk','fk');box(svg,304,170,70,40,'y = 7','#fff2cc',{cls:'lab'});arrowPx(svg,376,190,452,140,'ln thin sk','fk');
  box(svg,456,104,80,52,'D','#e2f0d9',{cls:'lab big'});arrowPx(svg,538,130,560,130,'ln thin sk','fk');T(svg,566,126,'a real','','start');T(svg,566,144,'7?','','start');
  T(svg,310,236,'y: a one-hot vector concatenated to z (G) and as 10 constant channels (D)','')};

/* ---------- pix2pix and CycleGAN ---------- */
FIG['gan-i2i']=root=>{const svg=initSvg(svgOf(root),1160,250);
  E('rect',{x:6,y:6,width:560,height:238,rx:8,fill:'#fafafa',stroke:'#d0d0d0'},svg);T(svg,286,30,'pix2pix (2017): paired examples','lab');
  box(svg,24,70,92,60,'edges x','#fff',{cls:''});arrowPx(svg,118,100,150,100,'ln thin sk','fk');box(svg,152,74,90,52,'G (U-Net)','#fbe5d6',{cls:''});arrowPx(svg,244,100,276,100,'ln thin sk','fk');box(svg,278,70,92,60,'photo G(x)','#fff',{cls:''});
  arrowPx(svg,372,100,410,118,'ln thin sk','fk');box(svg,412,100,130,48,'D sees (x, ·)','#e2f0d9',{cls:''});box(svg,278,160,92,44,'true photo y','#fff',{cls:''});arrowPx(svg,372,180,410,140,'ln thin sk','fk');
  TT(svg,286,228,'loss = GAN + λ ‖y − G(x)‖₁  ·  D judges 70 × 70 patches (PatchGAN)','');
  E('rect',{x:594,y:6,width:560,height:238,rx:8,fill:'#fafafa',stroke:'#d0d0d0'},svg);T(svg,874,30,'CycleGAN (2017): unpaired domains','lab');
  E('ellipse',{cx:690,cy:120,rx:66,ry:62,fill:'#dae3f3',stroke:BL},svg);T(svg,690,116,'domain X','lab');T(svg,690,136,'horses','');
  E('ellipse',{cx:1058,cy:120,rx:66,ry:62,fill:'#fbe5d6',stroke:OR},svg);T(svg,1058,116,'domain Y','lab');T(svg,1058,136,'zebras','');
  E('path',{d:'M756,96 C830,56 920,56 992,96',fill:'none',stroke:'#404040','stroke-width':2},svg);arrowPx(svg,982,90,994,97,'ln thin sk','fk');T(svg,874,62,'G: X → Y','lab');
  E('path',{d:'M992,146 C920,186 830,186 756,146',fill:'none',stroke:'#404040','stroke-width':2},svg);arrowPx(svg,766,152,754,145,'ln thin sk','fk');T(svg,874,196,'F: Y → X','lab');
  TT(svg,874,228,'cycle consistency: ‖F(G(x)) − x‖₁ + ‖G(F(y)) − y‖₁, plus a D per domain','')};

/* ---------- StyleGAN ---------- */
FIG['gan-style']=root=>{const svg=initSvg(svgOf(root),620,340);
  box(svg,16,40,60,36,'z','#dae3f3',{cls:'lab'});arrowPx(svg,46,78,46,96,'ln thin sk','fk');box(svg,10,98,72,150,'mapping\n8 × FC','#ede3f5',{cls:'',lh:18});arrowPx(svg,46,250,46,268,'ln thin sk','fk');box(svg,16,270,60,36,'w','#ede3f5',{cls:'lab'});
  T(svg,46,326,'"style" code','');
  const res=['4×4','8×8','16×16','…','1024²'];res.forEach((r,i)=>{const y=34+i*60;box(svg,250,y,120,40,i===0?'const 4×4':r,'#fbe5d6',{cls:''});if(i<4)arrowPx(svg,310,y+42,310,y+58,'ln thin sk','fk');
    if(i!==3){ln(svg,[78,288],[150,y+20],'#7030a0',1.2);box(svg,150,y+6,56,28,'A','#ede3f5',{cls:''});arrowPx(svg,208,y+20,248,y+20,'ln thin','');T(svg,228,y+14,'style','');
      box(svg,410,y+6,56,28,'B','#e7e6e6',{cls:''});arrowPx(svg,408,y+20,372,y+20,'ln thin sm','fm');T(svg,520,y+25,'noise: hair, pores','','middle')}});
  T(svg,310,330,'each resolution is modulated by the style w (AdaIN)','')};

/* ---------- FID with numbers on 1-D Gaussians ---------- */
FIG['gan-fid']=root=>{const svg=svgOf(root);
  const draw=()=>{const mg=+q(root,'mg').value,sg=+q(root,'sg').value;setV(root,'mg',nf(mg,1));setV(root,'sg',nf(sg,2));initSvg(svg,620,350);
    const P=Plot(svg,{w:620,h:350,x:[-5,5],y:[0,Math.max(0.45,Math.min(2.1,1/(sg*Math.sqrt(2*Math.PI))*1.08))],m:{l:48,r:14,t:30,b:42}});P.axes({xt:[-4,-2,0,2,4],xl:'feature value'});
    P.fn(x=>npdf(x,0,1),'ln sb',-5,5,300);P.fn(x=>npdf(x,mg,sg),'ln so',-5,5,600);
    const a=mg*mg,b=(1-sg)*(1-sg);T(P.top,334,18,'real N(0, 1²) vs generated N('+nf(mg,1)+', '+nf(sg,2)+'²)','lab');
    TT(svg,70,58,'(μ_r − μ_g)² = '+nf(a,3),'','start');TT(svg,70,80,'(σ_r − σ_g)² = '+nf(b,3),'','start');const t=TT(svg,70,106,'FID = '+nf(a+b,3),'lab','start');t.style.fill=RD};
  onInput(root,'mg',draw);onInput(root,'sg',draw)};

/* ---------- FID in the lab ---------- */
FIG['gan-fid-lab']=root=>{const svg=initSvg(svgOf(root),620,330);const DC=GD.dc;const its=DC.its.map(v=>Math.max(v,10));
  const ys=DC.score.map(s=>Math.log10(s[0]));const ymax=Math.ceil(Math.max(...ys)),ymin=Math.floor(Math.log10(GD.realreal[0]));
  const P=Plot(svg,{at:[0,0],w:330,h:330,x:[10,3000],y:[ymin,ymax],logx:true,m:{l:60,r:10,t:30,b:42}});
  const yt=[];for(let v=ymin;v<=ymax;v++)yt.push(v);P.axes({xt:[10,100,1000],fx:v=>String(v),yt:yt,fy:v=>v<0?'0.'+'0'.repeat(-v-1)+'1':String(Math.pow(10,v)),xl:'iteration',yl:'FID-like'});
  P.line(10,Math.log10(GD.realreal[0]),3000,Math.log10(GD.realreal[0]),'ln thin sk dash',P.bg);P.text(3000,Math.log10(GD.realreal[0]),'real vs real','','end',-4,-6,P.bg);
  P.line(10,Math.log10(GD.cgan_score[0]),3000,Math.log10(GD.cgan_score[0]),'ln thin sg dash',P.bg);P.text(12,Math.log10(GD.cgan_score[0]),'conditional GAN','','start',2,-6,P.bg).style.fill=GR;
  P.path(its.map((x,i)=>[x,ys[i]]),'ln so');its.forEach((x,i)=>P.dot(x,ys[i],4,'fo pt'));T(P.top,170,18,'FID-like score, DCGAN','lab');
  const Q=Plot(svg,{at:[330,0],w:290,h:330,x:[10,3000],y:[0,1.05],logx:true,m:{l:44,r:10,t:30,b:42}});Q.axes({xt:[10,100,1000],fx:v=>String(v),yt:[0,0.5,1],xl:'iteration'});
  Q.path(its.map((x,i)=>[x,DC.score[i][2]]),'ln sb');Q.path(its.map((x,i)=>[x,DC.score[i][3]]),'ln sr');its.forEach((x,i)=>{Q.dot(x,DC.score[i][2],4,'fb pt');Q.dot(x,DC.score[i][3],4,'fr pt')});
  T(Q.top,150,18,'precision and recall','lab');Q.text(12,0.95,'precision: quality','','start',0,0).style.fill=BL;Q.text(12,0.86,'recall: coverage','','start',0,0).style.fill=RD};

/* ---------- precision and recall, schematic ---------- */
FIG['gan-pr']=root=>{const svg=initSvg(svgOf(root),620,250);const r=rng(21);
  const panel=(x0,title,sub,gen)=>{E('rect',{x:x0+4,y:4,width:300,height:242,rx:8,fill:'#fafafa',stroke:'#d0d0d0'},svg);T(svg,x0+154,26,title,'lab');T(svg,x0+154,236,sub,'');
    const R=[...Array(22)].map(()=>{const a=r()*2*Math.PI,d=55*Math.sqrt(r());return [x0+154+d*Math.cos(a)*1.4,124+d*Math.sin(a)]});R.forEach(p=>E('circle',{cx:p[0],cy:p[1],r:17,fill:BL,'fill-opacity':0.08,stroke:BL,'stroke-opacity':0.35},svg));R.forEach(p=>dot(svg,p[0],p[1],3.5,BL,null,0));
    gen(x0).forEach(p=>dot(svg,p[0],p[1],4,OR,null,0))};
  panel(0,'mode collapse','precision high, recall low',x0=>[...Array(14)].map(()=>[x0+110+10*randn(r),104+8*randn(r)]));
  panel(312,'blurry or spread out','precision low, recall high',x0=>[...Array(22)].map(()=>{const a=r()*2*Math.PI,d=95*Math.sqrt(r());return [x0+154+d*Math.cos(a)*1.3,124+d*Math.sin(a)*0.95]}))};

/* ---------- timeline ---------- */
FIG['gan-timeline']=root=>{const svg=initSvg(svgOf(root),1160,200);const X=y=>60+(y-2014)*104;ln(svg,[40,100],[1130,100],'#595959',2);
  for(let y=2014;y<=2024;y++){ln(svg,[X(y),94],[X(y),106],'#595959',1.5);T(svg,X(y),124,String(y),'')}
  const ev=[[2014,'GAN','o',0],[2015.9,'DCGAN','o',1],[2017.05,'WGAN, pix2pix,','o',0],[2017.6,'CycleGAN, ProGAN','o',1],[2018.7,'BigGAN, SN','o',0],[2018.95,'StyleGAN','o',1],[2020.5,'DDPM','b',0],[2021.4,'diffusion beats','b',1],[2021.5,'BigGAN','b',2],[2022.3,'Stable Diffusion','b',0],[2023.2,'GigaGAN, SDXL Turbo','o',1]];
  ev.forEach(([y,t,c,row])=>{const up=row%2===0;const yy=up?72-((row/2)|0)*0:132;const cc=c==='o'?OR:BL;if(row<2)dot(svg,X(y),100,6,cc);
    const tt=T(svg,X(y),row===2?168:up?76:150,t,'lab');tt.style.fill=c==='o'?'#c55a11':'#1f3864';if(row<2)ln(svg,[X(y),up?82:106],[X(y),up?94:136],cc,1)});
  T(svg,60,30,'orange: GANs and adversarial training','','start').style.fill='#c55a11';T(svg,420,30,'blue: diffusion models','','start').style.fill='#1f3864'};
})();
