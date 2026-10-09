/* Figures for extra/03_autoencoders.html (autoencoders and VAEs). Uses ../assets/figures.js (MLFIG), ../neural_networks/assets/nn-core.js (MLNN)
   and autoencoders-data.js (AEDATA: images, codes and numbers dumped from the executed lab notebook). The six-point PCA example,
   the KL slider, the score-function demo and the transposed-convolution example are computed here; they match the notebook. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,q,setV,svgOf}=lib;const {heat,TT,box,stepper,segs}=window.MLNN;
const AD=window.AEDATA;

/* ---------- helpers ---------- */
const nf=(v,d)=>{d=d===undefined?2:d;if(Math.abs(v)<0.5*Math.pow(10,-d))v=0;return v.toFixed(d).replace('-','−')};
const pct=(v,d)=>(100*v).toFixed(d===undefined?0:d)+' %';
const ln=(svg,a,b,c,w,dash)=>E('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:c||'#9aa5b8','stroke-width':w||1.6,'stroke-dasharray':dash||''},svg);
const dot=(svg,x,y,r,fill,stroke,sw)=>E('circle',{cx:x,cy:y,r:r,fill:fill,stroke:stroke||'#fff','stroke-width':sw===undefined?1.2:sw},svg);
const halo=t=>{t.setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:6px;stroke-linejoin:round');return t};
const col=(t,c)=>{t.style.fill=c;return t};
function onInput(root,k,draw){const inp=q(root,k);inp.addEventListener('input',draw);draw();return inp}
const DIG=['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'];
/* images: 28x28 strings (see autoencoders-data.js). Drawn once on a canvas, then used as an SVG <image> */
function decImg(s){const a=new Float32Array(784);let i=0;for(let k=0;k<s.length;k++){const c=s.charCodeAt(k);if(c>=65&&c<=90)i+=c-63;else a[i++]=parseInt(s[k],16)/15}return a}
const urls=new Map();
function imgURL(s,signed){const key=(signed?'s:':'')+s;if(urls.has(key))return urls.get(key);
  const cv=document.createElement('canvas');cv.width=28;cv.height=28;const cx=cv.getContext('2d');const id=cx.createImageData(28,28);
  for(let i=0;i<784;i++){let r,g,b;if(signed){const v=(parseInt(s[i],16)-7)/7;const c=heat(v).match(/\d+/g).map(Number);r=c[0];g=c[1];b=c[2]}else{r=g=b=0}
    id.data[4*i]=r;id.data[4*i+1]=g;id.data[4*i+2]=b;id.data[4*i+3]=255}
  if(!signed){const a=decImg(s);for(let i=0;i<784;i++){const c=Math.round(255*(1-a[i]));id.data[4*i]=c;id.data[4*i+1]=c;id.data[4*i+2]=c}}
  cx.putImageData(id,0,0);const u=cv.toDataURL();urls.set(key,u);return u}
/* one digit at (x, y), side w; o.stroke / o.sw for a coloured frame, o.signed for red/blue images */
function img(svg,s,x,y,w,o){o=o||{};E('image',{href:imgURL(s,o.signed),x:x,y:y,width:w,height:w,preserveAspectRatio:'none',style:'image-rendering:pixelated'},svg);
  E('rect',{x:x,y:y,width:w,height:w,fill:'none',stroke:o.stroke||'#bfbfbf','stroke-width':o.sw||1},svg)}
function strip(svg,list,x,y,w,gap,o){list.forEach((s,i)=>img(svg,s,x+i*(w+gap),y,w,o))}
function grid(svg,list,ncol,x,y,w,gap,o){list.forEach((s,i)=>img(svg,s,x+(i%ncol)*(w+gap),y+Math.floor(i/ncol)*(w+gap),w,o))}

/* ---------- where we are: supervised, autoencoder, generative ---------- */
FIG['ae-where']=root=>{const svg=initSvg(svgOf(root),1160,215);const W=386;const d0=AD.rec.orig[0],d1=AD.rec.ae[32][0];
  const panel=(k,title,sub,hi)=>{const x0=k*W;E('rect',{x:x0+6,y:4,width:W-12,height:205,rx:8,fill:hi?'#f5f8fd':'#fafafa',stroke:hi?'#4472c4':'#d0d0d0','stroke-width':hi?2:1},svg);T(svg,x0+W/2,28,title,'lab');T(svg,x0+W/2,198,sub,'');return x0};
  let x0=panel(0,'supervised: x → y','needs a label for every example');img(svg,d0,x0+40,62,96);arrowPx(svg,x0+150,110,x0+214,110,'ln thin sk','fk');T(svg,x0+182,98,'network','');box(svg,x0+222,90,120,40,'y = “0”','#fff2cc',{cls:'lab'});
  x0=panel(1,'autoencoder: x → z → x̂','the input is its own target',true);img(svg,d0,x0+24,62,90);
  E('polygon',{points:[[x0+124,62],[x0+176,92],[x0+176,128],[x0+124,152]].map(p=>p.join(',')).join(' '),fill:'#dae3f3',stroke:'#4472c4'},svg);T(svg,x0+150,112,'f','lab');
  box(svg,x0+180,92,26,36,'z','#ffc000',{cls:'lab'});
  E('polygon',{points:[[x0+210,92],[x0+262,62],[x0+262,152],[x0+210,128]].map(p=>p.join(',')).join(' '),fill:'#e2f0d9',stroke:'#70ad47'},svg);T(svg,x0+236,112,'g','lab');
  img(svg,d1,x0+272,62,90);T(svg,x0+193,172,'bottleneck','');
  x0=panel(2,'generative: z → new x','sample a code, decode it');E('path',{d:'M'+(x0+36)+',150 '+[...Array(41)].map((_,i)=>{const t=-3+6*i/40;return 'L'+(x0+36+i*2.6)+','+(150-70*Math.exp(-t*t/2))}).join(' '),fill:'none',stroke:'#4472c4','stroke-width':2.2},svg);
  T(svg,x0+88,172,'z ~ N(0, I)','');arrowPx(svg,x0+152,110,x0+196,110,'ln thin sk','fk');T(svg,x0+174,98,'g','lab');
  const pr=AD.vae16.means;grid(svg,[pr[0],pr[1],pr[2],pr[3]],2,x0+206,64,44,4)};

/* ---------- the architecture, with a bottleneck slider ---------- */
const KS=[2,4,8,16,32,1568];
FIG['ae-arch']=root=>{const svg=svgOf(root);
  onInput(root,'k',()=>{const j=+q(root,'k').value;const k=KS[j];setV(root,'k','k = '+k);initSvg(svg,620,360);
    const sizes=[784,256,64,k,64,256,784];const xs=[40,130,210,300,390,470,560];const H=v=>v>=784?230:v>=256?150:v>=64?80:Math.max(14,6+4*Math.log2(v)*3.2);
    const hk=k>=784?230:H(k);
    sizes.forEach((s,i)=>{const h=i===3?hk:H(s);const fill=i===3?(k>=784?'#fbe5d6':'#ffc000'):i<3?'#dae3f3':'#e2f0d9';E('rect',{x:xs[i]-12,y:150-h/2,width:24,height:h,rx:4,fill:fill,stroke:i===3?'#bf9000':'#7f7f7f'},svg);
      T(svg,xs[i],150+Math.max(h,40)/2+20,String(s),i===3?'lab':'');if(i<6){const h2=i+1===3?hk:H(sizes[i+1]);E('polygon',{points:[[xs[i]+12,150-h/2],[xs[i+1]-12,150-h2/2],[xs[i+1]-12,150+h2/2],[xs[i]+12,150+h/2]].map(p=>p.join(',')).join(' '),fill:i<3?'#4472c4':'#70ad47',opacity:0.13},svg)}});
    T(svg,125,24,'encoder f','lab');T(svg,475,24,'decoder g','lab');col(T(svg,300,24,'code z','lab'),'#bf9000');
    const ii=k>=784?null:AD.rec.ae[k][0];img(svg,AD.rec.orig[0],8,300,40);T(svg,8,354,'input','','start');
    img(svg,ii||AD.rec.orig[0],572,300,40);T(svg,612,354,'output','','end');
    let P=0;for(let i=0;i<6;i++)P+=sizes[i]*sizes[i+1]+sizes[i+1];
    const msg=k>=784?'overcomplete: k = 1568 > 784, it can copy the input':'784 numbers → '+k+': '+Math.round(784/k)+'× fewer · '+P.toLocaleString('en-US')+' weights';
    col(T(svg,310,318,msg,'lab'),k>=784?'#c55a11':'#1f1f1f');
    if(k<784)T(svg,310,342,'lab, test MSE per pixel: '+nf(AD.rec.mse_ae[k],4)+' (PCA with '+k+': '+nf(AD.rec.mse_pca[k],4)+')','')})};

/* ---------- the loss of one pixel: squared error vs binary cross-entropy ---------- */
FIG['ae-loss']=root=>{const svg=svgOf(root);
  onInput(root,'t',()=>{const t=+q(root,'t').value;setV(root,'t','x = '+t.toFixed(2));const P=Plot(svg,{w:560,h:330,x:[0,1],y:[0,4],m:{l:46,r:14,t:30,b:42}});
    P.axes({xt:[0,0.25,0.5,0.75,1],yt:[0,1,2,3,4],xl:'prediction x̂ of one pixel',yl:'loss'});
    const bce=p=>-(t*Math.log(p)+(1-t)*Math.log(1-p));P.fn(p=>(p-t)*(p-t),'ln sb',0,1,200);P.fn(bce,'ln so',0.002,0.998,400);
    P.line(t,0,t,4,'ln thin sm dash');const H=t>0&&t<1?-(t*Math.log(t)+(1-t)*Math.log(1-t)):0;P.dot(t,H,5,'fo pt');P.dot(t,0,5,'fb pt');
    const legendY=[18,38];T(P.top,60,legendY[0]+18,'squared error (x − x̂)²','','start').style.fill='#4472c4';T(P.top,60,legendY[1]+18,'BCE −[x log x̂ + (1 − x) log(1 − x̂)]','','start').style.fill='#c55a11';
    const wrong=t>=0.5?0.02:0.98;T(P.top,540,legendY[0]+18,'at x̂ = '+wrong+': squared '+nf((wrong-t)*(wrong-t),2)+', BCE '+nf(bce(wrong),2),'','end');
    T(P.top,540,legendY[1]+18,'minimum at x̂ = x; BCE min = '+nf(H,3),'','end')})};

/* ---------- overcomplete: the identity by hand, and a sparse code ---------- */
FIG['ae-identity']=root=>{const svg=initSvg(svgOf(root),1160,270);
  const xin=[0.9,-0.3,0.4];const X0=60,X1=260,X2=460;const yi=[84,144,204];const yc=[44,84,124,164,204,244];
  T(svg,X0,48,'input x','lab');T(svg,X1,18,'code z (k = 2D)','lab');T(svg,X2,48,'output x̂','lab');
  for(let i=0;i<3;i++){ln(svg,[X0,yi[i]],[X1,yc[i]],'#4472c4',2);ln(svg,[X0,yi[i]],[X1,yc[i+3]],'#c00000',2,'5 4');ln(svg,[X1,yc[i]],[X2,yi[i]],'#4472c4',2);ln(svg,[X1,yc[i+3]],[X2,yi[i]],'#c00000',2,'5 4')}
  for(let i=0;i<3;i++){dot(svg,X0,yi[i],16,'#70ad47');col(T(svg,X0,yi[i]+5,nf(xin[i],1),''),'#fff');dot(svg,X2,yi[i],16,'#ed7d31');col(T(svg,X2,yi[i]+5,nf(xin[i],1),''),'#fff')}
  for(let j=0;j<6;j++){const v=j<3?Math.max(0,xin[j]):Math.max(0,-xin[j-3]);dot(svg,X1,yc[j],15,v>0?'#ffc000':'#e7e6e6','#7f7f7f',1);T(svg,X1,yc[j]+5,nf(v,1),'lab')}
  halo(col(T(svg,X1-62,yc[0]+4,'ReLU(x)','','end'),'#4472c4'));halo(col(T(svg,X1-62,yc[5]+2,'ReLU(−x)','','end'),'#c00000'));
  T(svg,X2+20,262,'x̂ = ReLU(x) − ReLU(−x) = x','lab','end');
  /* right: the 1024-D code of one test digit, dense vs L1-sparse */
  const sp=AD.sparse;const P=Plot(svg,{at:[560,0],w:600,h:270,x:[0,1024],y:[0,1.08],m:{l:46,r:10,t:26,b:38}});
  const mx=Math.max(...sp.dense.code0,...sp.sparse.code0);P.axes({xt:[0,256,512,768,1024],yt:[0,0.5,1],fy:v=>nf(v*mx,1),xl:'hidden unit (784 → 1024 → 784)',yl:'activation'});
  sp.dense.code0.forEach((v,i)=>{if(v>0)P.line(i,0,i,v/mx,'ln thin sb')});sp.sparse.code0.forEach((v,i)=>{if(v>0)P.line(i,0,i,v/mx,'ln so')});
  const nd=sp.dense.code0.filter(v=>v>0).length,ns=sp.sparse.code0.filter(v=>v>0).length;
  T(P.top,325,16,'code of the first test digit: dense '+nd+' active (blue), L1-sparse '+ns+' active (orange)','lab')};

/* ---------- PCA on six points ---------- */
const PTS=[[1,1],[1,4],[3,3],[3,6],[4,4],[6,6]],PM=[3,4];
FIG['ae-pca2d']=root=>{const svg=svgOf(root);
  onInput(root,'th',()=>{const th=+q(root,'th').value;setV(root,'th',th+'°');initSvg(svg,620,350);const a=th*Math.PI/180,w=[Math.cos(a),Math.sin(a)];
    const S=40,ox=36,oy=318;const X=v=>ox+v*S,Y=v=>oy-v*S;
    for(let v=0;v<=7;v++){ln(svg,[X(v),Y(0)],[X(v),Y(7)],'#ececec',1);ln(svg,[X(0),Y(v)],[X(7),Y(v)],'#ececec',1);T(svg,X(v),oy+16,String(v),'');if(v)T(svg,ox-8,Y(v)+4,String(v),'','end')}
    ln(svg,[X(PM[0]-6*w[0]),Y(PM[1]-6*w[1])],[X(PM[0]+6*w[0]),Y(PM[1]+6*w[1])],'#4472c4',2.4);
    let vk=0,err=0;const zs=[];PTS.forEach(p=>{const z=(p[0]-PM[0])*w[0]+(p[1]-PM[1])*w[1];zs.push(z);const r=[PM[0]+z*w[0],PM[1]+z*w[1]];vk+=z*z/6;err+=((p[0]-r[0])**2+(p[1]-r[1])**2)/6;
      ln(svg,[X(p[0]),Y(p[1])],[X(r[0]),Y(r[1])],'#c00000',2);dot(svg,X(r[0]),Y(r[1]),5,'#4472c4')});
    PTS.forEach(p=>dot(svg,X(p[0]),Y(p[1]),6.5,'#1f1f1f'));E('path',{d:'M'+(X(3)-7)+','+(Y(4)-7)+' l14,14 m0,-14 l-14,14',stroke:'#ed7d31','stroke-width':3},svg);
    /* the two numbers as bars */
    const bx=360,bw=200;T(svg,bx,40,'w = ('+nf(w[0],2)+', '+nf(w[1],2)+')','lab','start');
    const bar=(y,v,c,lab)=>{E('rect',{x:bx,y:y,width:bw,height:26,fill:'#f2f2f2'},svg);E('rect',{x:bx,y:y,width:bw*v/6,height:26,fill:c},svg);T(svg,bx,y-6,lab,'','start');T(svg,bx+bw+8,y+18,nf(v,2),'lab','start')};
    bar(80,vk,'#4472c4','variance kept  wᵀCw');bar(140,err,'#c00000','mean squared error  tr C − wᵀCw');
    T(svg,bx,198,'sum = tr C = 3 + 3 = 6, for every w','','start');
    T(svg,bx,232,'codes z = (x − mean)·w:','','start');T(svg,bx,254,zs.map(z=>nf(z,2)).join('  '),'','start');
    const tag=th===45?'w = v₁: the first principal component':th===135?'w = v₂: the second component':'';if(tag)col(T(svg,bx,290,tag,'lab','start'),'#4472c4')})};

/* ---------- MNIST spectrum and reconstructions as k grows ---------- */
FIG['ae-evr']=root=>{const svg=svgOf(root);const pc=AD.pca,dg=pc.digit;
  onInput(root,'k',()=>{const j=+q(root,'k').value;const k=dg.k[j];setV(root,'k','k = '+k);initSvg(svg,620,370);
    const P=Plot(svg,{at:[0,0],w:380,h:250,x:[0,Math.log10(784)],y:[0,1],m:{l:58,r:12,t:24,b:40}});
    P.axes({xt:[0,1,2,Math.log10(784)],fx:v=>v===0?'1':v===1?'10':v===2?'100':'784',yt:[0,0.25,0.5,0.75,1],fy:v=>(100*v)+'%',xl:'components k (log scale)',yl:'variance explained'});
    P.path(pc.cum.map((v,i)=>[Math.log10(i+1),v]),'ln sb');P.line(Math.log10(pc.k90),0,Math.log10(pc.k90),0.9,'ln thin sm dash');P.text(Math.log10(pc.k90),0.06,'90 % at k = '+pc.k90,'','end',-5,0);
    P.dot(Math.log10(k),pc.cum[k-1],6,'fo pt');T(P.top,200,16,'k = '+k+': '+pct(pc.cum[k-1],1)+' of the variance','lab');
    img(svg,dg.img[0],410,40,90);T(svg,455,150,'original','');img(svg,dg.img[j+1],515,40,90);T(svg,560,150,'k = '+k,'');
    T(svg,500,180,'test MSE per pixel '+nf(dg.mse[j],4),'');
    T(svg,310,274,'the first 8 principal components (blue −, red +)','lab');strip(svg,pc.pcs,22,290,66,10,{signed:true})})};

/* ---------- linear AE vs PCA: principal angles per epoch ---------- */
FIG['ae-linear']=root=>{const svg=initSvg(svgOf(root),620,380);const L=AD.lin;
  const P=Plot(svg,{at:[0,0],w:620,h:220,x:[0.6,10.4],y:[-0.6,2],m:{l:56,r:14,t:28,b:40}});
  P.axes({xt:[1,2,3,4,5,6,7,8,9,10],yt:[-0.5,0,1,2].filter(v=>v>=-0.6),fy:v=>v===-0.5?'0.3°':v===0?'1°':v===1?'10°':'100°',xl:'epoch',yl:'angle (log)'});
  const lg=v=>Math.log10(v);P.path(L.max.map((v,i)=>[i+1,lg(v)]),'ln so');P.path(L.mean.map((v,i)=>[i+1,lg(v)]),'ln sb');
  L.max.forEach((v,i)=>P.dot(i+1,lg(v),4,'fo pt'));L.mean.forEach((v,i)=>P.dot(i+1,lg(v),4,'fb pt'));
  P.text(6.2,1.85,'largest of the 16 angles','','start',0,0).style.fill='#c55a11';P.text(6.2,1.45,'mean angle','','start',0,0).style.fill='#4472c4';
  T(P.top,320,16,'principal angles: linear AE (k = 16) vs top-16 PCA subspace','lab');
  T(svg,310,248,'8 decoder directions of the linear AE (not the PCs, but the same span)','');strip(svg,L.dec,24,258,64,10,{signed:true});
  T(svg,310,350,'final: largest '+nf(L.max[L.max.length-1],2)+'°, mean '+nf(L.mean[L.mean.length-1],2)+'°; loss '+nf(L.excess,4)+' above the PCA optimum '+nf(L.opt,2),'lab')};

/* ---------- reconstructions vs latent size: PCA vs AE ---------- */
FIG['ae-recon']=root=>{const svg=svgOf(root);const R=AD.rec;
  const draw=k=>{k=+k;initSvg(svg,620,330);const w=74,g=10,x0=110;
    [['original',R.orig,'#1f1f1f'],['PCA, k = '+k,R.pca[k],'#4472c4'],['AE, k = '+k,R.ae[k],'#c55a11']].forEach(([lab,L,c],r)=>{col(T(svg,x0-10,40+r*(w+16)+w/2+5,lab,'lab','end'),c);strip(svg,L,x0,40+r*(w+16),w,g)});
    T(svg,320,22,'six test digits','');
    const y=40+3*(w+16)+6;T(svg,320,y,'test MSE per pixel: PCA '+nf(R.mse_pca[k],4)+'  ·  AE '+nf(R.mse_ae[k],4)+'  ·  PCA needs k = '+R.match[k]+' to match','lab')};
  const cur=segs(root,'k',draw);draw(cur()||2)};

/* ---------- 2-D codes: PCA vs AE vs VAE ---------- */
function scatter(svg,at,w,h,Z,y,o){o=o||{};const xs=Z.map(z=>z[0]),ys=Z.map(z=>z[1]);const lo=o.lo||[Math.min(...xs),Math.min(...ys)],hi=o.hi||[Math.max(...xs),Math.max(...ys)];
  const pad=o.pad===undefined?0.04:o.pad;const dx=(hi[0]-lo[0])*pad,dy=(hi[1]-lo[1])*pad;
  const P=Plot(svg,{at:at,w:w,h:h,x:[lo[0]-dx,hi[0]+dx],y:[lo[1]-dy,hi[1]+dy],m:o.m||{l:40,r:8,t:24,b:30}});
  P.axes({xt:o.xt||[],yt:o.yt||[],xl:o.xl,yl:o.yl,grid:false});
  Z.forEach((z,i)=>{const c=E('circle',{cx:P.X(z[0]),cy:P.Y(z[1]),r:o.r||2.2,fill:DIG[y[i]],'fill-opacity':o.op||0.75},P.dyn)});if(o.title)T(P.top,w/2,16,o.title,'lab');return P}
FIG['ae-codes2']=root=>{const svg=initSvg(svgOf(root),1160,330);const C=AD.codes;
  scatter(svg,[0,0],560,300,C.pca,C.y,{title:'PCA, k = 2 · 15-NN accuracy '+pct(C.acc.pca,1),xt:[0,5],yt:[-4,0,4],xl:'z₁',yl:'z₂'});
  scatter(svg,[590,0],560,300,C.ae,C.y,{title:'autoencoder, k = 2 · 15-NN accuracy '+pct(C.acc.ae,1),xt:[-10,0,10],yt:[-15,0],xl:'z₁',yl:'z₂'});
  for(let d=0;d<10;d++){dot(svg,250+d*68,318,6,DIG[d],'#fff',0);T(svg,262+d*68,323,String(d),'lab','start')}};

/* ---------- transposed convolution: 2 x 2 -> 5 x 5 with a 3 x 3 kernel of ones, stride 2 ---------- */
FIG['ae-convT']=root=>{const svg=svgOf(root);const X=[[1,2],[3,4]];const C=['#4472c4','#ed7d31','#70ad47','#7030a0'],S=['#dae3f3','#fbe5d6','#e2f0d9','#e6d9f0'];
  stepper(root,s=>{initSvg(svg,620,330);setV(root,'s',s+' / 5');const cs=40,x0=40,y0=90;
    T(svg,x0+cs,y0-22,'input 2 × 2','lab');X.forEach((r,i)=>r.forEach((v,j)=>{const k=2*i+j;const on=s>=1&&s<=4&&k===s-1;E('rect',{x:x0+j*cs,y:y0+i*cs,width:cs,height:cs,fill:on?C[k]:S[k],stroke:'#595959'},svg);col(T(svg,x0+j*cs+cs/2,y0+i*cs+cs/2+6,String(v),'lab'),on?'#fff':'#1f1f1f')}));
    T(svg,x0+cs,y0+2*cs+26,'kernel: 3 × 3 ones','');T(svg,x0+cs,y0+2*cs+46,'stride 2','');
    const O=[...Array(5)].map(()=>new Array(5).fill(0)),cnt=[...Array(5)].map(()=>new Array(5).fill(0)),last=[...Array(5)].map(()=>new Array(5).fill(-1));
    const upto=s>=5?4:s;for(let k=0;k<upto;k++){const i=Math.floor(k/2),j=k%2;for(let a=0;a<3;a++)for(let b=0;b<3;b++){O[2*i+a][2*j+b]+=X[i][j];cnt[2*i+a][2*j+b]++;last[2*i+a][2*j+b]=k}}
    const ox=260,oy=40,oc=56;T(svg,ox+2.5*oc,oy-14,s>=5?'output 5 × 5 (kernel copies per pixel in the corner)':'output 5 × 5','lab');
    for(let a=0;a<5;a++)for(let b=0;b<5;b++){const k=last[a][b];const cur=s>=1&&s<=4&&k===s-1;const fill=cnt[a][b]===0?'#fff':s>=5?heat(cnt[a][b]/4,true):cur?S[k]:'#f2f2f2';
      E('rect',{x:ox+b*oc,y:oy+a*oc,width:oc,height:oc,fill:fill,stroke:'#7f7f7f'},svg);if(cnt[a][b])T(svg,ox+b*oc+oc/2,oy+a*oc+oc/2+6,String(O[a][b]),'lab');
      if(s>=5)col(T(svg,ox+b*oc+oc-5,oy+a*oc+14,'×'+cnt[a][b],'','end'),'#595959')}
    if(s>=1&&s<=4){const k=s-1,i=Math.floor(k/2),j=k%2;E('rect',{x:ox+2*j*oc,y:oy+2*i*oc,width:3*oc,height:3*oc,fill:'none',stroke:C[k],'stroke-width':3.5},svg);
}
    const msg=['every input pixel paints a scaled copy of the kernel','pixel 1 paints a 3 × 3 block of 1s','pixel 2 moves 2 to the right: the copies overlap in one column','pixel 3 moves 2 down: overlaps add up','all four: (2 − 1)·2 + 3 = 5','uneven overlap (×1, ×2, ×4): the checkerboard artefact'][s];
    if(s===0)T(svg,310,326,msg,'lab')})};

/* ---------- KL between two Gaussians, with sliders ---------- */
FIG['ae-kl']=root=>{const svg=svgOf(root);
  const draw=()=>{const mu=+q(root,'mu').value,s=+q(root,'sg').value;setV(root,'mu',nf(mu,1));setV(root,'sg',nf(s,2));
    const P=Plot(svg,{w:600,h:330,x:[-4.5,4.5],y:[0,2.1],m:{l:40,r:12,t:20,b:118}});P.axes({xt:[-4,-2,0,2,4],yt:[0,1,2]});P.text(4.5,0,'z','','end',0,34);
    const pdf=(z,m,sd)=>Math.exp(-0.5*((z-m)/sd)**2)/(sd*Math.sqrt(2*Math.PI));
    const pts=[];for(let i=0;i<=300;i++){const z=-4.5+9*i/300;pts.push([z,pdf(z,mu,s)])}P.poly([[-4.5,0]].concat(pts,[[4.5,0]]),'fos');
    P.fn(z=>pdf(z,0,1),'ln sm',-4.5,4.5,300);P.fn(z=>pdf(z,mu,s),'ln so',-4.5,4.5,400);
    P.text(-4.3,1.95,'p = N(0, 1)','','start',0,0).style.fill='#595959';P.text(-4.3,1.75,'q = N(μ, σ²)','','start',0,0).style.fill='#c55a11';
    const a=mu*mu,b=s*s,c=Math.log(s*s);const kl=0.5*(a+b-1-c);const rev=Math.log(s)+(1+mu*mu)/(2*s*s)-0.5;
    const y0=262;T(P.top,300,y0,'KL(q ‖ p) = ½ (μ² + σ² − 1 − log σ²) = ½ ('+nf(a,2)+' + '+nf(b,2)+' − 1 − ('+nf(c,2)+'))','lab');
    col(T(P.top,300,y0+26,'= '+nf(kl,3)+' nats','lab big'),'#c55a11');
    T(P.top,300,y0+50,'the other way round, KL(p ‖ q) = '+nf(rev,3)+' nats: not symmetric','')};
  q(root,'mu').addEventListener('input',draw);q(root,'sg').addEventListener('input',draw);draw()};

/* ---------- score function vs reparameterisation: variance of the gradient estimate ---------- */
const NS=[1,2,5,10,20,50,100];
FIG['ae-score']=root=>{const svg=svgOf(root);const mu=1,R=400;
  onInput(root,'n',()=>{const N=NS[+q(root,'n').value];setV(root,'n','N = '+N);initSvg(svg,620,350);const r=rng(17);
    const rep=[],sco=[];for(let t=0;t<R;t++){let a=0,b=0;for(let i=0;i<N;i++){const e=randn(r);const z=mu+e;a+=2*z;b+=z*z*e}rep.push(a/N);sco.push(b/N)}
    const sd=v=>{const m=v.reduce((x,y)=>x+y,0)/v.length;return Math.sqrt(v.reduce((x,y)=>x+(y-m)**2,0)/v.length)};
    const lo=-10,hi=14,nb=48;const hist=v=>{const h=new Array(nb).fill(0);v.forEach(x=>{const k=Math.floor((x-lo)/(hi-lo)*nb);if(k>=0&&k<nb)h[k]++});return h};
    const panel=(y,v,c,lab,th)=>{const P=Plot(svg,{at:[0,y],w:620,h:150,x:[lo,hi],y:[0,1],m:{l:20,r:14,t:24,b:24}});const h=hist(v);const m=Math.max(...h);
      P.axes({xt:[-10,-5,0,2,5,10],noaxes:false,grid:false});h.forEach((cnt,k)=>{if(cnt)P.rect(lo+(hi-lo)*k/nb,0,lo+(hi-lo)*(k+1)/nb,cnt/m*0.9,c)});P.line(2,0,2,1,'ln thin sk dash');
      T(P.top,24,16,lab+': std of the estimate '+nf(sd(v),2)+' (theory '+nf(th/Math.sqrt(N),2)+')','lab','start')};
    panel(0,rep,'fb','reparameterised, mean of 2(μ + ε)',2);panel(170,sco,'fo','score function, mean of z² (z − μ)',Math.sqrt(30));
    T(svg,310,346,'400 repeated estimates of d/dμ E[z²] at μ = 1 (true value 2), each from N = '+N+' samples','')})};

/* ---------- the reparameterisation trick, step by step ---------- */
FIG['ae-reparam']=root=>{const svg=svgOf(root);
  stepper(root,s=>{initSvg(svg,620,360);setV(root,'s',s+' / 4');const y=120;
    const B=(x,w,t,f,st)=>box(svg,x,y-22,w,44,t,f,{cls:'lab',stroke:st||'#404040'});
    B(10,52,'x','#e2f0d9');B(90,92,'encoder φ','#dae3f3');
    box(svg,214,y-62,64,36,'μ','#fff',{cls:'lab'});box(svg,214,y+26,64,36,'σ','#fff',{cls:'lab'});
    arrowPx(svg,62,y,88,y,'ln thin sk','fk');arrowPx(svg,182,y-8,212,y-44,'ln thin sk','fk');arrowPx(svg,182,y+8,212,y+44,'ln thin sk','fk');
    if(s<2){E('rect',{x:308,y:y-30,width:116,height:60,rx:30,fill:'#fbe5d6',stroke:'#c55a11','stroke-width':1.5},svg);TT(svg,366,y-2,'sample','lab');TT(svg,366,y+18,'z ~ N(μ, σ²)','')}
    else{box(svg,308,y-30,116,60,'','#fff2cc',{stroke:'#bf9000'});TT(svg,366,y+6,'z = μ + σ ε','lab');
      E('rect',{x:316,y:y+86,width:100,height:44,rx:22,fill:'#fbe5d6',stroke:'#c55a11'},svg);T(svg,366,y+113,'ε ~ N(0, 1)','lab');arrowPx(svg,366,y+84,366,y+32,'ln thin sk','fk');
      halo(T(svg,372,y+66,'noise: an input, no parameters','','start'))}
    arrowPx(svg,280,y-44,306,y-14,'ln thin sk','fk');arrowPx(svg,280,y+44,306,y+14,'ln thin sk','fk');
    arrowPx(svg,426,y,452,y,'ln thin sk','fk');B(454,84,'decoder θ','#e2f0d9');arrowPx(svg,540,y,560,y,'ln thin sk','fk');B(562,50,'loss','#fff');
    if(s===1){/* gradient blocked */E('path',{d:'M580,'+(y+26)+' C580,'+(y+70)+' 500,'+(y+70)+' 440,'+(y+44),fill:'none',stroke:'#c00000','stroke-width':2.4},svg);
      E('path',{d:'M'+(366-12)+','+(y-46)+' l24,24 m0,-24 l-24,24',stroke:'#c00000','stroke-width':4},svg);
      col(T(svg,366,y-58,'no derivative through a random draw','lab'),'#c00000')}
    if(s>=3){const red=(d)=>E('path',{d:d,fill:'none',stroke:'#c00000','stroke-width':2.4,'stroke-dasharray':'6 4'},svg);
      red('M584,'+(y-26)+' C584,'+(y-90)+' 500,'+(y-90)+' 440,'+(y-34));red('M330,'+(y-34)+' C320,'+(y-80)+' 290,'+(y-86)+' 282,'+(y-70));red('M330,'+(y+34)+' C318,'+(y+64)+' 296,'+(y+72)+' 282,'+(y+62));red('M212,'+(y-56)+' C190,'+(y-80)+' 150,'+(y-70)+' 140,'+(y-26));
      col(halo(T(svg,240,y-96,'∂z/∂μ = 1','lab')),'#c00000');col(halo(T(svg,230,y+92,'∂z/∂σ = ε','lab')),'#c00000');col(T(svg,520,y-80,'backpropagation','lab'),'#c00000')}
    if(s>=4){box(svg,24,y+150,572,80,'','#f5f7fb',{stroke:'#d0d0d0'});
      T(svg,310,y+176,'μ = 1.0, σ = 0.5, ε = 0.8  →  z = 1.0 + 0.5 · 0.8 = 1.4','lab');
      T(svg,310,y+200,'if ∂L/∂z = 2:  ∂L/∂μ = 2 · 1 = 2,   ∂L/∂σ = 2 · 0.8 = 1.6,   ∂L/∂ log σ² = 1.6 · σ/2 = 0.4','');
      T(svg,310,y+220,'(σ = exp(½ log σ²), so ∂σ/∂ log σ² = σ/2)','')}
    const cap=['the encoder gives μ and σ; z is drawn from N(μ, σ²)','the loss needs ∂/∂φ through the draw: it does not exist','rewrite: z = μ + σ ε, with ε drawn outside the network','now z is a plain function of μ and σ: gradients flow','with numbers'][s];
    if(s===0)T(svg,310,y+190,cap,'lab')})};

/* ---------- Jensen: log is concave ---------- */
FIG['ae-jensen']=root=>{const svg=initSvg(svgOf(root),480,300);const P=Plot(svg,{at:[0,0],w:480,h:300,x:[0,6],y:[-1.6,2],m:{l:40,r:14,t:20,b:36}});
  P.axes({xt:[1,2,3,4,5],yt:[-1,0,1],xl:'y',grid:false});P.fn(Math.log,'ln sb',0.18,6,200);const a=0.5,b=5;const m=(a+b)/2;
  P.line(a,Math.log(a),b,Math.log(b),'ln thin so');P.dot(a,Math.log(a),5,'fo pt');P.dot(b,Math.log(b),5,'fo pt');
  P.line(m,-1.6,m,Math.log(m),'ln thin sm dash');P.dot(m,Math.log(m),6,'fb pt');P.dot(m,(Math.log(a)+Math.log(b))/2,6,'fo pt');
  P.text(m,Math.log(m),'log E[Y] = '+nf(Math.log(m),2),'lab','end',-10,-8);P.text(m,(Math.log(a)+Math.log(b))/2,'E[log Y] = '+nf((Math.log(a)+Math.log(b))/2,2),'lab','start',10,14);
  P.text(5.6,1.62,'log y','','end',0,0).style.fill='#4472c4';P.text(a,Math.log(a),'Y = 0.5','','start',8,6);P.text(b,Math.log(b),'Y = 5','','end',-6,18);
  T(P.top,240,14,'Y is 0.5 or 5 with probability ½ each','')};

/* ---------- the latent-variable model ---------- */
FIG['ae-lvm']=root=>{const svg=initSvg(svgOf(root),620,300);
  E('rect',{x:20,y:40,width:150,height:200,rx:10,fill:'none',stroke:'#7f7f7f','stroke-dasharray':'5 4'},svg);T(svg,150,230,'n images','','end');
  dot(svg,95,90,28,'#fff','#4472c4',2.5);T(svg,95,96,'z','lab big');dot(svg,95,190,28,'#d9d9d9','#595959',2.5);T(svg,95,196,'x','lab big');arrowPx(svg,95,120,95,160,'ln sk','fk');
  T(svg,135,80,'p(z) = N(0, I)','','start');TT(svg,135,140,'p_θ(x | z)','','start');T(svg,95,268,'grey: observed','');
  /* a 1-D slice: decoded images along z1 */
  const G=AD.vae2.grid,pp=AD.vae2.pp;const n=pp.length;const row=Math.floor(n/2);const x0=210,w=400;
  E('path',{d:'M'+x0+',150 '+[...Array(81)].map((_,i)=>{const z=-2.6+5.2*i/80;return 'L'+(x0+w*i/80)+','+(150-90*Math.exp(-z*z/2))}).join(' '),fill:'#dae3f3',stroke:'#4472c4','stroke-width':1.8},svg);
  T(svg,x0+w/2,48,'prior over one coordinate of z, and what the decoder makes of it','lab');
  [1,3,5,7,9,11,13].forEach(j=>{const z=pp[j];const X=x0+w*(z+2.6)/5.2;ln(svg,[X,150],[X,168],'#7f7f7f',1);img(svg,G[row*n+j],X-24,172,48)});
  T(svg,x0+w/2,250,'z₁ from '+nf(pp[1],2)+' to '+nf(pp[13],2)+' (z₂ = 0): each z gives a distribution over images','');
  T(svg,x0+w/2,276,'p(x) = ∫ p(x | z) p(z) dz: an infinite mixture, no closed form','lab')};

/* ---------- where the field went: VQ-VAE and latent diffusion ---------- */
FIG['ae-vqldm']=root=>{const svg=initSvg(svgOf(root),1160,250);
  const B=(x,y,w,t,f,st)=>box(svg,x,y,w,46,t,f,{cls:'lab',stroke:st||'#404040'});const A=(x1,x2,y)=>arrowPx(svg,x1,y,x2,y,'ln thin sk','fk');
  T(svg,20,26,'VQ-VAE (van den Oord et al., 2017): discrete codes','lab','start');
  B(20,46,90,'image','#e2f0d9');A(112,138,69);B(140,46,110,'encoder','#dae3f3');A(252,278,69);
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){const k=[3,17,3,8,250,17,99,3,8,8,42,17,3,250,99,8][i*4+j];E('rect',{x:282+j*36,y:32+i*19,width:36,height:19,fill:heat(k/400,true),stroke:'#fff'},svg);T(svg,300+j*36,47+i*19,String(k),'')}
  T(svg,354,124,'nearest of K codebook vectors','');A(430,454,69);B(456,46,110,'decoder','#e2f0d9');A(568,592,69);B(594,46,100,'image','#e2f0d9');
  T(svg,716,60,'prior: an autoregressive model (or transformer)','','start');T(svg,716,82,'over the grid of code indices; no KL to N(0, I)','','start');T(svg,716,104,'sharp images; the idea behind image tokenisers','','start');
  ln(svg,[20,134],[1140,134],'#d0d0d0',1);
  T(svg,20,160,'latent diffusion (Rombach et al., 2022): Stable Diffusion','lab','start');
  B(20,180,120,'512×512×3','#e2f0d9');A(142,168,203);B(170,180,140,'VAE encoder','#dae3f3');A(312,338,203);B(340,180,120,'64×64×4','#ffc000','#bf9000');
  A(462,488,203);B(490,180,190,'diffusion model in z','#fbe5d6','#c55a11');A(682,708,203);B(710,180,140,'VAE decoder','#e2f0d9');A(852,878,203);B(880,180,120,'image','#e2f0d9');
  T(svg,1008,196,'48× fewer numbers','','start');T(svg,1008,216,'a tiny KL weight','','start');T(svg,1008,236,'+ perceptual, GAN loss','','start')};

/* ---------- denoising: clean, noisy, plain AE, denoising AE ---------- */
FIG['ae-denoise']=root=>{const svg=svgOf(root);const Dn=AD.den;const lab={noisy:'noisy input (σ = 0.5)',ae:'plain AE (trained on clean digits)',dae:'denoising AE'};
  const key={noisy:'noisy input',ae:'plain AE(noisy)',dae:'denoising AE(noisy)'},ck={noisy:'noisy input',ae:'plain AE',dae:'denoising AE'},cc={noisy:'#4472c4',ae:'#ed7d31',dae:'#70ad47'};
  const draw=r=>{initSvg(svg,620,380);const w=70,g=8,x0=310-(6*w+5*g)/2;
    T(svg,x0,18,'clean test digits','','start');strip(svg,Dn.clean,x0,26,w,g);
    col(T(svg,x0,122,lab[r]+' · MSE to the clean digit '+nf(Dn.mse[key[r]],4),'lab','start'),r==='noisy'?'#1f1f1f':cc[r]);strip(svg,Dn[r],x0,130,w,g,{stroke:cc[r],sw:2});
    const P=Plot(svg,{at:[0,216],w:620,h:164,x:[0,0.8],y:[0,0.22],m:{l:52,r:150,t:12,b:36}});P.axes({xt:[0,0.2,0.4,0.6,0.8],yt:[0,0.1,0.2],xl:'noise level σ',yl:'MSE'});
    P.line(0.5,0,0.5,0.22,'ln thin sm dash');Object.keys(ck).forEach(k=>{const p=P.path(Dn.sig.map((v,i)=>[v,Dn.curve[ck[k]][i]]),'ln');p.setAttribute('stroke',cc[k]);p.setAttribute('stroke-width',k===r?3.5:1.5);
      const yl=Dn.curve[ck[k]][Dn.curve[ck[k]].length-1];col(T(P.top,P.X(0.8)+8,P.Y(yl)+4+(k==='ae'?6:0),ck[k],k===r?'lab':'','start'),cc[k])})};
  const cur=segs(root,'r',draw);draw(cur()||'noisy')};

/* ---------- an autoencoder cannot generate: holes, random codes ---------- */
FIG['ae-holes']=root=>{const svg=svgOf(root);const C=AD.codes,H=AD.holes;
  stepper(root,s=>{initSvg(svg,620,390);setV(root,'s',s+' / 3');
    const lo=H.lo,hi=H.hi;const P=scatter(svg,[0,0],330,330,C.ae,C.y,{lo:lo,hi:hi,pad:0.02,r:1.8,op:0.6,title:'2-D AE: codes of 2000 test digits',m:{l:30,r:6,t:24,b:16}});
    P.rect(lo[0],lo[1],hi[0],hi[1],'nof',P.top).setAttribute('style','fill:none;stroke:#7f7f7f;stroke-dasharray:5 4');
    if(s>=1)H.z.forEach((z,i)=>{const x=P.X(z[0]),y=P.Y(z[1]);E('path',{d:'M'+(x-5)+','+(y-5)+' l10,10 m0,-10 l-10,10',stroke:'#1f1f1f','stroke-width':2.4},P.top);halo(T(P.top,x+7,y-5,String(i+1),'','start'))});
    if(s===1){T(svg,480,120,'12 random codes,','lab');T(svg,480,142,'uniform in the box','lab');T(svg,480,180,pct(H.empty)+' of the box','');T(svg,480,200,'holds no training code','')}
    if(s>=2&&s<3){grid(svg,H.img,4,350,30,62,6);H.img.forEach((_,i)=>halo(T(svg,350+(i%4)*68+6,30+Math.floor(i/4)*68+16,String(i+1),'','start')));
      T(svg,480,250,'digit-like, but in the wrong proportions','lab');const cb=H.cls_box,ct=H.cls_test;
      for(let d=0;d<10;d++){const x=360+d*25;E('rect',{x:x,y:330-120*cb[d],width:10,height:120*cb[d],fill:'#ed7d31'},svg);E('rect',{x:x+10,y:330-120*ct[d],width:10,height:120*ct[d],fill:'#bfbfbf'},svg);T(svg,x+10,346,String(d),'')}
      col(T(svg,360,268,'decoded classes','','start'),'#c55a11');col(T(svg,470,268,'test set','','start'),'#7f7f7f');T(svg,480,372,'no density: wrong proportions (TV '+nf(H.tv_box,2)+')','')}
    if(s>=3){T(svg,480,40,'16-D AE: decode z ~ N(0, I)','lab');grid(svg,H.std16,4,354,52,60,6);T(svg,480,190,'referee confident on '+pct(H.conf_std16[1])+': garbage','');
      T(svg,480,222,'16-D AE: z ~ Gaussian fitted to codes','lab');grid(svg,H.fit16,4,354,234,60,6);T(svg,480,372,'confident on '+pct(H.conf_fit16[1]),'')}
    if(s===0){T(svg,480,120,'the codes form clusters','lab');T(svg,480,142,'with empty space between','lab');T(svg,480,190,'nothing says which','');T(svg,480,210,'codes are likely','')}})};

/* ---------- the ELBO with numbers, for one test digit of the 2-D VAE ---------- */
FIG['ae-elbo']=root=>{const svg=svgOf(root);let d=0,s=0;
  const draw=()=>{const R=AD.gap[d];initSvg(svg,620,380);setV(root,'s',s+' / 4');
    /* left: posterior on a coarse grid, q ellipses */
    const g=R.g,n=g.length,M=R.mode,c=[(R.mu[0]+M[0])/2,(R.mu[1]+M[1])/2],h=Math.max(0.8,0.5*Math.max(Math.abs(R.mu[0]-M[0]),Math.abs(R.mu[1]-M[1]))+0.5);const P=Plot(svg,{at:[0,0],w:300,h:330,x:[c[0]-h,c[0]+h],y:[c[1]-h,c[1]+h],m:{l:34,r:6,t:30,b:30}});
    P.axes({grid:false,xl:'z₁',yl:'z₂'});const st=g[1]-g[0];
    if(s>=4)for(let i=0;i<n;i++)for(let j=0;j<n;j++){const v=R.post[i][j];if(v>0.05)P.rect(g[i]-st/2,g[j]-st/2,g[i]+st/2,g[j]+st/2,'',P.bgc).setAttribute('style','fill:'+heat(v,true)+';stroke:none')}
    if(s>=4){const mx=P.X(M[0]),my=P.Y(M[1]);E('path',{d:'M'+(mx-6)+','+(my-6)+' l12,12 m0,-12 l-12,12',stroke:'#1f1f1f','stroke-width':2.5},P.top)}
    [1,2].forEach(k=>E('ellipse',{cx:P.X(R.mu[0]),cy:P.Y(R.mu[1]),rx:Math.abs(P.X(R.mu[0]+k*R.sd[0])-P.X(R.mu[0])),ry:Math.abs(P.Y(R.mu[1]+k*R.sd[1])-P.Y(R.mu[1])),fill:'none',stroke:'#c00000','stroke-width':2},P.top));
    T(P.top,150,18,s>=4?'blue: posterior p(z|x), × its mode · red: q(z|x)':'red: q(z|x) at 1 and 2 std','');img(svg,R.img,236,40,56);
    /* right: the numbers */
    const x0=330;const rows=[['log p(x)',R.log_px,'grid integral over z',0],['E_q[log p(x|z)]',-R.rec,'reconstruction term',1],['− KL(q ‖ p(z))',-R.kl,'keeps q near N(0, I)',2],['= ELBO',R.elbo,'the lower bound we train',2],['gap',R.log_px-R.elbo,'log p(x) − ELBO = KL(q ‖ p(z|x))',3]];
    T(svg,x0,34,'test digit '+R.i+', a “'+R.y+'” (nats)','lab','start');
    rows.forEach(([a,v,b,k],i)=>{if(s<k)return;const y=74+i*54;col(TT(svg,x0,y,a,'lab','start'),i===3?'#c55a11':i===4?'#c00000':'#1f1f1f');T(svg,x0+282,y,nf(v,2),'lab big','end');T(svg,x0,y+20,b,'','start')});
    if(s>=3){ln(svg,[x0,74+3*54-26],[x0+282,74+3*54-26],'#7f7f7f',1)}
    if(s>=4)T(svg,x0,356,'importance sampling, K = 5000: log p(x) ≈ '+nf(R.iwae,2),'','start')};
  const inp=q(root,'s');inp.addEventListener('input',()=>{s=+inp.value;draw()});segs(root,'d',v=>{d=+v;draw()});s=+inp.value;draw()};

/* ---------- AE vs VAE code space, and samples ---------- */
FIG['ae-latent']=root=>{const svg=svgOf(root);const C=AD.codes,H=AD.holes,V=AD.vae2;
  const draw=m=>{initSvg(svg,620,380);const vae=m==='vae';
    const P=vae?scatter(svg,[0,0],330,340,C.vae,C.y,{lo:[-4,-4],hi:[4,4],pad:0,r:1.8,op:0.6,title:'2-D VAE: means of q(z|x)',xt:[-3,0,3],yt:[-3,0,3],m:{l:30,r:6,t:24,b:24}})
      :scatter(svg,[0,0],330,340,C.ae,C.y,{lo:H.lo,hi:H.hi,pad:0.02,r:1.8,op:0.6,title:'2-D AE: codes',m:{l:30,r:6,t:24,b:24}});
    if(vae)[1,2,3].forEach(r=>E('ellipse',{cx:P.X(0),cy:P.Y(0),rx:P.X(r)-P.X(0),ry:P.Y(0)-P.Y(r),fill:'none',stroke:'#595959','stroke-dasharray':'5 4'},P.top));
    T(svg,480,22,vae?'12 samples z ~ N(0, I), decoded':'12 random codes in the box, decoded','lab');grid(svg,vae?V.prior:H.img,4,352,32,62,6);
    const cf=vae?V.conf_prior:H.conf_box,tv=vae?H.tv_prior2:H.tv_box;
    T(svg,480,258,'referee confident on '+pct(cf[1])+' of 1000 samples','');T(svg,480,280,'classes vs test set: total variation '+nf(tv,2),'');
    T(svg,480,318,vae?'codes centred, spread ≈ 1: prior samples':'codes anywhere, any spread','');T(svg,480,338,vae?'land where the decoder was trained':'(std '+nf(H.ae_std[0],1)+' and '+nf(H.ae_std[1],1)+')','')};
  const cur=segs(root,'m',draw);draw(cur()||'ae')};

/* ---------- walking on the 2-D VAE manifold ---------- */
FIG['ae-walk']=root=>{const svg=svgOf(root);const V=AD.vae2,C=AD.codes;const n=V.pp.length;
  const draw=()=>{const i=+q(root,'i').value,j=+q(root,'j').value;const z1=V.pp[i],z2=V.pp[j];setV(root,'i','z₁ = '+nf(z1,2));setV(root,'j','z₂ = '+nf(z2,2));initSvg(svg,620,350);
    const cs=20,x0=0,y0=24;T(svg,x0+cs*n/2,16,'decoder on 15 × 15 prior quantiles','');
    for(let r=0;r<n;r++)for(let c=0;c<n;c++)img(svg,V.grid[r*n+c],x0+c*cs,y0+r*cs,cs,{stroke:'#fff',sw:0.5});
    const r=n-1-j;E('rect',{x:x0+i*cs-1,y:y0+r*cs-1,width:cs+2,height:cs+2,fill:'none',stroke:'#c00000','stroke-width':3},svg);
    img(svg,V.grid[r*n+i],330,30,120,{stroke:'#c00000',sw:2});T(svg,390,170,'z = ('+nf(z1,2)+', '+nf(z2,2)+')','lab');
    const P=scatter(svg,[460,10],160,170,C.vae,C.y,{lo:[-3,-3],hi:[3,3],pad:0,r:1,op:0.5,m:{l:4,r:4,t:4,b:4}});
    E('circle',{cx:P.X(z1),cy:P.Y(z2),r:6,fill:'none',stroke:'#c00000','stroke-width':2.5},P.top);
    T(svg,540,204,'the same point among','','middle');T(svg,540,222,'the codes of test digits','','middle');
    T(svg,330,280,'every cell has the same prior mass:','','start');T(svg,330,300,'z = Φ⁻¹(u) for u = 0.04 … 0.96','','start');T(svg,330,330,'neighbouring codes, similar digits','lab','start')};
  q(root,'i').addEventListener('input',draw);q(root,'j').addEventListener('input',draw);draw()};

/* ---------- interpolation: pixels, AE, VAE ---------- */
FIG['ae-interp']=root=>{const svg=svgOf(root);const I=AD.interp;const nm={pix:'cross-fade in pixel space',ae:'straight line in the 16-D AE code',vae:'straight line in the 16-D VAE code'},cc={pix:'#7f7f7f',ae:'#ed7d31',vae:'#4472c4'};
  let m='pix';const draw=()=>{const t=+q(root,'t').value;setV(root,'t','t = '+nf(t/9,2));initSvg(svg,620,370);
    const w=56,g=6,x0=(620-10*w-9*g)/2;['pix','ae','vae'].forEach((k,r)=>{const y=20+r*(w+26);col(T(svg,x0,y-6,nm[k],k===m?'lab':'','start'),cc[k]);strip(svg,I[k],x0,y,w,g,{stroke:k===m?cc[k]:'#d0d0d0',sw:k===m?2:1});
      if(k===m)E('rect',{x:x0+t*(w+g)-3,y:y-3,width:w+6,height:w+6,fill:'none',stroke:'#c00000','stroke-width':3},svg)});
    const P=Plot(svg,{at:[0,264],w:620,h:106,x:[0,1],y:[0,1],m:{l:56,r:200,t:8,b:30}});P.axes({xt:[0,0.5,1],yt:[0,0.5,1],xl:'t',yl:'referee'});
    ['pix','ae','vae'].forEach(k=>{const v=I['conf_'+k];const p=P.path(v.map((c,i)=>[i/9,c]),'ln');p.setAttribute('stroke',cc[k]);p.setAttribute('stroke-width',k===m?3.2:1.4)});
    P.line(t/9,0,t/9,1,'ln thin sr');const v=I['conf_'+m][t];T(svg,430,300,'referee confidence at t = '+nf(t/9,2)+':','','start');col(T(svg,430,322,nf(v,2)+' ('+nm[m].split(' ').slice(-2).join(' ')+')','lab','start'),cc[m])};
  segs(root,'m',v=>{m=v;draw()});q(root,'t').addEventListener('input',draw);draw()};

/* ---------- beta-VAE: rate and distortion ---------- */
FIG['ae-beta']=root=>{const svg=svgOf(root);const B=AD.beta;const keys=['0.1','1.0','4.0','bug'];const cc={'0.1':'#70ad47','1.0':'#4472c4','4.0':'#7030a0',bug:'#c00000'};
  const name=k=>k==='bug'?'bug (β = 784)':'β = '+(+k);
  const draw=k=>{initSvg(svg,620,390);const P=Plot(svg,{at:[0,0],w:300,h:270,x:[-3,58],y:[60,215],m:{l:50,r:10,t:26,b:40}});
    P.axes({xt:[0,20,40],yt:[80,120,160,200],xl:'rate R = KL (nats)',yl:'distortion D (nats)'});[-110,-130,-150].forEach(e=>P.line(0,-e,58,-e-58,'ln thin sm dot2',P.bg));
    T(P.top,150,16,'dotted: constant ELBO = −(D + R)','');
    keys.forEach(kk=>{const e=B[kk];const c=P.dot(e.kl,e.rec,kk===k?9:6,'');c.setAttribute('fill',cc[kk]);c.setAttribute('stroke','#fff');P.text(e.kl,e.rec,name(kk),kk===k?'lab':'','start',10,kk==='bug'?14:-6)});
    const e=B[k];const x0=320;
    T(svg,x0,22,name(k),'lab big','start');
    const rows=[['distortion D',nf(e.rec,1)+' nats'],['rate R',nf(e.kl,k==='bug'?3:1)+' nats'],['ELBO (β = 1)',nf(e.elbo,1)],['active dimensions',e.active+' of 16']];
    if(k!=='bug')rows.push(['referee on samples',pct(e.conf[1])+' confident']);
    rows.forEach(([a,b],i)=>{T(svg,x0,52+i*22,a,'','start');T(svg,x0+290,52+i*22,b,'lab','end')});
    if(k==='bug'){T(svg,x0,178,'inputs (top) and their reconstructions','','start');strip(svg,e.inputs.slice(0,4),x0,188,66,8);strip(svg,e.recon.slice(0,4),x0,262,66,8,{stroke:'#c00000'})}
    else{T(svg,x0,178,'samples z ~ N(0, I), decoded','','start');grid(svg,e.samples,4,x0,188,66,8)}
    /* KL per dimension */
    const Q=Plot(svg,{at:[0,272],w:300,h:118,x:[-0.5,15.5],y:[-4,1],m:{l:50,r:10,t:26,b:8}});Q.axes({yt:[-4,-2,0],fy:v=>v===0?'1':v===-2?'0.01':'10⁻⁴',grid:false});
    e.kl_dim.forEach((v,i)=>{Q.rect(i-0.35,-4,i+0.35,Math.log10(Math.max(v,1e-4)),'',Q.dyn).setAttribute('fill',cc[k])});Q.line(-0.5,-2,15.5,-2,'ln thin sm dash');T(Q.top,165,16,'KL of each dimension, sorted (log); dashed: 0.01','')};
  const cur=segs(root,'b',draw);draw(cur()||'1.0')};

/* ---------- posterior collapse: KL per dimension, and the bug ---------- */
FIG['ae-collapse']=root=>{const svg=initSvg(svgOf(root),1160,250);const B=AD.beta;
  T(svg,20,20,'training curves of the KL term (nats per digit)','lab','start');const P=Plot(svg,{at:[0,24],w:420,h:226,x:[1,10],y:[0,52],m:{l:46,r:80,t:8,b:36}});
  P.axes({xt:[1,2,4,6,8,10],yt:[0,10,20,30,40,50],xl:'epoch'});const cc={'0.1':'#70ad47','1.0':'#4472c4','4.0':'#7030a0',bug:'#c00000'};
  Object.keys(cc).forEach(k=>{const h=B[k].hist;const p=P.path(h.map((r,i)=>[i+1,r[1]]),'ln');p.setAttribute('stroke',cc[k]);if(k==='bug')p.setAttribute('stroke-dasharray','6 4');
    const last=h[h.length-1][1];col(T(P.top,P.X(h.length)+6,P.Y(last)+5+(k==='bug'?-8:0),k==='bug'?'bug':'β = '+(+k),'lab','start'),cc[k])});
  T(svg,470,20,'with the bug, every input gets the same output','lab','start');strip(svg,B.bug.inputs,470,34,72,8);strip(svg,B.bug.recon,470,124,72,8,{stroke:'#c00000'});
  T(svg,470,228,'top: test inputs · bottom: reconstructions (KL = '+nf(B.bug.kl,3)+' nats, 0 active dimensions)','','start')};

/* ---------- blurry samples ---------- */
FIG['ae-blurry']=root=>{const svg=initSvg(svgOf(root),620,330);const V=AD.vae16,I=AD.interp;
  T(svg,20,20,'decoder means (what we show)','lab','start');strip(svg,V.means.slice(0,6),20,30,80,8);
  T(svg,20,140,'pixels drawn from p(x | z): independent Bernoullis','lab','start');strip(svg,V.pix.slice(0,6),20,150,80,8);
  T(svg,20,266,'two equally likely digits:','lab','start');T(svg,20,290,'the best single guess is their average','','start');
  img(svg,I.pix[0],370,240,64);T(svg,446,278,'+','lab big');img(svg,I.pix[9],460,240,64);T(svg,536,278,'→','lab big');img(svg,I.pix[5],550,240,64,{stroke:'#c00000',sw:2})};

/* ---------- conditional VAE ---------- */
FIG['ae-cvae']=root=>{const svg=svgOf(root);const Cv=AD.cvae;
  onInput(root,'y',()=>{const y=+q(root,'y').value;setV(root,'y','y = '+y);initSvg(svg,620,320);const w=46,g=4;
    T(svg,10,18,'all ten labels, same five codes z (rows)','','start');
    for(let r=0;r<5;r++)for(let c=0;c<10;c++)img(svg,Cv.rows[r*10+c],10+c*(w+g),28+r*(w+g),w,{stroke:c===y?'#c00000':'#e0e0e0',sw:c===y?2.5:1});
    Cv.styles.forEach((z,r)=>T(svg,10+10*(w+g)+4,28+r*(w+g)+w/2+5,'z = ('+nf(z[0],1)+', '+nf(z[1],1)+')','','start'));
    T(svg,10,312,'label = which digit, code = style · the referee sees the requested digit in '+pct(Cv.acc,1)+' of 1000 samples','','start')})};

/* ---------- applications (cards) ---------- */
FIG['ae-app']=root=>{const svg=initSvg(svgOf(root),330,110);const k=root.dataset.app;const R=AD.rec,Dn=AD.den;
  if(k==='denoise'){img(svg,Dn.noisy[1],30,14,80);arrowPx(svg,120,54,196,54,'ln thin sk','fk');T(svg,158,44,'DAE','lab');img(svg,Dn.dae[1],210,14,80)}
  else if(k==='compress'){img(svg,R.orig[3],20,14,80);arrowPx(svg,106,54,140,54,'ln thin sk','fk');for(let i=0;i<8;i++)E('rect',{x:146,y:18+i*9,width:28,height:9,fill:heat(0.2+0.1*((i*37)%7),true),stroke:'#fff'},svg);T(svg,160,104,'8 numbers','');
    arrowPx(svg,182,54,216,54,'ln thin sk','fk');img(svg,R.ae[8][3],226,14,80)}
  else if(k==='pretrain'){box(svg,20,30,90,48,'encoder','#dae3f3',{cls:'lab'});T(svg,65,98,'trained as an AE','');arrowPx(svg,112,54,140,54,'ln thin sk','fk');box(svg,144,34,24,40,'z','#ffc000',{cls:'lab'});
    arrowPx(svg,170,54,198,54,'ln thin sk','fk');box(svg,200,30,110,48,'classifier','#fff2cc',{cls:'lab'});T(svg,255,98,'few labels','')}
  else if(k==='anomaly'){const P=Plot(svg,{at:[0,0],w:330,h:110,x:[0,6],y:[0,1.1],m:{l:12,r:10,t:10,b:28}});P.axes({grid:false});
    P.fn(x=>Math.exp(-((x-1.3)**2)/0.25),'ln sb');P.fn(x=>0.45*Math.exp(-((x-4.2)**2)/0.6),'ln so');P.line(2.6,0,2.6,1.05,'ln thin sr dash');
    P.text(1.3,1.0,'normal','','middle',0,-2).style.fill='#4472c4';P.text(4.2,0.5,'anomalies','','middle',0,-4).style.fill='#c55a11';T(P.top,165,106,'reconstruction error','')}
  else if(k==='search'){const r=rng(3);const pts=[...Array(40)].map(()=>[40+250*r(),12+80*r()]);const qp=[170,52];
    pts.forEach(p=>dot(svg,p[0],p[1],3.5,'#bfc8d9','none',0));const d=pts.map(p=>Math.hypot(p[0]-qp[0],p[1]-qp[1]));const nn=d.map((v,i)=>[v,i]).sort((a,b)=>a[0]-b[0]).slice(0,5);
    nn.forEach(([v,i])=>{ln(svg,qp,pts[i],'#ed7d31',1.5);dot(svg,pts[i][0],pts[i][1],4.5,'#ed7d31','#fff',1)});dot(svg,qp[0],qp[1],6,'#c00000','#fff',1.5);T(svg,165,106,'nearest codes = similar images','')}
  else if(k==='generate'){const pr=AD.vae16.means;strip(svg,pr.slice(0,4),20,14,66,8);T(svg,165,104,'z ~ N(0, I) → decoder (a VAE)','')}};

})();
