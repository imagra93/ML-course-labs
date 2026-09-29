/* Figures for 02_backpropagation.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,q,setV,setR,svgOf}=lib;const {drawNet,box,stepper,sig,f2,f3,NET,tinyForward,drawTiny}=window.MLNN;
const FWD=['X','Z₁','A₁','Z₂','A₂','L'],FSUB=['input','linear','activation','linear','prediction','loss'];const BWD=['∂W₁, ∂b₁','δ₁','∂A₁','∂W₂, ∂b₂','δ₂','L'];
function chain(svg,y,labels,subs,hi,col,back){labels.forEach((t,i)=>{const x=20+i*98;const on=hi.includes(i);E('rect',{x:x,y:y,width:84,height:52,rx:8,fill:on?col:'#f2f2f2',stroke:on?col:'#bfbfbf'},svg);
  const tt=T(svg,x+42,y+24,t,'lab');tt.style.fill=on?'#fff':'#595959';const st=T(svg,x+42,y+42,subs[i],'');st.style.fill=on?'#fff':'#8c8c8c';if(i<labels.length-1)arrowPx(svg,back?x+96:x+86,y+26,back?x+86:x+96,y+26,'ln thin sm','fm')})}
FIG['fb-walk']=root=>{const svg=initSvg(root.querySelector('svg'),600,170);const inp=q(root,'s');const panels=[...root.querySelectorAll('[data-i]')];
  const fwdHi=[[0],[0,1],[0,1,2],[0,1,2,3],[0,1,2,3,4],[0,1,2,3,4,5]];const bwdHi=[[5],[4,5],[3,4,5],[2,3,4,5],[1,2,3,4,5],[0,1,2,3,4,5]];
  function draw(){const s=+inp.value;setV(root,'s',s<6?'forward '+(s+1)+'/6':'backward '+(s-5)+'/6');svg.innerHTML='';
    T(svg,10,14,'Forward →','lab','start');chain(svg,22,FWD,FSUB,s<6?fwdHi[s]:fwdHi[5],'#2e7d5b',false);
    T(svg,10,100,'← Backward','lab','start');chain(svg,108,BWD,['gradient','hidden error','','gradient','output error','loss'],s<6?[]:bwdHi[s-6],'#a3336b',true);
    panels.forEach(p=>p.hidden=(+p.dataset.i!==s))}inp.addEventListener('input',draw);draw()};
FIG['net-back']=root=>{const svg=initSvg(svgOf(root),520,300);drawNet(svg,[2,4,1],{x0:50,y0:40,w:400,h:220,r:16,label:(l,i)=>l===0?'x'+(i+1):l===1?'':'L',fill:(l)=>l===0?'#70ad47':l===1?'#a3336b':'#a3336b'});
  arrowPx(svg,420,24,280,24,'ln sr','fr');T(svg,350,16,'δ₂','lab');arrowPx(svg,230,24,90,24,'ln sr','fr');T(svg,160,16,'δ₁','lab');
  T(svg,260,292,'The error starts at the loss and travels backward: output → δ₂ → hidden → δ₁ → input','','middle')};
/* ---- (a+b)·c computational graph with numbers ---- */
FIG['graph-num']=root=>{const svg=svgOf(root);
  stepper(root,s=>{initSvg(svg,600,300);const node=(x,y,t,c)=>{E('circle',{cx:x,cy:y,r:26,fill:c,stroke:'#404040'},svg);T(svg,x,y+6,t,'lab big')};
    const fw=(x,y,t)=>{const tt=T(svg,x,y,t,'lab');tt.style.fill='#1f3864'};const bw=(x,y,t)=>{const tt=T(svg,x,y,t,'lab');tt.style.fill='#c00000'};
    node(70,70,'a','#c5e0b4');node(70,170,'b','#c5e0b4');node(70,270,'c','#c5e0b4');node(250,120,'+','#dae3f3');node(430,195,'×','#dae3f3');
    arrowPx(svg,96,70,224,112,'ln thin sk','fk');arrowPx(svg,96,170,224,128,'ln thin sk','fk');arrowPx(svg,276,120,404,185,'ln thin sk','fk');arrowPx(svg,96,270,404,205,'ln thin sk','fk');arrowPx(svg,456,195,540,195,'ln thin sk','fk');
    T(svg,320,148,'q = a + b','');T(svg,565,200,'f','lab big');T(svg,500,180,'f = q · c','');
    fw(70,32,'a = 2');fw(70,132,'b = 5');fw(70,232,'c = −4');if(s>=1)fw(250,84,'q = 7');if(s>=2)fw(565,172,'f = −28');
    if(s>=3)bw(565,226,'∂f/∂f = 1');if(s>=4){bw(250,164,'∂f/∂q = c = −4');bw(150,300,'∂f/∂c = q = 7');E('line',{x1:404,y1:195,x2:276,y2:120,stroke:'#c00000','stroke-width':2,'stroke-dasharray':'5 4'},svg)}
    if(s>=5){bw(150,52,'∂f/∂a = −4 · 1 = −4');bw(150,196,'∂f/∂b = −4 · 1 = −4');E('line',{x1:224,y1:112,x2:96,y2:70,stroke:'#c00000','stroke-width':2,'stroke-dasharray':'5 4'},svg);E('line',{x1:224,y1:128,x2:96,y2:170,stroke:'#c00000','stroke-width':2,'stroke-dasharray':'5 4'},svg)}
    T(svg,300,292,s<3?'blue: forward values, left to right':'red: gradients ∂f/∂(node), right to left, each = upstream gradient × local derivative','','middle')})};
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
    if(s>=1&&!N)bw(490,196,'∂L/∂a = −1/a = '+f3(dLda));if(s>=2&&!N){bw(370,196,'∂L/∂z = '+f3(dLda)+' · '+f3(dadz)+' = '+f3(dLdz));T(svg,430,215,'σ′ = a(1−a) = '+f3(dadz),'')}
    if(s>=3&&!N){bw(120,205,'∂L/∂w = ∂L/∂z · x = '+f3(dLdw));bw(150,290,'∂L/∂b = ∂L/∂z · 1 = '+f3(dLdb))}
    if(s>=4&&!N){box(svg,340,240,270,44,'w ← w − 0.5·(−1.336) = 0.168\nb ← b − 0.5·(−0.668) = 0.634','#fff2cc',{lh:18,cls:''})}
    if(N)box(svg,300,240,300,44,'after one step the loss fell from 1.103 to 0.321\nand a rose from 0.332 to 0.725','#e2f0d9',{lh:18,cls:''})})};
/* ---- the tiny 2-2-1 network: backward with numbers ---- */
FIG['net-num']=root=>{const svg=svgOf(root);const N=NET;const F=tinyForward(N);const al=0.5;
  const d2=F.yh-N.y;const dW2=F.a1.map(v=>v*d2);const db2=d2;const dA1=[d2*N.W2[0][0],d2*N.W2[1][0]];const d1=dA1.map((v,j)=>v*(1-F.a1[j]**2));const dW1=[[N.x[0]*d1[0],N.x[0]*d1[1]],[N.x[1]*d1[0],N.x[1]*d1[1]]];
  const N2={x:N.x,y:N.y,W1:N.W1.map((r,i)=>r.map((v,j)=>+(v-al*dW1[i][j]).toFixed(3))),b1:N.b1.map((v,j)=>+(v-al*d1[j]).toFixed(3)),W2:N.W2.map((r,i)=>[+(r[0]-al*dW2[i]).toFixed(3)]),b2:[+(N.b2[0]-al*db2).toFixed(3)]};const F2=tinyForward(N2);
  setR(root,'l0',f3(F.L));setR(root,'l1',f3(F2.L));
  stepper(root,s=>{initSvg(svg,600,330);const upd=s>=6;const pos=drawTiny(svg,upd?N2:N,upd?F2:F,5,{hiEdge:(s===2||s===3)?2:s===5?1:0});
    const bw=(xx,yy,t,anchor)=>{const tt=T(svg,xx,yy,t,'lab',anchor);tt.style.fill='#c00000';return tt};
    if(s>=1&&!upd)bw(pos[2][0][0],pos[2][0][1]+80,'δ₂ = ŷ − y = '+f3(d2));
    if(s>=2&&!upd){bw(pos[2][0][0]-60,pos[2][0][1]-58,'∂W₂ = ('+f3(dW2[0])+', '+f3(dW2[1])+')');bw(pos[2][0][0]-60,pos[2][0][1]-40,'∂b₂ = '+f3(db2))}
    if(s>=3&&!upd){[0,1].forEach(j=>bw(pos[1][j][0]+40,pos[1][j][1]-32+(j?64:0),'∂a'+(j+1)+' = '+f3(dA1[j])))}
    if(s>=4&&!upd){[0,1].forEach(j=>bw(pos[1][j][0]+40,pos[1][j][1]-14+(j?64:0),'δ = '+f3(d1[j])))}
    if(s>=5&&!upd){bw(pos[0][0][0]-10,pos[0][0][1]-48,'∂W₁ = [[ '+f3(dW1[0][0])+', '+f3(dW1[0][1])+' ],','start');bw(pos[0][0][0]-10,pos[0][0][1]-30,'         [ '+f3(dW1[1][0])+', '+f3(dW1[1][1])+' ]]','start');bw(pos[0][1][0]-10,pos[0][1][1]+58,'∂b₁ = ('+f3(d1[0])+', '+f3(d1[1])+')','start')}
    if(upd){box(svg,20,290,560,32,s===6?'weights updated with α = 0.5: every parameter moved against its gradient':'forward again with the new weights: ŷ = '+f3(F2.yh)+', loss '+f3(F2.L)+' (was '+f3(F.L)+')','#e2f0d9',{cls:''})}
    else T(svg,300,318,s===0?'forward pass done: every z and a is stored (blue / red numbers)':'red: gradients, computed from the output backwards','','middle')})};
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
FIG['graph-chain']=root=>{const svg=initSvg(svgOf(root),560,220);const node=(x,y,t,c)=>{E('circle',{cx:x,cy:y,r:24,fill:c,stroke:'#fff'},svg);T(svg,x,y+5,t,'lab').style.fill='#fff'};
  [[60,50,'θ₁'],[60,170,'θ₂']].forEach(p=>node(p[0],p[1],p[2],'#70ad47'));[[230,40,'g₁'],[230,110,'g₂'],[230,180,'g₃']].forEach(p=>node(p[0],p[1],p[2],'#4472c4'));node(420,110,'J','#ed7d31');
  [[60,50],[60,170]].forEach(a=>[[230,40],[230,110],[230,180]].forEach(b=>arrowPx(svg,a[0]+24,a[1],b[0]-26,b[1],'ln thin sm','fm')));[[230,40],[230,110],[230,180]].forEach(b=>arrowPx(svg,b[0]+24,b[1],394,110,'ln thin sm','fm'));
  T(svg,420,160,'∂J/∂θ₁ = Σⱼ (∂J/∂gⱼ)(∂gⱼ/∂θ₁)','','middle');T(svg,280,212,'sum over every path from θ₁ to J','','middle')};
/* product of many factors: why gradients vanish or explode */
FIG['vanish-chain']=root=>{const svg=initSvg(svgOf(root),940,200);
  [['sigmoid, 10 layers: each factor ≤ 0.25',0.25,'#c00000',30],['ReLU + He init: each factor ≈ 1',1,'#548235',120]].forEach(([lab,f,c,y])=>{T(svg,20,y-10,lab,'lab','start');
    for(let l=0;l<10;l++){const x=30+l*90;E('rect',{x:x,y:y,width:56,height:30,rx:4,fill:'#f2f2f2',stroke:'#7f7f7f'},svg);T(svg,x+28,y+20,'layer '+(10-l),'');
      if(l<9){const w=Math.max(0.6,10*Math.pow(f,l+1));E('line',{x1:x+88,y1:y+15,x2:x+58,y2:y+15,stroke:c,'stroke-width':w},svg);const m=Math.pow(f,l+1);T(svg,x+72,y+50,m>=0.01?m.toFixed(2):m.toExponential(0),'')}}
    T(svg,900,y+20,'← loss','lab','end')});
  T(svg,470,190,'The arrow width is the size of the gradient that reaches each layer: a product that shrinks (or grows) exponentially with depth.','','middle')};
})();
