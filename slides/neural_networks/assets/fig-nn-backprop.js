/* Figures for 02_backpropagation.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,q,setV,setR,svgOf}=lib;const {drawNet,box,stepper,segs,sig,f2,f3,NET,tinyForward,drawTiny,TT}=window.MLNN;
const FWD=['X','Z^{[1]}','A^{[1]}','Z^{[2]}','A^{[2]}','L'],FSUB=['input','linear','activation','linear','prediction','loss'];const BWD=['∂W^{[1]}, ∂b^{[1]}','δ^{[1]}','∂A^{[1]}','∂W^{[2]}, ∂b^{[2]}','δ^{[2]}','L'];
function chain(svg,y,labels,subs,hi,col,back){labels.forEach((t,i)=>{const x=12+i*101;const on=hi.includes(i);E('rect',{x:x,y:y,width:90,height:52,rx:8,fill:on?col:'#f2f2f2',stroke:on?col:'#bfbfbf'},svg);
  const tt=TT(svg,x+45,y+24,t,'lab');tt.style.fill=on?'#fff':'#595959';const st=T(svg,x+45,y+43,subs[i],'');st.style.fill=on?'#fff':'#8c8c8c';if(i<labels.length-1)arrowPx(svg,back?x+100:x+91,y+26,back?x+91:x+100,y+26,'ln thin sm','fm')})}
FIG['fb-walk']=root=>{const svg=initSvg(root.querySelector('svg'),620,170);const inp=q(root,'s');const panels=[...root.querySelectorAll('[data-i]')];
  const fwdHi=[[0],[0,1],[0,1,2],[0,1,2,3],[0,1,2,3,4],[0,1,2,3,4,5]];const bwdHi=[[5],[4,5],[3,4,5],[2,3,4,5],[1,2,3,4,5],[0,1,2,3,4,5]];
  function draw(){const s=+inp.value;setV(root,'s',s<6?'forward '+(s+1)+'/6':'backward '+(s-5)+'/6');svg.innerHTML='';
    T(svg,10,14,'Forward →','lab','start');chain(svg,22,FWD,FSUB,s<6?fwdHi[s]:fwdHi[5],'#2e7d5b',false);
    T(svg,10,100,'← Backward','lab','start');chain(svg,108,BWD,['gradient','hidden error','','gradient','output error','loss'],s<6?[]:bwdHi[s-6],'#a3336b',true);
    panels.forEach(p=>p.hidden=(+p.dataset.i!==s))}inp.addEventListener('input',draw);draw()};
FIG['net-back']=root=>{const svg=initSvg(svgOf(root),520,300);drawNet(svg,[2,4,1],{x0:50,y0:40,w:400,h:220,r:16,label:(l,i)=>l===0?'x'+(i+1):l===1?'':'L',fill:(l)=>l===0?'#70ad47':l===1?'#a3336b':'#a3336b'});
  arrowPx(svg,420,24,280,24,'ln sr','fr');TT(svg,350,18,'δ^{[2]}','lab');arrowPx(svg,230,24,90,24,'ln sr','fr');TT(svg,160,18,'δ^{[1]}','lab');
  TT(svg,260,292,'The error starts at the loss and travels backward: output → δ^{[2]} → hidden → δ^{[1]} → input','','middle')};
/* ---- (a+b)·c computational graph with numbers ---- */
FIG['graph-num']=root=>{const svg=svgOf(root);
  stepper(root,s=>{initSvg(svg,600,330);const node=(x,y,t,c)=>{E('circle',{cx:x,cy:y,r:26,fill:c,stroke:'#404040'},svg);T(svg,x,y+6,t,'lab big')};
    const fw=(x,y,t,a)=>{const tt=T(svg,x,y,t,'lab',a);tt.style.fill='#1f3864'};const bw=(x,y,t,a)=>{const tt=T(svg,x,y,t,'lab',a);tt.style.fill='#c00000'};
    const A=[80,62],B=[80,172],C=[80,270],Q=[270,115],M=[450,200],F=[565,200];
    node(...A,'a','#c5e0b4');node(...B,'b','#c5e0b4');node(...C,'c','#c5e0b4');node(...Q,'+','#dae3f3');node(...M,'×','#dae3f3');
    arrowPx(svg,96,66,244,109,'ln thin sk','fk');arrowPx(svg,96,164,244,122,'ln thin sk','fk');arrowPx(svg,294,127,425,188,'ln thin sk','fk');arrowPx(svg,96,275,424,207,'ln thin sk','fk');arrowPx(svg,476,200,548,200,'ln thin sk','fk');T(svg,F[0]+8,F[1]+7,'f','lab big');
    fw(A[0],A[1]-34,'a = 2');fw(B[0]-34,B[1]+5,'b = 5','end');fw(C[0]-34,C[1]+5,'c = −4','end');
    if(s>=1)fw(Q[0],Q[1]-36,'q = a + b = 7');if(s>=2)fw(F[0],F[1]-30,'f = q·c = −28');
    const dash=(x1,y1,x2,y2)=>E('line',{x1,y1,x2,y2,stroke:'#c00000','stroke-width':2.5,'stroke-dasharray':'6 4'},svg);
    if(s>=3)bw(F[0],F[1]+36,'∂f/∂f = 1');
    if(s>=4){dash(425,190,294,128);dash(424,210,96,282);bw(Q[0],Q[1]+50,'∂f/∂q = −4');bw(C[0],C[1]+46,'∂f/∂c = 7')}
    if(s>=5){dash(244,111,96,68);dash(244,124,96,166);bw(A[0],A[1]+46,'∂f/∂a = −4');bw(B[0],B[1]+46,'∂f/∂b = −4')}})};
/* ---- the three gates ---- */
FIG['gates']=root=>{const svg=initSvg(svgOf(root),960,230);
  const gate=(x0,title,op,a,b,out,ga,gb,rule)=>{T(svg,x0+150,20,title,'lab big');const node=(x,y,t,c)=>{E('circle',{cx:x,cy:y,r:22,fill:c,stroke:'#404040'},svg);T(svg,x,y+5,t,'lab')};
    node(x0+40,80,String(a),'#c5e0b4');node(x0+40,160,String(b),'#c5e0b4');node(x0+160,120,op,'#dae3f3');arrowPx(svg,x0+62,80,x0+138,110,'ln thin sk','fk');arrowPx(svg,x0+62,160,x0+138,130,'ln thin sk','fk');arrowPx(svg,x0+182,120,x0+250,120,'ln thin sk','fk');
    const t1=T(svg,x0+270,125,String(out),'lab big');t1.style.fill='#1f3864';const g=T(svg,x0+270,150,'grad 2','lab');g.style.fill='#c00000';
    const ta=T(svg,x0+40,48,'grad '+ga,'lab');ta.style.fill='#c00000';const tb=T(svg,x0+40,200,'grad '+gb,'lab');tb.style.fill='#c00000';T(svg,x0+150,222,rule,'','middle')};
  gate(10,'add gate: distributor','+',3,5,8,2,2,'both inputs receive the upstream gradient unchanged');gate(330,'multiply gate: swapper','×',3,5,15,'2·5 = 10','2·3 = 6','each input gets upstream × the other input');gate(650,'max gate: router','max',3,5,5,0,2,'only the winner receives the gradient (ReLU, max-pool)')};
/* ---- one neuron: forward and backward with numbers ---- */
FIG['neuron-bp']=root=>{const svg=svgOf(root);const x=2,w=-0.5,b=0.3,y=1,al=0.5;const z=w*x+b,a=sig(z),L=-Math.log(a);const dLda=-1/a,dadz=a*(1-a),dLdz=a-y,dLdw=dLdz*x,dLdb=dLdz;const w2=w-al*dLdw,b2=b-al*dLdb,z2=w2*x+b2,a2=sig(z2),L2=-Math.log(a2);
  stepper(root,s=>{initSvg(svg,620,300);const N=s>=5;const node=(xx,yy,t,c,r)=>{E('circle',{cx:xx,cy:yy,r:r||24,fill:c,stroke:'#404040'},svg);T(svg,xx,yy+5,t,'lab')};
    const fw=(xx,yy,t)=>{const tt=T(svg,xx,yy,t,'lab');tt.style.fill='#1f3864'};const bw=(xx,yy,t)=>{const tt=T(svg,xx,yy,t,'lab');tt.style.fill='#c00000'};
    node(50,80,'x','#c5e0b4');node(50,170,'w','#ffe699');node(50,260,'b','#ffe699');node(190,125,'×','#dae3f3');node(310,170,'+','#dae3f3');node(430,170,'σ','#dae3f3');node(550,170,'L','#fbe5d6');
    arrowPx(svg,74,80,166,112,'ln thin sk','fk');arrowPx(svg,74,170,166,138,'ln thin sk','fk');arrowPx(svg,214,125,286,158,'ln thin sk','fk');arrowPx(svg,74,260,286,182,'ln thin sk','fk');arrowPx(svg,334,170,406,170,'ln thin sk','fk');arrowPx(svg,454,170,526,170,'ln thin sk','fk');
    T(svg,250,128,'w·x','');T(svg,370,152,'z','');T(svg,490,152,'a','');T(svg,550,215,'y = 1','');T(svg,550,232,'L = −log a','');
    fw(50,44,'x = 2');fw(50,134,N?'w = '+f3(w2):'w = −0.5');fw(50,224,N?'b = '+f3(b2):'b = 0.3');fw(190,88,N?f3(w2*x):'−1.0');fw(310,133,N?'z = '+f3(z2):'z = −0.7');fw(430,133,N?'a = '+f3(a2):'a = 0.332');fw(550,133,N?'L = '+f3(L2):'L = 1.103');
    const bws=(xx,yy,t)=>{const tt=T(svg,xx,yy,t,'lab','start');tt.style.fill='#c00000'};
    if(s>=1&&!N){bw(492,212,'∂L/∂a');bw(492,230,'= '+f3(dLda))}if(s>=2&&!N){bw(368,212,'∂L/∂z');bw(368,230,'= '+f3(dLdz));T(svg,430,252,'σ′ = a(1−a) = '+f3(dadz),'')}
    if(s>=3&&!N){bws(84,200,'∂L/∂w = '+f3(dLdw));bws(84,286,'∂L/∂b = '+f3(dLdb))}
    if(s>=4&&!N){box(svg,318,258,292,40,'w ← w − 0.5·(−1.336) = 0.168\nb ← b − 0.5·(−0.668) = 0.634','#fff2cc',{lh:17,cls:''})}
    if(N)box(svg,262,240,348,44,'after one step the loss fell from 1.103 to 0.321\nand a rose from 0.332 to 0.725','#e2f0d9',{lh:18,cls:''})})};
/* ---- the tiny 2-2-1 network: backward with numbers ---- */
FIG['net-num']=root=>{const svg=svgOf(root);const N=NET;const F=tinyForward(N);const al=0.5;
  const d2=F.yh-N.y;const dW2=F.a1.map(v=>v*d2);const db2=d2;const dA1=[d2*N.W2[0][0],d2*N.W2[1][0]];const d1=dA1.map((v,j)=>v*(1-F.a1[j]**2));const dW1=[[N.x[0]*d1[0],N.x[0]*d1[1]],[N.x[1]*d1[0],N.x[1]*d1[1]]];
  const N2={x:N.x,y:N.y,W1:N.W1.map((r,i)=>r.map((v,j)=>+(v-al*dW1[i][j]).toFixed(3))),b1:N.b1.map((v,j)=>+(v-al*d1[j]).toFixed(3)),W2:N.W2.map((r,i)=>[+(r[0]-al*dW2[i]).toFixed(3)]),b2:[+(N.b2[0]-al*db2).toFixed(3)]};const F2=tinyForward(N2);
  setR(root,'l0',f3(F.L));setR(root,'l1',f3(F2.L));
  stepper(root,s=>{initSvg(svg,600,420);const upd=s>=6;const pos=drawTiny(svg,upd?N2:N,upd?F2:F,5,{hiEdge:(s===2||s===3)?2:s===5?1:0});
    const X=[pos[0][0][0],pos[1][0][0],pos[2][0][0]];E('rect',{x:10,y:292,width:580,height:122,rx:8,fill:'#fdf2f2',stroke:'#e6b8b8'},svg);
    T(svg,20,310,upd?'updated parameters (α = 0.5)':'gradients of the loss L (backward pass, right to left)','lab','start').style.fill='#c00000';
    const bw=(col,row,t)=>{const tt=TT(svg,X[col],330+row*21+10,t,'','middle',15);tt.style.fill='#c00000';tt.style.fontSize='15px'};const mj=a=>a.map(v=>String(v).replace('-','−')).join(', ');
    if(!upd){if(s>=1)bw(2,0,'δ^{[2]} = ŷ − y = '+f3(d2));if(s>=2){bw(2,1,'∂W^{[2]} = ('+f3(dW2[0])+', '+f3(dW2[1])+')');bw(2,2,'∂b^{[2]} = '+f3(db2))}
      if(s>=3)bw(1,0,'∂L/∂a^{[1]} = ('+f3(dA1[0])+', '+f3(dA1[1])+')');if(s>=4)bw(1,1,'δ^{[1]} = ('+f3(d1[0])+', '+f3(d1[1])+')');
      if(s>=5){bw(0,0,'∂W^{[1]} = ['+f3(dW1[0][0])+', '+f3(dW1[0][1])+']');bw(0,1,'['+f3(dW1[1][0])+', '+f3(dW1[1][1])+']');bw(0,2,'∂b^{[1]} = ('+f3(d1[0])+', '+f3(d1[1])+')')}
      if(s===0)T(svg,300,360,'forward pass done: every z and a is stored','','middle')}
    else{bw(2,0,'W^{[2]} = ('+mj([N2.W2[0][0],N2.W2[1][0]])+')');bw(2,1,'b^{[2]} = '+N2.b2[0]);bw(0,0,'W^{[1]} = ['+mj(N2.W1[0])+']');bw(0,1,'['+mj(N2.W1[1])+']');bw(1,0,'b^{[1]} = ('+mj(N2.b1)+')');
      if(s>=7)bw(1,2,'new loss '+f3(F2.L)+'  (was '+f3(F.L)+')')}})};
function initSim(scale,act){const r=rng(5);const n=100,m=200,L=10;let A=[...Array(m)].map(()=>[...Array(n)].map(()=>randn(r)));const Ws=[],As=[A],Zs=[];const stdA=[];
  const g=act==='relu'?(z=>z>0?z:0):Math.tanh;const gd=act==='relu'?((z,a)=>z>0?1:0):((z,a)=>1-a*a);
  for(let l=0;l<L;l++){const s=scale/Math.sqrt(n);const W=[...Array(n)].map(()=>[...Array(n)].map(()=>s*randn(r)));Ws.push(W);const Z=A.map(row=>{const z=new Array(n).fill(0);for(let i=0;i<n;i++){const ai=row[i];if(ai===0)continue;const Wi=W[i];for(let j=0;j<n;j++)z[j]+=ai*Wi[j]}return z});
    Zs.push(Z);A=Z.map(z=>z.map(g));As.push(A);stdA.push(Math.sqrt(A.reduce((s,row)=>s+row.reduce((t,v)=>t+v*v,0),0)/(m*n)))}
  let D=A.map(row=>row.map(()=>randn(r)));const stdG=new Array(L);for(let l=L-1;l>=0;l--){D=D.map((row,k)=>row.map((d,j)=>d*gd(Zs[l][k][j],As[l+1][k][j])));stdG[l]=Math.sqrt(D.reduce((s,row)=>s+row.reduce((t,v)=>t+v*v,0),0)/(m*n));
    const W=Ws[l];D=D.map(row=>{const o=new Array(n).fill(0);for(let i=0;i<n;i++){let s=0;const Wi=W[i];for(let j=0;j<n;j++)s+=row[j]*Wi[j];o[i]=s}return o})}
  return {stdA,stdG}}
FIG['init']=root=>{const svg=initSvg(svgOf(root),600,300);let act='tanh',mode='good';const cache={};const b1=root.querySelectorAll('.seg[data-g="act"] button'),b2=root.querySelectorAll('.seg[data-g="init"] button');
  function draw(){const scale=mode==='small'?0.5:mode==='large'?(act==='relu'?2.2:3):(act==='relu'?Math.SQRT2:1);const key=act+mode;if(!cache[key])cache[key]=initSim(scale,act);const R=cache[key];svg.innerHTML='';
    [['activation size (std) per layer, forward →',R.stdA,'#4472c4'],['gradient size (std) per layer, ← backward',R.stdG,'#c00000']].forEach(([lab,v,c],k)=>{
      const P=Plot(svg,{at:[k*300,0],w:290,h:300,x:[0.3,10.7],y:[-4,2],m:{l:40,r:6,t:28,b:34}});P.axes({xt:[1,5,10],yt:[-4,-2,0,2],fy:t=>'1e'+t,xl:'layer',yl:'log₁₀ std'});T(P.root,150,16,lab,'lab');
      v.forEach((s,i)=>{const lv=Math.max(-4,Math.min(2,Math.log10(Math.max(s,1e-9))));const rc=P.rect(i+1-0.35,-4,i+1+0.35,lv,'');rc.setAttribute('fill',c)});P.line(0.3,0,10.7,0,'ln thin sm dash')});
    setR(root,'a',fmt(R.stdA[9],4));setR(root,'g',fmt(R.stdG[0],4));setR(root,'v',mode==='good'?(act==='relu'?'He: Var(w) = 2/n':'Xavier: Var(w) = 1/n'):mode==='small'?'too small':'too large')}
  b1.forEach(b=>b.addEventListener('click',()=>{act=b.dataset.v;b1.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));
  b2.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.v;b2.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));draw()};
FIG['graph-chain']=root=>{const W=root.hasAttribute('data-w')?'w':'θ';const svg=initSvg(svgOf(root),680,220);const node=(x,y,t,c)=>{E('circle',{cx:x,cy:y,r:24,fill:c,stroke:'#fff'},svg);T(svg,x,y+5,t,'lab').style.fill='#fff'};
  [[60,50,W+'₁'],[60,170,W+'₂']].forEach(p=>node(p[0],p[1],p[2],'#70ad47'));[[230,40,'g₁'],[230,110,'g₂'],[230,180,'g₃']].forEach(p=>node(p[0],p[1],p[2],'#4472c4'));node(420,110,'J','#ed7d31');
  [[60,50],[60,170]].forEach(a=>[[230,40],[230,110],[230,180]].forEach(b=>arrowPx(svg,a[0]+24,a[1],b[0]-26,b[1],'ln thin sm','fm')));[[230,40],[230,110],[230,180]].forEach(b=>arrowPx(svg,b[0]+24,b[1],394,110,'ln thin sm','fm'));
  T(svg,450,106,'∂J/∂'+W+'₁ = Σⱼ (∂J/∂gⱼ)(∂gⱼ/∂'+W+'₁)','lab','start');T(svg,450,130,'one term per path from '+W+'₁ to J','','start')};
/* the chain from layer l-1 to the loss, with the local derivative of every link (the derivation slide) */
FIG['bp-chain']=root=>{const svg=initSvg(svgOf(root),580,230);const row=92;
  const bx=(x,y,t,c,w)=>{w=w||76;E('rect',{x:x-w/2,y:y-18,width:w,height:36,rx:7,fill:c,stroke:'#404040'},svg);TT(svg,x,y+5,t,'lab','middle')};
  const red=(x,y,t,a)=>{const tt=TT(svg,x,y,t,'lab',a||'middle');tt.style.fill='#c00000';return tt};
  const xs=[62,188,314,440];bx(xs[0],row,'Z^{[l−1]}','#dae3f3');bx(xs[1],row,'A^{[l−1]}','#dae3f3');bx(xs[2],row,'Z^{[l]}','#dae3f3');bx(xs[3],row,'A^{[l]}','#dae3f3');bx(546,row,'J','#fbe5d6',50);bx(xs[2],24,'W^{[l]}','#ffe699');
  [[xs[0]+38,xs[1]-38],[xs[1]+38,xs[2]-38],[xs[2]+38,xs[3]-38]].forEach(a=>arrowPx(svg,a[0],row,a[1],row,'ln thin sk','fk'));
  arrowPx(svg,xs[3]+38,row,519,row,'ln thin sk','fk');T(svg,497,row-9,'…','lab');arrowPx(svg,xs[2],44,xs[2],row-20,'ln thin sk','fk');
  T(svg,125,row-24,'g','');T(svg,251,row-24,'× W','');
  red(125,row+36,'g′(Z^{[l−1]})');red(251,row+36,'W^{[l]}');red(xs[2]+10,63,'A^{[l−1]}','start');
  /* the two error signals */
  const br=(x1,x2,y,c,t)=>{E('path',{d:'M'+x1+','+(y-8)+' L'+x1+','+y+' L'+x2+','+y+' L'+x2+','+(y-8),fill:'none',stroke:c,'stroke-width':2},svg);const tt=TT(svg,(x1+x2)/2,y+19,t,'lab','middle');tt.style.fill=c};
  br(xs[2]-30,576-6,row+66,'#4472c4','δ^{[l]} = ∂J/∂Z^{[l]}: already known');br(xs[0]-30,576-6,row+112,'#c55a11','δ^{[l−1]} = δ^{[l]} · W^{[l]} · g′(Z^{[l−1]}): what we want')};
/* product of many factors: why gradients vanish or explode */
FIG['vanish-chain']=root=>{const svg=initSvg(svgOf(root),940,200);
  [['sigmoid, 10 layers: each factor ≤ 0.25',0.25,'#c00000',30],['ReLU + He init: each factor ≈ 1',1,'#548235',120]].forEach(([lab,f,c,y])=>{T(svg,16,y-10,lab,'lab','start');
    const bx=l=>16+(l-1)*84;for(let l=1;l<=10;l++){E('rect',{x:bx(l),y:y,width:58,height:30,rx:4,fill:'#f2f2f2',stroke:'#7f7f7f'},svg);T(svg,bx(l)+29,y+20,'layer '+l,'')}
    E('rect',{x:856,y:y,width:62,height:30,rx:4,fill:'#fbe5d6',stroke:'#ed7d31'},svg);T(svg,887,y+20,'loss','lab');
    for(let l=10;l>=1;l--){const k=10-l;const g=Math.pow(f,k);const x1=l===10?856:bx(l+1),x2=bx(l)+58;const w=Math.max(0.6,10*g);E('line',{x1:x1-2,y1:y+15,x2:x2+2,y2:y+15,stroke:c,'stroke-width':w},svg);
      T(svg,(x1+x2)/2,y+48,g>=0.01?g.toFixed(2):g.toExponential(0),'','middle')}});
  T(svg,470,192,'Line width = size of the gradient that reaches each layer, starting at the loss (right) and going back to layer 1 (left).','','middle')};
/* the chain rule with numbers: y = (3x + 1)^2 at x = 1, and a nudge to check it */
FIG['chain-num']=root=>{const svg=svgOf(root);
  stepper(root,s=>{initSvg(svg,620,300);const node=(x,y,t,v,c)=>{E('circle',{cx:x,cy:y,r:30,fill:c,stroke:'#404040'},svg);T(svg,x,y+6,t,'lab big');const tt=T(svg,x,y-40,v,'lab');tt.style.fill='#1f3864'};
    const boxF=(x,t)=>{E('rect',{x:x-62,y:108,width:124,height:44,rx:8,fill:'#dae3f3',stroke:'#4472c4'},svg);TT(svg,x,136,t,'lab')};
    node(50,130,'x','x = 1','#c5e0b4');boxF(175,'u = 3x + 1');node(300,130,'u','u = 4','#fff2cc');boxF(425,'y = u^2');node(550,130,'y','y = 16','#fbe5d6');
    arrowPx(svg,80,130,111,130,'ln thin sk','fk');arrowPx(svg,237,130,268,130,'ln thin sk','fk');arrowPx(svg,330,130,361,130,'ln thin sk','fk');arrowPx(svg,487,130,518,130,'ln thin sk','fk');
    const red=(x,y,t,cls)=>{const tt=TT(svg,x,y,t,cls||'lab','middle');tt.style.fill='#c00000';return tt};
    if(s>=1){red(175,182,'du/dx = 3');red(425,182,'dy/du = 2u = 8')}
    if(s>=2){E('rect',{x:150,y:204,width:320,height:36,rx:6,fill:'#fff',stroke:'#c00000'},svg);red(310,228,'dy/dx = (dy/du)·(du/dx) = 8 · 3 = 24')}
    if(s>=3){T(svg,310,270,'check: x = 1.01 → u = 4.03 → y = 16.2409, so y grew by 0.24 = 24 × 0.01  ✓','','middle')}
    T(svg,310,24,['forward: compute and keep every intermediate value','each box knows its own local derivative','chain rule: multiply the local derivatives along the path','the derivative predicts what a small nudge does'][Math.min(s,3)],'','middle')})};
/* TT with coloured parts: parts = [[text, colour, bold], …], each part may use _x, ^{…} like TT */
function TTc(parent,x,y,parts,cls,anchor){const base=/\bbig\b/.test(cls||'')?19:/\blab\b/.test(cls||'')?16:14;
  const t=E('text',{x:x,y:y,'text-anchor':anchor||'middle'},parent);if(cls)t.setAttribute('class',cls);let off=0;
  parts.forEach(([s,c,b])=>{const segs=[];let i=0,cur='';const push=()=>{if(cur)segs.push([cur,0]);cur=''};
    while(i<s.length){const ch=s[i];if((ch==='_'||ch==='^')&&i+1<s.length){push();const m=ch==='_'?1:2;let body;if(s[i+1]==='{'){const j=s.indexOf('}',i+2);body=s.slice(i+2,j<0?s.length:j);i=j<0?s.length:j+1}else{body=s[i+1];i+=2}segs.push([body,m]);continue}cur+=ch;i++}push();
    segs.forEach(([txt,m])=>{const target=m===1?0.28*base:m===2?-0.4*base:0;const ts=E('tspan',{},t);if(Math.abs(target-off)>0.01)ts.setAttribute('dy',(target-off).toFixed(1));off=target;
      if(m)ts.setAttribute('font-size',(0.72*base).toFixed(1)+'px');if(c)ts.setAttribute('fill',c);if(b)ts.setAttribute('font-weight','700');ts.textContent=txt})});
  return t}
/* the three local derivatives we already have, on the 2-4-1 network of the previous slide: ① loss + last activation (orange),
   ② activation derivatives (purple), ③ the linear layer, "times the other input" (blue); in red, the two errors built from them */
const P1='#c55a11',P2='#7030a0',P3='#2f5597',PR='#c00000';
FIG['bp-pieces']=root=>{const svg=initSvg(svgOf(root),1160,290);
  const badge=(x,y,n,c)=>{E('circle',{cx:x,cy:y,r:11,fill:c},svg);const t=T(svg,x,y+5,String(n),'lab');t.style.fill='#fff';t.style.fontSize='14px';t.style.fontWeight='700'};
  const pos=drawNet(svg,[2,4,1],{x0:90,y0:70,w:700,h:200,r:18,label:(l,i)=>l===0?'x'+(i+1):l===2?'ŷ':'',fill:l=>l===0?'#70ad47':'#a3336b',edgeStyle:()=>({stroke:'#c9d3e8',width:1})});
  E('rect',{x:930,y:146,width:130,height:48,rx:8,fill:'#fbe5d6',stroke:'#ed7d31'},svg);TT(svg,995,176,'L(ŷ, y)','lab');arrowPx(svg,810,170,928,170,'ln thin sk','fk');
  TT(svg,90,286,'x (data)','');TT(svg,440,286,'z^{[1]} → a^{[1]} = g(z^{[1]})','');TT(svg,790,286,'z^{[2]} → ŷ = a^{[2]}','');
  /* the errors, right to left above the network */
  arrowPx(svg,995,140,995,48,'ln sr','fr');E('line',{x1:995,y1:48,x2:812,y2:48,stroke:PR,'stroke-width':2.5},svg);arrowPx(svg,812,48,800,48,'ln sr','fr');
  TTc(svg,903,36,[['δ^{[2]} = ',PR,1],['ŷ − y',P1,1]],'lab big');badge(966,30,1,P1);
  arrowPx(svg,770,48,460,48,'ln sr','fr');
  TTc(svg,615,36,[['δ^{[1]} = (',PR,1],['δ^{[2]}',PR,1],[' W^{[2]⊤}',P3,1],[') ⊙ ',PR,1],['g′(z^{[1]})',P2,1]],'lab big');badge(727,30,3,P3);badge(752,30,2,P2);
  E('line',{x1:420,y1:48,x2:110,y2:48,stroke:'#bfbfbf','stroke-width':2,'stroke-dasharray':'6 5'},svg);arrowPx(svg,112,48,100,48,'ln thin sm','fm');T(svg,265,38,'stop: x is data, it needs no error','');
  /* the weight gradients, on their edges */
  const wbox=(x,parts,w)=>{E('rect',{x:x-w/2,y:154,width:w,height:32,rx:6,fill:'#fff',stroke:P3,'stroke-width':1.5},svg);TTc(svg,x-10,176,parts,'lab');badge(x+w/2-16,170,3,P3)};
  wbox(265,[['∂L/∂W^{[1]} = ',null],['x^⊤',P3,1],[' δ^{[1]}',PR,1]],196);wbox(615,[['∂L/∂W^{[2]} = ',null],['a^{[1]⊤}',P3,1],[' δ^{[2]}',PR,1]],206)};
/* forward and backward on a concrete 3-4-1 network: the step slider (data-k="s", 0–11, as in fb-walk) lights the part of the network
   that is computed, and [data-blocks] draws the matrices of that step to scale. Buttons data-m: "all" = the dataset X (m = 5 rows),
   "one" = a single example x (1 row). The math panels [data-i][data-m] of the slide follow both */
FIG['fb-concrete']=root=>{const svg=svgOf(root);const slide=root.closest('.slide')||root;const bsv=slide.querySelector('svg[data-blocks]');const inp=q(root,'s');
  const panels=[...slide.querySelectorAll('[data-i][data-m]')];let mode='all';
  const FW='#2e7d5b',BW='#a3336b',GR='#d9d9d9',LC=['#70ad47','#4472c4','#ed7d31'],sub=['₁','₂','₃','₄'];
  const FILL={x:'#e2f0d9',w:'#dae3f3',b:'#fff2cc',z:'#fbe5d6',y:'#e7e6e6',d:'#f4dce8'};
  function net(s){const M=mode==='all';initSvg(svg,600,350);const n=[3,4,1];
    const done=[s>=0,s>=1,s>=3],back=[false,s>=10,s>=7];
    const ring=s<6?[[0],[1,2],[3,4]].findIndex(a=>a.includes(s)):s===7?2:(s===9||s===10)?1:-1;
    const eW=k=>{const fw=s<6&&((k===0&&s===1)||(k===1&&s===3)),bw=(k===1&&(s===8||s===9))||(k===0&&s===11),bd=(k===1&&s>8)||(k===0&&s>11);
      return fw?{stroke:FW,width:2.4}:bw?{stroke:BW,width:2.6}:bd?{stroke:'#e3b5cb',width:1.3}:{stroke:'#c9d3e8',width:1}};
    const lab=(l,i)=>l===0?'x'+sub[i]:l===1?(back[1]?'δ':s===9?'∂a':s===1?'z':s>=2?'a':''):(back[2]?'δ':s===3?'z':s>=4?'ŷ':'');
    const fill=(l)=>back[l]?BW:done[l]?LC[l]:GR;
    /* "dataset" mode: every unit holds one number per example, drawn as a small stack behind it */
    const P=[];n.forEach((c,l)=>{const x=60+l*190;for(let i=0;i<c;i++)P.push([x,58+230*(i+0.5)/c,l])});
    if(M)P.forEach(([x,y,l])=>{[10,5].forEach(o=>E('circle',{cx:x+o,cy:y-o,r:17,fill:fill(l),'fill-opacity':o>5?0.25:0.45,stroke:'#fff','stroke-width':1.5},svg))});
    const pos=drawNet(svg,n,{x0:60,y0:58,w:380,h:230,r:17,label:lab,fill:fill,edgeStyle:(l)=>eW(l)});
    if(ring>=0)pos[ring].forEach(p=>E('circle',{cx:p[0],cy:p[1],r:22,fill:'none',stroke:s<6?FW:BW,'stroke-width':3},svg));
    /* loss */
    const lc=s>=5?(s>=6?'#f4dce8':'#fbe5d6'):'#f2f2f2';E('rect',{x:494,y:149,width:82,height:52,rx:8,fill:lc,stroke:s===5?FW:s===6?BW:'#bfbfbf','stroke-width':s===5||s===6?3:1},svg);
    TT(svg,535,181,'L','lab big').style.fill=s>=5?'#1f1f1f':'#a6a6a6';arrowPx(svg,450,175,492,175,'ln thin sm','fm');
    if(s>=5){arrowPx(svg,535,246,535,203,'ln thin sk','fk');TT(svg,535,264,M?'Y (5 × 1)':'y (1 × 1)','')}
    /* titles: the matrix of each column with its shape; under the edges, the weights */
    const ttl=[[M?'X':'x',M?'5 × 3':'1 × 3'],[M?'Z^{[1]}, A^{[1]}':'z^{[1]}, a^{[1]}',M?'5 × 4':'1 × 4'],[M?'Z^{[2]}, A^{[2]}':'z^{[2]}, a^{[2]}',M?'5 × 1':'1 × 1']];
    ttl.forEach(([a,b],l)=>{const x=60+l*190;const t=TT(svg,x,20,a,'lab');t.style.fill=back[l]?BW:done[l]?'#1f1f1f':'#a6a6a6';T(svg,x,38,b,'').style.fill=done[l]?'#595959':'#bfbfbf'});
    TT(svg,535,20,'loss','lab').style.fill=s>=5?'#1f1f1f':'#a6a6a6';T(svg,535,38,'1 × 1','').style.fill=s>=5?'#595959':'#bfbfbf';
    [[155,'W^{[1]}: 3 × 4,  b^{[1]}: 1 × 4',0],[345,'W^{[2]}: 4 × 1,  b^{[2]}: 1 × 1',1]].forEach(([x,t,k])=>{const st=eW(k),c=st.stroke==='#c9d3e8'?'#7f7f7f':st.stroke==='#e3b5cb'?BW:st.stroke;const e=TT(svg,x,330,t,'');e.style.fill=c;if(c!=='#7f7f7f')e.style.fontWeight='700'});
    if(M)T(svg,250,348,'each unit holds 5 numbers, one per example: a column of the matrix','').style.fill='#7f7f7f'}
  /* the matrices of the step, to scale (one cell = one number). items: [label, rows, cols, fill] or an operator string */
  function blocks(s){if(!bsv)return;const m=mode==='all'?5:1,C=17;initSvg(bsv,560,160);
    const X=(l)=>[l||(m>1?'X':'x'),m,3,FILL.x],A1=(l)=>[l||(m>1?'A^{[1]}':'a^{[1]}'),m,4,FILL.x],Z1=[m>1?'Z^{[1]}':'z^{[1]}',m,4,FILL.z],Z2=[m>1?'Z^{[2]}':'z^{[2]}',m,1,FILL.z],
      A2=[m>1?'A^{[2]}':'ŷ',m,1,FILL.x],Y=[m>1?'Y':'y',m,1,FILL.y],D2=['δ^{[2]}',m,1,FILL.d],D1=['δ^{[1]}',m,4,FILL.d],dA=[m>1?'∂A^{[1]}':'∂a^{[1]}',m,4,FILL.d];
    const S=[[X()],[X(),'·',['W^{[1]}',3,4,FILL.w],'+',['b^{[1]}',1,4,FILL.b],'=',Z1],['g(',Z1,')','=',A1()],[A1(),'·',['W^{[2]}',4,1,FILL.w],'+',['b^{[2]}',1,1,FILL.b],'=',Z2],['g(',Z2,')','=',A2],
      ['L(',A2,',',Y,')','=',['L',1,1,FILL.z]],[['∂L/∂L = 1',1,1,FILL.d]],[D2,'=',m>1?'(':'',A2,'−',Y,m>1?') / 5':''],
      [['∂W^{[2]}',4,1,FILL.d],'=',A1((m>1?'A':'a')+'^{[1]⊤}').map((v,i)=>i===1?4:i===2?m:v),'·',D2,'  ',['∂b^{[2]}',1,1,FILL.d],'=',m>1?'Σ_{rows}':'',D2],
      [dA,'=',D2,'·',['W^{[2]⊤}',1,4,FILL.w]],[D1,'=',dA,'⊙',[m>1?'g′(Z^{[1]})':'g′(z^{[1]})',m,4,FILL.z]],
      [['∂W^{[1]}',3,4,FILL.d],'=',X(m>1?'X^⊤':'x^⊤').map((v,i)=>i===1?3:i===2?m:v),'·',D1,'  ',['∂b^{[1]}',1,4,FILL.d],'=',m>1?'Σ_{rows}':'',D1]][s].filter(v=>v!=='');
    const wOf=it=>typeof it==='string'?(it.trim()?Math.max(16,it.replace(/[_^{}]/g,'').length*9):18):it[2]*C;
    const tot=S.reduce((a,it)=>a+wOf(it)+8,-8);let x=280-tot/2;const mid=84;
    S.forEach((it,k)=>{const w=wOf(it);if(typeof it==='string'){TT(bsv,x+w/2,mid+6,it,'lab big');x+=w+8;return}
      const [l,r,c,f]=it,h=r*C,y0=mid-h/2,isG=f===FILL.d;
      for(let i=0;i<r;i++)for(let j=0;j<c;j++)E('rect',{x:x+j*C,y:y0+i*C,width:C,height:C,fill:f,stroke:isG?'#c06c95':'#8c8c8c','stroke-width':0.8},bsv);
      E('rect',{x:x,y:y0,width:w,height:h,fill:'none',stroke:isG?BW:'#404040','stroke-width':1.4},bsv);
      const lt=TT(bsv,x+w/2,y0-8,l,'lab');if(isG)lt.style.fill=BW;
      /* the shape, with the inner sizes of a product in green */
      const pre=S[k-1]==='·',post=S[k+1]==='·',t=E('text',{x:x+w/2,y:y0+h+17,'text-anchor':'middle'},bsv);
      [[String(r),pre],[' × ',false],[String(c),post]].forEach(([v,hi])=>{const ts=E('tspan',{},t);ts.textContent=v;if(hi){ts.setAttribute('fill',FW);ts.setAttribute('font-weight','700')}});
      x+=w+8})}
  function draw(){const s=+inp.value;setV(root,'s',s<6?'forward '+(s+1)+'/6':'backward '+(s-5)+'/6');net(s);blocks(s);panels.forEach(p=>p.hidden=!(+p.dataset.i===s&&p.dataset.m===mode))}
  segs(root,'m',v=>{mode=v;draw()});mode=(root.querySelector('.seg button[aria-pressed="true"]')||{dataset:{m:'all'}}).dataset.m;
  inp.addEventListener('input',draw);draw()};
})();
