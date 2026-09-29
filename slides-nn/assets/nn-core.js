/* Shared helpers for the neural-network slides: network drawings, matrices, 3-D "cubes", heat maps,
   a step-panel driver for widgets, and a tiny MLP trainer. */
(function(){
'use strict';
const {lib}=window.MLFIG;const {E,T,rng,randn}=lib;
function drawNet(parent,sizes,o){o=o||{};const x0=o.x0||20,y0=o.y0||20,w=o.w||400,h=o.h||260,R=o.r||11;const drop=o.drop||new Set();const pos=[];
  sizes.forEach((n,l)=>{const x=x0+(sizes.length===1?w/2:l*w/(sizes.length-1));const col=[];for(let i=0;i<n;i++){const y=y0+(n===1?h/2:(h*(i+0.5)/n));col.push([x,y])}pos.push(col)});
  for(let l=0;l<sizes.length-1;l++)pos[l].forEach((a,i)=>pos[l+1].forEach((b,j)=>{const off=drop.has(l+'-'+i)||drop.has((l+1)+'-'+j);const st=o.edgeStyle?o.edgeStyle(l,i,j):null;
    E('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:off?'#e3e3e3':(st&&st.stroke)||(o.edge||'#9dafd6'),'stroke-width':off?0.6:(st&&st.width)||1,'stroke-dasharray':off?'3 3':''},parent)}));
  pos.forEach((col,l)=>col.forEach((p,i)=>{const off=drop.has(l+'-'+i);const fill=off?'#f2f2f2':(o.fill?o.fill(l,i):(l===0?'#70ad47':l===sizes.length-1?'#ed7d31':'#4472c4'));
    E('circle',{cx:p[0],cy:p[1],r:R,fill:fill,stroke:off?'#bfbfbf':'#fff','stroke-width':1.5},parent);if(off){E('line',{x1:p[0]-6,y1:p[1]-6,x2:p[0]+6,y2:p[1]+6,stroke:'#c00000','stroke-width':2},parent);E('line',{x1:p[0]-6,y1:p[1]+6,x2:p[0]+6,y2:p[1]-6,stroke:'#c00000','stroke-width':2},parent)}
    if(o.label){const t=o.label(l,i);if(t)T(parent,p[0],p[1]+5,t,'').style.fill='#fff'}}));
  if(o.titles)o.titles.forEach((t,l)=>T(parent,pos[l][0][0],y0-8,t,'lab'));return pos}
/* matrix of cells. fillFn(i,j,v) -> colour, txtFn(i,j,v) -> text or null */
function grid(svg,x0,y0,M,cs,fillFn,txtFn,o){o=o||{};M.forEach((row,i)=>row.forEach((v,j)=>{E('rect',{x:x0+j*cs,y:y0+i*cs,width:cs,height:cs,fill:fillFn(i,j,v),stroke:o.stroke||'#595959','stroke-width':o.sw||1},svg);
  const t=txtFn?txtFn(i,j,v):null;if(t!==null&&t!==undefined&&t!==''){const tt=T(svg,x0+j*cs+cs/2,y0+i*cs+cs/2+(o.dy||5),String(t),o.cls||'lab');if(o.tcol)tt.style.fill=typeof o.tcol==='function'?o.tcol(i,j,v):o.tcol}}))}
/* 3-D block for tensors: front face w×h, depth d */
function cube(svg,x,y,w,h,d,fill,lab,sub,o){o=o||{};const dx=d*0.6,dy=-d*0.4;E('polygon',{points:[[x,y],[x+dx,y+dy],[x+w+dx,y+dy],[x+w,y]].map(p=>p.join(',')).join(' '),fill:fill,stroke:'#404040','fill-opacity':0.7},svg);
  E('polygon',{points:[[x+w,y],[x+w+dx,y+dy],[x+w+dx,y+h+dy],[x+w,y+h]].map(p=>p.join(',')).join(' '),fill:fill,stroke:'#404040','fill-opacity':0.55},svg);E('rect',{x:x,y:y,width:w,height:h,fill:fill,stroke:'#404040'},svg);
  if(lab)T(svg,x+w/2,y+h+18,lab,o.cls||'');if(sub)T(svg,x+w/2,y+h+34,sub,'')}
/* heat map colour: v in [-1,1] -> blue (neg) / white / orange (pos); or [0,1] with mono=true -> white→blue */
function heat(v,mono){if(mono){const t=Math.max(0,Math.min(1,v));const r=Math.round(255-187*t),g=Math.round(255-141*t),b=Math.round(255-59*t);return 'rgb('+r+','+g+','+b+')'}
  const t=Math.max(-1,Math.min(1,v));if(t>=0){const r=Math.round(255-18*t),g=Math.round(255-130*t),b=Math.round(255-206*t);return 'rgb('+r+','+g+','+b+')'}const s=-t;const r=Math.round(255-187*s),g=Math.round(255-141*s),b=Math.round(255-59*s);return 'rgb('+r+','+g+','+b+')'}
function gray(v){const c=Math.round(255*(1-Math.max(0,Math.min(1,v))));return 'rgb('+c+','+c+','+c+')'}
/* rounded box with centred text */
function box(svg,x,y,w,h,t,fill,o){o=o||{};E('rect',{x:x,y:y,width:w,height:h,rx:o.rx===undefined?6:o.rx,fill:fill||'#fff',stroke:o.stroke||'#404040','stroke-width':o.sw||1,'stroke-dasharray':o.dash||''},svg);
  if(t!==undefined&&t!==null){const lines=String(t).split('\n');const lh=o.lh||17;lines.forEach((s,k)=>{const tt=T(svg,x+w/2,y+h/2+5+(k-(lines.length-1)/2)*lh,s,o.cls||'lab');if(o.tcol)tt.style.fill=o.tcol})}}
/* step driver: <input data-k="s"> selects which [data-i="k"] / [data-from="k"] panels are visible; draw(s) redraws */
function stepper(root,draw){const inp=root.querySelector('input[data-k="s"]');const scope=root.closest('.slide')||root;const panels=[...scope.querySelectorAll('[data-i],[data-from]')].filter(p=>!p.closest('[data-fig]')||p.closest('[data-fig]')===root);
  function show(){const s=+inp.value;root.querySelectorAll('[data-v="s"]').forEach(e=>e.textContent=s+' / '+inp.max);panels.forEach(p=>{const ok=p.dataset.i!==undefined?p.dataset.i.split(',').map(Number).includes(s):(s>=+p.dataset.from&&(p.dataset.to===undefined||s<=+p.dataset.to));p.hidden=!ok});if(draw)draw(s)}
  inp.addEventListener('input',show);show();return show}
/* segmented buttons: <span class="seg"><button data-KEY="value" aria-pressed>...; cb(value) */
function segs(root,key,cb){const btns=[...root.querySelectorAll('.seg button[data-'+key+']')];let cur=null;btns.forEach(b=>{if(b.getAttribute('aria-pressed')==='true')cur=b.dataset[key]});
  btns.forEach(b=>b.addEventListener('click',()=>{cur=b.dataset[key];btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));cb(cur)}));return ()=>cur}
const ACT={tanh:{f:z=>Math.tanh(z)},relu:{f:z=>z>0?z:0},sigmoid:{f:z=>1/(1+Math.exp(-z))},linear:{f:z=>z}};
const sig=z=>1/(1+Math.exp(-z));
const f3=v=>(Math.abs(v)<5e-4?0:v).toFixed(3);const f2=v=>(Math.abs(v)<5e-3?0:v).toFixed(2);
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
  return {predict:x=>{const A=forward(x);return A[A.length-1][0]},forward:forward,losses:losses,W:W,B:B}}
/* the tiny 2-2-1 network with numbers (also used in the backprop deck) */
const NET={x:[1,2],y:1,W1:[[0.5,-0.3],[0.2,0.4]],b1:[0.1,-0.1],W2:[[0.7],[-0.5]],b2:[0.2]};
function tinyForward(N){const z1=[0,1].map(j=>N.x[0]*N.W1[0][j]+N.x[1]*N.W1[1][j]+N.b1[j]);const a1=z1.map(Math.tanh);const z2=a1[0]*N.W2[0][0]+a1[1]*N.W2[1][0]+N.b2[0];const yh=sig(z2);return {z1,a1,z2,yh,L:-Math.log(yh)}}
function drawTiny(svg,N,F,s,o){o=o||{};const pos=drawNet(svg,[2,2,1],{x0:90,y0:70,w:330,h:170,r:22,titles:['input x','hidden (tanh)','output (sigmoid)'],label:(l,i)=>l===0?'x'+(i+1):l===1?'a'+(i+1):'ŷ',
    edgeStyle:(l,i,j)=>({stroke:(o.hiEdge&&o.hiEdge===l+1)?'#c00000':'#9dafd6',width:(o.hiEdge&&o.hiEdge===l+1)?2.5:1.2})});
  /* weights on the edges */
  const wl=(a,b2,t,k)=>{const x=a[0]+(b2[0]-a[0])*k,y=a[1]+(b2[1]-a[1])*k;E('rect',{x:x-24,y:y-11,width:48,height:20,fill:'#fff',stroke:'#9dafd6'},svg);T(svg,x,y+4,t,'')};
  wl(pos[0][0],pos[1][0],'w='+N.W1[0][0],0.42);wl(pos[0][0],pos[1][1],'w='+N.W1[0][1],0.3);wl(pos[0][1],pos[1][0],'w='+N.W1[1][0],0.3);wl(pos[0][1],pos[1][1],'w='+N.W1[1][1],0.42);
  wl(pos[1][0],pos[2][0],'w='+N.W2[0][0],0.5);wl(pos[1][1],pos[2][0],'w='+N.W2[1][0],0.5);
  T(svg,pos[1][0][0]-26,pos[1][0][1]-18,'b='+N.b1[0],'','end');T(svg,pos[1][1][0]-26,pos[1][1][1]+30,'b='+N.b1[1],'','end');T(svg,pos[2][0][0]+24,pos[2][0][1]-22,'b='+N.b2[0],'','start');
  /* values */
  const val=(p,t,c,dx)=>{const tt=T(svg,p[0]+(dx||0),p[1]+(dx?4:44),t,'lab');tt.style.fill=c||'#1f1f1f'};
  val(pos[0][0],'x₁ = '+N.x[0],'#385723',-52);val(pos[0][1],'x₂ = '+N.x[1],'#385723',-52);
  if(s>=1)[0,1].forEach(j=>val(pos[1][j],'z = '+f3(F.z1[j]),'#1f3864',0));if(s>=2)[0,1].forEach(j=>{const tt=T(svg,pos[1][j][0],pos[1][j][1]+60,'a = '+f3(F.a1[j]),'lab');tt.style.fill='#c00000'});
  if(s>=3)val(pos[2][0],'z = '+f3(F.z2),'#1f3864',0);if(s>=4){const tt=T(svg,pos[2][0][0],pos[2][0][1]+60,'ŷ = '+f3(F.yh),'lab');tt.style.fill='#c00000'}
  if(s>=5){E('rect',{x:490,y:66,width:104,height:52,rx:6,fill:'#fbe5d6',stroke:'#ed7d31'},svg);T(svg,542,86,'y = '+N.y,'lab');T(svg,542,107,'loss = '+f3(F.L),'lab')}
  return pos}
window.MLNN={drawNet,grid,cube,heat,gray,box,stepper,segs,ACT,sig,f2,f3,trainMLP,NET,tinyForward,drawTiny};
})();
