/* Figures for 06_transformers.html */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,fmt,q,setV,setR,svgOf}=lib;
const softmax=z=>{const m=Math.max(...z);const e=z.map(v=>Math.exp(v-m));const s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s)};

const {grid,heat,box,stepper,f2,f3}=window.MLNN;
/* ---------- translation: soft alignment ---------- */
FIG['align']=root=>{const svg=initSvg(svgOf(root),560,330);const src=['the','black','cat','sleeps','.'],tgt=['el','gato','negro','duerme','.'];
  const A=[[0.85,0.05,0.06,0.02,0.02],[0.06,0.12,0.78,0.02,0.02],[0.04,0.83,0.1,0.02,0.01],[0.02,0.02,0.08,0.86,0.02],[0.02,0.01,0.02,0.05,0.9]];const cs=52;
  src.forEach((w,j)=>{const t=T(svg,150+j*cs+cs/2,40,w,'lab');t.setAttribute('transform','rotate(-30 '+(150+j*cs+cs/2)+' 40)')});tgt.forEach((w,i)=>T(svg,140,70+i*cs+cs/2+5,w,'lab','end'));
  grid(svg,150,70,A,cs,(i,j,v)=>heat(v,true),(i,j,v)=>v>0.3?f2(v):'',{cls:'',tcol:'#fff',stroke:'#fff'});T(svg,295,350-8,'','');
  T(svg,440,100,'row = a word being written','','start');T(svg,440,122,'column = a source word','','start');T(svg,440,150,'each row sums to 1','','start');T(svg,440,190,'"gato" looks at "cat",','','start');T(svg,440,212,'"negro" at "black":','','start');T(svg,440,234,'the order flip is learned','','start');T(svg,440,256,'from data, not programmed','','start')};
/* ---------- attention with numbers ---------- */
FIG['attn-num']=root=>{const svg=svgOf(root);const toks=['I','love','pizza'];const K=[[1,0],[0,1],[1,1]],V=[[1,0],[0,1],[0.5,0.5]];const qv=[2,1];const dk=2;
  const s=K.map(k=>(k[0]*qv[0]+k[1]*qv[1])/Math.sqrt(dk));const a=softmax(s);const out=[0,1].map(d=>a.reduce((t,w,j)=>t+w*V[j][d],0));
  stepper(root,st=>{initSvg(svg,620,300);T(svg,50,24,'token','lab');T(svg,140,24,'key k','lab');T(svg,230,24,'value v','lab');if(st>=1)T(svg,330,24,'q·k / √2','lab');if(st>=2)T(svg,430,24,'softmax α','lab');if(st>=3)T(svg,540,24,'α · v','lab');
    toks.forEach((t,j)=>{const y=60+j*56;box(svg,15,y-18,70,36,t,'#e2f0d9');T(svg,140,y+5,'('+K[j].join(', ')+')','');T(svg,230,y+5,'('+V[j].join(', ')+')','');
      if(st>=1)T(svg,330,y+5,f3(s[j]),'lab');if(st>=2){E('rect',{x:395,y:y-10,width:70*a[j],height:20,fill:'#ed7d31'},svg);T(svg,470,y+5,f3(a[j]),'','start')}
      if(st>=3)T(svg,540,y+5,'('+f2(a[j]*V[j][0])+', '+f2(a[j]*V[j][1])+')','')});
    box(svg,15,232,300,40,'query of "pizza": q = (2, 1)','#fbe5d6',{cls:''});
    if(st>=4)box(svg,330,232,280,40,'output = Σ α v = ('+f2(out[0])+', '+f2(out[1])+')','#dae3f3',{cls:'lab'});
    T(svg,310,292,['q is compared with every key','dot products, divided by √dₖ = √2','softmax: positive weights that sum to 1','each value is weighted by its α','the new vector for "pizza": mostly its own value, some of "I"'][st],'','middle')})};
/* ---------- a full attention matrix ---------- */
FIG['attn-matrix']=root=>{const svg=initSvg(svgOf(root),560,400);const toks=TOK.slice();const S=scores('tired');const A=S.map(r=>softmax(r.map(v=>v*1.3)));const cs=36;
  toks.forEach((w,j)=>{const t=T(svg,120+j*cs+cs/2,70,w,'');t.setAttribute('transform','rotate(-45 '+(120+j*cs+cs/2)+' 70)');t.setAttribute('text-anchor','start')});toks.forEach((w,i)=>T(svg,112,80+i*cs+cs/2+5,w,i===7?'lab':'','end'));
  grid(svg,120,80,A,cs,(i,j,v)=>heat(Math.min(1,v*1.6),true),null,{stroke:'#fff'});E('rect',{x:120,y:80+7*cs,width:10*cs,height:cs,fill:'none',stroke:'#c00000','stroke-width':2.5},svg);
  T(svg,300,14,'keys (what each word offers) →','lab');T(svg,8,250,'queries ↓','lab','start')};
/* ---------- heads learn different patterns ---------- */
FIG['heads']=root=>{const svg=initSvg(svgOf(root),960,290);const n=8;const cs=26;const toks=['the','cat','sat','on','the','mat','.','it'];
  const pats=[['head 1: previous token',(i,j)=>j===i-1?1:(i===0&&j===0?1:0)],['head 2: same word / itself',(i,j)=>toks[i]===toks[j]?1:0.05],['head 3: "it" → noun',(i,j)=>i===7?(j===1?0.7:j===5?0.3:0):(j===i?0.6:0.05)],['head 4: broad average',(i,j)=>j<=i?1:0]];
  pats.forEach(([name,f],k)=>{const x0=20+k*240;T(svg,x0+n*cs/2,20,name,'lab');const M=[];for(let i=0;i<n;i++){const r=[];for(let j=0;j<n;j++)r.push(f(i,j));const s=r.reduce((a,b)=>a+b,0)||1;M.push(r.map(v=>v/s))}
    grid(svg,x0,32,M,cs,(i,j,v)=>heat(Math.min(1,v*1.3),true),null,{stroke:'#fff'});toks.forEach((w,i)=>{T(svg,x0+i*cs+cs/2,32+n*cs+14,w,'').style.fontSize='11px'})});
  T(svg,480,282,'rows = queries, columns = keys (same 8 tokens). Hand-drawn illustration: patterns of this kind are found in trained models.','','middle')};
/* ---------- path length: RNN vs attention ---------- */
FIG['paths']=root=>{const svg=initSvg(svgOf(root),960,240);const n=7;
  T(svg,230,20,'RNN: information from word 1 to word 7','lab');for(let k=0;k<n;k++){const x=40+k*65;E('circle',{cx:x,cy:110,r:20,fill:k===0||k===n-1?'#ed7d31':'#bdd7ee',stroke:'#404040'},svg);T(svg,x,115,String(k+1),'lab');if(k<n-1)arrowPx(svg,x+21,110,x+43,110,'ln sr','fr')}
  T(svg,230,170,'6 sequential steps: slow, and the signal fades','','middle');T(svg,230,192,'cost O(n) steps that cannot run in parallel','','middle');
  T(svg,720,20,'Attention: every pair in one step','lab');for(let k=0;k<n;k++){const x=520+k*65;E('circle',{cx:x,cy:130,r:20,fill:k===0||k===n-1?'#ed7d31':'#bdd7ee',stroke:'#404040'},svg);T(svg,x,135,String(k+1),'lab')}
  for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){const x1=520+a*65,x2=520+b*65;const hi=a===0&&b===n-1;E('path',{d:'M'+x1+',108 Q'+((x1+x2)/2)+','+(108-(x2-x1)*0.35)+' '+x2+',108',fill:'none',stroke:hi?'#c00000':'#9dafd6','stroke-width':hi?2.5:0.8},svg)}
  T(svg,720,190,'1 step between any two words, all pairs computed in parallel','','middle');T(svg,720,212,'price: n² pairs (memory and compute grow with n²)','','middle')};
/* ---------- BPE ---------- */
FIG['bpe']=root=>{const svg=svgOf(root);const cnt=[5,2,6,3];const rows=[['l o w','l o w e r','n e w e s t','w i d e s t'],['l o w','l o w e r','n e w es t','w i d es t'],['l o w','l o w e r','n e w est','w i d est'],['lo w','lo w e r','n e w est','w i d est'],['low','low e r','n e w est','w i d est']];
  const merges=['start: characters (a toy corpus, with word counts)','"e" + "s": 6 + 3 = 9 times, the most frequent pair → "es"','"es" + "t": 9 times → "est"','"l" + "o": 5 + 2 = 7 times → "lo"','"lo" + "w": 7 times → "low"'];
  stepper(root,s=>{initSvg(svg,600,230);T(svg,300,24,merges[s],'lab');rows[s].forEach((w,k)=>{const parts=w.split(' ');let x=40;const y=48+k*38;T(svg,30,y+19,'×'+cnt[k],'','end');parts.forEach(p=>{const wd=16+p.length*12;box(svg,x,y,wd,28,p,'#dae3f3',{cls:'lab'});x+=wd+4})});
    T(svg,300,218,'the vocabulary grows by one symbol per merge; GPT-2 stops at 50,257 tokens','','middle')})};
/* ---------- language-model training: shifted targets ---------- */
FIG['lm-train']=root=>{const svg=initSvg(svgOf(root),960,200);const toks=['The','cat','sat','on','the','mat'];
  T(svg,40,50,'input','lab','end');T(svg,40,150,'target','lab','end');toks.forEach((t,k)=>{const x=70+k*140;if(k<5){box(svg,x,30,110,34,t,'#e2f0d9');arrowPx(svg,x+55,66,x+55,128,'ln thin sk','fk');T(svg,x+60,100,'predict','','start')}if(k>0)box(svg,x-140,130,110,34,t,'#fbe5d6')});
  T(svg,480,190,'one sequence of 6 tokens = 5 classification problems, trained in a single forward pass thanks to the causal mask','','middle')};
/* ---------- autoregressive generation loop ---------- */
FIG['gen-loop']=root=>{const svg=svgOf(root);const words=['Can','you','please','come','here','?'];const P=[[],[],[],[],[['here',0.41],['back',0.22],['home',0.15]],[['?',0.62],['now',0.14],['.',0.1]],[['<end>',0.8],['Thanks',0.05],['I',0.03]]];
  stepper(root,s=>{initSvg(svg,620,280);const n=4+s;const shown=words.slice(0,n);let x=20;shown.forEach((w,k)=>{const wd=20+w.length*11;box(svg,x,40,wd,32,w,k>=4?'#fbe5d6':'#e2f0d9');x+=wd+6});
    box(svg,200,110,220,44,'GPT (N blocks)','#dae3f3');arrowPx(svg,310,74,310,108,'ln thin sk','fk');const pr=P[n];if(pr.length){arrowPx(svg,310,156,310,178,'ln thin sk','fk');
      pr.forEach(([w,p],k)=>{const y=185+k*26;T(svg,250,y+14,w,'lab','end');E('rect',{x:258,y:y,width:260*p,height:20,fill:k===0?'#c00000':'#4472c4'},svg);T(svg,262+260*p,y+14,f2(p),'','start')})}
    T(svg,540,130,s<2?'append the chosen token,':'<end>: stop','','middle');if(s<2)T(svg,540,150,'run the model again','','middle')})};

const TOK=['The','animal','didn’t','cross','the','street','because','it','was','tired'];
function scores(last){const n=10;const S=[...Array(n)].map((_,i)=>[...Array(n)].map((_,j)=>i===j?1.2:0));const set=(i,j,v)=>S[i][j]=v;
  set(1,0,1.5);set(3,1,2.2);set(3,5,2.2);set(2,3,1.8);set(5,4,1.6);set(6,3,1.2);set(8,7,1.8);set(9,7,1.5);
  if(last==='tired'){set(7,1,3.4);set(7,5,1.0);set(9,1,2.4)}else{set(7,5,3.4);set(7,1,1.0);set(9,5,2.4)}set(7,7,1.2);return S}
FIG['attn']=root=>{const svg=svgOf(root);const inp=q(root,'q');let last='tired';const btns=root.querySelectorAll('.seg button');
  function draw(){const qi=+inp.value;const toks=TOK.slice();toks[9]=last;setV(root,'q','"'+toks[qi]+'"');const S=scores(last);const w=softmax(S[qi]);initSvg(svg,600,400);
    T(svg,120,20,'query','lab');T(svg,470,20,'keys / values','lab');
    toks.forEach((t,j)=>{const y=48+j*34;const yq=48+qi*34;if(j===0){}E('line',{x1:170,y1:yq-6,x2:400,y2:y-6,stroke:'#4472c4','stroke-width':1+14*w[j],'stroke-opacity':0.15+0.85*w[j]},svg)});
    toks.forEach((t,j)=>{const y=48+j*34;const tl=T(svg,160,y,t,j===qi?'lab big':'','end');if(j===qi)tl.style.fill='#c00000';T(svg,410,y,t,'','start');E('rect',{x:500,y:y-16,width:Math.max(2,90*w[j]),height:18,fill:'#ed7d31'},svg);T(svg,596,y-2,fmt(w[j],2),'','end')});
    let jm=0;w.forEach((v,j)=>{if(v>w[jm])jm=j});setR(root,'top','"'+toks[jm]+'" ('+fmt(w[jm],2)+')')}
  btns.forEach(b=>b.addEventListener('click',()=>{last=b.dataset.w;btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw()}));inp.addEventListener('input',draw);draw()};
FIG['sqrtd']=root=>{const svg=svgOf(root);const inp=q(root,'d');
  function draw(){const d=Math.round(Math.pow(2,+inp.value));setV(root,'d',d);const r=rng(4);const qv=[...Array(d)].map(()=>randn(r));const raw=[];for(let k=0;k<8;k++){let s=0;for(let i=0;i<d;i++)s+=qv[i]*randn(r);raw.push(s)}
    const sc=raw.map(v=>v/Math.sqrt(d));const pr=softmax(raw),ps=softmax(sc);initSvg(svg,600,300);
    [['softmax(q·k): raw scores',pr,raw,'#c00000'],['softmax(q·k / √dₖ): scaled',ps,sc,'#4472c4']].forEach(([lab,p,s,c],k)=>{const x0=k*305;T(svg,x0+148,18,lab,'lab');
      p.forEach((v,i)=>{E('rect',{x:x0+20+i*34,y:250-200*v,width:26,height:200*v+0.5,fill:c},svg);T(svg,x0+33+i*34,272,fmt(s[i],1),'')});T(svg,x0+148,294,'scores (std ≈ '+(k?'1':'√'+d+' = '+fmt(Math.sqrt(d),1))+')','')});
    setR(root,'mx',fmt(Math.max(...pr),3));setR(root,'ms',fmt(Math.max(...ps),3))}inp.addEventListener('input',draw);draw()};
FIG['posenc']=root=>{const svg=initSvg(svgOf(root),600,300);const P=50,D=32;const cw=520/P,ch=200/D;
  for(let p=0;p<P;p++)for(let i=0;i<D;i++){const k=Math.floor(i/2);const ang=p/Math.pow(10000,2*k/D);const v=i%2===0?Math.sin(ang):Math.cos(ang);E('rect',{x:50+p*cw,y:30+i*ch,width:cw+0.3,height:ch+0.3,fill:v>=0?'#4472c4':'#ed7d31','fill-opacity':Math.abs(v).toFixed(2)},svg)}
  T(svg,310,20,'PE(pos, i) for 50 positions × 32 dimensions','lab');T(svg,310,250,'position →','','middle');T(svg,40,130,'dim','','end');T(svg,310,285,'Low dimensions oscillate fast, high dimensions slowly: every position gets a unique pattern.','','middle')};
FIG['mha']=root=>{const svg=initSvg(svgOf(root),560,330);const box=(x,y,w,t,c)=>{E('rect',{x:x,y:y,width:w,height:30,rx:5,fill:c,stroke:'#404040'},svg);T(svg,x+w/2,y+20,t,'lab')};
  ['Q','K','V'].forEach((t,k)=>{const x=80+k*150;T(svg,x+50,326,t,'lab big');for(let h=2;h>=0;h--)box(x+h*6,262-h*6,100,'Linear','#f8cbad');arrowPx(svg,x+50,300,x+50,294,'ln thin sk','fk');arrowPx(svg,x+50,250,250+k*30,212,'ln thin sk','fk')});
  for(let h=2;h>=0;h--)box(170+h*6,176-h*6,220,'Scaled dot-product attention','#b4c7e7');T(svg,470,170,'h heads','lab','start');arrowPx(svg,280,164,280,128,'ln thin sk','fk');
  box(210,96,140,'Concatenate','#ffe699');arrowPx(svg,280,94,280,70,'ln thin sk','fk');box(230,38,100,'Linear W_O','#f8cbad');T(svg,280,22,'output','lab')};
FIG['decode']=root=>{const words=['here','back','home','over','in','now','soon','inside'];const logits=[3.0,2.2,1.7,1.2,0.9,0.7,0.5,0.1];const svg=svgOf(root);const it=q(root,'t'),ik=q(root,'k');let picked='';
  function probs(){const t=+it.value,k=+ik.value;const z=logits.map(v=>v/t);const idx=z.map((v,i)=>i).sort((a,b)=>z[b]-z[a]).slice(0,k);const zz=z.map((v,i)=>idx.includes(i)?v:-1e9);return softmax(zz)}
  function draw(){setV(root,'t',fmt(+it.value,2));setV(root,'k',ik.value);const p=probs();initSvg(svg,600,300);T(svg,20,24,'Can you please come ___ ?','lab big','start');
    p.forEach((v,i)=>{const y=52+i*29;T(svg,110,y+15,words[i],'lab','end');E('rect',{x:120,y:y,width:Math.max(1,400*v),height:21,fill:v>0?'#4472c4':'#e7e6e6'},svg);T(svg,528+0*v,y+15,v>0?fmt(v,2):'cut','','start')});
    setR(root,'s',picked||'–')}
  root.querySelector('[data-k="go"]').addEventListener('click',()=>{const p=probs();let u=Math.random(),i=0;while(i<p.length-1&&u>p[i]){u-=p[i];i++}picked=words[i];draw()});it.addEventListener('input',draw);ik.addEventListener('input',draw);draw()};
FIG['rag']=root=>{const svg=initSvg(svgOf(root),1000,330);
  const node=(x,y,w,t1,t2,c,n)=>{box(svg,x,y,w,50,t1,c,{cls:'lab'});if(t2)T(svg,x+w/2,y+68,t2,'');if(n){E('circle',{cx:x,cy:y,r:12,fill:'#404040'},svg);T(svg,x,y+5,String(n),'lab w')}};
  E('rect',{x:4,y:6,width:992,height:122,rx:10,fill:'#fffaf0',stroke:'#ffd966'},svg);T(svg,16,26,'A · Indexing: once, offline','lab','start');
  node(30,48,150,'Documents','24 coffee-shop pages','#ffe699',1);node(250,48,150,'Chunk','pieces of ~40 words','#b4c7e7',2);node(470,48,150,'Embed','384 numbers per chunk','#b4c7e7',3);node(720,48,200,'Vector database\n(24 × 384 matrix)','','#e2f0d9',4);
  [[180,250],[400,470],[620,720]].forEach(([a,b])=>arrowPx(svg,a,73,b-2,73,'ln thin sk','fk'));
  E('rect',{x:4,y:152,width:992,height:172,rx:10,fill:'#f4f8fd',stroke:'#9dc3e6'},svg);T(svg,16,172,'B · Answering: every question','lab','start');
  node(30,182,130,'Question','"Where can I try Vietnamese coffee?"','#f8cbad',5);node(205,182,130,'Embed','same encoder as A','#b4c7e7',6);node(380,182,150,'Search','top-k most similar chunks','#e2f0d9',7);node(575,182,170,'Prompt','instructions + chunks + question','#fff2cc',8);node(790,182,90,'LLM','','#dae3f3',9);node(905,182,80,'Answer','with sources','#c5e0b4',10);
  [[160,205],[335,380],[530,575],[745,790],[880,905]].forEach(([a,b])=>arrowPx(svg,a,207,b-2,207,'ln thin sk','fk'));
  E('path',{d:'M820,98 L820,140 L455,140',fill:'none',stroke:'#404040','stroke-width':1.5},svg);arrowPx(svg,455,140,455,180,'ln thin sk','fk');T(svg,640,134,'the question is compared with the stored vectors','','middle')};
FIG['cosine']=root=>{const P=Plot(svgOf(root),{w:420,h:360,x:[-1.2,1.2],y:[-1.2,1.2],m:{l:10,r:10,t:10,b:10}});P.axes({grid:false,noaxes:true});P.line(-1.2,0,1.2,0,'ax');P.line(0,-1.2,0,1.2,'ax');
  const qv=[0.6,0.8];const ch=[[0.3,0.95,'returns policy'],[0.75,0.55,'refund times'],[-0.8,0.5,'store hours'],[-0.4,-0.9,'job offers'],[0.95,-0.2,'shipping costs']];
  const cos=(a,b)=>(a[0]*b[0]+a[1]*b[1])/(Math.hypot(...a.slice(0,2))*Math.hypot(...b.slice(0,2)));const ranked=ch.map(c=>[c,cos(qv,c)]).sort((a,b)=>b[1]-a[1]);
  ranked.forEach(([c,s],k)=>{P.line(0,0,c[0],c[1],k<2?'ln sg':'ln thin sm');P.dot(c[0],c[1],5,k<2?'fgr':'fm');P.text(c[0],c[1],c[2]+' ('+fmt(s,2)+')','', c[0]<0?'end':'start',c[0]<0?-8:8,4)});
  P.line(0,0,qv[0],qv[1],'ln sr');P.dot(qv[0],qv[1],7,'fr');P.text(qv[0],qv[1],'question','lab','start',10,14)};
/* ===================== additions (2026-10) ===================== */
const {segs}=window.MLNN;
const hexRGB=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const GPT2=window.MLNN_GPT2;

/* RNN steps one after another vs attention connecting every pair at once */
FIG['seq-par']=root=>{const svg=initSvg(svgOf(root),470,300);
  T(svg,235,18,'RNN / LSTM: one step after another','lab');
  for(let i=0;i<5;i++){const x=45+i*95;E('circle',{cx:x,cy:58,r:18,fill:'#b4c7e7',stroke:'#404040'},svg);T(svg,x,64,String(i+1),'lab');T(svg,x,96,'t = '+(i+1),'');if(i<4)arrowPx(svg,x+20,58,x+75,58,'ln thin sk','fk')}
  T(svg,235,120,'step 5 waits for steps 1–4: the time grows with the length','');
  T(svg,235,160,'Attention: all positions at once','lab');
  const y=262;for(let i=0;i<5;i++)for(let j=i+1;j<5;j++){const xi=45+i*95,xj=45+j*95;E('path',{d:'M'+xi+','+(y-18)+' Q'+((xi+xj)/2)+','+(y-18-(j-i)*17)+' '+xj+','+(y-18),fill:'none',stroke:j-i===4?'#c00000':'#9dafd6','stroke-width':j-i===4?2:1},svg)}
  for(let i=0;i<5;i++){const x=45+i*95;E('circle',{cx:x,cy:y,r:18,fill:'#b4c7e7',stroke:'#404040'},svg);T(svg,x,y+6,String(i+1),'lab')}
  T(svg,235,294,'1 step between any two words, all computed in parallel','')};

/* a soft dictionary: weights over the keys, output = a mix of the values */
FIG['soft-lookup']=root=>{const svg=svgOf(root);const keys=[['cat',[2,0.5],'#ed7d31'],['dog',[1,1.5],'#4472c4'],['car',[-1,-0.5],'#70ad47']];
  const Q={cat:[1.8,-0.9],kitten:[1.3,-0.2],puppy:[-0.2,1.7],truck:[-0.9,-0.7]};const get=segs(root,'q',()=>draw());
  function draw(){const q=get(),qv=Q[q];const sc=keys.map(k=>qv[0]*k[1][0]+qv[1]*k[1][1]);const a=softmax(sc);initSvg(svg,600,310);
    T(svg,20,30,'query','lab','start');box(svg,80,10,100,32,'"'+q+'"','#fbe5d6',{cls:'lab'});
    const ex=keys.some(k=>k[0]===q);T(svg,215,30,'Python dict:','lab','start');box(svg,320,10,270,32,ex?'d["'+q+'"]  →  v'+(keys.findIndex(k=>k[0]===q)+1):'d["'+q+'"]  →  KeyError',ex?'#e2f0d9':'#f8cbad',{cls:'lab'});
    T(svg,65,76,'key','lab');T(svg,138,76,'value','lab');T(svg,330,76,'attention weight  α = softmax(q·k)','lab');
    keys.forEach((k,j)=>{const y=92+j*50;box(svg,20,y,90,34,k[0],'#e2f0d9',{cls:'lab'});E('rect',{x:122,y:y,width:34,height:34,fill:k[2],stroke:'#404040'},svg);T(svg,139,y+23,'v'+(j+1),'lab w');
      T(svg,176,y+22,'q·k = '+f2(sc[j]),'','start');E('rect',{x:270,y:y+4,width:300*a[j],height:26,fill:k[2]},svg);T(svg,274+300*a[j],y+22,f2(a[j]),'lab','start')});
    setR(root,'w',a.map(v=>f2(v)).join(' / '));const rgb=[0,1,2].map(c=>Math.round(keys.reduce((t,k,j)=>t+a[j]*hexRGB(k[2])[c],0)));
    T(svg,20,278,'output','lab','start');E('rect',{x:96,y:256,width:60,height:36,fill:'rgb('+rgb.join(',')+')',stroke:'#404040'},svg);
    T(svg,176,279,'= '+f2(a[0])+'·v₁ + '+f2(a[1])+'·v₂ + '+f2(a[2])+'·v₃   (a blend of the values)','lab','start')}
  draw()};

/* sinusoidal positional encodings as clocks of different speed */
FIG['posenc-waves']=root=>{const svg=initSvg(svgOf(root),600,200);const d=32,N=50,dims=[0,4,8,12],x0=60,w=450,top=22,lh=38;
  const f=(pos,k)=>Math.sin(pos/Math.pow(10000,k/d)),X=pos=>x0+pos/(N-1)*w;
  dims.forEach((k,r)=>{const y=top+r*lh+lh/2;E('line',{x1:x0,x2:x0+w,y1:y,y2:y,stroke:'#e0e0e0'},svg);T(svg,x0-8,y+5,'dim '+k,'','end');
    let dd='';for(let p=0;p<=N-1;p+=0.5)dd+=(dd?'L':'M')+X(p).toFixed(1)+','+(y-14*f(p,k)).toFixed(1);E('path',{d:dd,fill:'none',stroke:'#4472c4','stroke-width':1.8},svg);
    T(svg,x0+w+8,y+5,'period ≈ '+Math.round(2*Math.PI*Math.pow(10000,k/d)),'','start');
    [[20,'#ed7d31'],[33,'#c00000']].forEach(([p,c])=>E('circle',{cx:X(p),cy:y-14*f(p,k),r:4.5,fill:c},svg))});
  [[20,'#ed7d31'],[33,'#c00000']].forEach(([p,c])=>{E('line',{x1:X(p),x2:X(p),y1:top,y2:top+4*lh,stroke:c,'stroke-dasharray':'4 3'},svg);T(svg,X(p),top-6,'pos '+p,'').style.fill=c});
  T(svg,300,top+4*lh+22,'position 20 → ('+dims.map(k=>f2(f(20,k))).join(', ')+')    position 33 → ('+dims.map(k=>f2(f(33,k))).join(', ')+')','');
  T(svg,300,top+4*lh+42,'the four readings together are a fingerprint of the position','')};

/* GPT-2 end to end: text -> ids -> vectors -> blocks -> logits -> probabilities, with the real shapes */
FIG['gpt-shapes']=root=>{const svg=initSvg(svgOf(root),980,330);const S=GPT2.shape,n=S.ids.length,r=rng(5);
  const mat=(x,y,cols,cs,fn)=>{const M=[];for(let i=0;i<n;i++){const row=[];for(let j=0;j<cols;j++)row.push(fn(i,j));M.push(row)}grid(svg,x,y,M,cs,(i,j,v)=>heat(v),null,{stroke:'#fff'})};
  const title=(x,t,t2)=>{T(svg,x,28,t,'lab');if(t2)T(svg,x,46,t2,'')};
  title(70,'text','');box(svg,10,100,120,70,'The cat sat\non the','#ffe699',{cls:'lab'});
  title(215,'tokens','BPE ids');S.toks.forEach((t,i)=>{box(svg,170,70+i*38,90,30,t.trim()+' · '+S.ids[i],'#e2f0d9',{cls:''})});
  title(380,'embedding lookup','one row per token');mat(325,66,8,14,()=>randn(r)*0.6);T(svg,380,66+n*14+22,'[5 × 768]','lab');
  T(svg,470,106,'+ position','','middle');T(svg,470,122,'embedding','','middle');
  title(590,'12 transformer blocks','attention + MLP');box(svg,520,60,140,180,'× 12\n\nattention\n+ MLP\n+ residuals','#dae3f3',{cls:'lab'});T(svg,590,262,'the shape never changes:','');T(svg,590,280,'[5 × 768] in, [5 × 768] out','lab');
  title(770,'logits','row · Eᵀ');mat(710,66,12,12,()=>randn(r)*0.7);E('rect',{x:708,y:66+(n-1)*14.4-1,width:150,height:16,fill:'none',stroke:'#c00000','stroke-width':2.5},svg);
  T(svg,770,66+n*14+22,'[5 × 50,257]','lab');T(svg,770,66+n*14+42,'only the last row is used','');
  title(910,'next-token','probabilities');S.top.slice(0,5).forEach(([w,p],k)=>{const y=70+k*34;T(svg,910,y+13,w.trim(),'lab','end');E('rect',{x:914,y:y,width:Math.max(2,p*520),height:20,fill:k===0?'#c00000':'#4472c4'},svg);T(svg,918+p*520,y+14,f3(p).replace('0.','.'),'','start')});
  T(svg,974,262,'softmax of the last row: 50,257 numbers','','end');T(svg,974,280,'that sum to 1; the top 5 are shown','','end');
  [[132,168],[262,322],[500,518],[662,706],[858,866]].forEach(([a,b])=>arrowPx(svg,a,135,b,135,'ln thin sk','fk'));
  T(svg,490,318,'GPT-2 small: 124,439,808 parameters; every number on this slide comes from running the real model on "The cat sat on the"','','middle')};

/* the KV cache: what is recomputed at every generation step */
FIG['kv-cache']=root=>{const svg=svgOf(root);const toks=['Can','you','please','come','here'];
  stepper(root,s0=>{const t=Math.max(1,s0);initSvg(svg,980,330);
    [['Without a cache','recompute K and V of every previous token',20,false],['With a KV cache','compute K and V of the new token only; read the rest from memory',510,true]].forEach(([ttl,sub,x0,cache])=>{
      T(svg,x0+225,24,ttl,'lab big');T(svg,x0+225,46,sub,'');
      toks.forEach((w,j)=>{const x=x0+j*92;const active=j<t,fresh=j===t-1;const col=!active?'#f2f2f2':(cache&&!fresh?'#dae3f3':'#f8cbad');
        box(svg,x,66,76,28,w,active?'#e2f0d9':'#fafafa',{cls:'lab'});['K','V'].forEach((kv,m)=>{E('rect',{x:x+6+m*34,y:108,width:30,height:30,fill:col,stroke:active?'#404040':'#d0d0d0'},svg);T(svg,x+21+m*34,128,kv,active?'lab':'')});
        if(active){E('line',{x1:x0+(t-1)*92+38,y1:190,x2:x+38,y2:142,stroke:'#c00000','stroke-width':1.2},svg)}});
      box(svg,x0+(t-1)*92+4,190,68,28,'q'+t,'#fbe5d6',{cls:'lab'});T(svg,x0+225,250,'K, V computed at this step: '+(cache?1:t),'lab');
      T(svg,x0+225,274,'in total so far: '+(cache?t:t*(t+1)/2)+' (after '+t+' token'+(t>1?'s':'')+')','');
      T(svg,x0+225,298,cache?'cost grows linearly with the answer length':'cost grows with the square of the length','')});
    T(svg,490,322,'orange = computed now, blue = read from the cache, grey = not generated yet; red lines: the new query reads every key and value','','middle')})};

/* surprisal of each token for GPT-2, in bits (the real numbers of Lab 14) */
FIG['surprisal']=root=>{const svg=initSvg(svgOf(root),980,330);const toks=GPT2.tokens,bits=GPT2.bits,n=toks.length,x0=60,w=900,bw=w/n,y0=250,sc=9.6;
  [0,5,10,15].forEach(v=>{E('line',{x1:x0,x2:x0+w,y1:y0-v*sc,y2:y0-v*sc,stroke:v?'#ececec':'#595959'},svg);T(svg,x0-8,y0-v*sc+5,String(v),'','end')});T(svg,12,150,'bits','lab','start').setAttribute('transform','rotate(-90 12 150)');
  bits.forEach((b,i)=>{const x=x0+i*bw;E('rect',{x:x+6,y:y0-b*sc,width:bw-12,height:b*sc,fill:b>10?'#c00000':'#4472c4'},svg);T(svg,x+bw/2,y0-b*sc-6,String(Math.round(b*10)/10),'');
    const t=T(svg,x+bw/2,y0+16,toks[i].replace(' ','␣'),'');t.setAttribute('transform','rotate(40 '+(x+bw/2-10)+' '+(y0+14)+')');t.setAttribute('text-anchor','start')});
  const mean=bits.reduce((a,b)=>a+b,0)/n;E('line',{x1:x0,x2:x0+w,y1:y0-mean*sc,y2:y0-mean*sc,stroke:'#ed7d31','stroke-width':2,'stroke-dasharray':'6 4'},svg);T(svg,x0+8,30,'- - -  average '+mean.toFixed(1)+' bits  →  perplexity 2^'+mean.toFixed(1)+' ≈ '+GPT2.sentPPL.toFixed(0),'lab','start').style.fill='#c55a11';
  const e=n-2,tp=GPT2.top[e];T(svg,x0+e*bw-6,36,'GPT-2 expected "'+tp.slice(0,3).map(a=>a[0].trim()).join('", "')+'"… (≈5 % each)','','end');T(svg,x0+e*bw-6,54,'"elephant" got about 1 chance in '+Math.round(Math.pow(2,bits[e])/1e4)*10+',000','','end');
  T(svg,490,322,'surprisal = −log₂ p(token | previous tokens); "I went to the bakery this morning and bought a fresh loaf of bread and a large elephant."','','middle')};

/* ===================== additions (2026-10, step-by-step pass) ===================== */
const {TT}=window.MLNN;
const mnus=v=>String(v).replace('-','−');

/* where q, k, v come from: one token times three learned matrices. The numbers are those of 'attn-num':
   x(I) = (0, 1, 1), x(love) = (2, 0, 2), x(pizza) = (1, 1, 1) give exactly its keys and values, and q(pizza) = (2, 1). */
FIG['qkv-token']=root=>{const svg=initSvg(svgOf(root),640,372);const cs=34,mc=26,mw=36,mx=278;const x=[1,1,1];
  const M=[['Q','#fbe5d6',[[1,0],[0,1],[1,0]],'query q','what "pizza" looks for'],['K','#dae3f3',[[0,1],[1,0.5],[0,-0.5]],'key k','what "pizza" offers'],['V','#fff2cc',[[-0.5,0.5],[0.5,0],[0.5,0]],'value v','what "pizza" passes on']];
  T(svg,48,156,'token','');box(svg,10,166,76,34,'pizza','#e2f0d9');
  x.forEach((v,i)=>{E('rect',{x:100+i*cs,y:166,width:cs,height:cs,fill:'#c5e0b4',stroke:'#404040'},svg);T(svg,100+i*cs+cs/2,166+cs/2+6,mnus(v),'lab')});
  T(svg,100+1.5*cs,222,'embedding x','lab');T(svg,100+1.5*cs,240,'(here d = 3 numbers)','');
  M.forEach(([n,c,W,lab,role],r)=>{const y0=12+r*118;const res=[0,1].map(j=>x.reduce((s,xi,i)=>s+xi*W[i][j],0));
    arrowPx(svg,206,183,mx-30,y0+39,'ln thin sk','fk');T(svg,mx-14,y0+45,'×','lab big');
    W.forEach((row,i)=>row.forEach((v,j)=>{E('rect',{x:mx+j*mw,y:y0+i*mc,width:mw,height:mc,fill:c,stroke:'#404040'},svg);T(svg,mx+j*mw+mw/2,y0+i*mc+mc/2+5,mnus(v),'')}));
    TT(svg,mx+mw,y0+3*mc+18,'W_'+n+'  (3 × 2, learned)','');
    T(svg,mx+2*mw+18,y0+45,'=','lab big');
    res.forEach((v,j)=>{E('rect',{x:mx+2*mw+34+j*46,y:y0+mc,width:46,height:mc,fill:c,stroke:'#404040','stroke-width':1.6},svg);T(svg,mx+2*mw+34+j*46+23,y0+mc+mc/2+5,mnus(v),'lab')});
    T(svg,mx+2*mw+34+46,y0+mc-8,lab,'lab');T(svg,mx+2*mw+136,y0+mc+18,role,'','start')});
  T(svg,320,362,'x · W is a weighted sum of the rows of W (here x = (1, 1, 1): the plain sum). The same three matrices serve every token.','','middle')};

/* attention ignores word order: the same output vectors, shuffled; adding positions breaks the tie */
FIG['perm']=root=>{const svg=svgOf(root);const get=segs(root,'p',()=>draw());const r=rng(21),d=4;
  const words=['dog','bites','man'],col={dog:'#f8cbad',bites:'#e7e6e6',man:'#b4c7e7'};const emb={};words.forEach(w=>emb[w]=[...Array(d)].map(()=>randn(r)));
  const W=()=>[...Array(d)].map(()=>[...Array(d)].map(()=>randn(r)*0.7));const WQ=W(),WK=W(),WV=W();
  const mul=(v,M)=>M[0].map((_,j)=>v.reduce((s,vi,i)=>s+vi*M[i][j],0));const pe=p=>[Math.sin(p),Math.cos(p),Math.sin(p/3),Math.cos(p/3)];
  const attend=(S,pos)=>{const X=S.map((w,p)=>emb[w].map((v,i)=>v+(pos?1.2*pe(p)[i]:0)));const Q=X.map(v=>mul(v,WQ)),K=X.map(v=>mul(v,WK)),V=X.map(v=>mul(v,WV));
    return Q.map(qv=>{const a=softmax(K.map(k=>qv.reduce((t,qi,i)=>t+qi*k[i],0)/2));return V[0].map((_,j)=>a.reduce((t,aj,m)=>t+aj*V[m][j],0))})};
  function draw(){const on=get()==='on';initSvg(svg,640,290);const A=['dog','bites','man'],B=['man','bites','dog'],ZA=attend(A,on),ZB=attend(B,on);
    const mx=Math.max(...ZA.flat().concat(ZB.flat()).map(Math.abs));
    [[A,ZA,6,'"dog bites man"'],[B,ZB,332,'"man bites dog"']].forEach(([S,Z,x0,ttl])=>{T(svg,x0+150,20,ttl,'lab big');
      S.forEach((w,p)=>{const xx=x0+10+p*100;box(svg,xx,32,80,30,w,col[w]);if(on)T(svg,xx+40,82,'+ position '+(p+1),'').style.fill='#c55a11';arrowPx(svg,xx+40,on?88:64,xx+40,114,'ln thin sk','fk')});
      box(svg,x0+10,116,280,32,'self-attention (same weights)','#dae3f3',{cls:''});
      S.forEach((w,p)=>{const xx=x0+10+p*100;arrowPx(svg,xx+40,150,xx+40,172,'ln thin sk','fk');Z[p].forEach((v,i)=>E('rect',{x:xx+i*20,y:176,width:20,height:28,fill:heat(v/mx),stroke:w==='dog'?'#c00000':'#fff','stroke-width':w==='dog'?1.5:1},svg));T(svg,xx+40,222,'new "'+w+'"','')})});
    const dz=Math.hypot(...ZA[0].map((v,i)=>v-ZB[2][i]));
    T(svg,320,258,on?'with positions the two "dog" vectors differ: the order is visible':'without positions "dog" gets exactly the same vector in both sentences','lab');
    T(svg,320,280,on?'(the same word at a different position is a different input)':'(and so does every other word: who bit whom is lost)','');setR(root,'d',f2(dz))}
  draw()};

/* one transformer block (pre-norm): communicate, then think, each with a residual */
FIG['block-one']=root=>{const svg=initSvg(svgOf(root),940,330);const y=128,h=56;
  const bx=(x,w,t,c)=>box(svg,x,y-h/2,w,h,t,c,{cls:'lab'});const plus=x=>{E('circle',{cx:x,cy:y,r:15,fill:'#fff',stroke:'#404040','stroke-width':1.6},svg);T(svg,x,y+7,'+','lab big')};
  T(svg,30,y+6,'X','lab big');T(svg,30,y+34,'n × d','');
  arrowPx(svg,48,y,88,y,'ln thin sk','fk');bx(90,96,'LayerNorm','#f2f2f2');arrowPx(svg,188,y,218,y,'ln thin sk','fk');bx(220,170,'Multi-head\nattention','#ffe699');
  arrowPx(svg,392,y,428,y,'ln thin sk','fk');plus(444);arrowPx(svg,460,y,488,y,'ln thin sk','fk');bx(490,96,'LayerNorm','#f2f2f2');arrowPx(svg,588,y,618,y,'ln thin sk','fk');
  bx(620,150,'MLP\nd → 4d → d','#b4c7e7');arrowPx(svg,772,y,808,y,'ln thin sk','fk');plus(824);arrowPx(svg,840,y,868,y,'ln thin sk','fk');T(svg,900,y+6,'out','lab big');T(svg,900,y+34,'n × d','');
  [[66,444,'residual: X + attention(LN(X))'],[474,824,'residual: X + MLP(LN(X))']].forEach(([a,b,t])=>{E('path',{d:'M'+a+','+y+' L'+a+',44 L'+b+',44 L'+b+','+(y-17),fill:'none',stroke:'#7f7f7f','stroke-width':1.6},svg);
    arrowPx(svg,b,52,b,y-16,'ln thin sm','fm');T(svg,(a+b)/2,36,t,'')});
  const dots=(x0,yy)=>[0,1,2,3].map(i=>[x0+i*40,yy]);
  const A=dots(245,262);for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const [x1]=A[i],[x2]=A[j];E('path',{d:'M'+x1+',252 Q'+((x1+x2)/2)+','+(252-(x2-x1)*0.45)+' '+x2+',252',fill:'none',stroke:'#bf9000','stroke-width':1.3},svg)}
  A.forEach(([x,yy])=>E('circle',{cx:x,cy:yy,r:9,fill:'#ffe699',stroke:'#404040'},svg));T(svg,305,292,'communicate: every token','lab');T(svg,305,310,'reads from the others','lab');
  const B=dots(635,262);B.forEach(([x,yy])=>{E('rect',{x:x-11,y:210,width:22,height:18,rx:3,fill:'#b4c7e7',stroke:'#404040'},svg);arrowPx(svg,x,230,x,250,'ln thin sk','fk');E('circle',{cx:x,cy:yy,r:9,fill:'#b4c7e7',stroke:'#404040'},svg)});
  T(svg,695,292,'think: each token alone,','lab');T(svg,695,310,'the same MLP for all','lab');
  [[305,y+h/2+4,305,200],[695,y+h/2+4,695,204]].forEach(([a,b,c,dd])=>E('line',{x1:a,y1:b,x2:c,y2:dd,stroke:'#bfbfbf','stroke-width':1.2,'stroke-dasharray':'4 3'},svg))};

/* ===================== chapter rework (2026-10-12): attention in matrices, multi-head, encoder-decoder, BERT, GPT, ViT ===================== */
const nm=v=>String(Math.round(v*100)/100).replace('-','−');
const mmul=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)));
const mxAbs=M=>Math.max(...M.flat().map(Math.abs));
const tint=(hex,t)=>{const c=hexRGB(hex);t=Math.max(0,Math.min(1,t));return 'rgb('+c.map(v=>Math.round(255-(255-v)*t)).join(',')+')'};
/* a stepper when the widget has a step slider; a bare <svg> (the notes) gets the last step */
const steps=(root,last,draw)=>root.querySelector('input[data-k="s"]')?stepper(root,draw):draw(last);
/* a vector drawn as a strip of coloured cells (orange = positive, blue = negative) */
const strip=(g,x,y,v,cw,ch,mx)=>v.forEach((a,i)=>E('rect',{x:x+i*cw,y:y,width:cw,height:ch,fill:heat(a/mx),stroke:'#fff','stroke-width':0.6},g));
/* toy token vectors (the same word gets the same embedding, plus a position term) and a toy 2-layer attention, for the colours */
const toyVecs=(toks,seed)=>{const r=rng(seed),emb={};return toks.map((w,k)=>{if(!emb[w])emb[w]=[...Array(8)].map(()=>randn(r));return emb[w].map((v,i)=>v+0.4*Math.sin((k+1)*(i+1)*0.7))})};
const att=(X,i,causal)=>softmax(X.map((k,j)=>causal&&j>i?-1e9:X[i].reduce((s,v,d)=>s+v*k[d],0)/Math.sqrt(8)));
const toyAttend=(X,causal)=>{let H=X;for(let l=0;l<2;l++){const A=H.map((_,i)=>att(H,i,causal));H=H.map((x,i)=>x.map((v,d)=>0.4*v+0.6*A[i].reduce((s,a,j)=>s+a*H[j][d],0)))}return H};
/* an arc between two positions on the bottom line of a band; width = attention weight */
const arc=(g,x1,x2,yb,w,col)=>{const h=Math.min(40,12+Math.abs(x2-x1)*0.1);E('path',{d:'M'+x1+','+yb+' Q'+((x1+x2)/2)+','+(yb-2*h)+' '+x2+','+yb,fill:'none',stroke:col,'stroke-width':w,'stroke-linecap':'round','stroke-opacity':0.8},g)};
const HC12=['#4472c4','#ed7d31','#70ad47','#ffc000','#5b9bd5','#a5a5a5','#c00000','#7030a0','#00b0f0','#92d050','#ff66cc','#996633'];

/* self-attention in matrices, step by step: the I / love / pizza example of slides 8-9 (same x, W_Q, W_K, W_V), all tokens at once */
FIG['qkv']=root=>{const svg=svgOf(root);const toks=['I','love','pizza'];
  const X=[[0,1,1],[2,0,2],[1,1,1]],WQ=[[1,0],[0,1],[1,0]],WK=[[0,1],[1,0.5],[0,-0.5]],WV=[[-0.5,0.5],[0.5,0],[0.5,0]];
  const Q=mmul(X,WQ),K=mmul(X,WK),V=mmul(X,WV),KT=[0,1].map(j=>K.map(r=>r[j]));
  const S=mmul(Q,KT).map(r=>r.map(v=>v/Math.SQRT2)),A=S.map(r=>softmax(r)),Z=mmul(A,V);
  const c=34,y0=148,R='#c00000',xX=72,xQ=228,xS=330,xA=494,xZ=650,yK=y0-2*c-14,yV=y0-3*c-14;
  const mat=(x,y,M,fill,o)=>grid(svg,x,y,M,c,fill,(i,j,v)=>nm(v),Object.assign({stroke:'#8c8c8c'},o||{}));
  const one=col=>()=>col;
  const hi=(x,y,w,h)=>E('rect',{x:x-1.5,y:y-1.5,width:w+3,height:h+3,fill:'none',stroke:R,'stroke-width':3,rx:2},svg);
  const under=(x,a,b)=>{TT(svg,x,y0+3*c+20,a,'lab');if(b)T(svg,x,y0+3*c+38,b,'')};
  const caps=['the sentence as a matrix X: one row per token, d = 3 numbers each',
    'three matrix products give every token its query, key and value (the W_Q, W_K, W_V of slide 9)',
    'S = QKᵀ/√2: entry (pizza, I) = q_pizza · k_I / √2 = (2·1 + 1·0) / √2 = 1.41. Every token against every token',
    'softmax of each row: weights that sum to 1. "love" looks at "I" and at "pizza" (0.49 each), hardly at itself',
    'Z = AV: row i is a weighted average of the rows of V. The red row is slide 8: (0.57, 0.43)',
    'the same weights as a picture: every new vector reads from every token; line width = weight'];
  steps(root,5,s=>{initSvg(svg,1000,324);
    toks.forEach((t,i)=>box(svg,4,y0+i*c+4,60,c-8,t,'#e2f0d9'));
    mat(xX,y0,X,one('#e2f0d9'));T(svg,xX+1.5*c,y0-10,'X','lab');under(xX+1.5*c,'n × d = 3 × 3');
    if(s>=1){arrowPx(svg,xX+3*c+6,y0+1.5*c,xQ-6,y0+1.5*c,'ln thin sk','fk');TT(svg,(xX+3*c+xQ)/2,y0+1.5*c-8,'·W_Q','');
      mat(xQ,y0,Q,one('#fbe5d6'));TT(svg,xQ+c,y0-10,'Q = XW_Q','lab');
      mat(xS,yK,KT,one('#dae3f3'));TT(svg,xS+1.5*c,yK-10,'Kᵀ = (XW_K)ᵀ','lab');
      mat(xZ,yV,V,one('#fff2cc'));TT(svg,xZ+c,yV-10,'V = XW_V','lab')}
    if(s>=2){mat(xS,y0,S,one('#ededed'));under(xS+1.5*c,'S = QKᵀ / √2','scores, n × n')}
    if(s>=3){const xm=(xS+3*c+xA)/2;arrowPx(svg,xS+3*c+8,y0+1.5*c,xA-8,y0+1.5*c,'ln thin sk','fk');T(svg,xm,y0+1.5*c-10,'softmax','');T(svg,xm,y0+1.5*c+24,'each row','');
      mat(xA,y0,A,(i,j,v)=>heat(v*1.3,true),{tcol:(i,j,v)=>v>0.4?'#fff':'#1f1f1f'});under(xA+1.5*c,'A: weights','each row sums to 1')}
    if(s>=4){mat(xZ,y0,Z,one('#c5e0b4'));under(xZ+c,'Z = AV','new vectors')}
    if(s===2){hi(xQ,y0+2*c,2*c,c);hi(xS,yK,c,2*c);hi(xS,y0+2*c,c,c)}
    if(s===3)hi(xA,y0+2*c,3*c,c);
    if(s>=4){hi(xA,y0+2*c,3*c,c);hi(xZ,y0+2*c,2*c,c)}
    if(s>=5){const xs=[812,884,956],yt=y0-96,yb=y0+76;T(svg,884,yt-10,'new vectors (rows of Z)','lab');T(svg,884,yb+44,'values (rows of V)','lab');
      [0,1,2].forEach(i=>[0,1,2].forEach(j=>{if(i===2)return;E('line',{x1:xs[j],y1:yb,x2:xs[i],y2:yt+26,stroke:'#7f7f7f','stroke-width':1+14*A[i][j],'stroke-opacity':0.3},svg)}));
      [0,1,2].forEach(j=>{E('line',{x1:xs[j],y1:yb,x2:xs[2],y2:yt+26,stroke:R,'stroke-width':1+14*A[2][j],'stroke-opacity':0.85},svg);
        const t=T(svg,xs[j]+(xs[2]-xs[j])*0.22,yb-(yb-yt-26)*0.22+5,f2(A[2][j]),'lab');t.setAttribute('style','fill:'+R+';paint-order:stroke;stroke:#fff;stroke-width:4px')});
      toks.forEach((t,i)=>{box(svg,xs[i]-31,yt,62,26,t,'#c5e0b4');box(svg,xs[i]-31,yb,62,26,t,'#fff2cc')})}
    T(svg,500,318,caps[s],'','middle')})};

/* multi-head attention, step by step: three small heads with their own projections and patterns, concatenated and mixed by W_O */
FIG['mha-lanes']=root=>{const svg=svgOf(root);const toks=['the','cat','sat','on','the','mat'],n=6,HC=['#4472c4','#ed7d31','#70ad47'];
  const r=rng(11),rnd=(a,b)=>[...Array(a)].map(()=>[...Array(b)].map(()=>randn(r)));
  const X=rnd(n,6),W=[0,1,2].map(()=>[rnd(6,2),rnd(6,2),rnd(6,2)]),WO=rnd(6,6);
  const norm=M=>M.map(row=>{const t=row.reduce((a,b)=>a+b,0);return row.map(v=>v/t)}),u=[1,1,1,1,1,1];
  /* hand-drawn patterns (rows = queries, columns = keys) */
  const P=[norm(toks.map((_,i)=>toks.map((_,j)=>j===Math.max(0,i-1)?1:0.03))),
    norm([[.55,.15,.15,.05,.05,.05],[.05,.15,.7,.04,.03,.03],[.03,.8,.1,.03,.02,.02],[.05,.1,.15,.5,.1,.1],[.05,.05,.05,.1,.6,.15],[.05,.1,.15,.1,.1,.5]]),
    norm([[.03,.8,.07,.03,.03,.04],u,u,u,[.02,.03,.05,.07,.03,.8],u])];
  const names=['previous word','subject ↔ verb (cat ↔ sat)','"the" → its noun (it looks ahead)'];
  const QKV=W.map(w=>w.map(m=>mmul(X,m))),Zh=QKV.map((h,k)=>mmul(P[k],h[2])),Zc=X.map((_,i)=>[].concat(...Zh.map(z=>z[i]))),O=mmul(Zc,WO);
  const hm=(x,y,M,cs)=>{const m=mxAbs(M);grid(svg,x,y,M,cs,(i,j,v)=>heat(v/m),null,{stroke:'#fff',sw:0.8})};
  const frame=(x,y,w,h,col)=>E('rect',{x:x,y:y,width:w,height:h,fill:'none',stroke:col,'stroke-width':1.5},svg);
  const small=(x,y,t,anchor)=>{const tt=T(svg,x,y,t,'',anchor);tt.style.fontSize='11px';return tt};
  const lane=k=>4+k*110,mid=k=>lane(k)+67,yX=133,xA=300,cA=14;
  const caps=['the sentence as a matrix X: 6 tokens × d = 6 numbers (toy sizes)',
    'each head has its own small W_Q, W_K, W_V (d × d_k = 6 × 2), so its own queries, keys and values',
    'each head computes its own attention matrix: three different patterns over the same six words',
    'each head outputs Z_i = A_i V_i: one small vector (d_k = 2) per token',
    'concatenate the three outputs (6 × 6) and mix them with W_O: the result has the shape of X'];
  steps(root,4,s=>{initSvg(svg,880,372);
    toks.forEach((t,i)=>T(svg,30,yX+i*16+12,t,'','end'));hm(34,yX,X,16);T(svg,82,yX-10,'X','lab');T(svg,82,yX+6*16+18,'6 × 6','');
    if(s>=1){[0,1,2].forEach(k=>{const y0=lane(k);E('line',{x1:132,y1:yX+48,x2:186,y2:mid(k),stroke:HC[k],'stroke-width':1.6},svg);
      T(svg,190,y0+14,'head '+(k+1)+(s>=2?':  '+names[k]:''),'lab','start').style.fill=HC[k];
      QKV[k].forEach((M,m)=>{hm(190+m*28,y0+34,M,11);frame(190+m*28,y0+34,22,66,HC[k]);TT(svg,201+m*28,y0+30,['Q','K','V'][m]+'_'+(k+1),'')})});
      [['GPT-2 small:',1],['d = 768',0],['12 heads',0],['d_k = 64 each',0]].forEach(([t,b],i)=>TT(svg,820,yX+12+i*20,t,b?'lab':''))}
    if(s>=2)[0,1,2].forEach(k=>{const y0=lane(k);grid(svg,xA,y0+25,P[k],cA,(i,j,v)=>tint(HC[k],v*1.4),null,{stroke:'#fff',sw:0.6});frame(xA,y0+25,6*cA,6*cA,HC[k]);
      toks.forEach((t,i)=>{small(xA-4,y0+25+i*cA+11,t,'end');if(k===2){const x=xA+i*cA+cA/2+3,y=y0+25+6*cA+6;small(x,y,t,'end').setAttribute('transform','rotate(-55 '+x+' '+y+')')}})});
    if(s>=3)[0,1,2].forEach(k=>{const y0=lane(k);arrowPx(svg,xA+6*cA+4,mid(k),420,mid(k),'ln thin sm','fm');TT(svg,(xA+6*cA+420)/2+2,mid(k)-8,'·V_'+(k+1),'');
      hm(424,y0+34,Zh[k],11);frame(424,y0+34,22,66,HC[k]);TT(svg,435,y0+30,'Z_'+(k+1),'')});
    if(s>=4){[0,1,2].forEach(k=>{E('line',{x1:448,y1:mid(k),x2:480+k*32+16,y2:yX-9,stroke:HC[k],'stroke-width':1.6},svg);E('rect',{x:480+k*32,y:yX-8,width:32,height:6,fill:HC[k]},svg)});
      hm(480,yX,Zc,16);T(svg,528,yX+6*16+18,'concat: 6 × 6','');
      arrowPx(svg,580,yX+48,630,yX+48,'ln thin sk','fk');TT(svg,605,yX+40,'·W_O','');
      hm(636,yX,O,16);T(svg,684,yX-10,'output','lab');T(svg,684,yX+6*16+18,'6 × 6, like X','')}
    T(svg,440,366,caps[s],'','middle')})};

/* multi-head attention in practice: one big projection, cut into 12 slices of 64 columns (GPT-2 small) */
FIG['mha-split']=root=>{const svg=initSvg(svgOf(root),1000,276);const H=12,y=84,h=120,o=52;
  const lab=(x,a,b)=>{TT(svg,x+o,y+h+24,a,'lab');if(b)T(svg,x+o,y+h+42,b,'')};
  const arr=(x1,x2,t1,t2)=>{arrowPx(svg,x1+o,y+h/2,x2+o,y+h/2,'ln thin sk','fk');TT(svg,(x1+x2)/2+o,y+h/2-(t2?28:10),t1,'');if(t2)TT(svg,(x1+x2)/2+o,y+h/2-10,t2,'')};
  const striped=(x,w)=>{for(let k=0;k<H;k++)E('rect',{x:x+o+k*w/H,y:y,width:w/H,height:h,fill:HC12[k],'fill-opacity':0.55,stroke:'#fff','stroke-width':0.8},svg);E('rect',{x:x+o,y:y,width:w,height:h,fill:'none',stroke:'#404040'},svg)};
  const stack=(x,w,front)=>{for(let k=H-1;k>=0;k--){const xx=x+o+k*4,yy=y-k*4;E('rect',{x:xx,y:yy,width:w,height:h,fill:'#fff',stroke:HC12[k],'stroke-width':1.2},svg);E('rect',{x:xx,y:yy,width:w,height:h,fill:HC12[k],'fill-opacity':0.3},svg);if(k===0&&front)front(xx,yy)}};
  const solid=(x,w,fill,t)=>{E('rect',{x:x+o,y:y,width:w,height:h,fill:fill,stroke:'#404040'},svg);T(svg,x+o+w/2,y+h/2+7,t,'lab big')};
  solid(0,50,'#e2f0d9','X');lab(25,'X','n × 768');
  arr(54,118,'·W_Q');T(svg,86+o,y+h/2+20,'768 × 768','');
  striped(122,96);lab(170,'Q = XW_Q','n × 768 (K, V too)');
  arr(222,262,'cut');
  stack(266,14);lab(298,'12 slices Q_i','12 × n × 64');
  arr(330,370,'softmax','(Q_iK_iᵀ/8)');
  stack(374,120,(xx,yy)=>{const m=10,cc=h/m;for(let i=0;i<m;i++)for(let j=0;j<=i;j++)E('rect',{x:xx+j*cc,y:yy+i*cc,width:cc,height:cc,fill:tint(HC12[0],j===i?0.9:j===i-1?0.6:0.25),stroke:'#fff','stroke-width':0.5},svg)});lab(456,'12 attention matrices','12 × n × n');
  arr(542,582,'·V_i');
  stack(586,14);lab(616,'12 outputs','12 × n × 64');
  arr(648,688,'concat');
  striped(692,96);lab(740,'concatenated','n × 768');
  arr(792,832,'·W_O');
  solid(836,50,'#c5e0b4','Z');lab(861,'output','n × 768');
  T(svg,500,270,'each head reads only its own 64 columns of Q, K and V: 12 × 64 = 768, the same size and cost as one head of 768','','middle')};

/* the original transformer (2017) on a translation example: encoder, decoder, cross-attention */
FIG['block']=root=>{const svg=initSvg(svgOf(root),640,452);
  const sub=(x,y,w,t,c,o)=>box(svg,x,y,w,26,t,c,Object.assign({cls:''},o||{}));
  const row=(cx,y,ws,fill)=>ws.forEach((w,k)=>box(svg,cx-94+k*64,y,60,24,w,fill,{cls:''}));
  const up=(x,y1,y2)=>arrowPx(svg,x,y1,x,y2,'ln thin sk','fk');
  /* encoder */
  row(150,404,['the','black','cat'],'#e2f0d9');T(svg,150,446,'source sentence','');
  up(150,402,388);sub(55,360,190,'embedding + position','#e2f0d9');up(150,358,342);
  E('rect',{x:45,y:200,width:210,height:140,rx:12,fill:'#f2f2f2',stroke:'#7f7f7f'},svg);T(svg,38,276,'N×','lab','end');
  sub(55,304,190,'Self-attention (both sides)','#ffe699');sub(55,272,190,'Add & Norm','#f8cbad');sub(55,240,190,'MLP','#b4c7e7');sub(55,208,190,'Add & Norm','#f8cbad');
  up(150,198,182);const r=rng(3);for(let k=0;k<3;k++)strip(svg,150-94+k*64+3,160,[...Array(6)].map(()=>randn(r)),9,16,2);
  T(svg,150,150,'one vector per source word','');T(svg,150,118,'Encoder','lab big');
  /* decoder */
  row(470,404,['<s>','el','gato'],'#fbe5d6');T(svg,470,446,'translation so far (shifted right)','');
  up(470,402,388);sub(375,360,190,'embedding + position','#fbe5d6');up(470,358,342);
  E('rect',{x:365,y:136,width:210,height:204,rx:12,fill:'#f2f2f2',stroke:'#7f7f7f'},svg);T(svg,584,244,'×N','lab','start');
  sub(375,304,190,'Masked self-attention','#ffe699');sub(375,272,190,'Add & Norm','#f8cbad');sub(375,240,190,'Cross-attention','#ffe699',{stroke:'#c00000',sw:2});
  sub(375,208,190,'Add & Norm','#f8cbad');sub(375,176,190,'MLP','#b4c7e7');sub(375,144,190,'Add & Norm','#f8cbad');
  up(470,134,114);sub(395,86,150,'Linear + softmax','#dae3f3');up(470,84,66);
  row(470,38,['el','gato','negro'],'#c5e0b4');T(svg,470,24,'next words: one per position','');T(svg,584,160,'Decoder','lab big','start');
  /* cross-attention: keys and values from the encoder, queries from the decoder */
  E('path',{d:'M246,168 C320,168 300,253 360,253',fill:'none',stroke:'#c00000','stroke-width':2.2},svg);arrowPx(svg,352,253,373,253,'ln thin sr','fr');
  [['keys and values',134],['from the encoder',150]].forEach(([t,yy])=>{const tt=T(svg,306,yy,t,'','middle');tt.style.fill='#c00000'})};

/* attention masks with the words: BERT sees both sides, GPT only the past */
FIG['bert-gpt']=root=>{const svg=initSvg(svgOf(root),1000,256);const toks=['the','cat','sat','on','the','mat'],n=6,cs=28;
  [[170,'BERT (encoder): every token sees every token',()=>true,'#4472c4','fill in a hidden word: from both sides'],
   [670,'GPT (decoder): each token sees only the past',(i,j)=>j<=i,'#ed7d31','predict the next word: from the left only']].forEach(([x0,ttl,ok,col,sub])=>{
    T(svg,x0+n*cs/2,18,ttl,'lab');
    toks.forEach((t,j)=>{const x=x0+j*cs+cs/2,tt=T(svg,x,54,t,'','start');tt.setAttribute('transform','rotate(-50 '+x+' 54)')});
    toks.forEach((t,i)=>T(svg,x0-6,60+i*cs+cs/2+5,t,'','end'));
    for(let i=0;i<n;i++)for(let j=0;j<n;j++)E('rect',{x:x0+j*cs,y:60+i*cs,width:cs-2,height:cs-2,fill:ok(i,j)?col:'#f2f2f2'},svg);
    T(svg,x0+n*cs/2,60+n*cs+22,sub,'')});
  [['row = the token that reads',112],['column = the token it reads from',134],['coloured = allowed',166],['grey = masked: weight 0',188]].forEach(([t,yy])=>T(svg,504,yy,t,'','middle'))};

/* the causal mask, on the words of the GPT example */
FIG['mask']=root=>{const svg=initSvg(svgOf(root),640,262);const n=5,r=rng(9),cs=34,toks=['The','cat','sat','on','the'];const S=[...Array(n)].map(()=>[...Array(n)].map(()=>randn(r)));
  const g3=(x0,title,cell,rows)=>{T(svg,x0+n*cs/2,16,title,'lab');toks.forEach((t,j)=>T(svg,x0+j*cs+cs/2-1,42,t,'').style.fontSize='12px');if(rows)toks.forEach((t,i)=>T(svg,x0-6,50+i*cs+cs/2+4,t,'','end'));
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){const [fill,txt]=cell(i,j);E('rect',{x:x0+j*cs,y:50+i*cs,width:cs-2,height:cs-2,fill:fill},svg);const tt=T(svg,x0+j*cs+cs/2-1,50+i*cs+cs/2+4,txt,'');if(fill==='#595959')tt.style.fill='#fff'}};
  g3(62,'scores QKᵀ/√d',(i,j)=>['#dae3f3',fmt(S[i][j],1)],true);g3(252,'mask: −∞ if j > i',(i,j)=>j>i?['#595959','−∞']:['#dae3f3',fmt(S[i][j],1)]);
  const W=S.map((row,i)=>softmax(row.slice(0,i+1)).concat(new Array(n-i-1).fill(0)));g3(442,'softmax: weights',(i,j)=>j>i?['#f2f2f2','0']:['rgba(237,125,49,'+(0.2+0.8*W[i][j]).toFixed(2)+')',fmt(W[i][j],2)]);
  T(svg,320,248,'Row i = the token that reads. It may only look at tokens 1…i, never at the future.','','middle')};

/* BERT step by step: tokens -> vectors -> encoder blocks (both sides) -> vectors in context -> fill in the blank / classify.
   The [MASK] probabilities are those of bert-base-uncased on "the cat [MASK] on the mat." */
FIG['bert-flow']=root=>{const svg=svgOf(root);const toks=['[CLS]','the','cat','[MASK]','on','the','mat','.','[SEP]'],M=3,cx=k=>184+k*94;
  const X=toyVecs(toks,31),Y=toyAttend(X,false),mx=mxAbs(X),my=mxAbs(Y),w=att(X,M,false),wm=Math.max(...w.filter((_,j)=>j!==M));
  const top=[['sat',0.168],['lay',0.083],['was',0.062]];const fill=t=>t==='[MASK]'?'#fbe5d6':t[0]==='['?'#e7e6e6':'#e2f0d9';
  const caps=['WordPiece tokens: [CLS] starts every input, [SEP] ends it, and one word is hidden behind [MASK]',
    'each token becomes a vector: its embedding plus its position (768 numbers in BERT-base; 8 drawn)',
    '12 encoder blocks, no mask: every token attends to every token, on its left and on its right',
    'out: one vector per token, the same size as in, but now each one depends on the whole sentence',
    'pre-training: the [MASK] vector predicts the hidden word. bert-base-uncased: sat 0.17, lay 0.08, was 0.06',
    'after pre-training, small heads read the vectors: [CLS] → one label for the sentence; the mean → a sentence embedding'];
  steps(root,5,s=>{initSvg(svg,1000,358);const L=(y,a,b)=>{T(svg,6,y,a,'lab','start');if(b)T(svg,6,y+17,b,'','start')};
    L(322,'tokens');toks.forEach((t,k)=>box(svg,cx(k)-40,304,80,26,t,fill(t),{cls:t.length>5?'':'lab'}));
    if(s>=1){L(258,'input vectors','embedding + position');toks.forEach((t,k)=>{arrowPx(svg,cx(k),302,cx(k),278,'ln thin sm','fm');strip(svg,cx(k)-36,258,X[k],9,16,mx)})}
    if(s>=2){E('rect',{x:136,y:166,width:852,height:72,rx:10,fill:'#eef3fb',stroke:'#4472c4'},svg);L(196,'12 encoder blocks','attention + MLP');
      toks.forEach((t,k)=>arrowPx(svg,cx(k),256,cx(k),240,'ln thin sm','fm'));toks.forEach((t,j)=>{if(j!==M)arc(svg,cx(M),cx(j),234,1.2+5*w[j]/wm,'#c00000')});
      T(svg,980,184,'[MASK] reads its left and its right','','end').style.fill='#c00000'}
    if(s>=3){L(128,'output vectors','in context');toks.forEach((t,k)=>{arrowPx(svg,cx(k),164,cx(k),142,'ln thin sm','fm');strip(svg,cx(k)-36,122,Y[k],9,16,my)})}
    if(s>=4){arrowPx(svg,cx(M),120,cx(M),100,'ln thin sk','fk');box(svg,cx(M)-82,74,164,24,'word predictor','#fbe5d6',{cls:''});
      top.forEach(([wd,p],i)=>{const y=6+i*21;T(svg,cx(M)-30,y+13,wd,'lab','end');E('rect',{x:cx(M)-24,y:y,width:p*420,height:15,fill:i?'#4472c4':'#c00000'},svg);T(svg,cx(M)-20+p*420,y+12,f2(p),'','start')})}
    if(s>=5){arrowPx(svg,cx(0),120,cx(0),100,'ln thin sk','fk');box(svg,cx(0)-50,74,100,24,'classifier','#e7e6e6',{cls:''});T(svg,cx(0),44,'one label for','');T(svg,cx(0),62,'the sentence','');
      T(svg,980,44,'or: the mean of all the output vectors','','end');T(svg,980,62,'= a sentence embedding (Part D)','','end')}
    T(svg,500,352,caps[s],'','middle')})};

/* GPT step by step: the prompt -> vectors -> causal blocks -> the last vector predicts the next token -> append, repeat.
   The probabilities are those of GPT-2 small, greedy, from "The cat sat on the". */
FIG['gpt-flow']=root=>{const svg=svgOf(root);const toks=['The','cat','sat','on','the','floor',',','and'],P=5,cx=k=>184+k*98;
  const X=toyVecs(toks,47),Y=toyAttend(X,true),mx=mxAbs(X),my=mxAbs(Y);
  const pred=[[['floor',0.076],['bed',0.065],['couch',0.054]],[[',',0.261],['and',0.122],['of',0.086]],[['and',0.048],['his',0.042],['her',0.037]],[['the',0.128],['he',0.047],['his',0.045]]];
  const caps=['the prompt: 5 GPT-2 tokens, each turned into a vector (embedding + position)',
    '12 decoder blocks with the causal mask: each token reads only itself and the tokens before it',
    'only the last vector is used: ·Eᵀ and a softmax give 50,257 probabilities. Greedy: "floor" (7.6 %)',
    'append "floor" and run again: only the new token is computed, the past comes from the KV cache. Next: ","',
    'append ",": next "and" (4.8 %, just ahead of "his", 4.2 %)',
    '"The cat sat on the floor, and" → "the" (12.8 %) … and so on, until an end token or a length limit'];
  steps(root,5,s=>{initSvg(svg,1000,358);const last=s<3?P-1:P-1+(s-2),fresh=k=>s<3||k===last;
    const L=(y,a,b)=>{T(svg,6,y,a,'lab','start');if(b)T(svg,6,y+17,b,'','start')};
    L(322,'tokens');L(258,'input vectors','embedding + position');
    if(s>=1){E('rect',{x:136,y:166,width:852,height:72,rx:10,fill:'#fdf1e7',stroke:'#ed7d31'},svg);L(196,'12 decoder blocks','causal mask');L(128,'output vectors')}
    for(let k=0;k<=last;k++){const g=E('g',{opacity:fresh(k)?1:0.4},svg);box(g,cx(k)-40,304,80,26,toks[k],k<P?'#e2f0d9':'#fbe5d6',{stroke:s>=3&&k===last?'#c00000':'#404040',sw:s>=3&&k===last?2.5:1});
      arrowPx(g,cx(k),302,cx(k),278,'ln thin sm','fm');strip(g,cx(k)-36,258,X[k],9,16,mx);
      if(s>=1){arrowPx(g,cx(k),256,cx(k),240,'ln thin sm','fm');arrowPx(g,cx(k),164,cx(k),142,'ln thin sm','fm');strip(g,cx(k)-36,122,Y[k],9,16,my)}}
    if(s>=1){const w=att(X.slice(0,last+1),last,true),wm=Math.max(...w.slice(0,last));for(let j=0;j<last;j++)arc(svg,cx(last),cx(j),234,1.2+5*w[j]/wm,'#c00000');
      T(svg,980,184,'"'+toks[last]+'" reads only the past','','end').style.fill='#c00000'}
    if(s>=2){const pr=pred[s-2];E('rect',{x:722,y:4,width:270,height:92,rx:6,fill:'#fff',stroke:'#bfbfbf'},svg);T(svg,857,21,'next token (softmax over 50,257)','');
      pr.forEach(([wd,p],i)=>{const y=30+i*21;T(svg,796,y+13,'"'+wd+'"','lab','end');E('rect',{x:802,y:y,width:p*560,height:15,fill:i?'#4472c4':'#c00000'},svg);T(svg,806+p*560,y+12,f2(p).replace('0.','.'),'','start')});
      arrowPx(svg,cx(last),120,Math.max(740,Math.min(cx(last),960)),99,'ln thin sk','fk')}
    T(svg,500,352,caps[s],'','middle')})};

/* ViT step by step: an image -> patches -> a sequence of vectors -> the encoder -> [CLS] -> the class */
let vitN=0;
FIG['vit']=root=>{const svg=svgOf(root);const id='vit-img-'+(vitN++),Sz=168,p=56,ix=24,iy=8,cx=k=>286+k*74;
  const V=toyVecs(['[CLS]',1,2,3,4,5,6,7,8,9].map(String),5),Y=toyAttend(V,false),mv=mxAbs(V),my=mxAbs(Y),w=att(V,5,false),wm=Math.max(...w.filter((_,j)=>j!==5));
  const cat=g=>{E('rect',{width:Sz,height:Sz,fill:'#cfe2f3'},g);E('rect',{y:140,width:Sz,height:28,fill:'#a9d18e'},g);
    E('polygon',{points:'34,84 44,14 86,52',fill:'#ed7d31',stroke:'#843c0c','stroke-width':2},g);E('polygon',{points:'134,84 124,14 82,52',fill:'#ed7d31',stroke:'#843c0c','stroke-width':2},g);
    E('polygon',{points:'48,64 52,32 72,52',fill:'#f8cbad'},g);E('polygon',{points:'120,64 116,32 96,52',fill:'#f8cbad'},g);
    E('ellipse',{cx:84,cy:102,rx:58,ry:50,fill:'#ed7d31',stroke:'#843c0c','stroke-width':2},g);
    [62,106].forEach(x=>{E('ellipse',{cx:x,cy:94,rx:11,ry:13,fill:'#fff'},g);E('ellipse',{cx:x+1,cy:96,rx:4,ry:9,fill:'#1f1f1f'},g)});
    E('polygon',{points:'77,114 91,114 84,122',fill:'#c00000'},g);E('path',{d:'M84,122 Q84,132 74,132 M84,122 Q84,132 94,132',fill:'none',stroke:'#843c0c','stroke-width':2},g);
    [[60,116,20,110],[60,123,20,128],[108,116,148,110],[108,123,148,128]].forEach(([a,b,c,d])=>E('line',{x1:a,y1:b,x2:c,y2:d,stroke:'#404040','stroke-width':1.4},g))};
  const caps=['an image is a grid of numbers: H × W pixels × 3 colours (toy: 48 × 48 × 3; ViT-B/16 reads 224 × 224 × 3)',
    'cut it into P × P patches with P = 16: here 3 × 3 = 9 patches (ViT-B/16: 14 × 14 = 196)',
    'read the patches in order, row by row, like the words of a sentence; put a learned [CLS] token in front',
    'flatten each patch (16 · 16 · 3 = 768 numbers) and multiply it by one learned matrix E; add a position vector',
    'from here on it is BERT: 12 encoder blocks, every patch attends to every patch (here: patch 5) from the first layer',
    'the [CLS] output vector goes to a small MLP head: the class of the image'];
  steps(root,5,s=>{initSvg(svg,1000,374);drawCatImage();
    function drawCatImage(){const defs=E('defs',{},svg);cat(E('g',{id:id},defs));E('use',{href:'#'+id,x:ix,y:iy},svg);E('rect',{x:ix,y:iy,width:Sz,height:Sz,fill:'none',stroke:'#404040'},svg)}
    if(s>=1){for(let k=1;k<3;k++){E('line',{x1:ix+k*p,y1:iy,x2:ix+k*p,y2:iy+Sz,stroke:'#fff','stroke-width':3},svg);E('line',{x1:ix,y1:iy+k*p,x2:ix+Sz,y2:iy+k*p,stroke:'#fff','stroke-width':3},svg)}
      for(let k=0;k<9;k++){const x=ix+(k%3)*p+11,y=iy+Math.floor(k/3)*p+11;E('circle',{cx:x,cy:y,r:9,fill:'#404040'},svg);T(svg,x,y+4,String(k+1),'w').style.fontSize='12px'}}
    if(s>=2){T(svg,250,309,'patches, in order','','end');box(svg,cx(0)-24,284,48,46,'[CLS]','#e7e6e6',{cls:''});
      for(let k=1;k<=9;k++){const q=k-1,nest=E('svg',{x:cx(k)-23,y:284,width:46,height:46,viewBox:(q%3)*p+' '+Math.floor(q/3)*p+' '+p+' '+p},svg);E('use',{href:'#'+id},nest);
        E('rect',{x:cx(k)-23,y:284,width:46,height:46,fill:'none',stroke:'#404040'},svg);T(svg,cx(k),346,String(k),'lab')}}
    if(s>=3){T(svg,250,246,'flatten · E','','end');T(svg,250,263,'+ position','','end');for(let k=0;k<=9;k++){arrowPx(svg,cx(k),282,cx(k),260,'ln thin sm','fm');strip(svg,cx(k)-24,240,V[k],6,16,mv)}}
    if(s>=4){E('rect',{x:256,y:150,width:736,height:70,rx:10,fill:'#eef3fb',stroke:'#4472c4'},svg);T(svg,250,190,'12 encoder blocks','lab','end');T(svg,250,207,'the same as BERT','','end');
      for(let k=0;k<=9;k++){arrowPx(svg,cx(k),238,cx(k),222,'ln thin sm','fm');arrowPx(svg,cx(k),148,cx(k),130,'ln thin sm','fm');strip(svg,cx(k)-24,110,Y[k],6,16,my)}
      for(let j=0;j<=9;j++)if(j!==5)arc(svg,cx(5),cx(j),216,1.2+5*w[j]/wm,'#c00000')}
    if(s>=5){arrowPx(svg,cx(0),108,cx(0),88,'ln thin sk','fk');box(svg,cx(0)-50,62,100,24,'MLP head','#e7e6e6',{cls:''});const t=T(svg,cx(0)+62,80,'→ "cat"','lab big','start');t.style.fill='#c00000'}
    T(svg,500,368,caps[s],'','middle')})};

/* the first layer of a CNN sees a small window; the first layer of a ViT sees every patch */
FIG['vit-vs-cnn']=root=>{const svg=initSvg(svgOf(root),560,240);const n=7,cs=24,c0=3,r=rng(8);
  const W=[...Array(n)].map(()=>[...Array(n)].map(()=>0.08+0.9*Math.pow(r(),3)));
  [[52,'CNN, layer 1: a 3 × 3 window','local; the same weights everywhere',(i,j)=>Math.abs(i-c0)<=1&&Math.abs(j-c0)<=1?'#f8cbad':'#fff'],
   [340,'ViT, layer 1: every patch','global; weights computed from the content',(i,j)=>heat(W[i][j],true)]].forEach(([x0,ttl,sub,f])=>{
    T(svg,x0+n*cs/2,20,ttl,'lab');for(let i=0;i<n;i++)for(let j=0;j<n;j++)E('rect',{x:x0+j*cs,y:34+i*cs,width:cs,height:cs,fill:i===c0&&j===c0?'#404040':f(i,j),stroke:'#bfbfbf'},svg);
    T(svg,x0+n*cs/2,34+n*cs+24,sub,'')})};

})();
