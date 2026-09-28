/* Figures for 02_backpropagation.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,q,setV,setR,svgOf}=lib;const {drawNet}=window.MLNN;
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
})();
