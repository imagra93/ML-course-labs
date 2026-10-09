/* Figures for extra/12_reinforcement_learning.html (reinforcement learning). Uses ../assets/figures.js (MLFIG),
   ../neural_networks/assets/nn-core.js (MLNN) and rl-data.js (RLDATA: curves precomputed by the notebook's code).
   The gridworld (values, value iteration, policy iteration, the γ / slip widget), the TD steps on the random walk,
   Thompson sampling, the softmax update and the PPO clip are computed here; they match the notebook's numbers. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,q,setV,svgOf,solve}=lib;const {heat,TT,box,stepper,segs}=window.MLNN;
const RD=window.RLDATA;

/* ---------- helpers ---------- */
const nf=(v,d)=>{d=d===undefined?2:d;if(Math.abs(v)<0.5*Math.pow(10,-d))v=0;return v.toFixed(d).replace('-','−')};
const nt=(v,d)=>{let s=nf(v,d===undefined?4:d);if(s.indexOf('.')>=0)s=s.replace(/0+$/,'').replace(/\.$/,'');return s};
const ln=(svg,a,b,c,w,dash)=>E('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:c||'#9aa5b8','stroke-width':w||1.6,'stroke-dasharray':dash||''},svg);
const dot=(svg,x,y,r,fill,stroke,sw)=>E('circle',{cx:x,cy:y,r:r,fill:fill,stroke:stroke||'#fff','stroke-width':sw===undefined?1.5:sw},svg);
const halo=t=>{t.setAttribute('style',(t.getAttribute('style')||'')+';paint-order:stroke;stroke:#fff;stroke-width:6px;stroke-linejoin:round');return t};
const col=(t,c)=>{t.style.fill=c;return t};
function onInput(root,k,draw){const inp=q(root,k);inp.addEventListener('input',draw);return inp}
const C={blue:'#4472c4',orange:'#ed7d31',green:'#70ad47',red:'#c00000',gold:'#bf9000',gray:'#7f7f7f',purple:'#7030a0'};

/* ---------- the gridworld of the lab: 4 × 5, exits +1 (A) and +10 (B), cliff −10 (C) ---------- */
const LAY=['.....','.#A#B','S....','CCCCC'],EXR={A:1,B:10,C:-10},NR=4,NC=5,MV=[[-1,0],[0,1],[1,0],[0,-1]];
const CELLS=[],SID={};for(let r=0;r<NR;r++)for(let c=0;c<NC;c++)if(LAY[r][c]!=='#'){SID[r+','+c]=CELLS.length;CELLS.push([r,c])}
const NS=CELLS.length,TERM=CELLS.map(([r,c])=>LAY[r][c] in EXR),START=SID['2,0'];
const isExit=(r,c)=>LAY[r][c] in EXR;
function mdp(slip,live){const P=[],R=[];
  for(let s=0;s<NS;s++){P.push([]);R.push([]);const [r,c]=CELLS[s];
    for(let a=0;a<4;a++){const out={};let rr=0;
      if(TERM[s])out[s]=1;
      else [[a,1-slip],[(a+1)%4,slip/2],[(a+3)%4,slip/2]].forEach(([b,p])=>{let r2=r+MV[b][0],c2=c+MV[b][1];
        if(r2<0||r2>=NR||c2<0||c2>=NC||LAY[r2][c2]==='#'){r2=r;c2=c}const s2=SID[r2+','+c2];out[s2]=(out[s2]||0)+p;rr+=p*(isExit(r2,c2)?EXR[LAY[r2][c2]]:live)});
      P[s].push(Object.keys(out).map(Number).sort((x,y)=>x-y).map(k=>[k,out[k]]));R[s].push(rr)}}
  return {P,R}}
const Qof=(M,V,g)=>M.P.map((Ps,s)=>Ps.map((list,a)=>M.R[s][a]+g*list.reduce((acc,[s2,p])=>acc+p*V[s2],0)));
function vi(M,g){let V=new Array(NS).fill(0);const hist=[V.slice()];
  for(let it=0;it<2000;it++){const Q=Qof(M,V,g);const Vn=Q.map(r=>Math.max(...r));hist.push(Vn);
    if(Math.max(...Vn.map((v,i)=>Math.abs(v-V[i])))<1e-10)return {V:Vn,Q:Qof(M,Vn,g),hist};V=Vn}
  return {V,Q:Qof(M,V,g),hist}}
const argmax=a=>a.reduce((b,v,i)=>v>a[b]?i:b,0);
const greedyTie=Q=>Q.map(r=>Math.max(...r)-Math.min(...r)<1e-9?-1:argmax(r));
function evalPolicy(M,g,pi){/* pi[s] = array of 4 probabilities; exact solve of (I − γ P_π) V = r_π */
  const A=[],b=[];for(let s=0;s<NS;s++){const row=new Array(NS).fill(0);row[s]=1;let rs=0;
    for(let a=0;a<4;a++){const w=pi[s][a];if(!w)continue;rs+=w*M.R[s][a];M.P[s][a].forEach(([s2,p])=>{row[s2]-=g*w*p})}A.push(row);b.push(rs)}
  return solve(A,b)}
const oneHot=pd=>pd.map(a=>[0,1,2,3].map(k=>k===a?1:0));
const close=(x,y)=>Math.abs(x-y)<=1e-8+1e-5*Math.abs(y);
function policyIteration(M,g){let pi=new Array(NS).fill(0);const steps=[];
  for(let it=0;it<50;it++){const V=evalPolicy(M,g,oneHot(pi));steps.push({pi:pi.slice(),V});const Q=Qof(M,V,g);
    const nw=Q.map((r,s)=>close(r[pi[s]],Math.max(...r))?pi[s]:argmax(r));if(nw.every((a,s)=>a===pi[s]))break;pi=nw}
  return steps}
function greedyPath(pd){let s=START;const path=[s];
  for(let k=0;k<30;k++){if(TERM[s])break;const [r,c]=CELLS[s];const [dr,dc]=MV[pd[s]];const r2=r+dr,c2=c+dc;
    let s2=s;if(r2>=0&&r2<NR&&c2>=0&&c2<NC&&LAY[r2][c2]!=='#')s2=SID[r2+','+c2];
    if(path.includes(s2)){path.push(s2);break}path.push(s2);s=s2}
  return path}
const M0=mdp(0.2,0),G0=0.9,VI0=vi(M0,G0),PI0=policyIteration(M0,G0);
const EXC={A:'#c5e0b4',B:'#548235',C:'#f4b6b6'};
/* draw the grid. o.V values, o.pi arrows (−1: none), o.path states, o.hi highlighted state, o.agent state, o.vmax, o.d decimals */
function drawGrid(svg,x0,y0,cs,o){o=o||{};const vmax=o.vmax||10;const ctr=s=>[x0+CELLS[s][1]*cs+cs/2,y0+CELLS[s][0]*cs+cs/2];
  for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){const ch=LAY[r][c];let fill='#fff';
    if(ch==='#')fill='#595959';else if(ch in EXR)fill=EXC[ch];else if(o.V){const v=o.V[SID[r+','+c]];fill=heat(-0.7*Math.max(-1,Math.min(1,v/vmax)))}
    E('rect',{x:x0+c*cs,y:y0+r*cs,width:cs,height:cs,fill:fill,stroke:'#9a9a9a','stroke-width':1},svg)}
  if(o.path&&o.path.length>1)E('polyline',{points:o.path.map(s=>ctr(s).map(v=>v.toFixed(1)).join(',')).join(' '),fill:'none',stroke:C.orange,'stroke-width':4,'stroke-linejoin':'round','stroke-opacity':0.8},svg);
  for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){const ch=LAY[r][c];const x=x0+c*cs,y=y0+r*cs;
    if(ch in EXR){const t=T(svg,x+cs/2,y+cs/2+6,(EXR[ch]>0?'+':'−')+Math.abs(EXR[ch]),'lab');if(ch==='B')t.style.fill='#fff'}
    else if(ch!=='#'){const s=SID[r+','+c];
      if(o.hi===s)E('rect',{x:x+2.5,y:y+2.5,width:cs-5,height:cs-5,fill:'none',stroke:'#ffc000','stroke-width':4},svg);
      if(o.V)T(svg,x+cs/2,y+cs-8,nf(o.V[s],o.d===undefined?2:o.d),o.vcls||'');
      if(o.pi&&o.pi[s]>=0){const [dr,dc]=MV[o.pi[s]];const cx=x+cs/2,cy=y+cs*0.4,L=cs*0.2;arrowPx(svg,cx-dc*L*0.7,cy-dr*L*0.7,cx+dc*L,cy+dr*L,'ln thin sk','fk')}
      if(ch==='S')T(svg,x+5,y+16,'S','lab','start')}}
  if(o.agent!==undefined){const p=ctr(o.agent);dot(svg,p[0],p[1],cs*0.17,C.orange,'#fff',2)}
  return ctr}

/* ---------- where we are ---------- */
FIG['rl-where']=root=>{const svg=initSvg(svgOf(root),1160,200);
  const panel=(x,w,t)=>{E('rect',{x:x,y:4,width:w,height:192,rx:10,fill:'#fafafa',stroke:'#d0d0d0'},svg);T(svg,x+w/2,28,t,'lab big')};
  panel(6,540,'supervised learning');
  box(svg,30,72,70,44,'x','#e2f0d9',{cls:'lab big'});arrowPx(svg,102,94,140,94,'ln thin sk','fk');box(svg,142,68,110,52,'model','#dae3f3',{cls:'lab'});
  arrowPx(svg,254,94,292,94,'ln thin sk','fk');box(svg,294,72,70,44,'ŷ','#fff2cc',{cls:'lab big'});
  box(svg,294,140,70,40,'label y','#fbe5d6',{cls:''});ln(svg,[329,118],[329,138],'#7f7f7f',1.4,'4 3');
  arrowPx(svg,366,110,410,110,'ln thin sk','fk');box(svg,412,88,110,44,'loss(ŷ, y)','#fff',{cls:''});
  T(svg,276,58,'a teacher gives the right answer for every input','');
  panel(614,540,'reinforcement learning');
  box(svg,650,76,140,60,'agent\nπ(a | s)','#dae3f3',{cls:'lab'});box(svg,960,76,160,60,'environment','#e2f0d9',{cls:'lab'});
  arrowPx(svg,792,92,958,92,'ln so','fo');TT(svg,875,82,'action A_t','lab').style.fill='#c55a11';
  arrowPx(svg,958,124,792,124,'ln sb','fb');TT(svg,875,146,'state S_{t+1}, reward R_{t+1}','lab').style.fill='#2f5597';
  T(svg,884,180,'only a score for what the agent did, often much later','')};

/* ---------- the agent–environment loop: one episode on the gridworld ---------- */
FIG['rl-loop']=root=>{const svg=svgOf(root);const route=[[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[0,4],[1,4]].map(([r,c])=>SID[r+','+c]);
  const acts=[0,0,1,1,1,1,2],AN=['up','right','down','left'],AR='↑→↓←';const rew=[0,0,0,0,0,0,10];const g=0.9;
  const cname=s=>'('+CELLS[s][0]+','+CELLS[s][1]+')';
  stepper(root,s=>{initSvg(svg,620,390);setV(root,'s',s+' / 8');const k=Math.min(s,7);
    drawGrid(svg,20,14,60,{path:route.slice(0,k+1),agent:route[k]});
    const tx=340;
    if(s===0){T(svg,tx,50,'t = 0: the agent observes','lab','start');T(svg,tx,74,'S₀ = start (2,0)','lab','start');T(svg,tx,108,'its policy π picks an action','','start')}
    else if(s<=7){const t=s-1;TT(svg,tx,46,'t = '+t+': in S_'+t+' = '+cname(route[t]),'lab','start');TT(svg,tx,72,'action A_'+t+' = '+AN[acts[t]]+' '+AR[acts[t]],'lab','start');
      col(TT(svg,tx,98,'reward R_'+(t+1)+' = '+rew[t],'lab','start'),rew[t]?'#548235':'#1f1f1f');TT(svg,tx,124,'next state S_'+(t+1)+' = '+cname(route[t+1]),'lab','start');
      if(s===7)col(T(svg,tx,158,'entering the +10 exit ends the episode','lab','start'),'#548235')}
    else{T(svg,tx,46,'the return of the episode:','lab','start');TT(svg,tx,74,'G_0 = R_1 + γR_2 + … + γ^6 R_7','lab','start');T(svg,tx,102,'= 0 + … + 0.9⁶ · 10 = '+(Math.pow(g,6)*10).toFixed(2),'lab','start');
      T(svg,tx,132,'a reward k steps away counts γᵏ','','start')}
    const y0=290,cw=62,x0=96;['t','S_t','A_t','R_{t+1}'].forEach((h,i)=>TT(svg,x0-12,y0+i*24,h,'lab','end'));
    for(let t=0;t<7;t++){const x=x0+t*cw+cw/2;const on=t<s;T(svg,x,y0,String(t),on?'lab':'');
      if(on){T(svg,x,y0+24,cname(route[t]),'');T(svg,x,y0+48,AR[acts[t]],'lab');col(T(svg,x,y0+72,String(rew[t]),'lab'),rew[t]?'#548235':'#1f1f1f')}}
    ln(svg,[x0-4,y0+8],[x0+7*cw,y0+8],'#bfbfbf',1)})};

/* ---------- where RL is used: small pictures ---------- */
FIG['rl-app']=root=>{const svg=initSvg(svgOf(root),350,100);const k=root.dataset.app;
  if(k==='games'){const x0=110,y0=8,s=21;for(let i=0;i<5;i++){ln(svg,[x0,y0+i*s],[x0+4*s,y0+i*s],'#7f6000',1.3);ln(svg,[x0+i*s,y0],[x0+i*s,y0+4*s],'#7f6000',1.3)}
    E('rect',{x:x0-12,y:y0-10,width:4*s+24,height:4*s+20,fill:'none',stroke:'#bf9000','stroke-width':2,rx:3},svg);
    [[1,1,1],[2,1,0],[2,2,1],[3,2,0],[1,3,1],[3,3,0],[2,3,1]].forEach(([i,j,b])=>dot(svg,x0+i*s,y0+j*s,8,b?'#1f1f1f':'#fff','#1f1f1f',1.2));
    E('circle',{cx:x0+3*s,cy:y0+1*s,r:8,fill:'none',stroke:C.orange,'stroke-width':2.5,'stroke-dasharray':'3 2'},svg);T(svg,262,56,'next move?','')}
  else if(k==='robot'){ln(svg,[110,92],[230,92],'#7f7f7f',3);E('rect',{x:140,y:76,width:40,height:16,fill:'#a5a5a5'},svg);
    const p0=[160,76],p1=[130,36],p2=[200,22];ln(svg,p0,p1,'#4472c4',7);ln(svg,p1,p2,'#4472c4',7);[p0,p1,p2].forEach(p=>dot(svg,p[0],p[1],5,'#1f3864'));
    ln(svg,p2,[214,14],'#1f1f1f',2.5);ln(svg,p2,[216,30],'#1f1f1f',2.5);E('rect',{x:222,y:14,width:16,height:16,fill:C.orange},svg);T(svg,290,60,'grasp it','')}
  else if(k==='rec'){[0,1,2,3].forEach(i=>{const y=6+i*23;E('rect',{x:110,y:y,width:150,height:19,rx:3,fill:i===1?'#fff2cc':'#f2f2f2',stroke:i===1?'#bf9000':'#d0d0d0'},svg);
      E('rect',{x:114,y:y+3,width:13,height:13,fill:['#4472c4','#ed7d31','#70ad47','#7030a0'][i]},svg);ln(svg,[133,y+9.5],[i===1?230:210,y+9.5],'#a6a6a6',3)});
    E('path',{d:'M244,38 l0,18 l5,-5 l4,8 l3,-1.5 l-4,-8 l7,0 z',fill:'#1f1f1f'},svg);T(svg,300,60,'click: +1','')}
  else if(k==='price'){const X=v=>110+v*1.5,Y=v=>90-v*0.8;ln(svg,[X(0),Y(0)],[X(100),Y(0)],'#595959',1.2);ln(svg,[X(0),Y(0)],[X(0),Y(100)],'#595959',1.2);
    E('path',{d:'M'+X(5)+','+Y(95)+' Q'+X(25)+','+Y(15)+' '+X(98)+','+Y(8),fill:'none',stroke:C.blue,'stroke-width':2.5},svg);dot(svg,X(30),Y(38),5,C.orange);
    ln(svg,[X(30),Y(38)],[X(30),Y(0)],C.orange,1.2,'3 3');T(svg,X(30),98,'price','').style.fontSize='12px';T(svg,X(52),Y(52),'demand','','start');T(svg,292,30,'today’s price','');T(svg,292,48,'shapes tomorrow','')}
  else if(k==='rlhf'){box(svg,110,8,110,30,'answer A','#e2f0d9',{cls:''});box(svg,110,58,110,30,'answer B','#fbe5d6',{cls:''});
    T(svg,250,40,'A ≻ B','lab');E('path',{d:'M236,62 l8,-14 l4,0 l0,-8 l6,0 l0,8 l8,0 l0,14 z',fill:'#548235'},svg);T(svg,310,78,'preference','')}
  else if(k==='control'){E('path',{d:'M150,12 C210,12 222,50 222,50 C222,50 210,88 150,88 C138,88 138,12 150,12 Z',fill:'#fbe5d6',stroke:C.orange,'stroke-width':2},svg);
    E('path',{d:'M158,30 C192,30 200,50 200,50 C200,50 192,70 158,70 C152,70 152,30 158,30 Z',fill:'#ffc000',opacity:0.8},svg);
    [[120,14],[120,40],[120,66],[232,22],[232,62]].forEach(([x,y])=>E('rect',{x:x,y:y,width:14,height:18,fill:'#8faadc',stroke:'#2f5597'},svg));T(svg,300,54,'coil currents','')}};

/* ---------- bandit regret curves (precomputed in the lab) ---------- */
FIG['rl-regret']=root=>{const svg=svgOf(root);const B=RD.bandit;
  const S=[['greedy','greedy',C.gray],['ε-greedy (ε = 0.1)','ε-greedy',C.orange],['UCB1 (c = √2)','UCB1',C.green],['UCB (c = 0.5)','UCB c=0.5',C.red],['Thompson sampling','Thompson',C.purple]];
  const KEY={greedy:[0],eps:[1],ucb:[2,3],ts:[4],all:[0,1,2,3,4]};
  const draw=m=>{const P=Plot(svg,{w:620,h:370,x:[0,5000],y:[0,340],m:{l:52,r:122,t:16,b:42}});
    P.axes({xt:[0,1000,2000,3000,4000,5000],yt:[0,100,200,300],xl:'pulls t',yl:'cumulative regret'});const on=KEY[m];
    const endY=S.map((s,i)=>B.curves[s[0]][B.curves[s[0]].length-1]);const lab=endY.map(v=>v);lab[4]+=13;lab[3]-=13;
    S.forEach((s,i)=>{const v=B.curves[s[0]];const hi=on.includes(i);const p=P.path(B.t.map((t,j)=>[t,v[j]]),'ln',P.dyn);p.setAttribute('stroke',hi?s[2]:'#d9d9d9');p.setAttribute('stroke-width',hi?3:1.6)});
    S.forEach((s,i)=>{if(!on.includes(i))return;const v=B.curves[s[0]];const t=P.text(5000,lab[i],s[1]+' · '+Math.round(v[v.length-1]),'lab','start',8,5);t.style.fill=s[2]})};
  segs(root,'a',draw);draw('all')};

/* ---------- Thompson sampling: Beta posteriors as violins ---------- */
function gammaS(a,r){const d=a-1/3,c=1/Math.sqrt(9*d);for(;;){let x,v;do{x=randn(r);v=1+c*x}while(v<=0);v=v*v*v;const u=r();
  if(u<1-0.0331*x*x*x*x||Math.log(u)<0.5*x*x+d*(1-v+Math.log(v)))return d*v}}
const betaS=(a,b,r)=>{const x=gammaS(a,r),y=gammaS(b,r);return x/(x+y)};
FIG['rl-thompson']=root=>{const svg=svgOf(root);const MU=RD.bandit.mu,K=MU.length;const CK=[0,1,2,5,10,20,50,100,200,500,1000];
  const r=rng(7);const N=new Array(K).fill(0),Sx=new Array(K).fill(0);const snaps={0:{N:N.slice(),S:Sx.slice()}};
  for(let t=1;t<=1000;t++){const th=MU.map((_,a)=>betaS(1+Sx[a],1+N[a]-Sx[a],r));const a=argmax(th);N[a]++;if(r()<MU[a])Sx[a]++;if(CK.includes(t))snaps[t]={N:N.slice(),S:Sx.slice()}}
  onInput(root,'k',draw);
  function draw(){const k=+q(root,'k').value,t=CK[k];setV(root,'k','t = '+t);initSvg(svg,620,380);const sn=snaps[t];
    const x0=64,w=54,yT=34,yB=304,Y=v=>yB-(yB-yT)*v;
    [0,0.2,0.4,0.6,0.8,1].forEach(v=>{ln(svg,[x0-6,Y(v)],[x0+K*w,Y(v)],'#ececec',1);T(svg,x0-10,Y(v)+5,v.toFixed(1),'','end')});
    const yl=T(svg,16,(yT+yB)/2,'posterior of μ_a','lab');yl.setAttribute('transform','rotate(-90 16 '+(yT+yB)/2+')');
    const dr=rng(100+k);const th=MU.map((_,a)=>betaS(1+sn.S[a],1+sn.N[a]-sn.S[a],dr));const pick=argmax(th);
    for(let a=0;a<K;a++){const al=1+sn.S[a],be=1+sn.N[a]-sn.S[a];const ys=[];for(let i=1;i<200;i++)ys.push(i/200);
      const lf=ys.map(y=>(al-1)*Math.log(y)+(be-1)*Math.log(1-y));const mx=Math.max(...lf);const f=lf.map(v=>Math.exp(v-mx));const cx=x0+a*w+w/2;
      const pts=ys.map((y,i)=>[cx+0.42*w*f[i],Y(y)]).concat(ys.map((y,i)=>[cx-0.42*w*f[i],Y(y)]).reverse());
      E('polygon',{points:pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),fill:a===7?'#f8cbad':'#bdd7ee',stroke:a===7?C.orange:C.blue,'stroke-width':1},svg);
      ln(svg,[cx-0.4*w,Y(MU[a])],[cx+0.4*w,Y(MU[a])],'#1f1f1f',2.5);
      if(t>0||k===0){dot(svg,cx,Y(th[a]),a===pick?6:4,a===pick?C.red:'#404040','#fff',1)}
      T(svg,cx,yB+20,String(a),'lab');T(svg,cx,yB+42,String(sn.N[a]),'')}
    T(svg,x0-10,yB+20,'arm','','end');T(svg,x0-10,yB+42,'pulls','','end');
    T(svg,x0+K*w/2,18,'black bar: true μ_a · dot: one sample θ_a · red: the arm pulled next','');
    col(T(svg,x0+K*w/2,372,t===0?'t = 0: every posterior is uniform, Beta(1, 1)':'after '+t+' pulls: arm '+pick+' has the largest sample, so it is pulled next','lab'),'#1f1f1f')}
  draw()};

/* ---------- the MDP: grid with the slip probabilities ---------- */
FIG['rl-grid-mdp']=root=>{const svg=initSvg(svgOf(root),620,330);drawGrid(svg,16,18,66);
  T(svg,16+2.5*66,300,'4 × 5 grid: 18 states, 7 of them terminal','');
  const cx=500,cy=128,cs=56;E('rect',{x:cx-cs/2,y:cy-cs/2,width:cs,height:cs,fill:'#fff2cc',stroke:'#7f7f7f'},svg);T(svg,cx,cy+5,'s','lab');
  arrowPx(svg,cx,cy-cs/2,cx,cy-cs/2-46,'ln sk','fk');T(svg,cx,cy-cs/2-54,'0.8','lab');T(svg,cx,cy-cs/2-74,'intended: up','');
  arrowPx(svg,cx-cs/2,cy,cx-cs/2-40,cy,'ln thin sm','fm');T(svg,cx-cs/2-46,cy+5,'0.1','lab','end');
  arrowPx(svg,cx+cs/2,cy,cx+cs/2+40,cy,'ln thin sm','fm');T(svg,cx+cs/2+46,cy+5,'0.1','lab','start');
  T(svg,cx,cy+cs/2+30,'slippery floor: sideways','');T(svg,cx,cy+cs/2+50,'with probability 0.1 each','');
  T(svg,cx,cy+cs/2+80,'walls and borders: stay','');T(svg,cx,cy+cs/2+108,'γ = 0.9','lab')};

/* ---------- backup diagram ---------- */
FIG['rl-backup']=root=>{const svg=initSvg(svgOf(root),480,360);const s0=[240,40];const A=[[110,140],[240,140],[370,140]];
  A.forEach((a,i)=>{ln(svg,s0,a,'#7f7f7f',1.6);[-42,0,42].forEach((d,j)=>{const p=[a[0]+d,262];ln(svg,a,p,'#bfbfbf',1.3);dot(svg,p[0],p[1],13,'#fff',C.blue,2)})});
  dot(svg,s0[0],s0[1],16,'#fff',C.blue,2.5);T(svg,s0[0],s0[1]+5,'s','lab');A.forEach(a=>dot(svg,a[0],a[1],8,'#1f1f1f'));
  halo(TT(svg,150,86,'π(a | s)','lab','end'));T(svg,262,146,'a','lab','start');halo(TT(svg,394,206,'P(s′ | s, a)','lab','start'));halo(TT(svg,188,216,'r','lab'));
  T(svg,240+42,267,'s′','lab');T(svg,456,36,'average over the actions','','end');T(svg,456,56,'and over where you land','','end');T(svg,240,312,'leaves: V(s′) of the next states','');T(svg,240,338,'V(s) = Σₐ π(a|s) Σₛ′ P(s′|s,a) [ r + γ V(s′) ]','lab')};

/* ---------- value grids: random policy, optimal policy ---------- */
FIG['rl-vgrid']=root=>{const svg=initSvg(svgOf(root),480,330);const m=root.dataset.mode;
  if(m==='random'){const V=evalPolicy(M0,G0,CELLS.map(()=>[0.25,0.25,0.25,0.25]));drawGrid(svg,55,8,74,{V:V,vmax:8});
    T(svg,240,324,'V of the uniform random policy: V(S) = '+nf(V[START],3),'lab')}
  else{drawGrid(svg,55,8,74,{V:VI0.V,pi:greedyTie(VI0.Q),hi:SID['2,4']});T(svg,240,324,'V* and π*: V*(S) = '+nf(VI0.V[START],3)+', the safe way round','lab')}};

/* ---------- policy iteration ---------- */
FIG['rl-pi']=root=>{const svg=svgOf(root);const n=PI0.length-1;
  stepper(root,s=>{initSvg(svg,620,370);setV(root,'s',s+' / '+n);const st=PI0[s];drawGrid(svg,14,10,64,{V:st.V,pi:st.pi,path:greedyPath(st.pi)});
    T(svg,174,290,s===0?'π₀ = always up, evaluated exactly':(s===n?'π'+subN(s)+' : stable, so it is optimal':'π'+subN(s)+' = greedy with respect to V of π'+subN(s-1)),'lab');
    const x0=360;T(svg,x0,34,'V(S) after each evaluation','lab','start');
    PI0.forEach((p,k)=>{const y=66+k*36;const on=k===s;E('rect',{x:x0,y:y-20,width:236,height:30,fill:on?'#fff2cc':(k<s?'#f2f2f2':'#fff'),stroke:on?'#bf9000':'#d0d0d0'},svg);
      if(k<=s){T(svg,x0+10,y,'π'+subN(k),'lab','start');T(svg,x0+226,y,nf(p.V[START],3),'lab','end')}});
    if(s===n)col(T(svg,x0+118,66+(n+1)*36,'= V*(S) from value iteration','lab'),'#548235')})};
const subN=k=>String(k).split('').map(d=>'₀₁₂₃₄₅₆₇₈₉'[+d]).join('');

/* ---------- value iteration, sweep by sweep ---------- */
FIG['rl-vi']=root=>{const svg=svgOf(root);const H=VI0.hist,Vs=VI0.V,nH=H.length-1;const err=H.map(h=>Math.max(...h.map((v,i)=>Math.abs(v-Vs[i]))));
  onInput(root,'k',draw);
  function draw(){const k0=+q(root,'k').value;const k=k0>10?nH:k0;setV(root,'k',k0>10?'∞ ('+nH+')':String(k));initSvg(svg,620,380);
    const Q=Qof(M0,H[k],G0);drawGrid(svg,10,8,64,{V:H[k],pi:greedyTie(Q)});
    T(svg,170,288,k0>10?'converged: V* after '+nH+' sweeps':'V'+subN(k)+' and its greedy policy','lab');
    TT(svg,170,312,'error max |V_k − V*| = '+nf(err[k],k>=20?4:2),'');
    const P=Plot(svg,{at:[340,0],w:280,h:330,x:[0,40],y:[-4,1.1],m:{l:46,r:10,t:26,b:42}});
    P.axes({xt:[0,10,20,30,40],yt:[-4,-3,-2,-1,0,1],fy:v=>v===0?'1':'10'+['⁻⁴','⁻³','⁻²','⁻¹','','¹'][v+4],xl:'sweep k',yl:'error (log scale)'});
    P.path(err.slice(0,41).map((e,i)=>[i,Math.log10(Math.max(e,1e-6))]),'ln sb',P.dyn);P.path([0,40].map(i=>[i,Math.log10(err[0]*Math.pow(G0,i))]),'ln thin sm dash',P.dyn);
    P.line(8,-4,8,1.1,'ln thin sg',P.dyn);P.text(9.5,-3.25,'greedy policy','','start');P.text(9.5,-3.65,'optimal from k = 8','','start');
    P.text(25,Math.log10(err[0]*Math.pow(G0,25)),'γᵏ bound','','start',0,-9);if(k<=40)P.dot(k,Math.log10(Math.max(err[k],1e-6)),5.5,'fo pt')}
  draw()};

/* ---------- γ, slip and the reward per move ---------- */
FIG['rl-gamma']=root=>{const svg=svgOf(root);['g','p','l'].forEach(k=>onInput(root,k,draw));
  function draw(){const g=+q(root,'g').value,p=+q(root,'p').value,l=+q(root,'l').value;setV(root,'g',g.toFixed(2));setV(root,'p',p.toFixed(2));setV(root,'l',(l>0?'+':'')+nf(l,2));
    initSvg(svg,620,340);const M=mdp(p,l),R=vi(M,g);const pd=R.Q.map(argmax);const path=greedyPath(pd);
    const vmax=Math.max(1,...R.V.map(Math.abs));drawGrid(svg,14,8,68,{V:R.V,pi:greedyTie(R.Q),path:path,vmax:vmax});
    const end=path[path.length-1];const [er,ec]=CELLS[end];const ch=LAY[er][ec];const moves=path.length-1;
    const msg=TERM[end]?(ch==='A'?'goes to +1':ch==='B'?'goes to +10':'jumps into the cliff')+' in '+moves+' moves':'never leaves';
    const risky=path.some(s=>CELLS[s][0]===2&&s!==START);
    const x0=380;T(svg,x0,40,'from S, the optimal policy','lab','start');col(T(svg,x0,68,msg,'lab big','start'),'#c55a11');
    if(TERM[end]&&ch!=='C')T(svg,x0,96,risky?'along the cliff edge':'the safe way, away from the cliff','','start');
    T(svg,x0,140,'V(S) = '+nf(R.V[START],3),'lab','start');T(svg,x0,166,'value iteration: '+(R.hist.length-1)+' sweeps','','start');
    T(svg,x0,214,'+1 is 3 moves away, +10 is 5:','','start');TT(svg,x0,238,'far wins if 10γ^4 > γ^2,','','start');T(svg,x0,262,'γ > 1/√10 = 0.316 (no slip)','','start')}
  draw()};

/* ---------- TD(0) on the random walk, update by update ---------- */
FIG['rl-td']=root=>{const svg=svgOf(root);const EP=[[[2,3,4],1],[[2,3,4,3,4],1],[[2,1,0],0]];const steps=[];const V=[0.5,0.5,0.5,0.5,0.5];const a=0.1;
  EP.forEach(([tr,R],e)=>tr.forEach((s,i)=>{const last=i===tr.length-1;const s2=last?(R?'R':'L'):tr[i+1];const r=last?R:0;const vn=last?0:V[s2];const old=V[s];const d=r+vn-old;V[s]=old+a*d;
    steps.push({e:e+1,s,s2,r,vn,old,d,nw:V[s],V:V.slice(),ep:tr,i})}));
  const NM='ABCDE',TRUE=[1,2,3,4,5].map(v=>v/6);
  stepper(root,k=>{initSvg(svg,620,380);setV(root,'s',k+' / '+steps.length);const st=k?steps[k-1]:null;const Vc=st?st.V:[0.5,0.5,0.5,0.5,0.5];
    const X=i=>130+i*90,yN=250,Yb=v=>yN-34-150*v;
    ln(svg,[X(-1)+18,yN],[X(5)-18,yN],'#bfbfbf',2);
    E('rect',{x:X(-1)-18,y:yN-18,width:36,height:36,fill:'#d9d9d9',stroke:'#7f7f7f'},svg);T(svg,X(-1),yN+5,'0','lab');E('rect',{x:X(5)-18,y:yN-18,width:36,height:36,fill:'#c5e0b4',stroke:'#548235'},svg);T(svg,X(5),yN+5,'1','lab');
    T(svg,X(-1),yN+48,'reward 0','');T(svg,X(5),yN+48,'reward 1','');
    for(let i=0;i<5;i++){const hi=st&&st.s===i;E('rect',{x:X(i)-20,y:Yb(Vc[i]),width:40,height:yN-34-Yb(Vc[i]),fill:hi?'#ffc000':'#9dc3e6',stroke:hi?'#bf9000':C.blue},svg);
      ln(svg,[X(i)-26,Yb(TRUE[i])],[X(i)+26,Yb(TRUE[i])],'#1f1f1f',1.8,'5 3');T(svg,X(i),Yb(Vc[i])-8,nt(Vc[i],4),hi?'lab':'');
      dot(svg,X(i),yN,17,i===2?'#7f7f7f':'#595959');T(svg,X(i),yN+5,NM[i],'lab').style.fill='#fff'}
    T(svg,40,Yb(0.5)+5,'V','lab');T(svg,40,58,'dashed: true values','','start');
    if(st){const tx=st.s2==='R'?X(5):st.s2==='L'?X(-1):X(st.s2);const dir=Math.sign(tx-X(st.s));arrowPx(svg,X(st.s)+dir*20,yN+28,tx-dir*20,yN+28,'ln so','fo');
      T(svg,310,24,'episode '+st.e+': '+st.ep.map(s=>NM[s]).join('-')+'-'+(EP[st.e-1][1]?'end (+1)':'end (0)'),'lab');
      const nm=NM[st.s],nxt=st.s2==='R'||st.s2==='L'?'0 (end)':nt(st.vn,4);
      T(svg,310,yN+76,'δ = r + V(s′) − V('+nm+') = '+st.r+' + '+nxt.replace(' (end)','')+' − '+nt(st.old,4)+' = '+nt(st.d,4),'lab');
      col(T(svg,310,yN+104,'V('+nm+') ← '+nt(st.old,4)+' + 0.1 · '+nt(st.d,4)+' = '+nt(st.nw,4),'lab'),st.d===0?'#7f7f7f':'#c55a11')}
    else{T(svg,310,24,'start: V = 0.5 everywhere, α = 0.1, γ = 1','lab');T(svg,310,yN+90,'each move gives one TD update of the state it left','')}})};

/* ---------- MC vs TD: RMS error curves ---------- */
FIG['rl-rw']=root=>{const P=Plot(svgOf(root),{w:600,h:360,x:[0,100],y:[0,0.25],m:{l:52,r:14,t:16,b:42}});
  P.axes({xt:[0,25,50,75,100],yt:[0,0.05,0.1,0.15,0.2,0.25],fy:v=>v.toFixed(2),xl:'episodes',yl:'RMS error (mean of 100 runs)'});
  const TDc=['#1f4e9a','#4472c4','#8eaadb'],MCc=['#843c0c','#c55a11','#ed7d31','#f4b183'];let ti=0,mi=0;const leg=[];
  Object.keys(RD.rw).forEach(k=>{const td=k.startsWith('TD');const c=td?TDc[ti++]:MCc[mi++];const p=P.path(RD.rw[k].map((v,i)=>[i,v]),'ln',P.dyn);p.setAttribute('stroke',c);p.setAttribute('stroke-width',2.2);if(!td)p.setAttribute('stroke-dasharray','7 4');leg.push([k.replace('TD(0), ','TD ').replace('MC, ','MC '),c,td])});
  leg.forEach(([t,c,td],i)=>{const col2=td?0:1,row=td?i:i-3;const x=330+col2*130,y=34+row*22;const l=E('line',{x1:x,y1:y-5,x2:x+26,y2:y-5,stroke:c,'stroke-width':2.5,'stroke-dasharray':td?'':'7 4'},P.top);T(P.top,x+32,y,t,'','start')})};

/* ---------- SARSA vs Q-learning targets ---------- */
FIG['rl-targets']=root=>{const svg=initSvg(svgOf(root),480,330);
  const tree=(x0,title,mx)=>{T(svg,x0+110,24,title,'lab big');const s=[x0+110,62];dot(svg,s[0],s[1],13,'#fff',C.blue,2);T(svg,s[0],s[1]+5,'S','lab');
    const a=[x0+110,122];ln(svg,s,a,'#7f7f7f',1.6);dot(svg,a[0],a[1],7,'#1f1f1f');TT(svg,a[0]+14,a[1]+5,'A','lab','start');
    const s2=[x0+110,190];ln(svg,a,s2,'#7f7f7f',1.6);halo(TT(svg,x0+124,160,'R','lab','start'));dot(svg,s2[0],s2[1],13,'#fff',C.blue,2);T(svg,s2[0],s2[1]+5,'S′','lab');
    const A2=[-60,0,60].map(d=>[x0+110+d,256]);A2.forEach((p,i)=>{const on=mx?true:i===1;ln(svg,s2,p,on?(mx?C.red:C.orange):'#d0d0d0',on?2.4:1.3);dot(svg,p[0],p[1],7,on?'#1f1f1f':'#bfbfbf')});
    if(mx){E('path',{d:'M'+(x0+62)+',236 Q'+(x0+110)+',262 '+(x0+158)+',236',fill:'none',stroke:C.red,'stroke-width':2},svg);col(T(svg,x0+110,290,'max over a′','lab'),C.red);T(svg,x0+110,314,'the greedy action','')}
    else{col(TT(svg,x0+124,276,'A′','lab','start'),'#c55a11');col(T(svg,x0+110,298,'the action it will take','lab'),'#c55a11');T(svg,x0+110,320,'(ε-greedy, exploration included)','')}};
  tree(10,'SARSA',false);tree(250,'Q-learning',true);ln(svg,[240,40],[240,320],'#e0e0e0',1)};

/* ---------- cliff walking: paths and learning curves (precomputed) ---------- */
FIG['rl-cliff']=root=>{const svg=svgOf(root);const D=RD.cliff;const cs=42,x0=58,y0=34;
  const draw=m=>{initSvg(svg,620,420);for(let r=0;r<4;r++)for(let c=0;c<12;c++){const cl=r===3&&c>=1&&c<=10;E('rect',{x:x0+c*cs,y:y0+r*cs,width:cs,height:cs,fill:cl?'#f4b6b6':'#fff',stroke:'#d0d0d0'},svg)}
    T(svg,x0+6*cs,y0+3*cs+27,'the cliff: −100, back to S','');T(svg,x0+cs/2,y0+3*cs+27,'S','lab');T(svg,x0+11.5*cs,y0+3*cs+27,'G','lab');
    const show=[['sarsa','SARSA',C.blue,-5],['q','Q-learning',C.red,5]].filter(s=>m==='both'||m===s[0]);
    show.forEach(([k,nm,c,off])=>{const p=D[k].path;E('polyline',{points:p.map(([r,cc])=>(x0+cc*cs+cs/2)+','+(y0+r*cs+cs/2+off)).join(' '),fill:'none',stroke:c,'stroke-width':3.5,'stroke-linejoin':'round'},svg)});
    const lg=show.map(([k,nm,c])=>[nm+': '+(D[k].path.length-1)+' moves',c]);lg.forEach(([t,c],i)=>col(T(svg,x0+i*260,22,t,'lab','start'),c));
    const P=Plot(svg,{at:[0,214],w:620,h:206,x:[0,500],y:[-100,0],m:{l:58,r:14,t:10,b:40}});P.axes({xt:[0,100,200,300,400,500],yt:[-100,-75,-50,-25,0],xl:'episode',yl:'return'});
    show.forEach(([k,nm,c])=>{const v=D[k].curve;const p=P.path(v.map((y,i)=>[5+2*i,y]),'ln',P.dyn);p.setAttribute('stroke',c);p.setAttribute('stroke-width',2.2);
      P.text(500,D[k].online,nm+' '+nf(D[k].online,1),'lab','end',-4,k==='sarsa'?-12:22).style.fill=c})};
  segs(root,'m',draw);draw('both')};

/* ---------- DQN diagram ---------- */
FIG['rl-dqn']=root=>{const svg=initSvg(svgOf(root),620,330);
  box(svg,10,40,120,54,'environment','#e2f0d9',{cls:'lab'});box(svg,200,30,150,74,'replay buffer\n(s, a, r, s′) × 10⁵','#fff2cc',{cls:'lab'});
  arrowPx(svg,132,67,198,67,'ln thin sk','fk');T(svg,165,56,'store','');
  box(svg,420,40,180,54,'random mini-batch','#fbe5d6',{cls:'lab'});arrowPx(svg,352,67,418,67,'ln thin sk','fk');T(svg,385,56,'sample','');
  box(svg,60,170,190,60,'online net\nQ(s, a; w)','#dae3f3',{cls:'lab'});box(svg,370,170,200,60,'target net\nQ(s′, a′; w⁻)','#e7e6e6',{cls:'lab'});
  arrowPx(svg,470,96,180,166,'ln thin sm','fm');arrowPx(svg,510,96,470,166,'ln thin sm','fm');
  arrowPx(svg,250,214,368,214,'ln thin sm dash','fm');T(svg,309,206,'copy w every','');T(svg,309,246,'200 steps','');
  box(svg,90,276,450,40,'loss = ( r + γ maxₐ′ Q(s′, a′; w⁻) − Q(s, a; w) )²','#fff',{cls:'lab'});
  arrowPx(svg,155,232,155,274,'ln thin sk','fk');arrowPx(svg,470,232,470,274,'ln thin sk','fk');
  arrowPx(svg,62,200,40,200,'ln thin so','fo');ln(svg,[40,200],[40,96],C.orange,1.4);arrowPx(svg,40,98,40,96,'ln thin so','fo');halo(col(T(svg,18,150,'act ε-greedily','','start'),'#c55a11'))};

/* ---------- REINFORCE on a softmax policy ---------- */
FIG['rl-softmax']=root=>{const svg=svgOf(root);const th=[0.5,0,-0.5];const sm=v=>{const m=Math.max(...v);const e=v.map(x=>Math.exp(x-m));const s=e.reduce((a,b)=>a+b,0);return e.map(x=>x/s)};
  const pi=sm(th),a=1,lr=0.5;
  const draw=m=>{initSvg(svg,620,350);const G=m==='pos'?1:m==='neg'?-1:0;const grad=pi.map((p,i)=>G*((i===a?1:0)-p));const th2=th.map((t,i)=>t+lr*grad[i]);const pi2=sm(th2);
    const X=i=>110+i*170,yB=250,H=300;ln(svg,[40,yB],[600,yB],'#595959',1.2);
    for(let i=0;i<3;i++){E('rect',{x:G?X(i)-40:X(i)-34,y:yB-H*pi[i],width:G?36:68,height:H*pi[i],fill:'#d9d9d9',stroke:'#7f7f7f'},svg);
      T(svg,G?X(i)-22:X(i),yB-H*pi[i]-8,nf(pi[i],3),G?'':'lab');
      if(G){E('rect',{x:X(i)+4,y:yB-H*pi2[i],width:36,height:H*pi2[i],fill:i===a?(G>0?'#a9d18e':'#f4b183'):'#9dc3e6',stroke:i===a?(G>0?'#548235':'#c55a11'):C.blue},svg);T(svg,X(i)+24,yB-H*pi2[i]-8,nf(pi2[i],3),'lab')}
      TT(svg,X(i),yB+24,'a_'+(i+1)+(i===a?' (sampled)':''),'lab');T(svg,X(i),yB+46,'θ = '+nf(th[i],1)+(G?' → '+nf(th2[i],3):''),'')}
    if(!G){T(svg,310,24,'π = softmax(θ), θ = (0.5, 0, −0.5)','lab');T(svg,310,48,'the agent samples a₂ and observes a return G','')}
    else{TT(svg,310,24,'G = '+(G>0?'+1':'−1')+':  θ ← θ + α G (e_a − π),  α = 0.5','lab');col(T(svg,310,48,G>0?'a₂ was good: its probability goes up, the others down':'a₂ was bad: its probability goes down','lab'),G>0?'#548235':'#c55a11');
      T(svg,590,96,'grey: before','','end');T(svg,590,116,'colour: after','','end')}
    T(svg,310,336,'∇θ log π(a₂) = e₂ − π = ('+[0,1,2].map(i=>nf((i===a?1:0)-pi[i],3)).join(', ')+')','')};
  segs(root,'g',draw);draw('none')};

/* ---------- REINFORCE on CartPole (precomputed) ---------- */
FIG['rl-pg']=root=>{const svg=svgOf(root);const D=RD.pg;
  const draw=m=>{const P=Plot(svg,{w:620,h:360,x:[0,800],y:[0,520],m:{l:54,r:14,t:16,b:42}});P.axes({xt:[0,200,400,600,800],yt:[0,100,200,300,400,500],xl:'episode',yl:'episode length (moving average of 20)'});
    P.line(0,500,800,500,'ln thin sk dash',P.bg);P.text(10,500,'maximum: 500 steps','','start',0,-6,P.bg);
    const show=[['plain','without baseline',C.gray],['base','with a learned baseline',C.blue]].filter(s=>m==='both'||m===s[0]);
    show.forEach(([k,nm,c],j)=>{const d=D[k];const xs=d.mean.map((_,i)=>20+4*i);const poly=xs.map((x,i)=>[x,d.hi[i]]).concat(xs.map((x,i)=>[x,d.lo[i]]).reverse());
      const pg=P.poly(poly,'',P.dyn);pg.setAttribute('fill',c);pg.setAttribute('fill-opacity',0.15);
      const p=P.path(xs.map((x,i)=>[x,d.mean[i]]),'ln',P.dyn);p.setAttribute('stroke',c);p.setAttribute('stroke-width',2.6);
      const t=P.text(790,j?120:60,nm+': last 100 episodes '+Math.round(d.last100.reduce((a,b)=>a+b,0)/5),'lab','end');t.style.fill=c});
    P.text(790,show.length>1?20:20,'line: mean of 5 seeds · band: min to max','','end')};
  segs(root,'v',draw);draw('both')};

/* ---------- PPO's clipped objective ---------- */
FIG['rl-ppo']=root=>{const svg=svgOf(root);
  onInput(root,'e',draw);
  function draw(){const e=+q(root,'e').value;setV(root,'e',e.toFixed(2));initSvg(svg,620,360);
    [[1,0],[-1,310]].forEach(([A,ox])=>{const P=Plot(svg,{at:[ox,0],w:310,h:330,x:[0,2],y:A>0?[0,2]:[-2,0],m:{l:44,r:12,t:30,b:42}});
      P.axes({xt:[0,0.5,1,1.5,2],yt:A>0?[0,0.5,1,1.5,2]:[-2,-1.5,-1,-0.5,0],fy:v=>nf(v,1),xl:'probability ratio r'});
      const lo=1-e,hi=1+e;if(A>0)P.rect(hi,0,2,2,'fos',P.bg);else P.rect(0,-2,lo,0,'fos',P.bg);
      P.line(1,A>0?0:-2,1,A>0?2:0,'ln thin sm dash',P.bg);P.fn(r=>r*A,'ln thin sm dash',0,2,20,P.bg);
      P.fn(r=>Math.min(r*A,Math.min(Math.max(r,lo),hi)*A),'ln sb',0,2,400);
      T(P.root,155,18,A>0?'advantage A > 0 (good action)':'advantage A < 0 (bad action)','lab');
      if(A>0){P.text(hi,0.5,'flat: no gradient','','start',5,0);P.text(hi,0.32,'beyond 1 + ε','','start',5,0);P.text(0.15,0.42,'r·A','','start')}
      else{P.text(lo/2,-1.6,'flat: no gradient','','middle');P.text(lo/2,-1.78,'below 1 − ε','','middle');P.text(1.55,-1.25,'r·A','','start')}})}
  draw()};

/* ---------- the RLHF pipeline ---------- */
FIG['rl-rlhf']=root=>{const svg=svgOf(root);
  stepper(root,s=>{initSvg(svg,620,290);setV(root,'s',s+' / 3');
    const st=[['1 · supervised fine-tuning','#dae3f3'],['2 · reward model','#fff2cc'],['3 · RL with PPO','#e2f0d9']];
    st.forEach(([t,c],i)=>box(svg,10+i*204,8,192,40,t,s===i+1?c:'#f7f7f7',{cls:'lab',stroke:s===i+1?'#404040':'#d0d0d0'}));
    for(let i=0;i<2;i++)arrowPx(svg,203+i*204,28,213+i*204,28,'ln thin sm','fm');
    if(s===0){T(svg,310,130,'a pre-trained language model predicts the next token','lab');T(svg,310,160,'it is not yet helpful or safe: three stages fix that','');
      T(svg,310,214,'InstructGPT (2022): the 1.3-billion-parameter RLHF model','');T(svg,310,238,'was preferred to the 175-billion GPT-3','')}
    if(s===1){box(svg,40,90,160,46,'prompt','#fff',{cls:''});arrowPx(svg,202,113,250,113,'ln thin sk','fk');box(svg,252,82,150,62,'answers written\nby people','#fbe5d6',{cls:''});
      arrowPx(svg,404,113,452,113,'ln thin sk','fk');box(svg,454,82,140,62,'fine-tune\n(cross-entropy)','#dae3f3',{cls:''});
      T(svg,310,200,'plain supervised learning on demonstrations','lab');TT(svg,310,228,'result: the reference policy π_{ref}','lab')}
    if(s===2){box(svg,30,80,120,40,'prompt x','#fff',{cls:''});box(svg,190,64,130,34,'answer A','#e2f0d9',{cls:''});box(svg,190,108,130,34,'answer B','#fbe5d6',{cls:''});
      arrowPx(svg,152,96,188,82,'ln thin sk','fk');arrowPx(svg,152,104,188,124,'ln thin sk','fk');arrowPx(svg,322,100,362,100,'ln thin sk','fk');
      box(svg,364,78,110,44,'person: A ≻ B','#fff',{cls:''});arrowPx(svg,476,100,512,100,'ln thin sk','fk');box(svg,514,78,96,44,'r̂(x, y)','#fff2cc',{cls:'lab'});
      T(svg,310,182,'Bradley–Terry: P(A ≻ B) = σ( r̂(A) − r̂(B) )','lab');T(svg,310,212,'loss = − log σ( r̂(winner) − r̂(loser) ): a logistic regression','');
      T(svg,310,242,'tens of thousands of ranked prompts; r̂ is a language model with a scalar head','')}
    if(s===3){box(svg,20,80,100,40,'prompt x','#fff',{cls:''});arrowPx(svg,122,100,160,100,'ln thin sk','fk');box(svg,162,72,130,56,'the policy\nwrites y','#e2f0d9',{cls:''});
      arrowPx(svg,294,100,332,100,'ln thin sk','fk');box(svg,334,72,130,56,'score r̂(x, y)','#fff2cc',{cls:''});arrowPx(svg,466,100,504,100,'ln thin sk','fk');box(svg,506,72,100,56,'PPO\nupdate','#dae3f3',{cls:''});
      E('path',{d:'M556,130 C556,170 227,170 227,132',fill:'none',stroke:'#7f7f7f','stroke-width':1.4},svg);arrowPx(svg,227,140,227,131,'ln thin sm','fm');
      TT(svg,310,206,'maximise  E[ r̂(x, y) ] − β KL( π_θ ‖ π_{ref} )','lab');T(svg,310,236,'the KL term keeps the model close to the SFT model:','');T(svg,310,258,'without it, it drifts to answers that fool r̂','')}})};

/* ---------- reward hacking: proxy vs true utility as β decreases (precomputed) ---------- */
FIG['rl-hack']=root=>{const svg=svgOf(root);const D=RD.rlhf,rows=D.rows;
  onInput(root,'k',draw);
  function draw(){const k=+q(root,'k').value;const row=rows[k];setV(root,'k','β = '+row.beta);initSvg(svg,620,370);
    const P=Plot(svg,{at:[0,0],w:340,h:340,x:[0,18],y:[-1.5,5],m:{l:44,r:10,t:26,b:42}});P.axes({xt:[0,5,10,15],yt:[-1,0,1,2,3,4,5],xl:'KL divergence from π_ref'.replace('π_ref','the reference')});
    const pr=P.path(rows.map(r=>[r.kl,r.proxy]),'ln sb',P.dyn),tr=P.path(rows.map(r=>[r.kl,r.true]),'ln so',P.dyn);
    P.dot(row.kl,row.proxy,6,'fb pt');P.dot(row.kl,row.true,6,'fo pt');
    col(P.text(0.6,4.6,'proxy r̂ (what PPO sees)','lab','start',0,0),C.blue);col(P.text(6.5,-1.1,'true utility','lab','start',0,0),'#c55a11');
    T(P.root,170,16,'proxy '+nf(row.proxy,2)+' · true '+nf(row.true,2),'lab');
    const edges=D.edges,nb=edges.length-1;const Q=Plot(svg,{at:[350,0],w:270,h:340,x:[-3,5],y:[0,1],m:{l:40,r:8,t:26,b:42}});
    Q.axes({xt:[-2,0,2,4],yt:[0,0.5,1],fy:v=>nf(v,1),xl:'answer length ℓ'});Q.rect(D.seen[0],0,D.seen[1],1,'fbs',Q.bg);
    for(let b=0;b<nb;b++){const w=(edges[b+1]-edges[b]);Q.rect(edges[b]+0.06*w,0,edges[b]+0.48*w,D.ref_hist[b],'',Q.dyn).setAttribute('fill','#bfbfbf');
      Q.rect(edges[b]+0.52*w,0,edges[b]+0.94*w,row.hist[b],'',Q.dyn).setAttribute('fill',C.orange)}
    T(Q.root,135,16,'probability mass by length','lab');Q.text(-2.8,0.93,'grey: π_ref','','start');col(Q.text(-2.8,0.84,'orange: π_β','','start'),'#c55a11');
    Q.text(D.seen[0]+0.1,0.72,'lengths','','start');Q.text(D.seen[0]+0.1,0.64,'people saw','','start');
    col(T(svg,310,366,'mean length '+nf(row.len,2)+(row.len>D.seen[1]+0.5?': far beyond anything the labellers saw':''),'lab'),row.len>D.seen[1]+0.5?C.red:'#1f1f1f')}
  draw()};
})();
