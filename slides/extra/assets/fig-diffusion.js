/* Figures for extra/07_diffusion.html (diffusion models). Uses ../assets/figures.js (MLFIG), ../neural_networks/assets/nn-core.js (MLNN)
   and diffusion-data.js (DFDATA: the trained toy model and mini U-Net of the notebook, precomputed in Python).
   Everything else (schedules, the 1-D mixture, Langevin on a 2-D mixture, the noised images) is computed here. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,q,setV,setR,svgOf}=lib;const {heat,TT,box,stepper,segs}=window.MLNN;
const D=window.DFDATA;

/* ---------- schedules (as in the notebook: index t = 0..T, beta[0] = 0, abar[0] = 1) ---------- */
const TN=1000;const BETA=[0],ABAR=[1];for(let t=1;t<=TN;t++){BETA.push(1e-4+(0.02-1e-4)*(t-1)/999);ABAR.push(ABAR[t-1]*(1-BETA[t]))}
const ABARC=(()=>{const f=t=>Math.pow(Math.cos((t/TN+0.008)/1.008*Math.PI/2),2);const a=[1];for(let t=1;t<=TN;t++){const b=Math.min(0.999,Math.max(0,1-f(t)/f(t-1)));a.push(a[t-1]*(1-b))}return a})();
const snr=a=>a/(1-a);
/* number formats */
const mn=s=>String(s).replace(/-/g,'−');
const nf=(v,d)=>{d=d===undefined?2:d;if(Math.abs(v)<0.5*Math.pow(10,-d))v=0;return mn(v.toFixed(d))};
const sci=(v,d)=>{if(v===0)return '0';const e=Math.floor(Math.log10(Math.abs(v)));if(e>=-2&&e<4)return nf(v,Math.max(0,d-1-Math.max(e,0)));return mn((v/Math.pow(10,e)).toFixed(1))+'·10'+sup(e)};
const SUP={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};const sup=e=>String(e).split('').map(c=>SUP[c]).join('');
const vec=(a,d)=>'('+a.map(v=>nf(v,d)).join(', ')+')';
const ln=(svg,a,b,c,w,dash)=>E('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:c||'#9aa5b8','stroke-width':w||1.6,'stroke-dasharray':dash||''},svg);
const halo=t=>{t.setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:6px;stroke-linejoin:round');return t};
function onInput(root,k,draw){const inp=q(root,k);inp.addEventListener('input',draw);draw();return inp}
const ARM=['#4472c4','#ed7d31','#70ad47'],ARMS=['#c9d6ee','#f8cbad','#c5e0b4'];

/* ---------- images: hex strings (2 characters per pixel, 0 = black) drawn through a canvas ---------- */
const hexArr=h=>{const n=h.length/2,a=new Float32Array(n);for(let i=0;i<n;i++)a[i]=parseInt(h.substr(2*i,2),16)/255;return a};
function imgEl(svg,x,y,w,vals,o){o=o||{};const n=Math.round(Math.sqrt(vals.length));const cv=document.createElement('canvas');cv.width=n;cv.height=n;const cx=cv.getContext('2d');const id=cx.createImageData(n,n);
  for(let i=0;i<n*n;i++){const v=Math.round(255*Math.max(0,Math.min(1,vals[i])));id.data[4*i]=v;id.data[4*i+1]=v;id.data[4*i+2]=v;id.data[4*i+3]=255}cx.putImageData(id,0,0);
  const im=E('image',{x:x,y:y,width:w,height:w,preserveAspectRatio:'none'},svg);im.setAttribute('href',cv.toDataURL());im.style.imageRendering='pixelated';
  if(o.frame!==false)E('rect',{x:x,y:y,width:w,height:w,fill:'none',stroke:o.stroke||'#7f7f7f','stroke-width':o.sw||1},svg);return im}
const DIG=hexArr(D.digit28);const EPS28=(()=>{const r=rng(7);return Float32Array.from({length:784},()=>randn(r))})();
/* x_t = sqrt(abar) x_0 + sqrt(1 - abar) eps on the [-1, 1] scale, shown back on [0, 1] (clipped) */
const noisy=(vals,ab,eps)=>Float32Array.from(vals,(v,i)=>(Math.sqrt(ab)*(2*v-1)+Math.sqrt(1-ab)*eps[i]+1)/2);

/* ---------- 1-D data: a mixture of two Gaussians with variance close to 1 ---------- */
const MIX={w:[0.4,0.6],m:[-1.15,0.8],s:[0.22,0.3]};
const npdf=(x,m,v)=>Math.exp(-(x-m)*(x-m)/(2*v))/Math.sqrt(2*Math.PI*v);
const pt1=(x,ab)=>MIX.w.reduce((s,w,k)=>s+w*npdf(x,Math.sqrt(ab)*MIX.m[k],ab*MIX.s[k]*MIX.s[k]+1-ab),0);
/* exact score of the noised 1-D mixture */
function score1(x,ab){let num=0,den=0;MIX.w.forEach((w,k)=>{const v=ab*MIX.s[k]*MIX.s[k]+1-ab,m=Math.sqrt(ab)*MIX.m[k];const p=w*npdf(x,m,v);num+=p*(m-x)/v;den+=p});return num/(den||1e-300)}
const X1=(()=>{const r=rng(3);return [...Array(80)].map(()=>{const k=r()<MIX.w[0]?0:1;return {x0:MIX.m[k]+MIX.s[k]*randn(r),e:randn(r)}})})();

/* ---------- where we are: three generative models ---------- */
FIG['df-three']=root=>{const svg=initSvg(svgOf(root),1160,215);const W=386;
  const panel=(k,title,sub,hi)=>{const x0=k*W;E('rect',{x:x0+6,y:4,width:W-12,height:206,rx:8,fill:hi?'#f5f8fd':'#fafafa',stroke:hi?'#4472c4':'#d0d0d0','stroke-width':hi?2:1},svg);T(svg,x0+W/2,28,title,'lab');T(svg,x0+W/2,198,sub,'');return x0};
  const zvec=(x,y)=>{const r=rng(2);for(let i=0;i<6;i++)E('rect',{x:x,y:y+i*13,width:16,height:13,fill:heat(2*r()-1),stroke:'#7f7f7f','stroke-width':0.7},svg);T(svg,x+8,y+96,'z','lab')};
  let x0=panel(0,'VAE (Extra 3)','one decoder pass; trained with an encoder');zvec(x0+44,62);
  arrowPx(svg,x0+68,101,x0+104,101,'ln thin sk','fk');box(svg,x0+108,78,100,46,'decoder','#e2f0d9',{cls:'lab'});arrowPx(svg,x0+212,101,x0+250,101,'ln thin sk','fk');
  imgEl(svg,x0+256,64,74,DIG);T(svg,x0+293,158,'x (often blurry)','');
  x0=panel(1,'GAN (Extra 4)','one generator pass; trained against a critic');zvec(x0+30,62);
  arrowPx(svg,x0+54,101,x0+84,101,'ln thin sk','fk');box(svg,x0+88,80,64,42,'G','#e2f0d9',{cls:'lab'});arrowPx(svg,x0+156,101,x0+184,101,'ln thin sk','fk');
  imgEl(svg,x0+188,68,66,DIG);arrowPx(svg,x0+258,101,x0+284,101,'ln thin sk','fk');box(svg,x0+288,80,64,42,'D','#fbe5d6',{cls:'lab'});T(svg,x0+320,146,'real or fake?','');
  x0=panel(2,'Diffusion (this deck)','',true);TT(svg,x0+W/2,198,'T small steps of one network ε_θ','');const ts=[1000,600,250,0];
  ts.forEach((t,k)=>{const x=x0+26+k*92;imgEl(svg,x,64,62,noisy(DIG,ABAR[t],EPS28));TT(svg,x+31,148,t===1000?'x_T':t===0?'x_0':'x_{'+t+'}','');if(k<3)arrowPx(svg,x+64,95,x+88,95,'ln thin sb','fb')});
};

/* ---------- the idea: a digit through the forward process ---------- */
FIG['df-idea']=root=>{const svg=initSvg(svgOf(root),1160,262);const ts=[0,100,250,500,750,1000];const S=128,gap=(1160-60-6*S)/5;
  ts.forEach((t,k)=>{const x=30+k*(S+gap);imgEl(svg,x,58,S,noisy(DIG,ABAR[t],EPS28));TT(svg,x+S/2,206,t===0?'x_0 (data)':t===1000?'x_T ≈ N(0, I)':'x_{'+t+'}','lab');
    T(svg,x+S/2,228,'ᾱ = '+(t===1000?'0.00004':nf(ABAR[t],t===0?0:3)),'');if(k<5){arrowPx(svg,x+S+8,104,x+S+gap-8,104,'ln thin sm','fm');arrowPx(svg,x+S+gap-8,140,x+S+8,140,'ln thin sb','fb')}});
  const t1=TT(svg,580,30,'forward q(x_t | x_{t−1}): add a little Gaussian noise, 1000 times · fixed, no parameters','lab');t1.style.fill='#595959';
  arrowPx(svg,40,40,1120,40,'ln thin sm','fm');
  arrowPx(svg,1120,246,40,246,'ln sb','fb');halo(TT(svg,580,252,'reverse p_θ(x_{t−1} | x_t): remove a little noise, 1000 times · learned','lab')).style.fill='#1f3864'};

/* ---------- one forward step, on a 1-D mixture ---------- */
FIG['df-1d']=root=>{const svg=svgOf(root);
  onInput(root,'t',()=>{const t=+q(root,'t').value;const ab=ABAR[t];setV(root,'t',t);
    const P=Plot(svg,{w:620,h:330,x:[-3.6,3.6],y:[0,1.05],m:{l:52,r:12,t:30,b:40}});P.axes({xt:[-3,-2,-1,0,1,2,3],yt:[0,0.5,1],xl:'x',yl:'density'});
    P.fn(x=>pt1(x,1),'ln thin sm dash',-3.6,3.6,300,P.bg);P.fn(x=>npdf(x,0,1),'ln thin so dash',-3.6,3.6,200,P.bg);
    const pts=[[-3.6,0]];for(let i=0;i<=300;i++){const x=-3.6+7.2*i/300;pts.push([x,pt1(x,ab)])}pts.push([3.6,0]);P.poly(pts,'fbs');P.fn(x=>pt1(x,ab),'ln sb',-3.6,3.6,300);
    X1.forEach(p=>P.dot(Math.sqrt(ab)*p.x0+Math.sqrt(1-ab)*p.e,0.035,3,'fb'));
    TT(P.top,330,18,'t = '+t+':  x_t = '+nf(Math.sqrt(ab),3)+' x_0 + '+nf(Math.sqrt(1-ab),3)+' ε','lab');
    TT(P.top,P.X(-3.45),P.Y(0.97),'grey dashed: the data p_0','','start');const o=P.text(-3.45,0.88,'orange dashed: N(0, 1)','','start');o.style.fill='#c55a11';const b=TT(P.top,P.X(-3.45),P.Y(0.79),'blue: p_t, the density of x_t','','start');b.style.fill='#1f3864';
    setR(root,'ab',nf(ab,4));setR(root,'sa',nf(Math.sqrt(ab),3));setR(root,'sn',nf(Math.sqrt(1-ab),3))})};

/* ---------- schedules: abar_t, linear vs cosine, and the digit at t ---------- */
FIG['df-sched']=root=>{const svg=svgOf(root);
  onInput(root,'t',()=>{const t=+q(root,'t').value;setV(root,'t',t);initSvg(svg,1160,300);
    const P=Plot(svg,{at:[0,0],w:560,h:300,x:[0,1000],y:[0,1.02],m:{l:52,r:14,t:16,b:40}});P.axes({xt:[0,250,500,750,1000],yt:[0,0.25,0.5,0.75,1],xl:'step t',yl:'ᾱ (signal kept)'});
    P.path(ABAR.map((a,i)=>[i,a]),'ln sb',P.bg);P.path(ABARC.map((a,i)=>[i,a]),'ln so',P.bg);P.line(0,0.5,1000,0.5,'ln thin sm dash',P.bg);
    P.line(t,0,t,1.02,'ln thin sk');P.dot(t,ABAR[t],6,'fb pt');P.dot(t,ABARC[t],6,'fo pt');
    const tl=P.text(300,0.13,'linear','lab','start');tl.style.fill='#4472c4';const tc=P.text(640,0.62,'cosine','lab','start');tc.style.fill='#c55a11';P.text(1000,0.53,'SNR = 1','','end',-4,0);
    [[ABAR,'linear','#4472c4',620],[ABARC,'cosine','#c55a11',890]].forEach(([A,nm,c,x])=>{imgEl(svg,x,20,220,noisy(DIG,A[t],EPS28),{stroke:c,sw:2});
      const a=T(svg,x+110,268,nm+': ᾱ = '+(A[t]<1e-3&&A[t]>0?sci(A[t],2):nf(A[t],3)),'lab');a.style.fill=c;T(svg,x+110,290,'SNR = '+(t===0?'∞':sci(snr(A[t]),3)),'')})})};

/* ---------- the forward process on the spiral ---------- */
const EPS2=(()=>{const r=rng(11);return D.data.map(()=>[randn(r),randn(r)])})();
const sq=(m,w,h)=>{const ax=w-m.l-m.r,ay=h-m.t-m.b;return ax/ay};
function cloudPlot(svg,o){const m=o.m||{l:40,r:200,t:16,b:34};const w=o.w||620,h=o.h||400;const r=o.r||3.3;const ratio=sq(m,w,h);
  const P=Plot(svg,{w:w,h:h,x:[-r*ratio,r*ratio],y:[-r,r],m:m});P.axes({xt:[-3,-2,-1,0,1,2,3].filter(v=>Math.abs(v)<r*ratio),yt:[-3,-2,-1,0,1,2,3].filter(v=>Math.abs(v)<r),fx:mn,fy:mn});return P}
FIG['df-2d']=root=>{const svg=svgOf(root);
  onInput(root,'t',()=>{const t=+q(root,'t').value;const ab=ABAR[t];setV(root,'t',t);const P=cloudPlot(svg,{});
    const C=[];for(let a=0;a<=96;a++){const th=2*Math.PI*a/96;C.push([2.45*Math.cos(th),2.45*Math.sin(th)])}P.path(C,'ln thin so dash',P.bg);
    const pts=D.data.map((p,i)=>[Math.sqrt(ab)*p[0]+Math.sqrt(1-ab)*EPS2[i][0],Math.sqrt(ab)*p[1]+Math.sqrt(1-ab)*EPS2[i][1]]);
    pts.forEach((p,i)=>{const d=P.dot(p[0],p[1],2.6,'');d.setAttribute('fill',ARM[D.arm[i]]);d.setAttribute('fill-opacity','0.75')});
    const sd=k=>{const m=pts.reduce((s,p)=>s+p[k],0)/pts.length;return Math.sqrt(pts.reduce((s,p)=>s+(p[k]-m)*(p[k]-m),0)/pts.length)};
    const x=444;T(svg,x,46,'t = '+t,'lab big','start');TT(svg,x,80,'signal kept √ᾱ_t = '+nf(Math.sqrt(ab),3),'','start');TT(svg,x,102,'noise std √(1−ᾱ_t) = '+nf(Math.sqrt(1-ab),3),'','start');
    T(svg,x,136,'std of the cloud:','','start');T(svg,x,158,'('+nf(sd(0),2)+', '+nf(sd(1),2)+')','lab','start');
    const o=T(svg,x,196,'dashed: 95 % circle','','start');o.style.fill='#c55a11';const o2=T(svg,x,216,'of N(0, I)','','start');o2.style.fill='#c55a11';
    T(svg,x,252,'colour = arm, only to','','start');T(svg,x,272,'follow the points','','start')})};

/* ---------- the posterior q(x_{t-1} | x_t, x_0), scalar x_0 = 2 ---------- */
const PT=[2,5,10,20,50,100,200,500,1000];
FIG['df-post']=root=>{const svg=svgOf(root);const x0=2;
  onInput(root,'k',()=>{const t=PT[+q(root,'k').value];setV(root,'k','t = '+t);
    const xt=Math.sqrt(ABAR[t])*x0-Math.sqrt(1-ABAR[t]);const pm=Math.sqrt(ABAR[t-1])*x0,pv=1-ABAR[t-1];const lm=xt/Math.sqrt(1-BETA[t]),lv=BETA[t]/(1-BETA[t]);
    const qv=(1-ABAR[t-1])/(1-ABAR[t])*BETA[t];const qm=Math.sqrt(ABAR[t-1])*BETA[t]/(1-ABAR[t])*x0+Math.sqrt(1-BETA[t])*(1-ABAR[t-1])/(1-ABAR[t])*xt;
    const sp=Math.sqrt(pv),sl=Math.sqrt(lv);let lo=Math.min(pm-3.2*sp,lm-4*sl),hi=Math.max(pm+3.2*sp,lm+4*sl);if(t<=2){lo=lm-6*sl;hi=pm+6*Math.max(sp,sl)}
    const P=Plot(svg,{w:620,h:330,x:[lo,hi],y:[0,1.12],m:{l:20,r:12,t:30,b:40}});const step=(hi-lo)/5;const tk=[...Array(5)].map((_,i)=>lo+(i+0.5)*step);
    P.axes({xt:tk,fx:v=>nf(v,hi-lo<0.2?3:2),xl:'x_{t−1}'});
    const g=(m,v)=>x=>Math.exp(-(x-m)*(x-m)/(2*v));
    P.fn(g(pm,pv),'ln sb',lo,hi,400);P.fn(g(lm,lv),'ln so',lo,hi,400);P.fn(g(qm,qv),'ln sk',lo,hi,400);
    P.line(x0,0,x0,1.12,'ln thin sg dash',P.bg);
    TT(P.top,320,18,'t = '+t+':  x_0 = 2,  x_t = '+nf(xt,3)+'  (one std below its mean)','lab');
    const lx=P.X(lo+0.02*(hi-lo));const a=halo(TT(P.top,lx,P.Y(1.04),'q(x_{t−1} | x_0): prior','lab','start'));a.style.fill='#4472c4';
    const b=halo(TT(P.top,lx,P.Y(0.95),'q(x_t | x_{t−1}): likelihood','lab','start'));b.style.fill='#c55a11';
    halo(T(P.top,lx,P.Y(0.86),'posterior (each curve scaled to height 1)','lab','start'));
    setR(root,'pr',nf(pm,3)+' ± '+nf(sp,3));setR(root,'li',nf(lm,3)+' ± '+nf(sl,3));setR(root,'po',nf(qm,3)+' ± '+nf(Math.sqrt(qv),3));setR(root,'ra',nf(qv/BETA[t],3))})};

/* ---------- the chain and the ELBO terms ---------- */
FIG['df-chain']=root=>{const svg=initSvg(svgOf(root),1160,270);const nodes=[[0,'x_0'],[1,'x_1'],[null,'…'],[299,'x_{t−1}'],[300,'x_t'],[null,'…'],[1000,'x_T']];const X=k=>70+k*170,S=92;
  nodes.forEach(([t,nm],k)=>{const x=X(k);if(t===null){T(svg,x,112,'…','lab big');return}imgEl(svg,x-S/2,62,S,noisy(DIG,ABAR[t],EPS28));TT(svg,x,176,nm,'lab')});
  for(let k=0;k<6;k++){const a=X(k)+S/2+6,b=X(k+1)-S/2-6;if(nodes[k][0]===null||nodes[k+1][0]===null){ln(svg,[a+20,46],[b-20,46],'#bfbfbf',1.2,'4 4');ln(svg,[a+20,196],[b-20,196],'#bfbfbf',1.2,'4 4');continue}
    arrowPx(svg,a,46,b,46,'ln thin sm','fm');arrowPx(svg,b,196,a,196,'ln sb','fb')}
  T(svg,580,22,'q: the fixed forward process (the "encoder")','').style.fill='#595959';
  const brace=(x1,x2,y,lab,col)=>{E('path',{d:'M'+x1+','+y+' q0,10 10,10 L'+((x1+x2)/2-8)+','+(y+10)+' q8,0 8,8 q0,-8 8,-8 L'+(x2-10)+','+(y+10)+' q10,0 10,-10',fill:'none',stroke:col,'stroke-width':1.6},svg);TT(svg,(x1+x2)/2,y+38,lab,'lab').style.fill=col};
  brace(X(0)-10,X(1)+10,206,'L_0: reconstruct x_0','#548235');brace(X(3)-10,X(4)+10,206,'L_{t−1} = KL(q(x_{t−1}|x_t,x_0) ‖ p_θ(x_{t−1}|x_t))','#1f3864');brace(X(6)-50,X(6)+50,206,'L_T ≈ 0','#7f7f7f')};

/* ---------- the ELBO weight lambda_t ---------- */
FIG['df-lambda']=root=>{const lam=t=>{const s2=(1-ABAR[t-1])/(1-ABAR[t])*BETA[t];return BETA[t]*BETA[t]/(2*s2*(1-BETA[t])*(1-ABAR[t]))};
  const P=Plot(svgOf(root),{w:480,h:250,x:[0,1000],y:[-2.4,0],m:{l:56,r:12,t:28,b:40}});P.axes({xt:[0,250,500,750,1000],yt:[-2,-1,0],fy:v=>v===0?'1':'10'+sup(v),xl:'step t',yl:'weight'});
  const pts=[];for(let t=2;t<=1000;t++)pts.push([t,Math.log10(lam(t))]);P.path(pts,'ln sb',P.bg);
  let mean=0;for(let t=2;t<=1000;t++)mean+=lam(t)/999;P.line(0,Math.log10(mean),1000,Math.log10(mean),'ln so dash',P.bg);
  TT(P.top,268,16,'weight of ‖ε − ε_θ‖² in the ELBO term L_{t−1}','lab');TT(P.top,P.X(40),P.Y(-0.32),'ELBO: λ_2 = '+nf(lam(2),2),'','start').style.fill='#1f3864';
  TT(P.top,P.X(990),P.Y(Math.log10(mean)+0.12),'L_{simple}: one weight for all t','','end').style.fill='#c55a11';TT(P.top,P.X(990),P.Y(-2.25),'λ_{1000} = '+nf(lam(1000),4),'','end').style.fill='#1f3864'};

/* ---------- the denoising loss with numbers (trained toy model) ---------- */
FIG['df-loss']=root=>{const svg=svgOf(root);const L=D.loss_ex;const x0=L.x0,eps=L.eps;
  stepper(root,s=>{const R=L.rows[s];const ab=R.ab,sa=Math.sqrt(ab),sn=Math.sqrt(1-ab);initSvg(svg,620,390);
    const P=Plot(svg,{at:[0,0],w:360,h:390,x:[-3.1,3.1],y:[-3.1,3.1],m:{l:30,r:6,t:24,b:28}});P.axes({xt:[-3,-2,-1,0,1,2,3],yt:[-3,-2,-1,0,1,2,3],fx:mn,fy:mn});
    D.data.forEach(p=>{const d=P.dot(p[0],p[1],1.8,'');d.setAttribute('fill','#c8c8c8')});
    const ax=[sa*x0[0],sa*x0[1]];
    arrowPx(P.top,P.X(ax[0]),P.Y(ax[1]),P.X(R.xt[0]),P.Y(R.xt[1]),'ln so','fo');
    const st=[R.xt[0]-sn*R.e[0],R.xt[1]-sn*R.e[1]];E('line',{x1:P.X(st[0]),y1:P.Y(st[1]),x2:P.X(R.xt[0]),y2:P.Y(R.xt[1]),stroke:'#4472c4','stroke-width':2.2,'stroke-dasharray':'5 4'},P.top);
    P.dot(x0[0],x0[1],6,'fgr pt',P.top);E('circle',{cx:P.X(ax[0]),cy:P.Y(ax[1]),r:5,fill:'#fff',stroke:'#548235','stroke-width':2},P.top);P.dot(R.xt[0],R.xt[1],6,'fk pt',P.top);
    const s5=E('path',{d:'M0,-8 L2.4,-2.5 8,-2.5 3.5,1 5,7 0,3.6 -5,7 -3.5,1 -8,-2.5 -2.4,-2.5Z',fill:'#4472c4',stroke:'#fff','stroke-width':1,transform:'translate('+P.X(R.x0h[0])+','+P.Y(R.x0h[1])+')'},P.top);
    T(P.root,190,16,'t = '+R.t,'lab');
    const x=376;let y=40;const row=(a,b,c)=>{const t1=TT(svg,x,y,a,'lab','start');if(c)t1.style.fill=c;if(b!==undefined)T(svg,x+16,y+21,b,'','start');y+=b!==undefined?50:28};
    row('x_0 (green)',vec(x0,2),'#548235');row('ε (drawn once)',vec(eps,2),'#c55a11');row('ᾱ_t',ab<1e-3?sci(ab,2):nf(ab,4));
    row('x_t = √ᾱ_t x_0 + √(1−ᾱ_t) ε',vec(R.xt,3));row('network: ε_θ(x_t, t)',vec(R.e,3),'#4472c4');
    const l=TT(svg,x,y,'‖ε − ε_θ‖² = '+(R.loss<1e-3?sci(R.loss,2):nf(R.loss,3)),'lab','start');l.style.fill='#c00000';y+=30;
    TT(svg,x,y,'x̂_0 (star) = '+vec(R.x0h,2),'','start').style.fill='#4472c4';y+=22;TT(svg,x,y,'‖x_0 − x̂_0‖² = '+(R.err<1e-3?sci(R.err,2):nf(R.err,3)),'','start')})};

/* ---------- the reverse process (DDPM samples of the trained toy model) ---------- */
FIG['df-rev']=root=>{const svg=svgOf(root);const FT=D.traj_t;
  onInput(root,'k',()=>{const k=+q(root,'k').value;const t=FT[k];setV(root,'k','t = '+t);const P=cloudPlot(svg,{});
    D.data.forEach(p=>{const d=P.dot(p[0],p[1],1.8,'',P.bg);d.setAttribute('fill','#dadada')});
    const n=Math.round((1000-t)/10)+1;const PC=['#c00000','#7030a0','#bf9000','#548235','#2e75b6','#c55a11'];
    D.ddpm_paths.forEach((path,j)=>{if(n<2)return;P.path(path.slice(Math.max(0,n-25),n),'ln thin').setAttribute('style','stroke:'+PC[j]+';stroke-width:1.1;opacity:0.7')});
    D.traj[k].forEach(p=>{const d=P.dot(p[0],p[1],2.4,'');d.setAttribute('fill','#4472c4');d.setAttribute('fill-opacity','0.8')});
    D.ddpm_paths.forEach((path,j)=>{const p=path[Math.min(n,path.length)-1];const d=P.dot(p[0],p[1],5,'pt');d.setAttribute('fill',PC[j])});
    const x=444;T(svg,x,46,'t = '+t,'lab big','start');T(svg,x,80,'300 samples (blue)','','start');T(svg,x,102,'6 trajectories: their','','start');T(svg,x,122,'last 250 steps (coloured)','','start');
    T(svg,x,156,'grey: the training data','','start');T(svg,x,196,'network calls so far:','','start');T(svg,x,218,String(1000-t),'lab','start')})};

/* ---------- the learned score field ---------- */
FIG['df-score']=root=>{const svg=svgOf(root);const ST=D.score_t,G=D.score_grid;
  onInput(root,'k',()=>{const k=+q(root,'k').value;const t=ST[k],ab=ABAR[t];setV(root,'k','t = '+t);const P=cloudPlot(svg,{r:3.0});
    D.data.forEach((p,i)=>{const d=P.dot(Math.sqrt(ab)*p[0]+Math.sqrt(1-ab)*EPS2[i][0],Math.sqrt(ab)*p[1]+Math.sqrt(1-ab)*EPS2[i][1],1.8,'',P.bg);d.setAttribute('fill','#cfcfcf')});
    const V=D.score[k];const n=G.length;const sx=P.X(G[1])-P.X(G[0]);
    V.forEach((v,i)=>{const gx=G[i%n],gy=G[Math.floor(i/n)];const m=Math.hypot(v[0],v[1]);if(m<1e-6)return;const len=sx*(0.25+0.6*Math.min(1,m/2));
      const X0=P.X(gx),Y0=P.Y(gy);arrowPx(P.dyn,X0-0.5*len*v[0]/m,Y0+0.5*len*v[1]/m,X0+0.5*len*v[0]/m,Y0-0.5*len*v[1]/m,'ln thin sb','fb')});
    const x=444;T(svg,x,46,'t = '+t,'lab big','start');TT(svg,x,80,'arrows: −ε_θ(x, t)','','start');TT(svg,x,100,'= √(1−ᾱ_t) ∇ log p_t(x)','','start');
    TT(svg,x,134,'grey: noised data x_t','','start');T(svg,x,174,'cosine with the exact','','start');T(svg,x,194,'score (median):','','start');T(svg,x,218,nf(D.score_cos[t],3),'lab','start')})};

/* ---------- Langevin dynamics on a 2-D mixture with an exact score ---------- */
const LMU=[[-1.5,-0.9],[1.5,-0.9],[0,1.5]],LW=[0.6,0.2,0.2],LS2=0.09;
function lscore(x,y,v){const ws=LMU.map((m,k)=>LW[k]*Math.exp(-((x-m[0])**2+(y-m[1])**2)/(2*v)));const Z=ws.reduce((a,b)=>a+b,0)||1e-300;let gx=0,gy=0;LMU.forEach((m,k)=>{gx+=ws[k]/Z*(m[0]-x)/v;gy+=ws[k]/Z*(m[1]-y)/v});return [gx,gy]}
const LANG=(()=>{const out={};['plain','annealed'].forEach(mode=>{const r=rng(5);let P=[...Array(300)].map(()=>[-3+6*r(),-3+6*r()]);const snaps=[P];const sig=mode==='annealed'?[3,1.8,1.1,0.6,0.3,0]:[0,0,0,0,0,0];
  for(let l=0;l<6;l++){const v=LS2+sig[l]*sig[l],eta=0.15*v;for(let k=0;k<50;k++){P=P.map(([x,y])=>{const g=lscore(x,y,v);return [x+eta/2*g[0]+Math.sqrt(eta)*randn(r),y+eta/2*g[1]+Math.sqrt(eta)*randn(r)]});snaps.push(P)}}out[mode]=snaps});return out})();
FIG['df-langevin']=root=>{const svg=svgOf(root);let mode='plain';
  function draw(){const k=+q(root,'k').value;setV(root,'k',k);const P=cloudPlot(svg,{r:3.0});const lev=Math.min(5,Math.floor(Math.max(0,k-1)/50));
    const sig=mode==='annealed'?[3,1.8,1.1,0.6,0.3,0][lev]:0;
    LMU.forEach((m,j)=>[1,2].forEach(c=>{const pts=[];for(let a=0;a<=72;a++){const th=2*Math.PI*a/72;pts.push([m[0]+c*0.3*Math.cos(th),m[1]+c*0.3*Math.sin(th)])}P.path(pts,'ln thin so',P.bg).setAttribute('opacity',c===1?'0.9':'0.5')}));
    const S=LANG[mode][k];S.forEach(p=>P.dot(p[0],p[1],2.6,'fb pt'));
    const cnt=[0,0,0];S.forEach(([x,y])=>{let b=0,bd=1e9;LMU.forEach((m,j)=>{const d=(x-m[0])**2+(y-m[1])**2;if(d<bd){bd=d;b=j}});cnt[b]++});
    ['60 %','20 %','20 %'].forEach((w,j)=>{const t=P.text(LMU[j][0],LMU[j][1]+(j===2?0.62:-0.62),'weight '+w,'lab','middle',0,j===2?0:12);halo(t).style.fill='#c55a11'});
    const x=444;T(svg,x,46,'step '+k+' / 300','lab big','start');T(svg,x,78,mode==='plain'?'plain: the score of the data':'annealed: noise level','','start');
    T(svg,x,98,mode==='plain'?'at every step':'σ = '+nf(sig,1)+' (level '+(lev+1)+' of 6)','','start');
    T(svg,x,140,'share of the 300 points','','start');T(svg,x,160,'nearest each mode:','','start');
    cnt.forEach((c,j)=>T(svg,x,190+j*24,['left','right','top'][j]+': '+Math.round(100*c/300)+' %  (true '+[60,20,20][j]+' %)','lab','start'))}
  segs(root,'m',v=>{mode=v;draw()});onInput(root,'k',draw)};

/* ---------- reverse SDE vs probability-flow ODE, 1-D mixture, exact score ---------- */
const SDE=(()=>{const r=rng(17);const N=14;const out={sde:[],ode:[]};const x0=[...Array(N)].map(()=>randn(r));
  ['sde','ode'].forEach(mode=>{const rr=rng(19);x0.forEach(xT=>{let x=xT;const path=[[1000,x]];for(let t=1000;t>=1;t--){const ab=ABAR[t];const s=score1(x,ab);const e=-Math.sqrt(1-ab)*s;
      if(mode==='sde'){const mean=(x-BETA[t]/Math.sqrt(1-ab)*e)/Math.sqrt(1-BETA[t]);x=t>1?mean+Math.sqrt(BETA[t])*randn(rr):mean}
      else{const x0h=(x-Math.sqrt(1-ab)*e)/Math.sqrt(ab);x=Math.sqrt(ABAR[t-1])*x0h+Math.sqrt(1-ABAR[t-1])*e}
      if((t-1)%5===0)path.push([t-1,x])}out[mode].push(path)})});return out})();
FIG['df-sde']=root=>{const svg=svgOf(root);
  const draw=mode=>{const P=Plot(svg,{w:620,h:380,x:[1000,0],y:[-3,3],m:{l:44,r:12,t:28,b:40}});P.axes({xt:[1000,750,500,250,0],yt:[-2,-1,0,1,2],fy:mn,xl:'step t  (generation runs left to right)',yl:'x'});
    const NX=50,NY=60;for(let i=0;i<NX;i++){const t=Math.round(1000-1000*(i+0.5)/NX);const col=[];let mx=0;for(let j=0;j<NY;j++){const y=-3+6*(j+0.5)/NY;const p=pt1(y,ABAR[t]);col.push(p);mx=Math.max(mx,p)}
      col.forEach((p,j)=>{const y0=-3+6*j/NY;E('rect',{x:P.X(1000-1000*i/NX),y:P.Y(y0+6/NY),width:P.X(1000-1000*(i+1)/NX)-P.X(1000-1000*i/NX)+0.6,height:P.Y(y0)-P.Y(y0+6/NY)+0.6,fill:heat(0.85*p/mx,true)},P.bgc)})}
    SDE[mode].forEach(path=>P.path(path,mode==='sde'?'ln thin sr':'ln thin sk'));
    TT(P.top,330,18,mode==='sde'?'reverse SDE (DDPM): noise at every step, jagged paths':'probability flow ODE (DDIM): no noise, smooth paths','lab')};
  const cur=segs(root,'m',draw);draw(cur()||'sde')};

/* ---------- DDPM vs DDIM by number of steps ---------- */
FIG['df-ddim']=root=>{const svg=svgOf(root);const SL=D.steps;
  onInput(root,'k',()=>{const k=+q(root,'k').value;const S=SL[k];setV(root,'k',S+(S===1?' step':' steps'));initSvg(svg,620,440);
    [[1,'DDPM (η = 1): fresh noise at every step'],[0,'DDIM (η = 0): deterministic']].forEach(([eta,title],j)=>{const x0=j*312;
      const P=Plot(svg,{at:[x0,0],w:306,h:300,x:[-2.9,2.9],y:[-2.9,2.9],m:{l:8,r:8,t:26,b:8}});E('rect',{x:8,y:26,width:290,height:266,fill:'none',stroke:'#d0d0d0'},P.root);
      D.data.forEach(p=>{const d=P.dot(p[0],p[1],1.6,'',P.bg);d.setAttribute('fill','#d6d6d6')});
      D.dd[S+'_'+eta].forEach(p=>{const d=P.dot(p[0],p[1],2.2,'');d.setAttribute('fill',eta?'#4472c4':'#ed7d31');d.setAttribute('fill-opacity','0.8')});
      T(P.root,153,17,title,'lab');const qv=D.dd_q[S+'_'+eta];T(svg,x0+153,318,'to / from the data: '+nf(qv[0],4)+' / '+nf(qv[1],4),'');
      const ims=D.mn_dd[S+'_'+eta];ims.forEach((h,i)=>imgEl(svg,x0+10+i*36.5,336,34,hexArr(h),{stroke:'#bfbfbf'}))});
    T(svg,310,400,'MNIST 16 × 16, the same x_T for both samplers','');T(svg,310,424,'real points score '+nf(D.real_q[0],4)+' / '+nf(D.real_q[1],4)+' (2000 samples of the lab)','')})};

/* ---------- classifier-free guidance ---------- */
FIG['df-cfg']=root=>{const svg=svgOf(root);const WS=D.cfg_w;let c='0';
  function draw(){const k=+q(root,'k').value;const w=WS[k];setV(root,'k','w = '+w);const P=cloudPlot(svg,{r:3.0});
    D.data.forEach((p,i)=>{const d=P.dot(p[0],p[1],2,'',P.bg);d.setAttribute('fill',c!=='free'&&D.arm[i]===+c?ARMS[+c]:'#dddddd')});
    const S=c==='free'?D.cfg_free:D.cfg[c+'_'+w];const col=c==='free'?'#595959':ARM[+c];
    S.forEach(p=>{const d=P.dot(p[0],p[1],2.6,'pt');d.setAttribute('fill',col)});
    const x=444;T(svg,x,46,c==='free'?'no label: c = ∅':'arm '+c+', w = '+w,'lab big','start');
    if(c!=='free'){T(svg,x,80,'Stable Diffusion’s scale:','','start');T(svg,x,100,'s = 1 + w = '+nf(1+w,1),'','start')}else{T(svg,x,80,'(w plays no role)','','start')}
    T(svg,x,140,'150 samples; light colour:','','start');T(svg,x,160,'the training points of the arm','','start');
    const rad=S.reduce((s,p)=>s+Math.hypot(p[0],p[1]),0)/S.length;T(svg,x,200,'mean radius here: '+nf(rad,2),'','start')}
  segs(root,'c',v=>{c=v;draw()});onInput(root,'k',draw)};

/* ---------- text conditioning: cross-attention (illustration) ---------- */
FIG['df-xattn']=root=>{const svg=initSvg(svgOf(root),620,380);const toks=['a','red','car','on','grass'];
  T(svg,120,24,'U-Net feature map (4 × 4 here)','lab');const c0=[40,44],cs=40;const hi=[1,2];
  const att=[[0.05,0.10,0.15,0.10,0.10,0.15,0.20,0.10,0.30,0.55,0.60,0.20,0.65,0.80,0.75,0.60],[0.05,0.08,0.10,0.06,0.10,0.60,0.75,0.15,0.20,0.85,0.90,0.25,0.10,0.30,0.25,0.10]];
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){const v=att[1][i*4+j];E('rect',{x:c0[0]+j*cs,y:c0[1]+i*cs,width:cs,height:cs,fill:heat(0.15+0.75*v,true),stroke:'#7f7f7f'},svg)}
  E('rect',{x:c0[0]+hi[1]*cs,y:c0[1]+hi[0]*cs,width:cs,height:cs,fill:'none',stroke:'#c00000','stroke-width':3},svg);
  T(svg,120,226,'colour: attention to "car"','');T(svg,120,246,'(an illustration, not a trained model)','');
  T(svg,470,24,'text encoder (CLIP, T5): one vector per token','lab');
  toks.forEach((tk,i)=>{box(svg,330,44+i*44,80,32,tk,'#e2f0d9',{cls:'lab'});box(svg,430,44+i*44,64,32,'k, v','#fff2cc',{cls:''})});
  const qx=c0[0]+hi[1]*cs+cs,qy=c0[1]+hi[0]*cs+cs/2;const wts=[0.04,0.21,0.62,0.05,0.08];
  wts.forEach((w,i)=>E('line',{x1:qx+2,y1:qy,x2:328,y2:60+i*44,stroke:'#c00000','stroke-width':0.8+10*w,opacity:0.75},svg));
  halo(T(svg,262,qy-12,'query q','')).style.fill='#c00000';
  TT(svg,310,300,'q = (pixel feature) W_Q,   k = (token) W_K,   v = (token) W_V','');
  T(svg,310,326,'out = softmax(q kᵀ / √d) v, added back to the pixel feature','lab');
  T(svg,310,356,'every pixel asks every word: which of you concerns me?','')};

/* ---------- latent diffusion ---------- */
FIG['df-latent']=root=>{const svg=initSvg(svgOf(root),1160,250);const r=rng(4);
  imgEl(svg,20,40,140,DIG,{stroke:'#4472c4',sw:2});T(svg,90,206,'image x','lab');T(svg,90,228,'512 × 512 × 3 = 786,432','');
  arrowPx(svg,170,110,214,110,'ln thin sk','fk');box(svg,216,82,74,56,'E','#e2f0d9',{cls:'lab big'});arrowPx(svg,292,110,334,110,'ln thin sk','fk');
  const lat=(x,y,s,noise)=>{for(let c=3;c>=0;c--)for(let i=0;i<8;i++)for(let j=0;j<8;j++){const v=noise?2*r()-1:Math.sin(i*0.9+c)*Math.cos(j*0.7-c);E('rect',{x:x+c*8+j*s,y:y-c*8+i*s,width:s,height:s,fill:heat(0.8*v),stroke:'#fff','stroke-width':0.3},svg)}};
  lat(340,70,9,false);TT(svg,400,206,'latent z_0','lab');T(svg,400,228,'64 × 64 × 4 = 16,384','');
  E('rect',{x:478,y:22,width:430,height:176,rx:10,fill:'#f5f8fd',stroke:'#4472c4','stroke-width':1.5},svg);T(svg,693,44,'diffusion in the latent space','lab');
  lat(500,90,7,true);TT(svg,535,182,'z_T','');arrowPx(svg,580,110,640,110,'ln sb','fb');box(svg,644,80,140,60,'','#fff',{});TT(svg,714,115,'U-Net ε_θ(z_t, t, c)','');arrowPx(svg,788,110,836,110,'ln sb','fb');lat(844,90,7,false);TT(svg,876,182,'z_0','');
  box(svg,644,150,140,30,'text c (CLIP)','#fff2cc',{cls:''});ln(svg,[714,150],[714,140],'#7f7f7f',1.5);
  arrowPx(svg,914,110,956,110,'ln thin sk','fk');box(svg,958,82,74,56,'D','#fbe5d6',{cls:'lab big'});arrowPx(svg,1034,110,1062,110,'ln thin sk','fk');
  imgEl(svg,1064,62,92,DIG,{stroke:'#ed7d31',sw:2});T(svg,1110,206,'new image','lab');
  T(svg,693,228,'48 times fewer numbers per step than in pixel space','lab').style.fill='#1f3864'};

/* ---------- the U-Net with a time embedding ---------- */
FIG['df-unet']=root=>{const svg=initSvg(svgOf(root),620,400);
  const blk=(x,y,w,h,lab,sub,fill)=>{E('rect',{x:x,y:y,width:w,height:h,rx:4,fill:fill,stroke:'#404040'},svg);T(svg,x+w/2,y+h/2+5,lab,'lab');if(sub)T(svg,x+w/2,y+h+18,sub,'')};
  blk(30,40,70,90,'16²','32 ch','#dae3f3');blk(130,140,62,70,'8²','64 ch','#dae3f3');blk(232,236,56,52,'4²','64 ch','#e2f0d9');blk(328,140,62,70,'8²','64 ch','#fbe5d6');blk(420,40,70,90,'16²','32 ch','#fbe5d6');
  arrowPx(svg,100,120,128,158,'ln thin sk','fk');arrowPx(svg,192,198,230,246,'ln thin sk','fk');arrowPx(svg,288,246,326,198,'ln thin sk','fk');arrowPx(svg,390,158,418,120,'ln thin sk','fk');
  arrowPx(svg,100,62,418,62,'ln thin sm dash','fm');halo(T(svg,260,56,'skip: concatenate','')).style.fill='#595959';arrowPx(svg,192,162,326,162,'ln thin sm dash','fm');halo(T(svg,260,156,'skip','')).style.fill='#595959';
  TT(svg,64,26,'x_t','lab');arrowPx(svg,492,86,530,86,'ln thin sk','fk');TT(svg,575,92,'ε_θ','lab');
  
  box(svg,30,316,120,34,'t = 250','#fff2cc',{cls:'lab'});arrowPx(svg,152,333,182,333,'ln thin sk','fk');
  const x0=186,y0=302;for(let d=0;d<32;d++){const half=16,k=d%half;const w=Math.exp(-Math.log(10000)*k/half);const v=d<half?Math.sin(250*w):Math.cos(250*w);E('rect',{x:x0+d*5,y:y0+14,width:5,height:34,fill:heat(v),stroke:'none'},svg)}
  T(svg,x0+80,y0+70,'sin / cos embedding (32 numbers)','');arrowPx(svg,x0+164,333,x0+194,333,'ln thin sk','fk');box(svg,x0+198,316,60,34,'MLP','#e2f0d9',{cls:'lab'});
  const ex=x0+258;ln(svg,[ex,333],[560,333],'#c00000',1.6);[[40,130],[140,210],[236,288],[338,210],[430,130]].forEach(([x,y])=>{ln(svg,[x,333],[x,y+(y===288?2:4)],'#c00000',1.4,'4 3')});
  halo(T(svg,560,320,'+ into every block','','end')).style.fill='#c00000'};

/* ---------- the trilemma ---------- */
FIG['df-trilemma']=root=>{const svg=initSvg(svgOf(root),480,330);const A=[240,38],B=[50,292],C=[430,292];
  E('polygon',{points:[A,B,C].map(p=>p.join(',')).join(' '),fill:'#fafafa',stroke:'#7f7f7f','stroke-width':1.5},svg);
  T(svg,240,24,'high-quality samples','lab');T(svg,50,318,'fast sampling','lab');T(svg,474,318,'mode coverage, diversity','lab','end');
  const pt=(p,lab,c,dx,dy,anc)=>{E('circle',{cx:p[0],cy:p[1],r:9,fill:c,stroke:'#fff','stroke-width':1.5},svg);const t=T(svg,p[0]+dx,p[1]+dy,lab,'lab',anc);t.style.fill=c};
  const mix=(a,b,s)=>[a[0]+(b[0]-a[0])*s,a[1]+(b[1]-a[1])*s];
  pt(mix(A,B,0.5),'GAN','#c00000',-14,4,'end');pt(mix(B,C,0.5),'VAE, flows','#548235',0,-16,'middle');pt(mix(A,C,0.5),'diffusion','#4472c4',14,4,'start');
  T(svg,240,196,'each family gets two of three','');T(svg,240,218,'(Xiao et al., 2022)','');
};
})();
