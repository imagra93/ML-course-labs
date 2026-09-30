/* Figures for 06_decision_trees.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrow,arrowPx,rng,randn,fmt,q,setV,setR,svgOf,waveData,buildTree,treeProb,treeBoxes}=lib;
const counts=a=>{const c={};a.forEach(v=>c[v]=(c[v]||0)+1);return Object.values(c)};
const H=a=>{const n=a.length;return n?-counts(a).reduce((s,k)=>s+(k/n)*Math.log2(k/n),0):0};
const G=a=>{const n=a.length;return n?1-counts(a).reduce((s,k)=>s+(k/n)**2,0):0};
/* two-class impurities as a function of p = fraction of class 1 */
const Hp=p=>(p<=0||p>=1)?0:-(p*Math.log2(p)+(1-p)*Math.log2(1-p)),Gp=p=>2*p*(1-p),Mp=p=>Math.min(p,1-p);
function node(svg,x,y,w,h,txt,o){o=o||{};const g=E('g',{},svg);E('rect',{x:x-w/2,y:y-h/2,width:w,height:h,rx:8,fill:o.fill||'#fff',style:'stroke:'+(o.stroke||'#404040')+';stroke-width:'+(o.sw||1.3)},g);
  const L=String(txt).split('\n');L.forEach((t,k)=>T(g,x,y+5+(k-(L.length-1)/2)*18,t,o.cls===undefined?'lab':o.cls));return g}

/* A tree for buying a used car; the highlighted path is a .step (revealed by →) */
FIG['tree-example']=root=>{const svg=initSvg(svgOf(root),560,420);
  const N={r:[280,36,150,'Colour = red?'],a:[146,132,140,'Model > 2010?'],b:[414,132,158,'Colour = yellow?'],c:[222,232,180,'Mileage < 50 000 km?'],d:[404,232,148,'Make = Ferrari?']};
  const L={l1:[56,232,1],l2:[512,232,0],l3:[170,338,1],l4:[276,338,0],l5:[368,338,1],l6:[454,338,0]};
  const P=k=>N[k]?{x:N[k][0],y:N[k][1],r:18}:{x:L[k][0],y:L[k][1],r:24};
  const seg=(a,b)=>{const p=P(a),c=P(b);return [p.x,p.y+p.r,c.x,c.y-c.r]};
  const hl=E('g',{class:'step'},svg);
  [['r','b'],['b','d'],['d','l5']].forEach(([a,b])=>{const s=seg(a,b);E('line',{x1:s[0],y1:s[1],x2:s[2],y2:s[3],style:'stroke:#ffc000;stroke-width:10;stroke-linecap:round;stroke-opacity:.85'},hl)});
  ['r','b','d'].forEach(k=>{const [x,y,w]=N[k];E('rect',{x:x-w/2-5,y:y-23,width:w+10,height:46,rx:11,fill:'#ffc000','fill-opacity':0.85},hl)});
  E('circle',{cx:L.l5[0],cy:L.l5[1],r:30,fill:'#ffc000','fill-opacity':0.85},hl);
  T(hl,280,402,'A yellow Ferrari: red? no → yellow? yes → Ferrari? yes → Buy','lab big');
  [['r','a','yes'],['r','b','no'],['a','l1','yes'],['a','c','no'],['b','d','yes'],['b','l2','no'],['c','l3','yes'],['c','l4','no'],['d','l5','yes'],['d','l6','no']].forEach(([a,b,lab])=>{
    const s=seg(a,b);E('line',{x1:s[0],y1:s[1],x2:s[2],y2:s[3],class:'ln thin sk'},svg);const left=s[2]<s[0];
    T(svg,s[0]+(s[2]-s[0])*0.42+(left?-7:7),s[1]+(s[3]-s[1])*0.42+4,lab,'',left?'end':'start')});
  Object.values(N).forEach(([x,y,w,t])=>node(svg,x,y,w,36,t));
  Object.values(L).forEach(([x,y,buy])=>{E('circle',{cx:x,cy:y,r:24,fill:buy?'#92d050':'#e0443e',style:'stroke:#404040;stroke-width:1.2'},svg);T(svg,x,y+5,buy?'Buy':"Don't",'lab').style.fill=buy?'#000':'#fff'})};

/* The same tree seen two ways: boxes in feature space and the tree that makes them */
FIG['part-tree']=root=>{const svg=initSvg(svgOf(root),980,390);
  const P=Plot(svg,{at:[0,0],w:430,h:390,x:[0,20],y:[0,300],m:{l:54,r:10,t:10,b:44}});
  P.axes({xt:[0,5,10,15,20],yt:[0,150,300],xl:'x₁ = price (k€)',yl:'x₂ = mileage (1000 km)'});
  const R=[{id:'R1',x:[0,10],y:[0,150],n:10,k:9},{id:'R2',x:[10,20],y:[0,150],n:10,k:4},{id:'R3',x:[0,5],y:[150,300],n:6,k:4},{id:'R4',x:[5,20],y:[150,300],n:8,k:1}];
  const r=rng(12);
  R.forEach(z=>{P.rect(z.x[0],z.y[0],z.x[1],z.y[1],z.k/z.n>=0.5?'fbs':'fos',P.bg);
    for(let i=0;i<z.n;i++){const x=z.x[0]+(z.x[1]-z.x[0])*(0.1+0.8*r()),y=z.y[0]+(z.y[1]-z.y[0])*(0.08+0.6*r());P.dot(x,y,4.5,'pt '+(i<z.k?'fb':'fo'))}
    P.text((z.x[0]+z.x[1])/2,z.y[1],z.id+': '+z.k+'/'+z.n,'lab','middle',0,22)});
  P.line(0,150,20,150,'ln sk');P.line(10,0,10,150,'ln sk');P.line(5,150,5,300,'ln sk');
  const g=E('g',{transform:'translate(450,0)'},svg);
  const ed=(x1,y1,x2,y2,lab)=>{E('line',{x1:x1,y1:y1,x2:x2,y2:y2,class:'ln thin sk'},g);const left=x2<x1;T(g,(x1+x2)/2+(left?-8:8),(y1+y2)/2+4,lab,'',left?'end':'start')};
  ed(265,58,130,132,'yes');ed(265,58,400,132,'no');ed(130,168,60,245,'yes');ed(130,168,190,245,'no');ed(400,168,340,245,'yes');ed(400,168,470,245,'no');
  node(g,265,40,134,36,'x₂ ≤ 150?');node(g,130,150,112,36,'x₁ ≤ 10?');node(g,400,150,112,36,'x₁ ≤ 5?');
  R.forEach((z,k)=>{const x=[60,190,340,470][k],p=z.k/z.n;node(g,x,270,116,50,z.id+': '+z.k+'/'+z.n+'\nP(sold) = '+fmt(p,2),{fill:p>=0.5?'#dae3f3':'#fbe5d6'})});
  T(g,190,45,'root','','end');T(g,265,155,'← internal nodes →','','middle');T(g,265,318,'leaves (one per box)','','middle');
  T(g,265,362,'Blue dots = sold, orange = not sold.','','middle')};

/* Entropy, Gini and misclassification error for two classes */
FIG['impurity']=root=>{const P=Plot(svgOf(root),{w:470,h:320,x:[0,1],y:[0,1.08],m:{l:46,r:14,t:12,b:40}});
  P.axes({xt:[0,0.25,0.5,0.75,1],yt:[0,0.25,0.5,0.75,1],xl:'p = fraction of class 1 in the node',yl:'impurity'});
  P.fn(Hp,'ln sb',0,1,400);P.fn(Gp,'ln sr dash',0,1,200);P.fn(Mp,'ln sm',0,1,200)};

/* Running example: two candidate first questions on 16 cars */
FIG['stumps']=root=>{const svg=initSvg(svgOf(root),960,290);
  const dots=(g,cx,cy,nb,no)=>{const n=nb+no,per=8,rows=Math.ceil(n/per);for(let i=0;i<n;i++){const rr=Math.floor(i/per),c=i%per,inRow=Math.min(per,n-rr*per);
    E('circle',{cx:cx+(c-(inRow-1)/2)*14,cy:cy+(rr-(rows-1)/2)*14,r:5.2,class:'pt '+(i<nb?'fb':'fo')},g)}};
  [{q:'A · price < 10 k€?',L:[6,2],R:[2,6]},{q:'B · mileage < 150 000 km?',L:[8,4],R:[0,4]}].forEach((s,k)=>{const g=E('g',{transform:'translate('+(k*490)+',0)'},svg);
    T(g,235,18,'Question '+s.q,'lab big');
    E('rect',{x:140,y:30,width:190,height:74,rx:8,class:'fw',style:'stroke:#404040;stroke-width:1.3'},g);T(g,235,50,'16 cars: 8 sold, 8 not','lab');dots(g,235,82,8,8);
    [[s.L,110,'yes'],[s.R,360,'no']].forEach(([c,x,lab])=>{E('line',{x1:235,y1:104,x2:x,y2:166,class:'ln thin sk'},g);T(g,(235+x)/2+(x<235?-8:8),140,lab,'',x<235?'end':'start');
      const pure=c[0]===0||c[1]===0;E('rect',{x:x-95,y:166,width:190,height:74,rx:8,fill:'#fff',style:'stroke:'+(pure?'#70ad47':'#404040')+';stroke-width:'+(pure?3:1.3)},g);
      T(g,x,186,c[0]+' sold, '+c[1]+' not','lab');dots(g,x,217,c[0],c[1]);
      T(g,x,262,'p(sold) = '+c[0]+'/'+(c[0]+c[1])+(pure?' · pure!':''),pure?'lab':'','middle')})})};

/* Impurity of the children lies on a chord: straight for misclassification, curved for Gini/entropy */
FIG['chord']=root=>{const svg=svgOf(root);let crit='mis',sp='A';
  const SPL={A:{wl:0.5,pl:0.75,wr:0.5,pr:0.25,L:'6/8',R:'2/8'},B:{wl:0.75,pl:2/3,wr:0.25,pr:0,L:'8/12',R:'0/4'}};
  const F={mis:Mp,gini:Gp,ent:Hp},NM={mis:'misclassification error',gini:'Gini',ent:'entropy (bits)'};
  const bc=root.querySelectorAll('button[data-c]'),bs=root.querySelectorAll('button[data-s]');
  function draw(){const f=F[crit],s=SPL[sp],ent=crit==='ent';
    const P=Plot(svg,{w:540,h:340,x:[0,1],y:[0,ent?1.12:0.58],m:{l:52,r:16,t:14,b:40}});
    P.axes({xt:[0,0.25,0.5,0.75,1],yt:ent?[0,0.25,0.5,0.75,1]:[0,0.125,0.25,0.375,0.5],xl:'p = fraction of sold cars in a node',yl:NM[crit]});
    P.fn(f,'ln sb',0,1,400,P.bg);
    const I0=f(0.5),IL=f(s.pl),IR=f(s.pr),Ia=s.wl*IL+s.wr*IR;
    P.line(s.pr,IR,s.pl,IL,'ln so');P.dot(s.pl,IL,6,'fo pt');P.dot(s.pr,IR,6,'fo pt');
    P.text(s.pl,IL,'child '+s.L,'','start',9,-8);P.text(s.pr,IR,'child '+s.R,'',s.pr<0.1?'start':'end',s.pr<0.1?9:-9,-8);
    if(I0-Ia>1e-9)arrow(P,0.5,I0,0.5,Ia,'ln thin sk','fk');
    P.dot(0.5,I0,6,'fk pt');P.text(0.5,I0,'parent '+fmt(I0,3),'lab','end',-10,-6);
    P.dot(0.5,Ia,7,'fgr pt');P.text(0.5,Ia,'after '+fmt(Ia,3),'lab','start',10,18);
    setR(root,'b',fmt(I0,3));setR(root,'a',fmt(Ia,3));setR(root,'g',fmt(I0-Ia,3))}
  const wire=(list,key,set)=>list.forEach(b=>b.addEventListener('click',()=>{set(b.dataset[key]);list.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));
  wire(bc,'c',v=>crit=v);wire(bs,'s',v=>sp=v);draw()};

/* Eight labelled points: every threshold and its impurity decrease */
FIG['split']=root=>{const lab=['A','A','A','B','A','B','B','B'];let crit='gini';const svg=svgOf(root);const inp=q(root,'s');const btns=root.querySelectorAll('.seg button');
  function draw(){initSvg(svg,520,380);const f=crit==='gini'?G:H,gini=crit==='gini';const k=+inp.value;setV(root,'s',fmt(k+0.5,1));
    const st=[];for(let j=1;j<=7;j++){const L=lab.slice(0,j),R=lab.slice(j);const w=(j/8)*f(L)+((8-j)/8)*f(R);st.push({j:j,l:f(L),r:f(R),w:w,d:f(lab)-w})}
    const dmax=Math.max(...st.map(z=>z.d)),s=st[k-1];
    const P=Plot(svg,{at:[0,0],w:520,h:130,x:[0.4,8.6],y:[-1,1],m:{l:20,r:20,t:10,b:30}});
    const Q=Plot(svg,{at:[0,140],w:520,h:240,x:[0.9,7.6],y:[0,gini?0.36:0.64],m:{l:60,r:20,t:22,b:36}});
    Q.axes({xt:[1.5,2.5,3.5,4.5,5.5,6.5,7.5],yt:gini?[0,0.1,0.2,0.3]:[0,0.2,0.4,0.6],fx:v=>'≤'+v,xl:'split threshold',yl:'gain ΔI'});
    P.rect(0.4,-1,k+0.5,1,'fbs');P.rect(k+0.5,-1,8.6,1,'fos');P.line(k+0.5,-1,k+0.5,1,'ln sk');
    lab.forEach((l,i)=>{P.dot(i+1,0,15,l==='A'?'fb':'fo');P.text(i+1,0,l,'lab','middle',0,5).style.fill='#fff';P.text(i+1,-1,'x='+(i+1),'','middle',0,18)});
    st.forEach(z=>{const best=z.d>dmax-1e-9;Q.rect(z.j+0.5-0.3,0,z.j+0.5+0.3,Math.max(z.d,0.003),z.j===k?'fgr':best?'fb':'fbs');if(best)Q.text(z.j+0.5,z.d,'best','','middle',0,z.j===k?-24:-6)});
    Q.text(k+0.5,s.d,fmt(s.d,3),'lab','middle',0,-6);
    setR(root,'root',fmt(f(lab),3));setR(root,'gl',fmt(s.l,3));setR(root,'gr',fmt(s.r,3));setR(root,'w',fmt(s.w,3));setR(root,'d',fmt(s.d,3))}
  btns.forEach(b=>b.addEventListener('click',()=>{crit=b.dataset.c;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));inp.addEventListener('input',draw);draw()};

/* 1-D regression tree (squared error), grown once to full depth and read at depth d */
function regTree1D(xs,ys,maxD,minLeaf){const idx=xs.map((_,i)=>i).sort((a,b)=>xs[a]-xs[b]);
  function rec(ids,d){const n=ids.length,mean=ids.reduce((s,i)=>s+ys[i],0)/n;const nd={v:mean};if(d>=maxD||n<2*minLeaf)return nd;let best=null,sl=0,sl2=0;
    const tot=ids.reduce((s,i)=>s+ys[i],0),tot2=ids.reduce((s,i)=>s+ys[i]*ys[i],0);
    for(let k=1;k<n;k++){const v=ys[ids[k-1]];sl+=v;sl2+=v*v;if(k<minLeaf||n-k<minLeaf||xs[ids[k]]===xs[ids[k-1]])continue;const sse=(sl2-sl*sl/k)+((tot2-sl2)-(tot-sl)**2/(n-k));if(!best||sse<best.sse)best={sse:sse,k:k}}
    if(!best)return nd;nd.t=(xs[ids[best.k-1]]+xs[ids[best.k]])/2;nd.L=rec(ids.slice(0,best.k),d+1);nd.R=rec(ids.slice(best.k),d+1);return nd}
  return rec(idx,0)}
FIG['regtree']=root=>{const f0=x=>Math.sin(2*Math.PI*x)+0.6*x;const r=rng(17);const tr=[],te=[];
  for(let i=0;i<50;i++){const x=r();tr.push([x,f0(x)+0.3*randn(r)])}for(let i=0;i<1000;i++){const x=r();te.push([x,f0(x)+0.3*randn(r)])}
  const T0=regTree1D(tr.map(p=>p[0]),tr.map(p=>p[1]),12,1);
  const pred=(x,d)=>{let nd=T0,k=0;while(nd.t!==undefined&&k<d){nd=x<=nd.t?nd.L:nd.R;k++}return nd.v};
  const leaves=d=>{let c=0;(function rec(nd,k){if(nd.t===undefined||k>=d){c++;return}rec(nd.L,k+1);rec(nd.R,k+1)})(T0,0);return c};
  const mse=(D,d)=>D.reduce((s,p)=>s+(pred(p[0],d)-p[1])**2,0)/D.length;
  const P=Plot(svgOf(root),{w:560,h:350,x:[0,1],y:[-1.6,2.2],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[0,0.25,0.5,0.75,1],yt:[-1,0,1,2],xl:'x',yl:'y'});P.fn(f0,'ln thin sm dash',0,1,200,P.bg);
  const inp=q(root,'d');
  function draw(){const d=+inp.value;setV(root,'d',d);P.clear();tr.forEach(p=>P.dot(p[0],p[1],4.5,'pt fb'));
    const pts=[];for(let i=0;i<=800;i++){const x=i/800;pts.push([x,pred(x,d)])}P.path(pts,'ln sr');
    setR(root,'l',leaves(d));setR(root,'tr',fmt(mse(tr,d),3));setR(root,'te',fmt(mse(te,d),3))}inp.addEventListener('input',draw);draw()};

/* Classification tree on the wave data, read at depth d; train and test accuracy for every depth */
FIG['tree-depth']=root=>{const tr=waveData(160,36,0.12),te=waveData(1000,1036,0.12);const T0=buildTree(tr,40);
  const acc=(D,d)=>D.filter(p=>(treeProb(T0,p,d)>=0.5?1:0)===p[2]).length/D.length;const A=[];for(let d=1;d<=10;d++)A.push([d,acc(tr,d),acc(te,d)]);
  const svg=initSvg(svgOf(root),600,380);const P=Plot(svg,{at:[0,0],w:380,h:380,x:[0,1],y:[0,1],m:{l:10,r:10,t:10,b:10}});
  const Q=Plot(svg,{at:[390,0],w:210,h:380,x:[1,10],y:[0.5,1],m:{l:56,r:6,t:10,b:36}});Q.axes({xt:[1,4,7,10],yt:[0.5,0.75,1],xl:'max_depth',yl:'accuracy'});
  Q.path(A.map(a=>[a[0],a[1]]),'ln sb',Q.bg);Q.path(A.map(a=>[a[0],a[2]]),'ln so',Q.bg);
  Q.line(5,0.6,6.3,0.6,'ln sb',Q.bg);Q.text(6.6,0.6,'train','','start',0,5,Q.bg);Q.line(5,0.55,6.3,0.55,'ln so',Q.bg);Q.text(6.6,0.55,'test','','start',0,5,Q.bg);
  const inp=q(root,'d');
  function draw(){const d=+inp.value;setV(root,'d',d);P.clear();let leaves=0;treeBoxes(T0,d,(nd,b)=>{leaves++;const rc=P.rect(b[0],b[2],b[1],b[3],nd.p1>=0.5?'fb':'fo');rc.setAttribute('opacity',(0.1+0.3*Math.abs(nd.p1-0.5)*2).toFixed(2));rc.setAttribute('style','stroke:#fff;stroke-width:1')});
    P.fn(x=>0.5+0.22*Math.sin(2*Math.PI*x),'ln thin sk dash',0,1);tr.forEach(p=>P.dot(p[0],p[1],4,'pt '+(p[2]?'fb':'fo')));Q.clear();Q.line(d,0.5,d,1,'ln thin sm dash');Q.dot(d,A[d-1][1],5,'fb');Q.dot(d,A[d-1][2],5,'fo');
    setR(root,'l',leaves);setR(root,'tr',fmt(A[d-1][1],3));setR(root,'te',fmt(A[d-1][2],3))}inp.addEventListener('input',draw);draw()};

/* Instability: full trees grown on two random halves of the same data; each click draws new halves */
FIG['unstable']=root=>{const D=waveData(160,36,0.12);const svg=svgOf(root);const r=rng(5);
  const rootQ=t=>t.L?(t.j===0?'x₁':'x₂')+' ≤ '+fmt(t.t,2):'none';
  function draw(){initSvg(svg,860,380);
    const idx=D.map((_,i)=>i);for(let i=idx.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]]}
    const halves=[idx.slice(0,80).map(i=>D[i]),idx.slice(80).map(i=>D[i])],trees=halves.map(h=>buildTree(h,40));
    let dis=0;const N=100;for(let a=0;a<N;a++)for(let c=0;c<N;c++){const x=[(a+0.5)/N,(c+0.5)/N];if((treeProb(trees[0],x)>=0.5)!==(treeProb(trees[1],x)>=0.5))dis++}
    trees.forEach((t,s)=>{const P=Plot(svg,{at:[s*440,0],w:420,h:380,x:[0,1],y:[0,1],m:{l:10,r:10,t:30,b:10}});T(P.root,210,20,'Tree '+(s?'B':'A')+': grown on half '+(s?'B':'A')+' (80 points)','lab');
      treeBoxes(t,99,(nd,b)=>{const rc=P.rect(b[0],b[2],b[1],b[3],nd.p1>=0.5?'fb':'fo');rc.setAttribute('opacity','0.3');rc.setAttribute('style','stroke:#fff;stroke-width:1')});
      if(t.L){if(t.j===0)P.line(t.t,0,t.t,1,'ln sk');else P.line(0,t.t,1,t.t,'ln sk')}
      P.fn(x=>0.5+0.22*Math.sin(2*Math.PI*x),'ln thin sk dash',0,1);halves[s].forEach(p=>P.dot(p[0],p[1],3.8,'pt '+(p[2]?'fb':'fo')))});
    setR(root,'ra',rootQ(trees[0]));setR(root,'rb',rootQ(trees[1]));setR(root,'dis',fmt(100*dis/(N*N),0)+' %')}
  root.querySelector('[data-k="go"]').addEventListener('click',draw);draw()};

/* Pruning: a branch collapsed into one leaf */
FIG['prune']=root=>{const svg=initSvg(svgOf(root),620,250);const bw=66,bh=30;
  const bx=(x,y,t,fill)=>{E('rect',{x:x-bw/2,y:y-bh/2,width:bw,height:bh,rx:6,fill:fill||'#fff',style:'stroke:#404040;stroke-width:1.2'},svg);T(svg,x,y+5,t,'')};
  const L=(a,b,c,d)=>E('line',{x1:a,y1:b+bh/2,x2:c,y2:d-bh/2,class:'ln thin sk'},svg);
  E('ellipse',{cx:240,cy:195,rx:88,ry:52,fill:'#ffc000','fill-opacity':0.3},svg);
  L(130,30,70,95);L(130,30,190,95);L(190,95,140,160);L(190,95,240,160);L(240,160,200,225);L(240,160,280,225);
  bx(130,30,'root');bx(70,95,'leaf','#e2f0d9');bx(190,95,'node');bx(140,160,'leaf','#e2f0d9');bx(240,160,'node');bx(200,225,'leaf','#e2f0d9');bx(280,225,'leaf','#e2f0d9');
  arrowPx(svg,334,128,380,128,'ln sk','fk');T(svg,357,114,'prune','','middle');
  L(470,30,410,95);L(470,30,530,95);L(530,95,480,160);L(530,95,580,160);
  bx(470,30,'root');bx(410,95,'leaf','#e2f0d9');bx(530,95,'node');bx(480,160,'leaf','#e2f0d9');bx(580,160,'leaf','#ffc000')};
})();
