/* Figures for 04_cnn.html: convolutions, architectures, segmentation and detection */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,q,setV,setR,svgOf}=lib;const {grid,cube,heat,gray,box,stepper,segs,f2,f3}=window.MLNN;
const IMG=[[1,1,1,0,0],[0,1,1,1,0],[0,0,1,1,1],[0,0,1,1,0],[0,1,1,0,0]];
const KER={x:[[1,0,1],[0,1,0],[1,0,1]],edge:[[1,0,-1],[1,0,-1],[1,0,-1]],blur:[[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]]};
const f1=v=>Math.abs(v-Math.round(v))<1e-9?String(Math.round(v)):v.toFixed(2);
function conv2d(I,K){const F=K.length,H=I.length,W=I[0].length;const O=[];for(let i=0;i+F<=H;i++){const row=[];for(let j=0;j+F<=W;j++){let s=0;for(let u=0;u<F;u++)for(let v=0;v<F;v++)s+=I[i+u][j+v]*K[u][v];row.push(s)}O.push(row)}return O}
/* ---------- an image is a grid of numbers ---------- */
const DIGIT=[[0,0,0,0,0,0,0,0],[0,0.2,0.9,1,1,0.9,0.2,0],[0,0,0,0,0.3,1,0.4,0],[0,0,0,0.3,1,0.5,0,0],[0,0,0.2,1,0.6,0,0,0],[0,0,0.8,0.9,0,0,0,0],[0,0.3,1,0.3,0,0,0,0],[0,0,0,0,0,0,0,0]];
FIG['img-num']=root=>{const svg=initSvg(svgOf(root),640,280);T(svg,110,18,'grayscale: one number per pixel','lab');grid(svg,10,30,DIGIT,26,(i,j,v)=>gray(v),(i,j,v)=>String(Math.round(v*255)),{cls:'',tcol:(i,j,v)=>v>0.5?'#fff':'#404040',dy:4});
  T(svg,110,258,'8×8 image = 8×8 matrix, values 0–255 (or 0–1)','');
  T(svg,450,18,'colour: three stacked grids (channels)','lab');const cs=18;[['B','#9dc3e6',60],['G','#a9d18e',30],['R','#f4b183',0]].forEach(([c,col,off])=>{for(let i=0;i<8;i++)for(let j=0;j<8;j++)E('rect',{x:300+off+j*cs,y:40+(60-off)*0.6+i*cs,width:cs,height:cs,fill:col,'fill-opacity':0.35+0.6*DIGIT[i][j],stroke:'#7f7f7f','stroke-width':0.6},svg);T(svg,300+off+8*cs+12,40+(60-off)*0.6+14,c,'lab')});
  T(svg,450,232,'shape [3, H, W] in PyTorch (channels first)','');T(svg,450,258,'a batch of images: [B, 3, H, W]','')};
FIG['conv']=root=>{const svg=svgOf(root);const inp=q(root,'s');let kk='x';const btns=root.querySelectorAll('.seg button');
  function draw(){const s=+inp.value,K=KER[kk],r0=Math.floor(s/3),c0=s%3;setV(root,'s',(s+1)+' / 9');initSvg(svg,600,300);
    T(svg,120,20,'Image (5×5)','lab');T(svg,330,20,'Kernel (3×3)','lab');T(svg,505,20,'Convolved feature','lab');
    grid(svg,20,34,IMG,40,(i,j)=>i>=r0&&i<r0+3&&j>=c0&&j<c0+3?'#ffe699':(IMG[i][j]?'#a9d18e':'#fff'),(i,j,v)=>String(v));
    E('rect',{x:20+c0*40,y:34+r0*40,width:120,height:120,fill:'none',stroke:'#c00000','stroke-width':3},svg);
    grid(svg,270,74,K,40,()=>'#dae3f3',(i,j,v)=>kk==='blur'?'1/9':String(v));
    const out=conv2d(IMG,K);
    grid(svg,445,74,out,40,(i,j)=>i*3+j===s?'#f4b183':(i*3+j<s?'#fbe5d6':'#fff'),(i,j,v)=>i*3+j<=s?f1(v):'');
    let terms=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(IMG[r0+i][c0+j]!==0&&K[i][j]!==0)terms.push(IMG[r0+i][c0+j]+'·'+(kk==='blur'?'1/9':K[i][j]));
    T(svg,300,258,'output = Σ image × kernel = '+(terms.length?terms.join(' + '):'0')+' = '+f1(out[r0][c0]),'','middle');T(svg,300,285,'The 9 kernel weights are the parameters we learn. The same kernel slides over the whole image.','','middle')}
  btns.forEach(b=>b.addEventListener('click',()=>{kk=b.dataset.k;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));inp.addEventListener('input',draw);draw()};
/* ---------- filters as pattern detectors ---------- */
FIG['filters']=root=>{const svg=initSvg(svgOf(root),960,290);const N=12;const I=[];for(let i=0;i<N;i++){const row=[];for(let j=0;j<N;j++){let v=(i>=3&&i<=8&&j>=2&&j<=7)?1:0;if(i>=1&&j===i+7-1&&j<N)v=0.8;row.push(v)}I.push(row)}
  T(svg,100,16,'input 12×12','lab');grid(svg,10,26,I,15,(i,j,v)=>gray(v),null,{sw:0.5,stroke:'#bfbfbf'});T(svg,100,222,'a bright square and a thin diagonal line','');
  const KS=[['vertical edges',[[1,0,-1],[2,0,-2],[1,0,-1]]],['horizontal edges',[[1,2,1],[0,0,0],[-1,-2,-1]]],['diagonal ↘',[[2,-1,-1],[-1,2,-1],[-1,-1,2]]],['blur (average)',[[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]]]];
  KS.forEach(([name,K],k)=>{const x0=220+k*185;T(svg,x0+75,16,name,'lab');grid(svg,x0+20,26,K,22,()=>'#dae3f3',(i,j,v)=>Math.abs(v)<0.2?'⅑':String(v),{cls:''});T(svg,x0+75,108,'kernel 3×3','');
    const O=conv2d(I,K);let mx=0;O.forEach(r=>r.forEach(v=>mx=Math.max(mx,Math.abs(v))));grid(svg,x0,118,O,15,(i,j,v)=>heat(v/(mx||1)),null,{sw:0.4,stroke:'#d0d0d0'});T(svg,x0+75,282,'feature map 10×10','')});
  T(svg,590,282,'orange = positive response, blue = negative, white = nothing here','')};
FIG['outsize']=root=>{const svg=svgOf(root);const ih=q(root,'h'),iff=q(root,'f'),ip=q(root,'p'),is=q(root,'s');
  function draw(){const H=+ih.value,F=+iff.value,P=+ip.value,S=+is.value;['h','f','p','s'].forEach((k,i)=>setV(root,k,[H,F,P,S][i]));const O=Math.floor((H+2*P-F)/S)+1;initSvg(svg,600,320);
    const N=H+2*P;const cs=Math.min(22,260/N);for(let i=0;i<N;i++)for(let j=0;j<N;j++){const pad=i<P||j<P||i>=N-P||j>=N-P;E('rect',{x:20+j*cs,y:40+i*cs,width:cs-1,height:cs-1,fill:pad?'#e7e6e6':'#a9d18e'},svg)}
    if(O>0)E('rect',{x:20,y:40,width:F*cs-1,height:F*cs-1,fill:'none',stroke:'#c00000','stroke-width':2.5},svg);if(O>1)E('rect',{x:20+S*cs,y:40,width:F*cs-1,height:F*cs-1,fill:'none',stroke:'#c00000','stroke-width':1.5,'stroke-dasharray':'4 3'},svg);
    T(svg,20+N*cs/2,30,'input '+H+'×'+H+(P?' + padding '+P:''),'lab');const oc=Math.min(22,240/Math.max(O,1));
    for(let i=0;i<O;i++)for(let j=0;j<O;j++)E('rect',{x:340+j*oc,y:40+i*oc,width:oc-1,height:oc-1,fill:'#f4b183'},svg);T(svg,340+Math.max(O,1)*oc/2,30,'output '+(O>0?O+'×'+O:'—'),'lab');setR(root,'o',O>0?O+' × '+O:'invalid')}
  [ih,iff,ip,is].forEach(i=>i.addEventListener('input',draw));draw()};
/* ---------- channels: a filter is 3-D, many filters give many maps ---------- */
FIG['channels']=root=>{const svg=initSvg(svgOf(root),620,300);const cs=14;
  T(svg,110,18,'input 6×6×3','lab');[['#9dc3e6',36],['#a9d18e',18],['#f4b183',0]].forEach(([c,off])=>{for(let i=0;i<6;i++)for(let j=0;j<6;j++)E('rect',{x:30+off+j*cs,y:40+(36-off)*0.7+i*cs,width:cs,height:cs,fill:c,'fill-opacity':0.8,stroke:'#7f7f7f','stroke-width':0.5},svg)});
  T(svg,300,18,'one filter 3×3×3 (+ bias)','lab');[['#9dc3e6',24],['#a9d18e',12],['#f4b183',0]].forEach(([c,off])=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)E('rect',{x:250+off+j*cs,y:60+(24-off)*0.7+i*cs,width:cs,height:cs,fill:c,'fill-opacity':0.9,stroke:'#404040','stroke-width':0.6},svg)});T(svg,300,132,'28 weights','');
  arrowPx(svg,150,90,238,90,'ln thin sk','fk');T(svg,195,80,'slides over','');arrowPx(svg,340,90,395,90,'ln thin sk','fk');T(svg,368,80,'Σ','lab');
  T(svg,470,18,'one feature map 4×4','lab');for(let i=0;i<4;i++)for(let j=0;j<4;j++)E('rect',{x:420+j*cs,y:62+i*cs,width:cs,height:cs,fill:'#ffe699',stroke:'#7f7f7f','stroke-width':0.6},svg);
  T(svg,110,190,'C_out = 4 filters','lab');for(let f=0;f<4;f++)[['#9dc3e6',16],['#a9d18e',8],['#f4b183',0]].forEach(([c,off])=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)E('rect',{x:30+f*60+off+j*9,y:210+(16-off)*0.7+i*9,width:9,height:9,fill:c,'fill-opacity':0.9,stroke:'#404040','stroke-width':0.4},svg)});
  arrowPx(svg,290,235,395,235,'ln thin sk','fk');T(svg,342,225,'4 × 28 = 112 params','');T(svg,470,190,'output 4×4×4','lab');[3,2,1,0].forEach(f=>{for(let i=0;i<4;i++)for(let j=0;j<4;j++)E('rect',{x:420+f*12+j*cs,y:215+(3-f)*8+i*cs,width:cs,height:cs,fill:['#ffe699','#ffd966','#f4b183','#f8cbad'][f],stroke:'#7f7f7f','stroke-width':0.6},svg)});
  T(svg,310,290,'the depth of a filter always equals the number of input channels; the number of filters sets the number of output channels','','middle')};
/* ---------- receptive field (1-D cross-section) ---------- */
FIG['rf']=root=>{const svg=svgOf(root);const inp=q(root,'l');
  function draw(){const L=+inp.value;setV(root,'l',L);initSvg(svg,600,300);const n0=17;const cs=28;const rows=[];for(let l=0;l<=L;l++)rows.push(n0-2*l);
    const y0=250,dy=Math.min(52,200/L);const hi=[];const top=Math.floor(rows[L]/2);let set=new Set([top]);
    for(let l=L;l>=0;l--){hi[l]=new Set(set);const nxt=new Set();set.forEach(u=>{nxt.add(u);nxt.add(u+1);nxt.add(u+2)});set=nxt}
    for(let l=0;l<=L;l++){const n=rows[l];const x0=300-n*cs/2;const y=y0-l*dy;for(let u=0;u<n;u++){const on=hi[l].has(u);E('rect',{x:x0+u*cs+1,y:y-11,width:cs-2,height:22,rx:3,fill:l===0?(on?'#ed7d31':'#e2f0d9'):(on?'#c00000':'#dae3f3'),stroke:'#7f7f7f','stroke-width':0.6},svg)}
      T(svg,x0-8,y+4,l===0?'input':'conv '+l,'','end');if(l>0){hi[l].forEach(u=>{const xu=x0+u*cs+cs/2;for(let k=0;k<3;k++){const xd=300-rows[l-1]*cs/2+(u+k)*cs+cs/2;E('line',{x1:xu,y1:y+11,x2:xd,y2:y-dy-11+dy-0,stroke:'#c00000','stroke-width':0.8,'stroke-opacity':0.6},svg)}})}}
    T(svg,300,30,'one unit at the top sees '+(2*L+1)+' input pixels (3×3 kernels, stride 1)','lab');setR(root,'rf',(2*L+1)+' × '+(2*L+1))}
  inp.addEventListener('input',draw);draw()};
/* ---------- feature hierarchy ---------- */
FIG['hierarchy']=root=>{const svg=initSvg(svgOf(root),960,230);const tile=(x,y,fn)=>{E('rect',{x:x,y:y,width:60,height:60,fill:'#f7f7f7',stroke:'#bfbfbf'},svg);fn(x,y)};
  T(svg,150,20,'first layers: edges and colours','lab');[0,30,60,90,120].forEach((a,k)=>tile(30+k*66,34,(x,y)=>{const r=22,cx=x+30,cy=y+30;E('line',{x1:cx-r*Math.cos(a*Math.PI/180),y1:cy-r*Math.sin(a*Math.PI/180),x2:cx+r*Math.cos(a*Math.PI/180),y2:cy+r*Math.sin(a*Math.PI/180),stroke:'#404040','stroke-width':6},svg)}));
  tile(30+5*66,34,(x,y)=>E('rect',{x:x+8,y:y+8,width:44,height:44,fill:'#ed7d31'},svg));
  T(svg,480,20,'middle layers: textures and parts','lab');tile(400,34,(x,y)=>{E('path',{d:'M'+(x+10)+','+(y+50)+' L'+(x+10)+','+(y+10)+' L'+(x+50)+','+(y+10),fill:'none',stroke:'#404040','stroke-width':6},svg)});
  tile(466,34,(x,y)=>E('circle',{cx:x+30,cy:y+30,r:20,fill:'none',stroke:'#404040','stroke-width':6},svg));tile(532,34,(x,y)=>{for(let k=0;k<5;k++)E('line',{x1:x+6,y1:y+10+k*10,x2:x+54,y2:y+10+k*10,stroke:'#404040','stroke-width':3},svg)});
  tile(598,34,(x,y)=>{E('circle',{cx:x+30,cy:y+30,r:18,fill:'#404040'},svg);E('circle',{cx:x+30,cy:y+30,r:8,fill:'#bfbfbf'},svg)});
  T(svg,820,20,'deep layers: objects','lab');tile(740,34,(x,y)=>{E('rect',{x:x+8,y:y+26,width:44,height:18,rx:3,fill:'#4472c4'},svg);E('rect',{x:x+18,y:y+14,width:24,height:14,rx:3,fill:'#4472c4'},svg);E('circle',{cx:x+18,cy:y+46,r:5,fill:'#000'},svg);E('circle',{cx:x+42,cy:y+46,r:5,fill:'#000'},svg)});
  tile(806,34,(x,y)=>{E('circle',{cx:x+30,cy:y+22,r:11,fill:'#f4b183'},svg);E('rect',{x:x+18,y:y+34,width:24,height:22,rx:4,fill:'#70ad47'},svg)});tile(872,34,(x,y)=>{E('ellipse',{cx:x+30,cy:y+34,rx:20,ry:12,fill:'#a5a5a5'},svg);E('circle',{cx:x+44,cy:y+22,r:8,fill:'#a5a5a5'},svg)});
  arrowPx(svg,370,64,392,64,'ln sk','fk');arrowPx(svg,670,64,732,64,'ln sk','fk');
  T(svg,480,130,'each layer combines the patterns of the previous one over a larger region of the image','','middle');T(svg,480,152,'receptive field: a few pixels → a patch → the whole object','','middle');
  T(svg,480,200,'this is what "learned features" look like in a CNN (Zeiler & Fergus 2014 visualized real ones)','','middle')};
FIG['pool']=root=>{const svg=initSvg(svgOf(root),600,210);const M=[[3,2,0,0],[0,7,1,3],[5,2,3,0],[0,9,2,3]];const cols=['#dae3f3','#e2f0d9','#fbe5d6','#fff2cc'];
  [['Max pooling (2×2, stride 2)',(a)=>Math.max(...a),0],['Average pooling (2×2, stride 2)',(a)=>a.reduce((x,y)=>x+y,0)/a.length,300]].forEach(([lab,fn,x0])=>{T(svg,x0+140,18,lab,'lab');
    grid(svg,x0+10,34,M,38,(i,j)=>cols[(i<2?0:2)+(j<2?0:1)],(i,j,v)=>String(v));const out=[[0,0],[0,0]];for(let a=0;a<2;a++)for(let b=0;b<2;b++)out[a][b]=fn([M[2*a][2*b],M[2*a][2*b+1],M[2*a+1][2*b],M[2*a+1][2*b+1]]);
    arrowPx(svg,x0+168,110,x0+196,110,'ln thin sk','fk');grid(svg,x0+200,72,out,38,(i,j)=>cols[i*2+j],(i,j,v)=>f1(v))});T(svg,300,205,'A summarized, down-sampled version of the features: 4× fewer numbers, no parameters.','','middle')};
FIG['cnn-arch']=root=>{const svg=initSvg(svgOf(root),960,270);cube(svg,20,60,90,90,10,'#d9d9d9','input','28×28×1');cube(svg,150,50,80,110,40,'#8ea9db','conv 3×3 + ReLU','28×28×32');cube(svg,280,70,56,70,40,'#b4c7e7','max pool','14×14×32');
  cube(svg,380,60,50,90,70,'#8ea9db','conv 3×3 + ReLU','14×14×64');cube(svg,500,80,36,50,70,'#b4c7e7','max pool','7×7×64');
  E('rect',{x:630,y:30,width:24,height:170,fill:'#f4b183',stroke:'#404040'},svg);T(svg,642,222,'flatten','');T(svg,642,238,'3136','');E('rect',{x:700,y:70,width:24,height:90,fill:'#f4b183',stroke:'#404040'},svg);T(svg,712,182,'dense','');T(svg,712,198,'128','');
  E('rect',{x:770,y:100,width:24,height:36,fill:'#ffc000',stroke:'#404040'},svg);T(svg,782,158,'softmax','');T(svg,782,174,'10','');
  E('line',{x1:20,x2:590,y1:252,y2:252,class:'ln thin sb'},svg);T(svg,305,268,'FEATURE LEARNING','lab');E('line',{x1:620,x2:810,y1:252,y2:252,class:'ln thin so'},svg);T(svg,715,268,'CLASSIFICATION','lab')};
/* ---------- ImageNet timeline ---------- */
FIG['timeline']=root=>{const svg=initSvg(svgOf(root),620,300);const D=[['2010','SIFT + SVM',28.2,'–'],['2011','',25.8,'–'],['2012','AlexNet',16.4,'8 layers'],['2013','ZFNet',11.7,'8'],['2014','VGG',7.3,'19'],['2014','GoogLeNet',6.7,'22'],['2015','ResNet',3.6,'152'],['2017','SENet',2.3,'152']];
  const P=Plot(svg,{w:620,h:300,x:[-0.6,D.length-0.4],y:[0,32],m:{l:44,r:14,t:26,b:56}});P.axes({yt:[0,10,20,30],xt:[],yl:'top-5 error (%)'});T(P.root,330,16,'ImageNet classification challenge: error by year','lab');
  P.line(-0.6,5.1,D.length-0.4,5.1,'ln thin sr dash');P.text(D.length-0.5,5.1,'human ≈ 5 %','', 'end',0,-6);
  D.forEach((d,k)=>{const rc=P.rect(k-0.35,0,k+0.35,d[2],'');rc.setAttribute('fill',k<2?'#a5a5a5':'#4472c4');P.text(k,d[2],d[2]+'%','', 'middle',0,-6);P.text(k,0,d[0],'', 'middle',0,18);P.text(k,0,d[1],'lab','middle',0,34);P.text(k,0,d[3],'', 'middle',0,50)});
  T(P.root,44,286,'','')};
FIG['resblock']=root=>{const svg=initSvg(svgOf(root),420,300);const bx=(y,t)=>{E('rect',{x:120,y:y,width:150,height:36,rx:4,fill:'#fff',stroke:'#404040'},svg);T(svg,195,y+23,t,'lab')};
  T(svg,195,20,'x','lab big');arrowPx(svg,195,28,195,58,'ln thin sk','fk');bx(60,'weight layer');arrowPx(svg,195,96,195,126,'ln thin sk','fk');T(svg,212,116,'ReLU','','start');bx(128,'weight layer');arrowPx(svg,195,164,195,202,'ln thin sk','fk');
  E('circle',{cx:195,cy:216,r:14,fill:'#fff',stroke:'#404040'},svg);T(svg,195,222,'+','lab big');arrowPx(svg,195,230,195,272,'ln thin sk','fk');T(svg,212,262,'ReLU','','start');
  E('path',{d:'M195,40 C360,40 360,216 213,216',fill:'none',stroke:'#c00000','stroke-width':2.5},svg);T(svg,350,130,'identity x','lab','start');T(svg,100,120,'F(x)','lab','end');T(svg,195,294,'output: F(x) + x','lab')};
/* ---------- 1×1 conv and global average pooling ---------- */
FIG['one-by-one']=root=>{const svg=initSvg(svgOf(root),620,240);
  T(svg,150,18,'1×1 convolution: mix channels, keep space','lab');cube(svg,30,50,70,70,60,'#8ea9db','H×W×256','');arrowPx(svg,150,85,200,85,'ln thin sk','fk');T(svg,175,72,'1×1','');cube(svg,205,50,70,70,24,'#f4b183','H×W×64','');
  T(svg,150,170,'each output pixel = a dense layer over the 256 channel values','');T(svg,150,190,'of that same pixel: 256·64 + 64 params. Cheap bottleneck (ResNet-50, Inception).','');
  T(svg,470,18,'global average pooling: one number per map','lab');cube(svg,360,50,70,70,60,'#8ea9db','7×7×512','');arrowPx(svg,480,85,530,85,'ln thin sk','fk');T(svg,505,72,'mean','');for(let k=0;k<8;k++)E('rect',{x:540,y:40+k*11,width:22,height:10,fill:'#f4b183',stroke:'#404040','stroke-width':0.6},svg);T(svg,585,95,'512','lab','start');
  T(svg,470,170,'replaces Flatten + big dense layers: no parameters,','');T(svg,470,190,'any input size, far fewer weights (ResNet, EfficientNet).','')};
FIG['transfer']=root=>{const svg=initSvg(svgOf(root),900,320);
  [['Small dataset','freeze all layers, train only a new head',5],['Medium dataset','freeze most layers, fine-tune the last ones',3],['Large dataset','fine-tune everything, starting from pre-trained weights',0]].forEach(([lab,sub,frozen],k)=>{const x=40+k*295;T(svg,x+105,20,lab,'lab big');
    for(let l=0;l<6;l++){const fz=l<frozen;E('rect',{x:x+30,y:250-l*34,width:150,height:28,rx:4,fill:fz?'#d9d9d9':'#8ea9db',stroke:'#404040'},svg);T(svg,x+105,269-l*34,fz?'pre-trained (frozen)':'pre-trained, trained',fz?'':'').style.fill=fz?'#404040':'#fff'}
    E('rect',{x:x+30,y:46,width:150,height:28,rx:4,fill:'#ed7d31',stroke:'#404040'},svg);T(svg,x+105,65,'new classifier head','').style.fill='#fff';T(svg,x+105,308,sub,'','middle')})};
FIG['augment']=root=>{const svg=initSvg(svgOf(root),900,190);const shape=(g)=>{E('rect',{x:-40,y:-10,width:80,height:50,fill:'#ed7d31'},g);E('polygon',{points:'-50,-10 0,-50 50,-10',fill:'#c00000'},g);E('rect',{x:-10,y:12,width:20,height:28,fill:'#595959'},g);E('rect',{x:18,y:0,width:14,height:14,fill:'#dae3f3'},g);E('circle',{cx:44,cy:-44,r:10,fill:'#ffc000'},g)};
  [['original',''],['flip','scale(-1,1)'],['rotation','rotate(15)'],['random crop','scale(1.5) translate(-12,6)'],['colour shift','',{f:'hue-rotate(120deg)'}],['noise',''],['cut-out','']].forEach(([lab,tr,o],k)=>{const cx=65+k*128;
    const cp='cpa'+k;const d=E('defs',{},svg);const c=E('clipPath',{id:cp},d);E('rect',{x:cx-58,y:22,width:116,height:120},c);E('rect',{x:cx-58,y:22,width:116,height:120,fill:'#e2f0d9',stroke:'#bfbfbf'},svg);
    const outer=E('g',{'clip-path':'url(#'+cp+')'},svg);const g=E('g',{transform:'translate('+cx+',95) '+tr},outer);if(o&&o.f)g.setAttribute('style','filter:'+o.f);shape(g);
    if(lab==='noise'){const r=rng(3);for(let i=0;i<120;i++)E('rect',{x:cx-58+116*r(),y:22+120*r(),width:3,height:3,fill:r()<0.5?'#fff':'#000','fill-opacity':0.6},outer)}
    if(lab==='cut-out')E('rect',{x:cx-10,y:70,width:44,height:44,fill:'#000'},outer);T(svg,cx,166,lab,'lab')});T(svg,450,186,'Each epoch, the model sees a slightly different version of every image, and the label stays the same.','','middle')};
/* ---------- looking inside: first-layer filters and a class activation map ---------- */
FIG['inside']=root=>{const svg=initSvg(svgOf(root),620,250);T(svg,150,18,'first-layer filters of a trained CNN (schematic)','lab');
  for(let k=0;k<8;k++){const a=k*Math.PI/8;const x0=20+(k%4)*70,y0=30+Math.floor(k/4)*70;for(let i=0;i<5;i++)for(let j=0;j<5;j++){const v=0.5+0.5*Math.cos(((i-2)*Math.sin(a)+(j-2)*Math.cos(a))*1.4+(k>=4?Math.PI/2:0));E('rect',{x:x0+j*12,y:y0+i*12,width:12,height:12,fill:k===3?['#ed7d31','#4472c4'][(i+j)%2]:gray(v)},svg)}}
  T(svg,150,190,'oriented edges, at several angles, plus colour contrasts','');T(svg,150,210,'(Gabor-like). Every CNN trained on natural images learns these.','');
  T(svg,470,18,'class activation map: where did it look?','lab');E('rect',{x:340,y:30,width:260,height:140,fill:'#e2f0d9',stroke:'#bfbfbf'},svg);E('rect',{x:340,y:120,width:260,height:50,fill:'#a5a5a5'},svg);
  E('rect',{x:400,y:90,width:120,height:40,rx:6,fill:'#4472c4'},svg);E('rect',{x:425,y:66,width:70,height:28,rx:6,fill:'#4472c4'},svg);E('circle',{cx:425,cy:132,r:10,fill:'#000'},svg);E('circle',{cx:495,cy:132,r:10,fill:'#000'},svg);
  const d=E('defs',{},svg);const gr=E('radialGradient',{id:'camg'},d);E('stop',{offset:'0%','stop-color':'#c00000','stop-opacity':0.75},gr);E('stop',{offset:'60%','stop-color':'#ffc000','stop-opacity':0.45},gr);E('stop',{offset:'100%','stop-color':'#ffc000','stop-opacity':0},gr);
  E('ellipse',{cx:460,cy:105,rx:95,ry:55,fill:'url(#camg)'},svg);T(svg,470,190,'prediction "car": the heat map (Grad-CAM) shows the pixels','');T(svg,470,210,'that pushed that score up. A sanity check for shortcuts.','')};
FIG['transpose']=root=>{const svg=initSvg(svgOf(root),600,230);grid(svg,30,70,[[1,2],[3,4]],40,()=>'#dae3f3',(i,j,v)=>String(v));T(svg,70,58,'input 2×2','lab');arrowPx(svg,125,110,200,110,'ln sk','fk');T(svg,162,95,'stride 2','');
  const O=[[1,1,2,2],[1,1,2,2],[3,3,4,4],[3,3,4,4]];grid(svg,215,30,O,40,(i,j)=>['#dae3f3','#bdd7ee','#9dc3e6','#8ea9db'][O[i][j]-1],(i,j,v)=>'');T(svg,295,210,'output 4×4','lab');
  T(svg,480,90,'Each input value','','middle');T(svg,480,110,'"paints" a kernel-sized','','middle');T(svg,480,130,'patch of the output.','','middle');T(svg,480,160,'The kernel is learned.','lab','middle')};
/* ---------- ways to go up ---------- */
FIG['upsample']=root=>{const svg=initSvg(svgOf(root),940,250);const I=[[1,2],[3,4]];const cs=34;
  T(svg,60,18,'input 2×2','lab');grid(svg,26,40,I,cs,()=>'#dae3f3',(i,j,v)=>String(v));
  const near=[[1,1,2,2],[1,1,2,2],[3,3,4,4],[3,3,4,4]];
  const bil=[];for(let i=0;i<4;i++){const row=[];for(let j=0;j<4;j++){const sy=Math.min(1,Math.max(0,(i+0.5)/2-0.5)),sx=Math.min(1,Math.max(0,(j+0.5)/2-0.5));const y0=Math.floor(sy),x0=Math.floor(sx),fy=sy-y0,fx=sx-x0;const y1=Math.min(1,y0+1),x1=Math.min(1,x0+1);row.push((1-fy)*((1-fx)*I[y0][x0]+fx*I[y0][x1])+fy*((1-fx)*I[y1][x0]+fx*I[y1][x1]))}bil.push(row)}
  const K=[[1,0.5],[0.5,0.25]];const tc=[];for(let i=0;i<4;i++){const row=[];for(let j=0;j<4;j++)row.push(I[Math.floor(i/2)][Math.floor(j/2)]*K[i%2][j%2]);tc.push(row)}
  [['nearest neighbour: copy',near,'#e2f0d9','no parameters'],['bilinear: interpolate',bil,'#fff2cc','no parameters, smoother'],['transposed conv: learned kernel',tc,'#fbe5d6','kernel [[1, .5], [.5, .25]] here, learned in practice']].forEach(([lab,M,c,sub],k)=>{const x0=200+k*250;T(svg,x0+68,18,lab,'lab');
    arrowPx(svg,x0-40,108,x0-8,108,'ln thin sk','fk');grid(svg,x0,40,M,cs,()=>c,(i,j,v)=>f1(v),{cls:''});T(svg,x0+68,200,'output 4×4','');T(svg,x0+68,222,sub,'')})};
FIG['unet']=root=>{const svg=initSvg(svgOf(root),560,300);const bar=(x,y,h,c)=>E('rect',{x:x,y:y,width:16,height:h,fill:c,stroke:'#404040'},svg);
  const L=[[40,30,200],[110,90,120],[180,140,60],[250,175,26]];L.forEach(([x,y,h],i)=>{bar(x,y,h,'#4472c4');bar(x+18,y,h,'#4472c4');if(i<3)arrowPx(svg,x+26,y+h+8,L[i+1][0]+10,L[i+1][1]-4,'ln thin sr','fr')});
  const R=[[320,140,60],[390,90,120],[460,30,200]];R.forEach(([x,y,h],i)=>{bar(x,y,h,'#8ea9db');bar(x+18,y,h,'#4472c4')});arrowPx(svg,286,178,316,200,'ln thin so','fo');arrowPx(svg,356,140,388,210,'ln thin so','fo');arrowPx(svg,426,90,458,230,'ln thin so','fo');
  [[0,2],[1,1],[2,0]].forEach(([a,b])=>arrowPx(svg,L[a][0]+36,L[a][1]+12,R[b][0]-4,R[b][1]+12,'ln thin sm dash','fm'));bar(500,30,200,'#70ad47');
  T(svg,120,270,'encoder: conv + max-pool (down)','','middle');T(svg,430,270,'decoder: transposed conv (up)','','middle');T(svg,280,295,'dashed: skip connections copy fine detail across','','middle');T(svg,508,22,'mask','','middle');
  T(svg,50,20,'H×W','');T(svg,265,168,'H/8','')};
/* ---------- a scene drawn four ways: the vision tasks ---------- */
function scene(svg,x0,y0,W,H,mode,o){o=o||{};const g=E('g',{transform:'translate('+x0+','+y0+')'},svg);const sem=mode==='semantic',inst=mode==='instance',pan=mode==='panoptic';
  const sky=sem||pan?'#9dc3e6':inst?'#e7e6e6':'#dbeeff',road=sem||pan?'#a5a5a5':inst?'#e7e6e6':'#c9c9c9';E('rect',{x:0,y:0,width:W,height:H,fill:sky,stroke:'#bfbfbf'},g);E('rect',{x:0,y:H*0.62,width:W,height:H*0.38,fill:road},g);
  if(mode==='photo'||mode==='boxes'||mode==='grid'){E('circle',{cx:W*0.85,cy:H*0.18,r:H*0.08,fill:'#ffc000'},g)}
  const car=(cx,cy,s,col)=>{E('rect',{x:cx-0.5*s,y:cy-0.18*s,width:s,height:0.36*s,rx:0.05*s,fill:col},g);E('rect',{x:cx-0.3*s,y:cy-0.4*s,width:0.6*s,height:0.24*s,rx:0.05*s,fill:col},g);const wc=inst||sem||pan?col:'#000';E('circle',{cx:cx-0.3*s,cy:cy+0.2*s,r:0.09*s,fill:wc},g);E('circle',{cx:cx+0.3*s,cy:cy+0.2*s,r:0.09*s,fill:wc},g)};
  const person=(cx,cy,s,col,col2)=>{E('circle',{cx:cx,cy:cy-0.42*s,r:0.14*s,fill:col2||col},g);E('rect',{x:cx-0.14*s,y:cy-0.28*s,width:0.28*s,height:0.5*s,rx:0.06*s,fill:col},g);E('rect',{x:cx-0.13*s,y:cy+0.2*s,width:0.1*s,height:0.3*s,fill:col},g);E('rect',{x:cx+0.03*s,y:cy+0.2*s,width:0.1*s,height:0.3*s,fill:col},g)};
  const carCol=sem||pan?'#4472c4':inst?'#4472c4':'#c00000';car(W*0.36,H*0.62,W*0.4,carCol);
  const pCols=inst||pan?['#ed7d31','#70ad47']:sem?['#ed7d31','#ed7d31']:['#385723','#385723'];person(W*0.78,H*0.6,H*0.55,pCols[0],sem||inst||pan?pCols[0]:'#f4b183');if(o.two)person(W*0.9,H*0.62,H*0.5,pCols[1],sem||inst||pan?pCols[1]:'#f4b183');
  if(mode==='boxes'){const bx=(x,y,w,h,lab,c)=>{E('rect',{x:x,y:y,width:w,height:h,fill:'none',stroke:c,'stroke-width':2.5},g);E('rect',{x:x,y:y-16,width:lab.length*7+10,height:16,fill:c},g);T(g,x+5,y-4,lab,'','start').style.fill='#fff'};bx(W*0.15,H*0.44,W*0.42,H*0.36,'car 0.96','#c00000');bx(W*0.69,H*0.3,W*0.19,H*0.58,'person 0.91','#385723')}
  return g}
FIG['tasks']=root=>{const svg=initSvg(svgOf(root),960,300);const W=210,H=150;
  [['Classification','"car, person"','one label (or a few) for the whole image','photo'],['Object detection','a box + class + score per object','where is each thing?','boxes'],['Semantic segmentation','a class for every pixel','sky · road · car · person','semantic'],['Instance segmentation','a mask per object','this person vs that person','instance']].forEach(([t,s,s2,mode],k)=>{const x0=15+k*238;T(svg,x0+W/2,18,t,'lab big');scene(svg,x0,30,W,H,mode,{two:mode==='instance'||mode==='semantic'});
    if(mode==='photo'){E('rect',{x:x0,y:30,width:W,height:H,fill:'none',stroke:'#404040','stroke-width':2},svg)}T(svg,x0+W/2,205,s,'lab');T(svg,x0+W/2,226,s2,'')});
  T(svg,480,270,'same input, same convolutional backbone: what changes is the output layer and the loss','','middle')};
FIG['seg-types']=root=>{const svg=initSvg(svgOf(root),960,240);const W=250,H=150;
  [['Semantic: what class is this pixel?','both persons share one colour: "person"','semantic'],['Instance: which object is this pixel?','each person its own mask; background ignored','instance'],['Panoptic: both at once','stuff (sky, road) by class, things (car, persons) by instance','panoptic']].forEach(([t,s,mode],k)=>{const x0=25+k*310;T(svg,x0+W/2,18,t,'lab');scene(svg,x0,30,W,H,mode,{two:true});T(svg,x0+W/2,205,s,'')})};
/* ---------- segmentation = classify every pixel ---------- */
FIG['seg-pix']=root=>{const svg=svgOf(root);const N=8;const lab=[];for(let i=0;i<N;i++){const row=[];for(let j=0;j<N;j++){let c=0;if(i>=3&&i<=6&&j>=1&&j<=4)c=1;if(i>=1&&i<=5&&j>=6)c=2;row.push(c)}lab.push(row)}
  const r=rng(4);const S=[0,1,2].map(k=>lab.map(row=>row.map(c=>(c===k?2.2:-1.2)+0.7*randn(r))));const cols=['#e7e6e6','#4472c4','#ed7d31'];const names=['background','car','person'];
  const soft=(i,j)=>{const z=[0,1,2].map(k=>S[k][i][j]);const m=Math.max(...z);const e=z.map(v=>Math.exp(v-m));const s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s)};
  const inp=q(root,'k');function draw(){const k=+inp.value;setV(root,'k',names[k]);initSvg(svg,620,280);const cs=18;
    T(svg,90,18,'input pixels','lab');grid(svg,18,28,lab,cs,(i,j,v)=>['#cfe2f3','#8ea9db','#f4b183'][v],null,{sw:0.5,stroke:'#bfbfbf'});
    arrowPx(svg,170,100,205,100,'ln thin sk','fk');T(svg,300,18,'K = 3 score maps (logits)','lab');
    [2,1,0].forEach(m=>{const off=(2-m)*14;for(let i=0;i<N;i++)for(let j=0;j<N;j++){const v=S[m][i][j];E('rect',{x:215+off+j*cs*0.8,y:28+off*0.6+i*cs*0.8,width:cs*0.8,height:cs*0.8,fill:heat(v/3),stroke:m===k?'#c00000':'#d0d0d0','stroke-width':m===k?1.2:0.4},svg)}T(svg,215+off+N*cs*0.8+4,28+off*0.6+10,names[m],'','start')});
    arrowPx(svg,420,100,455,100,'ln thin sk','fk');T(svg,540,18,'argmax per pixel → mask','lab');
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){const p=soft(i,j);let a=0;p.forEach((v,m)=>{if(v>p[a])a=m});E('rect',{x:465+j*cs,y:28+i*cs,width:cs,height:cs,fill:cols[a],stroke:'#fff','stroke-width':0.6},svg)}
    T(svg,320,215,'output tensor [K, H, W]: for each pixel a softmax over the K classes, trained with cross-entropy on every pixel','','middle');
    T(svg,320,240,'shown: the "'+names[k]+'" map is outlined in red (orange = high score, blue = low)','','middle')}
  inp.addEventListener('input',draw);draw()};
/* ---------- fully convolutional: classification head vs segmentation head ---------- */
FIG['fcn']=root=>{const svg=initSvg(svgOf(root),960,270);cube(svg,20,80,80,80,10,'#d9d9d9','image','H×W×3');cube(svg,140,90,56,56,30,'#8ea9db','conv + pool','H/2 × W/2 × 64');cube(svg,250,100,36,36,50,'#8ea9db','conv + pool','H/4 × W/4 × 128');cube(svg,360,108,22,22,70,'#8ea9db','conv + pool','H/8 × W/8 × 256');
  [[100,120,138],[200,120,248],[290,120,358]].forEach(a=>arrowPx(svg,a[0],a[1],a[2],a[1],'ln thin sk','fk'));T(svg,220,40,'shared backbone (any CNN)','lab');
  E('path',{d:'M455,110 C520,60 560,60 600,60',fill:'none',stroke:'#404040','stroke-width':1.2},svg);E('path',{d:'M455,130 C520,190 560,190 600,190',fill:'none',stroke:'#404040','stroke-width':1.2},svg);
  box(svg,600,40,130,40,'global avg pool\n+ Linear → K','#fbe5d6',{lh:16,cls:''});arrowPx(svg,732,60,770,60,'ln thin sk','fk');for(let k=0;k<4;k++)E('rect',{x:775,y:44+k*9,width:40,height:8,fill:'#ffc000',stroke:'#404040','stroke-width':0.5},svg);T(svg,795,100,'K scores','');T(svg,870,60,'classification','lab','start');
  box(svg,600,170,130,40,'1×1 conv → K maps\n+ upsample ×8','#e2f0d9',{lh:16,cls:''});arrowPx(svg,732,190,770,190,'ln thin sk','fk');cube(svg,775,150,60,60,14,'#70ad47','H×W×K','');T(svg,880,190,'segmentation','lab','start');
  T(svg,480,250,'"fully convolutional": no Flatten, so the spatial layout survives to the output and any image size works (Long et al. 2015)','','middle')};
/* ---------- mask IoU and Dice ---------- */
FIG['maskiou']=root=>{const svg=svgOf(root);const N=10;const ix=q(root,'x'),ir=q(root,'r');
  const blob=(cx,cy,rad)=>{const M=[];for(let i=0;i<N;i++){const row=[];for(let j=0;j<N;j++)row.push(Math.hypot(i-cy,j-cx)<=rad?1:0);M.push(row)}return M};
  function draw(){const dx=+ix.value,rad=+ir.value;setV(root,'x',String(dx));setV(root,'r',fmt(rad,1));const G=blob(4,4.5,2.6),P=blob(4+dx,4.5,rad);let I=0,g=0,p=0;for(let i=0;i<N;i++)for(let j=0;j<N;j++){I+=G[i][j]&&P[i][j];g+=G[i][j];p+=P[i][j]}const U=g+p-I;
    initSvg(svg,420,300);const cs=26;for(let i=0;i<N;i++)for(let j=0;j<N;j++){const a=G[i][j],b=P[i][j];E('rect',{x:20+j*cs,y:20+i*cs,width:cs-1,height:cs-1,fill:a&&b?'#ed7d31':a?'#a9d18e':b?'#9dc3e6':'#f7f7f7'},svg)}
    E('rect',{x:300,y:30,width:18,height:18,fill:'#a9d18e'},svg);T(svg,325,44,'truth only','','start');E('rect',{x:300,y:60,width:18,height:18,fill:'#9dc3e6'},svg);T(svg,325,74,'prediction only','','start');E('rect',{x:300,y:90,width:18,height:18,fill:'#ed7d31'},svg);T(svg,325,104,'both (∩)','','start');
    T(svg,300,150,'|G| = '+g+', |P| = '+p,'','start');T(svg,300,172,'|P ∩ G| = '+I,'','start');T(svg,300,194,'|P ∪ G| = '+U,'','start');setR(root,'iou',fmt(I/U,3));setR(root,'dice',fmt(2*I/(g+p),3))}
  ix.addEventListener('input',draw);ir.addEventListener('input',draw);draw()};
/* ---------- box formats ---------- */
FIG['boxfmt']=root=>{const svg=initSvg(svgOf(root),620,280);const W=320,H=240;E('rect',{x:20,y:20,width:W,height:H,fill:'#e2f0d9',stroke:'#7f7f7f'},svg);T(svg,20+W/2,20+H+16,'image 640 × 480 px','');
  const x1=20+64,y1=20+48,w=128,h=120;E('rect',{x:x1,y:y1,width:w,height:h,fill:'#4472c4','fill-opacity':0.25,stroke:'#4472c4','stroke-width':2.5},svg);
  E('circle',{cx:x1,cy:y1,r:5,fill:'#c00000'},svg);T(svg,x1+8,y1-8,'(x₁, y₁) = (128, 96)','lab','start');E('circle',{cx:x1+w,cy:y1+h,r:5,fill:'#c00000'},svg);T(svg,x1+w-8,y1+h+18,'(x₂, y₂) = (384, 336)','lab','end');
  E('circle',{cx:x1+w/2,cy:y1+h/2,r:5,fill:'#ed7d31'},svg);T(svg,x1+w/2,y1+h/2-10,'(cₓ, c_y) = (256, 216)','lab');E('line',{x1:x1,y1:y1+h+6,x2:x1+w,y2:y1+h+6,stroke:'#404040'},svg);T(svg,x1+w/2,y1+h+32,'w = 256','');E('line',{x1:x1+w+6,y1:y1,x2:x1+w+6,y2:y1+h,stroke:'#404040'},svg);T(svg,x1+w+30,y1+h/2,'h = 240','');
  T(svg,480,40,'three equivalent formats','lab');T(svg,370,70,'xyxy: (x₁, y₁, x₂, y₂) = (128, 96, 384, 336)','','start');T(svg,370,96,'xywh: (x₁, y₁, w, h) = (128, 96, 256, 240)','','start');T(svg,370,122,'cxcywh: (cₓ, c_y, w, h) = (256, 216, 256, 240)','','start');
  T(svg,480,160,'normalized (YOLO labels)','lab');T(svg,370,186,'divide by image width and height:','','start');T(svg,370,212,'(0.40, 0.45, 0.40, 0.50)','lab','start');T(svg,370,240,'independent of resizing; one line per object:','','start');T(svg,370,262,'class cₓ c_y w h  →  "2 0.40 0.45 0.40 0.50"','mono','start')};
/* ---------- detector families ---------- */
FIG['det-families']=root=>{const svg=initSvg(svgOf(root),960,300);const W=250,H=150;
  [['Sliding window (2000s)','every position × every size → a classifier: 10⁴–10⁵ crops per image','slow'],['Two-stage: R-CNN family (2014–)','1: propose ~1000 likely regions · 2: classify and refine each box (Faster R-CNN, Mask R-CNN)','accurate, slower'],['One-stage: YOLO, SSD, RetinaNet (2016–)','a grid of cells; every cell predicts boxes + classes in a single forward pass','real-time']].forEach(([t,s,tag],k)=>{const x0=25+k*310;T(svg,x0+W/2,18,t,'lab');scene(svg,x0,30,W,H,'photo');
    if(k===0){const r=rng(2);for(let i=0;i<26;i++){const s=40+60*r();E('rect',{x:x0+(W-s)*r(),y:30+(H-s)*r(),width:s,height:s,fill:'none',stroke:'#4472c4','stroke-width':1,'stroke-opacity':0.5},svg)}}
    if(k===1){[[30,60,120,70],[70,45,110,75],[168,42,52,90],[10,100,80,40],[150,90,90,50]].forEach(b=>E('rect',{x:x0+b[0],y:30+b[1],width:b[2],height:b[3],fill:'none',stroke:'#ed7d31','stroke-width':1.8,'stroke-dasharray':'5 3'},svg))}
    if(k===2){for(let a=1;a<5;a++){E('line',{x1:x0+a*W/5,y1:30,x2:x0+a*W/5,y2:30+H,stroke:'#fff','stroke-width':1.2},svg);E('line',{x1:x0,y1:30+a*H/5,x2:x0+W,y2:30+a*H/5,stroke:'#fff','stroke-width':1.2},svg)}E('rect',{x:x0+W/5,y:30+2*H/5,width:W/5,height:H/5,fill:'#c00000','fill-opacity':0.35},svg);E('rect',{x:x0+3*W/5,y:30+H/5,width:W/5,height:H/5,fill:'#385723','fill-opacity':0.35},svg)}
    const tt=T(svg,x0+W/2,205,s,'');T(svg,x0+W/2,232,tag,'lab')});
  T(svg,480,275,'all of them reuse a classification CNN as the backbone; they differ in how they turn features into boxes','','middle')};
/* ---------- YOLO grid ---------- */
FIG['yolo-grid']=root=>{const svg=svgOf(root);const S=7;const inp=q(root,'c');const W=350,H=250;const carC=[4,2],perC=[4,5];
  function draw(){const c=+inp.value;const ci=Math.floor(c/S),cj=c%S;setV(root,'c','row '+(ci+1)+', col '+(cj+1));initSvg(svg,620,300);scene(svg,10,20,W,H,'grid');
    for(let a=1;a<S;a++){E('line',{x1:10+a*W/S,y1:20,x2:10+a*W/S,y2:20+H,stroke:'#fff','stroke-width':1.2},svg);E('line',{x1:10,y1:20+a*H/S,x2:10+W,y2:20+a*H/S,stroke:'#fff','stroke-width':1.2},svg)}
    E('circle',{cx:10+W*0.36,cy:20+H*0.62,r:5,fill:'#c00000',stroke:'#fff'},svg);E('circle',{cx:10+W*0.78,cy:20+H*0.6,r:5,fill:'#385723',stroke:'#fff'},svg);
    E('rect',{x:10+cj*W/S,y:20+ci*H/S,width:W/S,height:H/S,fill:'#ffc000','fill-opacity':0.45,stroke:'#c00000','stroke-width':2.5},svg);
    const isCar=ci===carC[0]&&cj===carC[1],isPer=ci===perC[0]&&cj===perC[1];const vec=isCar?[0.92,0.52,0.34,0.40,0.36,0.95,0.03,0.02]:isPer?[0.88,0.46,0.20,0.19,0.58,0.04,0.93,0.03]:[0.03,0.5,0.5,0.1,0.1,0.3,0.4,0.3];
    const names=['p(object)','cₓ','c_y','w','h','p(car)','p(person)','p(dog)'];T(svg,480,32,'prediction of this cell','lab');
    vec.forEach((v,k)=>{const y=48+k*27;T(svg,455,y+13,names[k],'','end');E('rect',{x:462,y:y,width:Math.max(2,110*v),height:18,fill:k===0?'#c00000':k<5?'#4472c4':'#ed7d31'},svg);T(svg,578,y+13,fmt(v,2),'','start')});
    T(svg,510,275,isCar?'the car\'s centre falls here: this cell owns the car':isPer?'the person\'s centre falls here: this cell owns the person':'no object centre here: p(object) ≈ 0, the rest is ignored','','middle');
    T(svg,185,290,'dots: object centres · output tensor 7 × 7 × 8 (per box)','','middle')}
  inp.addEventListener('input',draw);draw()};
/* ---------- NMS step by step ---------- */
function iouBox(a,b){const ix0=Math.max(a[0],b[0]),iy0=Math.max(a[1],b[1]),ix1=Math.min(a[2],b[2]),iy1=Math.min(a[3],b[3]);const I=Math.max(0,ix1-ix0)*Math.max(0,iy1-iy0);const A=(a[2]-a[0])*(a[3]-a[1]),B=(b[2]-b[0])*(b[3]-b[1]);return I/(A+B-I)}
FIG['nms-steps']=root=>{const svg=svgOf(root);const W=350,H=250;
  const C=[[52,110,200,200,0.92,'car'],[40,100,190,205,0.81,'car'],[70,118,215,196,0.75,'car'],[60,130,150,190,0.40,'car'],[241,75,306,220,0.88,'person'],[230,80,300,210,0.62,'person'],[250,90,320,230,0.30,'person'],[150,20,230,70,0.15,'car']];
  stepper(root,s=>{initSvg(svg,620,300);scene(svg,10,20,W,H,'photo');const state=C.map(()=>'cand');
    if(s>=1)C.forEach((b,i)=>{if(b[4]<0.25)state[i]='low'});
    const order=C.map((b,i)=>i).filter(i=>state[i]==='cand').sort((i,j)=>C[j][4]-C[i][4]);const kept=[];let rounds=0;
    for(const i of order){if(state[i]!=='cand')continue;if(rounds>=s-1)break;state[i]='keep';kept.push(i);rounds++;C.forEach((b,j)=>{if(state[j]==='cand'&&iouBox(C[i],b)>0.5)state[j]='sup'})}
    C.forEach((b,i)=>{const st=state[i];const col=b[5]==='car'?'#c00000':'#385723';if(st==='low'||st==='sup')return;E('rect',{x:10+b[0],y:20+b[1],width:b[2]-b[0],height:b[3]-b[1],fill:'none',stroke:st==='keep'?col:'#4472c4','stroke-width':st==='keep'?3:1.5,'stroke-opacity':st==='keep'?1:0.5+0.5*b[4]},svg);
      E('rect',{x:10+b[0],y:20+b[1]-15,width:62,height:15,fill:st==='keep'?col:'#4472c4','fill-opacity':st==='keep'?1:0.6},svg);T(svg,10+b[0]+3,20+b[1]-3,b[5]+' '+fmt(b[4],2),'','start').style.fill='#fff'});
    C.forEach((b,i)=>{if(state[i]==='sup'||state[i]==='low')E('rect',{x:10+b[0],y:20+b[1],width:b[2]-b[0],height:b[3]-b[1],fill:'none',stroke:'#7f7f7f','stroke-width':1,'stroke-dasharray':'4 3','stroke-opacity':0.6},svg)});
    T(svg,480,40,'candidates, sorted by score','lab');const sorted=C.map((b,i)=>i).sort((i,j)=>C[j][4]-C[i][4]);sorted.forEach((i,k)=>{const b=C[i];const st=state[i];const y=58+k*26;const col=st==='keep'?(b[5]==='car'?'#c00000':'#385723'):st==='cand'?'#1f1f1f':'#a5a5a5';
      const tt=T(svg,400,y+12,(st==='keep'?'✔ ':st==='sup'?'✖ ':st==='low'?'· ':'   ')+b[5]+' '+fmt(b[4],2)+(st==='sup'?'  IoU > 0.5 with a kept box':st==='low'?'  below threshold':''),'','start');tt.style.fill=col});
    T(svg,185,290,['8 raw boxes: several per object','drop scores < 0.25','keep the best remaining box; suppress the ones overlapping it (IoU > 0.5)','repeat with the next best','done: one box per object'][Math.min(s,4)],'','middle')})};
FIG['iou']=root=>{const P=Plot(svgOf(root),{w:460,h:380,x:[0,10],y:[0,8],m:{l:20,r:14,t:14,b:20}});P.rect(0,0,10,8,'fw',P.bg);const ix=q(root,'x'),is=q(root,'s');
  function draw(){const dx=+ix.value,s=+is.value;setV(root,'x',fmt(dx,1));setV(root,'s',fmt(s,1));P.clear();const G=[2,1.5,6,5.5],B=[2+dx,1.5+dx*0.3,2+dx+4*s,1.5+dx*0.3+4*s];
    const ix0=Math.max(G[0],B[0]),iy0=Math.max(G[1],B[1]),ix1=Math.min(G[2],B[2]),iy1=Math.min(G[3],B[3]);const I=Math.max(0,ix1-ix0)*Math.max(0,iy1-iy0);const U=16+16*s*s-I;
    P.rect(G[0],G[1],G[2],G[3],'fgs');P.rect(B[0],B[1],B[2],B[3],'fbs');if(I>0)P.rect(ix0,iy0,ix1,iy1,'fos');const g=P.rect(G[0],G[1],G[2],G[3],'nof');g.setAttribute('style','stroke:#548235;stroke-width:3');const b=P.rect(B[0],B[1],B[2],B[3],'nof');b.setAttribute('style','stroke:#4472c4;stroke-width:3;stroke-dasharray:7 4');
    P.text(G[0],G[3],'ground truth','', 'start',4,-6);P.text(B[2],B[1],'prediction','', 'end',-4,16);setR(root,'iou',fmt(I/U,3));setR(root,'v',I/U>=0.5?'a match (IoU ≥ 0.5)':'not a match')}
  ix.addEventListener('input',draw);is.addEventListener('input',draw);draw()};
FIG['nms']=root=>{const svg=initSvg(svgOf(root),900,300);const objs=[[80,70,150,160,'zebra'],[270,110,110,120,'elephant']];const r=rng(5);
  ['Raw predictions: many overlapping boxes','After confidence threshold + NMS'].forEach((lab,k)=>{const x0=k*460+10;E('rect',{x:x0,y:30,width:430,height:250,fill:'#e2f0d9',stroke:'#bfbfbf'},svg);T(svg,x0+215,20,lab,'lab');
    for(let a=1;a<7;a++){E('line',{x1:x0+a*430/7,y1:30,x2:x0+a*430/7,y2:280,stroke:'#fff'},svg);E('line',{x1:x0,y1:30+a*250/7,x2:x0+430,y2:30+a*250/7,stroke:'#fff'},svg)}
    objs.forEach(([x,y,w,h,name],i)=>{E('ellipse',{cx:x0+x+w/2,cy:30+y+h/2,rx:w/2.6,ry:h/2.8,fill:i?'#a5a5a5':'#7f7f7f'},svg);
      if(k===0)for(let j=0;j<5;j++){const jx=(r()-0.5)*30,jy=(r()-0.5)*26,sw=1+(r()-0.5)*0.3;E('rect',{x:x0+x+jx,y:30+y+jy,width:w*sw,height:h*sw,fill:'none',stroke:'#4472c4','stroke-width':1.5,'stroke-opacity':0.4+0.5*r()},svg)}
      else{E('rect',{x:x0+x,y:30+y,width:w,height:h,fill:'none',stroke:'#c00000','stroke-width':3},svg);E('rect',{x:x0+x,y:30+y-20,width:name.length*9+40,height:20,fill:'#c00000'},svg);T(svg,x0+x+6,30+y-5,name+' 0.9'+(8-i),'','start').style.fill='#fff'}})})};
/* ---------- precision–recall and average precision ---------- */
FIG['pr-ap']=root=>{const svg=initSvg(svgOf(root),620,300);const preds=[[0.95,1],[0.90,1],[0.82,0],[0.75,1],[0.66,0],[0.60,1],[0.45,0],[0.30,1]];const nGT=6;
  T(svg,110,18,'predictions, sorted by score','lab');T(svg,30,40,'score','','start');T(svg,90,40,'IoU ≥ 0.5?','','start');T(svg,165,40,'prec.','','start');T(svg,210,40,'recall','','start');
  let tp=0;const pts=[];preds.forEach(([sc,ok],k)=>{tp+=ok;const p=tp/(k+1),r=tp/nGT;pts.push([r,p]);const y=60+k*24;T(svg,30,y,fmt(sc,2),'','start');const t=T(svg,90,y,ok?'TP':'FP','lab','start');t.style.fill=ok?'#548235':'#c00000';T(svg,165,y,fmt(p,2),'','start');T(svg,210,y,fmt(r,2),'','start')});
  T(svg,130,262,nGT+' true objects in total','');T(svg,130,282,'each row: one more box accepted','');
  const P=Plot(svg,{at:[280,0],w:340,h:300,x:[0,1.02],y:[0,1.05],m:{l:40,r:10,t:26,b:36}});P.axes({xt:[0,0.5,1],yt:[0,0.5,1],xl:'recall',yl:'precision'});T(P.root,180,16,'precision–recall curve, AP = area','lab');
  const env=[];for(let i=0;i<pts.length;i++){let m=0;for(let j=i;j<pts.length;j++)m=Math.max(m,pts[j][1]);env.push([pts[i][0],m])}
  const poly=[[0,env[0][1]]];let prevR=0;env.forEach(([r,p])=>{poly.push([prevR,p]);poly.push([r,p]);prevR=r});poly.push([prevR,0]);P.poly(poly,'fbs');
  let ap=0;prevR=0;env.forEach(([r,p])=>{ap+=(r-prevR)*p;prevR=r});pts.forEach(([r,p])=>P.dot(r,p,4,'fr'));P.path(pts,'ln thin sr');P.text(0.55,0.25,'AP = '+fmt(ap,2),'lab','start');P.text(0.55,0.15,'(interpolated precision)','', 'start')};
})();
