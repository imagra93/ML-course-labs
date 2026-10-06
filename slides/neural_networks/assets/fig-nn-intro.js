/* Figures for 01_neural_networks.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,solve,fitLogit,halfPlane,fmt,q,setV,setR,svgOf}=lib;const {drawNet,trainMLP,box,grid,heat,stepper,segs,sig,f2,f3,NET,tinyForward,drawTiny,TT}=window.MLNN;
/* one neuron: linear regression (no activation) or logistic regression (sigmoid) */
function neuronFig(root,act){const svg=initSvg(svgOf(root),560,300);const ys=[50,110,170,250];const lin=act==='linear';
  ys.forEach((y,i)=>{E('circle',{cx:50,cy:y,r:18,fill:i===3?'#fff':'#70ad47',stroke:'#404040'},svg);T(svg,50,y+5,i===3?'xₙ':'x'+['₁','₂','₃'][i],'lab').style.fill=i===3?'#000':'#fff';
    arrowPx(svg,70,y,240,150,'ln thin sm','fm');E('rect',{x:120,y:y-14+(150-y)*0.3,width:40,height:22,fill:'#dae3f3',stroke:'#4472c4'},svg);T(svg,140,y+2+(150-y)*0.3,'w'+['₁','₂','₃','ₙ'][i],'')});
  T(svg,50,215,'⋮','lab big');
  E('circle',{cx:270,cy:52,r:16,fill:'#fff2cc',stroke:'#bf9000'},svg);T(svg,270,57,'b','lab');arrowPx(svg,270,68,270,118,'ln thin sm','fm');T(svg,290,90,'bias','','start');
  E('circle',{cx:270,cy:150,r:30,fill:'#fff',stroke:'#404040','stroke-width':1.5},svg);T(svg,270,158,'Σ','lab big');TT(svg,270,202,'z = w^⊤x + b','');
  arrowPx(svg,300,150,355,150,'ln thin sk','fk');E('rect',{x:357,y:120,width:80,height:60,rx:6,fill:lin?'#a5a5a5':'#4472c4'},svg);T(svg,397,156,lin?'g(z) = z':'σ(z)','lab').style.fill='#fff';T(svg,397,200,lin?'no activation':'activation','');
  arrowPx(svg,437,150,490,150,'ln thin sk','fk');T(svg,520,156,'ŷ','lab big');
  T(svg,280,290,lin?'One neuron with no activation = linear regression':'One neuron with a sigmoid = logistic regression (a single-layer perceptron)','','middle')}
FIG['neuron']=root=>neuronFig(root,'sigmoid');
FIG['lin-neuron']=root=>neuronFig(root,'linear');
/* a biological neuron next to an artificial one */
FIG['bio-neuron']=root=>{const svg=initSvg(svgOf(root),620,300);T(svg,150,20,'a biological neuron','lab');const so=[115,130];
  const lead=(x1,y1,x2,y2)=>E('line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:'#a5a5a5','stroke-dasharray':'3 3'},svg);
  [[14,70],[8,130],[18,190],[48,48],[40,210]].forEach(([x,y])=>{E('path',{d:'M'+x+','+y+' Q'+((x+so[0])/2+4)+','+((y+so[1])/2-8)+' '+(so[0]-22)+','+(so[1]+(y-so[1])*0.25),fill:'none',stroke:'#c55a11','stroke-width':3,'stroke-linecap':'round'},svg);
    E('path',{d:'M'+x+','+y+' l-9,-7 M'+x+','+y+' l-11,5',fill:'none',stroke:'#c55a11','stroke-width':2,'stroke-linecap':'round'},svg)});
  E('circle',{cx:so[0],cy:so[1],r:26,fill:'#f4b183',stroke:'#c55a11','stroke-width':2},svg);E('circle',{cx:so[0],cy:so[1],r:8,fill:'#c55a11'},svg);
  E('line',{x1:141,y1:130,x2:246,y2:130,stroke:'#c55a11','stroke-width':4},svg);[150,178,206].forEach(x=>E('rect',{x:x,y:123,width:22,height:14,rx:6,fill:'#fbe5d6',stroke:'#c55a11'},svg));
  [[268,108],[274,130],[268,152]].forEach(([x,y])=>{E('line',{x1:246,y1:130,x2:x,y2:y,stroke:'#c55a11','stroke-width':3},svg);E('circle',{cx:x,cy:y,r:5,fill:'#c55a11'},svg)});
  [[38,'dendrites','(inputs)',40,200],[115,'cell body','(adds up)',115,158],[195,'axon','(fires if high)',195,138],[276,'synapses','(outputs)',270,160]].forEach(([x,t1,t2,px,py])=>{T(svg,x,238,t1,'lab','middle');T(svg,x,256,t2,'','middle');lead(x,224,px,py+6)});
  E('line',{x1:318,y1:40,x2:318,y2:262,stroke:'#d0d0d0','stroke-dasharray':'4 4'},svg);
  T(svg,475,20,'an artificial neuron (a unit)','lab');const ins=[70,130,190];
  ins.forEach((y,i)=>{E('circle',{cx:350,cy:y,r:15,fill:'#70ad47',stroke:'#404040'},svg);T(svg,350,y+5,'x'+['₁','₂','₃'][i],'lab').style.fill='#fff';arrowPx(svg,366,y,446,130+(y-130)*0.2,'ln thin sm','fm');
    const yy=y+(130-y)*0.36;E('rect',{x:384,y:yy-11,width:34,height:20,fill:'#dae3f3',stroke:'#4472c4'},svg);T(svg,401,yy+4,'w'+['₁','₂','₃'][i],'')});
  E('circle',{cx:470,cy:130,r:24,fill:'#fff',stroke:'#404040','stroke-width':1.5},svg);T(svg,470,137,'Σ','lab big');
  arrowPx(svg,494,130,512,130,'ln thin sk','fk');E('rect',{x:514,y:110,width:40,height:40,rx:6,fill:'#4472c4'},svg);T(svg,534,136,'g','lab').style.fill='#fff';arrowPx(svg,554,130,576,130,'ln thin sk','fk');T(svg,592,136,'ŷ','lab big');
  [[372,'inputs','× weights',372,196],[470,'sum','+ bias',470,154],[545,'activation','(non-linear)',534,150]].forEach(([x,t1,t2,px,py])=>{T(svg,x,238,t1,'lab','middle');T(svg,x,256,t2,'','middle');lead(x,224,px,py+6)});
  TT(svg,470,290,'ŷ = g(w_1x_1 + w_2x_2 + w_3x_3 + b)','lab','middle')};
/* "Why neural networks": one small picture per application, data-app = voice | chat | news | music | color | robot | caption | yolo |
   diffusion | rag. viewBox 200 × 110, plain shapes in the deck colours */
let appClip=0;
FIG['app']=root=>{const svg=initSvg(svgOf(root),200,110);const k=root.dataset.app;
  const tx=(x,y,s,o)=>{o=o||{};const t=T(svg,x,y,s,'',o.a);t.setAttribute('style','font-size:'+(o.fs||12)+'px;fill:'+(o.c||'#1f1f1f')+(o.b?';font-weight:700':'')+(o.i?';font-style:italic':''));return t};
  const rc=(x,y,w,h,fill,o)=>{o=o||{};return E('rect',{x:x,y:y,width:w,height:h,rx:o.rx||0,fill:fill,stroke:o.s||'none','stroke-width':o.sw||1},o.g||svg)};
  const ci=(x,y,r,fill,o)=>{o=o||{};return E('circle',{cx:x,cy:y,r:r,fill:fill,stroke:o.s||'none','stroke-width':o.sw||1},o.g||svg)};
  const pa=(d,fill,stroke,sw,g)=>E('path',{d:d,fill:fill||'none',stroke:stroke||'none','stroke-width':sw||1,'stroke-linecap':'round','stroke-linejoin':'round'},g||svg);
  const ar=(x1,y1,x2,y2)=>{E('line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:'#7f7f7f','stroke-width':1.6},svg);const a=Math.atan2(y2-y1,x2-x1),c=Math.cos(a),s=Math.sin(a);
    E('polygon',{points:[[x2,y2],[x2-7*c+3.5*s,y2-7*s-3.5*c],[x2-7*c-3.5*s,y2-7*s+3.5*c]].map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' '),fill:'#7f7f7f'},svg)};
  /* a picture frame: returns a group clipped to it (the border is drawn by the caller, on top) */
  const frame=(x,y,w,h)=>{const id='app-cp'+(appClip++);rc(x,y,w,h,'#fff',{g:E('clipPath',{id:id},E('defs',{},svg))});return E('g',{'clip-path':'url(#'+id+')'},svg)};
  const wave=(x0,y,c)=>[5,11,19,13,25,17,29,15,21,9,17,7,4].forEach((h,i)=>rc(x0+i*4,y-h/2,2.4,h,c,{rx:1.2}));
  if(k==='voice'){tx(36,9,'you',{fs:10.5,c:'#6b6b6b'});wave(10,30,'#4472c4');ar(66,30,80,30);rc(84,17,112,26,'#dae3f3',{s:'#4472c4',rx:9});tx(140,34,'“timer for 10 min”');
    rc(4,67,112,26,'#fbe5d6',{s:'#ed7d31',rx:9});tx(60,84,'“Timer set!”');ar(120,80,134,80);wave(140,80,'#ed7d31');tx(166,107,'assistant',{fs:10.5,c:'#6b6b6b'})}
  else if(k==='chat'){rc(70,6,126,24,'#4472c4',{rx:11});tx(133,22,'Explain overfitting',{c:'#fff'});
    rc(4,38,128,40,'#f2f2f2',{s:'#d0d0d0',rx:11});tx(12,54,'Learning the noise,',{a:'start'});tx(12,70,'not the pattern.',{a:'start'});
    rc(4,86,44,18,'#f2f2f2',{s:'#d0d0d0',rx:9});[16,26,36].forEach(x=>ci(x,95,2.4,'#8c8c8c'))}
  else if(k==='news'){rc(4,6,108,98,'#fff',{s:'#a6a6a6',rx:3});rc(4,6,108,15,'#404040',{rx:3});rc(4,15,108,6,'#404040');tx(58,17.5,'DAILY NEWS',{fs:9.5,c:'#fff',b:1});
    tx(12,37,'COFFEE MAKES',{a:'start',b:1});tx(12,51,'YOU IMMORTAL!',{a:'start',b:1});[[62,92],[70,84],[78,90],[86,70],[94,86]].forEach(([y,w])=>rc(12,y,w,3.5,'#d9d9d9',{rx:1.5}));
    ar(116,55,128,55);tx(162,40,'fake 96 %',{b:1,c:'#c00000'});rc(132,45,60*0.96,9,'#c00000');tx(162,72,'real 4 %',{b:1,c:'#548235'});rc(132,77,3,9,'#70ad47')}
  else if(k==='music'){[30,38,46,54,62].forEach(y=>E('line',{x1:6,x2:194,y1:y,y2:y,stroke:'#a6a6a6'},svg));
    const note=(x,y,c)=>{E('ellipse',{cx:x,cy:y,rx:4.8,ry:3.5,fill:c,transform:'rotate(-20 '+x+' '+y+')'},svg);const up=y>46,sx=up?x+4.3:x-4.3;E('line',{x1:sx,y1:y,x2:sx,y2:y+(up?-24:24),stroke:c,'stroke-width':1.4},svg)};
    [[24,54],[44,46],[64,50],[84,38]].forEach(([x,y])=>note(x,y,'#1f1f1f'));[[118,42],[138,46],[158,34],[178,38]].forEach(([x,y])=>note(x,y,'#ed7d31'));
    E('line',{x1:101,x2:101,y1:16,y2:76,stroke:'#ed7d31','stroke-dasharray':'3 3'},svg);tx(54,97,'given',{c:'#6b6b6b'});tx(148,97,'generated →',{c:'#ed7d31',b:1})}
  else if(k==='color'){const gray=c=>{const n=parseInt(c.slice(1),16),v=Math.round(0.299*(n>>16)+0.587*(n>>8&255)+0.114*(n&255));return 'rgb('+v+','+v+','+v+')'};
    const scene=(x,y,f)=>{const g=frame(x,y,80,62);rc(x,y,80,62,f('#bdd7ee'),{g:g});ci(x+62,y+14,8,f('#ffc000'),{g:g});
      pa('M'+x+','+(y+44)+' L'+(x+22)+','+(y+20)+' L'+(x+40)+','+(y+38)+' L'+(x+56)+','+(y+24)+' L'+(x+80)+','+(y+46)+' V'+(y+62)+' H'+x+' Z',f('#8497b0'),null,1,g);
      rc(x,y+46,80,16,f('#a9d18e'),{g:g});rc(x+12,y+35,16,12,f('#f4b183'),{g:g});pa('M'+(x+9)+','+(y+36)+' L'+(x+20)+','+(y+27)+' L'+(x+31)+','+(y+36)+' Z',f('#c00000'),null,1,g);
      rc(x+61,y+40,3,10,f('#843c0c'),{g:g});ci(x+62.5,y+37,7,f('#548235'),{g:g});rc(x,y,80,62,'none',{s:'#7f7f7f'})};
    scene(6,14,gray);ar(90,45,110,45);scene(114,14,c=>c);tx(46,95,'old photo',{c:'#6b6b6b'});tx(154,95,'colorized',{c:'#6b6b6b'})}
  else if(k==='robot'){E('line',{x1:4,x2:196,y1:100,y2:100,stroke:'#a6a6a6','stroke-width':1.5},svg);
    E('line',{x1:162,y1:25,x2:104,y2:76,stroke:'#5b9bd5','stroke-dasharray':'3 3'},svg);E('line',{x1:162,y1:25,x2:128,y2:98,stroke:'#5b9bd5','stroke-dasharray':'3 3'},svg);
    rc(22,88,40,12,'#7f7f7f',{rx:2});pa('M42,86 L70,42','none','#ffc000',9);pa('M70,42 L116,54','none','#ffc000',8);ci(42,86,6,'#404040');ci(70,42,6,'#404040');ci(116,54,4.5,'#404040');
    pa('M102,60 H130 M102,60 V74 M130,60 V74','none','#404040',3);rc(104,76,24,22,'#ed7d31',{s:'#c55a11'});
    rc(150,10,24,15,'#404040',{rx:3});ci(162,17.5,4.5,'#9dc3e6',{s:'#fff'});tx(178,21,'see',{a:'start',fs:11,c:'#4472c4',b:1});tx(150,70,'grasp',{a:'start',fs:11,c:'#c55a11',b:1})}
  else if(k==='caption'){const g=frame(6,10,84,70);rc(6,10,84,70,'#dae3f3',{g:g});rc(6,56,84,24,'#a9d18e',{g:g});
    pa('M24,52 Q16,44 19,38','none','#c55a11',3,g);[27,32,43,48].forEach(x=>rc(x,56,3.4,11,'#c55a11',{g:g}));E('ellipse',{cx:38,cy:54,rx:15,ry:8,fill:'#c55a11'},g);
    ci(55,45,7,'#c55a11',{g:g});E('ellipse',{cx:61.5,cy:47.5,rx:4.5,ry:3.2,fill:'#c55a11'},g);E('ellipse',{cx:51,cy:42,rx:2.6,ry:5,fill:'#843c0c',transform:'rotate(20 51 42)'},g);
    ci(57,43,1.2,'#1f1f1f',{g:g});ci(65.5,46.5,1.4,'#1f1f1f',{g:g});ci(76,64,5,'#c00000',{g:g});rc(6,10,84,70,'none',{s:'#7f7f7f'});
    ar(94,45,106,45);['“A dog playing','with a red ball','on the grass.”'].forEach((s,i)=>tx(110,30+16*i,s,{a:'start',i:1}))}
  else if(k==='yolo'){const g=frame(2,4,196,102);rc(2,4,196,102,'#eef3fa',{g:g});rc(2,84,196,22,'#d0d0d0',{g:g});E('line',{x1:2,x2:198,y1:95,y2:95,stroke:'#fff','stroke-width':2,'stroke-dasharray':'10 8'},g);
    ci(41,42,6,'#595959',{g:g});rc(35.5,49,11,21,'#ed7d31',{rx:3,g:g});pa('M38,70 L36,86 M44,70 L46,86','none','#595959',3,g);
    rc(96,63,60,18,'#5b9bd5',{rx:5,g:g});pa('M106,64 L114,51 H138 L147,64 Z','#5b9bd5',null,1,g);rc(116,54,9,9,'#dae3f3',{g:g});rc(128,54,9,9,'#dae3f3',{g:g});ci(110,82,6,'#404040',{g:g});ci(142,82,6,'#404040',{g:g});
    E('line',{x1:176,x2:176,y1:50,y2:86,stroke:'#7f7f7f','stroke-width':3},g);rc(170,24,12,27,'#404040',{rx:2,g:g});ci(176,30,3,'#c00000',{g:g});ci(176,37.5,3,'#7f7f7f',{g:g});ci(176,45,3,'#7f7f7f',{g:g});
    rc(2,4,196,102,'none',{s:'#7f7f7f'});
    const bb=(x,y,w,h,c,lab,right)=>{rc(x,y,w,h,'none',{s:c,sw:2});const tw=lab.length*5.4+8,lx=right?x+w-tw:x;rc(lx,y-13,tw,13,c);tx(lx+tw/2,y-3,lab,{fs:10,c:'#fff',b:1})};
    bb(28,33,26,56,'#c00000','person 0.91');bb(92,46,68,42,'#548235','car 0.94');bb(166,21,20,33,'#7030a0','light 0.88',true)}
  else if(k==='diffusion'){tx(100,13,'“a rocket in space”',{i:1});const R=rng(5);
    const rocket=(x,y,g)=>{rc(x,y,52,52,'#1f3864',{g:g});[[8,9],[40,6],[45,30],[6,38],[20,46],[33,20]].forEach(([a,b])=>ci(x+a,y+b,0.9,'#fff',{g:g}));const cx=x+26,cy=y+24;
      pa('M'+(cx-5)+','+(cy+4)+' L'+(cx-10)+','+(cy+14)+' L'+(cx-5)+','+(cy+12)+' Z M'+(cx+5)+','+(cy+4)+' L'+(cx+10)+','+(cy+14)+' L'+(cx+5)+','+(cy+12)+' Z','#c00000',null,1,g);
      pa('M'+(cx-3.5)+','+(cy+12)+' L'+cx+','+(cy+22)+' L'+(cx+3.5)+','+(cy+12)+' Z','#ffc000',null,1,g);
      pa('M'+cx+','+(cy-16)+' C'+(cx+7)+','+(cy-8)+' '+(cx+7)+','+(cy+6)+' '+(cx+5)+','+(cy+12)+' L'+(cx-5)+','+(cy+12)+' C'+(cx-7)+','+(cy+6)+' '+(cx-7)+','+(cy-8)+' '+cx+','+(cy-16)+' Z','#f2f2f2',null,1,g);
      ci(cx,cy-3,3,'#5b9bd5',{s:'#404040',g:g})};
    const noise=(x,y,op,g)=>{const n=12,c=52/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const v=[R(),R(),R()].map(t=>Math.round(30+210*t));rc(x+i*c,y+j*c,c+0.3,c+0.3,'rgb('+v.join(',')+')',{g:g}).setAttribute('opacity',op)}};
    [8,74,140].forEach((x,i)=>{const g=frame(x,22,52,52);if(i)rocket(x,22,g);if(i<2)noise(x,22,i?0.55:1,g);rc(x,22,52,52,'none',{s:'#7f7f7f'})});
    ar(62,48,72,48);ar(128,48,138,48);tx(34,88,'pure noise',{fs:11,c:'#6b6b6b'});tx(100,88,'less noise',{fs:11,c:'#6b6b6b'});tx(166,88,'the picture',{fs:11,c:'#6b6b6b'});
    tx(100,105,'denoised step by step',{fs:11,c:'#ed7d31',b:1})}
  else if(k==='rag'){rc(4,4,112,22,'#4472c4',{rx:10});tx(60,19,'Our refund policy?',{c:'#fff'});
    ci(140,15,8,'none',{s:'#404040',sw:2.2});pa('M146,21 L153,28','none','#404040',3);tx(160,19,'search',{a:'start',fs:10.5,c:'#6b6b6b'});
    const doc=(x,y,hi)=>{pa('M'+x+','+y+' h17 l7,7 v25 h-24 Z',hi?'#fff2cc':'#fff',hi?'#bf9000':'#8c8c8c',hi?2:1);[0,1,2,3].forEach(i=>rc(x+4,y+11+i*5,i===3?10:16,2,hi?'#bf9000':'#d0d0d0'))};
    [10,40,70,100,130].forEach((x,i)=>doc(x,34,i===2));tx(82,78,'doc 3',{fs:10.5,c:'#7f6000',b:1});
    ar(100,71,112,84);rc(64,85,132,22,'#f2f2f2',{s:'#d0d0d0',rx:10});tx(130,100,'Within 30 days [doc 3]',{fs:11.5})}};
/* a layer of K neurons + softmax = softmax regression.
   data-later: only the layer and its K scores at first; the softmax block, the probabilities and the caption are one .step */
FIG['softmax-layer']=root=>{const later=root.hasAttribute('data-later');const svg=initSvg(svgOf(root),600,300);
  const pos=drawNet(svg,[3,3],{x0:60,y0:40,w:200,h:220,r:18,label:(l,i)=>l===0?'x'+['₁','₂','₃'][i]:'z'+['₁','₂','₃'][i],fill:l=>l===0?'#70ad47':'#4472c4'});
  T(svg,60,28,'inputs','lab');T(svg,260,28,later?'K = 3 neurons: 3 scores':'K = 3 neurons','lab');
  const G=later?E('g',{class:'step'},svg):svg;
  E('rect',{x:320,y:40,width:56,height:220,rx:8,fill:'#fff2cc',stroke:'#bf9000'},G);const st=T(G,348,155,'softmax','lab');st.setAttribute('transform','rotate(-90 348 150)');
  const pr=[0.70,0.20,0.10],nm=['cat','dog','car'];
  pos[1].forEach((p,k)=>{arrowPx(G,p[0]+19,p[1],318,p[1],'ln thin sk','fk');arrowPx(G,378,p[1],402,p[1],'ln thin sk','fk');E('rect',{x:406,y:p[1]-12,width:110*pr[k],height:24,fill:'#ed7d31'},G);
    T(G,406+110*pr[k]+6,p[1]+5,'P('+nm[k]+') = '+pr[k].toFixed(2),'','start')});
  T(G,300,292,'each neuron scores one class; softmax turns the K scores into probabilities that sum to 1','','middle')};
/* hand-made features: the circle becomes a line in (x1², x2²) */
FIG['feat-map']=root=>{const svg=initSvg(svgOf(root),640,300);const r=rng(21);const pts=[];for(let i=0;i<150;i++){const a=2*r()-1,b=2*r()-1;pts.push([a,b,a*a+b*b<0.42?1:0])}
  const A=Plot(svg,{at:[0,0],w:280,h:290,x:[-1.05,1.05],y:[-1.05,1.05],m:{l:34,r:8,t:30,b:34}});A.axes({xt:[-1,0,1],yt:[-1,0,1],grid:false,xl:'x₁',yl:'x₂'});T(A.root,157,18,'original features: no line works','lab');
  A.path([...Array(121).keys()].map(k=>{const t=2*Math.PI*k/120;return [Math.sqrt(0.42)*Math.cos(t),Math.sqrt(0.42)*Math.sin(t)]}),'ln thin sm dash');
  pts.forEach(p=>A.dot(p[0],p[1],4,'pt '+(p[2]?'fb':'fo')));
  arrowPx(svg,292,140,344,140,'ln sk','fk');T(svg,314,126,'square','','middle');T(svg,314,166,'each input','','middle');
  const B=Plot(svg,{at:[350,0],w:290,h:290,x:[-0.03,1.05],y:[-0.03,1.05],m:{l:44,r:8,t:30,b:34}});B.axes({xt:[0,0.5,1],yt:[0,0.5,1],grid:false,xl:'z₁ = x₁²',yl:'z₂ = x₂²'});T(B.root,167,18,'new features: a straight line works','lab');
  B.poly([[0,0],[0.42,0],[0,0.42]],'fbs');B.line(0.45,-0.03,-0.03,0.45,'ln sb');pts.forEach(p=>B.dot(p[0]*p[0],p[1]*p[1],4,'pt '+(p[2]?'fb':'fo')));B.text(0.4,0.12,'z₁ + z₂ = 0.42','', 'start',8,0).style.fill='#4472c4'};
/* XOR with a hand-built 2-2-1 network of step units */
FIG['xor-net']=root=>{const svg=svgOf(root);const rows=[[0,0],[0,1],[1,0],[1,1]];const step=z=>z>0?1:0;
  const F=x=>{const z1=x[0]+x[1]-0.5,z2=x[0]+x[1]-1.5;const h1=step(z1),h2=step(z2);const zo=h1-h2-0.5;return {z1,z2,h1,h2,zo,y:step(zo)}};
  stepper(root,s=>{initSvg(svg,620,320);const cur=s>=1?rows[s-1]:null;const Fv=cur?F(cur):null;
    const pos=drawNet(svg,[2,2,1],{x0:50,y0:78,w:270,h:170,r:24,titles:['input','hidden (step)','output'],label:(l,i)=>l===0?'x'+['₁','₂'][i]:l===1?'h'+['₁','₂'][i]:'ŷ'});
    const wl=(a,b,t,k)=>{const x=a[0]+(b[0]-a[0])*k,y=a[1]+(b[1]-a[1])*k;E('rect',{x:x-17,y:y-11,width:34,height:20,fill:'#fff',stroke:'#9dafd6'},svg);T(svg,x,y+4,t,'')};
    wl(pos[0][0],pos[1][0],'1',0.34);wl(pos[0][0],pos[1][1],'1',0.22);wl(pos[0][1],pos[1][0],'1',0.22);wl(pos[0][1],pos[1][1],'1',0.34);wl(pos[1][0],pos[2][0],'+1',0.5);wl(pos[1][1],pos[2][0],'−1',0.5);
    T(svg,pos[1][0][0],pos[1][0][1]-34,'b = −0.5  (OR)','','middle');T(svg,pos[1][1][0],pos[1][1][1]+44,'b = −1.5  (AND)','','middle');T(svg,pos[2][0][0],pos[2][0][1]+44,'b = −0.5','','middle');
    const badge=(p,v,left)=>{const cx=p[0]+(left?-38:24),cy=p[1]-(left?0:22);E('circle',{cx:cx,cy:cy,r:12,fill:v?'#ffc000':'#fff',stroke:'#404040'},svg);T(svg,cx,cy+5,String(v),'lab')};
    if(cur){badge(pos[0][0],cur[0],1);badge(pos[0][1],cur[1],1);badge(pos[1][0],Fv.h1);badge(pos[1][1],Fv.h2);badge(pos[2][0],Fv.y)}
    const x0=452,y0=70,cw=32;['x₁','x₂','h₁','h₂','ŷ'].forEach((c,k)=>{E('rect',{x:x0+k*cw,y:y0,width:cw,height:26,fill:k<2?'#e2f0d9':k<4?'#dae3f3':'#fbe5d6',stroke:'#7f7f7f'},svg);T(svg,x0+k*cw+cw/2,y0+18,c,'lab')});
    rows.forEach((rw,i)=>{const on=s>=1&&i===s-1,done=s>=1&&i<s;const Fr=F(rw);[rw[0],rw[1],Fr.h1,Fr.h2,Fr.y].forEach((v,k)=>{E('rect',{x:x0+k*cw,y:y0+26+i*28,width:cw,height:28,fill:on?'#fff2cc':'#fff',stroke:'#bfbfbf'},svg);if(k<2||done)T(svg,x0+k*cw+cw/2,y0+26+i*28+19,String(v),k===4?'lab':'')})});
    T(svg,x0+80,y0+26+4*28+24,s===4?'ŷ = XOR(x₁, x₂)  ✓':'truth table','lab','middle');
    const sg=v=>(v<0?'−':'')+fmt(Math.abs(v),1);
    const cap=s===0?'step(z) = 1 if z > 0, else 0 (a sigmoid with very large weights)':'h₁: '+cur[0]+' + '+cur[1]+' − 0.5 = '+sg(Fv.z1)+' → '+Fv.h1+'   ·   h₂: '+cur[0]+' + '+cur[1]+' − 1.5 = '+sg(Fv.z2)+' → '+Fv.h2+'   ·   ŷ: '+Fv.h1+' − '+Fv.h2+' − 0.5 = '+sg(Fv.zo)+' → '+Fv.y;
    const ct=T(svg,310,306,cap,'lab','middle');ct.setAttribute('xml:space','preserve');ct.style.whiteSpace='pre'})};
/* one neuron with numbers, stepped */
FIG['neuron-num']=root=>{const svg=svgOf(root);const X=[2,-1,0.5],W=[0.4,-0.3,1.0],b=0.1;const P=X.map((v,i)=>v*W[i]);const z=P.reduce((s,v)=>s+v,0)+b;const a=sig(z);
  stepper(root,s=>{initSvg(svg,600,300);const ys=[60,150,240];
    ys.forEach((y,i)=>{E('circle',{cx:50,cy:y,r:20,fill:'#70ad47',stroke:'#404040'},svg);T(svg,50,y+5,'x'+['₁','₂','₃'][i],'lab').style.fill='#fff';T(svg,50,y-28,String(X[i]),'lab');
      arrowPx(svg,72,y,262,150,'ln thin sm','fm');const wx=125+0.4*(0),wy=y+(150-y)*0.32;E('rect',{x:wx-22,y:wy-13,width:44,height:24,fill:'#dae3f3',stroke:'#4472c4'},svg);T(svg,wx,wy+4,String(W[i]),'');
      if(s>=1){const px=205,py=y+(150-y)*0.62;E('rect',{x:px-26,y:py-13,width:52,height:24,fill:'#fff2cc',stroke:'#bf9000'},svg);T(svg,px,py+4,f2(P[i]),'')}});
    T(svg,50,278,'inputs','');T(svg,125,278,'weights','');if(s>=1)T(svg,205,278,'products','');
    E('circle',{cx:290,cy:150,r:30,fill:s>=2?'#ffc000':'#fff',stroke:'#404040','stroke-width':1.5},svg);T(svg,290,158,'Σ','lab big');T(svg,290,200,'+ b = '+b,'');
    if(s>=2){T(svg,290,225,'z = '+f2(z),'lab')}
    arrowPx(svg,322,150,372,150,'ln thin sk','fk');E('rect',{x:374,y:120,width:80,height:60,rx:6,fill:s>=3?'#4472c4':'#9dafd6'},svg);T(svg,414,156,'σ(z)','lab').style.fill='#fff';
    arrowPx(svg,456,150,512,150,'ln thin sk','fk');T(svg,545,156,s>=3?f3(a):'ŷ','lab big');if(s>=3)T(svg,545,182,'= ŷ','');
    T(svg,390,298,s===0?'x = (2, −1, 0.5), w = (0.4, −0.3, 1.0), b = 0.1':s===1?'multiply each input by its weight':s===2?'add everything up (plus the bias)':'squash into (0, 1) with the sigmoid','','middle')})};
FIG['mlp']=root=>{const svg=initSvg(svgOf(root),520,330);drawNet(svg,[3,4,1],{x0:60,y0:40,w:380,h:260,r:16,titles:['Input layer','Hidden layer','Output layer'],label:(l,i)=>l===0?'x'+(i+1):l===1?'a'+(i+1):'ŷ'});
  T(svg,150,320,'W⁽¹⁾ ∈ ℝ³ˣ⁴, b⁽¹⁾ ∈ ℝ⁴','');T(svg,380,320,'W⁽²⁾ ∈ ℝ⁴ˣ¹, b⁽²⁾ ∈ ℝ','')};
/* the same 3-4-1 network turned into its weight matrices, one hidden unit per step (slider data-k="s"):
   0 the network · 1–4 hidden unit j: its three edges, column j of W⁽¹⁾ and b_j · 5 layer 1 as one product: z = xW⁽¹⁾ + b⁽¹⁾, a = σ(z)
   · 6 the output unit: W⁽²⁾ (4 × 1) and b⁽²⁾. Each hidden unit keeps one colour (the .u1–.u4 classes of the formulas);
   elements of the slide with data-cur="k" get the class "now" at step k */
const UNIT=['#4472c4','#c00000','#7030a0','#bf9000'],UNIT_SOFT=['#dae3f3','#f8d7d7','#e7dcf0','#fff2cc'];
FIG['mlp-build']=root=>{const svg=svgOf(root);const slide=root.closest('.slide')||root;const sub=['₁','₂','₃','₄'];
  stepper(root,s=>{initSvg(svg,660,370);svg.setAttribute('viewBox','0 44 660 326');slide.querySelectorAll('[data-cur]').forEach(e=>e.classList.toggle('now',+e.dataset.cur===s));
    const built=j=>s>j,cur=j=>s===j+1;
    const pos=drawNet(svg,[3,4,1],{x0:40,y0:72,w:230,h:280,r:17,titles:['inputs x','hidden layer','output'],label:(l,i)=>l===0?'x'+sub[i]:l===1?'a'+sub[i]:'ŷ',
      fill:(l,i)=>l===0?'#70ad47':l===1?(built(i)?UNIT[i]:'#a6a6a6'):(s>=6?'#ed7d31':'#a6a6a6'),
      edgeStyle:(l,i,j)=>l===0?(built(j)?{stroke:UNIT[j],width:cur(j)?3:1.6}:{stroke:'#d9d9d9',width:1}):(s>=6?{stroke:'#ed7d31',width:2.4}:{stroke:'#d9d9d9',width:1})});
    /* weight labels on the edges of the current unit (or of the output unit) */
    const wl=(a,b,f,t,c)=>{const x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f;E('rect',{x:x-19,y:y-11,width:38,height:20,rx:3,fill:'#fff',stroke:c},svg);TT(svg,x,y+4,t,'').style.fill=c};
    for(let j=0;j<4;j++)if(cur(j))for(let i=0;i<3;i++)wl(pos[0][i],pos[1][j],0.42,'w_{'+(i+1)+(j+1)+'}',UNIT[j]);
    if(s>=6)for(let j=0;j<4;j++)wl(pos[1][j],pos[2][0],0.5,'w^{[2]}_'+(j+1),'#c55a11');
    /* W⁽¹⁾: one row per input, one column per hidden unit; then b⁽¹⁾, z = xW⁽¹⁾ + b⁽¹⁾ and a = σ(z) */
    const GX=352,GY=104,CW=50,CH=30,cx=j=>GX+CW*j+CW/2;
    TT(svg,GX+2*CW,64,'W^{[1]}  (3 × 4)','lab');
    const cell=(x,y,w,t,fill,tc,o)=>{o=o||{};E('rect',{x:x,y:y,width:w,height:CH,fill:fill||'#fff',stroke:o.stroke||'#d9d9d9','stroke-width':o.sw||1},svg);if(t)TT(svg,x+w/2,y+CH/2+5,t,'').style.fill=tc||'#1f1f1f'};
    const tag=(x,y,t,fill)=>{E('circle',{cx:x,cy:y,r:10,fill:fill,stroke:'#fff','stroke-width':1.5},svg);const tt=T(svg,x,y+4.5,t,'');tt.style.fill='#fff';tt.style.fontSize='12px'};
    for(let j=0;j<4;j++)tag(cx(j),88,'a'+sub[j],built(j)?UNIT[j]:'#a6a6a6');
    for(let i=0;i<3;i++)tag(GX-18,GY+CH*i+CH/2,'x'+sub[i],'#70ad47');
    for(let i=0;i<3;i++)for(let j=0;j<4;j++)cell(GX+CW*j,GY+CH*i,CW,built(j)?'w_{'+(i+1)+(j+1)+'}':'',built(j)?UNIT_SOFT[j]:'#fff',UNIT[j]);
    TT(svg,GX-18,GY+3*CH+8+CH/2+5,'b^{[1]}','lab');for(let j=0;j<4;j++)cell(GX+CW*j,GY+3*CH+8,CW,built(j)?'b_'+(j+1):'',built(j)?UNIT_SOFT[j]:'#fff',UNIT[j]);
    for(let j=0;j<4;j++)if(cur(j))E('rect',{x:GX+CW*j,y:GY,width:CW,height:3*CH+8+CH,fill:'none',stroke:UNIT[j],'stroke-width':2.5},svg);
    if(s>=5){const yb=GY+4*CH+8;T(svg,GX-18,yb+19,'Σ','lab');for(let j=0;j<4;j++)arrowPx(svg,cx(j),yb+2,cx(j),yb+20,'ln thin sk','fk');
      T(svg,GX-18,yb+22+CH/2+5,'z','lab');for(let j=0;j<4;j++)cell(GX+CW*j,yb+22,CW,'z_'+(j+1),'#fff','#1f1f1f');
      T(svg,GX-18,yb+22+CH+19,'σ','lab');for(let j=0;j<4;j++)arrowPx(svg,cx(j),yb+22+CH+2,cx(j),yb+22+CH+20,'ln thin sk','fk');
      T(svg,GX-18,yb+44+CH+CH/2+5,'a','lab');for(let j=0;j<4;j++)cell(GX+CW*j,yb+44+CH,CW,'a_'+(j+1),UNIT[j],'#fff',{stroke:'#fff'})}
    /* W⁽²⁾: one row per hidden unit, one column for the output; then b⁽²⁾ and ŷ */
    const HX=592,HW=46;TT(svg,HX+HW/2,64,'W^{[2]} (4 × 1)','lab');tag(HX+HW/2,88,'ŷ',s>=6?'#ed7d31':'#a6a6a6');
    for(let j=0;j<4;j++){tag(HX-14,GY+CH*j+CH/2,'a'+sub[j],built(j)?UNIT[j]:'#a6a6a6');cell(HX,GY+CH*j,HW,s>=6?'w^{[2]}_'+(j+1):'',s>=6?'#fbe5d6':'#fff','#c55a11')}
    TT(svg,HX-14,GY+4*CH+12+CH/2+5,'b^{[2]}','','middle');cell(HX,GY+4*CH+12,HW,s>=6?'b^{[2]}':'',s>=6?'#fbe5d6':'#fff','#c55a11');
    if(s>=6){E('rect',{x:HX,y:GY,width:HW,height:5*CH+12,fill:'none',stroke:'#ed7d31','stroke-width':2.5},svg);arrowPx(svg,HX+HW/2,GY+5*CH+14,HX+HW/2,GY+6*CH+28,'ln thin sk','fk');
      E('circle',{cx:HX+HW/2,cy:GY+6*CH+46,r:16,fill:'#ed7d31'},svg);const t=T(svg,HX+HW/2,GY+6*CH+51,'ŷ','lab');t.style.fill='#fff'}})};
FIG['fwd-num']=root=>{const svg=svgOf(root);const F=tinyForward(NET);stepper(root,s=>{initSvg(svg,600,320);drawTiny(svg,NET,F,s,{hiEdge:s===1?1:s===3?2:0})})};
/* shapes: X (m×n) · W (n×h) + b = Z (m×h) */
FIG['shapes']=root=>{const svg=initSvg(svgOf(root),620,260);const blk=(x,y,w,h,c,t,rows,cols)=>{E('rect',{x:x,y:y,width:w,height:h,fill:c,stroke:'#404040'},svg);T(svg,x+w/2,y+h/2+6,t,'lab big');T(svg,x+w/2,y+h+18,cols,'');const r=T(svg,x-8,y+h/2+4,rows,'','end')};
  blk(30,60,120,150,'#e2f0d9','X',  'm','n');T(svg,175,140,'·','lab big');blk(200,90,90,90,'#dae3f3','W','n','h');T(svg,315,140,'+','lab big');blk(340,90,90,22,'#fff2cc','b','1','h');T(svg,455,140,'=','lab big');blk(490,60,90,150,'#fbe5d6','Z','m','h');
  T(svg,90,40,'m examples × n features','');T(svg,245,70,'weights','');T(svg,385,70,'bias (added to every row)','');T(svg,535,40,'m × h pre-activations','');
  T(svg,310,245,'Row i of Z is example i after the layer. The batch dimension m passes straight through.','','middle')};
/* what the hidden units learned on the circle data */
function circleData(seed,n){const r=rng(seed);const X=[],y=[];for(let i=0;i<n;i++){const a=2*r()-1,b=2*r()-1;let c=a*a+b*b<0.42?1:0;if(r()<0.04)c=1-c;X.push([a,b]);y.push(c)}return {X,y}}
FIG['hidden-feats']=root=>{const {X,y}=circleData(3,200);const mdl=trainMLP(X,y,[4],'tanh',500,0.03,7);const svg=initSvg(svgOf(root),960,300);const N=26;
  const panel=(x0,title,fn,cls)=>{const P=Plot(svg,{at:[x0,0],w:180,h:210,x:[-1,1],y:[-1,1],m:{l:6,r:6,t:26,b:6}});P.axes({grid:false});T(P.root,90,16,title,'lab');
    for(let a=0;a<N;a++)for(let b=0;b<N;b++){const xx=[-1+2*(a+0.5)/N,-1+2*(b+0.5)/N];const v=fn(xx);const rc=P.rect(-1+2*a/N,-1+2*b/N,-1+2*(a+1)/N,-1+2*(b+1)/N,'');rc.setAttribute('fill',heat(v,cls==='mono'));rc.setAttribute('stroke','none')}
    X.forEach((x,i)=>{const d=P.dot(x[0],x[1],2.2,y[i]?'fk':'fw');d.setAttribute('stroke',y[i]?'#fff':'#404040');d.setAttribute('stroke-width','0.7')});return P};
  for(let j=0;j<4;j++)panel(j*190,'hidden unit a'+(j+1),x=>mdl.forward(x)[1][j]);panel(780,'output ŷ = σ(Σ w a + b)',x=>mdl.forward(x)[2][0],'mono');
  const wv=mdl.W[1].map(r=>r[0]);T(svg,380,240,'Each hidden unit is a soft half-plane (a tilted sigmoid / tanh in x₁, x₂). The output layer adds them with weights','','middle');
  T(svg,380,262,'w = ('+wv.map(v=>f2(v)).join(', ')+') and b = '+f2(mdl.B[1][0])+': four "walls" combine into a closed region. That is what "learned features" means.','','middle');
  T(svg,380,290,'hidden units (tanh): orange = +1, blue = −1 · output: dark blue = high probability · dots: black = inside (class 1), white = outside','','middle')};
FIG['loss-shapes']=root=>{const svg=initSvg(svgOf(root),620,270);
  const P=Plot(svg,{at:[0,0],w:310,h:270,x:[0,1],y:[0,5],m:{l:40,r:10,t:26,b:36}});P.axes({xt:[0,0.5,1],yt:[0,2,4],xl:'predicted probability ŷ',yl:'loss'});T(P.root,170,16,'Binary cross-entropy','lab');
  P.fn(p=>Math.min(5,-Math.log(p)),'ln sb',0.005,1,300);P.fn(p=>Math.min(5,-Math.log(1-p)),'ln so',0,0.995,300);P.text(0.28,4.6,'— y = 1: −log ŷ','', 'start').style.fill='#4472c4';P.text(0.28,4.15,'— y = 0: −log(1 − ŷ)','', 'start').style.fill='#ed7d31';
  P.dot(0.9,-Math.log(0.9),4,'fb');P.text(0.9,-Math.log(0.9),'right: 0.1','', 'end',-6,-8);P.dot(0.1,-Math.log(0.1),4,'fb');P.text(0.1,-Math.log(0.1),'confident & wrong: 2.3','', 'start',8,0);
  const Q=Plot(svg,{at:[320,0],w:300,h:270,x:[-3,3],y:[0,5],m:{l:40,r:10,t:26,b:36}});Q.axes({xt:[-2,0,2],yt:[0,2,4],xl:'error ŷ − y',yl:'loss'});T(Q.root,160,16,'Mean squared error (regression)','lab');
  Q.fn(e=>Math.min(5,0.5*e*e),'ln sb',-3,3,200);Q.fn(e=>Math.min(5,Math.abs(e)),'ln so dash',-3,3,200);Q.text(-1.3,4.6,'— ½ e² (MSE)','', 'start').style.fill='#4472c4';Q.text(-1.3,4.15,'- - |e| (L1)','', 'start').style.fill='#ed7d31'};
const ACTS={sigmoid:[z=>1/(1+Math.exp(-z)),z=>{const s=1/(1+Math.exp(-z));return s*(1-s)},"σ′(z) = σ(z)(1 − σ(z)) ≤ 1/4"],tanh:[z=>Math.tanh(z),z=>1-Math.tanh(z)**2,"tanh′(z) = 1 − tanh²(z) ≤ 1"],
  relu:[z=>Math.max(0,z),z=>z>0?1:0,"ReLU′(z) = 0 if z < 0, 1 if z > 0"],leaky:[z=>z>0?z:0.2*z,z=>z>0?1:0.2,"LeakyReLU′(z) = 0.2 if z < 0, 1 if z > 0"],gelu:[z=>0.5*z*(1+Math.tanh(0.7978845608*(z+0.044715*z*z*z))),z=>{const h=1e-4;const g=v=>0.5*v*(1+Math.tanh(0.7978845608*(v+0.044715*v*v*v)));return (g(z+h)-g(z-h))/(2*h)},"GELU: a smooth ReLU (transformers)"],linear:[z=>z,z=>1,"g′(z) = 1"]};
FIG['act']=root=>{const P=Plot(svgOf(root),{w:540,h:340,x:[-5,5],y:[-1.5,3],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[-4,-2,0,2,4],yt:[-1,0,1,2,3],xl:'z',yl:''});P.line(-5,0,5,0,'ax',P.bg);P.line(0,-1.5,0,3,'ax',P.bg);
  let k='sigmoid';const btns=root.querySelectorAll('.seg button');function draw(){P.clear();const a=ACTS[k];P.fn(a[0],'ln sb',-5,5,400);P.fn(a[1],'ln sr dash',-5,5,400);setR(root,'d',a[2])}
  btns.forEach(b=>b.addEventListener('click',()=>{k=b.dataset.a;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));draw()};
FIG['xor']=root=>{const svg=initSvg(svgOf(root),620,300);const pts=[[0,0,0],[1,1,0],[0,1,1],[1,0,1]];
  const A=Plot(svg,{at:[0,0],w:290,h:300,x:[-0.4,1.4],y:[-0.4,1.4],m:{l:30,r:10,t:30,b:30}});A.axes({xt:[0,1],yt:[0,1],xl:'x₁',yl:'x₂'});T(A.root,150,18,'No single line separates XOR','lab');
  A.line(-0.4,1.2,1.4,-0.2,'ln thin sm dash');A.line(-0.4,0.3,1.4,1.1,'ln thin sm dash');pts.forEach(p=>A.dot(p[0],p[1],10,p[2]?'fb pt':'fo pt'));
  const B=Plot(svg,{at:[320,0],w:300,h:300,x:[-0.4,1.4],y:[-0.4,1.4],m:{l:30,r:10,t:30,b:30}});B.axes({xt:[0,1],yt:[0,1],xl:'x₁',yl:'x₂'});T(B.root,155,18,'Two hidden units: two lines','lab');
  B.poly([[-0.4,0.9],[0.9,-0.4],[1.4,-0.4],[1.4,0.1],[0.1,1.4],[-0.4,1.4]],'fbs');B.line(-0.4,0.9,0.9,-0.4,'ln sb');B.line(0.1,1.4,1.4,0.1,'ln sb');pts.forEach(p=>B.dot(p[0],p[1],10,p[2]?'fb pt':'fo pt'));
  B.text(0.5,0.5,'h₁ AND NOT h₂','lab','middle',0,4)};
FIG['playground']=root=>{const {X,y}=circleData(3,200);const P=Plot(svgOf(root),{w:430,h:430,x:[-1,1],y:[-1,1],m:{l:10,r:10,t:10,b:10}});let act='tanh';const iu=q(root,'u'),il=q(root,'l');const btns=root.querySelectorAll('.seg button');const cache={};
  function draw(){const u=+iu.value,L=+il.value;setV(root,'u',u);setV(root,'l',L);const key=act+u+'-'+L;const hidden=u===0?[]:[...Array(L)].map(()=>u);
    if(!cache[key])cache[key]=trainMLP(X,y,hidden,act,u===0?300:800,L>1?0.02:0.03,7);const mdl=cache[key];P.clear();const N=34;
    for(let a=0;a<N;a++)for(let b=0;b<N;b++){const x=[-1+2*(a+0.5)/N,-1+2*(b+0.5)/N];const p=mdl.predict(x);const rc=P.rect(-1+2*a/N,-1+2*b/N,-1+2*(a+1)/N,-1+2*(b+1)/N,p>=0.5?'fb':'fo');rc.setAttribute('opacity',(0.08+0.45*Math.abs(p-0.5)*2).toFixed(2))}
    X.forEach((x,i)=>P.dot(x[0],x[1],3.4,'pt '+(y[i]?'fb':'fo')));const acc=X.filter((x,i)=>(mdl.predict(x)>=0.5?1:0)===y[i]).length/X.length;
    setR(root,'acc',fmt(acc,3));setR(root,'loss',fmt(mdl.losses[mdl.losses.length-1],3));
    let np=0;const s=[2].concat(hidden,[1]);for(let i=0;i<s.length-1;i++)np+=s[i]*s[i+1]+s[i+1];setR(root,'np',np);setR(root,'what',u===0?'logistic regression':(act==='linear'?'still a linear model':'a neural network'))}
  btns.forEach(b=>b.addEventListener('click',()=>{act=b.dataset.a;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));iu.addEventListener('change',draw);il.addEventListener('change',draw);iu.addEventListener('input',()=>{setV(root,'u',iu.value);draw()});il.addEventListener('input',()=>{setV(root,'l',il.value);draw()});draw()};
FIG['pipeline']=root=>{const svg=initSvg(svgOf(root),600,260);const bx=(x,y,w,t,c)=>box(svg,x,y,w,54,t,c,{stroke:c,tcol:'#fff',lh:18})
  T(svg,300,22,'Traditional machine learning','lab big');bx(10,38,80,'Input','#7f7f7f');bx(120,38,170,'Feature extraction\n(designed by hand)','#ed7d31');bx(320,38,140,'Classifier\n(learned)','#4472c4');bx(490,38,100,'Output','#7f7f7f');
  [[90,65,118],[290,65,318],[460,65,488]].forEach(a=>arrowPx(svg,a[0],a[1],a[2],a[1],'ln thin sk','fk'));
  T(svg,300,152,'Deep learning','lab big');bx(10,168,80,'Input','#7f7f7f');bx(120,168,340,'Feature extraction + classification\n(learned together, end to end)','#4472c4');bx(490,168,100,'Output','#7f7f7f');
  [[90,195,118],[460,195,488]].forEach(a=>arrowPx(svg,a[0],a[1],a[2],a[1],'ln thin sk','fk'))};
FIG['workflow']=root=>{const svg=initSvg(svgOf(root),460,330);const bx=(x,y,w,h,t,c,tc)=>{E('rect',{x:x,y:y,width:w,height:h,rx:8,fill:c,stroke:'#404040'},svg);T(svg,x+w/2,y+h/2+5,t,'lab').style.fill=tc||'#000'};
  T(svg,230,16,'Input X','');bx(140,26,180,42,'Layer (weights)','#ffe699');bx(140,88,180,42,'Layer (weights)','#ffe699');bx(140,150,180,36,'Predictions Ŷ','#fff');bx(330,150,110,36,'True targets Y','#fff');
  bx(250,220,150,40,'Loss function','#8ea9db');bx(20,220,150,40,'Optimizer','#f4b183');bx(275,286,100,30,'Loss score','#fff');
  arrowPx(svg,230,68,230,86,'ln thin sk','fk');arrowPx(svg,230,130,230,148,'ln thin sk','fk');arrowPx(svg,230,186,300,218,'ln thin sk','fk');arrowPx(svg,385,186,340,218,'ln thin sk','fk');arrowPx(svg,325,260,325,284,'ln thin sk','fk');
  arrowPx(svg,275,300,120,262,'ln thin sk','fk');arrowPx(svg,80,218,138,110,'ln thin sk','fk');T(svg,70,160,'weight update','')};
FIG['softmax-demo']=root=>{const svg=initSvg(svgOf(root),560,230);const z=[1.3,5.1,2.2,0.7,1.1];const e=z.map(Math.exp);const s=e.reduce((a,b)=>a+b,0);const names=['cat','dog','car','tree','boat'];
  z.forEach((v,i)=>{T(svg,22,41+i*40,names[i],'','end');E('rect',{x:30,y:20+i*40,width:70,height:32,fill:'#dae3f3',stroke:'#4472c4'},svg);T(svg,65,41+i*40,v.toFixed(1),'lab');const p=e[i]/s;E('rect',{x:420,y:20+i*40,width:Math.max(3,120*p),height:32,fill:'#ed7d31'},svg);T(svg,415,41+i*40,p.toFixed(2),'lab','end')});
  arrowPx(svg,105,110,165,110,'ln sk','fk');E('rect',{x:170,y:70,width:180,height:80,rx:6,fill:'#fff',stroke:'#404040'},svg);T(svg,260,103,'softmax','lab big');TT(svg,260,132,'exp(z_k) / Σ_j exp(z_j)','lab');arrowPx(svg,352,110,378,110,'ln sk','fk');
  T(svg,65,14,'scores z (logits)','');T(svg,480,14,'probabilities (sum = 1)','')};
FIG['nonconvex']=root=>{const P=Plot(svgOf(root),{w:460,h:280,x:[-3,3],y:[-1.4,2.2],m:{l:30,r:14,t:14,b:36}});P.axes({grid:false,xl:root.hasAttribute('data-w')?'a parameter w':'a parameter θ',yl:'loss'});
  const f=x=>0.12*x**4-0.55*x*x+0.25*x+0.2*Math.sin(3*x);P.fn(f,'ln sb',-3,3,300);let mins=[];for(let i=1;i<299;i++){const a=-3+6*(i-1)/300,b=-3+6*i/300,c=-3+6*(i+1)/300;if(f(b)<f(a)&&f(b)<f(c))mins.push(b)}
  mins.sort((a,b)=>f(a)-f(b));mins.forEach((x,k)=>{P.dot(x,f(x),5,k?'fo':'fr');P.text(x,f(x),k?'local minimum':'global minimum','', 'middle',0,20)})};
FIG['ua']=root=>{const f=x=>Math.sin(2*Math.PI*x)+0.5*x;const P=Plot(svgOf(root),{w:540,h:330,x:[0,1],y:[-1.3,1.8],m:{l:40,r:14,t:14,b:36}});P.axes({xt:[0,0.25,0.5,0.75,1],yt:[-1,0,1],xl:'x',yl:'y'});
  P.fn(f,'ln thin sm dash',0,1,300,P.bg);const inp=q(root,'n');const sg=z=>1/(1+Math.exp(-z));
  function draw(){const N=+inp.value;setV(root,'n',N);P.clear();const k=40*N;const g=x=>{let s=0;for(let i=0;i<N;i++){const a=i/N,b=(i+1)/N;s+=f((a+b)/2)*(sg(k*(x-a))-sg(k*(x-b)))}return s};
    if(N<=6)for(let i=0;i<N;i++){const a=i/N,b=(i+1)/N,h=f((a+b)/2);P.fn(x=>h*(sg(k*(x-a))-sg(k*(x-b))),'ln thin so',0,1,300)}
    P.fn(g,'ln sr',0,1,500);setR(root,'h',2*N)}inp.addEventListener('input',draw);draw()};
/* features of features: the units of a 2-4-4-1 network (tanh) trained on the circle data; shared by deep-feats and deep-build */
function deepNet(){const {X,y}=circleData(3,200);return {X,y,mdl:trainMLP(X,y,[4,4],'tanh',800,0.02,7)}}
FIG['deep-feats']=root=>{const {X,y,mdl}=deepNet();const svg=initSvg(svgOf(root),960,300);const N=24;
  const panel=(x0,y0,sz,fn,mono)=>{const P=Plot(svg,{at:[x0,y0],w:sz,h:sz,x:[-1,1],y:[-1,1],m:{l:1,r:1,t:1,b:1}});for(let a=0;a<N;a++)for(let b=0;b<N;b++){const xx=[-1+2*(a+0.5)/N,-1+2*(b+0.5)/N];const rc=P.rect(-1+2*a/N,-1+2*b/N,-1+2*(a+1)/N,-1+2*(b+1)/N,'');rc.setAttribute('fill',heat(fn(xx),mono));rc.setAttribute('stroke','none')}
    E('rect',{x:x0+1,y:y0+1,width:sz-2,height:sz-2,fill:'none',stroke:'#bfbfbf'},svg)};
  T(svg,160,18,'layer 1: 4 units','lab');T(svg,460,18,'layer 2: 4 units','lab');T(svg,800,18,'output ŷ','lab');
  for(let j=0;j<4;j++)panel(42+(j%2)*120,32+Math.floor(j/2)*120,112,x=>mdl.forward(x)[1][j],false);
  for(let j=0;j<4;j++)panel(342+(j%2)*120,32+Math.floor(j/2)*120,112,x=>mdl.forward(x)[2][j],false);
  panel(690,42,220,x=>mdl.forward(x)[3][0],true);X.forEach((x,i)=>{if(y[i]){const cx=690+110+110*x[0],cy=42+110-110*x[1];E('circle',{cx:cx,cy:cy,r:1.8,fill:'#000'},svg)}});
  arrowPx(svg,284,152,334,152,'ln sk','fk');arrowPx(svg,584,152,680,152,'ln sk','fk');
  T(svg,162,284,'soft straight lines ("walls")','','middle');T(svg,462,284,'combinations of walls: curved regions','','middle');T(svg,800,284,'the decision: a closed region','','middle');
  T(svg,480,300,'hidden units (tanh): orange = +1, blue = −1 · output: dark blue = high probability · dots: class-1 examples','','middle')};
/* the same network drawn like the forward-pass slide; one layer per step (slider data-k="s"), each unit becomes a picture of its value
   over the plane: 0 the network · 1 the inputs · 2 layer 1 · 3 layer 2 · 4 the output. A computed layer's edges: orange = positive
   weight, blue = negative, width ∝ |w| (faded once the next layer is on) */
FIG['deep-build']=root=>{const svg=svgOf(root);const {X,y,mdl}=deepNet();const sub=['₁','₂','₃','₄'];
  const pic=(fn,mono)=>{const N=48,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d');
    for(let a=0;a<N;a++)for(let b=0;b<N;b++){g.fillStyle=heat(fn([-1+2*(a+0.5)/N,1-2*(b+0.5)/N]),mono);g.fillRect(a,b,1,1)}return c.toDataURL()};
  const url=[[pic(x=>x[0]),pic(x=>x[1])],[0,1,2,3].map(j=>pic(x=>mdl.forward(x)[1][j])),[0,1,2,3].map(j=>pic(x=>mdl.forward(x)[2][j])),[pic(x=>mdl.forward(x)[3][0],true)]];
  const wmax=mdl.W.map(Wl=>Math.max(...Wl.flat().map(Math.abs)));
  stepper(root,s=>{initSvg(svg,660,400);svg.setAttribute('viewBox','0 50 660 350');
    const pos=drawNet(svg,[2,4,4,1],{x0:56,y0:80,w:510,h:300,r:20,titles:['input x','layer 1 (tanh)','layer 2 (tanh)','output (sigmoid)'],
      label:(l,i)=>l===0?'x'+sub[i]:l===3?'ŷ':'a'+sub[i],
      edgeStyle:(l,i,j)=>{if(s<l+2)return {stroke:'#c9d3e8',width:1};const w=mdl.W[l][i][j],op=s===l+2?0.9:0.35;
        return {stroke:(w>0?'rgba(237,125,49,':'rgba(68,114,196,')+op+')',width:0.6+3.4*Math.abs(w)/wmax[l]}}});
    pos.forEach((col,l)=>{if(s<l+1)return;const sz=l===3?116:60;col.forEach((p,i)=>{E('image',{href:url[l][i],x:p[0]-sz/2,y:p[1]-sz/2,width:sz,height:sz,preserveAspectRatio:'none'},svg);
      E('rect',{x:p[0]-sz/2,y:p[1]-sz/2,width:sz,height:sz,fill:'none',stroke:s===l+1?'#ffc000':'#bfbfbf','stroke-width':s===l+1?3:1},svg)})});
    if(s>=1)pos[0].forEach((p,i)=>T(svg,p[0]-36,p[1]+5,'x'+sub[i],'lab','end'));
    if(s>=4){const p=pos[3][0];X.forEach((x,i)=>{if(y[i])E('circle',{cx:p[0]+58*x[0],cy:p[1]-58*x[1],r:1.6,fill:'#000'},svg)});
      T(svg,p[0],p[1]+78,'ŷ: white = 0, blue = 1','','middle');T(svg,p[0],p[1]+96,'dots: class-1 examples','','middle')}
    if(s>=1)T(svg,330,396,'units: blue −1, white 0, orange +1 · edges: orange = positive weight, blue = negative','','middle')})};
/* the family of networks in this course, from simple to structured */
FIG['nn-zoo']=root=>{const svg=initSvg(svgOf(root),960,290);const W=226;
  const panel=(k,title,s1,s2)=>{const x0=6+k*238;E('rect',{x:x0,y:32,width:W,height:188,rx:10,fill:'#f7f9fc',stroke:'#d0d0d0'},svg);T(svg,x0+W/2,20,title,'lab big');T(svg,x0+W/2,244,s1,'lab');T(svg,x0+W/2,266,s2,'');return x0};
  let x0=panel(0,'MLP · ch. 1–3','input: a vector of numbers','every unit sees every input');drawNet(svg,[3,4,2],{x0:x0+38,y0:52,w:150,h:150,r:10});
  x0=panel(1,'CNN · ch. 4','input: an image (a grid)','small filters slide over it');
  for(let i=0;i<6;i++)for(let j=0;j<6;j++)E('rect',{x:x0+16+j*18,y:72+i*18,width:18,height:18,fill:(i>=1&&i<4&&j>=2&&j<5)?'#ffe699':'#fff',stroke:'#bfbfbf'},svg);
  E('rect',{x:x0+16+2*18,y:72+18,width:54,height:54,fill:'none',stroke:'#c00000','stroke-width':2.5},svg);arrowPx(svg,x0+130,126,x0+156,126,'ln thin sk','fk');
  for(let i=0;i<4;i++)for(let j=0;j<4;j++)E('rect',{x:x0+160+j*14,y:98+i*14,width:14,height:14,fill:i===1&&j===2?'#f4b183':'#fbe5d6',stroke:'#bfbfbf'},svg);
  x0=panel(2,'RNN / LSTM · ch. 5','input: a sequence','a memory carried step to step');
  for(let t=0;t<4;t++){const cx=x0+36+t*52;E('rect',{x:cx-16,y:108,width:32,height:30,rx:6,fill:'#bdd7ee',stroke:'#404040'},svg);E('rect',{x:cx-12,y:170,width:24,height:22,rx:4,fill:'#c5e0b4',stroke:'#404040'},svg);arrowPx(svg,cx,170,cx,140,'ln thin sk','fk');if(t<3)arrowPx(svg,cx+16,123,cx+34,123,'ln sr','fr')}
  E('rect',{x:x0+36+3*52-12,y:54,width:24,height:22,rx:4,fill:'#f8cbad',stroke:'#404040'},svg);arrowPx(svg,x0+36+3*52,108,x0+36+3*52,78,'ln thin sk','fk');
  x0=panel(3,'Transformer · ch. 6','input: a sequence of tokens','every token looks at every token');
  const xs=[0,1,2,3,4].map(i=>x0+30+i*41);xs.forEach((x,i)=>{for(let j=i+1;j<5;j++){const x2=xs[j];const hi=i===0&&j===4;E('path',{d:'M'+x+',150 Q'+((x+x2)/2)+','+(150-(x2-x)*0.62)+' '+x2+',150',fill:'none',stroke:hi?'#c00000':'#9dafd6','stroke-width':hi?2.2:1},svg)}});
  xs.forEach(x=>E('circle',{cx:x,cy:160,r:12,fill:'#bdd7ee',stroke:'#404040'},svg));
};
/* softmax on three scores: z′ = s·z + c, then exp(z′), then the probabilities. Sliders data-k = z1 z2 z3 s c */
FIG['softmax-play']=root=>{const svg=svgOf(root);const names=['cat','dog','car'];const iz=['z1','z2','z3'].map(k=>q(root,k)),is=q(root,'s'),ic=q(root,'c');
  const sci=v=>(v>=1000||v<0.01)?v.toExponential(1).replace('e+','e'):(v<10?v.toFixed(2):v.toFixed(1));
  function draw(){const z=iz.map(i=>+i.value),s=+is.value,c=+ic.value;iz.forEach((i,k)=>setV(root,'z'+(k+1),(+i.value).toFixed(1)));setV(root,'s',s.toFixed(1));setV(root,'c',String(c));
    const zp=z.map(v=>s*v+c),e=zp.map(Math.exp),sum=e.reduce((a,b)=>a+b,0),p=e.map(v=>v/sum);initSvg(svg,620,250);
    const mx=Math.max(4,...zp.map(Math.abs)),px=60/mx,x0=135,eMax=Math.max(...e);
    T(svg,x0,18,'score z′ = s·z + c','lab');T(svg,345,18,'exp(z′)','lab');T(svg,520,18,'probability','lab');
    E('line',{x1:x0,y1:34,x2:x0,y2:232,stroke:'#595959'},svg);
    zp.forEach((v,k)=>{const cy=68+k*68;T(svg,8,cy+5,names[k],'lab','start');
      E('rect',{x:v>=0?x0:x0+v*px,y:cy-16,width:Math.max(2,Math.abs(v)*px),height:32,fill:'#dae3f3',stroke:'#4472c4'},svg);T(svg,v>=0?x0+v*px+6:x0+v*px-6,cy+5,v.toFixed(1),'',v>=0?'start':'end');
      E('rect',{x:270,y:cy-16,width:Math.max(2,90*e[k]/eMax),height:32,fill:'#fbe5d6',stroke:'#ed7d31'},svg);T(svg,270+Math.max(2,90*e[k]/eMax)+6,cy+5,sci(e[k]),'','start');
      E('rect',{x:440,y:cy-16,width:Math.max(2,100*p[k]),height:32,fill:'#ed7d31'},svg);T(svg,440+Math.max(2,100*p[k])+6,cy+5,p[k].toFixed(2),'lab','start')});
    setR(root,'sum',sci(sum));setR(root,'tot',fmt(p.reduce((a,b)=>a+b,0),2));const b=p.indexOf(Math.max(...p));setR(root,'best',names[b]+' '+p[b].toFixed(2))}
  iz.concat([is,ic]).forEach(i=>i.addEventListener('input',draw));draw()};
/* why we need the derivative of the activation: gradient descent needs dL/dw, and the chain rule goes w -> z -> a -> L */
FIG['chain-neuron']=root=>{const svg=initSvg(svgOf(root),600,300);
  const rich=(x,y,parts,anchor)=>{const t=E('text',{x:x,y:y,'text-anchor':anchor||'middle'},svg);t.setAttribute('class','lab');parts.forEach(([s,c,b])=>{const ts=E('tspan',{},t);ts.textContent=s;if(c)ts.setAttribute('fill',c);if(b)ts.setAttribute('font-weight','700')});return t};
  const node=(x,y,t,c)=>{E('circle',{cx:x,cy:y,r:27,fill:c,stroke:'#404040'},svg);T(svg,x,y+6,t,'lab big')};
  rich(300,24,[['gradient descent:  ','#595959'],['w ← w − α · ∂L/∂w',null,1]]);
  const xs=[62,206,350,494],y=118;
  node(xs[0],y,'w','#ffe699');node(xs[1],y,'z','#dae3f3');node(xs[2],y,'a','#dae3f3');node(xs[3],y,'L','#fbe5d6');
  [0,1,2].forEach(i=>arrowPx(svg,xs[i]+30,y,xs[i+1]-30,y,'ln thin sk','fk'));
  T(svg,xs[0],y-44,'weight','');T(svg,xs[1],y-60,'z = w·x + b','lab');T(svg,xs[1],y-42,'input of the activation','');T(svg,xs[2],y-60,'a = g(z)','lab');T(svg,xs[2],y-42,'output of the activation','');T(svg,xs[3],y-60,'L = loss(a, y)','lab');
  /* the local derivatives, in red, under each link */
  const red=(x,t,sub)=>{const tt=T(svg,x,y+50,t,'lab');tt.style.fill='#c00000';if(sub){const t2=T(svg,x,y+70,sub,'');t2.style.fill='#c00000'}};
  red((xs[0]+xs[1])/2,'∂z/∂w = x');red((xs[2]+xs[3])/2,'∂L/∂a','(later layers)');
  E('rect',{x:(xs[1]+xs[2])/2-84,y:y+30,width:168,height:60,rx:8,fill:'#fff2cc',stroke:'#ed7d31','stroke-width':2.2},svg);
  const t1=T(svg,(xs[1]+xs[2])/2,y+54,'∂a/∂z = g′(z)','lab big');t1.style.fill='#c00000';const t2=T(svg,(xs[1]+xs[2])/2,y+77,'the activation derivative','');t2.style.fill='#c00000';
  /* the chain rule line */
  E('line',{x1:70,y1:222,x2:530,y2:222,stroke:'#d0d0d0'},svg);
  rich(300,254,[['∂L/∂w  =  ',null,1],['∂L/∂a',null],['  ·  ',null],['∂a/∂z','#c00000',1],['  ·  ',null],['∂z/∂w',null]]);
  T(svg,300,282,'the weight changes z, z changes a, a changes the loss: multiply the slope of every link','','middle')};

/* GELU = z × a smooth gate Φ(z): the bell curve, the gate (against ReLU's hard gate) and the output */
FIG['gelu-gate']=root=>{const svg=initSvg(svgOf(root),960,250);
  const erf=x=>{const sg=Math.sign(x);x=Math.abs(x);const t=1/(1+0.3275911*x);return sg*(1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x))};
  const Phi=z=>0.5*(1+erf(z/Math.SQRT2)),phi=z=>Math.exp(-z*z/2)/Math.sqrt(2*Math.PI);const z0=1;const mk=(k,yr,yt,title)=>{const P=Plot(svg,{at:[k*322,0],w:312,h:250,x:[-4,4],y:yr,m:{l:36,r:10,t:30,b:38}});P.axes({xt:[-4,-2,0,2,4],yt:yt,xl:'z'});T(P.root,173,16,title,'lab');return P};
  const A=mk(0,[-0.03,0.47],[0,0.2,0.4],'bell curve φ(z)');const pts=[[-4,0]];for(let i=0;i<=80;i++){const z=-4+(z0+4)*i/80;pts.push([z,phi(z)])}pts.push([z0,0]);A.poly(pts,'fbs',A.bg);A.fn(phi,'ln sb',-4,4,300,A.bg);A.line(z0,0,z0,phi(z0),'ln thin sk dash',A.bg);
  A.text(-3.85,0.44,'shaded area = share of the curve','', 'start',0,0,A.top);A.text(-3.85,0.395,'to the left of z = 1','', 'start',0,0,A.top);A.text(-3.85,0.34,'Φ(1) = '+fmt(Phi(z0),2),'lab','start',0,0,A.top);
  const B=mk(1,[-0.1,1.2],[0,0.5,1],'the gate Φ(z): how much of z passes');B.line(-4,0,0,0,'ln sm dash',B.bg);B.line(0,1,4,1,'ln sm dash',B.bg);B.line(0,0,0,1,'ln thin sm dot2',B.bg);B.fn(Phi,'ln sb',-4,4,300,B.bg);
  B.text(-3.85,1.12,'— Φ(z): smooth gate (GELU)','', 'start',0,0,B.top).style.fill='#4472c4';B.text(-3.85,1.02,'- - 0 or 1: hard gate (ReLU)','', 'start',0,0,B.top).style.fill='#6b6b6b';
  B.dot(z0,Phi(z0),5,'fb pt',B.bg);B.text(z0,Phi(z0),fmt(Phi(z0),2),'lab','start',8,18,B.top);
  const C=mk(2,[-0.7,4.2],[0,1,2,3,4],'output = z × gate');C.fn(z=>Math.max(0,z),'ln sm dash',-4,4,300,C.bg);C.fn(z=>z*Phi(z),'ln sb',-4,4,300,C.bg);
  C.text(-3.85,3.9,'— GELU(z) = z · Φ(z)','', 'start',0,0,C.top).style.fill='#4472c4';C.text(-3.85,3.4,'- - ReLU(z)','', 'start',0,0,C.top).style.fill='#6b6b6b';
  [1,-1].forEach(z=>{C.dot(z,z*Phi(z),5,'fb pt',C.bg)});C.text(1,1*Phi(1),'1 × 0.84 = 0.84','lab','end',-10,-6,C.top);C.text(-1,-1*Phi(-1),'−1 × 0.16 = −0.16','lab','start',8,18,C.top)};
/* one activation and its derivative (blue = g, red dashed = g′), with two marked values of z. data-act = sigmoid | tanh | relu | leaky | gelu */
const ACT1={sigmoid:{x:[-6,6],y:[-0.15,1.2],yt:[0,0.5,1],marks:[0,5]},tanh:{x:[-6,6],y:[-1.3,1.3],yt:[-1,0,1],marks:[0,3]},
  relu:{x:[-4,4],y:[-0.5,4.3],yt:[0,1,2,3,4],marks:[-2,2],step:0},leaky:{x:[-4,4],y:[-1,4.3],yt:[-1,0,1,2,3,4],marks:[-2,2],step:0.2},gelu:{x:[-4,4],y:[-0.5,4.3],yt:[0,1,2,3,4],marks:[-1,1]}};
FIG['act-one']=root=>{const k=root.getAttribute('data-act')||'sigmoid';const c=ACT1[k];const a=ACTS[k];const P=Plot(svgOf(root),{w:540,h:340,x:c.x,y:c.y,m:{l:40,r:14,t:14,b:36}});
  P.axes({xt:c.x[1]>5?[-6,-3,0,3,6]:[-4,-2,0,2,4],yt:c.yt,xl:'z'});P.line(c.x[0],0,c.x[1],0,'ax',P.bg);P.line(0,c.y[0],0,c.y[1],'ax',P.bg);
  P.fn(a[0],'ln sb',c.x[0],c.x[1],400);
  if(c.step!==undefined){const s0=c.step;P.line(c.x[0],s0,0,s0,'ln sr dash');P.line(0,1,c.x[1],1,'ln sr dash');P.dot(0,s0,4.5,'fr pt');P.dot(0,1,4.5,'fw pt').setAttribute('style','stroke:#c00000;stroke-width:1.6')}
  else P.fn(a[1],'ln sr dash',c.x[0],c.x[1],400);
  c.marks.forEach(z=>{P.line(z,c.y[0],z,c.y[1],'ln thin sm dot2');P.dot(z,a[0](z),5,'fb pt');P.dot(z,c.step!==undefined?(z>0?1:c.step):a[1](z),5,'fr pt');P.text(z,c.y[1],'z = '+z,'', 'middle',0,14).setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round')});
  P.text(c.x[0]+(c.x[1]-c.x[0])*0.03,c.y[1]-(c.y[1]-c.y[0])*0.05,'g(z)','lab','start').style.fill='#4472c4';P.text(c.x[0]+(c.x[1]-c.x[0])*0.03,c.y[1]-(c.y[1]-c.y[0])*0.14,'g′(z)  (dashed)','lab','start').style.fill='#c00000'};
/* activation functions and their derivatives, side by side */
FIG['act-deriv']=root=>{const svg=initSvg(svgOf(root),960,230);
  [['sigmoid  σ(z)',z=>1/(1+Math.exp(-z)),z=>{const s=1/(1+Math.exp(-z));return s*(1-s)},[-0.15,1.1],[0,0.5,1],'σ′(0) = 0.25 is its maximum'],
   ['tanh(z)',Math.tanh,z=>1-Math.tanh(z)**2,[-1.15,1.15],[-1,0,1],'tanh′(0) = 1 is its maximum'],
   ['ReLU(z) = max(0, z)',z=>Math.max(0,z),z=>z>0?1:0,[-0.3,2.3],[0,1,2],'ReLU′ is 0 or 1: no shrinking']].forEach(([lab,f,d,yr,yt,note],k)=>{
    const P=Plot(svg,{at:[k*322,0],w:312,h:230,x:[-4,4],y:yr,m:{l:32,r:10,t:24,b:40}});P.axes({xt:[-4,-2,0,2,4],yt:yt,xl:'z'});P.line(-4,0,4,0,'ax',P.bg);P.line(0,yr[0],0,yr[1],'ax',P.bg);
    T(P.root,171,15,lab,'lab');P.fn(f,'ln sb',-4,4,300);if(k<2)P.fn(d,'ln sr dash',-4,4,300);else{P.line(-4,0,0,0,'ln sr dash');P.line(0,1,4,1,'ln sr dash')}
    P.text(4,yr[0],note,'', 'end',-4,-6)})};
/* sigmoid + cross-entropy: the loss as a function of the logit, and its slope ŷ − y */
FIG['bce-grad']=root=>{const P=Plot(svgOf(root),{w:540,h:320,x:[-5,5],y:[-1.3,5.3],m:{l:40,r:14,t:16,b:40}});P.axes({xt:[-4,-2,0,2,4],yt:[-1,0,1,2,3,4,5],xl:'z (the logit, before the sigmoid)'});P.line(-5,0,5,0,'ax',P.bg);
  P.fn(z=>Math.log(1+Math.exp(-z)),'ln sb',-5,5,300);P.fn(z=>1/(1+Math.exp(-z))-1,'ln sr dash',-5,5,300);
  P.text(-0.6,4.9,'loss L = −log σ(z)   (label y = 1)','', 'start').style.fill='#4472c4';P.text(-0.6,4.35,'slope ∂L/∂z = σ(z) − 1 = ŷ − y','', 'start').style.fill='#c00000';
  const L=z=>Math.log(1+Math.exp(-z));P.dot(-3,L(-3),5,'fb');P.text(-3,L(-3),'wrong and confident: slope ≈ −1','', 'start',9,4);P.dot(3,L(3),5,'fb');P.text(3,L(3),'right: slope ≈ 0','', 'middle',0,-12);
  P.dot(-3,sig(-3)-1,4,'fr');P.dot(3,sig(3)-1,4,'fr')};
/* Review of linear regression: a straight line cannot bend. Stopping distance against speed (1 s of reaction + braking ∝ speed²,
   noise σ = 4 m); seg data-f: 1 = h = θ₀ + θ₁x, 2 = add the column x². Least squares by the normal equation, x scaled by 1/100 inside. */
FIG['rv-curve']=root=>{const r=rng(3);const D=[];for(let v=20;v<=130;v+=10)D.push([v,v/3.6+v*v/178+4*randn(r)]);const m=D.length;
  const fit=k=>{const f=x=>{const s=x/100;return k===1?[1,s]:[1,s,s*s]};const n=k+1;const A=[...Array(n)].map(()=>new Array(n).fill(0)),b=new Array(n).fill(0);
    D.forEach(([x,y])=>{const u=f(x);for(let i=0;i<n;i++){b[i]+=u[i]*y;for(let j=0;j<n;j++)A[i][j]+=u[i]*u[j]}});const c=solve(A,b);const h=x=>f(x).reduce((s,v,i)=>s+v*c[i],0);
    return {h:h,c:c,J:D.reduce((s,[x,y])=>s+(h(x)-y)**2,0)/(2*m)}};
  const P=Plot(svgOf(root),{w:560,h:310,x:[0,140],y:[-20,150],m:{l:46,r:14,t:14,b:40}});P.axes({xt:[0,20,40,60,80,100,120,140],yt:[0,50,100,150],xl:'speed x (km/h)',yl:'stopping distance y (m)'});
  P.line(0,0,140,0,'ax',P.bg);const sg=v=>(v<0?'− ':'+ ')+Math.abs(v);
  function draw(k){k=+k;const F=fit(k);P.clear();D.forEach(([x,y])=>P.line(x,y,x,F.h(x),'ln thin so dot2'));P.fn(F.h,'ln sr',10,140);D.forEach(([x,y])=>P.dot(x,y,5,'pt fb'));
    const c=F.c;setR(root,'h','h(x) = '+fmt(c[0],1).replace('-','−')+' '+sg(fmt(c[1]/100,2))+'x'+(k===2?' '+sg(fmt(c[2]/1e4,4))+'x²':''));setR(root,'j',fmt(F.J,1))}
  const cur=segs(root,'f',draw);draw(cur()||1)};
/* Review of logistic regression on the circle data of feat-map (same seed and points). seg data-m:
   fit  = the trained model. h changes along one direction only, so its lines of equal h (dotted) are straight and parallel; h stays
          below 0.5 on the data, so the boundary h = 0.5 (θᵀx = 0) lies beyond it, in the corner.
   best = the best of all straight lines, by brute force (720 directions × every cut between two points): blue on one side.
   Ringed points are answered wrong. */
FIG['rv-circle']=root=>{const r=rng(21);const pts=[];for(let i=0;i<150;i++){const a=2*r()-1,b=2*r()-1;pts.push([a,b,a*a+b*b<0.42?1:0])}
  const w=fitLogit(pts.map(p=>[1,p[0],p[1]]),pts.map(p=>p[2]));const h=(a,b)=>sig(w[0]+w[1]*a+w[2]*b);const L=1.3,N=39;
  let best={ok:-1};for(let k=0;k<720;k++){const t=Math.PI*k/360,n=[Math.cos(t),Math.sin(t)];const s=pts.map(p=>[n[0]*p[0]+n[1]*p[1],p[2]]).sort((a,b)=>a[0]-b[0]);
    let ok=s.filter(p=>p[1]).length;s.forEach((p,i)=>{ok+=p[1]?-1:1;if(ok>best.ok)best={ok:ok,n:n,c:i+1<s.length?(p[0]+s[i+1][0])/2:p[0]+0.05}})}
  const P=Plot(svgOf(root),{w:400,h:400,x:[-L,L],y:[-L,L],m:{l:34,r:10,t:10,b:36}});P.axes({xt:[-1,0,1],yt:[-1,0,1],grid:false,xl:'x₁',yl:'x₂'});
  const halo='paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round';
  /* the two ends of the line u·x = k inside the view */
  const ends=(u,k)=>{const e=[];[-L,L].forEach(v=>{if(u[1]){const b=(k-u[0]*v)/u[1];if(Math.abs(b)<=L)e.push([v,b])}if(u[0]){const a=(k-u[1]*v)/u[0];if(Math.abs(a)<=L)e.push([a,v])}});return e};
  /* a label on the line u·x = k, 0.15 inside the end chosen by pick(end) (the end with the largest pick) */
  const tag=(u,k,pick,s,cls)=>{const e=ends(u,k);if(e.length<2)return;const [a,b]=pick(e[0])>=pick(e[1])?e:[e[1],e[0]],d=Math.hypot(b[0]-a[0],b[1]-a[1]);
    P.text(a[0]+0.15*(b[0]-a[0])/d,a[1]+0.15*(b[1]-a[1])/d,s,cls,'middle',0,4).setAttribute('style',halo)};
  const circle=[...Array(121).keys()].map(k=>{const t=2*Math.PI*k/120;return [Math.sqrt(0.42)*Math.cos(t),Math.sqrt(0.42)*Math.sin(t)]});
  function draw(m){P.clear();const fit=m!=='best',u=fit?[w[1],w[2]]:best.n,k=fit?-w[0]:best.c;
    if(fit){for(let a=0;a<N;a++)for(let b=0;b<N;b++){const p=h(-L+2*L*(a+0.5)/N,-L+2*L*(b+0.5)/N);P.rect(-L+2*L*a/N,-L+2*L*b/N,-L+2*L*(a+1)/N,-L+2*L*(b+1)/N,p>=0.5?'fb':'fo').setAttribute('opacity',(0.06+0.5*Math.abs(p-0.5)*2).toFixed(2))}
      [0.3,0.35,0.4,0.45].forEach(v=>{const lk=Math.log(v/(1-v))-w[0],e=ends(u,lk);if(e.length<2)return;P.line(e[0][0],e[0][1],e[1][0],e[1][1],'ln thin sm dot2');tag(u,lk,q=>q[0]-q[1],(v===0.3?'h = ':'')+v.toFixed(2),'')})}
    else{halfPlane(P,u[0],u[1],-k,'fbs');halfPlane(P,-u[0],-u[1],k,'fos')}
    P.path(circle,'ln thin sm dash');const e=ends(u,k);if(e.length===2)P.line(e[0][0],e[0][1],e[1][0],e[1][1],'ln sk');
    if(fit&&e.length===2){const t=e[0][1]>=e[1][1]?e[0]:e[1];P.text(t[0]-0.06,t[1]-0.13,'h = 0.5','lab','end').setAttribute('style',halo)}
    pts.forEach(p=>P.dot(p[0],p[1],4,'pt '+(p[2]?'fb':'fo')));
    let ok=0;pts.forEach(p=>{if(((u[0]*p[0]+u[1]*p[1]>k)?1:0)===p[2])ok++;else P.dot(p[0],p[1],7.5,'nof').setAttribute('style','stroke:#c00000;stroke-width:1.6')});
    setR(root,'ok',ok+' of '+pts.length)}
  const hs=pts.map(p=>h(p[0],p[1])),ok=pts.filter((p,i)=>(hs[i]>=0.5?1:0)===p[2]).length,n0=pts.filter(p=>!p[2]).length;
  setR(root,'acc',ok+' of '+pts.length+' ('+Math.round(100*ok/pts.length)+' %)');setR(root,'base',n0+' of '+pts.length);setR(root,'hr',fmt(Math.min(...hs),2)+' to '+fmt(Math.max(...hs),2));
  const cur=segs(root,'m',draw);draw(cur()||'fit')};
})();
