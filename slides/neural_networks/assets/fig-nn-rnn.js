/* Figures for 05_rnn_lstm.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,q,setV,setR,svgOf}=lib;const {grid,heat,box,stepper,sig,f2,f3,TT}=window.MLNN;
const node=(svg,x,y,t,c,w,h)=>{w=w||56;h=h||40;E('rect',{x:x-w/2,y:y-h/2,width:w,height:h,rx:8,fill:c,stroke:'#404040'},svg);T(svg,x,y+5,t,'lab')};
/* ---------- text → tokens → ids → vectors ---------- */
FIG['tokens']=root=>{const svg=initSvg(svgOf(root),960,270);const toks=['the','movie','was','not','good'],ids=[2,517,14,31,48];
  T(svg,480,20,'"The movie was not good"','lab big');
  toks.forEach((t,k)=>{const x=150+k*160;box(svg,x-50,40,100,32,t,'#e2f0d9');arrowPx(svg,x,74,x,94,'ln thin sk','fk');box(svg,x-30,96,60,28,String(ids[k]),'#fff2cc');arrowPx(svg,x,126,x,146,'ln thin sk','fk');
    const r=rng(ids[k]);for(let d=0;d<6;d++){const v=Math.max(-1,Math.min(1,0.6*randn(r)));E('rect',{x:x-45+d*15,y:150,width:15,height:30,fill:heat(v),stroke:'#7f7f7f','stroke-width':0.5},svg)}});
  T(svg,40,62,'1 · tokenize','','start');T(svg,40,114,'2 · look up id','','start');T(svg,40,170,'3 · embed','','start');
  T(svg,480,215,'row id of the embedding matrix E (|V| × d), here d = 6 (in practice 100–1,024)','','middle');
  T(svg,480,240,'the sequence becomes a matrix T × d: one row per time step. That is the input of an RNN (or a transformer).','','middle')};
FIG['embed']=root=>{const svg=initSvg(svgOf(root),640,300);const A=Plot(svg,{at:[0,0],w:300,h:300,x:[-0.2,1.3],y:[-0.2,1.3],m:{l:20,r:10,t:30,b:20}});A.axes({grid:false});T(A.root,150,18,'one-hot: every word equally far','lab');
  [['book',[1,0]],['teddy bear',[0,1]]].forEach(([w,p])=>A.line(0,0,p[0],p[1],'ln thin sm'));A.dot(1,0,5,'fb');A.text(1,0,'book','', 'middle',0,18);A.dot(0,1,5,'fb');A.text(0,1,'teddy bear','', 'start',8,4);A.text(0.5,0.9,'(a third axis for "soft", …)','', 'start');
  const B=Plot(svg,{at:[330,0],w:310,h:300,x:[-1.2,1.2],y:[-1.2,1.2],m:{l:10,r:10,t:30,b:20}});B.axes({grid:false,noaxes:true});B.line(-1.2,0,1.2,0,'ax');B.line(0,-1.2,0,1.2,'ax');T(B.root,155,18,'embedding: similar words are close','lab');
  const W=[['man',-0.55,0.2],['woman',-0.55,0.75],['king',0.45,0.2],['queen',0.45,0.75],['book',-0.7,-0.6],['novel',-0.9,-0.4],['pillow',0.75,-0.55],['teddy bear',0.55,-0.8]];
  W.forEach(([w,x,y])=>{B.dot(x,y,5,'fr');B.text(x,y,w,'', 'start',7,4)});arrowPx(B.dyn,B.X(-0.55),B.Y(0.2),B.X(-0.55),B.Y(0.72),'ln thin sb','fb');arrowPx(B.dyn,B.X(0.45),B.Y(0.2),B.X(0.45),B.Y(0.72),'ln thin sb','fb');B.text(0.47,0.47,'+ "female"','', 'start',4,0)};
/* ---------- the RNN idea: read one word at a time, keep a summary ---------- */
FIG['rnn-read']=root=>{const svg=svgOf(root);const toks=['the','movie','was','not','good'];
  stepper(root,s=>{initSvg(svg,960,230);toks.forEach((t,k)=>{const x=110+k*180;const on=k<s;const cur=k===s-1;
      node(svg,x,190,t,on?'#c5e0b4':'#f2f2f2',80,34);E('rect',{x:x-34,y:78,width:68,height:48,rx:10,fill:cur?'#4472c4':on?'#bdd7ee':'#f2f2f2',stroke:'#404040'},svg);T(svg,x,108,'h'+(k+1),'lab').style.fill=cur?'#fff':'#1f1f1f';
      if(on)arrowPx(svg,x,172,x,128,'ln thin sk','fk');if(k<toks.length-1&&k<s-1)arrowPx(svg,x+36,102,x+144,102,'ln sr','fr');if(k===0&&s>0){arrowPx(svg,20,102,74,102,'ln sr','fr');T(svg,22,92,'h0 = 0','','start')}});
    const notes=['','"the": nothing much to remember yet','"movie": the topic','"was": grammar, little information','"not": remember that a negation is pending!','"good" after "not": h5 must encode "negative"'];
    T(svg,480,40,s?notes[s]:'the same cell (same weights) reads the words one by one','lab','middle');if(s===5){box(svg,860,20,90,40,'😞 negative','#fbe5d6',{cls:''});arrowPx(svg,830,78,880,62,'ln thin sk','fk')}})};
FIG['rnn-unroll']=root=>{const svg=initSvg(svgOf(root),900,300);node(svg,90,60,'y⟨t⟩','#f8cbad');node(svg,90,150,'h⟨t⟩','#bdd7ee');node(svg,90,240,'x⟨t⟩','#c5e0b4');
  arrowPx(svg,90,220,90,172,'ln thin sk','fk');arrowPx(svg,90,130,90,82,'ln thin sk','fk');E('path',{d:'M118,150 C170,150 170,100 118,135',fill:'none',stroke:'#c00000','stroke-width':2.5},svg);T(svg,168,112,'Wₕ','lab','start');T(svg,70,196,'Wₓ','','end');T(svg,70,108,'W_y','','end');
  T(svg,200,158,'=','lab big');const xs=[290,420,550,720,850];const lab=['1','2','3','t−1','t'];xs.forEach((x,i)=>{if(i===3){T(svg,635,158,'…','lab big')}
    node(svg,x,60,'y⟨'+lab[i]+'⟩','#f8cbad');node(svg,x,150,'h⟨'+lab[i]+'⟩','#bdd7ee');node(svg,x,240,'x⟨'+lab[i]+'⟩','#c5e0b4');arrowPx(svg,x,220,x,172,'ln thin sk','fk');arrowPx(svg,x,130,x,82,'ln thin sk','fk');
    if(i<4&&i!==2)arrowPx(svg,x+28,150,xs[i+1]-30,150,'ln sr','fr')});arrowPx(svg,578,150,610,150,'ln sr','fr');arrowPx(svg,660,150,690,150,'ln sr','fr');arrowPx(svg,230,150,260,150,'ln sr','fr');T(svg,238,138,'h⟨0⟩','','middle');
  T(svg,570,292,'unrolled in time: the same weights Wₓ, Wₕ, W_y at every step','','middle')};
/* ---------- inside the cell ---------- */
FIG['rnn-cell']=root=>{const svg=initSvg(svgOf(root),560,260);E('rect',{x:120,y:40,width:320,height:170,rx:16,fill:'#dae3f3',stroke:'#4472c4'},svg);
  E('line',{x1:20,y1:90,x2:200,y2:90,stroke:'#404040','stroke-width':2},svg);T(svg,24,80,'h⟨t−1⟩','lab','start');box(svg,180,72,70,36,'· Wₕ','#fff');
  E('line',{x1:280,y1:240,x2:280,y2:190,stroke:'#404040','stroke-width':2},svg);T(svg,280,256,'x⟨t⟩','lab');box(svg,245,152,70,36,'· Wₓ','#fff');
  E('circle',{cx:300,cy:110,r:16,fill:'#fff',stroke:'#404040'},svg);T(svg,300,116,'+','lab big');arrowPx(svg,250,90,286,104,'ln thin sk','fk');arrowPx(svg,284,152,294,126,'ln thin sk','fk');T(svg,300,82,'+ b','');
  box(svg,340,92,64,36,'tanh','#f4b183');arrowPx(svg,316,110,338,110,'ln thin sk','fk');E('line',{x1:404,y1:110,x2:540,y2:110,stroke:'#404040','stroke-width':2},svg);T(svg,536,100,'h⟨t⟩','lab','end');
  E('line',{x1:470,y1:110,x2:470,y2:30,stroke:'#404040','stroke-width':1.5},svg);arrowPx(svg,470,40,470,24,'ln thin sk','fk');T(svg,480,20,'→ output layer ŷ⟨t⟩','','start');
  T(svg,240,24,'one dense layer on [previous state, current input]','lab','middle')};
/* ---------- scalar RNN with numbers ---------- */
FIG['rnn-num']=root=>{const svg=svgOf(root);const wx=+root.dataset.wx||1,wh=+root.dataset.wh||0.5;const X=[1,0,0,-1,0,0];const iw=q(root,'w');
  function hs(w){const H=[0];X.forEach(x=>H.push(Math.tanh(wx*x+w*H[H.length-1])));return H}
  const show=stepper(root,s=>{const w=iw?+iw.value:wh;setV(root,'w',fmt(w,2));const H=hs(w);initSvg(svg,620,300);
    X.forEach((x,k)=>{const cx=70+k*95;const on=k<s;box(svg,cx-28,238,56,30,'x = '+String(x).replace('-','−'),on?'#c5e0b4':'#f2f2f2',{cls:''});E('circle',{cx:cx,cy:170,r:28,fill:on?heat(H[k+1]):'#f2f2f2',stroke:'#404040'},svg);T(svg,cx,176,on?f2(H[k+1]):'?','lab');
      if(on)arrowPx(svg,cx,236,cx,200,'ln thin sk','fk');if(k>0&&on)arrowPx(svg,cx-65,170,cx-30,170,'ln sr','fr')});T(svg,20,176,'h','lab','start');
    const P=Plot(svg,{at:[20,0],w:600,h:120,x:[-0.5,6.5],y:[-1,1],m:{l:30,r:10,t:16,b:10}});P.line(-0.5,0,6.5,0,'ax',P.bg);P.text(-0.5,1,'h over time','', 'start',4,0);
    const pts=H.slice(0,s+1).map((h,k)=>[k,h]);P.path(pts,'ln sb');pts.forEach(p=>P.dot(p[0],p[1],3.5,'fb'));
    const pv=v=>v<0?'('+f2(v)+')':f2(v);
    TT(svg,310,292,s===0?'h_t = tanh(1·x_t + w_h·h_{t−1}),  h_0 = 0':'h_'+s+' = tanh('+String(X[s-1]).replace('-','−')+' + '+fmt(w,2)+' · '+pv(H[s-1])+') = '+f2(H[s]),'lab','middle')});if(iw)iw.addEventListener('input',show)};
FIG['rnn-types']=root=>{const svg=initSvg(svgOf(root),960,250);const cell=(x,y,c)=>E('rect',{x:x-14,y:y-14,width:28,height:28,rx:5,fill:c,stroke:'#404040'},svg);
  const draw=(x0,lab,ex,ins,outs,n)=>{T(svg,x0+100,20,lab,'lab');for(let i=0;i<n;i++){const x=x0+30+i*50;cell(x,120,'#bdd7ee');if(i<n-1)arrowPx(svg,x+14,120,x+36,120,'ln thin sk','fk');
    if(ins.includes(i)){cell(x,190,'#c5e0b4');arrowPx(svg,x,176,x,136,'ln thin sk','fk')}if(outs.includes(i)){cell(x,50,'#f8cbad');arrowPx(svg,x,106,x,66,'ln thin sk','fk')}}T(svg,x0+100,235,ex,'','middle')};
  draw(0,'One-to-many','music generation, captioning',[0],[0,1,2,3],4);draw(240,'Many-to-one','sentiment classification',[0,1,2,3],[3],4);draw(480,'Many-to-many (Tx = Ty)','named entity recognition',[0,1,2,3],[0,1,2,3],4);draw(720,'Many-to-many (Tx ≠ Ty)','machine translation',[0,1],[2,3],4)};
/* ---------- BPTT: the gradient travels back through every step ---------- */
FIG['bptt']=root=>{const svg=initSvg(svgOf(root),940,250);const n=6;
  for(let k=0;k<n;k++){const x=80+k*150;node(svg,x,110,'h'+(k+1),'#bdd7ee');node(svg,x,190,'x'+(k+1),'#c5e0b4',50,30);arrowPx(svg,x,175,x,132,'ln thin sk','fk');if(k<n-1)arrowPx(svg,x+30,110,x+118,110,'ln thin sk','fk')}
  node(svg,80+(n-1)*150,30,'L','#fbe5d6',50,30);arrowPx(svg,80+(n-1)*150,88,80+(n-1)*150,47,'ln thin sk','fk');
  for(let k=n-1;k>0;k--){const x=80+k*150;const w=Math.max(0.6,7*Math.pow(0.6,n-1-k));E('path',{d:'M'+(x-30)+',95 C'+(x-60)+',70 '+(x-90)+',70 '+(x-120)+',95',fill:'none',stroke:'#c00000','stroke-width':w},svg);T(svg,x-75,62,'× Wₕᵀ·tanh′','').style.fill='#c00000'}
  T(svg,470,240,'the gradient from the loss is multiplied by the same factor at every step back: after k steps, ~(‖Wₕ‖·tanh′)ᵏ','','middle')};
FIG['vanish']=root=>{const P=Plot(svgOf(root),{w:560,h:340,x:[0,60],y:[-8,4],m:{l:44,r:14,t:14,b:36}});P.axes({xt:[0,10,20,30,40,50,60],yt:[-8,-6,-4,-2,0,2,4],fy:v=>'1e'+v,xl:'steps back in time (T − k)',yl:'gradient size'});P.line(0,0,60,0,'ln thin sm dash',P.bg);
  const iw=q(root,'w'),iff=q(root,'f');function draw(){const w=+iw.value,f=+iff.value;setV(root,'w',fmt(w,2));setV(root,'f',fmt(f,2));P.clear();
    P.fn(k=>Math.max(-8,Math.min(4,k*Math.log10(w))),'ln sr',0,60,120);P.fn(k=>Math.max(-8,k*Math.log10(f)),'ln sb',0,60,120);setR(root,'r',(Math.pow(w,50)).toExponential(1));setR(root,'l',(Math.pow(f,50)).toExponential(1))}
  iw.addEventListener('input',draw);iff.addEventListener('input',draw);draw()};
/* ---------- gradient clipping ---------- */
FIG['clip']=root=>{const svg=initSvg(svgOf(root),420,260);const P=Plot(svg,{w:420,h:260,x:[-1,6],y:[-1,5],m:{l:20,r:10,t:20,b:20}});P.axes({grid:false,noaxes:true});
  const c=[0,0];const t=Array.from({length:61},(_,i)=>2*Math.PI*i/60);P.path(t.map(a=>[1.5*Math.cos(a),1.5*Math.sin(a)]),'ln thin sm dash');P.text(-1,1.6,'‖g‖ = τ','', 'start');
  lib.arrow(P,0,0,5,4,'ln sr','fr');P.text(5,4,'raw gradient (exploding)','', 'end',-6,-8);const n=Math.hypot(5,4);lib.arrow(P,0,0,1.5*5/n,1.5*4/n,'ln sb','fb');P.text(1.2,0.6,'clipped: same direction, length τ','', 'start',6,8)};
/* ---------- LSTM ---------- */
function lstmDraw(svg,hi){const on=t=>!hi||hi.includes(t);const G=t=>{const g=E('g',{},svg);if(!on(t))g.setAttribute('opacity','0.18');return g};
  const col=t=>hi&&on(t)?'#c00000':'#404040',sw=t=>hi&&on(t)?2.6:1.2;
  E('rect',{x:60,y:40,width:500,height:230,rx:18,fill:'#e2f0d9',stroke:'#548235'},svg);T(svg,310,32,'cell state c: the memory highway (additive)','','middle');
  const op=(g,x,y,t)=>{E('circle',{cx:x,cy:y,r:13,fill:'#fff',stroke:'#404040'},g);T(g,x,y+5,t,'lab')};
  const gate=(g,x,t,c,lab)=>{E('rect',{x:x-26,y:165,width:52,height:30,rx:4,fill:c,stroke:'#404040'},g);T(g,x,185,t,'lab');T(g,x,215,lab,'','middle')};
  let g=G('bus');E('line',{x1:20,y1:230,x2:120,y2:230,stroke:'#404040','stroke-width':2},g);T(g,24,250,'h⟨t−1⟩','lab','start');E('line',{x1:120,y1:300,x2:120,y2:180,stroke:'#404040','stroke-width':2},g);T(g,120,322,'x⟨t⟩','lab');
  E('line',{x1:120,y1:180,x2:394,y2:180,stroke:'#404040','stroke-width':1.5},g);T(g,86,172,'[h, x]','','middle');
  g=G('c');[[20,157],[183,287],[313,600]].forEach(([a,b])=>E('line',{x1:a,y1:80,x2:b,y2:80,stroke:col('c'),'stroke-width':3},g));T(g,28,70,'c⟨t−1⟩','lab','start');T(g,592,70,'c⟨t⟩','lab','end');op(g,300,80,'+');
  g=G('f');E('line',{x1:170,y1:165,x2:170,y2:93,stroke:col('f'),'stroke-width':sw('f')},g);gate(g,170,'σ','#ffc000','forget f');op(g,170,80,'×');
  g=G('i');E('line',{x1:260,y1:165,x2:289,y2:134,stroke:col('i'),'stroke-width':sw('i')},g);E('line',{x1:330,y1:165,x2:311,y2:134,stroke:col('i'),'stroke-width':sw('i')},g);E('line',{x1:300,y1:112,x2:300,y2:93,stroke:col('i'),'stroke-width':sw('i')},g);
  gate(g,260,'σ','#ffc000','input i');gate(g,330,'tanh','#f4b183','candidate c̃');op(g,300,125,'×');
  g=G('o');E('line',{x1:420,y1:180,x2:468,y2:192,stroke:col('o'),'stroke-width':sw('o')},g);E('line',{x1:480,y1:80,x2:480,y2:105,stroke:col('o'),'stroke-width':sw('o')},g);E('line',{x1:480,y1:131,x2:480,y2:182,stroke:col('o'),'stroke-width':sw('o')},g);
  E('line',{x1:493,y1:195,x2:600,y2:195,stroke:col('o'),'stroke-width':2},g);gate(g,420,'σ','#ffc000','output o');E('rect',{x:455,y:105,width:50,height:26,rx:4,fill:'#f4b183',stroke:'#404040'},g);T(g,480,123,'tanh','lab');op(g,480,195,'×');T(g,592,215,'h⟨t⟩','lab','end')}
FIG['lstm-cell']=root=>{const svg=initSvg(svgOf(root),620,330);lstmDraw(svg,null)};
FIG['lstm-walk']=root=>{const svg=svgOf(root);stepper(root,s=>{initSvg(svg,620,330);lstmDraw(svg,[null,['f'],['i'],['c','f','i'],['o']][s])})};
/* a gate is a sigmoid vector that multiplies a signal element by element */
FIG['gate-demo']=root=>{const svg=initSvg(svgOf(root),560,230);const sg=[2.0,-1.5,0.8,3.0],z=[4,-4,0,2];const g=z.map(v=>1/(1+Math.exp(-v)));const out=sg.map((v,k)=>v*g[k]);
  const col=(x0,title,vals,fill,fmtf)=>{T(svg,x0+40,18,title,'lab');vals.forEach((v,k)=>{const y=30+k*44;E('rect',{x:x0,y:y,width:80,height:36,rx:4,fill:fill(v,k),stroke:'#7f7f7f'},svg);T(svg,x0+40,y+23,fmtf(v),'lab')})};
  const mn=v=>(v<0?'−':'')+Math.abs(v).toFixed(2);
  col(20,'signal',sg,()=>'#dae3f3',mn);T(svg,132,118,'⊙','lab big');col(160,'gate σ(z)',g,v=>'rgba(255,192,0,'+(0.15+0.85*v).toFixed(2)+')',v=>v.toFixed(2));T(svg,272,118,'=','lab big');col(300,'gate ⊙ signal',out,()=>'#e2f0d9',mn);
  ['let through','blocked','halved','mostly through'].forEach((t,k)=>T(svg,396,30+k*44+23,t,'','start'))};
/* an embedding is a lookup table: one-hot × E = one row of E */
FIG['lookup']=root=>{const svg=initSvg(svgOf(root),620,250);const voc=['<PAD>','<UNK>','the','movie','good'];const Em=[[0,0,0],[0.1,-0.3,0.2],[0.4,0.1,-0.2],[0.8,-0.2,0.5],[-0.3,0.9,0.6]];const k=3;const cs=34;
  T(svg,60,20,'one-hot of "movie"','lab');voc.forEach((w,i)=>{E('rect',{x:20+i*cs*0.5,y:112,width:cs*0.5-2,height:30,fill:i===k?'#ffc000':'#fff',stroke:'#7f7f7f'},svg);T(svg,20+i*cs*0.5+8,132,i===k?'1':'0','')});T(svg,62,168,'1 × |V|','','middle');
  T(svg,120,132,'×','lab big');
  T(svg,300,20,'embedding matrix E (|V| × d)','lab');voc.forEach((w,i)=>{T(svg,196,48+i*cs+22,i+' '+w,i===k?'lab':'','end');Em[i].forEach((v,j)=>{E('rect',{x:205+j*60,y:48+i*cs,width:58,height:cs-2,fill:i===k?'#ffe699':'#f7f7f7',stroke:i===k?'#bf9000':'#d0d0d0'},svg);T(svg,205+j*60+29,48+i*cs+21,(v<0?'−':'')+Math.abs(v).toFixed(1),i===k?'lab':'')})});
  T(svg,410,132,'=','lab big');T(svg,515,90,'vector of "movie"','lab');Em[k].forEach((v,j)=>{E('rect',{x:432+j*56,y:112,width:54,height:32,fill:'#ffe699',stroke:'#bf9000'},svg);T(svg,432+j*56+27,133,(v<0?'−':'')+Math.abs(v).toFixed(1),'lab')});T(svg,515,168,'1 × d','','middle');
  T(svg,310,240,'multiplying by a one-hot vector just picks a row: in code, E[3]. The rows are learned by backprop.','','middle')};
/* the LSTM as a notebook: a story of the gates over a sentence */
const STORY={t:['The','cat',',','which','ate','a','lot',',','was','sleepy'],
  f:[0.1,0.9,0.95,0.97,0.96,0.97,0.97,0.96,0.95,0.2],i:[0.1,0.95,0.05,0.05,0.1,0.02,0.05,0.02,0.05,0.8],o:[0.1,0.2,0.1,0.1,0.1,0.1,0.1,0.2,0.95,0.3],cand:[0,1,0,0,0,0,0,0,0,-0.5]};
FIG['lstm-story']=root=>{const svg=svgOf(root);const n=STORY.t.length;const C=[0];for(let k=0;k<n;k++)C.push(STORY.f[k]*C[k]+STORY.i[k]*STORY.cand[k]);const H=C.slice(1).map((c,k)=>STORY.o[k]*Math.tanh(c));
  stepper(root,s=>{initSvg(svg,960,345);const x0=150,dx=78;T(svg,20,40,'word','lab','start');T(svg,20,80,'forget f','','start');T(svg,20,112,'input i','','start');T(svg,20,144,'output o','','start');T(svg,20,266,'memory c','lab','start');T(svg,20,180,'h = o·tanh(c)','lab','start');
    STORY.t.forEach((w,k)=>{const x=x0+k*dx;const on=k<s,cur=k===s-1;const tt=T(svg,x,40,w,cur?'lab big':'lab');tt.style.fill=on?(cur?'#c00000':'#1f1f1f'):'#bfbfbf';
      if(on){[['f','#4472c4',66],['i','#70ad47',98],['o','#ed7d31',130]].forEach(([g,c,y])=>{E('rect',{x:x-30,y:y,width:60,height:18,fill:'#f2f2f2'},svg);E('rect',{x:x-30,y:y,width:60*STORY[g][k],height:18,fill:c},svg);T(svg,x,y+14,f2(STORY[g][k]),'').style.fill=STORY[g][k]>0.5?'#fff':'#404040'});
        const hv=H[k];const ht=T(svg,x,180,f2(hv),Math.abs(hv)>0.3?'lab':'');ht.style.fill=Math.abs(hv)>0.3?'#c00000':'#7f7f7f';
        const v=C[k+1];E('rect',{x:x-30,y:v>=0?272-50*v:272,width:60,height:Math.abs(50*v)+1,fill:'#7030a0','fill-opacity':0.7},svg);T(svg,x,v>=0?266-50*v:288+50*Math.abs(v),f2(v),'')}});
    E('line',{x1:x0-40,y1:272,x2:x0+n*dx-30,y2:272,stroke:'#404040'},svg);
    const notes=['An LSTM reading a sentence: watch the gates and the memory cell','"The": little to store','"cat": the input gate opens and writes "subject = singular" into memory','",": forget ≈ 1, input ≈ 0: the memory is kept untouched','"which": a sub-clause starts; still keep the subject','"ate": not relevant for the verb agreement: keep','"a": keep','"lot": keep','",": the sub-clause ends; the subject is still in memory','"was": the output gate opens: h reads "singular" to choose was, not were','"sleepy": the forget gate closes (the subject is no longer needed) and new content is written'];
    T(svg,480,336,notes[s],'lab','middle')})};
/* LSTM gates on one step, with numbers */
FIG['lstm-num']=root=>{const svg=svgOf(root);const cp=0.8,f=0.9,i=0.3,ct=-0.5,o=0.7;const c=f*cp+i*ct;const h=o*Math.tanh(c);
  stepper(root,s=>{initSvg(svg,600,260);box(svg,20,40,120,40,'c⟨t−1⟩ = '+cp,'#e4d7f5');
    const row=(y,t,v,show)=>{if(!show)return;box(svg,180,y,400,34,t+(v!==undefined?' = '+f3(v):''),'#fff',{cls:''})};
    row(30,'keep:  f · c⟨t−1⟩ = 0.9 · 0.8',f*cp,s>=1);row(74,'write: i · c̃ = 0.3 · (−0.5)',i*ct,s>=2);row(118,'new memory c⟨t⟩ = 0.72 + (−0.15)',c,s>=3);row(162,'output: h⟨t⟩ = o · tanh(c⟨t⟩) = 0.7 · tanh(0.57)',h,s>=4);
    T(svg,300,230,['gates (sigmoids of [h⟨t−1⟩, x⟨t⟩]): f = 0.9, i = 0.3, o = 0.7; candidate c̃ = −0.5','the forget gate keeps 90 % of the old memory','the input gate lets in 30 % of the new candidate','memory update: a sum, not a product through a squashing function','the output gate decides how much of the memory to show'][s],'','middle')})};
FIG['gru-cell']=root=>{const svg=initSvg(svgOf(root),560,280);E('rect',{x:50,y:30,width:460,height:210,rx:16,fill:'#fff2cc',stroke:'#bf9000'},svg);
  E('line',{x1:10,y1:70,x2:550,y2:70,stroke:'#404040','stroke-width':3},svg);T(svg,14,60,'h⟨t−1⟩','lab','start');T(svg,546,60,'h⟨t⟩','lab','end');
  E('circle',{cx:400,cy:70,r:18,fill:'#fff',stroke:'#404040','stroke-width':1.5},svg);T(svg,400,76,'mix','');
  box(svg,90,150,80,34,'σ  Γ_r','#ffc000');box(svg,220,150,80,34,'σ  Γ_u','#ffc000');box(svg,350,150,100,34,'tanh  h̃','#f4b183');
  T(svg,136,212,'reset','','start');T(svg,266,212,'update','','start');T(svg,406,212,'candidate','','start');
  arrowPx(svg,275,148,388,84,'ln thin sk','fk');arrowPx(svg,400,148,400,90,'ln thin sk','fk');E('path',{d:'M170,167 C230,120 300,120 348,160',fill:'none',stroke:'#7f7f7f','stroke-width':1.5,'stroke-dasharray':'5 4'},svg);
  T(svg,262,128,'Γ_r ⊙ h⟨t−1⟩','');T(svg,470,114,'Γ_u·h̃ + (1−Γ_u)·h⟨t−1⟩','','end');
  E('line',{x1:30,y1:272,x2:30,y2:225,stroke:'#404040','stroke-width':1.5},svg);E('line',{x1:30,y1:225,x2:400,y2:225,stroke:'#404040','stroke-width':1.5},svg);[130,260,400].forEach(x=>arrowPx(svg,x,225,x,187,'ln thin sk','fk'));T(svg,40,270,'x⟨t⟩','lab','start')};
/* ---------- the memory experiment (notes 04, section 9.4) ---------- */
FIG['memory-exp']=root=>{const svg=initSvg(svgOf(root),600,320);const P=Plot(svg,{at:[0,0],w:600,h:300,x:[0,105],y:[0.4,1.02],m:{l:48,r:14,t:30,b:40}});P.axes({xt:[5,25,50,75,100],yt:[0.5,0.75,1],fy:v=>Math.round(v*100)+'%',xl:'distance to the relevant token (steps)',yl:'accuracy'});
  T(P.root,300,18,'Remember the first token of a random sequence (chance = 50 %)','lab');P.line(0,0.5,105,0.5,'ln thin sm dash',P.bg);
  const L=[5,10,25,50,100];const R={rnn:[1,1,0.5,0.52,0.51],lstm:[1,1,0.5,0.52,0.53],lstmf:[1,1,1,1,1]};
  [['rnn','#7f7f7f','vanilla RNN'],['lstm','#4472c4','LSTM, default init'],['lstmf','#c00000','LSTM, forget bias = 5 (gate starts open)']].forEach(([k,c,lab],j)=>{const pa=P.path(L.map((l,i)=>[l,R[k][i]]),'ln');pa.setAttribute('stroke',c);L.forEach((l,i)=>{const d=P.dot(l,R[k][i],4,'');d.setAttribute('fill',c)});P.text(32,0.9-j*0.055,'● '+lab,'', 'start').style.fill=c});
  T(svg,300,316,'800 Adam steps each, test on 2,000 fresh sequences (results of notes/neural_networks/04, section 9.4)','','middle')};
FIG['birnn']=root=>{const svg=initSvg(svgOf(root),880,260);const cell=(x,y,c)=>E('rect',{x:x-16,y:y-14,width:32,height:28,rx:5,fill:c,stroke:'#404040'},svg);
  T(svg,200,18,'Bidirectional RNN','lab');for(let i=0;i<4;i++){const x=70+i*90;cell(x,70,'#f8cbad');cell(x,120,'#bdd7ee');cell(x,165,'#bdd7ee');cell(x,225,'#c5e0b4');arrowPx(svg,x,211,x,183,'ln thin sk','fk');arrowPx(svg,x,106,x,86,'ln thin sk','fk');
    if(i<3){arrowPx(svg,x+16,165,x+74,165,'ln thin sb','fb');arrowPx(svg,x+74,120,x+16,120,'ln thin sr','fr')}}
  T(svg,660,18,'Deep (stacked) RNN','lab');for(let i=0;i<4;i++){const x=530+i*90;cell(x,40,'#f8cbad');[85,130,175].forEach(y=>{cell(x,y,'#bdd7ee');if(i<3)arrowPx(svg,x+16,y,x+74,y,'ln thin sk','fk')});arrowPx(svg,x,161,x,145,'ln thin sk','fk');arrowPx(svg,x,116,x,100,'ln thin sk','fk');arrowPx(svg,x,71,x,54,'ln thin sk','fk');cell(x,225,'#c5e0b4');arrowPx(svg,x,211,x,190,'ln thin sk','fk')}};
/* ---------- padding and masking ---------- */
FIG['padding']=root=>{const svg=initSvg(svgOf(root),600,200);const S=[['great','movie','!'],['not','my','cup','of','tea'],['boring']];
  S.forEach((s,k)=>{for(let j=0;j<5;j++){const pad=j>=s.length;box(svg,120+j*90,20+k*48,84,38,pad?'<PAD>':s[j],pad?'#e7e6e6':'#e2f0d9',{cls:pad?'':'lab',tcol:pad?'#8c8c8c':undefined})}T(svg,110,44+k*48,'length '+s.length,'','end')});
  T(svg,345,185,'batch tensor [3, 5] plus lengths [3, 5, 1]: the model must ignore <PAD>','','middle')};
/* ---------- seq2seq: the bottleneck ---------- */
FIG['seq2seq']=root=>{const svg=initSvg(svgOf(root),960,250);const src=['the','black','cat','sleeps'],tgt=['el','gato','negro','duerme'];
  src.forEach((w,k)=>{const x=60+k*100;node(svg,x,120,'',k===3?'#4472c4':'#bdd7ee',50,36);node(svg,x,200,w,'#c5e0b4',70,30);arrowPx(svg,x,184,x,140,'ln thin sk','fk');if(k<3)arrowPx(svg,x+26,120,x+74,120,'ln thin sk','fk')});
  T(svg,210,40,'encoder reads the source','lab');E('rect',{x:420,y:98,width:90,height:44,rx:8,fill:'#c00000'},svg);T(svg,465,125,'context c','lab').style.fill='#fff';arrowPx(svg,386,120,418,120,'ln sr','fr');T(svg,465,168,'one fixed-size vector','','middle');T(svg,465,186,'for the whole sentence','','middle');
  tgt.forEach((w,k)=>{const x=580+k*100;node(svg,x,120,'','#fbe5d6',50,36);node(svg,x,50,w,'#f8cbad',70,30);arrowPx(svg,x,102,x,66,'ln thin sk','fk');if(k<3)arrowPx(svg,x+26,120,x+74,120,'ln thin sk','fk')});arrowPx(svg,512,120,554,120,'ln sr','fr');
  T(svg,730,200,'decoder writes the translation','lab');T(svg,480,240,'Long sentences must squeeze through c: information is lost. Attention (chapter 6) lets the decoder look back at every hᵢ.','','middle')};
window.MLNN.STORY=STORY;
})();
