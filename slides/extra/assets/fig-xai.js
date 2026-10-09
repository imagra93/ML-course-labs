/* Figures for extra/09_explainability.html (explainability). Uses ../assets/figures.js (MLFIG), ../neural_networks/assets/nn-core.js (MLNN)
   and xai-data.js (XAIDATA: arrays exported from the notebook "extra 09 - Explainability"). Toy figures (Shapley lattice, LIME, IG,
   counterfactual) are computed here from the formulas quoted on the slides. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,q,setV,svgOf,solve}=lib;const {heat,TT,box,stepper,segs}=window.MLNN;
const XD=window.XAIDATA;
const FN=['age','licence','power','car value','mileage','urban','vehicle age','deductible','prior claims'];
const BL='#4472c4',OR='#ed7d31',RD='#c00000',GR='#548235',GY='#8c8c8c',GD='#bf9000';
const nf=(v,d)=>{d=d===undefined?1:d;if(Math.abs(v)<0.5*Math.pow(10,-d))v=0;return v.toFixed(d).replace('-','−')};
const sg=(v,d)=>(v>=0?'+':'−')+Math.abs(v).toFixed(d===undefined?0:d);
const eur=v=>(v<0?'−':'')+Math.round(Math.abs(v)).toLocaleString('en-US')+' €';
const ln=(svg,a,b,c,w,dash)=>E('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:c||'#9aa5b8','stroke-width':w||1.6,'stroke-dasharray':dash||''},svg);
const dot=(svg,x,y,r,fill,stroke,sw)=>E('circle',{cx:x,cy:y,r:r,fill:fill,stroke:stroke||'#fff','stroke-width':sw===undefined?1:sw},svg);
const halo=t=>{t.setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round');return t};
function onInput(root,k,draw){const inp=q(root,k);inp.addEventListener('input',draw);draw();return inp}
const col=(t,c)=>{t.style.fill=c;return t};
/* diverging colour: blue (low) - light grey - red (high), t in [0,1] */
function cw(t){t=Math.max(0,Math.min(1,t));const a=[59,76,192],m=[221,221,221],b=[180,4,38];const u=t<0.5?t*2:(t-0.5)*2;const p=t<0.5?a:m,r=t<0.5?m:b;
  return 'rgb('+p.map((v,i)=>Math.round(v+(r[i]-v)*u)).join(',')+')'}
/* signed map colour: v in [-1,1] -> blue / white / red */
function rb(v){const t=Math.max(-1,Math.min(1,v));if(t>=0){return 'rgb('+[255,Math.round(255-200*t),Math.round(255-200*t)].join(',')+')'}const s=-t;return 'rgb('+[Math.round(255-200*s),Math.round(255-150*s),255].join(',')+')'}
const truthCost=(age,lic,kw,km,urban,ded,claims)=>400+300*Math.exp(-lic/2)+250*Math.exp(-(age-18)/6)+5*Math.max(0,age-60)+1.8*(kw-100)+4*Math.max(0,kw-100)*(age<25?1:0)+8*(km-14)+120*urban-0.15*ded+90*claims;

/* ---------- where we are ---------- */
FIG['xai-where']=root=>{const svg=initSvg(svgOf(root),1160,215);
  E('rect',{x:8,y:22,width:250,height:170,rx:10,fill:'#f5f8fd',stroke:BL,'stroke-width':1.5},svg);T(svg,133,48,'policy A','lab');
  ['age 21 · licence 2 years','160 kW · car value 35 k€','22,000 km a year · urban','1 past claim · no deductible'].forEach((t,i)=>T(svg,133,80+i*28,t,''));
  arrowPx(svg,262,107,300,107,'ln thin sk','fk');
  E('rect',{x:304,y:52,width:210,height:110,rx:12,fill:'#3a3a3a'},svg);col(T(svg,409,95,'gradient boosting','lab'),'#fff');col(T(svg,409,120,'300 trees: a black box','') ,'#e0e0e0');
  arrowPx(svg,518,107,556,107,'ln thin sk','fk');box(svg,560,82,120,50,'1,108 €','#fff2cc',{cls:'lab big',stroke:GD});
  const Q=[['Why 1,108 € for this driver?','local · underwriter, customer','#dae3f3',BL],['What drives prices in the portfolio?','global · actuary, regulator','#e2f0d9',GR],['Did it learn something it should not?','debugging · data scientist','#fbe5d6',OR]];
  Q.forEach(([a,b,f,c],i)=>{const y=14+i*66;ln(svg,[682,107],[742,y+27],c,1.6);E('rect',{x:744,y:y,width:408,height:54,rx:8,fill:f,stroke:c},svg);T(svg,760,y+23,a,'lab','start');T(svg,760,y+44,b,'','start')})};

/* ---------- map of methods ---------- */
FIG['xai-map']=root=>{const svg=initSvg(svgOf(root),620,400);const x0=70,x1=612,y0=14,y1=350,xm=(x0+x1)/2,ym=(y0+y1)/2;
  E('rect',{x:x0,y:y0,width:x1-x0,height:y1-y0,fill:'#fafafa',stroke:'#bfbfbf'},svg);ln(svg,[xm,y0],[xm,y1],'#bfbfbf',1.2);ln(svg,[x0,ym],[x1,ym],'#bfbfbf',1.2);
  T(svg,(x0+xm)/2,374,'global: the whole model','lab');T(svg,(xm+x1)/2,374,'local: one prediction','lab');
  [[(y0+ym)/2,'model-agnostic'],[(ym+y1)/2,'model-specific']].forEach(([y,t])=>{const tt=T(svg,30,y,t,'lab');tt.setAttribute('transform','rotate(-90 30 '+y+')')});
  const chip=(x,y,t,green)=>{const w=t.length*7.4+22;E('rect',{x:x-w/2,y:y-15,width:w,height:28,rx:14,fill:green?'#e2f0d9':'#fff',stroke:green?GR:'#7f7f7f'},svg);T(svg,x,y+4,t,'')};
  const qd={tl:[['permutation importance'],['PDP and ICE'],['ALE plots'],['global surrogate']],tr:[['LIME'],['KernelSHAP'],['counterfactuals'],['anchors']],
    bl:[['impurity importance'],['coefficients',1],['GAM shape functions',1],['small decision tree',1]],br:[['TreeSHAP'],['saliency maps'],['Integrated Gradients'],['Grad-CAM']]};
  const place=(list,cx,cy0)=>list.forEach(([t,g],i)=>chip(cx+(i%2?34:-34),cy0+i*37,t,g));
  place(qd.tl,(x0+xm)/2,y0+30);place(qd.tr,(xm+x1)/2,y0+30);place(qd.bl,(x0+xm)/2,ym+30);place(qd.br,(xm+x1)/2,ym+30);
  E('rect',{x:x0,y:384,width:16,height:12,fill:'#e2f0d9',stroke:GR},svg);T(svg,x0+22,394,'green: interpretable by design (the model is the explanation)','','start')};

/* ---------- the running example ---------- */
FIG['xai-truth']=root=>{const svg=initSvg(svgOf(root),620,330);
  const A=Plot(svg,{at:[0,0],w:215,h:320,x:[0,80],y:[0,310],m:{l:42,r:8,t:26,b:40}});A.axes({xt:[0,20,40,60,80],yt:[0,100,200,300],xl:'years'});
  A.fn(a=>250*Math.exp(-(a-18)/6)+5*Math.max(0,a-60),'ln sb',18,80,200);A.fn(l=>300*Math.exp(-l/2),'ln so',0,62,200);
  T(A.root,120,16,'youth, inexperience (€)','lab');col(A.text(26,150,'age','lab','start'),BL);col(A.text(5,290,'licence years','lab','start',4,0),OR);
  const B=Plot(svg,{at:[205,0],w:205,h:320,x:[45,250],y:[-100,900],m:{l:42,r:8,t:26,b:40}});B.axes({xt:[50,100,150,200,250],yt:[0,400,800],xl:'power (kW)'});
  B.fn(p=>1.8*(p-100),'ln sb',45,250,100);B.fn(p=>1.8*(p-100)+4*Math.max(0,p-100),'ln so',45,250,200);T(B.root,112,16,'power (€)','lab');
  col(B.text(190,780,'age < 25','lab','end'),OR);col(B.text(248,120,'25 or older','','end',0,10),BL);
  const C=Plot(svg,{at:[405,0],w:215,h:320,x:[18,80],y:[0,62],m:{l:40,r:8,t:26,b:40}});C.axes({xt:[20,40,60,80],yt:[0,20,40,60],xl:'age',yl:'licence years'});
  XD.corr.age.forEach((a,i)=>{const c=C.dot(a,XD.corr.lic[i],2,'');c.setAttribute('fill',BL);c.setAttribute('fill-opacity','0.45')});T(C.root,116,16,'correlation 0.987','lab')};

/* ---------- GAM shapes ---------- */
FIG['xai-gam']=root=>{const svg=initSvg(svgOf(root),620,366);const names=['age','licence_years','power','mileage'],lab=['age','licence years','power (kW)','mileage (1,000 km)'];
  names.forEach((nm,k)=>{const G=XD.gam[nm];const xs=G.x;const all=G.gam.concat(G.true);const lo=Math.min(...all),hi=Math.max(...all);const pad=(hi-lo)*0.08;
    const P=Plot(svg,{at:[(k%2)*310,Math.floor(k/2)*175],w:310,h:175,x:[xs[0],xs[xs.length-1]],y:[lo-pad,hi+pad],m:{l:46,r:10,t:24,b:34}});
    const yt=[0,Math.round(hi/100)*100].filter((v,i,a)=>a.indexOf(v)===i&&v>=lo-pad&&v<=hi+pad);
    P.axes({xt:[xs[0],(xs[0]+xs[xs.length-1])/2,xs[xs.length-1]].map(v=>Math.round(v)),yt:yt});T(P.root,166,16,lab[k],'lab');
    P.path(xs.map((x,i)=>[x,G.true[i]]),'ln thin sk dash');P.path(xs.map((x,i)=>[x,G.gam[i]]),'ln sb')});
  ln(svg,[420,358],[450,358],'#000',1.4,'6 5');T(svg,456,362,'truth','','start');ln(svg,[510,358],[540,358],BL,2.5);TT(svg,546,362,'GAM g_j','','start');T(svg,10,362,'effects in €, centred','','start')};

/* ---------- impurity vs permutation importance ---------- */
FIG['xai-mdi']=root=>{const svg=initSvg(svgOf(root),620,402);const D=XD.mdi;const names=FN.concat(['policy ID']);const n=names.length;
  const y=i=>44+i*31;const cc=i=>i===9?RD:(i===3||i===6)?'#a5a5a5':BL;
  const panel=(x0,w,vals,vmax,title,fmt,ticks)=>{T(svg,x0+w/2,20,title,'lab');const X=v=>x0+Math.max(0,v)/vmax*w;
    ticks.forEach(t=>{ln(svg,[X(t),34],[X(t),356],'#ececec',1);T(svg,X(t),374,fmt(t),'')});ln(svg,[x0,34],[x0,356],'#595959',1.2);
    vals.forEach((v,i)=>{E('rect',{x:x0,y:y(i),width:Math.max(1.5,X(v)-x0),height:22,fill:cc(i)},svg);T(svg,Math.max(X(v),x0)+5,y(i)+16,fmt(v),'','start')})};
  names.forEach((nm,i)=>{const t=T(svg,98,y(i)+16,nm,i===9?'lab':'','end');if(i===9)t.style.fill=RD});
  panel(106,215,D.mdi,0.48,'impurity (training data)',v=>v.toFixed(2),[0,0.2,0.4]);
  panel(380,200,D.perm,80,'permutation (test, €)',v=>Math.abs(v)<0.05?'0':nf(v,1).replace('.0',''),[0,40,80]);
  T(svg,310,398,'random forest of fully grown trees with a random policy ID; grey: no true effect','')};

/* ---------- permutation importance demo ---------- */
FIG['xai-perm']=root=>{const svg=svgOf(root);const D=XD.perm;const lo=100,hi=1700;
  onInput(root,'k',()=>{const k=+q(root,'k').value;initSvg(svg,620,360);setV(root,'k',k===0?'none':FN[k-1]);const nm=k?XD.feats[k-1]:null;
    const P=Plot(svg,{at:[0,0],w:300,h:356,x:[lo,hi],y:[lo,hi],m:{l:58,r:8,t:44,b:40}});P.axes({xt:[200,800,1400],yt:[200,800,1400],xl:'true cost μ (€)',yl:'prediction (€)'});
    P.line(lo,lo,hi,hi,'ln thin sk dash',P.bg);
    const pp=k?D.feat[nm].p:D.p0;D.mu.forEach((m,i)=>{if(k){const g=P.dot(m,D.p0[i],2,'');g.setAttribute('fill','#c9c9c9')}const c=P.dot(m,pp[i],2.6,'');c.setAttribute('fill',k?OR:BL);c.setAttribute('fill-opacity','0.75')});
    const r=k?D.feat[nm].rmse:D.rmse0;T(P.root,150,16,k?'shuffled: '+FN[k-1]:'no column shuffled','lab');T(P.root,150,34,'test RMSE '+nf(D.rmse0)+(k?' → '+nf(r):'')+' €','');
    const x0=410,xw=190,X=v=>x0+Math.max(0,v)/62*xw,y=i=>58+i*31;T(svg,512,16,'importance (€): permutation','lab');col(T(svg,512,34,'and drop-column (refit)',''),OR);
    [0,20,40,60].forEach(t=>{ln(svg,[X(t),44],[X(t),336],'#ececec',1);T(svg,X(t),352,String(t),'')});ln(svg,[x0,44],[x0,336],'#595959',1.2);
    XD.feats.forEach((f,i)=>{const on=k===i+1;if(on)E('rect',{x:318,y:y(i)-4,width:300,height:29,fill:'#fff2cc'},svg);T(svg,x0-6,y(i)+14,FN[i],on?'lab':'','end');
      E('rect',{x:x0,y:y(i),width:Math.max(1.5,X(D.imp[i])-x0),height:12,fill:BL},svg);E('rect',{x:x0,y:y(i)+12,width:Math.max(1.5,X(D.drop[i])-x0),height:9,fill:OR},svg);
      T(svg,Math.max(X(D.imp[i]),x0)+4,y(i)+11,nf(D.imp[i]),'','start').style.fontSize='13px'})})};

/* ---------- PDP and ICE ---------- */
FIG['xai-ice']=root=>{const svg=svgOf(root);const D=XD.ice;const g=D.grid;
  const draw=m=>{initSvg(svg,620,370);const cen=m==='cen';const sub=a=>cen?a.map(v=>v-a[0]):a;const cur=D.ice.map(sub),pd=sub(D.pdp);
    const all=cur.flat().concat(pd);const lo=cen?-100:Math.floor(Math.min(...all)/100)*100,hi=cen?Math.ceil(Math.max(...all)/100)*100:Math.ceil(Math.max(...all)/100)*100;
    const P=Plot(svg,{w:620,h:366,x:[50,220],y:[lo,hi],m:{l:58,r:14,t:30,b:40}});const step=(hi-lo)>1000?400:200;const yt=[];for(let v=Math.ceil(lo/step)*step;v<=hi;v+=step)yt.push(v);
    P.axes({xt:[50,100,150,200],yt:yt,xl:'power (kW)',yl:cen?'prediction − prediction at 50 kW (€)':'prediction (€)'});
    cur.forEach((c,i)=>{const pth=P.path(g.map((x,k)=>[x,c[k]]),'ln');const yg=D.young[i];
      pth.setAttribute('stroke',m==='pdp'?'#d0d0d0':m==='ice'?BL:(yg?OR:BL));pth.setAttribute('stroke-width',m==='pdp'?1:1.3);pth.setAttribute('opacity',m==='pdp'?0.8:0.7)});
    if(m!=='ice'){P.path(g.map((x,k)=>[x,pd[k]]),'ln sk').setAttribute('stroke-width',4.5);P.text(221,pd[pd.length-1],'PDP','lab','end',-4,-12)}
    const ttl={pdp:'PDP of power: the average over the 2,000 test policies (grey: 40 ICE curves)',ice:'40 ICE curves: each policy, its power varied from 50 to 220 kW',
      age:'ICE by age: orange under 25, blue 25 or older',cen:'centred ICE: under 25 ≈ 3.92 €/kW, others ≈ 1.16 €/kW (120 → 200 kW)'}[m];T(P.root,339,18,ttl,'lab')};
  const cur=segs(root,'m',draw);draw(cur()||'pdp')};

/* ---------- PDP extrapolation ---------- */
FIG['xai-extrap']=root=>{const svg=svgOf(root);const C=XD.corr;
  onInput(root,'z',()=>{const k=+q(root,'z').value;const z=C.grid[k];setV(root,'z',Math.round(z));initSvg(svg,620,350);
    const A=Plot(svg,{at:[0,0],w:300,h:346,x:[18,80],y:[0,62],m:{l:40,r:8,t:44,b:40}});A.axes({xt:[20,40,60,80],yt:[0,20,40,60],xl:'age',yl:'licence years'});
    C.age.forEach((a,i)=>{const c=A.dot(a,C.lic[i],2,'');c.setAttribute('fill','#c8c8c8')});
    C.lic.forEach(l=>{const ok=l<=z-18&&l>=z-28;const c=A.dot(z,l,3,'');c.setAttribute('fill',ok?GR:RD);c.setAttribute('fill-opacity',ok?1:0.35)});
    T(A.root,150,16,'rows evaluated by PD(age = '+Math.round(z)+')','lab');col(T(A.root,150,34,Math.round(100*C.out[k])+'% impossible (red)',''),RD);
    const B=Plot(svg,{at:[310,0],w:310,h:346,x:[18,80],y:[-80,260],m:{l:44,r:10,t:44,b:40}});B.axes({xt:[20,40,60,80],yt:[-50,0,50,100,150,200,250],xl:'age',yl:'effect (€, centred)'});
    B.path(C.grid.map((a,i)=>[a,C.pdpT[i]]),'ln thin sk dash');const pm=B.path(C.grid.map((a,i)=>[a,C.pdp[i]]),'ln');pm.setAttribute('stroke',RD);
    B.line(z,-80,z,260,'ln thin sm dot2');B.dot(z,C.pdp[k],5,'pt fr');B.dot(z,C.pdpT[k],4,'pt fk');
    T(B.root,155,16,'PDP of age','lab');col(B.text(79,150,'model (boosting)','','end'),RD);B.text(79,180,'truth (dashed)','','end')})};

/* ---------- ALE ---------- */
FIG['xai-ale']=root=>{const svg=svgOf(root);const C=XD.corr;let m='hgb';const bin=9;
  function draw(s){initSvg(svg,620,350);const M=C[m];const e=M.edges;const a0=e[bin-1],a1=e[bin];
    const A=Plot(svg,{at:[0,0],w:300,h:346,x:[18,80],y:[0,62],m:{l:40,r:8,t:44,b:40}});A.axes({xt:[20,40,60,80],yt:[0,20,40,60],xl:'age',yl:'licence years'});
    e.forEach(v=>A.line(v,0,v,62,'gr',A.bg));C.age.forEach((a,i)=>{const c=A.dot(a,C.lic[i],2,'');c.setAttribute('fill','#c8c8c8')});
    A.line(a0,0,a0,62,'ln thin so dash');A.line(a1,0,a1,62,'ln thin so dash');
    C.age.forEach((a,i)=>{if(a>a0&&a<=a1){const l=C.lic[i];A.line(a0,l,a1,l,'ln thin so');A.dot(a0,l,2.6,'fo');A.dot(a1,l,2.6,'fo')}});
    T(A.root,150,16,'ALE rows in the bin '+nf(a0)+'–'+nf(a1)+' years','lab');T(A.root,150,34,'each policy moves to its bin edges only','');
    const B=Plot(svg,{at:[310,0],w:310,h:346,x:[18,80],y:[-80,260],m:{l:44,r:10,t:44,b:40}});B.axes({xt:[20,40,60,80],yt:[-50,0,50,100,150,200,250],xl:'age',yl:'effect (€, centred)'});
    T(B.root,155,16,(m==='hgb'?'gradient boosting':'random forest')+': effect of age','lab');
    const lab=[];if(s>=1){B.path(e.map((a,i)=>[a,M.aleT[i]]),'ln thin sk dash');lab.push(['truth '+Math.round(M.aleT[0])+' €','#000'])}
    if(s>=2){const p=B.path(e.map((a,i)=>[a,M.pdp[i]]),'ln');p.setAttribute('stroke',RD);e.forEach((a,i)=>{const d=B.dot(a,M.pdp[i],2.4,'');d.setAttribute('fill',RD)});lab.push(['PDP '+Math.round(M.pdp[0])+' €',RD])}
    if(s>=3){const p=B.path(e.map((a,i)=>[a,M.ale[i]]),'ln sb');e.forEach((a,i)=>B.dot(a,M.ale[i],2.4,'fb'));lab.push(['ALE '+Math.round(M.ale[0])+' €',BL])}
    lab.forEach(([t,c],i)=>col(T(B.root,300,96+i*22,t,'lab','end'),c));if(lab.length)T(B.root,300,74,'at age 18:','','end')}
  const show=stepper(root,draw);segs(root,'m',v=>{m=v;show()})};

/* ---------- surrogate tree ---------- */
FIG['xai-tree']=root=>{const svg=initSvg(svgOf(root),620,350);const D=XD.tree;
  const name=(f,th)=>f===5?'rural (urban = 0)':(FN[f]+' ≤ '+nf(th));
  const pos={};let leafX=0;const leaves=D.l.filter(v=>v===-1).length;const lw=620/leaves;
  (function lay(i,d){if(D.l[i]===-1){pos[i]=[lw*(leafX+0.5),36+d*86];leafX++;return}lay(D.l[i],d+1);lay(D.r[i],d+1);pos[i]=[(pos[D.l[i]][0]+pos[D.r[i]][0])/2,36+d*86]})(0,0);
  Object.keys(pos).forEach(i=>{i=+i;if(D.l[i]!==-1)[D.l[i],D.r[i]].forEach((c,k)=>{ln(svg,[pos[i][0],pos[i][1]+17],[pos[c][0],pos[c][1]-(D.l[c]===-1?24:17)],'#9aa5b8',1.5);
    if(i===0)halo(T(svg,(pos[i][0]+pos[c][0])/2+(k?14:-14),(pos[i][1]+pos[c][1])/2,k?'no':'yes','',k?'start':'end'))})});
  Object.keys(pos).forEach(i=>{i=+i;const [x,y]=pos[i];if(D.l[i]!==-1){const t=name(D.f[i],D.th[i]);const w=t.length*7.2+20;box(svg,x-w/2,y-17,w,34,t,'#fff',{cls:'',stroke:'#7f7f7f'})}
    else{const v=D.v[i];const f=heat(Math.min(1,Math.max(0,(v-350)/900)),true);E('rect',{x:x-lw/2+3,y:y-24,width:lw-6,height:48,rx:6,fill:f,stroke:'#7f7f7f'},svg);
      col(T(svg,x,y-3,eur(v),'lab'),v>950?'#fff':'#1f1f1f');col(T(svg,x,y+16,'n = '+D.n[i].toLocaleString('en-US'),''),v>950?'#fff':'#404040')}});
  T(svg,310,348,'depth 3, fitted to the boosting predictions · fidelity R² = '+D.fid.toFixed(3)+' · leaf: mean prediction, policies','')};

/* ---------- the toy Shapley example ---------- */
const toyF=(Y,P,U)=>300+200*Y+2*(P-100)+2*Y*(P-100)+100*U;const TOYB=[[0,80,0],[0,100,1],[1,120,0],[0,140,1]],TOYX=[1,150,1],TOYN=['young','power','urban'];
const toyV=code=>TOYB.reduce((s,b)=>{const z=b.map((v,j)=>(code>>j)&1?TOYX[j]:v);return s+toyF(z[0],z[1],z[2])},0)/TOYB.length;
const TV=[0,1,2,3,4,5,6,7].map(toyV);
const toyPhi=(()=>{const w=[1/3,1/6,1/3];return [0,1,2].map(j=>{let s=0;for(let c=0;c<8;c++)if(!((c>>j)&1)){const sz=[0,1,2].filter(k=>(c>>k)&1).length;s+=w[sz]*(TV[c|(1<<j)]-TV[c])}return s})})();
FIG['xai-orders']=root=>{const svg=initSvg(svgOf(root),620,370);const perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];const ab=['Y','P','U'];
  const cx=[95,265,395,525],y=i=>58+i*38;T(svg,310,18,'f = 800 for x = (young, 150 kW, urban); v(∅) = 430','lab');
  ['order of arrival','young','power','urban'].forEach((h,j)=>{E('rect',{x:cx[j]-(j?62:90),y:30,width:j?124:180,height:30,fill:BL},svg);col(T(svg,cx[j],50,h,'lab'),'#fff')});
  perms.forEach((p,i)=>{const yy=y(i)+10;if(i%2)E('rect',{x:5,y:yy-2,width:610,height:38,fill:'#f5f7fb'},svg);T(svg,cx[0],yy+22,p.map(j=>ab[j]).join(' → '),'lab');
    let code=0;p.forEach(j=>{const g=TV[code|(1<<j)]-TV[code];code|=1<<j;T(svg,cx[j+1],yy+22,sg(g),'')})});
  const yb=y(6)+14;ln(svg,[5,yb],[615,yb],'#404040',1.5);T(svg,cx[0],yb+26,'average = φ','lab');toyPhi.forEach((v,j)=>col(T(svg,cx[j+1],yb+26,nf(v,1),'lab'),RD));
  T(svg,310,yb+52,'every row adds up to 800 − 430 = 370, so does the average','')};

FIG['xai-lattice']=root=>{const svg=svgOf(root);const nm=c=>c===0?'∅':'{'+[0,1,2].filter(j=>(c>>j)&1).map(j=>TOYN[j]).join(', ')+'}';
  const P={0:[310,318],1:[120,226],2:[310,226],4:[500,226],3:[120,134],5:[310,134],6:[500,134],7:[310,42]};const lvl=c=>[0,1,2].filter(j=>(c>>j)&1).length;
  const wts=[1/3,1/6,1/3],wl=['1/3','1/6','1/3'];
  stepper(root,s=>{initSvg(svg,620,380);
    for(let c=0;c<8;c++)for(let j=0;j<3;j++)if(!((c>>j)&1)){const d=c|(1<<j);const hiY=s>=5&&j===0;ln(svg,[P[c][0],P[c][1]-19],[P[d][0],P[d][1]+19],hiY?OR:'#c9d1de',hiY?3:1.4)}
    for(let c=0;c<8;c++){const [x,y]=P[c];const L=lvl(c);const on=s>=L+1;const w=c===7?190:150;
      E('rect',{x:x-w/2,y:y-19,width:w,height:38,rx:8,fill:on?(c===7?'#fff2cc':'#f5f8fd'):'#fafafa',stroke:on?BL:'#d0d0d0'},svg);
      const t1=T(svg,x,y-3,nm(c),'');if(!on)t1.style.fill='#b0b0b0';if(on)T(svg,x,y+14,'v = '+Math.round(TV[c]),'lab')}
    if(s===5)[0,2,4,6].forEach(c=>{const d=c|1;const a=P[c],b=P[d];const t=0.42;const x=a[0]+(b[0]-a[0])*t,y=a[1]-19+((b[1]+19)-(a[1]-19))*t;
      col(halo(T(svg,x,y+5,sg(TV[d]-TV[c])+' × '+wl[lvl(c)],'lab')),'#c55a11')});
    if(s>=6){const t=T(svg,310,370,'φ_young = '+nf(toyPhi[0],1)+'   φ_power = '+nf(toyPhi[1],1)+'   φ_urban = '+nf(toyPhi[2],1)+'   sum 370 = 800 − 430','lab');t.style.fill=RD}
    else if(s===5)T(svg,310,370,'φ_young = 160/3 + 225/6 + 160/6 + 225/3 = 192.5','lab')})};

/* ---------- interventional vs conditional ---------- */
FIG['xai-cond']=root=>{const svg=initSvg(svgOf(root),620,350);const D=XD.pc;
  const A=Plot(svg,{at:[0,0],w:300,h:346,x:[45,250],y:[0,62],m:{l:40,r:8,t:44,b:40}});A.axes({xt:[50,100,150,200,250],yt:[0,20,40,60],xl:'power (kW)',yl:'car value (k€)'});
  D.power.forEach((p,i)=>{const c=A.dot(p,D.cv[i],2,'');c.setAttribute('fill','#c8c8c8')});
  const idx=D.power.map((p,i)=>[Math.abs(p-160),i]).sort((a,b)=>a[0]-b[0]).slice(0,25).map(v=>v[1]);
  D.cv.forEach(v=>{const c=A.dot(154,v,2.6,'');c.setAttribute('fill',BL);c.setAttribute('fill-opacity','0.35')});
  idx.forEach(i=>{const c=A.dot(166,D.cv[i],3,'');c.setAttribute('fill',OR)});A.dot(160,35,6,'pt fk');
  T(A.root,150,16,'power known (160 kW), car value filled in by','lab');col(T(A.root,90,34,'background','','middle'),BL);T(A.root,150,34,'or','');col(T(A.root,212,34,'neighbours','','middle'),OR);
  const C=XD.cond['truth mu'];const js=[0,1,2,3];const x0=370,gw=60,Y=v=>300-v/300*240;
  T(svg,485,16,'SHAP values of the truth μ, policy A','lab');[0,100,200,300].forEach(v=>{ln(svg,[x0-6,Y(v)],[612,Y(v)],'#ececec',1);T(svg,x0-10,Y(v)+4,String(v),'','end')});ln(svg,[x0-6,Y(0)],[612,Y(0)],'#595959',1.2);
  js.forEach((j,k)=>{const x=x0+k*gw;[[C.int[j],BL],[C.cond[j],OR]].forEach(([v,c],h)=>{const xx=x+h*24;E('rect',{x:xx,y:Math.min(Y(v),Y(0)),width:22,height:Math.max(1.5,Math.abs(Y(v)-Y(0))),fill:c},svg);
      T(svg,xx+11,Math.min(Y(v),Y(0))-5,Math.round(v),'').style.fontSize='13px'});T(svg,x+23,320,FN[j],'')});
  E('rect',{x:x0,y:334,width:12,height:12,fill:BL},svg);T(svg,x0+16,344,'interventional','','start');E('rect',{x:x0+120,y:334,width:12,height:12,fill:OR},svg);T(svg,x0+136,344,'conditional','','start')};

/* ---------- KernelSHAP ---------- */
FIG['xai-kshap']=root=>{const svg=initSvg(svgOf(root),620,330);const M=9;const comb=(n,k)=>{let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return r};
  const A=Plot(svg,{at:[0,0],w:300,h:326,x:[0.3,8.7],y:[-3,-0.8],m:{l:56,r:8,t:30,b:40}});A.axes({xt:[1,2,3,4,5,6,7,8],yt:[-3,-2,-1],fy:v=>String(Math.pow(10,v)),xl:'coalition size |z|',grid:true});
  for(let s=1;s<M;s++){const w=(M-1)/(comb(M,s)*s*(M-s));const r=A.rect(s-0.35,-3,s+0.35,Math.log10(w),'');r.setAttribute('fill','#7030a0')}
  T(A.root,150,18,'weight of one coalition, M = 9 (log scale)','lab');
  const D=XD.kshap;const B=Plot(svg,{at:[310,0],w:310,h:326,x:[3.6,10.4],y:[0,52],m:{l:44,r:10,t:30,b:40}});B.axes({xt:[4,5,6,7,8,9,10],fx:v=>String(Math.pow(2,v)),yt:[0,10,20,30,40,50],xl:'sampled coalitions',yl:'RMSE to exact (€)'});
  const pts=D.n.map((n,i)=>[Math.log2(n),D.m[i]]);B.path(pts,'ln sb');pts.forEach((p,i)=>{B.line(p[0],Math.max(0,D.m[i]-D.s[i]),p[0],D.m[i]+D.s[i],'ln thin sb');B.dot(p[0],p[1],4,'pt fb')});
  T(B.root,155,18,'KernelSHAP vs exact, policy A (20 seeds)','lab');B.text(6,D.m[2],nf(D.m[2],2)+' €','','start',8,-8);B.text(10,D.m[6],nf(D.m[6],2)+' €','','end',0,-12)};

/* ---------- waterfall ---------- */
FIG['xai-waterfall']=root=>{const svg=svgOf(root);const D=XD.shapA;const ord=[0,1,2,3,4,5,6,7,8].sort((a,b)=>Math.abs(D.phi[b])-Math.abs(D.phi[a]));
  const vals=['21','2','160','35','22','1','8','0','1'];const x0=150,x1=520,lo=480,hi=1160,X=v=>x0+(v-lo)/(hi-lo)*(x1-x0),y=i=>40+i*31;
  stepper(root,s=>{initSvg(svg,620,370);[500,700,900,1100].forEach(v=>{ln(svg,[X(v),30],[X(v),322],'#ececec',1);T(svg,X(v),340,v.toLocaleString('en-US'),'')});
    ln(svg,[X(D.base),24],[X(D.base),322],'#404040',1.2,'3 3');T(svg,X(D.base),18,'average '+eur(D.base),'','middle');T(svg,580,24,'truth','lab');
    let cum=D.base;ord.forEach((j,i)=>{const on=i<s;T(svg,x0-8,y(i)+17,FN[j]+' = '+vals[j],on?'lab':'','end');if(!on)return;const v=D.phi[j];
      E('rect',{x:X(Math.min(cum,cum+v)),y:y(i)+3,width:Math.max(2,Math.abs(X(cum+v)-X(cum))),height:22,fill:v>0?RD:BL},svg);
      if(i>0)ln(svg,[X(cum),y(i)-6],[X(cum),y(i)+3],'#7f7f7f',1);T(svg,X(Math.max(cum,cum+v))+5,y(i)+18,sg(v),'','start');col(T(svg,580,y(i)+18,sg(D.phiT[j]),''),GY);cum+=v});
    if(s>=9){ln(svg,[X(D.f),24],[X(D.f),322],RD,2);col(T(svg,X(D.f)-4,18,'prediction '+eur(D.f),'lab','end'),RD);T(svg,330,362,'truth: '+eur(D.baseT)+' + '+Math.round(D.phiT.reduce((a,b)=>a+b,0))+' = 1,284 €','','middle').style.fontSize='13px'}
  })};

/* ---------- beeswarm and dependence ---------- */
FIG['xai-bees']=root=>{const svg=initSvg(svgOf(root),1160,348);const D=XD.bees;const ord=[0,1,2,3,4,5,6,7,8].sort((a,b)=>D.meanabs[b]-D.meanabs[a]);
  const x0=130,x1=620,lo=-150,hi=320,X=v=>x0+(v-lo)/(hi-lo)*(x1-x0),y=i=>38+i*30;const r=rng(5);
  [-100,0,100,200,300].forEach(v=>{ln(svg,[X(v),20],[X(v),300],v===0?'#595959':'#ececec',v===0?1.2:1);T(svg,X(v),316,String(v).replace('-','−'),'')});
  T(svg,375,15,'SHAP value (€), 300 test policies','lab');
  ord.forEach((j,i)=>{T(svg,x0-8,y(i)+5,FN[j],'lab','end');D.phi.forEach((p,k)=>{const c=dot(svg,X(p[j]),y(i)+7*randn(r)*0.6,2.6,cw(D.col[k][j]),'none',0);c.setAttribute('fill-opacity','0.85')})});
  const gx=470,gy=342;for(let k=0;k<20;k++)E('rect',{x:gx+k*6,y:gy-9,width:6,height:9,fill:cw(k/19)},svg);T(svg,gx-6,gy,'feature value: low','','end');T(svg,gx+126,gy,'high','','start');
  const P=Plot(svg,{at:[680,0],w:480,h:330,x:[45,255],y:[-140,240],m:{l:52,r:12,t:26,b:40}});P.axes({xt:[50,100,150,200,250],yt:[-100,0,100,200],xl:'power (kW)',yl:'SHAP value of power (€)'});
  D.power.forEach((p,k)=>{const c=P.dot(p,D.phi[k][2],D.young[k]?3.6:2.8,'');c.setAttribute('fill',D.young[k]?OR:BL);c.setAttribute('fill-opacity','0.8')});
  T(P.root,266,16,'dependence plot of power','lab');col(P.text(60,215,'under 25','lab','start'),OR);col(P.text(60,185,'25 or older','lab','start'),BL)};

/* ---------- LIME toy ---------- */
FIG['xai-lime']=root=>{const svg=svgOf(root);const g0=(a,b)=>2*Math.tanh(1.5*a)+1.2*Math.sin(b);const st=0.5;const f=(a,b)=>g0(Math.floor(a/st)*st+st/2,Math.floor(b/st)*st+st/2);const x0=[0.6,0.4];const tg=[3/Math.pow(Math.cosh(0.9),2),1.2*Math.cos(0.4)];
  const W=[0.15,0.2,0.3,0.4,0.5,0.7,1,1.4,2,3,4,6,10];let seed=1;const btn=root.querySelector('button[data-k="seed"]');
  function draw(){const sig=W[+q(root,'w').value];setV(root,'w','σ = '+sig);initSvg(svg,620,360);const r=rng(seed*7919+3);const n=200;const Z=[];
    for(let i=0;i<n;i++){const a=Math.max(-3,Math.min(3,x0[0]+1.2*randn(r))),b=Math.max(-3,Math.min(3,x0[1]+1.2*randn(r)));const d2=(a-x0[0])**2+(b-x0[1])**2;Z.push([a,b,f(a,b),Math.exp(-d2/(sig*sig))])}
    const A=[[0,0,0],[0,0,0],[0,0,0]],bb=[0,0,0];Z.forEach(([a,b,y,w])=>{const v=[1,a-x0[0],b-x0[1]];for(let i=0;i<3;i++){bb[i]+=w*v[i]*y;for(let j=0;j<3;j++)A[i][j]+=w*v[i]*v[j]}});for(let i=0;i<3;i++)A[i][i]+=1e-6;
    const beta=solve(A,bb);const sw=Z.reduce((s,z)=>s+z[3],0),sw2=Z.reduce((s,z)=>s+z[3]*z[3],0);const ess=sw*sw/sw2;
    const P=Plot(svg,{at:[0,0],w:360,h:356,x:[-3,3],y:[-3,3],m:{l:40,r:8,t:30,b:40}});P.axes({xt:[-3,-2,-1,0,1,2,3],yt:[-3,-2,-1,0,1,2,3],xl:'x₁',yl:'x₂',grid:false});
    const N=30,c=6/N;for(let i=0;i<N;i++)for(let j=0;j<N;j++){const a=-3+(i+0.5)*c,b=-3+(j+0.5)*c;const rr=P.rect(a-c/2,b-c/2,a+c/2,b+c/2,'',P.bgc);rr.setAttribute('fill',heat(f(a,b)/3.2));}
    Z.forEach(([a,b,y,w])=>{const d=P.dot(a,b,1.2+6*Math.sqrt(w),'');d.setAttribute('fill','#1f1f1f');d.setAttribute('fill-opacity',0.25+0.6*w)});
    const sc=0.55;arrowPx(P.top,P.X(x0[0]),P.Y(x0[1]),P.X(x0[0]+sc*tg[0]),P.Y(x0[1]+sc*tg[1]),'ln sk','fk');arrowPx(P.top,P.X(x0[0]),P.Y(x0[1]),P.X(x0[0]+sc*beta[1]),P.Y(x0[1]+sc*beta[2]),'ln so','fo');
    E('circle',{cx:P.X(x0[0]),cy:P.Y(x0[1]),r:6,fill:'#fff',stroke:'#000','stroke-width':2},P.top);T(P.root,180,18,'a staircase model (like trees), 200 samples','lab');
    const tx=380;T(svg,tx,40,'kernel width σ = '+sig,'lab','start');T(svg,tx,64,'effective samples: '+Math.round(ess)+' of '+n,'','start');T(svg,tx,88,'sample set #'+seed,'','start');
    const bx=[tx+40,tx+150],Y=v=>270-v*70;[0,1,2].forEach(v=>{ln(svg,[tx+10,Y(v)],[612,Y(v)],v?'#ececec':'#595959',v?1:1.2);T(svg,tx+4,Y(v)+4,String(v),'','end')});ln(svg,[tx+10,Y(-0.6)],[tx+10,Y(2.2)],'#595959',1);
    [[tg[0],beta[1]],[tg[1],beta[2]]].forEach(([t,b],k)=>{[[t,'#404040'],[b,OR]].forEach(([v,c2],h)=>{const xx=bx[k]+h*40;E('rect',{x:xx,y:Math.min(Y(v),Y(0)),width:34,height:Math.max(1.5,Math.abs(Y(v)-Y(0))),fill:c2},svg);T(svg,xx+17,Math.min(Y(v),Y(0))-6,nf(v,2),'').style.fontSize='13px'});
      T(svg,bx[k]+37,296,'slope of x'+(k?'₂':'₁'),'')});
    E('rect',{x:tx,y:318,width:12,height:12,fill:'#404040'},svg);T(svg,tx+16,328,'gradient of the trend','','start');E('rect',{x:tx+150,y:318,width:12,height:12,fill:OR},svg);T(svg,tx+166,328,'LIME','','start');
    T(svg,tx,352,'trend: 2 tanh(1.5x₁) + 1.2 sin(x₂)','','start')}
  btn.addEventListener('click',()=>{seed++;draw()});onInput(root,'w',draw)};

/* ---------- Integrated Gradients toy ---------- */
FIG['xai-ig']=root=>{const svg=svgOf(root);const f=(a,b)=>Math.tanh(a+2*b);const gr=(a,b)=>{const s=1-Math.tanh(a+2*b)**2;return [s,2*s]};const x=[1,1];
  onInput(root,'a',()=>{const al=+q(root,'a').value;setV(root,'a',al.toFixed(2));initSvg(svg,620,360);
    const P=Plot(svg,{at:[0,0],w:320,h:356,x:[-0.25,1.25],y:[-0.25,1.25],m:{l:48,r:8,t:30,b:40}});P.axes({xt:[0,0.5,1],yt:[0,0.5,1],xl:'x₁',yl:'x₂',grid:false});
    const N=30,c=1.5/N;for(let i=0;i<N;i++)for(let j=0;j<N;j++){const a=-0.25+(i+0.5)*c,b=-0.25+(j+0.5)*c;const rr=P.rect(a-c/2,b-c/2,a+c/2,b+c/2,'',P.bgc);rr.setAttribute('fill',heat(f(a,b)))}
    P.line(0,0,1,1,'ln thin sk dash');const m=20;for(let k=0;k<m;k++){const t=(k+0.5)/m;const d=P.dot(t,t,2.2,'');d.setAttribute('fill',t<=al?'#1f1f1f':'#9a9a9a')}
    const g=gr(al,al);arrowPx(P.top,P.X(al),P.Y(al),P.X(al+0.25*g[0]),P.Y(al+0.25*g[1]),'ln sk','fk');E('circle',{cx:P.X(al),cy:P.Y(al),r:6,fill:'#fff',stroke:'#000','stroke-width':2},P.top);
    halo(P.text(0,0,"x′",'lab','end',-8,16));halo(P.text(1,1,'x','lab','start',8,-6));T(P.root,180,18,'f = tanh(x₁ + 2x₂); arrow: gradient at α','lab');
    let ig=[0,0];const K=400;for(let k=0;k<K;k++){const t=(k+0.5)/K;if(t>al)break;const gg=gr(t,t);ig[0]+=x[0]*gg[0]/K;ig[1]+=x[1]*gg[1]/K}
    const gx=gr(1,1);const bars=[['IG₁',ig[0],BL],['IG₂',ig[1],OR],['sum',ig[0]+ig[1],'#404040'],['f(γ(α)) − f(x′)',f(al,al)-f(0,0),'#a5a5a5'],['g×i₁',x[0]*gx[0],'#8faadc'],['g×i₂',x[1]*gx[1],'#f4b183']];
    const x0=352,Y=v=>300-v*240;[0,0.5,1].forEach(v=>{ln(svg,[x0,Y(v)],[615,Y(v)],v?'#ececec':'#595959',v?1:1.2);T(svg,x0-4,Y(v)+4,String(v),'','end')});
    bars.forEach(([lab,v,c2],k)=>{const xx=x0+8+k*43;E('rect',{x:xx,y:Y(Math.max(v,0)),width:34,height:Math.max(1.5,Math.abs(Y(v)-Y(0))),fill:c2},svg);T(svg,xx+17,Y(Math.max(v,0))-6,v.toFixed(3),'').style.fontSize='13px'});
    ['IG₁','IG₂','ΣIG','Δf'].forEach((t,k)=>T(svg,x0+25+k*43,320,t,''));T(svg,x0+25+4.5*43,320,'grad × input','');
    T(svg,486,18,'accumulated from x′ to γ(α)','lab');T(svg,486,348,'Δf = f(γ(α)) − f(x′); grad × input at x','')})};

/* ---------- attribution maps on MNIST ---------- */
FIG['xai-maps']=root=>{const svg=svgOf(root);const D=XD.mnist;let a='ig',w='trained';
  const MN={sal:'saliency |∇f|',gxi:'gradient × input',ig:'Integrated Gradients',cam:'Grad-CAM'};const KEY={sal:'saliency |∇f|',gxi:'gradient × input',ig:'Integrated Gradients',cam:'Grad-CAM'};
  const img=(M,x0,y0,ps,fn)=>{for(let i=0;i<28;i++)for(let j=0;j<28;j++)E('rect',{x:x0+j*ps,y:y0+i*ps,width:ps+0.3,height:ps+0.3,fill:fn(M[i][j])},svg)};
  function draw(){initSvg(svg,620,380);const ps=4.6,S=28*ps;const mp=D.maps[KEY[a]][w];
    [0,1].forEach(d=>{const x0=d?325:12;img(D.x[d],x0,40,ps,v=>{const c=Math.round(255*v/99);return 'rgb('+c+','+c+','+c+')'});img(mp[d],x0+S+12,40,ps,v=>rb(v/99));
      E('rect',{x:x0+S+12,y:40,width:S,height:S,fill:'none',stroke:'#bfbfbf'},svg);T(svg,x0+S/2,30,'input, predicted '+D.pred[d],'');T(svg,x0+S*1.5+12,30,w==='trained'?'trained':'random weights','lab')});
    const P=Plot(svg,{at:[0,182],w:620,h:198,x:[-0.3,4.3],y:[-0.1,1.05],m:{l:50,r:150,t:26,b:34}});P.axes({xt:[0,1,2,3,4],fx:i=>D.stages[i],yt:[0,0.5,1]});
    T(P.root,235,16,'rank correlation with the trained maps as layers are randomised','lab');
    Object.keys(KEY).forEach(k=>{const on=k===a;const c1=D.corr.digit[KEY[k]],c0=D.corr.all[KEY[k]];
      const p=P.path(c1.map((v,i)=>[i,v]),'ln');p.setAttribute('stroke',on?RD:'#bfbfbf');p.setAttribute('stroke-width',on?3:1.4);
      if(on){const q2=P.path(c0.map((v,i)=>[i,v]),'ln dash');q2.setAttribute('stroke',RD);q2.setAttribute('stroke-width',1.8);c1.forEach((v,i)=>{const d=P.dot(i,v,3.5,'');d.setAttribute('fill',RD)})}});
    const lx=480;col(T(P.root,lx,60,MN[a],'lab','start'),RD);T(P.root,lx,84,'solid: digit pixels','','start');T(P.root,lx,104,'dashed: all pixels','','start');T(P.root,lx,124,'grey: other methods','','start')}
  segs(root,'a',v=>{a=v;draw()});segs(root,'w',v=>{w=v;draw()});draw()};

/* ---------- counterfactual on two features ---------- */
FIG['xai-cf']=root=>{const svg=svgOf(root);const sp=XD.std[2],sm=XD.std[4];const tau=900;const c=(p,m)=>truthCost(21,2,p,m,0,0,0);const A=[160,22];let n='l1',act='both';
  function solveCF(){let best=null;const dP=act==='km'?[A[0]]:null,dM=act==='kw'?[A[1]]:null;
    const ps=dP||[...Array(411)].map((_,i)=>45+i*0.5),ms=dM||[...Array(481)].map((_,i)=>2+i*0.1);
    ps.forEach(p=>ms.forEach(m=>{if(c(p,m)>tau+1e-9)return;const a=Math.abs(p-A[0])/sp,b=Math.abs(m-A[1])/sm;const d=n==='l1'?a+b:Math.sqrt(a*a+b*b);if(!best||d<best[2])best=[p,m,d]}));return best}
  function draw(){initSvg(svg,620,370);const P=Plot(svg,{w:620,h:366,x:[45,250],y:[2,50],m:{l:50,r:14,t:52,b:40}});P.axes({xt:[50,100,150,200,250],yt:[10,20,30,40,50],xl:'power (kW)',yl:'mileage (1,000 km)',grid:false});
    const NX=41,NY=24;for(let i=0;i<NX;i++)for(let j=0;j<NY;j++){const p0=45+i*205/NX,m0=2+j*48/NY;const v=c(p0+205/NX/2,m0+48/NY/2);const r=P.rect(p0,m0,p0+205/NX,m0+48/NY,'',P.bgc);r.setAttribute('fill',heat(Math.max(-1,Math.min(1,(v-tau)/500))))}
    const bd=[];for(let p=45;p<=250;p+=0.5){const m=14+(tau-(c(p,14)))/8;if(m>=2&&m<=50)bd.push([p,m])}P.path(bd,'ln sk').setAttribute('stroke-width',3);
    const best=solveCF();const lockC=act==='km'?'power fixed':act==='kw'?'mileage fixed':'';
    if(act==='km')P.line(A[0],2,A[0],50,'ln thin sm dash');if(act==='kw')P.line(45,A[1],250,A[1],'ln thin sm dash');
    if(best){const r=best[2];const pts=[];for(let k=0;k<=240;k++){const t=2*Math.PI*k/240;let u=Math.cos(t),v=Math.sin(t);if(n==='l1'){const s=Math.abs(u)+Math.abs(v);u/=s;v/=s}pts.push([A[0]+r*sp*u,A[1]+r*sm*v])}
      const pp=P.path(pts,'ln thin');pp.setAttribute('stroke',GR);pp.setAttribute('stroke-width',2);arrowPx(P.top,P.X(A[0]),P.Y(A[1]),P.X(best[0]),P.Y(best[1]),'ln sk','fk');
      E('circle',{cx:P.X(best[0]),cy:P.Y(best[1]),r:6,fill:GR,stroke:'#fff','stroke-width':1.5},P.top);
      const ch=[];if(Math.abs(best[0]-A[0])>0.25)ch.push('power 160 → '+nf(best[0],0)+' kW');if(Math.abs(best[1]-A[1])>0.05)ch.push('mileage 22 → '+nf(best[1],1));
      T(svg,310,18,n.toUpperCase()+(lockC?', '+lockC:'')+': '+ch.join(', ')+'  ·  '+eur(c(best[0],best[1]))+'  ·  distance '+nf(best[2],2)+' std','lab')}
    else{col(T(svg,310,18,'mileage only: even 2,000 km a year costs '+eur(c(A[0],2))+'; no counterfactual','lab'),RD)}
    T(svg,310,38,'policy B: 21 years, 2 years of licence, rural, no claims · black line: true cost = 900 €','');
    E('circle',{cx:P.X(A[0]),cy:P.Y(A[1]),r:7,fill:'#000',stroke:'#fff','stroke-width':1.5},P.top);halo(P.text(A[0],A[1],'B: '+eur(c(A[0],A[1])),'lab','start',10,-8));
    halo(P.text(240,45,'referred','lab','end'));halo(P.text(52,6,'accepted','lab','start'))}
  segs(root,'n',v=>{n=v;draw()});segs(root,'act',v=>{act=v;draw()});draw()};

/* ---------- fairness decomposition ---------- */
FIG['xai-fair']=root=>{const svg=initSvg(svgOf(root),620,362);const D=XD.fair;const x0=250,X=v=>x0+v*9,y=i=>40+i*31;
  [-5,0,10,20,30].forEach(v=>{ln(svg,[X(v),30],[X(v),318],v?'#ececec':'#595959',v?1:1.2);T(svg,X(v),334,String(v).replace('-','−'),'')});
  T(svg,310,18,'mean SHAP value, men − women (€), 2,000 test policies','lab');
  D.dphi.forEach((v,i)=>{T(svg,x0-60,y(i)+17,FN[i],i===2?'lab':'','end');E('rect',{x:Math.min(X(0),X(v)),y:y(i)+3,width:Math.max(1.5,Math.abs(X(v)-X(0))),height:22,fill:v>0?RD:BL},svg);
    T(svg,v>0?X(v)+5:X(v)-5,y(i)+19,sg(v,1),'',v>0?'start':'end').style.fontSize='13px'});
  T(svg,310,350,'sum of the bars: '+sg(D.gap,1)+' € = gap of the mean predictions (sex is not an input)','')};
})();
