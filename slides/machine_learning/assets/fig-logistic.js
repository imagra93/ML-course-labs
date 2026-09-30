/* Figures for 03_logistic_regression.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,arrow,rng,randn,fmt,equalY,q,setV,setR,svgOf,sig,halfPlane,fitLogit}=lib;
const Phi=x=>{const t=1/(1+0.2316419*Math.abs(x));const d=0.3989423*Math.exp(-x*x/2);const p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return x>0?1-p:p};
const npdf=(x,m)=>Math.exp(-((x-m)**2)/2)/Math.sqrt(2*Math.PI);

FIG['logit-divider']=root=>{const svg=initSvg(svgOf(root),380,300);for(let i=0;i<9;i++)for(let j=0;j<5;j++)E('circle',{cx:170+i*20,cy:30+j*20,r:3.5,fill:'#fde0e0'},svg);
  for(let i=0;i<12;i++)for(let j=0;j<6;j++)if(i+j<12)E('circle',{cx:40+i*8,cy:150+j*8,r:1.4,fill:'#fff'},svg);
  const r=rng(6);for(let i=0;i<24;i++)E('circle',{cx:150+170*r(),cy:150+130*r(),r:5,fill:'#2f5fb0'},svg)};

function tumour(extra){const D=[[0.4,0],[0.9,0],[1.5,0],[2.1,0],[2.6,0],[3.3,1],[3.9,1],[4.6,1],[5.2,1]];if(extra)D.push([11,1]);return D}
function ols(D){const m=D.length;let sx=0,sy=0,sxx=0,sxy=0;D.forEach(([x,y])=>{sx+=x;sy+=y;sxx+=x*x;sxy+=x*y});const b1=(m*sxy-sx*sy)/(m*sxx-sx*sx);return [(sy-b1*sx)/m,b1]}
FIG['why-logit']=root=>{const P=Plot(svgOf(root),{w:600,h:330,x:[0,12],y:[-0.25,1.3],m:{l:40,r:14,t:14,b:40}});P.axes({xt:[0,2,4,6,8,10,12],yt:[0,0.5,1],xl:'tumour size',yl:'y  (1 = malignant)'});
  let extra=false;const btns=root.querySelectorAll('.seg button');
  function draw(){const D=tumour(extra);const [b0,b1]=ols(D);const xs=(0.5-b0)/b1;P.clear();P.rect(0,-0.25,xs,1.3,'fos');P.rect(xs,-0.25,12,1.3,'fbs');
    P.text(xs/2,1.2,'predict benign','', 'middle');P.text((xs+12)/2,1.2,'predict malignant','', 'middle');
    P.line(0,0.5,12,0.5,'ln thin sm dash');P.fn(x=>b0+b1*x,'ln sr');P.line(xs,-0.25,xs,1.3,'ln thin sk');
    D.forEach(([x,y])=>P.dot(x,y,6,'pt '+(y?'fb':'fo')));let wrong=0;D.forEach(([x,y])=>{if((x>=xs?1:0)!==y)wrong++});
    setR(root,'x',fmt(xs,2));setR(root,'w',wrong+' of '+D.length)}
  btns.forEach(b=>b.addEventListener('click',()=>{extra=b.dataset.x==='1';btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));draw()};
FIG['lin-vs-sig']=root=>{const svg=initSvg(svgOf(root),560,250);const D=tumour(false).concat([[3.0,0],[2.9,1]]);const [b0,b1]=ols(D);const w=fitLogit(D.map(d=>[1,d[0]]),D.map(d=>d[1]),0.05);
  [['Linear Regression',x=>b0+b1*x,'predicted y can exceed the 0–1 range'],['Logistic Regression',x=>sig(w[0]+w[1]*x),'predicted y lies within the 0–1 range']].forEach(([lab,f,cap],k)=>{
    const P=Plot(svg,{at:[k*285,0],w:275,h:250,x:[-0.5,6.5],y:[-0.35,1.35],m:{l:30,r:8,t:26,b:30}});P.axes({yt:[0,1],grid:false});T(P.root,150,16,lab,'lab');P.line(-0.5,1,6.5,1,'gr');P.line(-0.5,0,6.5,0,'gr');
    P.fn(f,'ln sr');D.forEach(([x,y])=>P.dot(x,y,4.5,'pt '+(y?'fb':'fo')));T(P.root,150,244,cap,'','middle')})};
FIG['sig-decision']=root=>{const P=Plot(svgOf(root),{w:540,h:320,x:[-6.5,6.5],y:[-0.05,1.1],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[-6,-4,-2,0,2,4,6],yt:[0,0.5,1],xl:'z = θᵀx',yl:'output'});
  P.path([[-6.5,0],[0,0],[0,1],[6.5,1]],'ln thin sm',P.bg);P.fn(sig,'ln sr',-6.5,6.5,240,P.bg);const iz=q(root,'z'),it=q(root,'t');
  function draw(){const z=+iz.value,t=+it.value,p=sig(z);setV(root,'z',fmt(z,1));setV(root,'t',fmt(t));P.clear();P.line(-6.5,t,6.5,t,'ln thin so dash');
    P.line(z,-0.05,z,p,'ln thin sm dash');P.dot(z,p,7,(p>=t?'fb':'fo')+' pt');setR(root,'p',fmt(p,3));setR(root,'y',p>=t?'1':'0')}
  iz.addEventListener('input',draw);it.addEventListener('input',draw);draw()};
FIG['logloss']=root=>{const P=Plot(svgOf(root),{w:520,h:320,x:[0,1],y:[0,6],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[0,0.2,0.4,0.6,0.8,1],yt:[0,2,4,6],xl:'p = h(x)',yl:'log loss'});
  P.fn(p=>-Math.log(p),'ln sb',0.002,1);P.fn(p=>-Math.log(1-p),'ln sr',0,0.998);P.text(0.08,5.5,'y = 1: −log p','', 'start');P.text(0.62,5.5,'y = 0: −log(1 − p)','', 'start')};
FIG['ce-mse']=root=>{const P=Plot(svgOf(root),{w:500,h:300,x:[-8,8],y:[0,1.05],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[-8,-4,0,4,8],yt:[0,0.5,1],xl:'θ (one weight)',yl:'cost (scaled)'});
  const xs=[-3,-2,-1,-0.5,0.5,1,2,3],ys=[0,0,0,1,0,1,1,1];const ce=t=>xs.reduce((s,x,i)=>{const p=Math.min(1-1e-12,Math.max(1e-12,sig(t*x)));return s-(ys[i]*Math.log(p)+(1-ys[i])*Math.log(1-p))},0);
  const ms=t=>xs.reduce((s,x,i)=>s+(sig(t*x)-ys[i])**2,0);const mc=Math.max(ce(-8),ce(8)),mm=Math.max(ms(-8),ms(8));P.fn(t=>ce(t)/mc,'ln sb');P.fn(t=>ms(t)/mm,'ln sr')};
FIG['logit-gd']=root=>{const r=rng(15);const D=[];for(let i=0;i<60;i++){const x=r()*8;D.push([x,r()<sig(1.4*(x-4))?1:0])}const mu=4,sd=2.3;const Z=D.map(d=>[(d[0]-mu)/sd,d[1]]);
  let w0=0,w1=0;const H=[[0,0]];const J=(a,b)=>-Z.reduce((s,[x,y])=>{const p=Math.min(1-1e-12,Math.max(1e-12,sig(a+b*x)));return s+y*Math.log(p)+(1-y)*Math.log(1-p)},0)/Z.length;
  for(let k=0;k<200;k++){let g0=0,g1=0;Z.forEach(([x,y])=>{const e=sig(w0+w1*x)-y;g0+=e;g1+=e*x});w0-=0.5*g0/Z.length;w1-=0.5*g1/Z.length;H.push([w0,w1])}
  const svg=initSvg(svgOf(root),560,300);const P=Plot(svg,{at:[0,0],w:340,h:300,x:[0,8],y:[-0.1,1.1],m:{l:36,r:8,t:12,b:36}});P.axes({xt:[0,2,4,6,8],yt:[0,0.5,1],xl:'x',yl:'P(y = 1 | x)'});
  D.forEach(([x,y])=>P.dot(x,y+0.03*randn(r),4,'pt '+(y?'fb':'fo'),P.bg));const Js=H.map(h=>J(h[0],h[1]));
  const Q=Plot(svg,{at:[340,0],w:220,h:300,x:[0,200],y:[0,0.75],m:{l:40,r:8,t:12,b:36}});Q.axes({xt:[0,100,200],yt:[0,0.25,0.5,0.75],xl:'iteration',yl:'J(θ)'});Q.path(Js.map((v,i)=>[i,v]),'ln sb',Q.bg);
  const inp=q(root,'k');function draw(){const k=+inp.value;setV(root,'k',k);const [a,b]=H[k];P.clear();P.fn(x=>sig(a+b*(x-mu)/sd),'ln sr');Q.clear();Q.dot(k,Js[k],5,'fr');setR(root,'j',fmt(Js[k],3))}
  inp.addEventListener('input',draw);draw()};
FIG['boundary']=root=>{const r=rng(55);const pts=[];for(let i=0;i<150;i++)pts.push([0.35+0.3*randn(r),0.35+0.28*randn(r),0]);for(let i=0;i<150;i++)pts.push([0.95+0.2*randn(r),1.3+0.2*randn(r),1]);
  const w=fitLogit(pts.map(p=>[1,p[0],p[1]]),pts.map(p=>p[2]),0.5);const m={l:44,r:14,t:14,b:40};const xr=[-1,2];
  const P=Plot(svgOf(root),{w:540,h:420,x:xr,y:[-1,2.5],m:m});P.axes({xt:[-1,-0.5,0,0.5,1,1.5,2],yt:[-1,-0.5,0,0.5,1,1.5,2,2.5],xl:'x₁',yl:'x₂'});const inp=q(root,'t');
  function draw(){const t=+inp.value;setV(root,'t',fmt(t));const c=w[0]-Math.log(t/(1-t));P.clear();halfPlane(P,w[1],w[2],c,'fos');halfPlane(P,-w[1],-w[2],-c,'fbs');
    P.path([[xr[0],-(c+w[1]*xr[0])/w[2]],[xr[1],-(c+w[1]*xr[1])/w[2]]],'ln sk dash');pts.forEach(p=>P.dot(p[0],p[1],3,p[2]?'fo':'fb'));
    const pos=pts.filter(p=>sig(w[0]+w[1]*p[0]+w[2]*p[1])>=t).length;setR(root,'n',pos)}
  setR(root,'th','θ = ('+fmt(w[0],1)+', '+fmt(w[1],1)+', '+fmt(w[2],1)+')');inp.addEventListener('input',draw);draw()};
function thrData(){const r=rng(11);const neg=[],pos=[];for(let i=0;i<900;i++)neg.push(sig(-1.5+1.1*randn(r)));for(let i=0;i<100;i++)pos.push(sig(1.1+1.1*randn(r)));return {neg,pos}}
FIG['thr']=root=>{const {neg,pos}=thrData();const B=25,hn=new Array(B).fill(0),hp=new Array(B).fill(0);neg.forEach(s=>hn[Math.min(B-1,Math.floor(s*B))]++);pos.forEach(s=>hp[Math.min(B-1,Math.floor(s*B))]++);
  const ymax=Math.ceil(Math.max(...hn)/20)*20;const P=Plot(root.querySelector('svg[data-k="hist"]'),{w:600,h:240,x:[0,1],y:[0,ymax],m:{l:44,r:14,t:10,b:36}});
  P.axes({xt:[0,0.25,0.5,0.75,1],yt:[0,ymax/2,ymax],xl:'predicted probability of fraud',yl:'claims'});
  for(let b=0;b<B;b++){P.rect(b/B+0.004,0,(b+1)/B-0.004,hn[b],'fo',P.bg).setAttribute('opacity','0.75');P.rect(b/B+0.004,0,(b+1)/B-0.004,hp[b],'fb',P.bg).setAttribute('opacity','0.9')}
  const all=neg.map(s=>[s,0]).concat(pos.map(s=>[s,1])).sort((a,b)=>b[0]-a[0]);const roc=[[0,0]];let tp=0,fp=0;all.forEach(x=>{if(x[1])tp++;else fp++;roc.push([fp/900,tp/100])});
  let auc=0;for(let i=1;i<roc.length;i++)auc+=(roc[i][0]-roc[i-1][0])*(roc[i][1]+roc[i-1][1])/2;
  const Q=Plot(root.querySelector('svg[data-k="roc"]'),{w:420,h:280,x:[0,1],y:[0,1],m:{l:44,r:14,t:10,b:36}});Q.axes({xt:[0,0.5,1],yt:[0,0.5,1],xl:'false positive rate',yl:'true positive rate'});
  Q.line(0,0,1,1,'ln thin sb dash',Q.bg);Q.path(roc,'ln so',Q.bg);Q.text(0.5,0.2,'AUC = '+fmt(auc,3),'lab','start',0,0,Q.bg);const inp=q(root,'t');
  function draw(){const t=+inp.value;setV(root,'t',fmt(t));const TP=pos.filter(s=>s>=t).length,FP=neg.filter(s=>s>=t).length,FN=100-TP,TN=900-FP;
    P.clear();P.rect(t,0,1,ymax,'fgs');P.line(t,0,t,ymax,'ln sk');Q.clear();Q.dot(FP/900,TP/100,7,'fr pt');
    setR(root,'tp',TP);setR(root,'fp',FP);setR(root,'fn',FN);setR(root,'tn',TN);const pr=TP+FP?TP/(TP+FP):NaN;
    setR(root,'acc',fmt((TP+TN)/1000,3));setR(root,'pr',isNaN(pr)?'n/a':fmt(pr,3));setR(root,'rc',fmt(TP/100,3));setR(root,'f1',fmt(2*TP/(2*TP+FP+FN),3));setR(root,'fpr',fmt(FP/900,3))}
  inp.addEventListener('input',draw);draw()};
FIG['pr']=root=>{const {neg,pos}=thrData();const all=neg.map(s=>[s,0]).concat(pos.map(s=>[s,1])).sort((a,b)=>b[0]-a[0]);let tp=0,fp=0;const pr=[];let ap=0,prevR=0;
  all.forEach(x=>{if(x[1])tp++;else fp++;const R=tp/100,Pp=tp/(tp+fp);pr.push([R,Pp]);ap+=(R-prevR)*Pp;prevR=R});
  const P=Plot(svgOf(root),{w:520,h:320,x:[0,1],y:[0,1.02],m:{l:44,r:14,t:14,b:36}});P.axes({xt:[0,0.25,0.5,0.75,1],yt:[0,0.25,0.5,0.75,1],xl:'recall',yl:'precision'});
  P.path(pr,'ln sb');P.line(0,0.1,1,0.1,'ln thin sm dash');P.text(0.98,0.1,'random classifier: precision = 10 % (the positive rate)','', 'end',0,-8);P.text(0.05,0.08,'','');P.text(0.55,0.92,'AP = '+fmt(ap,3),'lab','start')};
FIG['roc-dist']=root=>{const svg=initSvg(svgOf(root),640,300);const P=Plot(svg,{at:[0,0],w:340,h:300,x:[-4,7],y:[0,0.45],m:{l:36,r:8,t:14,b:36}});P.axes({xt:[-4,-2,0,2,4,6],yt:[0,0.2,0.4],xl:'model score',yl:'density'});
  const Q=Plot(svg,{at:[350,0],w:290,h:300,x:[0,1],y:[0,1],m:{l:40,r:8,t:14,b:36}});Q.axes({xt:[0,0.5,1],yt:[0,0.5,1],xl:'FPR',yl:'TPR'});Q.line(0,0,1,1,'ln thin sm dash',Q.bg);
  const id=q(root,'d'),it=q(root,'t');
  function draw(){const d=+id.value,t=+it.value;setV(root,'d',fmt(d,1));setV(root,'t',fmt(t,1));P.clear();Q.clear();
    const pn=[[-4,0]],ps=[[-4,0]];for(let i=0;i<=200;i++){const x=-4+11*i/200;pn.push([x,npdf(x,0)]);ps.push([x,npdf(x,d)])}pn.push([7,0]);ps.push([7,0]);
    P.poly(pn,'fos');P.path(pn.slice(1,-1),'ln thin so');P.poly(ps,'fbs');P.path(ps.slice(1,-1),'ln thin sb');P.line(t,0,t,0.45,'ln sr');P.text(t,0.43,'threshold','', 'start',6,0);
    const roc=[];for(let i=0;i<=200;i++){const u=-6+15*i/200;roc.push([1-Phi(u),1-Phi(u-d)])}Q.path(roc,'ln sk');Q.dot(1-Phi(t),1-Phi(t-d),6,'fr pt');
    setR(root,'auc',fmt(Phi(d/Math.SQRT2),3));setR(root,'tpr',fmt(1-Phi(t-d),2));setR(root,'fpr',fmt(1-Phi(t),2))}
  id.addEventListener('input',draw);it.addEventListener('input',draw);draw()};
/* odds and log-odds as functions of p */
FIG['odds']=root=>{const svg=initSvg(svgOf(root),600,250);
  const P=Plot(svg,{at:[0,0],w:290,h:250,x:[0,1],y:[0,10],m:{l:40,r:10,t:26,b:36}});P.axes({xt:[0,0.25,0.5,0.75,1],yt:[0,1,3,5,9],xl:'probability p',yl:'odds  p / (1 − p)'});T(P.root,165,16,'odds: from 0 to +∞, not symmetric','lab');
  P.fn(p=>p/(1-p),'ln sb',0.001,0.92);P.line(0,1,1,1,'ln thin sm dash');P.dot(0.5,1,5,'fr pt');P.text(0.5,1,'p = 0.5 → odds 1','', 'start',8,-10);P.dot(0.75,3,4,'fk');P.text(0.75,3,'0.75 → 3','', 'end',-8,-4);P.dot(0.9,9,4,'fk');P.text(0.9,9,'0.9 → 9','', 'end',-8,4);P.dot(0.1,1/9,4,'fk');P.text(0.1,1/9,'0.1 → 0.11','', 'start',8,-26);
  const Q=Plot(svg,{at:[305,0],w:295,h:250,x:[0,1],y:[-4.5,4.5],m:{l:40,r:10,t:26,b:36}});Q.axes({xt:[0,0.25,0.5,0.75,1],yt:[-4,-2,0,2,4],xl:'probability p',yl:'log-odds  log(p / (1 − p))'});T(Q.root,168,16,'log-odds: from −∞ to +∞, symmetric','lab');
  Q.fn(p=>Math.log(p/(1-p)),'ln sr',0.011,0.989);Q.line(0,0,1,0,'ln thin sm dash');Q.dot(0.5,0,5,'fr pt');Q.text(0.5,0,'p = 0.5 → 0','', 'start',10,-12);Q.dot(0.9,Math.log(9),4,'fk');Q.text(0.9,Math.log(9),'0.9 → +2.2','', 'end',-8,-4);Q.dot(0.1,-Math.log(9),4,'fk');Q.text(0.1,-Math.log(9),'0.1 → −2.2','', 'start',8,10)};
/* AUC as the probability that a random positive outscores a random negative */
FIG['auc-pairs']=root=>{const r0=rng(21);const neg=[],pos=[];for(let i=0;i<14;i++)neg.push(sig(-1.3+1.1*randn(r0)));for(let i=0;i<7;i++)pos.push(sig(1.0+1.0*randn(r0)));
  let ok=0,tot=0;neg.forEach(a=>pos.forEach(b=>{tot++;if(b>a)ok++;else if(b===a)ok+=0.5}));const auc=ok/tot;const r=rng(5);let n=0,good=0,last=null;
  const P=Plot(svgOf(root),{w:600,h:250,x:[0,1],y:[-1.6,1.6],m:{l:14,r:14,t:30,b:36}});P.axes({xt:[0,0.25,0.5,0.75,1],grid:false,xl:'predicted probability of fraud (model score)'});
  P.line(0,0,1,0,'ax',P.bg);P.text(0,1,'7 fraud claims (y = 1)','lab','start',0,-10,P.bg);P.text(0,-1,'14 legit claims (y = 0)','lab','start',0,22,P.bg);
  neg.forEach((s0,i)=>P.dot(s0,-1+(i%2?0.35:0),6,'pt fo',P.bg));pos.forEach((s0,i)=>P.dot(s0,1-(i%2?0.35:0),6,'pt fb',P.bg));setR(root,'auc',fmt(auc,2));
  function draw(){P.clear();if(last){const [a,b,ia,ib]=last;const ya=-1+(ia%2?0.35:0),yb=1-(ib%2?0.35:0);P.line(a,ya,b,yb,b>a?'ln sg':'ln sr');P.dot(a,ya,9,'nof').setAttribute('style','stroke:#000;stroke-width:2');P.dot(b,yb,9,'nof').setAttribute('style','stroke:#000;stroke-width:2');
      P.text(0.5,1.55,(b>a?'✓ fraud '+fmt(b,2)+' > legit '+fmt(a,2)+': ranked correctly':'✗ fraud '+fmt(b,2)+' < legit '+fmt(a,2)+': ranked wrongly'),'lab','middle')}
    setR(root,'n',n);setR(root,'ok',good);setR(root,'frac',n?fmt(good/n,2):'–')}
  function one(){const ia=Math.floor(r()*neg.length),ib=Math.floor(r()*pos.length);n++;if(pos[ib]>neg[ia])good++;last=[neg[ia],pos[ib],ia,ib]}
  root.querySelector('[data-k="one"]').addEventListener('click',()=>{one();draw()});root.querySelector('[data-k="many"]').addEventListener('click',()=>{for(let i=0;i<200;i++)one();draw()});draw()};
FIG['imbalance']=root=>{const svg=initSvg(svgOf(root),640,230);
  const bars=(x0,title,vals,cols)=>{T(svg,x0+85,18,title,'lab');const mx=950;vals.forEach((v,i)=>{const h=170*v/mx;E('rect',{x:x0+20+i*62,y:200-h,width:48,height:h,fill:cols[i]},svg)});E('line',{x1:x0+10,x2:x0+160,y1:200,y2:200,class:'ax'},svg)};
  bars(0,'Original: 950 vs 50',[950,50],['#4472c4','#ed7d31']);bars(215,'Undersampling',[50,50],['#4472c4','#ed7d31']);bars(430,'Oversampling',[950,950],['#4472c4','#ed7d31']);
  T(svg,40,220,'no fraud','','start');T(svg,106,220,'fraud','','start');T(svg,300,222,'keep 50 of the 950','','middle');T(svg,515,222,'copy the 50 up to 950','','middle')};
FIG['smote']=root=>{const svg=initSvg(svgOf(root),640,234);const r=rng(12);const maj=[],mino=[];for(let i=0;i<34;i++)maj.push([0.1+0.8*r(),0.1+0.8*r()]);for(let i=0;i<7;i++)mino.push([0.3+0.4*r(),0.3+0.4*r()]);
  [['Imbalanced data','',0],['Tomek links','removes close majority points',1],['SMOTE','new points between neighbours',2]].forEach(([lab,sub,k])=>{const P=Plot(svg,{at:[k*215,44],w:205,h:190,x:[0,1],y:[0,1],m:{l:6,r:6,t:6,b:6}});T(P.root,102,-26,lab,'lab','middle');if(sub)T(P.root,102,-8,sub,'','middle');
    maj.forEach(p=>P.dot(p[0],p[1],3.5,'fb'));mino.forEach(p=>P.dot(p[0],p[1],4,'fo'));
    if(k===1)mino.forEach(m=>{let b=null,bd=9;maj.forEach(p=>{const d=Math.hypot(p[0]-m[0],p[1]-m[1]);if(d<bd){bd=d;b=p}});if(bd<0.22){P.line(m[0],m[1],b[0],b[1],'ln thin sk');E('circle',{cx:P.X(b[0]),cy:P.Y(b[1]),r:7,class:'ln thin sk'},P.dyn)}});
    if(k===2)mino.forEach((m,i)=>{const o=mino[(i+2)%mino.length];for(let t=1;t<=2;t++){const a=t/3;P.line(m[0],m[1],o[0],o[1],'ln thin sm dot2');P.dot(m[0]+a*(o[0]-m[0]),m[1]+a*(o[1]-m[1]),3.5,'fr')}})})};
FIG['calib']=root=>{const P=Plot(svgOf(root),{w:460,h:320,x:[0,1],y:[0,1],m:{l:54,r:14,t:14,b:40}});P.axes({xt:[0,0.25,0.5,0.75,1],yt:[0,0.25,0.5,0.75,1],xl:'mean predicted probability (per bin)',yl:'observed positive rate'});
  P.line(0,0,1,1,'ln thin sm dash');const b=[0.05,0.15,0.25,0.35,0.45,0.55,0.65,0.75,0.85,0.95];P.path(b.map(x=>[x,x+0.03*Math.sin(9*x)]),'ln sb');b.forEach(x=>P.dot(x,x+0.03*Math.sin(9*x),4,'fb'));
  P.path(b.map(x=>[x,sig(1.8*(Math.log(x/(1-x))))*0+0.5+0.42*(x-0.5)*0.9]),'ln so');b.forEach(x=>P.dot(x,0.5+0.378*(x-0.5),4,'fo'));
  P.text(0.62,0.9,'calibrated','', 'start');P.text(0.62,0.5,'over-confident','', 'start')};
FIG['homo']=root=>{const svg=initSvg(svgOf(root),520,190);const r=rng(9);[['Homoscedasticity',x=>0.4],['Heteroscedasticity',x=>0.1+1.3*x]].forEach(([lab,sd],k)=>{
  const P=Plot(svg,{at:[k*265,0],w:255,h:190,x:[0,1],y:[-1,3.2],m:{l:10,r:6,t:24,b:10}});P.axes({grid:false});T(P.root,128,16,lab,'lab');P.fn(x=>0.2+2.4*x,'ln sk');for(let i=0;i<40;i++){const x=r();P.dot(x,0.2+2.4*x+sd(x)*randn(r),2.6,'fk')}})};
FIG['steep']=root=>{const P=Plot(svgOf(root),{w:500,h:300,x:[-4,4],y:[-0.05,1.05],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[-4,-2,0,2,4],yt:[0,0.5,1],xl:'z = θᵀx',yl:'g(c·z)'});
  [[1,'ln sm'],[3,'ln sb'],[10,'ln sr']].forEach(([c,cls])=>P.fn(z=>sig(c*z),cls));P.text(-2.6,sig(-2.6),'c = 1','', 'start',4,-10);P.text(-0.9,sig(-2.7),'c = 3','', 'end',-4,0);P.text(0.35,0.98,'c = 10','', 'start',6,6)};
})();
