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
  T(svg,300,30,'keys (what each word offers) →','lab');T(svg,20,260,'queries ↓','lab','start')};
/* ---------- heads learn different patterns ---------- */
FIG['heads']=root=>{const svg=initSvg(svgOf(root),960,290);const n=8;const cs=26;const toks=['the','cat','sat','on','the','mat','.','it'];
  const pats=[['head 1: previous token',(i,j)=>j===i-1?1:(i===0&&j===0?1:0)],['head 2: same word / itself',(i,j)=>toks[i]===toks[j]?1:0.05],['head 3: "it" → noun',(i,j)=>i===7?(j===1?0.7:j===5?0.3:0):(j===i?0.6:0.05)],['head 4: broad average',(i,j)=>j<=i?1:0]];
  pats.forEach(([name,f],k)=>{const x0=20+k*240;T(svg,x0+n*cs/2,20,name,'lab');const M=[];for(let i=0;i<n;i++){const r=[];for(let j=0;j<n;j++)r.push(f(i,j));const s=r.reduce((a,b)=>a+b,0)||1;M.push(r.map(v=>v/s))}
    grid(svg,x0,32,M,cs,(i,j,v)=>heat(Math.min(1,v*1.3),true),null,{stroke:'#fff'});toks.forEach((w,i)=>{T(svg,x0+i*cs+cs/2,32+n*cs+14,w,'').style.fontSize='11px'})});
  T(svg,480,282,'rows = queries, columns = keys (same 8 tokens). Patterns like these are really found in trained models.','','middle')};
/* ---------- path length: RNN vs attention ---------- */
FIG['paths']=root=>{const svg=initSvg(svgOf(root),960,240);const n=7;
  T(svg,230,20,'RNN: information from word 1 to word 7','lab');for(let k=0;k<n;k++){const x=40+k*65;E('circle',{cx:x,cy:110,r:20,fill:k===0||k===n-1?'#ed7d31':'#bdd7ee',stroke:'#404040'},svg);T(svg,x,115,String(k+1),'lab');if(k<n-1)arrowPx(svg,x+21,110,x+43,110,'ln sr','fr')}
  T(svg,230,170,'6 sequential steps: slow, and the signal fades','','middle');T(svg,230,192,'cost O(n) steps that cannot run in parallel','','middle');
  T(svg,720,20,'Attention: every pair in one step','lab');for(let k=0;k<n;k++){const x=520+k*65;E('circle',{cx:x,cy:130,r:20,fill:k===0||k===n-1?'#ed7d31':'#bdd7ee',stroke:'#404040'},svg);T(svg,x,135,String(k+1),'lab')}
  for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){const x1=520+a*65,x2=520+b*65;const hi=a===0&&b===n-1;E('path',{d:'M'+x1+',108 Q'+((x1+x2)/2)+','+(108-(x2-x1)*0.35)+' '+x2+',108',fill:'none',stroke:hi?'#c00000':'#9dafd6','stroke-width':hi?2.5:0.8},svg)}
  T(svg,720,190,'1 step between any two words, all pairs computed in parallel','','middle');T(svg,720,212,'price: n² pairs (memory and compute grow with n²)','','middle')};
/* ---------- BPE ---------- */
FIG['bpe']=root=>{const svg=svgOf(root);const rows=[['l o w','l o w e r','n e w e s t','w i d e s t'],['l o w','l o w e r','n e w es t','w i d es t'],['l o w','l o w e r','n e w est','w i d est'],['lo w','lo w e r','n e w est','w i d est'],['low','low e r','n e w est','w i d est']];const merges=['start: characters','merge "e"+"s" → "es" (most frequent pair)','merge "es"+"t" → "est"','merge "l"+"o" → "lo"','merge "lo"+"w" → "low"'];
  stepper(root,s=>{initSvg(svg,600,230);T(svg,300,24,merges[s],'lab');rows[s].forEach((w,k)=>{const parts=w.split(' ');let x=40;const y=60+k*38;parts.forEach(p=>{const wd=16+p.length*12;box(svg,x,y,wd,28,p,'#dae3f3',{cls:'lab'});x+=wd+4})});
    T(svg,300,218,'vocabulary grows by one symbol per merge; GPT-2 stops at 50,257','','middle')})};
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
  ['Q','K','V'].forEach((t,k)=>{const x=80+k*150;T(svg,x+50,318,t,'lab big');for(let h=2;h>=0;h--)box(x+h*6,262-h*6,100,'Linear','#f8cbad');arrowPx(svg,x+50,300,x+50,294,'ln thin sk','fk');arrowPx(svg,x+50,250,250+k*30,212,'ln thin sk','fk')});
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
FIG['rag']=root=>{const svg=initSvg(svgOf(root),900,300);const box=(x,y,w,t,c)=>{E('rect',{x:x,y:y,width:w,height:48,rx:8,fill:c,stroke:'#404040'},svg);T(svg,x+w/2,y+29,t,'lab')};
  box(20,30,150,'Knowledge base','#ffe699');box(250,30,150,'Chunk + embed','#b4c7e7');box(480,30,150,'Vector database','#e2f0d9');arrowPx(svg,170,54,248,54,'ln thin sk','fk');arrowPx(svg,400,54,478,54,'ln thin sk','fk');T(svg,209,44,'1','');T(svg,439,44,'2 index','');
  box(20,170,150,'User question','#f8cbad');box(250,170,150,'Embed the question','#b4c7e7');arrowPx(svg,170,194,248,194,'ln thin sk','fk');arrowPx(svg,400,194,478,90,'ln thin sk','fk');T(svg,460,150,'3 similarity search','','end');
  box(690,170,200,'LLM: question + chunks','#dae3f3');arrowPx(svg,630,70,760,168,'ln thin sk','fk');T(svg,720,120,'4 relevant chunks','','start');box(700,250,180,'Answer','#c5e0b4');arrowPx(svg,790,218,790,248,'ln thin sk','fk');arrowPx(svg,170,210,698,210,'ln thin sm dash','fm')};
FIG['cosine']=root=>{const P=Plot(svgOf(root),{w:420,h:360,x:[-1.2,1.2],y:[-1.2,1.2],m:{l:10,r:10,t:10,b:10}});P.axes({grid:false,noaxes:true});P.line(-1.2,0,1.2,0,'ax');P.line(0,-1.2,0,1.2,'ax');
  const qv=[0.6,0.8];const ch=[[0.3,0.95,'returns policy'],[0.75,0.55,'refund times'],[-0.8,0.5,'store hours'],[-0.4,-0.9,'job offers'],[0.95,-0.2,'shipping costs']];
  const cos=(a,b)=>(a[0]*b[0]+a[1]*b[1])/(Math.hypot(...a.slice(0,2))*Math.hypot(...b.slice(0,2)));const ranked=ch.map(c=>[c,cos(qv,c)]).sort((a,b)=>b[1]-a[1]);
  ranked.forEach(([c,s],k)=>{P.line(0,0,c[0],c[1],k<2?'ln sg':'ln thin sm');P.dot(c[0],c[1],5,k<2?'fgr':'fm');P.text(c[0],c[1],c[2]+' ('+fmt(s,2)+')','', c[0]<0?'end':'start',c[0]<0?-8:8,4)});
  P.line(0,0,qv[0],qv[1],'ln sr');P.dot(qv[0],qv[1],7,'fr');P.text(qv[0],qv[1],'question','lab','start',10,14)};
})();
