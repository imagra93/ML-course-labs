/* Figures for 04_softmax_regression.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,rng,randn,fmt,q,setV,setR,svgOf}=lib;
FIG['soft']=root=>{const svg=initSvg(svgOf(root),540,260);
  const P=Plot(svg,{at:[0,0],w:260,h:260,x:[0.4,3.6],y:[-4.5,4.5],m:{l:36,r:6,t:28,b:28}});P.axes({yt:[-4,0,4],grid:false});P.line(0.4,0,3.6,0,'ax',P.bg);T(P.root,140,16,'scores z (after scaling)','lab');
  const Q=Plot(svg,{at:[280,0],w:260,h:260,x:[0.4,3.6],y:[0,1],m:{l:36,r:6,t:28,b:28}});Q.axes({yt:[0,0.5,1]});T(Q.root,140,16,'softmax probabilities','lab');
  const ins=[1,2,3].map(k=>q(root,'z'+k)),is=q(root,'s');const cls=['fb','fo','fgr'];
  function draw(){const s=+is.value;const z=ins.map(i=>+i.value*s);ins.forEach((i,k)=>setV(root,'z'+(k+1),fmt(+i.value,1)));setV(root,'s',fmt(s,1));
    const mx=Math.max(...z);const ex=z.map(v=>Math.exp(v-mx));const Z=ex.reduce((a,b)=>a+b,0);const p=ex.map(v=>v/Z);P.clear();Q.clear();
    z.forEach((v,k)=>{P.rect(k+1-0.3,0,k+1+0.3,Math.max(-4.5,Math.min(4.5,v)),cls[k]);P.text(k+1,0,'z'+(k+1),'', 'middle',0,v>=0?16:-6)});
    p.forEach((v,k)=>{Q.rect(k+1-0.3,0,k+1+0.3,v,cls[k]);Q.text(k+1,v,fmt(v,2),'lab','middle',0,-6)});setR(root,'sum',fmt(p.reduce((a,b)=>a+b,0),2))}
  ins.concat([is]).forEach(i=>i.addEventListener('input',draw));draw()};
FIG['soft-regions']=root=>{const r=rng(17);const C=[[-1.2,-0.8],[1.3,-0.6],[0.1,1.4]];const X=[],Y=[];C.forEach((c,k)=>{for(let i=0;i<40;i++){X.push([1,c[0]+0.6*randn(r),c[1]+0.6*randn(r)]);Y.push(k)}});
  const K=3,n=3,m=X.length;let W=[[0,0,0],[0,0,0],[0,0,0]];const snaps=[JSON.parse(JSON.stringify(W))];const Js=[];
  const probs=(x,W)=>{const z=W.map(w=>w[0]*x[0]+w[1]*x[1]+w[2]*x[2]);const mx=Math.max(...z);const e=z.map(v=>Math.exp(v-mx));const s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s)};
  const J=W=>-X.reduce((s,x,i)=>s+Math.log(Math.max(1e-12,probs(x,W)[Y[i]])),0)/m;Js.push(J(W));
  for(let it=1;it<=150;it++){const G=[[0,0,0],[0,0,0],[0,0,0]];X.forEach((x,i)=>{const p=probs(x,W);for(let k=0;k<K;k++){const e=p[k]-(Y[i]===k?1:0);for(let j=0;j<n;j++)G[k][j]+=e*x[j]}});
    W=W.map((w,k)=>w.map((v,j)=>v-0.5*G[k][j]/m));snaps.push(JSON.parse(JSON.stringify(W)));Js.push(J(W))}
  const svg=initSvg(svgOf(root),560,380);const P=Plot(svg,{at:[0,0],w:380,h:380,x:[-3,3],y:[-3,3],m:{l:30,r:8,t:10,b:30}});P.axes({xt:[-3,0,3],yt:[-3,0,3],xl:'x₁',yl:'x₂'});
  const Q=Plot(svg,{at:[390,0],w:170,h:380,x:[0,150],y:[0,1.15],m:{l:34,r:6,t:10,b:30}});Q.axes({xt:[0,150],yt:[0,0.5,1],xl:'iteration',yl:'J(Θ)'});Q.path(Js.map((v,i)=>[i,v]),'ln sb',Q.bg);
  const fills=['#4472c4','#ed7d31','#70ad47'];const inp=q(root,'k');const N=30;
  function draw(){const k=+inp.value;setV(root,'k',k);const W=snaps[k];P.clear();
    for(let a=0;a<N;a++)for(let b=0;b<N;b++){const x=-3+6*(a+0.5)/N,y=-3+6*(b+0.5)/N;const p=probs([1,x,y],W);let c=0;for(let t=1;t<3;t++)if(p[t]>p[c])c=t;
      const rc=P.rect(-3+6*a/N,-3+6*b/N,-3+6*(a+1)/N,-3+6*(b+1)/N,'');rc.setAttribute('fill',fills[c]);rc.setAttribute('opacity',(0.08+0.32*(p[c]-1/3)*1.5).toFixed(2))}
    X.forEach((x,i)=>P.dot(x[1],x[2],3.6,'pt '+['fb','fo','fgr'][Y[i]]));Q.clear();Q.dot(k,Js[k],5,'fr');
    const acc=X.filter((x,i)=>{const p=probs(x,W);let c=0;for(let t=1;t<3;t++)if(p[t]>p[c])c=t;return c===Y[i]}).length/m;setR(root,'acc',fmt(acc,3));setR(root,'j',fmt(Js[k],3))}
  inp.addEventListener('input',draw);draw()};
/* Worked example: damage severity of 100 cars (70 minor, 20 moderate, 10 severe). Rows: actual, columns: predicted */
FIG['cm3']=root=>{const svg=initSvg(svgOf(root),470,330);const M=[[65,4,1],[5,12,3],[1,3,6]];const lab=['minor','moderate','severe'];
  M.forEach((row,i)=>row.forEach((v,j)=>{const x=110+j*90,y=44+i*80;E('rect',{x:x,y:y,width:86,height:76,fill:i===j?'#4472c4':'#ed7d31','fill-opacity':(0.12+0.8*Math.sqrt(v/65)).toFixed(2)},svg);
    T(svg,x+43,y+47,String(v),'lab big').style.fill=i===j&&v>30?'#fff':'#000'}));
  lab.forEach((l,k)=>{T(svg,104,88+k*80,l,'','end');T(svg,153+k*90,36,l,'','middle');T(svg,392,88+k*80,'total '+M[k].reduce((a,b)=>a+b,0),'','start');
    T(svg,153+k*90,304,'Σ '+M.reduce((s,row)=>s+row[k],0),'','middle')});
  T(svg,245,16,'predicted','lab');T(svg,4,324,'rows: actual class','','start')};
})();
