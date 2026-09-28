/* Figures for 04_cnn.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,q,setV,setR,svgOf}=lib;
const IMG=[[1,1,1,0,0],[0,1,1,1,0],[0,0,1,1,1],[0,0,1,1,0],[0,1,1,0,0]];
const KER={x:[[1,0,1],[0,1,0],[1,0,1]],edge:[[1,0,-1],[1,0,-1],[1,0,-1]],blur:[[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]]};
function grid(svg,x0,y0,M,cs,fillFn,txtFn){M.forEach((row,i)=>row.forEach((v,j)=>{E('rect',{x:x0+j*cs,y:y0+i*cs,width:cs,height:cs,fill:fillFn(i,j,v),stroke:'#595959','stroke-width':1},svg);const t=txtFn(i,j,v);if(t!==null)T(svg,x0+j*cs+cs/2,y0+i*cs+cs/2+6,t,'lab')}))}
const f1=v=>Math.abs(v-Math.round(v))<1e-9?String(Math.round(v)):v.toFixed(2);
FIG['conv']=root=>{const svg=svgOf(root);const inp=q(root,'s');let kk='x';const btns=root.querySelectorAll('.seg button');
  function draw(){const s=+inp.value,K=KER[kk],r0=Math.floor(s/3),c0=s%3;setV(root,'s',(s+1)+' / 9');initSvg(svg,600,300);
    T(svg,120,20,'Image (5×5)','lab');T(svg,330,20,'Kernel (3×3)','lab');T(svg,505,20,'Convolved feature','lab');
    grid(svg,20,34,IMG,40,(i,j)=>i>=r0&&i<r0+3&&j>=c0&&j<c0+3?'#ffe699':(IMG[i][j]?'#a9d18e':'#fff'),(i,j,v)=>String(v));
    E('rect',{x:20+c0*40,y:34+r0*40,width:120,height:120,fill:'none',stroke:'#c00000','stroke-width':3},svg);
    grid(svg,270,74,K,40,()=>'#dae3f3',(i,j,v)=>kk==='blur'?'1/9':String(v));
    const out=[[0,0,0],[0,0,0],[0,0,0]];for(let a=0;a<3;a++)for(let b=0;b<3;b++){let t=0;for(let i=0;i<3;i++)for(let j=0;j<3;j++)t+=IMG[a+i][b+j]*K[i][j];out[a][b]=t}
    grid(svg,445,74,out,40,(i,j)=>i*3+j===s?'#f4b183':(i*3+j<s?'#fbe5d6':'#fff'),(i,j,v)=>i*3+j<=s?f1(v):'');
    let terms=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(IMG[r0+i][c0+j]!==0&&K[i][j]!==0)terms.push(IMG[r0+i][c0+j]+'·'+(kk==='blur'?'1/9':K[i][j]));
    T(svg,300,258,'output = Σ image × kernel = '+(terms.length?terms.join(' + '):'0')+' = '+f1(out[r0][c0]),'','middle');T(svg,300,285,'The 9 kernel weights are the parameters we learn. The same kernel slides over the whole image.','','middle')}
  btns.forEach(b=>b.addEventListener('click',()=>{kk=b.dataset.k;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));inp.addEventListener('input',draw);draw()};
FIG['outsize']=root=>{const svg=svgOf(root);const ih=q(root,'h'),iff=q(root,'f'),ip=q(root,'p'),is=q(root,'s');
  function draw(){const H=+ih.value,F=+iff.value,P=+ip.value,S=+is.value;['h','f','p','s'].forEach((k,i)=>setV(root,k,[H,F,P,S][i]));const O=Math.floor((H+2*P-F)/S)+1;initSvg(svg,600,320);
    const N=H+2*P;const cs=Math.min(22,260/N);for(let i=0;i<N;i++)for(let j=0;j<N;j++){const pad=i<P||j<P||i>=N-P||j>=N-P;E('rect',{x:20+j*cs,y:40+i*cs,width:cs-1,height:cs-1,fill:pad?'#e7e6e6':'#a9d18e'},svg)}
    if(O>0)E('rect',{x:20,y:40,width:F*cs-1,height:F*cs-1,fill:'none',stroke:'#c00000','stroke-width':2.5},svg);if(O>1)E('rect',{x:20+S*cs,y:40,width:F*cs-1,height:F*cs-1,fill:'none',stroke:'#c00000','stroke-width':1.5,'stroke-dasharray':'4 3'},svg);
    T(svg,20+N*cs/2,30,'input '+H+'×'+H+(P?' + padding '+P:''),'lab');const oc=Math.min(22,240/Math.max(O,1));
    for(let i=0;i<O;i++)for(let j=0;j<O;j++)E('rect',{x:340+j*oc,y:40+i*oc,width:oc-1,height:oc-1,fill:'#f4b183'},svg);T(svg,340+Math.max(O,1)*oc/2,30,'output '+(O>0?O+'×'+O:'—'),'lab');setR(root,'o',O>0?O+' × '+O:'invalid')}
  [ih,iff,ip,is].forEach(i=>i.addEventListener('input',draw));draw()};
FIG['pool']=root=>{const svg=initSvg(svgOf(root),600,210);const M=[[3,2,0,0],[0,7,1,3],[5,2,3,0],[0,9,2,3]];const cols=['#dae3f3','#e2f0d9','#fbe5d6','#fff2cc'];
  [['Max pooling (2×2, stride 2)',(a)=>Math.max(...a),0],['Average pooling (2×2, stride 2)',(a)=>a.reduce((x,y)=>x+y,0)/a.length,300]].forEach(([lab,fn,x0])=>{T(svg,x0+140,18,lab,'lab');
    grid(svg,x0+10,34,M,38,(i,j)=>cols[(i<2?0:2)+(j<2?0:1)],(i,j,v)=>String(v));const out=[[0,0],[0,0]];for(let a=0;a<2;a++)for(let b=0;b<2;b++)out[a][b]=fn([M[2*a][2*b],M[2*a][2*b+1],M[2*a+1][2*b],M[2*a+1][2*b+1]]);
    arrowPx(svg,x0+168,110,x0+196,110,'ln thin sk','fk');grid(svg,x0+200,72,out,38,(i,j)=>cols[i*2+j],(i,j,v)=>f1(v))});T(svg,300,205,'A summarized, down-sampled version of the features: 4× fewer numbers, no parameters.','','middle')};
function cube(svg,x,y,w,h,d,fill,lab,sub){const dx=d*0.6,dy=-d*0.4;E('polygon',{points:[[x,y],[x+dx,y+dy],[x+w+dx,y+dy],[x+w,y]].map(p=>p.join(',')).join(' '),fill:fill,stroke:'#404040','fill-opacity':0.7},svg);
  E('polygon',{points:[[x+w,y],[x+w+dx,y+dy],[x+w+dx,y+h+dy],[x+w,y+h]].map(p=>p.join(',')).join(' '),fill:fill,stroke:'#404040','fill-opacity':0.55},svg);E('rect',{x:x,y:y,width:w,height:h,fill:fill,stroke:'#404040'},svg);if(lab)T(svg,x+w/2,y+h+18,lab,'');if(sub)T(svg,x+w/2,y+h+34,sub,'')}
FIG['cnn-arch']=root=>{const svg=initSvg(svgOf(root),960,270);cube(svg,20,60,90,90,10,'#d9d9d9','input','28×28×1');cube(svg,150,50,80,110,40,'#8ea9db','conv + ReLU','28×28×32');cube(svg,280,70,56,70,40,'#b4c7e7','max pool','14×14×32');
  cube(svg,380,60,50,90,70,'#8ea9db','conv + ReLU','14×14×64');cube(svg,500,80,36,50,70,'#b4c7e7','max pool','7×7×64');
  E('rect',{x:630,y:30,width:24,height:170,fill:'#f4b183',stroke:'#404040'},svg);T(svg,642,222,'flatten','');T(svg,642,238,'3136','');E('rect',{x:700,y:70,width:24,height:90,fill:'#f4b183',stroke:'#404040'},svg);T(svg,712,182,'dense','');T(svg,712,198,'128','');
  E('rect',{x:770,y:100,width:24,height:36,fill:'#ffc000',stroke:'#404040'},svg);T(svg,782,158,'softmax','');T(svg,782,174,'10','');
  E('line',{x1:20,x2:590,y1:252,y2:252,class:'ln thin sb'},svg);T(svg,305,268,'FEATURE LEARNING','lab');E('line',{x1:620,x2:810,y1:252,y2:252,class:'ln thin so'},svg);T(svg,715,268,'CLASSIFICATION','lab')};
FIG['resblock']=root=>{const svg=initSvg(svgOf(root),420,300);const box=(y,t)=>{E('rect',{x:120,y:y,width:150,height:36,rx:4,fill:'#fff',stroke:'#404040'},svg);T(svg,195,y+23,t,'lab')};
  T(svg,195,20,'x','lab big');arrowPx(svg,195,28,195,58,'ln thin sk','fk');box(60,'weight layer');arrowPx(svg,195,96,195,126,'ln thin sk','fk');T(svg,212,116,'ReLU','','start');box(128,'weight layer');arrowPx(svg,195,164,195,202,'ln thin sk','fk');
  E('circle',{cx:195,cy:216,r:14,fill:'#fff',stroke:'#404040'},svg);T(svg,195,222,'+','lab big');arrowPx(svg,195,230,195,272,'ln thin sk','fk');T(svg,212,262,'ReLU','','start');
  E('path',{d:'M195,40 C360,40 360,216 213,216',fill:'none',stroke:'#c00000','stroke-width':2.5},svg);T(svg,350,130,'identity x','lab','start');T(svg,100,120,'F(x)','lab','end');T(svg,195,294,'output: F(x) + x','lab')};
FIG['transfer']=root=>{const svg=initSvg(svgOf(root),900,320);
  [['Small dataset','freeze all layers, train only a new head',5],['Medium dataset','freeze most layers, fine-tune the last ones',3],['Large dataset','fine-tune everything, starting from pre-trained weights',0]].forEach(([lab,sub,frozen],k)=>{const x=40+k*295;T(svg,x+105,20,lab,'lab big');
    for(let l=0;l<6;l++){const fz=l<frozen;E('rect',{x:x+30,y:250-l*34,width:150,height:28,rx:4,fill:fz?'#d9d9d9':'#8ea9db',stroke:'#404040'},svg);T(svg,x+105,269-l*34,fz?'pre-trained (frozen)':'pre-trained, trained',fz?'':'').style.fill=fz?'#404040':'#fff'}
    E('rect',{x:x+30,y:46,width:150,height:28,rx:4,fill:'#ed7d31',stroke:'#404040'},svg);T(svg,x+105,65,'new classifier head','').style.fill='#fff';T(svg,x+105,308,sub,'','middle')})};
FIG['augment']=root=>{const svg=initSvg(svgOf(root),900,190);const shape=(g)=>{E('rect',{x:-40,y:-10,width:80,height:50,fill:'#ed7d31'},g);E('polygon',{points:'-50,-10 0,-50 50,-10',fill:'#c00000'},g);E('rect',{x:-10,y:12,width:20,height:28,fill:'#595959'},g);E('rect',{x:18,y:0,width:14,height:14,fill:'#dae3f3'},g);E('circle',{cx:44,cy:-44,r:10,fill:'#ffc000'},g)};
  [['original',''],['flip','scale(-1,1)'],['rotation','rotate(15)'],['random crop','scale(1.5) translate(-12,6)'],['colour shift','',{f:'hue-rotate(120deg)'}],['noise',''],['cut-out','']].forEach(([lab,tr,o],k)=>{const cx=65+k*128;
    const cp='cpa'+k;const d=E('defs',{},svg);const c=E('clipPath',{id:cp},d);E('rect',{x:cx-58,y:22,width:116,height:120},c);const bg=E('rect',{x:cx-58,y:22,width:116,height:120,fill:'#e2f0d9',stroke:'#bfbfbf'},svg);
    const outer=E('g',{'clip-path':'url(#'+cp+')'},svg);const g=E('g',{transform:'translate('+cx+',95) '+tr},outer);if(o&&o.f)g.setAttribute('style','filter:'+o.f);shape(g);
    if(lab==='noise'){const r=rng(3);for(let i=0;i<120;i++)E('rect',{x:cx-58+116*r(),y:22+120*r(),width:3,height:3,fill:r()<0.5?'#fff':'#000','fill-opacity':0.6},outer)}
    if(lab==='cut-out')E('rect',{x:cx-10,y:70,width:44,height:44,fill:'#000'},outer);T(svg,cx,166,lab,'lab')});T(svg,450,186,'Each epoch, the model sees a slightly different version of every image, and the label stays the same.','','middle')};
FIG['transpose']=root=>{const svg=initSvg(svgOf(root),600,230);grid(svg,30,70,[[1,2],[3,4]],40,()=>'#dae3f3',(i,j,v)=>String(v));T(svg,70,58,'input 2×2','lab');arrowPx(svg,125,110,200,110,'ln sk','fk');T(svg,162,95,'stride 2','');
  const O=[[1,1,2,2],[1,1,2,2],[3,3,4,4],[3,3,4,4]];grid(svg,215,30,O,40,(i,j)=>['#dae3f3','#bdd7ee','#9dc3e6','#8ea9db'][O[i][j]-1],(i,j,v)=>'');T(svg,295,210,'output 4×4','lab');
  T(svg,480,90,'Each input value','','middle');T(svg,480,110,'"paints" a kernel-sized','','middle');T(svg,480,130,'patch of the output.','','middle');T(svg,480,160,'The kernel is learned.','lab','middle')};
FIG['unet']=root=>{const svg=initSvg(svgOf(root),560,300);const bar=(x,y,h,c)=>E('rect',{x:x,y:y,width:16,height:h,fill:c,stroke:'#404040'},svg);
  const L=[[40,30,200],[110,90,120],[180,140,60],[250,175,26]];L.forEach(([x,y,h],i)=>{bar(x,y,h,'#4472c4');bar(x+18,y,h,'#4472c4');if(i<3)arrowPx(svg,x+26,y+h+8,L[i+1][0]+10,L[i+1][1]-4,'ln thin sr','fr')});
  const R=[[320,140,60],[390,90,120],[460,30,200]];R.forEach(([x,y,h],i)=>{bar(x,y,h,'#8ea9db');bar(x+18,y,h,'#4472c4')});arrowPx(svg,286,178,316,200,'ln thin so','fo');arrowPx(svg,356,140,388,210,'ln thin so','fo');arrowPx(svg,426,90,458,230,'ln thin so','fo');
  [[0,2],[1,1],[2,0]].forEach(([a,b])=>arrowPx(svg,L[a][0]+36,L[a][1]+12,R[b][0]-4,R[b][1]+12,'ln thin sm dash','fm'));bar(500,30,200,'#70ad47');
  T(svg,120,270,'encoder: conv + max-pool (down)','','middle');T(svg,430,270,'decoder: transposed conv (up)','','middle');T(svg,280,295,'dashed: skip connections copy fine detail across','','middle');T(svg,508,22,'mask','','middle')};
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
})();
