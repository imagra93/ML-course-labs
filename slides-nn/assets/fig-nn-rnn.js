/* Figures for 05_rnn_lstm.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,q,setV,setR,svgOf}=lib;
const node=(svg,x,y,t,c,w,h)=>{w=w||56;h=h||40;E('rect',{x:x-w/2,y:y-h/2,width:w,height:h,rx:8,fill:c,stroke:'#404040'},svg);T(svg,x,y+5,t,'lab')};
FIG['rnn-unroll']=root=>{const svg=initSvg(svgOf(root),900,300);node(svg,90,60,'y⟨t⟩','#f8cbad');node(svg,90,150,'h⟨t⟩','#bdd7ee');node(svg,90,240,'x⟨t⟩','#c5e0b4');
  arrowPx(svg,90,220,90,172,'ln thin sk','fk');arrowPx(svg,90,130,90,82,'ln thin sk','fk');E('path',{d:'M118,150 C170,150 170,100 118,135',fill:'none',stroke:'#c00000','stroke-width':2.5},svg);T(svg,168,112,'Wₕ','lab','start');T(svg,70,196,'Wₓ','','end');T(svg,70,108,'W_y','','end');
  T(svg,200,158,'=','lab big');const xs=[290,420,550,720,850];const lab=['1','2','3','t−1','t'];xs.forEach((x,i)=>{if(i===3){T(svg,635,158,'…','lab big')}
    node(svg,x,60,'y⟨'+lab[i]+'⟩','#f8cbad');node(svg,x,150,'h⟨'+lab[i]+'⟩','#bdd7ee');node(svg,x,240,'x⟨'+lab[i]+'⟩','#c5e0b4');arrowPx(svg,x,220,x,172,'ln thin sk','fk');arrowPx(svg,x,130,x,82,'ln thin sk','fk');
    if(i<4&&i!==2)arrowPx(svg,x+28,150,xs[i+1]-30,150,'ln sr','fr')});arrowPx(svg,578,150,610,150,'ln sr','fr');arrowPx(svg,660,150,690,150,'ln sr','fr');arrowPx(svg,230,150,260,150,'ln sr','fr');T(svg,238,138,'h⟨0⟩','','middle');
  T(svg,570,292,'unrolled in time: the same weights Wₓ, Wₕ, W_y at every step','','middle')};
FIG['rnn-types']=root=>{const svg=initSvg(svgOf(root),960,250);const cell=(x,y,c)=>E('rect',{x:x-14,y:y-14,width:28,height:28,rx:5,fill:c,stroke:'#404040'},svg);
  const draw=(x0,lab,ex,ins,outs,n)=>{T(svg,x0+100,20,lab,'lab');for(let i=0;i<n;i++){const x=x0+30+i*50;cell(x,120,'#bdd7ee');if(i<n-1)arrowPx(svg,x+14,120,x+36,120,'ln thin sk','fk');
    if(ins.includes(i)){cell(x,190,'#c5e0b4');arrowPx(svg,x,176,x,136,'ln thin sk','fk')}if(outs.includes(i)){cell(x,50,'#f8cbad');arrowPx(svg,x,106,x,66,'ln thin sk','fk')}}T(svg,x0+100,235,ex,'','middle')};
  draw(0,'One-to-many','music generation',[0],[0,1,2,3],4);draw(240,'Many-to-one','sentiment classification',[0,1,2,3],[3],4);draw(480,'Many-to-many (Tx = Ty)','named entity recognition',[0,1,2,3],[0,1,2,3],4);draw(720,'Many-to-many (Tx ≠ Ty)','machine translation',[0,1],[2,3],4)};
FIG['vanish']=root=>{const P=Plot(svgOf(root),{w:560,h:340,x:[0,60],y:[-8,4],m:{l:44,r:14,t:14,b:36}});P.axes({xt:[0,10,20,30,40,50,60],yt:[-8,-6,-4,-2,0,2,4],fy:v=>'1e'+v,xl:'steps back in time (T − k)',yl:'gradient size'});P.line(0,0,60,0,'ln thin sm dash',P.bg);
  const iw=q(root,'w'),iff=q(root,'f');function draw(){const w=+iw.value,f=+iff.value;setV(root,'w',fmt(w,2));setV(root,'f',fmt(f,2));P.clear();
    P.fn(k=>Math.max(-8,Math.min(4,k*Math.log10(w))),'ln sr',0,60,120);P.fn(k=>Math.max(-8,k*Math.log10(f)),'ln sb',0,60,120);setR(root,'r',(Math.pow(w,50)).toExponential(1));setR(root,'l',(Math.pow(f,50)).toExponential(1))}
  iw.addEventListener('input',draw);iff.addEventListener('input',draw);draw()};
FIG['lstm-cell']=root=>{const svg=initSvg(svgOf(root),620,330);E('rect',{x:60,y:40,width:500,height:230,rx:18,fill:'#e2f0d9',stroke:'#548235'},svg);
  E('line',{x1:20,y1:80,x2:600,y2:80,stroke:'#404040','stroke-width':3},svg);T(svg,30,70,'c⟨t−1⟩','lab','start');T(svg,590,70,'c⟨t⟩','lab','end');T(svg,310,34,'cell state: the memory highway (additive)','','middle');
  E('line',{x1:20,y1:230,x2:120,y2:230,stroke:'#404040','stroke-width':2},svg);T(svg,24,250,'h⟨t−1⟩','lab','start');E('line',{x1:120,y1:230,x2:120,y2:180,stroke:'#404040','stroke-width':2},svg);
  const gate=(x,t,c,lab)=>{E('rect',{x:x-24,y:165,width:48,height:30,rx:4,fill:c,stroke:'#404040'},svg);T(svg,x,185,t,'lab');T(svg,x,215,lab,'','middle')};
  const op=(x,y,t)=>{E('circle',{cx:x,cy:y,r:13,fill:'#fff',stroke:'#404040'},svg);T(svg,x,y+5,t,'lab')};
  E('line',{x1:120,y1:180,x2:420,y2:180,stroke:'#404040','stroke-width':1.5},svg);gate(170,'σ','#ffc000','forget f');gate(260,'σ','#ffc000','input i');gate(330,'tanh','#f4b183','candidate c̃');gate(420,'σ','#ffc000','output o');
  op(170,80,'×');op(300,80,'+');op(300,125,'×');op(480,195,'×');E('line',{x1:170,y1:165,x2:170,y2:93,stroke:'#404040'},svg);E('line',{x1:260,y1:165,x2:288,y2:132,stroke:'#404040'},svg);E('line',{x1:330,y1:165,x2:312,y2:132,stroke:'#404040'},svg);E('line',{x1:300,y1:112,x2:300,y2:93,stroke:'#404040'},svg);
  E('line',{x1:420,y1:180,x2:467,y2:195,stroke:'#404040'},svg);E('rect',{x:455,y:105,width:50,height:26,rx:4,fill:'#f4b183',stroke:'#404040'},svg);T(svg,480,123,'tanh','lab');E('line',{x1:480,y1:80,x2:480,y2:105,stroke:'#404040'},svg);E('line',{x1:480,y1:131,x2:480,y2:182,stroke:'#404040'},svg);
  E('line',{x1:493,y1:195,x2:600,y2:195,stroke:'#404040','stroke-width':2},svg);T(svg,590,215,'h⟨t⟩','lab','end');E('line',{x1:120,y1:300,x2:120,y2:230,stroke:'#404040','stroke-width':2},svg);T(svg,120,320,'x⟨t⟩','lab')};
FIG['embed']=root=>{const svg=initSvg(svgOf(root),640,300);const A=Plot(svg,{at:[0,0],w:300,h:300,x:[-0.2,1.3],y:[-0.2,1.3],m:{l:20,r:10,t:30,b:20}});A.axes({grid:false});T(A.root,150,18,'one-hot: every word equally far','lab');
  [['book',[1,0]],['teddy bear',[0,1]],['soft',[0.7,0.7]]].forEach(([w,p])=>{A.line(0,0,p[0]*(w==='soft'?0:1),p[1]*(w==='soft'?0:1),'ln thin sm')});A.dot(1,0,5,'fb');A.text(1,0,'book','', 'middle',0,18);A.dot(0,1,5,'fb');A.text(0,1,'teddy bear','', 'start',8,4);A.text(0.5,0.9,'(a third axis for "soft")','', 'start');
  const B=Plot(svg,{at:[330,0],w:310,h:300,x:[-1.2,1.2],y:[-1.2,1.2],m:{l:10,r:10,t:30,b:20}});B.axes({grid:false,noaxes:true});B.line(-1.2,0,1.2,0,'ax');B.line(0,-1.2,0,1.2,'ax');T(B.root,155,18,'embedding: similar words are close','lab');
  [['teddy bear',0.8,0.7],['soft',0.9,0.3],['pillow',0.6,0.35],['book',-0.7,-0.5],['novel',-0.85,-0.3],['king',-0.3,0.9],['queen',0.05,0.95]].forEach(([w,x,y])=>{B.dot(x,y,5,'fr');B.text(x,y,w,'', 'start',7,4)})};
FIG['birnn']=root=>{const svg=initSvg(svgOf(root),880,260);const cell=(x,y,c)=>E('rect',{x:x-16,y:y-14,width:32,height:28,rx:5,fill:c,stroke:'#404040'},svg);
  T(svg,200,18,'Bidirectional RNN','lab');for(let i=0;i<4;i++){const x=70+i*90;cell(x,70,'#f8cbad');cell(x,120,'#bdd7ee');cell(x,165,'#bdd7ee');cell(x,225,'#c5e0b4');arrowPx(svg,x,211,x,183,'ln thin sk','fk');arrowPx(svg,x,106,x,86,'ln thin sk','fk');
    if(i<3){arrowPx(svg,x+16,165,x+74,165,'ln thin sb','fb');arrowPx(svg,x+74,120,x+16,120,'ln thin sr','fr')}}
  T(svg,660,18,'Deep RNN','lab');for(let i=0;i<4;i++){const x=530+i*90;cell(x,40,'#f8cbad');[85,130,175].forEach(y=>{cell(x,y,'#bdd7ee');if(i<3)arrowPx(svg,x+16,y,x+74,y,'ln thin sk','fk')});arrowPx(svg,x,161,x,145,'ln thin sk','fk');arrowPx(svg,x,116,x,100,'ln thin sk','fk');arrowPx(svg,x,71,x,54,'ln thin sk','fk');cell(x,225,'#c5e0b4');arrowPx(svg,x,211,x,190,'ln thin sk','fk')}};
})();
