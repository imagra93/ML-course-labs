/* Shared helpers for the neural-network slides: network drawings and a tiny MLP trainer. */
(function(){
'use strict';
const {lib}=window.MLFIG;const {E,T,rng,randn}=lib;
function drawNet(parent,sizes,o){o=o||{};const x0=o.x0||20,y0=o.y0||20,w=o.w||400,h=o.h||260,R=o.r||11;const drop=o.drop||new Set();const pos=[];
  sizes.forEach((n,l)=>{const x=x0+(sizes.length===1?w/2:l*w/(sizes.length-1));const col=[];for(let i=0;i<n;i++){const y=y0+(n===1?h/2:(h*(i+0.5)/n));col.push([x,y])}pos.push(col)});
  for(let l=0;l<sizes.length-1;l++)pos[l].forEach((a,i)=>pos[l+1].forEach((b,j)=>{const off=drop.has(l+'-'+i)||drop.has((l+1)+'-'+j);E('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:off?'#e3e3e3':(o.edge||'#9dafd6'),'stroke-width':off?0.6:1,'stroke-dasharray':off?'3 3':''},parent)}));
  pos.forEach((col,l)=>col.forEach((p,i)=>{const off=drop.has(l+'-'+i);const fill=off?'#f2f2f2':(o.fill?o.fill(l,i):(l===0?'#70ad47':l===sizes.length-1?'#ed7d31':'#4472c4'));
    E('circle',{cx:p[0],cy:p[1],r:R,fill:fill,stroke:off?'#bfbfbf':'#fff','stroke-width':1.5},parent);if(off){E('line',{x1:p[0]-6,y1:p[1]-6,x2:p[0]+6,y2:p[1]+6,stroke:'#c00000','stroke-width':2},parent);E('line',{x1:p[0]-6,y1:p[1]+6,x2:p[0]+6,y2:p[1]-6,stroke:'#c00000','stroke-width':2},parent)}
    if(o.label){const t=o.label(l,i);if(t)T(parent,p[0],p[1]+5,t,'').style.fill='#fff'}}));
  if(o.titles)o.titles.forEach((t,l)=>T(parent,pos[l][0][0],y0-8,t,'lab'));return pos}
const ACT={
  tanh:{f:z=>Math.tanh(z)},relu:{f:z=>z>0?z:0},sigmoid:{f:z=>1/(1+Math.exp(-z))},linear:{f:z=>z}};
/* full-batch Adam on binary cross-entropy. X: m×n, y: m. hidden: e.g. [8] or [6,6] */
function trainMLP(X,y,hidden,act,steps,lr,seed){const r=rng(seed||1);const sizes=[X[0].length].concat(hidden,[1]);const W=[],B=[];
  for(let l=0;l<sizes.length-1;l++){const s=Math.sqrt((act==='relu'?2:1)/sizes[l]);W.push([...Array(sizes[l])].map(()=>[...Array(sizes[l+1])].map(()=>s*randn(r))));B.push(new Array(sizes[l+1]).fill(0))}
  const mW=W.map(w=>w.map(r2=>r2.map(()=>0))),sW=W.map(w=>w.map(r2=>r2.map(()=>0))),mB=B.map(b=>b.map(()=>0)),sB=B.map(b=>b.map(()=>0));const g=ACT[act];const dA=act==='relu'?(a=>a>0?1:0):act==='tanh'?(a=>1-a*a):act==='sigmoid'?(a=>a*(1-a)):(()=>1);const m=X.length;const losses=[];
  function forward(x){const A=[x];for(let l=0;l<W.length;l++){const z=B[l].slice();const a=A[l];for(let j=0;j<z.length;j++){let s=z[j];for(let i=0;i<a.length;i++)s+=a[i]*W[l][i][j];z[j]=s}
      A.push(l===W.length-1?z.map(v=>1/(1+Math.exp(-v))):z.map(v=>g.f(v)))}return A}
  for(let t=1;t<=steps;t++){const gW=W.map(w=>w.map(r2=>r2.map(()=>0))),gB=B.map(b=>b.map(()=>0));let L=0;
    for(let k=0;k<m;k++){const A=forward(X[k]);const p=A[A.length-1][0];L-=y[k]*Math.log(p+1e-12)+(1-y[k])*Math.log(1-p+1e-12);let d=[(p-y[k])/m];
      for(let l=W.length-1;l>=0;l--){const a=A[l];for(let i=0;i<a.length;i++)for(let j=0;j<d.length;j++)gW[l][i][j]+=a[i]*d[j];for(let j=0;j<d.length;j++)gB[l][j]+=d[j];
        if(l>0){const nd=new Array(a.length).fill(0);for(let i=0;i<a.length;i++){let s=0;for(let j=0;j<d.length;j++)s+=d[j]*W[l][i][j];nd[i]=s*dA(a[i])}d=nd}}}
    losses.push(L/m);const b1=0.9,b2=0.999;
    for(let l=0;l<W.length;l++){for(let i=0;i<W[l].length;i++)for(let j=0;j<W[l][i].length;j++){const gg=gW[l][i][j];mW[l][i][j]=b1*mW[l][i][j]+(1-b1)*gg;sW[l][i][j]=b2*sW[l][i][j]+(1-b2)*gg*gg;W[l][i][j]-=lr*(mW[l][i][j]/(1-b1**t))/(Math.sqrt(sW[l][i][j]/(1-b2**t))+1e-8)}
      for(let j=0;j<B[l].length;j++){const gg=gB[l][j];mB[l][j]=b1*mB[l][j]+(1-b1)*gg;sB[l][j]=b2*sB[l][j]+(1-b2)*gg*gg;B[l][j]-=lr*(mB[l][j]/(1-b1**t))/(Math.sqrt(sB[l][j]/(1-b2**t))+1e-8)}}}
  return {predict:x=>{const A=forward(x);return A[A.length-1][0]},losses:losses,W:W,B:B}}
window.MLNN={drawNet,ACT,trainMLP};
})();
