/* Figures for extra/10_conformal.html (uncertainty and conformal prediction). Uses ../assets/figures.js (MLFIG), ../neural_networks/assets/nn-core.js (MLNN)
   and conformal-data.js (CPDATA: every number of the lab, exported from the executed notebook). Widgets that compute in JS (pinball loss, Bayesian
   linear regression, the Beta distribution of the coverage) say so in their captions. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,q,setV,svgOf}=lib;const {TT,box,stepper,segs}=window.MLNN;
const D=window.CPDATA;
const C={blue:'#4472c4',orange:'#ed7d31',green:'#548235',lgreen:'#70ad47',purple:'#7030a0',lpurple:'#8e5fc0',red:'#c00000',gray:'#7f7f7f',lgray:'#9aa5b8',gold:'#bf9000'};
const MC={abs:'#70ad47',norm:'#4472c4',cqr:'#8e5fc0'};
const nf=(v,d)=>{d=d===undefined?2:d;if(Math.abs(v)<0.5*Math.pow(10,-d))v=0;return v.toFixed(d).replace('-','−')};
const halo=t=>{t.setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:6px;stroke-linejoin:round');return t};
function band(P,xs,lo,hi,fill,op,g){const pts=xs.map((x,i)=>[x,hi[i]]).concat(xs.map((x,i)=>[x,lo[i]]).reverse());const p=P.poly(pts,'',g||P.bgc);p.setAttribute('fill',fill);p.setAttribute('fill-opacity',op===undefined?0.25:op);return p}
function curve(P,xs,ys,stroke,w,dash,g){const p=P.path(xs.map((x,i)=>[x,ys[i]]),'ln',g);p.style.stroke=stroke;p.style.strokeWidth=w||2.5;if(dash)p.style.strokeDasharray=dash;return p}
function seg(P,xa,ya,xb,yb,stroke,w,dash,g){const l=P.line(xa,ya,xb,yb,'ln',g);l.style.stroke=stroke;l.style.strokeWidth=w||2;if(dash)l.style.strokeDasharray=dash;return l}
function dots(P,xs,ys,r,fill,op,g){xs.forEach((x,i)=>{const c=P.dot(x,ys[i],r,'',g);c.setAttribute('fill',fill);c.setAttribute('fill-opacity',op===undefined?0.6:op)})}
function lineS(svg,x1,y1,x2,y2,c,w,dash){return E('line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:c,'stroke-width':w||1.5,'stroke-dasharray':dash||''},svg)}
function onInput(root,k,draw){const inp=q(root,k);inp.addEventListener('input',draw);draw();return inp}
/* legend rows: [colour, label, kind] with kind = band | line | dash | dot */
function legend(svg,x,y,items,dy,bg){dy=dy||21;if(bg)E('rect',{x:x-8,y:y-16,width:bg,height:items.length*dy+8,rx:4,fill:'#fff','fill-opacity':0.9,stroke:'#d0d0d0'},svg);items.forEach(([c,t,k],i)=>{const yy=y+i*dy;
  if(k==='band')E('rect',{x:x,y:yy-7,width:22,height:12,fill:c,'fill-opacity':0.35,stroke:c},svg);
  else if(k==='dot')E('circle',{cx:x+11,cy:yy-1,r:5,fill:c},svg);
  else lineS(svg,x,yy-1,x+22,yy-1,c,k==='dash'?1.6:2.6,k==='dash'?'6 4':'');
  T(svg,x+30,yy+4,t,'','start')})}
const lerp=(xs,ys,x)=>{if(x<=xs[0])return ys[0];for(let i=1;i<xs.length;i++)if(x<=xs[i]){const t=(x-xs[i-1])/(xs[i]-xs[i-1]);return ys[i-1]+t*(ys[i]-ys[i-1])}return ys[ys.length-1]};
const kOf=(n,a)=>Math.ceil((n+1)*(1-a)-1e-9);
const trueLo=D.f.map((f,i)=>f-1.645*D.sig[i]),trueHi=D.f.map((f,i)=>f+1.645*D.sig[i]);
const normLo=D.mu.map((m,i)=>m-D.q_norm*D.sd[i]),normHi=D.mu.map((m,i)=>m+D.q_norm*D.sd[i]);
/* a 28x28 image from hex digits, dark = bright pixel (as in the notebook, cmap gray_r) */
function img(svg,x0,y0,hex,ps){E('rect',{x:x0,y:y0,width:28*ps,height:28*ps,fill:'#fff',stroke:'#bfbfbf'},svg);
  for(let i=0;i<784;i++){const v=parseInt(hex[i],16);if(!v)continue;const g=Math.round(255*(1-v/15));E('rect',{x:x0+(i%28)*ps,y:y0+Math.floor(i/28)*ps,width:ps+0.3,height:ps+0.3,fill:'rgb('+g+','+g+','+g+')'},svg)}}

/* ---------- where we are: a point, an interval, a set ---------- */
FIG['cp-where']=root=>{const svg=initSvg(svgOf(root),1160,230);const W=376;const two=D.two[1];const lo=two.mu-D.q_norm*two.sd,hi=two.mu+D.q_norm*two.sd;
  const panel=(k,title)=>{const x0=k*392;E('rect',{x:x0+4,y:4,width:W,height:222,rx:8,fill:'#fafafa',stroke:'#d0d0d0'},svg);T(svg,x0+4+W/2,26,title,'lab');return x0};
  [0,1].forEach(k=>{const x0=panel(k,k?'a 90% prediction interval':'a point prediction');
    const P=Plot(svg,{at:[x0+4,30],w:W,h:194,x:[0,5],y:[-2.5,5],m:{l:16,r:16,t:6,b:12}});
    dots(P,D.tex.slice(0,220),D.tey.slice(0,220),2.2,C.lgray,0.55);
    if(k)band(P,D.xg,normLo,normHi,C.blue,0.16);
    curve(P,D.xg,D.mu,C.blue,2.2);
    if(k){seg(P,two.x,lo,two.x,hi,C.orange,4);[lo,hi].forEach(v=>seg(P,two.x-0.12,v,two.x+0.12,v,C.orange,3))}
    const d=P.dot(two.x,two.mu,6,'');d.setAttribute('fill',C.orange);d.setAttribute('stroke','#fff');
    halo(P.text(two.x,two.mu,k?'90%: ['+nf(lo)+', '+nf(hi)+']':'ŷ = '+nf(two.mu),'lab','end',-12,5))});
  const x0=panel(2,'a 95% prediction set');const e=D.ex[1];img(svg,x0+30,52,e.img,5);
  T(svg,x0+200,90,'true class: '+D.classes[e.y],'','start');T(svg,x0+200,124,'set:','lab','start');
  e.lac.forEach((c,i)=>T(svg,x0+200,150+i*24,'· '+D.classes[c]+' ('+nf(e.p[c],2)+')','lab','start'))};

/* ---------- a number is not enough: the same prediction, two intervals ---------- */
FIG['cp-two']=root=>{const P=Plot(svgOf(root),{w:620,h:370,x:[0,5],y:[-2.5,5.2],m:{l:44,r:14,t:16,b:40}});
  P.axes({xt:[0,1,2,3,4,5],yt:[-2,0,2,4],xl:'x',yl:'y'});
  dots(P,D.tex,D.tey,2.4,C.lgray,0.5);band(P,D.xg,normLo,normHi,C.blue,0.13);curve(P,D.xg,D.mu,C.blue,2.4);
  const y0=D.two[0].mu;seg(P,0,y0,5,y0,C.gray,1.3,'5 4');
  D.two.forEach((t,j)=>{const lo=t.mu-D.q_norm*t.sd,hi=t.mu+D.q_norm*t.sd;seg(P,t.x,lo,t.x,hi,C.orange,5);[lo,hi].forEach(v=>seg(P,t.x-0.1,v,t.x+0.1,v,C.orange,3));
    const d=P.dot(t.x,t.mu,6.5,'');d.setAttribute('fill',C.orange);d.setAttribute('stroke','#fff');
    const lab=j?['x = '+nf(t.x),'ŷ = '+nf(t.mu)+', 90%: ['+nf(lo)+', '+nf(hi)+']']:['x = '+nf(t.x,1),'ŷ = '+nf(t.mu)+', 90%: ['+nf(lo)+', '+nf(hi)+']'];
    const yy=j?hi+0.75:hi+1.2;halo(P.text(t.x,yy,lab[0],'lab',j?'end':'start',j?-6:-10,0));halo(P.text(t.x,yy,lab[1],'',j?'end':'start',j?-6:-10,18))});
  halo(P.text(2.55,y0,'same prediction','', 'middle',0,-7));
  T(P.top,330,14,'band: 90% conformal interval with normalised scores (lab, section 6)','')};

/* ---------- two kinds of uncertainty ---------- */
FIG['cp-kinds']=root=>{const svg=initSvg(svgOf(root),1160,290);
  const A=Plot(svg,{at:[0,0],w:560,h:290,x:[0,5],y:[-2.5,5.5],m:{l:44,r:10,t:30,b:40}});A.axes({xt:[0,1,2,3,4,5],yt:[-2,0,2,4],xl:'x',yl:'y'});
  band(A,D.xg,trueLo,trueHi,C.lgreen,0.2);dots(A,D.trx,D.try_,2.4,C.gray,0.5);curve(A,D.xg,D.f,'#1f1f1f',2.2);
  T(A.top,302,16,'aleatoric: the noise of y given x (true 90% band)','lab');
  halo(A.text(1,3.6,'sd ≈ '+D.R.sd_x1+' near x = 1','', 'middle'));halo(A.text(4.05,-2.1,'sd ≈ '+D.R.sd_x4+' near x = 4','', 'middle'));
  const B=Plot(svg,{at:[590,0],w:570,h:290,x:[-1.5,6.5],y:[-4,6],m:{l:44,r:10,t:30,b:40}});B.axes({xt:[-1,0,1,2,3,4,5,6],yt:[-4,-2,0,2,4,6],xl:'x',yl:'y'});
  [[-1.5,0],[5,6.5]].forEach(([a,b])=>{const r=B.rect(a,-4,b,6,'',B.bgc);r.setAttribute('fill','#ececec')});
  dots(B,D.trx,D.try_,2.2,C.gray,0.45);D.ens.forEach(m=>curve(B,D.xe,m,C.blue,1.6));
  T(B.top,306,16,'epistemic: 5 networks disagree where there are no data','lab');
  halo(B.text(-0.75,4.9,'no data','', 'middle'));halo(B.text(5.75,-3.3,'no data','', 'middle'));
  halo(B.text(-1.4,-3.3,'epistemic sd '+D.R.epi_m15+' at x = −1.5','', 'start'));halo(B.text(2.5,5.1,'≤ '+D.R.epi_in+' inside the data','', 'middle'))};

/* ---------- prediction vs confidence interval ---------- */
FIG['cp-pici']=root=>{const svg=svgOf(root);
  const draw=n=>{const P=Plot(svg,{w:620,h:375,x:[0,5],y:[-2.5,5.5],m:{l:44,r:14,t:30,b:40}});P.axes({xt:[0,1,2,3,4,5],yt:[-2,0,2,4],xl:'x',yl:'y'});
    const b=D.bands[n];const m=n==='100'?100:300;
    band(P,D.xg,b.pi_lo,b.pi_hi,C.orange,0.22);band(P,D.xg,b.ci_lo,b.ci_hi,C.blue,0.55);
    dots(P,D.trx.slice(0,m),D.try_.slice(0,m),2.4,C.gray,0.55);curve(P,D.xg,D.f,'#1f1f1f',1.5,'6 4');
    T(P.top,332,18,'degree-5 polynomial, n = '+n+(n==='1000'?' (300 points shown)':'')+' · mean CI width '+nf(b.ciw,3),'lab');
    legend(svg,60,48,[[C.orange,'90% prediction interval (a new y)','band'],[C.blue,'90% confidence interval (the curve f)','band'],['#1f1f1f','true f','dash']])};
  const cur=segs(root,'n',draw);draw(cur()||'100')};

/* ---------- heteroscedastic network ---------- */
FIG['cp-hetnet']=root=>{const svg=initSvg(svgOf(root),480,400);
  box(svg,14,52,56,40,'x','#e2f0d9',{cls:'lab big'});arrowPx(svg,72,72,104,72,'ln thin sk','fk');
  box(svg,106,40,124,64,'shared trunk\n64 · 64 tanh','#f2f2f2',{cls:''});
  arrowPx(svg,232,62,276,36,'ln thin sk','fk');arrowPx(svg,232,82,276,108,'ln thin sk','fk');
  box(svg,278,16,90,38,'','#dae3f3',{});TT(svg,323,41,'μ̂(x)','lab');box(svg,278,90,90,38,'','#fbe5d6',{});TT(svg,323,115,'log σ̂²(x)','lab');
  arrowPx(svg,370,35,404,62,'ln thin sk','fk');arrowPx(svg,370,109,404,82,'ln thin sk','fk');box(svg,406,52,64,40,'NLL','#fff2cc',{cls:'lab'});
  const P=Plot(svg,{at:[0,150],w:480,h:250,x:[0,5],y:[0,1.45],m:{l:46,r:12,t:28,b:40}});P.axes({xt:[0,1,2,3,4,5],yt:[0,0.5,1],xl:'x',yl:'sd'});
  curve(P,D.xg,D.sig,'#1f1f1f',1.6,'6 4');curve(P,D.xg,D.sd,C.blue,2.6);
  T(P.top,250,16,'lab: the variance head finds the noise level','lab');legend(svg,70,200,[[C.blue,'predicted σ̂(x)','line'],['#1f1f1f','true σ(x)','dash']])};

/* ---------- pinball loss (computed in JS on 200 exponential draws) ---------- */
FIG['cp-pinball']=root=>{const svg=svgOf(root);const r=rng(3);const S=[...Array(200)].map(()=>-Math.log(1-r())).sort((a,b)=>a-b);
  const rho=(u,t)=>Math.max(t*u,(t-1)*u);const risk=(qq,t)=>S.reduce((s,y)=>s+rho(y-qq,t),0)/S.length;
  onInput(root,'t',()=>{const t=+q(root,'t').value;setV(root,'t',t.toFixed(2));initSvg(svg,620,360);
    const A=Plot(svg,{at:[0,0],w:270,h:360,x:[-2,2],y:[0,2],m:{l:48,r:10,t:30,b:40}});A.axes({xt:[-2,-1,0,1,2],yt:[0,0.5,1,1.5,2],xl:'residual u = y − q',yl:'ρτ(u)'});
    A.fn(u=>rho(u,0.5),'ln thin sm dash');const pl=A.fn(u=>rho(u,t),'ln sb');
    T(A.top,145,18,'pinball loss, τ = '+t.toFixed(2),'lab');halo(A.text(1.9,Math.min(1.85,rho(1.9,t)),'slope τ','', 'end',-4,-10));halo(A.text(-1.9,Math.min(1.85,rho(-1.9,t)),'slope 1 − τ','', 'start',4,-10));
    const B=Plot(svg,{at:[280,0],w:340,h:360,x:[0,4],y:[0,2.2],m:{l:40,r:10,t:30,b:40}});B.axes({xt:[0,1,2,3,4],yt:[0,0.5,1,1.5,2],xl:'constant prediction q',yl:'mean loss'});
    const hb=new Array(40).fill(0);S.forEach(y=>{if(y<4)hb[Math.floor(y/0.1)]++});hb.forEach((c,i)=>{const rr=B.rect(i*0.1,0,(i+1)*0.1,c/S.length*8,'',B.bgc);rr.setAttribute('fill','#d9d9d9')});
    B.fn(qq=>risk(qq,t),'ln sb',0,4,160);let best=S[0],bv=1e9;S.forEach(qq=>{const v=risk(qq,t);if(v<bv){bv=v;best=qq}});
    const emp=S[Math.ceil(S.length*t-1e-9)-1];seg(B,best,0,best,2.2,C.red,1.6,'5 4');const d=B.dot(best,bv,5.5,'');d.setAttribute('fill',C.red);
    halo(B.text(0.08,2.06,'argmin = '+nf(best),'lab','start',0,0));halo(B.text(0.08,1.9,qtxt(t,emp),'','start',0,0));
    T(B.top,195,18,'200 draws of an exponential (grey)','lab')})};
const qtxt=(t,emp)=>'sample '+Math.round(t*100)+'% quantile = '+nf(emp);

/* ---------- deep ensemble and MC dropout ---------- */
FIG['cp-ens']=root=>{const svg=svgOf(root);
  const draw=v=>{initSvg(svg,620,375);
    if(v==='members'){const P=Plot(svg,{at:[0,0],w:620,h:375,x:[-1.5,6.5],y:[-5,7],m:{l:44,r:12,t:30,b:40}});P.axes({xt:[-1,0,1,2,3,4,5,6],yt:[-4,-2,0,2,4,6],xl:'x (grey: no training data)',yl:'y'});
      [[-1.5,0],[5,6.5]].forEach(([a,b])=>{const r=P.rect(a,-5,b,7,'',P.bg);r.setAttribute('fill','#ececec')});
      const mu=D.xe.map((_,i)=>D.ens.reduce((s,m)=>s+m[i],0)/5),tot=D.xe.map((_,i)=>Math.sqrt(D.ale[i]**2+D.epi[i]**2));
      band(P,D.xe,mu.map((m,i)=>m-1.645*tot[i]),mu.map((m,i)=>m+1.645*tot[i]),C.blue,0.13);dots(P,D.trx,D.try_,2.2,C.gray,0.45);D.ens.forEach(m=>curve(P,D.xe,m,C.blue,1.7));
      T(P.top,332,18,'5 networks from 5 random initialisations: means and the mixture’s 90% band','lab')}
    else{const P=Plot(svg,{at:[0,0],w:620,h:375,x:[-1.5,6.5],y:[0,1.45],m:{l:54,r:12,t:30,b:40}});P.axes({xt:[-1,0,1,2,3,4,5,6],yt:[0,0.25,0.5,0.75,1,1.25],xl:'x (grey: no training data)',yl:'standard deviation'});
      [[-1.5,0],[5,6.5]].forEach(([a,b])=>{const r=P.rect(a,0,b,1.45,'',P.bg);r.setAttribute('fill','#ececec')});
      curve(P,D.xg,D.sig,'#1f1f1f',1.4,'6 4');curve(P,D.xe,D.ale,C.blue,2.6);curve(P,D.xe,D.epi,C.red,2.6);curve(P,D.xe,D.epi_mcd,C.orange,2.4,'2 4');
      T(P.top,332,18,'variance = aleatoric + epistemic','lab');
      legend(svg,72,52,[['#1f1f1f','true σ(x)','dash'],[C.blue,'ensemble: aleatoric sd','line'],[C.red,'ensemble: epistemic sd','line'],[C.orange,'MC dropout: epistemic sd','dash']])}};
  const cur=segs(root,'v',draw);draw(cur()||'members')};

/* ---------- Bayesian linear regression (computed in JS) ---------- */
FIG['cp-bayes']=root=>{const svg=svgOf(root);const r=rng(21);const X=[...Array(20)].map(()=>-1+1.3*r());const Y=X.map(x=>0.3+0.8*x+0.3*randn(r));const s2=0.09,tau2=1;
  const zs=[...Array(6)].map(()=>[randn(r),randn(r)]);
  onInput(root,'n',()=>{const n=+q(root,'n').value;setV(root,'n',n);
    let a=1/tau2,b=0,d=1/tau2,u0=0,u1=0;for(let i=0;i<n;i++){a+=1/s2;b+=X[i]/s2;d+=X[i]*X[i]/s2;u0+=Y[i]/s2;u1+=X[i]*Y[i]/s2}
    const det=a*d-b*b,S=[[d/det,-b/det],[-b/det,a/det]],m=[S[0][0]*u0+S[0][1]*u1,S[1][0]*u0+S[1][1]*u1];
    const L00=Math.sqrt(S[0][0]),L10=S[1][0]/L00,L11=Math.sqrt(Math.max(1e-12,S[1][1]-L10*L10));
    const P=Plot(svg,{w:620,h:370,x:[-1.5,1.5],y:[-2.5,2.5],m:{l:44,r:14,t:30,b:40}});P.axes({xt:[-1.5,-1,-0.5,0,0.5,1,1.5],yt:[-2,-1,0,1,2],xl:'x',yl:'y'});
    const xs=[...Array(61)].map((_,i)=>-1.5+i*0.05);const mean=xs.map(x=>m[0]+m[1]*x),ev=xs.map(x=>S[0][0]+2*S[0][1]*x+S[1][1]*x*x);
    band(P,xs,mean.map((v,i)=>v-1.645*Math.sqrt(ev[i]+s2)),mean.map((v,i)=>v+1.645*Math.sqrt(ev[i]+s2)),C.orange,0.18);
    band(P,xs,mean.map((v,i)=>v-1.645*Math.sqrt(ev[i])),mean.map((v,i)=>v+1.645*Math.sqrt(ev[i])),C.blue,0.4);
    zs.forEach(z=>{const w0=m[0]+L00*z[0],w1=m[1]+L10*z[0]+L11*z[1];seg(P,-1.5,w0-1.5*w1,1.5,w0+1.5*w1,C.blue,1,'',P.dyn).style.opacity=0.6});
    curve(P,xs,mean,C.blue,2.6);dots(P,X.slice(0,n),Y.slice(0,n),5,'#1f1f1f',0.9);
    const sdE=Math.sqrt(S[0][0]+2*S[0][1]*1.5+S[1][1]*2.25);
    T(P.top,332,18,(n===0?'the prior: no data yet':n+(n===1?' point':' points'))+' · epistemic sd at x = 1.5: '+nf(sdE,3)+' (noise sd 0.3)','lab');
    legend(svg,60,48,[[C.blue,'posterior of the line: epistemic','band'],[C.orange,'+ noise σ² = 0.09: prediction','band']],21,262)})};

/* ---------- reliability diagram before / after temperature scaling ---------- */
FIG['cp-rel']=root=>{const svg=svgOf(root);
  const draw=m=>{initSvg(svg,620,380);const R=D.rel[m];const P=Plot(svg,{at:[0,0],w:620,h:290,x:[0,1],y:[0,1],m:{l:50,r:14,t:30,b:36}});
    P.axes({xt:[0,0.2,0.4,0.6,0.8,1],yt:[0,0.2,0.4,0.6,0.8,1],yl:'accuracy'});const w=1/15;
    R.n.forEach((c,i)=>{if(!c)return;const x0=i*w;const rb=P.rect(x0,0,x0+w,R.a[i],'',P.bgc);rb.setAttribute('fill',C.blue);rb.setAttribute('fill-opacity',0.75);rb.setAttribute('stroke','#fff');
      const g=P.rect(x0,Math.min(R.a[i],R.c[i]),x0+w,Math.max(R.a[i],R.c[i]),'',P.bgc);g.setAttribute('fill',C.red);g.setAttribute('fill-opacity',0.28);g.setAttribute('stroke',C.red);g.setAttribute('stroke-width',0.8)});
    seg(P,0,0,1,1,'#1f1f1f',1.2,'5 4');
    T(P.top,335,18,(m==='raw'?'before: T = 1':'after temperature scaling: T = '+nf(D.rel.T,2))+' · ECE = '+D.rel[m].ece.toFixed(4),'lab');
    legend(svg,66,50,[[C.blue,'accuracy in the bin','band'],[C.red,'gap to the confidence','band']]);
    halo(T(svg,330,82,'mean confidence '+D.rel.conf[m==='raw'?0:1].toFixed(3)+' · accuracy '+D.rel.acc.toFixed(3),'','start'));
    halo(T(svg,330,104,'test NLL '+D.rel.nll[m==='raw'?0:1].toFixed(3),'','start'));
    const H=Plot(svg,{at:[0,290],w:620,h:90,x:[0,1],y:[0,Math.log10(6000)],m:{l:50,r:14,t:6,b:34}});
    H.axes({xt:[0,0.2,0.4,0.6,0.8,1],yt:[],xl:'confidence (top-label probability)',grid:false});
    R.n.forEach((c,i)=>{if(!c)return;const rr=H.rect(i*w+0.004,0,(i+1)*w-0.004,Math.log10(c+1),'',H.bgc);rr.setAttribute('fill','#bfbfbf')});
    T(H.root,46,40,'images','','end');T(H.root,46,56,'(log)','','end')};
  const cur=segs(root,'m',draw);draw(cur()||'raw')};

/* ---------- exchangeability: the rank of the test score is uniform ---------- */
FIG['cp-ranks']=root=>{const svg=initSvg(svgOf(root),480,330);const r=rng(5);const base=[...Array(10)].map(()=>r()).sort((a,b)=>a-b);
  T(svg,240,22,'10 calibration scores and 1 test score','lab');const ranks=[3,11,7];
  ranks.forEach((rk,j)=>{const y=70+j*70;lineS(svg,84,y,456,y,'#bfbfbf',1.2);T(svg,70,y+5,'draw '+(j+1),'','end');
    const v=rk===1?base[0]-0.05:rk===11?base[9]+0.05:(base[rk-2]+base[rk-1])/2;
    const X=s=>100+340*(s+0.08)/1.16;base.forEach(s=>E('circle',{cx:X(s),cy:y,r:7,fill:C.blue},svg));
    E('circle',{cx:X(v),cy:y,r:8.5,fill:C.orange,stroke:'#fff','stroke-width':1.5},svg);halo(T(svg,X(v),y-14,'rank '+rk,'lab'))});
  T(svg,265,290,'small score ← → large score','');
  T(svg,240,318,'exchangeable ⇒ each of the 11 ranks has probability 1/11','lab')};

/* ---------- split conformal step by step (10 calibration points) ---------- */
FIG['cp-steps']=root=>{const svg=svgOf(root);const W=D.w10;const ord=W.s.map((s,i)=>i).sort((a,b)=>W.s[a]-W.s[b]);const rk=new Array(10);ord.forEach((i,k)=>rk[i]=k+1);
  const srt=ord.map(i=>W.s[i]);const qh=srt[9];
  stepper(root,s=>{initSvg(svg,620,375);
    const P=Plot(svg,{at:[0,0],w:s>=3?380:620,h:375,x:[0,5],y:[-2.6,4.6],m:{l:40,r:10,t:30,b:40}});P.axes({xt:[0,1,2,3,4,5],yt:[-2,0,2,4],xl:'x',yl:'y'});
    if(s===0)dots(P,D.trx,D.try_,2.2,C.lgray,0.5);
    if(s>=4)band(P,D.xg,D.mu.map(m=>m-qh),D.mu.map(m=>m+qh),C.lgreen,0.22);
    curve(P,D.xg,D.mu,C.blue,2.4);
    if(s>=2)W.x.forEach((x,i)=>seg(P,x,W.mu[i],x,W.y[i],C.red,1.8));
    if(s>=1)W.x.forEach((x,i)=>{const d=P.dot(x,W.y[i],5,'');d.setAttribute('fill',C.red);d.setAttribute('stroke','#fff')});
    if(s>=2){const off={5:[-14,4],7:[8,-6]};W.x.forEach((x,i)=>{const o=off[i]||[8,4];halo(P.text(x,W.y[i],String(rk[i]),'lab','middle',o[0],o[1]+(W.y[i]<W.mu[i]?14:-6)))})}
    if(s>=4){const lo=W.mu_new-qh,hi=W.mu_new+qh;seg(P,2,lo,2,hi,C.green,4);[lo,hi].forEach(v=>seg(P,1.9,v,2.1,v,C.green,3));
      const d=P.dot(2,W.mu_new,5.5,'');d.setAttribute('fill',C.green);halo(P.text(2,hi,'C(2) = ['+nf(lo,3)+', '+nf(hi,3)+']','lab','middle',0,-10))}
    const ttl=['the model μ̂, fitted on the training set','10 calibration points it has never seen','scores: |y − μ̂(x)| for each, ranked','','the band μ̂(x) ± q̂ with q̂ = '+nf(qh,3)][s];
    if(s<3)T(P.top,330,18,ttl,'lab');else T(P.top,200,18,s===4?'μ̂(x) ± '+nf(qh,3):'the 10 scores','lab');
    if(s>=3){const B=Plot(svg,{at:[390,0],w:230,h:375,x:[0.4,10.6],y:[0,2.3],m:{l:40,r:8,t:30,b:40}});B.axes({xt:[1,2,3,4,5,6,7,8,9,10],yt:[0,0.5,1,1.5,2],xl:'rank k',grid:false});
      srt.forEach((v,k)=>{const rr=B.rect(k+0.6,0,k+1.4,v,'',B.bgc);rr.setAttribute('fill',k===9?C.lgreen:'#d9d9d9');rr.setAttribute('stroke','#595959')});
      seg(B,0.4,qh,10.6,qh,C.green,1.4,'5 4',B.bgc);halo(B.text(0.6,qh,'q̂ = s(10) = '+nf(qh,3),'lab','start',0,-8));T(B.top,124,18,'sorted scores','lab')}})};

/* ---------- the (n+1) quantile: alpha slider ---------- */
FIG['cp-alpha']=root=>{const svg=svgOf(root);const W=D.w10;const srt=W.s.slice().sort((a,b)=>a-b);
  const cov1000=qq=>{const tq=D.test_q;if(qq>=tq[tq.length-1])return 1;for(let i=1;i<tq.length;i++)if(tq[i]>=qq){const t=(qq-tq[i-1])/Math.max(1e-12,tq[i]-tq[i-1]);return (i-1+t)/1000}return 1};
  onInput(root,'a',()=>{const a=+q(root,'a').value/100;setV(root,'a',a.toFixed(2));initSvg(svg,620,375);const k=kOf(10,a);const qh=k>10?Infinity:srt[k-1];
    const B=Plot(svg,{at:[0,0],w:620,h:260,x:[0.4,11.6],y:[0,2.5],m:{l:48,r:14,t:30,b:36}});B.axes({xt:[1,2,3,4,5,6,7,8,9,10,11],fx:v=>v===11?'11 = n+1':String(v),yt:[0,0.5,1,1.5,2],yl:'score',grid:false});
    srt.forEach((v,j)=>{const rr=B.rect(j+0.62,0,j+1.38,v,'',B.bgc);rr.setAttribute('fill',j+1===k?C.lgreen:j+1<k?'#c9dcf0':'#e3e3e3');rr.setAttribute('stroke','#595959')});
    const ghost=B.rect(10.62,0,11.38,2.5,'',B.bgc);ghost.setAttribute('fill',k===11?'#fbe5d6':'#fafafa');ghost.setAttribute('stroke','#bfbfbf');ghost.setAttribute('stroke-dasharray','4 3');
    halo(B.text(11,1.25,'the test','', 'middle',0,0));halo(B.text(11,1.25,'point','', 'middle',0,17));
    if(isFinite(qh)){seg(B,0.4,qh,10.6,qh,C.green,1.4,'5 4',B.bgc);halo(B.text(0.7,qh,'q̂ = '+nf(qh,3),'lab','start',0,-8))}
    T(B.top,332,18,'α = '+a.toFixed(2)+':  k = ⌈11 × '+(1-a).toFixed(2)+'⌉ = ⌈'+(11*(1-a)).toFixed(2)+'⌉ = '+k,'lab');
    const y1=290;T(svg,40,y1,'n = 10:','lab','start');
    T(svg,120,y1,isFinite(qh)?'q̂ = '+nf(qh,3)+', interval at x = 2: ['+nf(W.mu_new-qh,2)+', '+nf(W.mu_new+qh,2)+'], guaranteed coverage '+k+'/11 = '+(k/11).toFixed(3):'k > n: q̂ = +∞, the interval is the whole real line','','start');
    const k1=kOf(1000,a),q1=D.cal1000[k1-1];T(svg,40,y1+30,'n = 1000:','lab','start');
    T(svg,120,y1+30,'k = '+k1+', q̂ = '+nf(q1,3)+', width '+nf(2*q1,2)+', coverage on the 19,000 test points '+cov1000(q1).toFixed(3),'','start');
    T(svg,40,y1+62,'theory: between '+(1-a).toFixed(3)+' and '+Math.min(1,1-a+1/11).toFixed(3)+' (n = 10), '+Math.min(1,1-a+1/1001).toFixed(4)+' (n = 1000)','','start')})};

/* ---------- coverage over calibration sets: Beta(k, n+1-k), simulated in JS ---------- */
const NS=[10,20,50,100,200,500,1000];
function lgam(x){const c=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];let y=x,t=x+5.5;t-=(x+0.5)*Math.log(t);let s=1.000000000190015;for(let j=0;j<6;j++)s+=c[j]/++y;return -t+Math.log(2.5066282746310005*s/x)}
function gam(a,r){const d=a-1/3,c=1/Math.sqrt(9*d);for(;;){let x,v;do{x=randn(r);v=1+c*x}while(v<=0);v=v*v*v;const u=r();if(u<1-0.0331*x*x*x*x||Math.log(u)<0.5*x*x+d*(1-v+Math.log(v)))return d*v}}
FIG['cp-beta']=root=>{const svg=svgOf(root);
  onInput(root,'i',()=>{const n=NS[+q(root,'i').value];setV(root,'i','n = '+n);initSvg(svg,620,375);const k=kOf(n,0.1),a=k,b=n+1-k;
    const lb=lgam(a)+lgam(b)-lgam(a+b);const pdf=x=>x<=0||x>=1?0:Math.exp((a-1)*Math.log(x)+(b-1)*Math.log(1-x)-lb);
    const mean=a/(a+b),sd=Math.sqrt(a*b/((a+b)**2*(a+b+1)));let below=0;const g=20000;for(let i=0;i<g;i++){const x=0.85*(i+0.5)/g;below+=pdf(x)*0.85/g}
    const r=rng(17+n);const N=4000;const hb=new Array(80).fill(0);for(let i=0;i<N;i++){const x1=gam(a,r),x2=gam(b,r);const c=x1/(x1+x2);if(c>=0.6)hb[Math.min(79,Math.floor((c-0.6)/0.005))]++}
    const ymax=Math.max(pdf(Math.min(0.999,(a-1)/(a+b-2)))*1.12,...hb.map(h=>h/N/0.005*1.05));
    const P=Plot(svg,{w:620,h:375,x:[0.6,1],y:[0,ymax],m:{l:46,r:14,t:30,b:40}});P.axes({xt:[0.6,0.7,0.8,0.9,1],yt:[],xl:'coverage of one calibrated 90% interval',yl:'density'});
    hb.forEach((h,i)=>{if(!h)return;const rr=P.rect(0.6+i*0.005,0,0.6+(i+1)*0.005,h/N/0.005,'',P.bgc);rr.setAttribute('fill',C.lgreen);rr.setAttribute('fill-opacity',0.5)});
    P.fn(pdf,'ln',0.6,0.9999,500).style.stroke='#1f1f1f';
    seg(P,0.9,0,0.9,ymax,C.red,1.4,'5 4');seg(P,0.9+1/(n+1),0,0.9+1/(n+1),ymax,C.gold,1.4,'2 3');
    T(P.top,330,18,'n = '+n+': k = '+k+', coverage ~ Beta('+a+', '+b+')','lab');
    const tx=n<=20?72:72;[ 'mean k/(n+1) = '+mean.toFixed(4),'sd = '+sd.toFixed(4),'P(coverage < 0.85) = '+(100*below).toFixed(1)+'%'].forEach((s,j)=>halo(T(svg,tx,60+j*22,s,j?'':'lab','start')));
    legend(svg,72,136,[[C.lgreen,'4,000 simulated calibration sets','band'],['#1f1f1f','Beta density','line'],[C.red,'1 − α = 0.9','dash'],[C.gold,'1 − α + 1/(n+1)','dash']])})};

/* ---------- marginal is not conditional (constant band) ---------- */
function bandPanel(svg,at,w,h,lo,hi,col,inside,title){const P=Plot(svg,{at:at,w:w,h:h,x:[0,5],y:[-2.6,5.4],m:{l:40,r:10,t:30,b:40}});P.axes({xt:[0,1,2,3,4,5],yt:[-2,0,2,4],xl:'x',yl:'y'});
  band(P,D.xg,lo,hi,col,0.25);D.tex.forEach((x,i)=>{const ok=inside(i);const c=P.dot(x,D.tey[i],ok?2.2:3,'');c.setAttribute('fill',ok?C.gray:C.red);c.setAttribute('fill-opacity',ok?0.45:0.9)});
  curve(P,D.xg,trueLo,'#1f1f1f',1.1,'5 4');curve(P,D.xg,trueHi,'#1f1f1f',1.1,'5 4');T(P.top,w/2+15,18,title,'lab');return P}
function binPanel(svg,at,w,h,sets){const P=Plot(svg,{at:at,w:w,h:h,x:[0,5],y:[0.6,1.02],m:{l:44,r:10,t:30,b:40}});P.axes({xt:[0,1,2,3,4,5],yt:[0.6,0.7,0.8,0.9,1],xl:'bin of x',yl:'coverage'});
  const nb=sets.length,bw=0.42/nb*1.0;sets.forEach(([v,c,op],j)=>v.forEach((cv,i)=>{const x0=i*0.5+0.04+j*(0.42/nb);const rr=P.rect(x0,0.6,x0+0.42/nb,cv,'',P.bgc);rr.setAttribute('fill',c);rr.setAttribute('fill-opacity',op===undefined?0.85:op)}));
  seg(P,0,0.9,5,0.9,C.red,1.4,'5 4');return P}
const insideAbs=i=>Math.abs(D.tey[i]-lerp(D.xg,D.mu,D.tex[i]))<=D.q_abs;
const insideNorm=i=>Math.abs(D.tey[i]-lerp(D.xg,D.mu,D.tex[i]))<=D.q_norm*lerp(D.xg,D.sd,D.tex[i]);
const insideCqr=i=>{const y=D.tey[i],x=D.tex[i];return y>=lerp(D.xg,D.q05,x)-D.q_cqr&&y<=lerp(D.xg,D.q95,x)+D.q_cqr};
FIG['cp-condfail']=root=>{const svg=initSvg(svgOf(root),620,360);
  bandPanel(svg,[0,0],330,360,D.mu.map(m=>m-D.q_abs),D.mu.map(m=>m+D.q_abs),MC.abs,insideAbs,'μ̂ ± '+nf(D.q_abs,3)+' (red: misses)');
  const P=binPanel(svg,[335,0],285,360,[[D.cov_bins['constant |y - mu|'],MC.abs]]);T(P.top,157,18,'coverage per bin','lab');
  D.cov_bins['constant |y - mu|'].forEach((v,i)=>{if(i===0||i===9)halo(P.text(i*0.5+0.25,v,v.toFixed(2),'lab','middle',0,-6))})};

/* ---------- adaptive intervals: constant / normalised / CQR ---------- */
FIG['cp-adapt']=root=>{const svg=svgOf(root);
  const M={abs:['constant |y - mu|','constant: μ̂ ± q̂',D.mu.map(m=>m-D.q_abs),D.mu.map(m=>m+D.q_abs),insideAbs],
           norm:['normalised','normalised: μ̂ ± q̂ σ̂(x)',normLo,normHi,insideNorm],
           cqr:['CQR','CQR: [q̂₀.₀₅ − q̂, q̂₀.₉₅ + q̂]',D.q05.map(v=>v-D.q_cqr),D.q95.map(v=>v+D.q_cqr),insideCqr]};
  const draw=m=>{initSvg(svg,620,380);const [key,title,lo,hi,ins]=M[m];
    bandPanel(svg,[0,0],330,380,lo,hi,MC[m],ins,title);
    const sets=[['abs',MC.abs],['norm',MC.norm],['cqr',MC.cqr]].map(([k,c])=>[D.cov_bins[M[k][0]],c,k===m?0.95:0.18]);
    const P=binPanel(svg,[335,0],285,330,sets);T(P.top,157,18,'coverage per bin of x','lab');
    const mg=D.marg[key];T(svg,480,356,'coverage '+mg[0].toFixed(3)+' · mean width '+mg[1].toFixed(2),'lab');
    const v=D.cov_bins[key];T(svg,480,376,'bins: from '+Math.min(...v).toFixed(2)+' to '+Math.max(...v).toFixed(2),'')};
  const cur=segs(root,'m',draw);draw(cur()||'abs')};

/* ---------- California housing ---------- */
FIG['cp-house']=root=>{const svg=initSvg(svgOf(root),620,350);const H=D.house;const lab=['Q1','Q2','Q3','Q4','Q5'];
  const A=Plot(svg,{at:[0,0],w:310,h:330,x:[-0.5,4.5],y:[0.8,1],m:{l:54,r:8,t:30,b:40}});A.axes({xt:[0,1,2,3,4],fx:v=>lab[v],yt:[0.8,0.85,0.9,0.95,1],xl:'income quintile',yl:'coverage'});
  const B=Plot(svg,{at:[310,0],w:310,h:330,x:[-0.5,4.5],y:[0,1.8],m:{l:50,r:8,t:30,b:40}});B.axes({xt:[0,1,2,3,4],fx:v=>lab[v],yt:[0,0.5,1,1.5],xl:'income quintile',yl:'width ($100k)'});
  [['split conformal',MC.abs,-0.2],['CQR',MC.cqr,0.2]].forEach(([k,c,dx])=>{H[k].cov.forEach((v,i)=>{const r=A.rect(i+dx-0.19,0.8,i+dx+0.19,v,'',A.bgc);r.setAttribute('fill',c)});
    H[k].w.forEach((v,i)=>{const r=B.rect(i+dx-0.19,0,i+dx+0.19,v,'',B.bgc);r.setAttribute('fill',c)})});
  seg(A,-0.5,0.9,4.5,0.9,C.red,1.4,'5 4');T(A.top,170,18,'coverage (target 0.9)','lab');T(B.top,170,18,'mean width','lab');
  legend(svg,370,52,[[MC.abs,'split conformal |y − μ̂|','band'],[MC.cqr,'CQR','band']]);
  T(svg,310,346,'poorest (Q1) to richest (Q5) fifth of the 5,640 test districts','')};

/* ---------- prediction sets: LAC and APS ---------- */
FIG['cp-sets']=root=>{const svg=svgOf(root);let ei=0,mth='lac';
  const draw=()=>{initSvg(svg,620,380);const e=D.ex[ei];const ord=e.p.map((p,i)=>i).sort((a,b)=>e.p[b]-e.p[a]);const set=new Set(e[mth]);
    img(svg,14,40,e.img,5);T(svg,84,200,'true: '+D.classes[e.y],'lab');T(svg,84,222,'top-1: '+D.classes[ord[0]],'');
    const x0=300,w=300,X=p=>x0+w*p;T(svg,450,24,'probabilities after temperature scaling','lab');
    for(let j=0;j<10;j++){const c=ord[j],y=40+j*23;const inS=set.has(c);
      E('rect',{x:x0,y:y,width:Math.max(1,w*e.p[c]),height:17,fill:inS?(mth==='lac'?C.blue:C.orange):'#d9d9d9'},svg);
      const t=T(svg,x0-8,y+14,D.classes[c],inS?'lab':'','end');if(c===e.y)t.textContent='► '+D.classes[c];
      if(e.p[c]>=0.01){if(e.p[c]>0.8)T(svg,X(e.p[c])-5,y+14,e.p[c].toFixed(3),'w','end');else halo(T(svg,X(e.p[c])+5,y+14,e.p[c].toFixed(3),'','start'))}}
    lineS(svg,x0,36,x0,272,'#595959',1);
    if(mth==='lac'){const th=1-D.q_lac;lineS(svg,X(th),32,X(th),276,C.red,1.6,'5 4');halo(T(svg,X(th)+4,290,'threshold 1 − q̂ = '+th.toFixed(3),'lab','start'));
      T(svg,14,320,'LAC: every class with probability ≥ '+th.toFixed(3),'','start')}
    else{let cum=0;const y=282;ord.forEach((c,j)=>{const p=e.p[c];E('rect',{x:X(cum),y:y,width:Math.max(0,w*p),height:16,fill:set.has(c)?C.orange:'#d9d9d9',stroke:'#fff','stroke-width':1},svg);cum+=p});
      lineS(svg,X(D.q_aps),y-6,X(D.q_aps),y+22,C.red,2);halo(T(svg,X(D.q_aps)-4,y+38,'q̂ = '+D.q_aps.toFixed(3),'lab','end'));T(svg,x0-8,y+13,'cumulative','','end');
      T(svg,14,320,'APS: add classes until the cumulative mass reaches q̂ (U = '+e.u.toFixed(2)+' at the boundary)','','start')}
    const names=[...set].sort((a,b)=>e.p[b]-e.p[a]).map(c=>D.classes[c]);
    T(svg,14,350,'C(x) = { '+names.join(', ')+' }  ·  '+names.length+(names.length===1?' class':' classes')+(set.has(e.y)?' · covers the true class':' · misses'),'lab','start')};
  segs(root,'i',v=>{ei=+v;draw()});segs(root,'m',v=>{mth=v;draw()});draw()};

/* ---------- set sizes and coverage by class ---------- */
FIG['cp-sizes']=root=>{const svg=initSvg(svgOf(root),1160,285);const N=5000;
  const A=Plot(svg,{at:[0,0],w:470,h:285,x:[-0.5,6.5],y:[0,0.9],m:{l:50,r:10,t:30,b:40}});A.axes({xt:[0,1,2,3,4,5,6],yt:[0,0.2,0.4,0.6,0.8],xl:'set size (number of classes)',yl:'fraction of images'});
  [['lac',C.blue,-0.2],['aps',C.orange,0.2]].forEach(([k,c,dx])=>D.sizes[k].slice(0,7).forEach((v,i)=>{const r=A.rect(i+dx-0.19,0,i+dx+0.19,v/N,'',A.bgc);r.setAttribute('fill',c)}));
  T(A.top,260,18,'95% sets: how many classes?','lab');legend(svg,300,56,[[C.blue,'LAC, mean '+D.set_stats.size_lac.toFixed(2),'band'],[C.orange,'APS, mean '+D.set_stats.size_aps.toFixed(2),'band']]);
  const B=Plot(svg,{at:[490,0],w:670,h:285,x:[-0.5,9.5],y:[0.8,1],m:{l:50,r:10,t:30,b:58}});B.axes({xt:[],yt:[0.8,0.85,0.9,0.95,1],yl:'coverage'});
  D.classes.forEach((c,i)=>T(B.root,B.X(i),250,c,'','middle'));
  [['avg_lac',C.blue,-0.2],['avg_mon',C.lgreen,0.2]].forEach(([k,c,dx])=>D.cls_cov[k].forEach((v,i)=>{const r=B.rect(i+dx-0.19,0.8,i+dx+0.19,v,'',B.bgc);r.setAttribute('fill',c)}));
  seg(B,-0.5,0.95,9.5,0.95,C.red,1.4,'5 4');T(B.top,360,18,'coverage by true class, average of 200 random splits','lab');
  legend(svg,560,268,[[C.blue,'LAC, one threshold','band']]);legend(svg,780,268,[[C.lgreen,'Mondrian: one threshold per class','band']])};

/* ---------- distribution shift ---------- */
FIG['cp-shift']=root=>{const svg=initSvg(svgOf(root),1160,280);const keys=['no shift','X ~ U(3.5, 5)','noise x 1.5'],labs=['no shift','X ~ U(3.5, 5)','noise × 1.5'];
  const A=Plot(svg,{at:[0,0],w:560,h:280,x:[-0.5,2.5],y:[0.5,1],m:{l:50,r:10,t:30,b:40}});A.axes({xt:[0,1,2],fx:v=>labs[v],yt:[0.5,0.6,0.7,0.8,0.9,1],yl:'coverage'});
  [['constant',MC.abs,-0.26],['normalised',MC.norm,0],['CQR',MC.cqr,0.26]].forEach(([m,c,dx])=>keys.forEach((k,i)=>{const v=D.shift[k][m];const r=A.rect(i+dx-0.12,0.5,i+dx+0.12,v,'',A.bgc);r.setAttribute('fill',c)}));
  seg(A,-0.5,0.9,2.5,0.9,C.red,1.4,'5 4');T(A.top,280,18,'regression: 90% intervals calibrated before the shift','lab');
  [[MC.abs,'constant'],[MC.norm,'normalised'],[MC.cqr,'CQR']].forEach(([c,t],j)=>legend(svg,90+j*130,50,[[c,t,'band']]));
  const B=Plot(svg,{at:[600,0],w:560,h:280,x:[0,0.4],y:[0.3,1],m:{l:50,r:10,t:30,b:40}});B.axes({xt:[0,0.1,0.2,0.3,0.4],yt:[0.4,0.6,0.8,1],xl:'pixel noise sd on the test images',yl:'rate'});
  const L=D.noise.levels;curve(B,L,D.noise.cov,C.blue,2.6);curve(B,L,D.noise.acc,C.gray,2,'6 4');L.forEach((x,i)=>{const d=B.dot(x,D.noise.cov[i],4.5,'');d.setAttribute('fill',C.blue)});
  seg(B,0,0.95,0.4,0.95,C.red,1.4,'5 4');T(B.top,280,18,'Fashion-MNIST: 95% LAC sets calibrated on clean images','lab');
  legend(svg,670,214,[[C.blue,'coverage of the sets','line'],[C.gray,'top-1 accuracy','dash']],19)};

/* ---------- adaptive conformal inference ---------- */
FIG['cp-aci']=root=>{const svg=svgOf(root);const A=D.aci;const tx=A.cov.ACI.map((_,i)=>A.t0+i*A.step);const ta=A.alpha.map((_,i)=>500+i*A.step);
  const col={fixed:C.lgreen,rolling:C.orange,ACI:C.blue};
  const draw=v=>{initSvg(svg,620,380);const show=v==='all'?['fixed','rolling','ACI']:[v];
    const P=Plot(svg,{at:[0,0],w:620,h:250,x:[500,3000],y:[0.6,0.97],m:{l:54,r:12,t:30,b:28}});P.axes({xt:[1000,1500,2000,2500,3000],yt:[0.6,0.7,0.8,0.9],yl:'coverage'});
    const g=P.rect(1000,0.6,1500,0.97,'',P.bg);g.setAttribute('fill','#ececec');
    show.forEach(k=>curve(P,tx,A.cov[k],col[k],2.2));seg(P,500,0.9,3000,0.9,C.red,1.3,'5 4');
    T(P.top,335,18,'coverage of the last 200 points'+(v==='all'?'':' · '+v+': '+A.summary[v][0].toFixed(3)+' overall, '+A.summary[v][2].toFixed(3)+' after t = 1500'),'lab');halo(P.text(1250,0.95,'noise ramps up','', 'middle',0,0));
    if(v==='all')legend(svg,66,P.Y(0.77),[[col.fixed,'fixed','line'],[col.rolling,'rolling','line'],[col.ACI,'ACI','line']],18);
    const Q=Plot(svg,{at:[0,250],w:620,h:130,x:[500,3000],y:[0,0.15],m:{l:54,r:12,t:10,b:36}});Q.axes({xt:[1000,1500,2000,2500,3000],yt:[0,0.05,0.1],xl:'time t',yl:'αt'});
    const g2=Q.rect(1000,0,1500,0.15,'',Q.bg);g2.setAttribute('fill','#ececec');seg(Q,500,0.1,3000,0.1,C.red,1.2,'5 4');
    if(show.includes('ACI'))curve(Q,ta,A.alpha,C.blue,1.8);else halo(Q.text(1750,0.075,'α = 0.1 fixed (only ACI moves αt)','', 'middle'))};
  const cur=segs(root,'v',draw);draw(cur()||'fixed')};

/* ---------- using the data better: split, cross-conformal, jackknife+ ---------- */
FIG['cp-cv']=root=>{const svg=initSvg(svgOf(root),480,410);const x0=20,w=440,FIT='#b4c7e7',SC='#a9d18e';
  const cell=(a,b,y,h,c)=>E('rect',{x:x0+a*w,y:y,width:(b-a)*w,height:h,fill:c,stroke:'#fff','stroke-width':1.5},svg);
  T(svg,x0,24,'split conformal: one model','lab','start');cell(0,0.6,34,26,FIT);cell(0.6,1,34,26,SC);T(svg,x0+0.3*w,52,'train','');T(svg,x0+0.8*w,52,'calibrate','');
  T(svg,x0,82,'the calibration points never train the model','','start');
  T(svg,x0,120,'cross-conformal, K = 5: five models','lab','start');
  for(let k=0;k<5;k++)for(let j=0;j<5;j++)cell(j/5,(j+1)/5,130+k*20,17,j===k?SC:FIT);
  T(svg,x0,246,'each fold is scored by the model fitted on the other four','','start');
  T(svg,x0,284,'jackknife+: n models, each leaves one point out','lab','start');
  const jr=[0.06,0.31,0.62,0.93];jr.forEach((a,k)=>{cell(0,1,294+k*16,13,FIT);cell(a,a+0.025,294+k*16,13,SC)});T(svg,x0+w/2,372,'⋯','lab');
  legend(svg,28,398,[[FIT,'fits a model','band']]);legend(svg,220,398,[[SC,'gives the scores','band']])};
})();
