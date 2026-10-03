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
/* ---------- the matrix pipeline ---------- */
FIG['qkv']=root=>{const svg=initSvg(svgOf(root),960,250);const blk=(x,y,w,h,c,t,sh)=>{E('rect',{x:x,y:y,width:w,height:h,fill:c,stroke:'#404040'},svg);T(svg,x+w/2,y+h/2+6,t,'lab big');T(svg,x+w/2,y+h+18,sh,'')};
  blk(10,60,60,120,'#e2f0d9','X','n × d');[['Q','#fbe5d6',50],['K','#dae3f3',110],['V','#fff2cc',170]].forEach(([t,c,y],k)=>{arrowPx(svg,72,120,128,y+20-40*0+0,'ln thin sk','fk');blk(130,y-10,40,60,c,t,'')});
  T(svg,40,36,'· W_Q, W_K, W_V','','start');T(svg,150,240,'n × dₖ each','');
  arrowPx(svg,172,70,238,110,'ln thin sk','fk');arrowPx(svg,172,130,238,120,'ln thin sk','fk');blk(240,60,110,110,'#ededed','QKᵀ/√dₖ','n × n scores');
  arrowPx(svg,352,115,398,115,'ln thin sk','fk');T(svg,375,100,'softmax','');T(svg,375,140,'per row','');blk(400,60,110,110,'#f8cbad','A','n × n weights');
  arrowPx(svg,512,115,558,115,'ln thin sk','fk');T(svg,535,100,'· V','');E('path',{d:'M172,190 C400,240 520,220 560,140',fill:'none',stroke:'#bf9000','stroke-width':1.5,'stroke-dasharray':'5 4'},svg);
  blk(560,60,60,120,'#c5e0b4','Z','n × dᵥ');T(svg,780,90,'row i of Z = new vector of token i:','','middle');T(svg,780,112,'a weighted average of all value rows,','','middle');T(svg,780,134,'weights = row i of A','','middle');T(svg,780,170,'three matrix products: fully parallel on a GPU','lab','middle')};
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
/* ---------- encoder (BERT) vs decoder (GPT) masks ---------- */
FIG['bert-gpt']=root=>{const svg=initSvg(svgOf(root),620,260);const n=6,cs=28;
  [['BERT (encoder): sees both sides',(i,j)=>1,'fill-in-the-blank, classification, embeddings'],['GPT (decoder): sees only the past',(i,j)=>j<=i?1:0,'next-token prediction, generation']].forEach(([t,f,s],k)=>{const x0=40+k*310;T(svg,x0+n*cs/2,20,t,'lab');const M=[];for(let i=0;i<n;i++){const r=[];for(let j=0;j<n;j++)r.push(f(i,j));M.push(r)}
    grid(svg,x0,34,M,cs,(i,j,v)=>v?'#4472c4':'#f2f2f2',null,{stroke:'#fff'});T(svg,x0+n*cs/2,34+n*cs+22,s,'')})};
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
FIG['mask']=root=>{const svg=initSvg(svgOf(root),620,250);const n=5;const r=rng(9);const S=[...Array(n)].map(()=>[...Array(n)].map(()=>randn(r)));const cs=34;
  const grid=(x0,title,cell)=>{T(svg,x0+n*cs/2,18,title,'lab');for(let i=0;i<n;i++)for(let j=0;j<n;j++){const [fill,txt]=cell(i,j);E('rect',{x:x0+j*cs,y:30+i*cs,width:cs-2,height:cs-2,fill:fill},svg);const tt=T(svg,x0+j*cs+cs/2-1,30+i*cs+cs/2+4,txt,'');if(fill==='#595959')tt.style.fill='#fff'}};
  grid(10,'scores QKᵀ/√d',(i,j)=>['#dae3f3',fmt(S[i][j],1)]);grid(220,'mask: −∞ if j > i',(i,j)=>j>i?['#595959','−∞']:['#dae3f3',fmt(S[i][j],1)]);
  const W=S.map((row,i)=>softmax(row.slice(0,i+1)).concat(new Array(n-i-1).fill(0)));grid(430,'softmax: weights',(i,j)=>j>i?['#f2f2f2','0']:['rgba(237,125,49,'+(0.2+0.8*W[i][j]).toFixed(2)+')',fmt(W[i][j],2)]);
  T(svg,310,232,'Row i = the token being predicted. It may only look at tokens 1…i, never at the future.','','middle')};
FIG['posenc']=root=>{const svg=initSvg(svgOf(root),600,300);const P=50,D=32;const cw=520/P,ch=200/D;
  for(let p=0;p<P;p++)for(let i=0;i<D;i++){const k=Math.floor(i/2);const ang=p/Math.pow(10000,2*k/D);const v=i%2===0?Math.sin(ang):Math.cos(ang);E('rect',{x:50+p*cw,y:30+i*ch,width:cw+0.3,height:ch+0.3,fill:v>=0?'#4472c4':'#ed7d31','fill-opacity':Math.abs(v).toFixed(2)},svg)}
  T(svg,310,20,'PE(pos, i) for 50 positions × 32 dimensions','lab');T(svg,310,250,'position →','','middle');T(svg,40,130,'dim','','end');T(svg,310,285,'Low dimensions oscillate fast, high dimensions slowly: every position gets a unique pattern.','','middle')};
FIG['mha']=root=>{const svg=initSvg(svgOf(root),560,330);const box=(x,y,w,t,c)=>{E('rect',{x:x,y:y,width:w,height:30,rx:5,fill:c,stroke:'#404040'},svg);T(svg,x+w/2,y+20,t,'lab')};
  ['Q','K','V'].forEach((t,k)=>{const x=80+k*150;T(svg,x+50,326,t,'lab big');for(let h=2;h>=0;h--)box(x+h*6,262-h*6,100,'Linear','#f8cbad');arrowPx(svg,x+50,300,x+50,294,'ln thin sk','fk');arrowPx(svg,x+50,250,250+k*30,212,'ln thin sk','fk')});
  for(let h=2;h>=0;h--)box(170+h*6,176-h*6,220,'Scaled dot-product attention','#b4c7e7');T(svg,470,170,'h heads','lab','start');arrowPx(svg,280,164,280,128,'ln thin sk','fk');
  box(210,96,140,'Concatenate','#ffe699');arrowPx(svg,280,94,280,70,'ln thin sk','fk');box(230,38,100,'Linear W_O','#f8cbad');T(svg,280,22,'output','lab')};
FIG['block']=root=>{const svg=initSvg(svgOf(root),620,400);const box=(x,y,w,h,t,c)=>{E('rect',{x:x,y:y,width:w,height:h,rx:5,fill:c,stroke:'#404040'},svg);T(svg,x+w/2,y+h/2+5,t,'')};
  E('rect',{x:60,y:170,width:190,height:150,rx:12,fill:'#f2f2f2',stroke:'#7f7f7f'},svg);T(svg,40,250,'N×','lab','end');
  box(75,280,160,28,'Multi-head attention','#ffe699');box(75,244,160,24,'Add & Norm','#f8cbad');box(75,212,160,24,'Feed forward','#b4c7e7');box(75,180,160,24,'Add & Norm','#f8cbad');
  box(75,340,160,26,'Input embedding + PE','#e2f0d9');arrowPx(svg,155,340,155,310,'ln thin sk','fk');T(svg,155,392,'inputs','');
  E('rect',{x:360,y:100,width:200,height:220,rx:12,fill:'#f2f2f2',stroke:'#7f7f7f'},svg);T(svg,580,210,'×N','lab','start');
  box(380,284,160,26,'Masked multi-head att.','#ffe699');box(380,254,160,22,'Add & Norm','#f8cbad');box(380,222,160,26,'Cross attention','#ffe699');box(380,192,160,22,'Add & Norm','#f8cbad');box(380,160,160,24,'Feed forward','#b4c7e7');box(380,130,160,22,'Add & Norm','#f8cbad');
  box(380,340,160,26,'Output embedding + PE','#e2f0d9');arrowPx(svg,460,340,460,312,'ln thin sk','fk');T(svg,460,392,'outputs (shifted right)','');
  box(400,60,120,24,'Linear','#dae3f3');box(400,28,120,24,'Softmax','#dae3f3');arrowPx(svg,460,100,460,86,'ln thin sk','fk');T(svg,460,18,'next-token probabilities','');
  E('path',{d:'M155,170 C155,120 300,240 378,236',fill:'none',stroke:'#c00000','stroke-width':2},svg);T(svg,300,160,'K, V from the encoder','','middle');
  T(svg,155,140,'Encoder (BERT)','lab big');T(svg,352,112,'Decoder (GPT)','lab big','end')};
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
  const e=n-2,tp=GPT2.top[e];T(svg,x0+e*bw-6,36,'GPT-2 expected "'+tp.slice(0,3).map(a=>a[0].trim()).join('", "')+'"… (≈5 % each)','','end');T(svg,x0+e*bw-6,54,'"elephant" got about 1 chance in '+Math.round(Math.pow(2,bits[e])/1000)+',000','','end');
  T(svg,490,322,'surprisal = −log₂ p(token | previous tokens); "I went to the bakery this morning and bought a fresh loaf of bread and a large elephant."','','middle')};

})();
