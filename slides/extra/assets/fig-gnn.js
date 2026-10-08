/* Figures for extra/01_gnn.html (graph neural networks). Uses ../assets/figures.js (MLFIG), ../neural_networks/assets/nn-core.js (MLNN)
   and gnn-data.js (GNNDATA: the karate club, precomputed in Python). The toy graph A–E is the one of the notebook. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,q,setV,svgOf}=lib;const {heat,TT,box,stepper,segs}=window.MLNN;
const KD=window.GNNDATA;

/* ---------- the toy graph: a triangle A, B, C with a tail C–D–E ---------- */
const NM=['A','B','C','D','E'],COL=['#4472c4','#c00000','#7030a0','#bf9000','#548235'],SOFT=['#dae3f3','#f8d3d3','#e6d9f0','#fff0c2','#dcebd2'];
const TE=[[0,1],[0,2],[1,2],[2,3],[3,4]],TX=[[1,0],[0,1],[1,1],[2,0],[0,2]];
const TP=[[0,0],[0,1],[0.9,0.5],[1.95,0.75],[2.9,0.35]];
const tpos=(x0,y0,sx,sy)=>TP.map(p=>[x0+p[0]*sx,y0+p[1]*sy]);
const adj=(n,ed)=>{const A=[...Array(n)].map(()=>new Array(n).fill(0));ed.forEach(([u,v])=>{A[u][v]=1;A[v][u]=1});return A};
const mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)));
const TA=adj(5,TE),TAt=TA.map((r,i)=>r.map((v,j)=>v+(i===j?1:0))),Tdt=TAt.map(r=>r.reduce((s,v)=>s+v,0));
const TAmean=TAt.map((r,i)=>r.map(v=>v/Tdt[i])),TAhat=TAt.map((r,i)=>r.map((v,j)=>v/Math.sqrt(Tdt[i]*Tdt[j])));
const TW=[[1,-1],[0.5,1]];
/* number formats: minus sign, integers without decimals */
const nf=(v,d)=>{d=d===undefined?2:d;if(Math.abs(v)<0.5*Math.pow(10,-d))v=0;return v.toFixed(d).replace('-','−')};
const nt=(v,d)=>Math.abs(v-Math.round(v))<1e-9?String(Math.round(v)).replace('-','−'):nf(v,d);
const vec=(r,d)=>'('+r.map(v=>nt(v,d)).join(', ')+')';
const ln=(svg,a,b,c,w,dash)=>E('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:c||'#9aa5b8','stroke-width':w||1.6,'stroke-dasharray':dash||''},svg);
const dot=(svg,x,y,r,fill,stroke,sw)=>E('circle',{cx:x,cy:y,r:r,fill:fill,stroke:stroke||'#fff','stroke-width':sw===undefined?1.5:sw},svg);
/* a graph: edges first, then nodes. o.edge(u,v,k) -> {c,w,dash}; o.node(i) -> {fill,r,ring,label,tcol,stroke} */
function graph(svg,P,ed,o){o=o||{};const R=o.r||16;
  ed.forEach(([u,v],k)=>{const s=(o.edge&&o.edge(u,v,k))||{};ln(svg,P[u],P[v],s.c||'#9aa5b8',s.w||1.6,s.dash)});
  P.forEach((p,i)=>{const s=(o.node&&o.node(i))||{};const r=s.r||R;if(s.ring)dot(svg,p[0],p[1],r+5,'none',s.ring,s.ringW||3);
    if(s.square)E('rect',{x:p[0]-r,y:p[1]-r,width:2*r,height:2*r,fill:s.fill||COL[0],stroke:s.stroke||'#fff','stroke-width':s.sw||1.5},svg);else dot(svg,p[0],p[1],r,s.fill||COL[0],s.stroke,s.sw);
    if(s.label!==undefined&&s.label!==''){const t=T(svg,p[0],p[1]+5,s.label,s.cls||'lab');t.style.fill=s.tcol||'#fff'}})}
const toyNode=i=>({fill:COL[i],label:NM[i]});
/* arrow between two node centres, shortened by the radii */
function arr(svg,a,b,ra,rb,cls,fcls){const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);arrowPx(svg,a[0]+dx*ra/L,a[1]+dy*ra/L,b[0]-dx*rb/L,b[1]-dy*rb/L,cls||'ln thin sk',fcls||'fk')}
/* a labelled matrix. M rows; x0,y0 top-left; cs cell size (or [w,h]); o.rows / o.cols labels, o.hiRow, o.fill(i,j,v), o.txt(i,j,v) */
function mat(svg,x0,y0,M,cs,o){o=o||{};const cw=Array.isArray(cs)?cs[0]:cs,ch=Array.isArray(cs)?cs[1]:cs;
  if(o.hiRow!==undefined&&o.hiRow!==null)E('rect',{x:x0-3,y:y0+o.hiRow*ch-2,width:M[0].length*cw+6,height:ch+4,fill:'#fff2cc',stroke:'#ffc000','stroke-width':2},svg);
  M.forEach((row,i)=>row.forEach((v,j)=>{E('rect',{x:x0+j*cw,y:y0+i*ch,width:cw,height:ch,fill:o.fill?o.fill(i,j,v):'#fff',stroke:'#7f7f7f','stroke-width':0.8},svg);
    const t=o.txt?o.txt(i,j,v):nt(v);if(t!==null&&t!==''){const tt=T(svg,x0+j*cw+cw/2,y0+i*ch+ch/2+5,t,o.cls||'');tt.style.fill=o.tcol?o.tcol(i,j,v):'#1f1f1f'}}));
  if(o.rows)o.rows.forEach((r,i)=>{const t=T(svg,x0-7,y0+i*ch+ch/2+5,r,'lab','end');if(o.rowCol)t.style.fill=o.rowCol(i)});
  if(o.cols)o.cols.forEach((c,j)=>{const t=TT(svg,x0+j*cw+cw/2,y0-7,c,'lab');if(o.colCol)t.style.fill=o.colCol(j)});
  if(o.title)TT(svg,x0+M[0].length*cw/2,y0+M.length*ch+20,o.title,o.tcls||'lab')}
const halo=t=>{t.setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:6px;stroke-linejoin:round');return t};
function onInput(root,k,draw){const inp=q(root,k);inp.addEventListener('input',draw);draw();return inp}

/* ---------- where we are: five data shapes ---------- */
FIG['gnn-shapes']=root=>{const svg=initSvg(svgOf(root),1160,215);const W=232;
  const panel=(k,title,sub,hi)=>{const x0=k*W;E('rect',{x:x0+6,y:4,width:W-12,height:205,rx:8,fill:hi?'#f5f8fd':'#fafafa',stroke:hi?'#4472c4':'#d0d0d0','stroke-width':hi?2:1},svg);T(svg,x0+W/2,28,title,'lab');T(svg,x0+W/2,198,sub,'');return x0};
  let x0=panel(0,'MLP · a vector','no notion of neighbour');[0.2,0.7,0.4,0.9,0.1,0.55,0.3].forEach((v,i)=>E('rect',{x:x0+W/2-14,y:44+i*19,width:28,height:19,fill:heat(v,true),stroke:'#595959'},svg));
  x0=panel(1,'CNN · a grid','4 neighbours, always');const g=[];for(let i=0;i<5;i++)for(let j=0;j<5;j++)g.push([x0+W/2-60+j*30,50+i*30]);
  for(let i=0;i<5;i++)for(let j=0;j<5;j++){if(j<4)ln(svg,g[i*5+j],g[i*5+j+1],'#c9d1de',1.3);if(i<4)ln(svg,g[i*5+j],g[(i+1)*5+j],'#c9d1de',1.3)}
  [11,13,7,17].forEach(k=>ln(svg,g[12],g[k],'#ed7d31',2.5));g.forEach((p,k)=>dot(svg,p[0],p[1],6,k===12?'#ed7d31':[7,11,13,17].includes(k)?'#4472c4':'#bfc8d9'));
  x0=panel(2,'RNN · a chain','previous and next');const ch=[0,1,2,3,4].map(i=>[x0+30+i*43,105]);
  ch.slice(0,-1).forEach((p,i)=>arrowPx(svg,p[0]+9,p[1],ch[i+1][0]-10,p[1],'ln thin sm','fm'));ch.forEach((p,i)=>dot(svg,p[0],p[1],8,i===2?'#ed7d31':(i===1||i===3)?'#4472c4':'#bfc8d9'));
  ['the','cat','sat','on','it'].forEach((w,i)=>T(svg,ch[i][0],ch[i][1]+32,w,''));
  x0=panel(3,'transformer · everyone','every token is a neighbour');const cc=[...Array(6)].map((_,i)=>[x0+W/2+56*Math.cos(2*Math.PI*i/6-Math.PI/2),108+56*Math.sin(2*Math.PI*i/6-Math.PI/2)]);
  for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)ln(svg,cc[i],cc[j],i===0?'#ed7d31':'#c9d1de',i===0?2.2:1.2);cc.forEach((p,i)=>dot(svg,p[0],p[1],8,i===0?'#ed7d31':'#4472c4'));
  x0=panel(4,'GNN · any graph','neighbours given by the data',true);const gp=[[38,72],[92,50],[70,122],[128,104],[178,60],[188,140],[122,162],[42,160]].map(p=>[x0+p[0]+2,p[1]]);
  const ge=[[0,1],[0,2],[1,2],[1,3],[2,3],[3,4],[3,5],[4,5],[3,6],[2,7],[6,7]];const nb3=new Set([1,2,4,5,6]);
  ge.forEach(([u,v])=>ln(svg,gp[u],gp[v],(u===3||v===3)?'#ed7d31':'#c9d1de',(u===3||v===3)?2.5:1.4));gp.forEach((p,i)=>dot(svg,p[0],p[1],8,i===3?'#ed7d31':nb3.has(i)?'#4472c4':'#bfc8d9'))};

/* ---------- application cards ---------- */
FIG['gnn-app']=root=>{const svg=initSvg(svgOf(root),350,110);const k=root.dataset.app;
  const lab=(x,y,t,c,cls)=>{const tt=T(svg,x,y,t,cls||'');if(c)tt.style.fill=c;return tt};
  const outBox=(t,c)=>{box(svg,248,36,96,38,t,c||'#fff2cc',{cls:'',rx:6});};
  if(k==='mol'){const cx=110,cy=58,R=32;const P=[...Array(6)].map((_,i)=>[cx+R*Math.cos(Math.PI/3*i-Math.PI/2),cy+R*Math.sin(Math.PI/3*i-Math.PI/2)]);
    P.forEach((p,i)=>{const b=P[(i+1)%6];ln(svg,p,b,'#595959',2);if(i%2===0){const s=0.72;ln(svg,[cx+(p[0]-cx)*s,cy+(p[1]-cy)*s],[cx+(b[0]-cx)*s,cy+(b[1]-cy)*s],'#595959',1.5)}});
    const O=[cx-R*0.87-24,cy-R*0.5-12],N=[cx+R*0.87+24,cy+R*0.5+4],O2=[N[0]+24,N[1]-18],O3=[N[0]+22,N[1]+18];ln(svg,P[5],O,'#595959',2);ln(svg,P[2],N,'#595959',2);ln(svg,N,O2,'#595959',2);ln(svg,N,O3,'#595959',2);
    P.forEach(p=>{dot(svg,p[0],p[1],9,'#595959');lab(p[0],p[1]+4,'C','#fff')});[[O,'O','#c00000'],[N,'N','#4472c4'],[O2,'O','#c00000'],[O3,'O','#c00000']].forEach(([p,t,c])=>{dot(svg,p[0],p[1],9,c);lab(p[0],p[1]+4,t,'#fff')});
    arrowPx(svg,206,56,242,56,'ln thin sm','fm');outBox('toxic? 0.93')}
  else if(k==='social'){const P=[[40,30],[30,85],[95,55],[150,25],[160,90],[215,55],[100,100]];const ed=[[0,1],[0,2],[1,2],[2,3],[2,4],[3,4],[4,5],[1,6],[2,6],[4,6]];
    ed.forEach(([u,v])=>ln(svg,P[u],P[v],'#9aa5b8',1.6));ln(svg,P[3],P[5],'#ed7d31',2.5,'6 4');lab(205,28,'friends?','#c55a11');
    P.forEach((p,i)=>{dot(svg,p[0],p[1],10,i===6?'#c00000':'#4472c4');E('circle',{cx:p[0],cy:p[1]-3,r:3.5,fill:'#fff'},svg);E('path',{d:'M'+(p[0]-6)+','+(p[1]+7)+' q6,-9 12,0',fill:'#fff'},svg)});lab(122,108,'bot?','#c00000');
    outBox('suggest: 0.81')}
  else if(k==='cite'){const P=[[30,25],[30,80],[95,52],[160,20],[160,85],[225,52]];const cl=['#dae3f3','#dae3f3','#e2f0d9','#e2f0d9','#fbe5d6','#e7e6e6'];
    [[1,0],[2,0],[2,1],[3,2],[4,2],[4,3],[5,3],[5,4]].forEach(([u,v])=>arr(svg,P[u],P[v],16,16,'ln thin sm','fm'));
    P.forEach((p,i)=>{E('rect',{x:p[0]-16,y:p[1]-12,width:32,height:24,fill:cl[i],stroke:'#7f7f7f'},svg);[0,1,2].forEach(r=>ln(svg,[p[0]-11,p[1]-6+r*6],[p[0]+(r===2?3:11),p[1]-6+r*6],'#8c8c8c',1.2))});lab(225,84,'topic?','#595959');
    E('rect',{x:252,y:30,width:92,height:50,fill:'#fff',stroke:'#d0d0d0'},svg);[['#dae3f3','ML'],['#e2f0d9','theory'],['#fbe5d6','vision']].forEach(([c,t],i)=>{E('rect',{x:258,y:36+i*14,width:10,height:10,fill:c,stroke:'#7f7f7f'},svg);T(svg,274,45+i*14,t,'','start').style.fontSize='12px'})}
  else if(k==='road'){const P=[];for(let i=0;i<3;i++)for(let j=0;j<4;j++)P.push([30+j*62,20+i*36]);const tr=['#70ad47','#ffc000','#c00000'];const r=rng(4);
    for(let i=0;i<3;i++)for(let j=0;j<4;j++){if(j<3)ln(svg,P[i*4+j],P[i*4+j+1],tr[Math.floor(r()*3)],5);if(i<2)ln(svg,P[i*4+j],P[(i+1)*4+j],tr[Math.floor(r()*3)],5)}
    P.forEach(p=>dot(svg,p[0],p[1],5,'#404040'));outBox('ETA: 12 min')}
  else if(k==='fraud'){const P={c1:[40,30],c2:[40,88],p1:[110,20],p2:[110,98],car:[170,59],tel:[110,59],gar:[225,59]};
    const ed=[['c1','p1'],['c2','p2'],['c1','tel'],['c2','tel'],['p1','car'],['p2','car'],['car','gar'],['c1','gar'],['c2','gar']];
    ed.forEach(([u,v])=>ln(svg,P[u],P[v],(u==='c1'||u==='c2'||v==='gar')?'#c00000':'#9aa5b8',(u==='c1'||u==='c2'||v==='gar')?2:1.4));
    const sq=(p,t,c)=>{E('rect',{x:p[0]-20,y:p[1]-11,width:40,height:22,rx:3,fill:c,stroke:'#fff'},svg);lab(p[0],p[1]+4,t,'#fff').style.fontSize='12px'};
    sq(P.c1,'claim','#c00000');sq(P.c2,'claim','#c00000');sq(P.car,'car','#7f7f7f');sq(P.gar,'garage','#bf9000');sq(P.tel,'phone','#7030a0');
    [P.p1,P.p2].forEach(p=>{dot(svg,p[0],p[1],10,'#4472c4');E('circle',{cx:p[0],cy:p[1]-3,r:3.5,fill:'#fff'},svg);E('path',{d:'M'+(p[0]-6)+','+(p[1]+7)+' q6,-9 12,0',fill:'#fff'},svg)});
    outBox('ring? 0.88','#fbe5d6')}
  else if(k==='rec'){const U=[0,1,2,3].map(i=>[50,13+i*25]),I=[0,1,2,3].map(i=>[190,13+i*25]);[[0,0],[0,1],[1,1],[1,2],[2,0],[2,3],[3,2],[3,3]].forEach(([u,i])=>ln(svg,U[u],I[i],'#9aa5b8',1.5));
    ln(svg,U[0],I[2],'#ed7d31',2.5,'6 4');U.forEach(p=>dot(svg,p[0],p[1],9,'#4472c4'));I.forEach(p=>E('rect',{x:p[0]-9,y:p[1]-9,width:18,height:18,fill:'#70ad47',stroke:'#fff'},svg));
    lab(50,106,'users','#595959');lab(190,106,'items','#595959');outBox('click? 0.74')}};

/* ---------- anatomy of the toy graph ---------- */
FIG['gnn-anatomy']=root=>{const svg=svgOf(root);const P=tpos(42,62,82,150);const fl=[[-4,-26],[-4,38],[0,-28],[0,38],[0,-26]];
  stepper(root,s=>{initSvg(svg,620,370);setV(root,'s',s+' / 4');
    graph(svg,P,TE,{r:17,edge:(u,v)=>s>=1&&(u===2||v===2)&&u!==4&&v!==4?{c:'#ffc000',w:4}:{},node:i=>({fill:COL[i],label:NM[i],ring:s>=1&&i===2?'#ffc000':null})});
    if(s>=3)P.forEach((p,i)=>{const t=T(svg,p[0]+fl[i][0],p[1]+fl[i][1],vec(TX[i]),'lab');t.style.fill=COL[i]});
    if(s>=1){TT(svg,150,262,'N(C) = {A, B, D},   d_C = 3','lab')}
    if(s>=2){mat(svg,330,50,TA,30,{rows:NM,cols:NM,rowCol:i=>COL[i],colCol:j=>COL[j],hiRow:2,fill:(i,j,v)=>v?'#dae3f3':'#fff',txt:(i,j,v)=>String(v),tcol:(i,j,v)=>v?'#1f3864':'#bfbfbf',title:'A'});
      T(svg,500,43,'d','lab');TA.forEach((r,i)=>T(svg,500,50+i*30+20,String(r.reduce((a,b)=>a+b,0)),'lab'))}
    if(s>=3)mat(svg,535,50,TX,30,{cols:['x_1','x_2'],hiRow:null,fill:(i)=>SOFT[i],title:'X'});
    if(s>=4){T(svg,30,300,'edge_index','lab','start');const src=[0,0,1,1,2,2,2,3,3,4],dst=[1,2,0,2,0,1,3,2,4,3];
      [src,dst].forEach((row,r)=>{T(svg,150,323+r*30,r?'dst':'src','','end');row.forEach((v,j)=>{E('rect',{x:158+j*42,y:305+r*30,width:42,height:28,fill:SOFT[v],stroke:'#7f7f7f','stroke-width':0.8},svg);const t=T(svg,179+j*42,324+r*30,NM[v],'lab');t.style.fill=COL[v]})})}})};

/* ---------- three kinds of task ---------- */
FIG['gnn-tasks']=root=>{const svg=initSvg(svgOf(root),1160,210);const base=[[40,60],[110,38],[78,128],[160,100],[226,52],[236,152],[150,178]];const ed=[[0,1],[0,2],[1,2],[1,3],[2,3],[3,4],[3,5],[4,5],[3,6],[2,6]];
  const at=(x0,y0)=>base.map(p=>[x0+p[0],y0+p[1]]);const cls=['#4472c4','#4472c4','#4472c4','#ed7d31','#70ad47','#70ad47','#ed7d31'];
  let P=at(40,0);graph(svg,P,ed,{r:13,node:i=>i===3?{fill:'#d9d9d9',label:'?',tcol:'#404040',ring:'#ffc000'}:{fill:cls[i]}});T(svg,P[3][0]+60,P[3][1]+4,'class?','lab','start');
  P=at(430,0);graph(svg,P,ed,{r:13,node:i=>({fill:(i===0||i===4)?'#ed7d31':'#4472c4'})});ln(svg,P[0],P[4],'#ed7d31',2.5,'6 5');T(svg,(P[0][0]+P[4][0])/2,P[1][1]-14,'p = 0.87','lab');
  P=at(770,0);E('rect',{x:792,y:16,width:262,height:182,rx:14,fill:'#f5f8fd',stroke:'#4472c4','stroke-width':1.5},svg);graph(svg,P,ed,{r:13,node:()=>({fill:'#4472c4'})});
  arrowPx(svg,1058,107,1076,107,'ln thin sk','fk');box(svg,1078,89,80,36,'toxic: 0.93','#fff2cc',{cls:''})};

/* ---------- the node order is arbitrary ---------- */
FIG['gnn-perm']=root=>{const svg=svgOf(root);const P=tpos(50,80,78,150);const num={1:[1,2,3,4,5],2:[3,5,1,4,2]};
  const draw=p=>{initSvg(svg,620,340);const lab=num[p];const order=[0,1,2,3,4].sort((a,b)=>lab[a]-lab[b]);
    T(svg,160,30,'numbering '+p,'lab big');graph(svg,P,TE,{r:18,node:i=>({fill:COL[i],label:String(lab[i])})});T(svg,160,300,'the same graph','');
    const M=order.map(a=>order.map(b=>TA[a][b]));
    mat(svg,370,60,M,40,{rows:order.map(a=>String(lab[a])),cols:order.map(a=>String(lab[a])),rowCol:i=>COL[order[i]],colCol:j=>COL[order[j]],fill:(i,j,v)=>v?'#dae3f3':'#fff',txt:(i,j,v)=>String(v),tcol:(i,j,v)=>v?'#1f3864':'#bfbfbf'});
    TT(svg,470,290,p===1?'A':'P A P^⊤','lab big');T(svg,470,315,p===1?'adjacency, numbering 1':'adjacency, numbering 2: different matrix','')};
  const cur=segs(root,'p',v=>draw(+v));draw(+(cur()||1))};

/* ---------- equivariance: the commuting square ---------- */
FIG['gnn-commute']=root=>{const svg=initSvg(svgOf(root),480,445);const perm=[3,5,1,4,2];
  const panel=(x,y,cap)=>{E('rect',{x:x,y:y,width:200,height:150,rx:10,fill:'#fafafa',stroke:'#bfbfbf'},svg);TT(svg,x+100,y-10,cap,'lab')};
  const g=(x,y,lab)=>{const P=TP.map(p=>[x+28+p[0]*50,y+38+p[1]*76]);graph(svg,P,TE,{r:12,node:i=>({fill:COL[i],label:String(lab[i])})})};
  const col=(x,y,lab)=>{const order=[0,1,2,3,4].sort((a,b)=>lab[a]-lab[b]);order.forEach((a,r)=>{E('rect',{x:x+80,y:y+12+r*25,width:70,height:25,fill:COL[a],stroke:'#fff'},svg);T(svg,x+70,y+30+r*25,String(r+1),'','end');TT(svg,x+115,y+30+r*25,'h_'+NM[a],'w lab')})};
  panel(10,30,'(X, A)');g(10,30,[1,2,3,4,5]);panel(270,30,'H = f(X, A)');col(270,30,[1,2,3,4,5]);
  panel(10,264,'(PX, PAP^⊤)');g(10,264,perm);panel(270,264,'f(PX, PAP^⊤)');col(270,264,perm);
  arrowPx(svg,214,105,266,105,'ln sb','fb');T(svg,240,96,'f','lab big');arrowPx(svg,214,339,266,339,'ln sb','fb');T(svg,240,330,'f','lab big');
  arrowPx(svg,110,186,110,236,'ln thin so','fo');T(svg,122,216,'renumber','','start');arrowPx(svg,370,186,370,236,'ln thin so','fo');T(svg,382,216,'renumber','','start');
  const t=TT(svg,370,438,'= P H: the same rows, renumbered','lab');t.style.fill='#4472c4'};

/* ---------- message passing, step by step ---------- */
FIG['gnn-mp']=root=>{const svg=svgOf(root);const P=tpos(70,52,150,196);const R=22;
  stepper(root,s=>{initSvg(svg,620,360);setV(root,'s',s+' / 5');const nbC=[0,1,3];
    graph(svg,P,TE,{r:R,edge:(u,v)=>(s>=2&&s<5&&v===2&&nbC.includes(u))||(s>=2&&s<5&&u===2&&nbC.includes(v))?{c:'#ffc000',w:3}:{},node:i=>({fill:COL[i],label:NM[i],ring:(s>=1&&i===2)||s===5?'#ffc000':null})});
    const hl=[[-2,-32],[-2,46],[0,-36],[0,48],[0,-34]];if(s<4||s===5)P.forEach((p,i)=>TT(svg,p[0]+hl[i][0],p[1]+hl[i][1],s===5?'h′_'+NM[i]:'h_'+NM[i],'lab'));
    if(s>=2&&s<5)nbC.forEach(u=>{const a=P[u],b=P[2];arr(svg,a,b,R+2,R+8,'ln so','fo');const m=[a[0]+(b[0]-a[0])*0.5,a[1]+(b[1]-a[1])*0.5];
      E('rect',{x:m[0]-30,y:m[1]-13,width:60,height:24,rx:5,fill:SOFT[u],stroke:COL[u]},svg);TT(svg,m[0],m[1]+5,'h_'+NM[u]+'W','')});
    if(s>=3&&s<5){box(svg,P[2][0]-72,P[2][1]-96,144,34,'Σ of 3 messages','#fff2cc',{cls:'lab'});ln(svg,[P[2][0],P[2][1]-62],[P[2][0],P[2][1]-R-6],'#bf9000',2)}
    if(s===4){box(svg,P[2][0]-92,P[2][1]+34,184,34,'','#e2f0d9',{});TT(svg,P[2][0],P[2][1]+56,'h′_C = UPD(h_C, Σ)','lab')}
    if(s===5)TE.forEach(([u,v])=>{arr(svg,P[u],P[v],R+3,R+6,'ln thin sm','fm');arr(svg,P[v],P[u],R+3,R+6,'ln thin sm','fm')});
    const on=[[],[],[0],[1],[2],[0,1,2]][s];['MSG','AGG','UPD'].forEach((t,k)=>{box(svg,150+k*120,318,96,32,t,on.includes(k)?'#ffc000':'#f2f2f2',{cls:'lab',stroke:on.includes(k)?'#bf9000':'#bfbfbf'});if(k<2)arrowPx(svg,248+k*120,334,268+k*120,334,'ln thin sm','fm')})})};

/* ---------- neighbour sum = A X ---------- */
FIG['gnn-ax']=root=>{const svg=svgOf(root);const P=tpos(34,72,72,150);const AX=mm(TA,TX);const fl=[[-2,-24],[-2,36],[0,-26],[0,36],[0,-24]];
  stepper(root,s=>{initSvg(svg,620,330);setV(root,'s',s+' / 3');
    graph(svg,P,TE,{r:15,edge:(u,v)=>s>=1&&(u===2||v===2)&&u!==4&&v!==4?{c:'#ffc000',w:4}:{},node:i=>({fill:COL[i],label:NM[i],ring:s>=1&&i===2?'#ffc000':null})});
    P.forEach((p,i)=>{const t=T(svg,p[0]+fl[i][0],p[1]+fl[i][1],vec(TX[i]),'');t.style.fill=COL[i]});
    if(s>=1)TT(svg,140,290,'x_A + x_B + x_D = (3, 1)','lab');
    const hiX=s>=2?new Set([0,1,3]):new Set();
    mat(svg,300,60,TA,26,{rows:NM,cols:NM,rowCol:i=>COL[i],colCol:j=>COL[j],hiRow:s>=2?2:null,fill:(i,j,v)=>v?'#dae3f3':'#fff',txt:(i,j,v)=>String(v),tcol:(i,j,v)=>v?'#1f3864':'#bfbfbf',title:'A'});
    T(svg,447,130,'×','lab big');
    mat(svg,462,60,TX,26,{cols:['x_1','x_2'],fill:i=>hiX.has(i)?'#fff2cc':SOFT[i],title:'X'});T(svg,530,130,'=','lab big');
    mat(svg,546,60,AX,26,{cols:['',''],hiRow:s>=2?2:null,fill:()=>'#fff',txt:(i,j,v)=>(s>=3||(s===2&&i===2))?String(v):'',title:'A X'})})};

/* ---------- self-loops and normalisation ---------- */
FIG['gnn-norm']=root=>{const svg=svgOf(root);const P=tpos(70,78,72,166);
  const MODES={sum:{M:TA,f:'A X'},self:{M:TAt,f:'(A + I) X'},mean:{M:TAmean,f:'D̃^{−1}(A + I) X'},sym:{M:TAhat,f:'D̃^{−1/2}(A + I) D̃^{−1/2} X'}};
  const lp=[[0,-27],[0,38],[42,-24],[0,38],[0,-26]];
  const draw=m=>{initSvg(svg,626,350);const {M,f}=MODES[m];const R=mm(M,TX);TT(svg,310,26,f,'lab big');
    graph(svg,P,TE,{r:15,node:i=>({fill:COL[i],label:NM[i],ring:i===2?'#ffc000':null})});
    P.forEach((p,i)=>{const t=T(svg,p[0]+lp[i][0],p[1]+lp[i][1],vec(R[i],2),'lab');t.style.fill=COL[i]});
    mat(svg,345,64,M,34,{rows:NM,cols:NM,rowCol:i=>COL[i],colCol:j=>COL[j],hiRow:2,fill:(i,j,v)=>v?heat(Math.min(1,v),true):'#fff',txt:(i,j,v)=>v?nt(v,2):'0',tcol:(i,j,v)=>v>0.6?'#fff':v?'#1f1f1f':'#bfbfbf',title:'aggregation matrix'});
    T(svg,536,150,'X =','lab');mat(svg,557,64,R,[32,34],{cols:['',''],hiRow:2,txt:(i,j,v)=>nt(v,2),title:'result'})};
  const cur=segs(root,'m',draw);draw(cur()||'sum')};

/* ---------- GCN shapes ---------- */
FIG['gnn-shapes-gcn']=root=>{const svg=initSvg(svgOf(root),1160,190);const y0=12,H=130;const r=rng(7);
  const blk=(x,w,h,fill,lab,sub)=>{E('rect',{x:x,y:y0+(H-h)/2,width:w,height:h,fill:fill,stroke:'#404040','stroke-width':1.2},svg);TT(svg,x+w/2,y0+H+22,lab,'lab');if(sub)T(svg,x+w/2,y0+H+40,sub,'')};
  let x=350;T(svg,x-14,y0+H/2+8,'σ(','lab big','end');blk(x,H,H,'#fff','Â: n × n','sparse, fixed by the graph');
  for(let i=0;i<10;i++)for(let j=0;j<10;j++)if(i===j||(r()<0.18&&Math.abs(i-j)<5))E('rect',{x:x+j*13,y:y0+i*13,width:13,height:13,fill:'#4472c4',opacity:i===j?0.45:0.85},svg);
  x+=H+40;T(svg,x-20,y0+H/2+6,'·','lab big');blk(x,70,H,'#e2f0d9','H^{(k)}: n × d','one row per node');for(let i=1;i<5;i++)ln(svg,[x,y0+i*26],[x+70,y0+i*26],'#8fbf73',1);
  x+=70+60;T(svg,x-30,y0+H/2+6,'·','lab big');blk(x,52,70,'#fff2cc','W^{(k)}: d × d′','learned, shared');
  x+=52+8;T(svg,x,y0+H/2+8,')','lab big','start');x+=30;T(svg,x,y0+H/2+6,'=','lab big','start');x+=32;blk(x,52,H,'#fbe5d6','H^{(k+1)}: n × d′','new vector per node');for(let i=1;i<5;i++)ln(svg,[x,y0+i*26],[x+52,y0+i*26],'#f4b183',1)};

/* ---------- one GCN layer with numbers ---------- */
FIG['gnn-gcn-num']=root=>{const svg=svgOf(root);const AX=mm(TAhat,TX),Z=mm(AX,TW),Hp=Z.map(r=>r.map(v=>Math.max(0,v)));
  stepper(root,s=>{initSvg(svg,630,340);setV(root,'s',s+' / 3');const y=56,c=34;
    mat(svg,26,y,TAhat,c,{rows:NM,cols:NM,rowCol:i=>COL[i],colCol:j=>COL[j],hiRow:2,fill:(i,j,v)=>v?heat(v*1.6,true):'#fff',txt:(i,j,v)=>v?nf(v,2):'0',tcol:(i,j,v)=>v?'#1f1f1f':'#bfbfbf',title:'Â'});
    T(svg,206,y+90,'·','lab big');mat(svg,214,y,TX,[30,c],{cols:['',''],fill:i=>SOFT[i],hiRow:2,title:'X'});
    if(s>=1){T(svg,285,y+90,'=','lab big');mat(svg,294,y,AX,[46,c],{cols:['',''],hiRow:2,txt:(i,j,v)=>nf(v,3),title:'ÂX'})}
    if(s>=2){arrowPx(svg,389,y+85,410,y+85,'ln thin sk','fk');TT(svg,399,y+72,'·W','');mat(svg,414,y,Z,[46,c],{cols:['',''],hiRow:2,txt:(i,j,v)=>nf(v,3),tcol:(i,j,v)=>v<0?'#c00000':'#1f1f1f',title:'ÂXW'})}
    if(s>=3){arrowPx(svg,509,y+85,525,y+85,'ln thin sk','fk');mat(svg,528,y,Hp,[46,c],{cols:['',''],hiRow:2,txt:(i,j,v)=>nt(v,3),fill:()=>'#e2f0d9',title:'H′ = ReLU'})}
    T(svg,330,300,'W =','lab','end');mat(svg,340,272,TW,[40,28],{txt:(i,j,v)=>nt(v,1),fill:()=>'#fff2cc'});T(svg,440,300,'ReLU(z) = max(0, z)','','start')})};

/* ---------- karate club helpers ---------- */
const KN=34;const kadj=(()=>{const L=[...Array(KN)].map(()=>[]);KD.edges.forEach(([u,v])=>{L[u].push(v);L[v].push(u)});return L})();
const kpos=(x0,y0,w,h)=>KD.pos.map(p=>[x0+p[0]*w,y0+p[1]*h]);
const kdt=kadj.map(l=>l.length+1);
const khat=x=>x.map((_,v)=>{let s=x[v]/kdt[v];kadj[v].forEach(u=>{s+=x[u]/Math.sqrt(kdt[u]*kdt[v])});return s});
const FAC=['#4472c4','#ed7d31'];

/* ---------- more layers, more hops ---------- */
FIG['gnn-hops']=root=>{const svg=svgOf(root);const P=kpos(24,18,572,320);const src=16;
  const dist=new Array(KN).fill(99);dist[src]=0;const Q=[src];while(Q.length){const v=Q.shift();kadj[v].forEach(u=>{if(dist[u]>dist[v]+1){dist[u]=dist[v]+1;Q.push(u)}})}
  const shade=['#ffc000','#1f4e9a','#4472c4','#8eaadb','#c9d6ee'];
  onInput(root,'k',()=>{const k=+q(root,'k').value;setV(root,'k',k);initSvg(svg,620,380);
    graph(svg,P,KD.edges,{r:9,edge:(u,v)=>dist[u]<=k&&dist[v]<=k&&k>0?{c:'#4472c4',w:1.8}:{c:'#e3e3e3',w:1},node:i=>({fill:dist[i]<=k?shade[Math.min(dist[i],4)]:'#e9e9e9',stroke:dist[i]<=k?'#fff':'#d0d0d0',ring:i===src?'#bf9000':null,ringW:2.5})});
    const n=dist.filter(d=>d<=k).length;T(svg,310,370,k===0?'node 16 alone: its own features':k+(k===1?' layer':' layers')+': node 16 sees '+n+' of 34 members','lab')})};

/* ---------- the computation tree of node C ---------- */
FIG['gnn-tree']=root=>{const svg=initSvg(svgOf(root),620,400);const cl=v=>[v].concat(TA[v].map((a,u)=>a?u:-1).filter(u=>u>=0));
  const L1=cl(2);const leaves=[];L1.forEach(v=>cl(v).forEach(u=>leaves.push([v,u])));const dx=(590-30)/(leaves.length-1);const lx=leaves.map((_,i)=>30+i*dx);
  const p1=L1.map(v=>{const xs=lx.filter((_,i)=>leaves[i][0]===v);return (xs[0]+xs[xs.length-1])/2});const rx=(p1[0]+p1[p1.length-1])/2;
  T(svg,14,112,'layer 2 · W⁽²⁾','','start');T(svg,14,244,'layer 1 · W⁽¹⁾','','start');
  L1.forEach((v,k)=>ln(svg,[rx,52],[p1[k],168],'#7f7f7f',1.5));leaves.forEach(([v,u],i)=>ln(svg,[p1[L1.indexOf(v)],168],[lx[i],300],'#bfbfbf',1.2));
  dot(svg,rx,52,20,COL[2]);T(svg,rx,57,'C','lab').style.fill='#fff';TT(svg,rx+30,48,'h_C^{(2)}','lab','start');
  L1.forEach((v,k)=>{dot(svg,p1[k],168,17,COL[v]);T(svg,p1[k],173,NM[v],'lab').style.fill='#fff'});
  leaves.forEach(([v,u],i)=>{dot(svg,lx[i],300,14,COL[u]);T(svg,lx[i],305,NM[u],'').style.fill='#fff'});
  T(svg,310,338,'input features x at the leaves','');T(svg,310,378,'2 layers: 4 nodes in the middle, 13 leaves, C appears 4 times','lab')};

/* ---------- Cora results ---------- */
FIG['gnn-cora-bars']=root=>{const svg=initSvg(svgOf(root),600,300);const rows=[['MLP','features only',55.1,'#a5a5a5'],['label propagation','graph only',68.0,'#a5a5a5'],['GCN','features + graph',81.5,'#4472c4'],['GAT','features + graph',83.0,'#ed7d31']];
  const X=v=>200+v*3.7;T(svg,X(50),22,'test accuracy on Cora (%)','lab');
  [0,20,40,60,80,100].forEach(v=>{ln(svg,[X(v),34],[X(v),250],'#ececec',1);T(svg,X(v),268,String(v),'')});ln(svg,[X(0),34],[X(0),250],'#595959',1.2);
  rows.forEach(([a,b,v,c],i)=>{const y=46+i*52;E('rect',{x:X(0),y:y,width:X(v)-X(0),height:34,fill:c},svg);T(svg,X(0)-8,y+15,a,'lab','end');T(svg,X(0)-8,y+31,b,'','end');T(svg,X(v)+6,y+23,v.toFixed(1),'lab','start')});
  ln(svg,[X(14.3),34],[X(14.3),250],'#c00000',1.4,'5 4');T(svg,X(14.3)+5,290,'chance: 1 in 7 = 14.3','','start').style.fill='#c00000'};

/* ---------- the karate club during training ---------- */
FIG['gnn-karate']=root=>{const svg=svgOf(root);const P=kpos(30,26,470,290);
  onInput(root,'e',()=>{const e=+q(root,'e').value;const S=KD.snaps[Math.round(e/5)];setV(root,'e',e);initSvg(svg,1100,345);
    const pred=S.e.map(z=>S.w[0]*z[0]+S.w[1]*z[1]+S.b>0?1:0);
    T(svg,265,16,'colour = true faction · red ring = wrong prediction','');
    graph(svg,P,KD.edges,{r:9,edge:()=>({c:'#d5dbe5',w:1}),node:i=>({fill:FAC[KD.fac[i]],ring:(i===0||i===33)?'#1f1f1f':(pred[i]!==KD.fac[i]?'#c00000':null),ringW:(i===0||i===33)?3:2.5})});
    [[0,'0'],[33,'33']].forEach(([i,t])=>T(svg,P[i][0],P[i][1]+5,t,'').style.fill='#fff');
    const xs=S.e.map(z=>z[0]),ys=S.e.map(z=>z[1]);const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
    const hw=Math.max(0.01,1.18*Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys))/2);const dd=hw<0.05?3:hw<0.5?2:1;
    const Pl=Plot(svg,{at:[590,0],w:500,h:345,x:[cx-hw,cx+hw],y:[cy-hw,cy+hw],m:{l:54,r:12,t:26,b:34}});const tk=c=>[c-0.8*hw,c,c+0.8*hw];
    Pl.axes({xt:tk(cx),yt:tk(cy),fx:v=>nf(v,dd),fy:v=>nf(v,dd),xl:'embedding 1',yl:'embedding 2'});
    T(Pl.root,302,16,'epoch '+e+' · embedding, zoomed to the points · '+S.ok+' / 32 right','lab');
    const [w0,w1]=S.w,b=S.b;if(Math.abs(w1)>Math.abs(w0)){const lo=cx-3*hw,hi=cx+3*hw;Pl.line(lo,-(w0*lo+b)/w1,hi,-(w0*hi+b)/w1,'ln thin sk dash')}else{const lo=cy-3*hw,hi=cy+3*hw;Pl.line(-(w1*lo+b)/w0,lo,-(w1*hi+b)/w0,hi,'ln thin sk dash')}
    S.e.forEach((z,i)=>{if(i===0||i===33)return;const c=Pl.dot(z[0],z[1],5.5,'pt');c.setAttribute('fill',FAC[KD.fac[i]]);c.setAttribute('fill-opacity','0.85');if(pred[i]!==KD.fac[i]){c.setAttribute('stroke','#c00000');c.setAttribute('stroke-width','2.5')}});
    [0,33].forEach(i=>{const z=S.e[i];const c=Pl.dot(z[0],z[1],10,'');c.setAttribute('fill',FAC[KD.fac[i]]);c.setAttribute('stroke','#1f1f1f');c.setAttribute('stroke-width','2.5');Pl.text(z[0],z[1],String(i),'lab',i?'start':'end',i?15:-15,5)})})};

/* ---------- Laplacian modes ---------- */
FIG['gnn-modes']=root=>{const svg=svgOf(root);const n=34;const pv=k=>[...Array(n)].map((_,i)=>Math.cos(Math.PI*k*(i+0.5)/n));const pl=k=>2-2*Math.cos(Math.PI*k/n);
  const P=kpos(40,36,540,220);let g='path';
  function draw(){const k=+q(root,'k').value;setV(root,'k',k);initSvg(svg,620,380);
    const v=g==='path'?pv(k):KD.V[k];const lam=g==='path'?pl(k):KD.eig[k];const mx=Math.max(...v.map(Math.abs))||1;
    T(svg,310,18,(g==='path'?'path of 34 nodes':'karate club')+' · mode '+k+' · λ = '+lam.toFixed(3),'lab');
    if(g==='path'){const X=i=>30+i*16.8;ln(svg,[X(0)-6,140],[X(n-1)+6,140],'#bfbfbf',1);
      for(let i=0;i<n;i++){const y=140-90*v[i]/mx;ln(svg,[X(i),140],[X(i),y],'#7f7f7f',1.2);dot(svg,X(i),y,3.2,'#404040',null,0)}
      for(let i=0;i<n-1;i++)ln(svg,[X(i),262],[X(i+1),262],'#9aa5b8',1.5);for(let i=0;i<n;i++)dot(svg,X(i),262,6.5,heat(Math.sign(v[i])*Math.sqrt(Math.abs(v[i])/mx)),'#7f7f7f',0.8);T(svg,310,290,'node colour = value of the eigenvector (blue negative, orange positive)','')}
    else{graph(svg,P,KD.edges,{r:9,edge:()=>({c:'#d5dbe5',w:1}),node:i=>({fill:heat(Math.sign(v[i])*Math.sqrt(Math.abs(v[i])/mx)),stroke:'#595959',sw:1,square:KD.fac[i]===1})});
      T(svg,310,290,'colour = value (blue −, orange +) · circle = Mr. Hi’s group, square = the officer’s','')}
    const lams=g==='path'?[...Array(n)].map((_,j)=>pl(j)):KD.eig;const lm=lams[lams.length-1];const X=l=>40+540*l/lm;
    ln(svg,[40,334],[580,334],'#595959',1.2);T(svg,40,354,'0','');T(svg,580,354,lm.toFixed(1),'');T(svg,310,374,'the spectrum: eigenvalues of L (roughness of each mode)','');
    lams.forEach((l,j)=>dot(svg,X(l),334,j===k?7:3.5,j===k?'#ed7d31':'#7f7f7f',j===k?'#fff':'none',j===k?1.5:0))}
  segs(root,'g',v=>{g=v;draw()});onInput(root,'k',draw)};

/* ---------- low-pass filter ---------- */
FIG['gnn-lowpass']=root=>{const svg=svgOf(root);const lmax=Math.max(...KD.lsym);
  onInput(root,'K',()=>{const K=+q(root,'K').value;setV(root,'K',K);const Pl=Plot(svg,{w:600,h:360,x:[0,2],y:[-1,1.05],m:{l:56,r:14,t:30,b:40}});
    Pl.axes({xt:[0,0.5,1,1.5,2],yt:[-1,-0.5,0,0.5,1],xl:'graph frequency λ (eigenvalue of the normalised Laplacian)',yl:'gain'});
    E('rect',{x:Pl.X(lmax),y:Pl.Y(1.05),width:Pl.X(2)-Pl.X(lmax),height:Pl.Y(-1)-Pl.Y(1.05),fill:'#ececec','fill-opacity':0.7},Pl.bgc);
    Pl.text((lmax+2)/2,0.95,'no modes here:','','middle',0,0);Pl.text((lmax+2)/2,0.82,'self-loops keep λ \u2264 '+lmax.toFixed(2),'','middle',0,0);
    Pl.line(0,0,2,0,'ln thin sm',Pl.bg);Pl.fn(l=>1-l,'ln thin sm dash',0,2,60,Pl.bg);Pl.fn(l=>Math.pow(1-l,K),'ln sb',0,2,300);
    KD.lsym.forEach(l=>{Pl.line(l,-1,l,-0.93,'ln thin sk');Pl.dot(l,Math.pow(1-l,K),3.6,'fo pt')});
    TT(Pl.top,Pl.X(1),18,'gain (1 − λ)^K after K = '+K+(K===1?' layer':' layers'),'lab');Pl.text(0.55,0.88,'smooth modes pass','','start',0,0);Pl.text(0.9,0.6,'rough modes damped','','start',0,0);
    Pl.text(0.05,-0.86,'ticks: the 34 frequencies of the karate club','','start',0,0)})};

/* ---------- over-smoothing ---------- */
FIG['gnn-smooth']=root=>{const svg=svgOf(root);const P=kpos(16,30,368,300);const r=rng(11);let x=[...Array(KN)].map(()=>randn(r));
  const xs=[],rough=[];for(let k=0;k<=64;k++){const nrm=Math.hypot(...x);x=x.map(v=>v/nrm);xs.push(x.slice());const Ax=khat(x);rough.push(1-x.reduce((s,v,i)=>s+v*Ax[i],0));x=Ax}
  const col=k=>xs[k].map((v,i)=>v/Math.sqrt(kdt[i]));const sc=Math.max(...col(0).map(Math.abs));
  onInput(root,'k',()=>{const k=+q(root,'k').value;setV(root,'k',k);initSvg(svg,620,380);const c=col(k);
    graph(svg,P,KD.edges,{r:9,edge:()=>({c:'#d5dbe5',w:1}),node:i=>({fill:heat(c[i]/sc),stroke:'#7f7f7f',sw:0.8})});
    T(svg,200,18,'colour: (Âᵏx)ᵥ / √d̃ᵥ','');
    const Pl=Plot(svg,{at:[400,20],w:220,h:300,x:[0,Math.log2(65)],y:[0,1.1*rough[0]],m:{l:42,r:10,t:22,b:46}});
    Pl.axes({xt:[0,1,2,3,4,5,6].map(t=>t*Math.log2(65)/6.02),fx:t=>String(Math.round(Math.pow(2,t)-1)),yt:[0,0.5,1].filter(v=>v<=1.1*rough[0]),xl:'propagations k',yl:'roughness'});
    Pl.path(rough.map((v,j)=>[Math.log2(j+1),v]),'ln sb',Pl.bg);Pl.dot(Math.log2(k+1),rough[k],6,'fo pt');T(Pl.root,131,14,'xᵀL̃x / xᵀx','lab');
    T(svg,510,370,'roughness at k = '+k+': '+rough[k].toFixed(3),'lab')})};

/* ---------- GraphSAGE sampling ---------- */
FIG['gnn-sage']=root=>{const svg=initSvg(svgOf(root),480,400);const L1=[0,1,2,3,4,5].map(i=>[30+i*84,170]);const S1=[1,3,4];const root0=[240,48];
  L1.forEach((p,i)=>ln(svg,root0,p,S1.includes(i)?'#4472c4':'#d0d0d0',S1.includes(i)?2.2:1.2,S1.includes(i)?'':'4 4'));
  S1.forEach(i=>{const p=L1[i];[-36,-12,12,36].forEach((d,j)=>{const c=[p[0]+d,290];const on=j===0||j===2;ln(svg,p,c,on?'#70ad47':'#d0d0d0',on?2:1.1,on?'':'4 4');dot(svg,c[0],c[1],9,on?'#70ad47':'#ececec',on?'#fff':'#bfbfbf',1)})});
  L1.forEach((p,i)=>dot(svg,p[0],p[1],13,S1.includes(i)?'#4472c4':'#ececec',S1.includes(i)?'#fff':'#bfbfbf',1.2));dot(svg,root0[0],root0[1],17,'#ed7d31');T(svg,root0[0],root0[1]+5,'v','lab').style.fill='#fff';
  T(svg,306,80,'sample 3 of 6 neighbours','','start');T(svg,240,320,'then 2 of 4 neighbours for each','');
  T(svg,240,348,'per target: 1 + 3 + 3·2 = 10 nodes, whatever the degrees','lab');T(svg,240,372,'the full 2-hop tree here: 1 + 6 + 6·4 = 31','');T(svg,240,394,'grey: neighbours not sampled this time','')};

/* ---------- GAT with numbers ---------- */
FIG['gnn-gat']=root=>{const svg=svgOf(root);const Wh=mm(TX,TW);const ad=[0.2,0],as=[0.5,1],nb=[0,1,2,3];const lr=z=>z>0?z:0.2*z;
  const base=ad[0]*Wh[2][0]+ad[1]*Wh[2][1];const raw=nb.map(u=>base+as[0]*Wh[u][0]+as[1]*Wh[u][1]);const e=raw.map(lr);const mx=Math.max(...e);const ex=e.map(v=>Math.exp(v-mx));const Z=ex.reduce((a,b)=>a+b,0);const al=ex.map(v=>v/Z);
  const out=[0,1].map(d=>nb.reduce((s,u,k)=>s+al[k]*Wh[u][d],0));
  const P={0:[70,80],1:[70,290],2:[210,185],3:[340,290]};
  stepper(root,s=>{initSvg(svg,620,370);setV(root,'s',s+' / 3');
    nb.forEach((u,k)=>{if(u===2)return;const w=s>=2?1.5+14*al[k]:2;ln(svg,P[u],P[2],s>=2?'#ed7d31':'#9aa5b8',w);
      if(s>=1){const m=[(P[u][0]+P[2][0])/2,(P[u][1]+P[2][1])/2];box(svg,m[0]-34,m[1]-13,68,24,s>=2?'α = '+nf(al[k],3):'e = '+nf(e[k],2),'#fff',{cls:'',stroke:s>=2?'#ed7d31':'#9aa5b8'})}});
    const c=P[2];E('path',{d:'M'+(c[0]-14)+','+(c[1]-20)+' C'+(c[0]-40)+','+(c[1]-90)+' '+(c[0]+40)+','+(c[1]-90)+' '+(c[0]+14)+','+(c[1]-20),fill:'none',stroke:s>=2?'#ed7d31':'#9aa5b8','stroke-width':s>=2?1.5+14*al[2]:2},svg);
    if(s>=1)box(svg,c[0]-34,c[1]-100,68,24,s>=2?'α = '+nf(al[2],3):'e = '+nf(e[2],2),'#fff',{cls:'',stroke:s>=2?'#ed7d31':'#9aa5b8'});
    nb.forEach(u=>{const p=P[u];dot(svg,p[0],p[1],u===2?24:19,COL[u]);T(svg,p[0],p[1]+5,NM[u],'lab').style.fill='#fff';const t=u===2?TT(svg,p[0]-32,p[1]+5,'hW = '+vec(Wh[u],1),'','end'):TT(svg,p[0],p[1]+(u===1||u===3?40:-28),'hW = '+vec(Wh[u],1),'');t.style.fill=COL[u]});
    const tx=[428,478,538,592];['u','hW','e','α'].forEach((h,j)=>T(svg,tx[j],50,h,'lab'));ln(svg,[405,58],[615,58],'#7f7f7f',1);
    nb.forEach((u,k)=>{const y=84+k*32;T(svg,tx[0],y,NM[u],'lab').style.fill=COL[u];T(svg,tx[1],y,vec(Wh[u],1),'');if(s>=1)T(svg,tx[2],y,nf(e[k],2),'');if(s>=2){const t=T(svg,tx[3],y,nf(al[k],3),'lab');t.style.fill='#c55a11'}});
    if(s>=1)T(svg,510,222,'e = LeakyReLU(0.3 + 0.5·hW₁ + hW₂)','');
    if(s>=3){box(svg,405,250,210,66,'','#dae3f3',{});TT(svg,510,276,'h′_C = Σ α_{Cu} h_uW','lab');T(svg,510,302,'= '+vec(out.map(v=>+v.toFixed(3)),3),'lab')}})};

/* ---------- transformer vs GNN ---------- */
FIG['gnn-complete']=root=>{const svg=initSvg(svgOf(root),480,390);T(svg,240,20,'self-attention: every token is a neighbour','lab');
  const tk=['the','cat','sat','down'];const C=[...Array(4)].map((_,i)=>[240+120*Math.cos(Math.PI/2*i+Math.PI/4),104+58*Math.sin(Math.PI/2*i+Math.PI/4)]);
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)ln(svg,C[i],C[j],'#4472c4',1.6);C.forEach((p,i)=>box(svg,p[0]-30,p[1]-14,60,28,tk[i],'#e2f0d9',{cls:'lab'}));
  T(svg,240,198,'4 tokens, 6 pairs (+ itself): all talk to all','');ln(svg,[20,214],[460,214],'#d0d0d0',1);
  T(svg,240,240,'GNN on a molecule: only the bonds','lab');const R=40,cx=200,cy=310;const P=[...Array(6)].map((_,i)=>[cx+R*Math.cos(Math.PI/3*i),cy+R*Math.sin(Math.PI/3*i)]);
  P.forEach((p,i)=>ln(svg,p,P[(i+1)%6],'#595959',2));const O=[cx+R+48,cy],N=[cx-R-48,cy];ln(svg,P[0],O,'#595959',2);ln(svg,P[3],N,'#595959',2);
  P.forEach(p=>{dot(svg,p[0],p[1],10,'#595959');T(svg,p[0],p[1]+4,'C','').style.fill='#fff'});dot(svg,O[0],O[1],10,'#c00000');T(svg,O[0],O[1]+4,'O','').style.fill='#fff';dot(svg,N[0],N[1],10,'#4472c4');T(svg,N[0],N[1]+4,'N','').style.fill='#fff';
  T(svg,240,380,'8 atoms, 8 bonds: each atom hears 1 to 3 neighbours','')};

/* ---------- sum, mean, max ---------- */
FIG['gnn-agg']=root=>{const svg=initSvg(svgOf(root),1160,255);
  const pairs=[[[1,1],[1]],[[1,2],[1,1,2,2]],[[1,3],[2,2]]];const nc={1:'#dae3f3',2:'#fbe5d6',3:'#e2f0d9'};
  const F={sum:a=>a.reduce((s,v)=>s+v,0),mean:a=>a.reduce((s,v)=>s+v,0)/a.length,max:a=>Math.max(...a),'sum of x²':a=>a.reduce((s,v)=>s+v*v,0)};
  pairs.forEach((pr,k)=>{const x0=k*390;E('rect',{x:x0+6,y:4,width:372,height:246,rx:8,fill:'#fafafa',stroke:'#d0d0d0'},svg);T(svg,x0+192,24,'pair '+(k+1),'lab');
    pr.forEach((nbs,s)=>{const cx=x0+100+s*185,cy=112;const m=nbs.length;nbs.forEach((v,j)=>{const a=-Math.PI*(m===1?0.5:0.85-0.7*j/(m-1));const p=[cx+56*Math.cos(a),cy+56*Math.sin(a)];ln(svg,[cx,cy],p,'#9aa5b8',1.5);dot(svg,p[0],p[1],14,nc[v],'#7f7f7f',1);T(svg,p[0],p[1]+5,String(v),'lab')});
      dot(svg,cx,cy,11,'#7f7f7f');T(svg,cx,cy+4,'v','').style.fill='#fff'});
    Object.keys(F).forEach((f,r)=>{const y=150+r*24;T(svg,x0+24,y,f,'lab','start');const a=F[f](pr[0]),b=F[f](pr[1]);T(svg,x0+175,y,nt(a,1)+' vs '+nt(b,1),'');const ok=Math.abs(a-b)>1e-9;const t=T(svg,x0+300,y,ok?'✓ tells apart':'✗ same','lab','start');t.style.fill=ok?'#548235':'#c00000'})})};

/* ---------- WL colour refinement ---------- */
const WLG=[{n:6,e:[[0,2],[1,2],[1,3],[1,4],[2,4],[3,5]],p:[[250,58],[115,95],[195,95],[60,150],[155,165],[60,220]]},
           {n:6,e:[[0,1],[0,2],[0,3],[3,4],[3,5],[4,5]],p:[[420,130],[360,70],[360,190],[495,130],[565,80],[565,180]]}];
const WLC=['#d9d9d9','#4472c4','#ed7d31','#70ad47','#ffc000','#7030a0','#c00000','#5b9bd5','#a5a5a5','#843c0c','#264478','#9e480e'];
function wlRounds(G,T){const nb=G.map(g=>{const L=[...Array(g.n)].map(()=>[]);g.e.forEach(([u,v])=>{L[u].push(v);L[v].push(u)});return L});
  let col=G.map(g=>new Array(g.n).fill(0));const out=[col];
  for(let t=0;t<T;t++){const sig=col.map((c,gi)=>c.map((cv,v)=>cv+'|'+nb[gi][v].map(u=>c[u]).sort((a,b)=>a-b).join(',')));const keys=[...new Set(sig.flat())].sort();const pal={};keys.forEach((k,i)=>pal[k]=i+1+t*0);
    col=sig.map(s=>s.map(k=>pal[k]));out.push(col)}
  return out}
FIG['gnn-wl']=root=>{const svg=svgOf(root);const R=wlRounds(WLG,2);
  onInput(root,'t',()=>{const t=+q(root,'t').value;setV(root,'t',t);initSvg(svg,620,370);const col=R[t];const off=t*3;const cc=c=>c===0?WLC[0]:WLC[1+(c-1+off)%(WLC.length-1)];
    T(svg,150,22,'graph 1','lab');T(svg,465,22,'graph 2','lab');ln(svg,[310,30],[310,250],'#d0d0d0',1);
    WLG.forEach((g,gi)=>graph(svg,g.p,g.e,{r:16,node:i=>({fill:cc(col[gi][i]),stroke:'#595959',sw:1})}));
    const hist=col.map(c=>{const h={};c.forEach(v=>h[v]=(h[v]||0)+1);return h});const ids=[...new Set(col.flat())].sort((a,b)=>a-b);
    WLG.forEach((g,gi)=>{const x0=gi?340:30;T(svg,x0,276,'colour histogram','','start');let x=x0;ids.forEach(id=>{const m=hist[gi][id]||0;for(let j=0;j<m;j++){E('rect',{x:x,y:286,width:22,height:22,fill:cc(id),stroke:'#595959','stroke-width':0.8},svg);x+=24}if(m)x+=12})});
    const same=JSON.stringify(ids.map(i=>hist[0][i]||0))===JSON.stringify(ids.map(i=>hist[1][i]||0));
    const msg=t===0?'round 0: one colour for everyone, no information yet':same?'round '+t+': same histogram, undecided':'round '+t+': different histograms, so the graphs are not the same';
    const tt=T(svg,310,350,msg,'lab');tt.style.fill=same?'#1f1f1f':'#c00000'})};

/* ---------- WL failure: two triangles vs a hexagon ---------- */
FIG['gnn-wlfail']=root=>{const svg=initSvg(svgOf(root),620,400);const tri=(cx)=>[[cx,40],[cx-38,108],[cx+38,108]];const P1=tri(80).concat(tri(200));const e1=[[0,1],[1,2],[0,2],[3,4],[4,5],[3,5]];
  const P2=[...Array(6)].map((_,i)=>[460+70*Math.cos(Math.PI/3*i),82+62*Math.sin(Math.PI/3*i)]);const e2=[0,1,2,3,4,5].map(i=>[i,(i+1)%6]);
  graph(svg,P1,e1,{r:14,node:()=>({fill:'#4472c4'})});graph(svg,P2,e2,{r:14,node:()=>({fill:'#4472c4'})});
  T(svg,140,152,'two triangles','lab');T(svg,460,175,'one hexagon','lab');T(svg,310,90,'vs','lab big');
  T(svg,310,206,'every node: degree 2, neighbours of degree 2, … the same WL colour in every round','');
  const tx=310,lv=[[tx,236]],k1=[[tx-60,292],[tx+60,292]],k2=[[tx-90,348],[tx-30,348],[tx+30,348],[tx+90,348]];
  k1.forEach(p=>ln(svg,lv[0],p,'#7f7f7f',1.4));k2.forEach((p,i)=>ln(svg,k1[i<2?0:1],p,'#bfbfbf',1.2));[lv[0]].concat(k1,k2).forEach(p=>dot(svg,p[0],p[1],10,'#4472c4'));
  T(svg,tx,382,'the computation tree of any node, in both graphs','');
  T(svg,20,280,'WL histograms:','lab','start');T(svg,20,302,'6 × the same colour,','','start');T(svg,20,322,'both graphs, every round','','start');
  T(svg,600,280,'any message-passing GNN:','lab','end');T(svg,600,302,'identical node vectors,','','end');T(svg,600,322,'identical readout h_G','','end')};

/* ---------- batching graphs ---------- */
FIG['gnn-batch']=root=>{const svg=initSvg(svgOf(root),1160,265);const gc=['#4472c4','#ed7d31','#70ad47'],gs=['#dae3f3','#fbe5d6','#e2f0d9'];
  const gid=[0,0,0,1,1,2,2,2,2];const ed=[[0,1],[1,2],[0,2],[3,4],[5,6],[6,7],[6,8]];
  const P=[[40,80],[100,80],[70,135],[150,80],[150,150],[220,70],[250,120],[220,170],[290,140]];
  T(svg,160,26,'3 graphs, 9 nodes','lab');graph(svg,P,ed,{r:13,node:i=>({fill:gc[gid[i]],label:String(i),cls:''})});
  arrowPx(svg,312,120,338,120,'ln thin sk','fk');
  const A=[...Array(9)].map(()=>new Array(9).fill(0));ed.forEach(([u,v])=>{A[u][v]=1;A[v][u]=1});const x0=360,y0=30,c=19;
  [[0,3],[3,5],[5,9]].forEach(([a,b],g)=>E('rect',{x:x0+a*c,y:y0+a*c,width:(b-a)*c,height:(b-a)*c,fill:gs[g]},svg));
  A.forEach((r,i)=>r.forEach((v,j)=>{E('rect',{x:x0+j*c,y:y0+i*c,width:c,height:c,fill:v?gc[gid[i]]:'none',stroke:'#bfbfbf','stroke-width':0.6},svg)}));
  T(svg,x0+85,y0+c*9+18,'block-diagonal adjacency','');
  T(svg,x0-8,y0+c*9+46,'batch','lab','end');gid.forEach((g,i)=>{E('rect',{x:x0+i*c,y:y0+c*9+30,width:c,height:22,fill:gs[g],stroke:'#7f7f7f','stroke-width':0.8},svg);T(svg,x0+i*c+c/2,y0+c*9+46,String(g),'')});
  arrowPx(svg,560,120,590,120,'ln thin sk','fk');const r=rng(5);const hx=600;
  for(let i=0;i<9;i++)for(let j=0;j<3;j++)E('rect',{x:hx+j*18,y:y0+i*c,width:18,height:c,fill:heat(0.2+0.7*r(),true),stroke:'#fff'},svg);TT(svg,hx+27,y0+c*9+18,'H^{(K)}: 9 × 3','');
  const gy=[y0+1.5*c,y0+4*c,y0+7*c];
  [[0,3],[3,5],[5,9]].forEach(([a,b],g)=>{const ym=(y0+a*c+y0+b*c)/2;E('line',{x1:hx+58,y1:ym,x2:hx+146,y2:gy[g],stroke:gc[g],'stroke-width':1.5},svg)});
  T(svg,hx+102,y0-8,'sum per graph','');
  gy.forEach((y,g)=>{for(let j=0;j<3;j++)E('rect',{x:hx+152+j*18,y:y-c/2,width:18,height:c,fill:heat(0.3+0.6*r(),true),stroke:gc[g],'stroke-width':1.5},svg);TT(svg,hx+235,y+5,'h_{G'+g+'}','','start')});
  arrowPx(svg,hx+290,y0+4.5*c,hx+340,y0+4.5*c,'ln thin sk','fk');T(svg,hx+315,y0+4.5*c-10,'MLP','lab');
  ['0.91','0.12','0.67'].forEach((v,g)=>box(svg,hx+350,gy[g]-15,78,30,'ŷ = '+v,gs[g],{cls:'',stroke:gc[g]}));T(svg,hx+389,y0+c*9+18,'one prediction per graph','')};

/* ---------- link prediction split ---------- */
FIG['gnn-link']=root=>{const svg=initSvg(svgOf(root),480,400);const P=[[50,60],[140,30],[110,130],[210,100],[270,30],[310,150],[200,210],[90,230],[380,80],[420,200]];
  const tr=[[0,1],[0,2],[1,2],[2,3],[3,4],[3,5],[5,9],[6,7],[2,7],[4,8]],va=[[3,6]],te=[[1,3],[5,8]],ng=[[0,9],[7,4]];
  tr.forEach(([u,v])=>ln(svg,P[u],P[v],'#4472c4',2.4));va.forEach(([u,v])=>ln(svg,P[u],P[v],'#ed7d31',2.6,'7 5'));te.forEach(([u,v])=>ln(svg,P[u],P[v],'#c00000',2.6,'7 5'));ng.forEach(([u,v])=>ln(svg,P[u],P[v],'#a5a5a5',1.6,'2 5'));
  P.forEach(p=>dot(svg,p[0],p[1],12,'#595959'));
  const leg=[['#4472c4','','train edges: messages + positives'],['#ed7d31','7 5','validation edges: hidden'],['#c00000','7 5','test edges: hidden'],['#a5a5a5','2 5','negatives: random non-edges']];
  leg.forEach(([c,d,t],i)=>{const y=284+i*28;ln(svg,[40,y],[90,y],c,2.6,d);T(svg,102,y+5,t,'','start')})};

/* ---------- gather and scatter ---------- */
FIG['gnn-scatter']=root=>{const svg=initSvg(svgOf(root),480,420);const src=[0,0,1,1,2,2,2,3,3,4],dst=[1,2,0,2,0,1,3,2,4,3];const cw=40,x0=46;
  T(svg,240,18,'edge_index of the toy graph (self-loops omitted)','');
  [src,dst].forEach((row,r)=>{T(svg,x0-8,48+r*32,r?'dst':'src','lab','end');row.forEach((v,j)=>{E('rect',{x:x0+j*cw,y:30+r*32,width:cw,height:28,fill:SOFT[v],stroke:'#7f7f7f','stroke-width':0.8},svg);T(svg,x0+j*cw+cw/2,49+r*32,NM[v],'lab').style.fill=COL[v]})});
  src.forEach((v,j)=>{const x=x0+j*cw+cw/2;arrowPx(svg,x,92,x,136,'ln thin sm','fm');E('rect',{x:x-16,y:140,width:32,height:26,rx:5,fill:COL[v]},svg);T(svg,x,158,'m','').style.fill='#fff'});
  const tx=i=>52+i*90;src.forEach((v,j)=>{const x=x0+j*cw+cw/2;E('path',{d:'M'+x+',168 C'+x+',230 '+tx(dst[j])+',230 '+tx(dst[j])+',262',fill:'none',stroke:COL[v],'stroke-width':1.6,opacity:0.85},svg)});
  NM.forEach((nm,i)=>{box(svg,tx(i)-34,264,68,40,'out_'+nm,SOFT[i],{cls:'lab',stroke:COL[i]});const from=src.filter((_,j)=>dst[j]===i).map(v=>NM[v]).join(' + ');T(svg,tx(i),326,from,'')});
  halo(T(svg,x0,122,'gather: one message per edge, (hW)[src] · norm','lab','start'));
  halo(T(svg,x0,214,'scatter: add each message into its dst row (index_add_)','lab','start'));
  T(svg,240,356,'out_C = m from A + m from B + m from D','lab');T(svg,240,384,'cost: one multiply-add per edge, O(|E| d)','')};
})();
