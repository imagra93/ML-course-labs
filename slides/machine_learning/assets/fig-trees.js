/* Figures for 06_decision_trees.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,q,setV,setR,svgOf,waveData,buildTree,treeProb,treeBoxes}=lib;
const H=a=>{const n=a.length;if(!n)return 0;const c={};a.forEach(v=>c[v]=(c[v]||0)+1);return -Object.values(c).reduce((s,k)=>s+(k/n)*Math.log2(k/n),0)};
const G=a=>{const n=a.length;if(!n)return 0;const c={};a.forEach(v=>c[v]=(c[v]||0)+1);return 1-Object.values(c).reduce((s,k)=>s+(k/n)**2,0)};
FIG['tree-example']=root=>{const svg=initSvg(svgOf(root),560,400);
  const nd=(x,y,t)=>{E('ellipse',{cx:x,cy:y,rx:76,ry:20,class:'fw',style:'stroke:#404040;stroke-width:1.4'},svg);T(svg,x,y+5,t,'lab')};
  const lf=(x,y,buy)=>{E('circle',{cx:x,cy:y,r:26,fill:buy?'#92d050':'#e0443e',style:'stroke:#404040;stroke-width:1.2'},svg);T(svg,x,y+5,buy?'Buy':"Don't",'lab').style.fill=buy?'#000':'#fff'};
  const ed=(x1,y1,x2,y2,l)=>{E('line',{x1:x1,y1:y1+20,x2:x2,y2:y2-24,class:'ln thin sk'},svg);T(svg,(x1+x2)/2+(x2<x1?-8:8),(y1+y2)/2+6,l,'',x2<x1?'end':'start')};
  ed(280,36,140,120,'yes');ed(280,36,420,120,'no');ed(140,120,60,230,'yes');ed(140,120,220,220,'no');ed(420,120,340,220,'yes');ed(420,120,500,230,'no');ed(220,220,160,330,'yes');ed(220,220,280,330,'no');ed(340,220,340,330,'yes');ed(340,220,430,330,'no');
  nd(280,36,'Colour = Red');nd(140,120,'Model > 2010');nd(420,120,'Colour = Yellow');nd(220,220,'Mileage < 50,000 km');nd(340,220,'Make = Ferrari');
  lf(60,236,1);lf(500,236,0);lf(160,340,1);lf(280,340,0);lf(340,340,1);lf(430,340,0);T(svg,280,392,'Internal nodes ask one question about one feature; leaves hold the prediction.','','middle')};
FIG['part']=root=>{const r=rng(3);const P=Plot(svgOf(root),{w:500,h:380,x:[0,1],y:[0,1],m:{l:44,r:14,t:14,b:40}});P.axes({xt:[0,0.33,0.66,1],yt:[0,0.3,0.6,1],xl:'feature x₁ (e.g. passenger class)',yl:'feature x₂ (e.g. age)'});
  const regs=[[0,0.33,0,0.3,0.85],[0,0.33,0.3,1,0.6],[0.33,0.66,0,1,0.45],[0.66,1,0,0.3,0.4],[0.66,1,0.3,1,0.15]];
  regs.forEach(([a,b,c,d,p])=>{const rc=P.rect(a,c,b,d,p>0.5?'fbs':'fos',P.bg);P.text((a+b)/2,(c+d)/2,'P(1) = '+p.toFixed(2),'lab','middle',0,5,P.bg);for(let i=0;i<22;i++){const x=a+(b-a)*r(),y=c+(d-c)*r();P.dot(x,y,3,r()<p?'fb':'fo')}});
  [[0.33,0,0.33,1],[0.66,0,0.66,1],[0,0.3,0.33,0.3],[0.66,0.3,1,0.3]].forEach(l=>P.line(l[0],l[1],l[2],l[3],'ln sk'))};
FIG['entropy']=root=>{const P=Plot(svgOf(root),{w:460,h:320,x:[0,1],y:[0,1.08],m:{l:44,r:14,t:14,b:40}});P.axes({xt:[0,0.25,0.5,0.75,1],yt:[0,0.5,1],xl:'Pr(X = 1)',yl:'impurity'});
  P.fn(p=>(p<=0||p>=1)?0:-(p*Math.log2(p)+(1-p)*Math.log2(1-p)),'ln sb',0,1,400);P.fn(p=>2*p*(1-p),'ln sr dash');P.fn(p=>Math.min(p,1-p),'ln thin sm');
  P.text(0.5,1.0,'entropy H','', 'start',8,-4);P.text(0.5,0.5,'Gini 2p(1−p)','', 'start',8,-4);P.text(0.72,0.2,'misclassification','', 'start')};
FIG['split']=root=>{const lab=['A','A','A','B','A','B','B','B'];let crit='gini';
  const svg=initSvg(svgOf(root),520,370);const P=Plot(svg,{at:[0,0],w:520,h:130,x:[0.4,8.6],y:[-1,1],m:{l:20,r:20,t:10,b:30}});
  const Q=Plot(svg,{at:[0,140],w:520,h:230,x:[0.9,7.6],y:[0,0.55],m:{l:44,r:20,t:14,b:36}});Q.axes({xt:[1.5,2.5,3.5,4.5,5.5,6.5,7.5],yt:[0,0.25,0.5],fx:v=>'≤'+v,xl:'split threshold',yl:'gain'});
  const inp=q(root,'s');const btns=root.querySelectorAll('.seg button');
  function draw(){const f=crit==='gini'?G:H;const k=+inp.value;setV(root,'s',fmt(k+0.5,1));const st=[];for(let j=1;j<=7;j++){const L=lab.slice(0,j),R=lab.slice(j);const w=(j/8)*f(L)+((8-j)/8)*f(R);st.push({j:j,l:f(L),r:f(R),w:w,d:f(lab)-w})}
    const s=st[k-1];P.clear();Q.clear();P.rect(0.4,-1,k+0.5,1,'fbs');P.rect(k+0.5,-1,8.6,1,'fos');P.line(k+0.5,-1,k+0.5,1,'ln sk');
    lab.forEach((l,i)=>{P.dot(i+1,0,15,l==='A'?'fb':'fo');P.text(i+1,0,l,'lab','middle',0,5).style.fill='#fff';P.text(i+1,-1,'x='+(i+1),'', 'middle',0,18)});
    st.forEach(z=>Q.rect(z.j+0.5-0.3,0,z.j+0.5+0.3,Math.max(z.d,0.003),z.j===k?'fgr':'fbs'));Q.text(k+0.5,s.d,fmt(s.d,3),'lab','middle',0,-6);
    setR(root,'root',fmt(f(lab),3));setR(root,'gl',fmt(s.l,3));setR(root,'gr',fmt(s.r,3));setR(root,'w',fmt(s.w,3));setR(root,'d',fmt(s.d,3))}
  btns.forEach(b=>b.addEventListener('click',()=>{crit=b.dataset.c;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));inp.addEventListener('input',draw);draw()};
FIG['ig-split']=root=>{const r=rng(8);const pts=[];const cls=['fr','fb','fgr','fy'];
  for(let i=0;i<120;i++){const x=r(),y=r();let c;if(x<0.45)c=y<0.45?2:1;else c=y<0.5?(r()<0.6?0:3):3;if(r()<0.1)c=Math.floor(r()*4);pts.push([x,y,c])}
  const svg=initSvg(svgOf(root),960,330);const par=H(pts.map(p=>p[2]));
  [['Before the split',null],['Split 1: x₂ ≤ 0.5',[1,0.5]],['Split 2: x₁ ≤ 0.45',[0,0.45]]].forEach(([lab,sp],k)=>{
    const P=Plot(svg,{at:[k*320,0],w:300,h:260,x:[0,1],y:[0,1],m:{l:10,r:10,t:30,b:10}});P.axes({grid:false});T(P.root,150,20,lab,'lab');
    if(sp){if(sp[0]===1){P.rect(0,0,1,sp[1],'fbs');P.line(0,sp[1],1,sp[1],'ln sk dash')}else{P.rect(0,0,sp[1],1,'fbs');P.line(sp[1],0,sp[1],1,'ln sk dash')}}
    pts.forEach(p=>P.dot(p[0],p[1],3.4,cls[p[2]]));
    let txt='entropy H(S) = '+fmt(par,2)+' bits';if(sp){const L=pts.filter(p=>p[sp[0]]<=sp[1]).map(p=>p[2]),R=pts.filter(p=>p[sp[0]]>sp[1]).map(p=>p[2]);const ig=par-(L.length/pts.length)*H(L)-(R.length/pts.length)*H(R);txt='Information gain = '+fmt(ig,2)}
    T(P.root,150,290,txt,'lab big')})};
FIG['tree-depth']=root=>{const tr=waveData(160,3,0.12),te=waveData(500,4,0.12);const T0=buildTree(tr,10);
  const acc=(D,d)=>D.filter(p=>(treeProb(T0,p,d)>=0.5?1:0)===p[2]).length/D.length;const A=[];for(let d=1;d<=10;d++)A.push([d,acc(tr,d),acc(te,d)]);
  const svg=initSvg(svgOf(root),600,380);const P=Plot(svg,{at:[0,0],w:380,h:380,x:[0,1],y:[0,1],m:{l:10,r:10,t:10,b:10}});
  const Q=Plot(svg,{at:[390,0],w:210,h:380,x:[1,10],y:[0.5,1],m:{l:40,r:6,t:10,b:36}});Q.axes({xt:[1,4,7,10],yt:[0.5,0.75,1],xl:'max_depth',yl:'accuracy'});
  Q.path(A.map(a=>[a[0],a[1]]),'ln sb',Q.bg);Q.path(A.map(a=>[a[0],a[2]]),'ln so',Q.bg);const inp=q(root,'d');
  function draw(){const d=+inp.value;setV(root,'d',d);P.clear();let leaves=0;treeBoxes(T0,d,(nd,b)=>{leaves++;const rc=P.rect(b[0],b[2],b[1],b[3],nd.p1>=0.5?'fb':'fo');rc.setAttribute('opacity',(0.1+0.3*Math.abs(nd.p1-0.5)*2).toFixed(2));rc.setAttribute('style','stroke:#fff;stroke-width:1')});
    P.fn(x=>0.5+0.22*Math.sin(2*Math.PI*x),'ln thin sk dash',0,1);tr.forEach(p=>P.dot(p[0],p[1],4,'pt '+(p[2]?'fb':'fo')));Q.clear();Q.line(d,0.5,d,1,'ln thin sm dash');Q.dot(d,A[d-1][1],5,'fb');Q.dot(d,A[d-1][2],5,'fo');
    setR(root,'l',leaves);setR(root,'tr',fmt(A[d-1][1],3));setR(root,'te',fmt(A[d-1][2],3))}inp.addEventListener('input',draw);draw()};
FIG['prune']=root=>{const svg=initSvg(svgOf(root),560,230);const box=(x,y,t,c)=>{E('rect',{x:x-46,y:y-16,width:92,height:32,rx:6,fill:c||'#fff',style:'stroke:#404040;stroke-width:1.2'},svg);T(svg,x,y+5,t,'')};
  const L=(a,b,c,d)=>E('line',{x1:a,y1:b,x2:c,y2:d,class:'ln thin sk'},svg);
  L(130,30,70,90);L(130,30,190,90);L(190,90,150,150);L(190,90,235,150);L(235,150,200,205);L(235,150,265,205);
  box(130,30,'root');box(70,90,'leaf','#e2f0d9');box(190,90,'node');box(150,150,'leaf','#e2f0d9');E('ellipse',{cx:235,cy:178,rx:62,ry:58,fill:'#ffc000','fill-opacity':0.35},svg);box(235,150,'node');box(200,205,'leaf','#e2f0d9');box(265,205,'leaf','#e2f0d9');
  arrowPx(svg,305,120,345,120,'ln sk','fk');T(svg,325,105,'prune','','middle');
  L(430,30,370,90);L(430,30,490,90);L(490,90,450,150);L(490,90,530,150);box(430,30,'root');box(370,90,'leaf','#e2f0d9');box(490,90,'node');box(450,150,'leaf','#e2f0d9');box(530,150,'leaf','#ffc000')};
})();
