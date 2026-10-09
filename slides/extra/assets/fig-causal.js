/* Figures for extra/11_causal.html (causal inference and uplift). Uses ../assets/figures.js (MLFIG), ../neural_networks/assets/nn-core.js (MLNN)
   and causal-data.js (CAUSALDATA: numbers and arrays exported from the Extra 11 notebook). Toy examples (junctions, collider, the 80-driver
   regression / matching / IPW example, Qini list, DiD, IV) are computed here in the browser. */
(function(){
'use strict';
const {FIG,lib}=window.MLFIG;const {E,T,initSvg,Plot,arrowPx,rng,randn,q,setV,svgOf}=lib;const {TT,box,stepper,segs}=window.MLNN;
const CD=window.CAUSALDATA;
const CC='#4472c4',CT='#ed7d31',CA='#7030a0',CB='#548235',GR='#7f7f7f',RED='#c00000',GOLD='#ffc000';
const TYC={'sure thing':'#70ad47','persuadable':'#ed7d31','lost cause':'#7f7f7f','sleeping dog':'#c00000'};
const nf=(v,d)=>{d=d===undefined?1:d;if(Math.abs(v)<0.5*Math.pow(10,-d))v=0;return v.toFixed(d).replace('-','−')};
const pc=(v,d)=>nf(100*v,d===undefined?1:d)+' %';
const ln=(svg,a,b,c,w,dash)=>E('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:c||'#9aa5b8','stroke-width':w||1.6,'stroke-dasharray':dash||''},svg);
const dot=(svg,x,y,r,fill,stroke,sw)=>E('circle',{cx:x,cy:y,r:r,fill:fill,stroke:stroke||'#fff','stroke-width':sw===undefined?1:sw},svg);
const halo=t=>{t.setAttribute('style','paint-order:stroke;stroke:#fff;stroke-width:6px;stroke-linejoin:round');return t};
const col=(t,c)=>{t.style.fill=c;return t};
function onInput(root,k,draw){const inp=q(root,k);inp.addEventListener('input',draw);draw();return inp}
const sig=z=>1/(1+Math.exp(-z));
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
function corr(a,b){const ma=mean(a),mb=mean(b);let sab=0,saa=0,sbb=0;for(let i=0;i<a.length;i++){const x=a[i]-ma,y=b[i]-mb;sab+=x*y;saa+=x*x;sbb+=y*y}return sab/Math.sqrt(saa*sbb)}
/* arrow between two circles of radius ra, rb */
function arr(svg,a,b,ra,rb,c,w,dash){const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);const x1=a[0]+dx*ra/L,y1=a[1]+dy*ra/L,x2=b[0]-dx*rb/L,y2=b[1]-dy*rb/L;
  E('line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:c||'#595959','stroke-width':w||1.8,'stroke-dasharray':dash||''},svg);const an=Math.atan2(y2-y1,x2-x1),L2=11,W=5.5;
  E('polygon',{points:[[x2,y2],[x2-L2*Math.cos(an)+W*Math.sin(an),y2-L2*Math.sin(an)-W*Math.cos(an)],[x2-L2*Math.cos(an)-W*Math.sin(an),y2-L2*Math.sin(an)+W*Math.cos(an)]].map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),fill:c||'#595959'},svg)}
/* a DAG node */
function node(svg,p,lab,fill,r,o){o=o||{};r=r||24;if(o.ring)dot(svg,p[0],p[1],r+5,'none',o.ring,3);
  if(o.square)E('rect',{x:p[0]-r,y:p[1]-r,width:2*r,height:2*r,rx:4,fill:fill,stroke:o.stroke||'#fff','stroke-width':o.sw||1.5,'stroke-dasharray':o.dash||''},svg);
  else E('circle',{cx:p[0],cy:p[1],r:r,fill:fill,stroke:o.stroke||'#fff','stroke-width':o.sw||1.5,'stroke-dasharray':o.dash||''},svg);
  col(T(svg,p[0],p[1]+5,lab,o.cls||''),o.tcol||'#fff').style.fontWeight='700'}
function person(svg,x,y,c,s){s=s||1;dot(svg,x,y-9*s,6*s,c,'none',0);E('path',{d:'M'+(x-10*s)+','+(y+12*s)+' q'+(10*s)+','+(-20*s)+' '+(20*s)+',0 z',fill:c},svg)}
function brace(svg,x,y1,y2,c,side){const d=side==='l'?-8:8;E('path',{d:'M'+x+','+y1+' h'+d+' V'+y2+' h'+(-d),fill:'none',stroke:c,'stroke-width':2},svg)}

/* ---------- where we are: two questions ---------- */
FIG['ca-where']=root=>{const svg=initSvg(svgOf(root),1160,215);const R=CD.ret;
  const panel=(x0,w,title,hi)=>{E('rect',{x:x0,y:4,width:w,height:206,rx:10,fill:hi?'#fdf6f0':'#f5f8fd',stroke:hi?CT:CC,'stroke-width':1.5},svg);T(svg,x0+w/2,30,title,'lab big')};
  panel(6,548,'Prediction: what will happen?');panel(606,548,'Intervention: what happens if we act?',true);
  /* left: data -> model -> probability */
  for(let i=0;i<5;i++)for(let j=0;j<4;j++)E('rect',{x:40+j*24,y:62+i*20,width:24,height:20,fill:j===3?'#dae3f3':'#fff',stroke:'#9aa5b8'},svg);
  T(svg,88,180,'past customers','');arrowPx(svg,148,112,196,112,'ln thin sk','fk');
  box(svg,200,84,140,56,'churn model','#dae3f3',{cls:'lab'});arrowPx(svg,344,112,392,112,'ln thin sk','fk');
  box(svg,396,88,140,48,'P(leave | x)','#fff2cc',{cls:'lab'});T(svg,466,165,'a number per customer','');T(svg,280,198,'learned from data, checked on a test set','');
  /* right: the same customer under two actions */
  person(svg,680,118,'#595959',1.6);T(svg,680,165,'one customer','');
  arrowPx(svg,712,104,830,66,'ln thin so','fo');arrowPx(svg,712,132,830,166,'ln thin sb','fb');
  halo(T(svg,758,70,'do(call)','lab','middle'));halo(T(svg,758,175,'do(no call)','lab','middle'));
  box(svg,836,44,150,44,'stays: '+pc(R.rate1),'#fbe5d6',{cls:'lab'});box(svg,836,144,150,44,'stays: '+pc(R.rate0),'#dae3f3',{cls:'lab'});
  E('path',{d:'M992,66 h14 V166 h-14',fill:'none',stroke:'#595959','stroke-width':1.6},svg);arrowPx(svg,1006,116,1022,116,'ln thin sk','fk');
  box(svg,1026,92,120,48,'+'+nf(100*(R.rate1-R.rate0),1)+' points','#fff2cc',{cls:'lab'});
  T(svg,1086,160,'uplift','lab');T(svg,880,204,'the lab’s A/B test: 40,000 customers, half called at random','')};

/* ---------- Simpson's paradox ---------- */
const KS={A:{small:[81,87],large:[192,263]},B:{small:[234,270],large:[55,80]}};
FIG['ca-simpson']=root=>{const svg=svgOf(root);
  const rate=(t,z)=>KS[t][z][0]/KS[t][z][1];const all=t=>(KS[t].small[0]+KS[t].large[0])/(KS[t].small[1]+KS[t].large[1]);
  const nS=KS.A.small[1]+KS.B.small[1],nL=KS.A.large[1]+KS.B.large[1],pS=nS/(nS+nL);const adj=t=>rate(t,'small')*pS+rate(t,'large')*(1-pS);
  const draw=v=>{initSvg(svg,620,350);const y0=290,H=230,lo=0.5;const Y=p=>y0-(p-lo)/(1-lo)*H;
    [0.5,0.6,0.7,0.8,0.9,1].forEach(p=>{ln(svg,[60,Y(p)],[600,Y(p)],'#ececec',1);T(svg,52,Y(p)+5,Math.round(100*p)+' %','','end')});ln(svg,[60,y0],[600,y0],'#595959',1.2);
    T(svg,60,40,'success rate (axis from 50 %)','','start');
    const bar=(x,p,c,top,sub)=>{E('rect',{x:x,y:Y(p),width:62,height:y0-Y(p),fill:c},svg);T(svg,x+31,Y(p)-24,top,'lab');T(svg,x+31,Y(p)-7,sub,'')};
    const leg=(x,c,t)=>{E('rect',{x:x,y:22,width:14,height:14,fill:c},svg);T(svg,x+20,34,t,'','start')};
    if(v==='strat'){[['small','small stones',120],['large','large stones',380]].forEach(([z,lab,x])=>{
        bar(x,rate('A',z),CA,pc(rate('A',z)),KS.A[z][0]+'/'+KS.A[z][1]);bar(x+72,rate('B',z),CB,pc(rate('B',z)),KS.B[z][0]+'/'+KS.B[z][1]);T(svg,x+67,y0+20,lab,'lab')});
      leg(330,CA,'A: open surgery');leg(480,CB,'B: PCNL');T(svg,330,340,'A is better for small stones and for large stones','')}
    else if(v==='all'){bar(170,all('A'),CA,pc(all('A')),'273/350');bar(242,all('B'),CB,pc(all('B')),'289/350');T(svg,237,y0+20,'all patients','lab');
      /* case mix */
      const mx=410,mw=46;E('rect',{x:396,y:66,width:214,height:250,rx:8,fill:'#fff',stroke:'#d0d0d0'},svg);T(svg,mx+50,90,'case mix','lab');[['A',CA],['B',CB]].forEach(([t,c],k)=>{const n=KS[t].small[1]+KS[t].large[1];const hs=180*KS[t].small[1]/n;const x=mx+k*60;
        E('rect',{x:x,y:105,width:mw,height:hs,fill:'#e7e6e6',stroke:c,'stroke-width':1.5},svg);E('rect',{x:x,y:105+hs,width:mw,height:180-hs,fill:'#8c8c8c',stroke:c,'stroke-width':1.5},svg);
        col(T(svg,x+mw/2,105+hs+(180-hs)/2+5,pc(KS[t].large[1]/n,0),'w'),'#fff');T(svg,x+mw/2,y0+20,t,'lab')});
      T(svg,mx+152,170,'■ large','','start').style.fill='#595959';T(svg,mx+152,190,'□ small','','start');
      T(svg,330,340,'pooled, B looks better: A got most of the hard cases','')}
    else{bar(170,adj('A'),CA,pc(adj('A')),'do(A)');bar(242,adj('B'),CB,pc(adj('B')),'do(B)');T(svg,237,y0+20,'adjusted','lab');
      TT(svg,470,110,'P(small) = '+nf(pS,2)+', P(large) = '+nf(1-pS,2),'');
      T(svg,470,145,'A: '+nf(rate('A','small'),3)+' · '+nf(pS,2)+' + '+nf(rate('A','large'),3)+' · '+nf(1-pS,2),'');
      T(svg,470,168,'B: '+nf(rate('B','small'),3)+' · '+nf(pS,2)+' + '+nf(rate('B','large'),3)+' · '+nf(1-pS,2),'');
      T(svg,470,205,'A better by '+nf(100*(adj('A')-adj('B')),1)+' points','lab');T(svg,330,340,'the same population mix of stone sizes for both treatments','')}};
  const cur=segs(root,'v',draw);draw(cur()||'strat')};

/* ---------- potential outcomes table ---------- */
FIG['ca-po']=root=>{const svg=svgOf(root);const rows=CD.po.rows;
  const cols=[['driver',60],['age',62],['claims',66],['T',44],['Y(0)',96],['Y(1)',96],['τ = Y(1) − Y(0)',156]];const x0=20,y0=56,rh=33;
  stepper(root,s=>{initSvg(svg,620,350);setV(root,'s',s+' / 3');T(svg,310,22,s===0?'what the analyst sees':'what the simulator knows (the lab’s first six drivers)','lab');
    let x=x0;cols.forEach(([h,w])=>{E('rect',{x:x,y:y0-26,width:w,height:26,fill:'#4472c4'},svg);col(T(svg,x+w/2,y0-8,h,'lab'),'#fff');x+=w});
    rows.forEach((r,i)=>{const y=y0+i*rh;const t=r[3];let x=x0;const cells=[String(i+1),nf(r[0],0),String(r[2]),String(t),null,null,null];
      E('rect',{x:x0,y:y,width:580,height:rh,fill:t?'#fdf0e6':'#eef3fb',stroke:'#fff'},svg);
      cols.forEach(([h,w],j)=>{let txt=cells[j],c='#1f1f1f',gold=false;
        if(j===4||j===5){const obs=(j===5)===(t===1);const v=r[j];if(obs)txt=nf(v,1);else if(s>=1){txt=nf(v,1);gold=true}else{txt='?';c=RED}}
        if(j===6){if(s>=2)txt=nf(r[6],1);else{txt='?';c=RED}}
        if(gold)E('rect',{x:x+6,y:y+4,width:w-12,height:rh-8,rx:4,fill:'#fff2cc',stroke:GOLD},svg);
        const tt=T(svg,x+w/2,y+rh/2+5,txt,j===3||j===6?'lab':'');tt.style.fill=j===3?(t?CT:CC):c;x+=w})});
    const yb=y0+rows.length*rh+12;
    if(s>=3){const tau=rows.map(r=>r[6]),tr=rows.filter(r=>r[3]===1),co=rows.filter(r=>r[3]===0);const yt=mean(tr.map(r=>r[5])),yc=mean(co.map(r=>r[4]));
      T(svg,30,yb+18,'mean τ of the six = '+nf(mean(tau),1)+' €   ·   mean τ of the 3 members = '+nf(mean(tr.map(r=>r[6])),1)+' €','lab','start');
      T(svg,30,yb+44,'naive: members '+nf(yt,1)+' − non-members '+nf(yc,1)+' = '+nf(yt-yc,1)+' €','lab','start');
      col(T(svg,30,yb+68,'all 5,000 drivers: ATE '+nf(CD.po.ate,1)+' €, ATT '+nf(CD.po.att,1)+' €, naive '+nf(CD.po.naive,1)+' €',''+'','start'),'#595959')}
    else if(s>=1)col(T(svg,30,yb+18,'gold: the counterfactual, never observed in real data','','start'),'#7f6000');
    else col(T(svg,30,yb+18,'orange rows: members (T = 1) · blue rows: non-members (T = 0)','','start'),'#595959')})};

/* ---------- naive = ATT + selection bias ---------- */
FIG['ca-decomp']=root=>{const svg=svgOf(root);const P=CD.po;
  stepper(root,s=>{initSvg(svg,620,350);const lo=360,hi=560,Y=v=>300-(v-lo)/(hi-lo)*250;
    [380,420,460,500,540].forEach(v=>{ln(svg,[70,Y(v)],[600,Y(v)],'#ececec',1);T(svg,62,Y(v)+5,v+' €','','end')});
    T(svg,70,30,'mean claim cost (axis from 360 €)','','start');
    const lev=(x,v,c,lab,sub,dash)=>{E('rect',{x:x-45,y:Y(v),width:90,height:300-Y(v),fill:c,opacity:dash?0.12:0.22},svg);
      E('line',{x1:x-45,x2:x+45,y1:Y(v),y2:Y(v),stroke:c,'stroke-width':5,'stroke-dasharray':dash?'8 5':''},svg);T(svg,x,Y(v)-10,nf(v,1)+' €','lab');T(svg,x,322,lab,'lab');T(svg,x,342,sub,'')};
    lev(150,P.ym1,CT,'members','observed: Y(1)');lev(470,P.ym0,CC,'non-members','observed: Y(0)');
    if(s>=1)lev(310,P.y0m1,CT,'members, no programme','Y(0): hidden','dash');
    if(s<2){brace(svg,538,Y(P.ym1),Y(P.ym0),RED);ln(svg,[195,Y(P.ym1)],[534,Y(P.ym1)],RED,1,'4 4');halo(col(T(svg,586,(Y(P.ym1)+Y(P.ym0))/2-4,'naive','lab','middle'),RED));
      halo(col(T(svg,586,(Y(P.ym1)+Y(P.ym0))/2+16,nf(P.naive,1)+' €','lab','middle'),RED))}
    else{brace(svg,226,Y(P.ym1),Y(P.y0m1),CT);halo(col(T(svg,232,Y(P.ym1)-26,'ATT '+nf(P.att,1)+' €','lab','start'),'#c55a11'));
      ln(svg,[195,Y(P.ym1)],[222,Y(P.ym1)],CT,1,'4 4');
      brace(svg,388,Y(P.y0m1),Y(P.ym0),'#7f6000');ln(svg,[355,Y(P.y0m1)],[384,Y(P.y0m1)],'#7f6000',1,'4 4');
      halo(col(T(svg,394,(Y(P.y0m1)+Y(P.ym0))/2+5,'selection bias '+nf(P.sel,1)+' €','lab','start'),'#7f6000'))}
    if(s===0)T(svg,310,60,'members cost '+nf(-P.naive,0)+' € less: is that the programme?','');
    if(s===1)T(svg,310,60,'without the programme the members would still be cheaper','');
    if(s===2)T(svg,310,60,nf(P.naive,1)+' = '+nf(P.att,1)+' (effect) '+nf(P.sel,1).replace('−','− ')+' (who joins)','lab')})};

/* ---------- 500 replays: randomised vs self-selected ---------- */
FIG['ca-rand']=root=>{const svg=svgOf(root);const R=CD.rep;
  const hist=(a,lo,w,n)=>{const h=new Array(n).fill(0);a.forEach(v=>{const k=Math.floor((v-lo)/w);if(k>=0&&k<n)h[k]++});return h};
  const lo=-140,w=2.5,nb=48;const hr=hist(R.rand,lo,w,nb),hc=hist(R.conf,lo,w,nb);const ym=Math.max(...hr,...hc)*1.15;
  const draw=a=>{const P=Plot(svg,{w:620,h:360,x:[lo,lo+w*nb],y:[0,ym],m:{l:50,r:14,t:30,b:44}});
    const yt=[];for(let v=0;v<ym;v+=25)yt.push(v);P.axes({xt:[-130,-110,-90,-70,-50,-30],yt:yt,fx:v=>String(v).replace('-','−'),xl:'naive difference in mean claim cost (€)',yl:'replications'});
    const bars=(h,c)=>h.forEach((n,k)=>{if(n)P.rect(lo+k*w,0,lo+(k+1)*w,n,'').setAttribute('style','fill:'+c+';fill-opacity:0.8;stroke:#fff;stroke-width:0.5')});
    if(a!=='conf')bars(hr,'#70ad47');if(a!=='rand')bars(hc,RED);
    P.line(CD.po.ate,0,CD.po.ate,ym,'ln thin sk dash');halo(P.text(CD.po.ate,ym*0.93,'true ATE '+nf(CD.po.ate,1),'lab','start',6,0));
    if(a!=='conf')halo(col(P.text(-50,ym*0.78,'coin flip: mean '+nf(mean(R.rand),1),'lab','start',8,0),'#548235'));
    if(a!=='rand')halo(col(P.text(-117,ym*0.9,'self-selection: mean '+nf(mean(R.conf),1),'lab','start',0,0),RED))};
  const cur=segs(root,'a',draw);draw(cur()||'rand')};

/* ---------- the four assumptions (small pictures) ---------- */
FIG['ca-assume']=root=>{const svg=initSvg(svgOf(root),540,92);const k=root.dataset.k;
  if(k==='sutva'){person(svg,90,44,CT,1.3);person(svg,450,44,CC,1.3);T(svg,90,84,'A: called','');T(svg,450,84,'B: not called','');
    arrowPx(svg,122,40,416,40,'ln thin sr','fr');halo(col(T(svg,270,30,'tells B about the discount','','middle'),RED));col(T(svg,270,64,'B’s outcome depends on A’s treatment','','middle'),RED)}
  else if(k==='cons'){box(svg,70,28,90,36,'T = 1','#fbe5d6',{cls:'lab'});arrowPx(svg,164,46,236,30,'ln thin sk','fk');arrowPx(svg,164,46,236,64,'ln thin sm','fm');
    box(svg,240,10,100,34,'Y(1)','#fff2cc',{cls:'lab',stroke:GOLD});box(svg,240,50,100,34,'Y(0)','#f2f2f2',{cls:'lab',stroke:'#bfbfbf'});
    T(svg,360,32,'= the observed Y','lab','start');col(T(svg,360,72,'not observed','','start'),'#7f7f7f')}
  else if(k==='ign'){const X=[130,20],Tn=[60,52],Y=[200,52],U=[410,20],T2=[340,52],Y2=[480,52];
    arr(svg,X,Tn,15,15,'#595959',1.6);arr(svg,X,Y,15,15,'#595959',1.6);arr(svg,Tn,Y,15,15,CT,2);node(svg,X,'X',GR,15);node(svg,Tn,'T',CT,15);node(svg,Y,'Y','#548235',15);
    arr(svg,U,T2,15,15,RED,1.6,'5 4');arr(svg,U,Y2,15,15,RED,1.6,'5 4');arr(svg,T2,Y2,15,15,CT,2);node(svg,T2,'T',CT,15);node(svg,Y2,'Y','#548235',15);
    node(svg,U,'U','#fff',15,{stroke:RED,sw:2,dash:'4 3',tcol:RED});
    col(T(svg,130,86,'X measured: adjust, fine','','middle'),'#385723');col(T(svg,410,86,'U unmeasured: biased','','middle'),RED)}
  else{const X=e=>40+e*460,Yb=72;
    const curve=(f,c)=>{let d='';for(let i=0;i<=100;i++){const e=i/100;d+=(i?'L':'M')+X(e).toFixed(1)+','+(Yb-f(e)).toFixed(1)}d+='L'+X(1)+','+Yb+' L'+X(0)+','+Yb+' Z';E('path',{d:d,fill:c,'fill-opacity':0.35,stroke:c,'stroke-width':1.5},svg)};
    curve(e=>52*Math.exp(-Math.pow((e-0.25)/0.15,2)/2),CC);curve(e=>e<0.18?0:46*Math.exp(-Math.pow((e-0.6)/0.17,2)/2),CT);ln(svg,[40,Yb],[500,Yb],'#595959',1.2);
    E('rect',{x:X(0),y:10,width:X(0.18)-X(0),height:Yb-10,fill:RED,'fill-opacity':0.08,stroke:RED,'stroke-dasharray':'4 3'},svg);
    col(T(svg,X(0.09),88,'no members','','middle'),RED);col(T(svg,X(0.3),14,'non-members',''),CC);col(T(svg,X(0.72),14,'members',''),'#c55a11');T(svg,510,77,'e(x)','','start')}};

/* ---------- the lab's DAG ---------- */
const DAGP={age:[55,105],claims:[195,45],km:[425,45],urban:[565,105],T:[120,215],Y:[500,215],brake:[310,265],renew:[310,335]};
const DAGE=[['age','claims'],['age','T'],['age','Y'],['claims','T'],['claims','Y'],['km','T'],['km','Y'],['urban','T'],['urban','Y'],['age','brake'],['claims','brake'],['km','brake'],['T','brake'],['brake','Y'],['T','Y'],['T','renew'],['Y','renew']];
const ROLE={age:GR,claims:GR,km:GR,urban:GR,T:CT,Y:CB,brake:CA,renew:RED};
FIG['ca-dag']=root=>{const svg=initSvg(svgOf(root),620,395);
  DAGE.forEach(([a,b])=>arr(svg,DAGP[a],DAGP[b],27,29,(a==='T'||a==='brake')&&b!=='renew'?CT:'#8c8c8c',(a==='T'||a==='brake')&&b!=='renew'?2.4:1.5));
  Object.keys(DAGP).forEach(k=>node(svg,DAGP[k],k,ROLE[k],27));
  [['confounder',GR],['treatment',CT],['outcome',CB],['mediator',CA],['collider',RED]].forEach(([t,c],i)=>{dot(svg,40+i*118,382,8,c,'none',0);T(svg,53+i*118,387,t,'','start')});
};

/* ---------- chain, fork, collider ---------- */
FIG['ca-junction']=root=>{const svg=svgOf(root);const n=1500;const r=rng(11);const e=[[],[],[]];for(let i=0;i<n;i++)for(let k=0;k<3;k++)e[k].push(randn(r));
  const J={};{const X=e[0],Z=X.map((v,i)=>v+e[1][i]),Y=Z.map((v,i)=>v+e[2][i]);J.chain={X,Y,Z}}
  {const Z=e[0],X=Z.map((v,i)=>v+e[1][i]),Y=Z.map((v,i)=>v+e[2][i]);J.fork={X,Y,Z}}
  {const X=e[0],Y=e[1],Z=X.map((v,i)=>v+Y[i]+e[2][i]);J.collider={X,Y,Z}}
  let j='chain',c='off';
  const draw=()=>{initSvg(svg,620,360);const d=J[j];const on=c==='on';
    const P={X:[210,32],Z:[310,32],Y:[410,32]};const ac=on?'#bfbfbf':'#595959';
    if(j==='chain'){arr(svg,P.X,P.Z,16,16,'#595959');arr(svg,P.Z,P.Y,16,16,'#595959')}else if(j==='fork'){arr(svg,P.Z,P.X,16,16,'#595959');arr(svg,P.Z,P.Y,16,16,'#595959')}else{arr(svg,P.X,P.Z,16,16,'#595959');arr(svg,P.Y,P.Z,16,16,'#595959')}
    node(svg,P.X,'X',CC,16);node(svg,P.Y,'Y',CB,16);node(svg,P.Z,'Z',on?RED:GR,16,on?{square:true}:{});
    const Pl=Plot(svg,{at:[0,56],w:620,h:304,x:[-4.5,4.5],y:[-6,6],m:{l:40,r:14,t:10,b:40}});Pl.axes({xt:[-4,-2,0,2,4],yt:[-6,-3,0,3,6],fx:v=>String(v).replace('-','−'),fy:v=>String(v).replace('-','−'),xl:'X',yl:'Y'});
    const sl=[];for(let i=0;i<n;i++){const s=Math.abs(d.Z[i])<0.25;if(s)sl.push(i);const p=Pl.dot(d.X[i],d.Y[i],on&&s?3.2:2.2,'');p.setAttribute('fill',on?(s?RED:'#d9d9d9'):'#8eaadb')}
    if(on)sl.forEach(i=>{const p=Pl.dot(d.X[i],d.Y[i],3.2,'');p.setAttribute('fill',RED)});
    const ra=corr(d.X,d.Y),rs=corr(sl.map(i=>d.X[i]),sl.map(i=>d.Y[i]));
    halo(T(Pl.top,60,30,'all '+n+' points: r = '+nf(ra,2),'lab','start'));
    if(on)halo(col(T(Pl.top,60,52,'slice |Z| < 0.25 ('+sl.length+' points): r = '+nf(rs,2),'lab','start'),RED));
    T(svg,612,37,'1,500 simulated points','','end')};
  segs(root,'j',v=>{j=v;draw()});segs(root,'c',v=>{c=v;draw()});draw()};

/* ---------- collider bias: actors ---------- */
FIG['ca-collider']=root=>{const svg=svgOf(root);const n=2000;const r=rng(5);const tl=[],lk=[];for(let i=0;i<n;i++){tl.push(randn(r));lk.push(randn(r))}
  onInput(root,'k',()=>{const k=+q(root,'k').value;setV(root,'k',nf(k,2));const P=Plot(svg,{w:620,h:360,x:[-3.6,3.6],y:[-3.6,3.6],m:{l:44,r:14,t:56,b:40}});
    P.axes({xt:[-3,-2,-1,0,1,2,3],yt:[-3,-2,-1,0,1,2,3],fx:v=>String(v).replace('-','−'),fy:v=>String(v).replace('-','−'),xl:'talent',yl:'looks'});
    const sel=[];for(let i=0;i<n;i++){const s=tl[i]+lk[i]>k;if(s)sel.push(i);const p=P.dot(tl[i],lk[i],2.4,'');p.setAttribute('fill',s?CA:'#d9d9d9');if(s)p.setAttribute('fill-opacity','0.75')}
    P.line(k+3.6,-3.6,k-3.6,3.6,'ln thin sk dash');
    const rs=sel.length>2?corr(sel.map(i=>tl[i]),sel.map(i=>lk[i])):0;
    T(svg,44,22,'everybody: r = '+nf(corr(tl,lk),2),'lab','start');
    col(T(svg,330,22,'actors ('+pc(sel.length/n,0)+'): r = '+nf(rs,2),'lab','start'),CA);
    T(svg,44,44,'actor if talent + looks > '+nf(k,2)+' · '+n+' simulated people','','start')})};

/* ---------- backdoor paths, step by step ---------- */
FIG['ca-backdoor']=root=>{const svg=svgOf(root);
  const P={age:[62,160],claims:[305,48],brake:[305,140],T:[130,228],Y:[480,228],renew:[305,312]};
  const ED=[['age','claims'],['age','T'],['age','Y'],['claims','T'],['claims','Y'],['T','brake'],['brake','Y'],['T','Y'],['T','renew'],['Y','renew']];
  const ek=(a,b)=>ED.findIndex(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a));
  const pathEdges=p=>p.slice(1).map((v,i)=>ek(p[i],v));
  const STEPS=[null,
    {p:[['T','Y']],ok:true,txt:'T → Y · causal · open: keep it'},
    {p:[['T','brake','Y']],ok:true,txt:'T → brake → Y · causal · open: keep it'},
    {p:[['T','age','Y']],ok:true,txt:'T ← age → Y · backdoor · blocked: age is in S (a fork)'},
    {p:[['T','claims','Y']],ok:true,txt:'T ← claims → Y · backdoor · blocked: claims is in S'},
    {p:[['T','age','claims','Y'],['T','claims','age','Y']],ok:true,txt:'two more backdoor paths via age and claims · blocked'},
    {p:[['T','renew','Y']],ok:true,txt:'T → renew ← Y · collider not in S · blocked'},
    {p:[['T','brake','Y']],ok:false,add:'brake',txt:'S + brake: the causal path through brake is blocked'},
    {p:[['T','renew','Y']],ok:false,add:'renew',txt:'S + renew: conditioning on the collider opens the path'}];
  stepper(root,s=>{initSvg(svg,620,375);setV(root,'s',s+' / 8');const st=STEPS[s];const S=new Set(['age','claims']);if(st&&st.add)S.add(st.add);
    const hi=new Map();if(st)st.p.forEach(p=>pathEdges(p).forEach(k=>hi.set(k,st.ok?'#548235':RED)));
    ED.forEach(([a,b],k)=>arr(svg,P[a],P[b],25,27,hi.has(k)?hi.get(k):'#a6a6a6',hi.has(k)?4:1.6));
    Object.keys(P).forEach(k=>node(svg,P[k],k,{T:CT,Y:CB,brake:CA,renew:RED}[k]||GR,24,S.has(k)?{square:true,stroke:GOLD,sw:4}:{}));
    T(svg,600,32,'S = {'+[...S].join(', ')+'}','lab','end');col(T(svg,600,52,'gold square = adjusted for','','end'),'#7f6000');
    if(s===0){T(svg,310,362,'simplified DAG (km and urban left out): 7 paths from T to Y','lab')}
    else{const t=T(svg,310,362,(s<=6?'path '+s+(s===5?'–6':'')+': ':'')+st.txt,'lab');t.style.fill=st.ok?'#385723':RED}})};

/* ---------- do-operator: graph surgery ---------- */
FIG['ca-do']=root=>{const svg=initSvg(svgOf(root),490,330);
  const draw=(x0,cut)=>{const A=[x0+115,80],Tn=[x0+40,200],Y=[x0+190,200];
    if(!cut)arr(svg,A,Tn,24,26,'#595959',2);else{ln(svg,[A[0]-16,A[1]+19],[Tn[0]+14,Tn[1]-28],'#c9c9c9',2,'5 4');const m=[(A[0]+Tn[0])/2+1,(A[1]+Tn[1])/2-4];
      ln(svg,[m[0]-9,m[1]-9],[m[0]+9,m[1]+9],RED,3);ln(svg,[m[0]-9,m[1]+9],[m[0]+9,m[1]-9],RED,3)}
    arr(svg,A,Y,24,26,'#595959',2);arr(svg,Tn,Y,cut?30:26,26,CT,2.6);node(svg,A,'age',GR,24);node(svg,Tn,cut?'T=1':'T',CT,cut?28:24,cut?{square:true}:{});node(svg,Y,'Y',CB,24)};
  draw(0,false);draw(250,true);ln(svg,[245,40],[245,300],'#d9d9d9',1);
  T(svg,115,26,'observational','lab big');T(svg,365,26,'do(T = 1)','lab big');
  T(svg,115,258,'P(Y | T = 1):','lab');T(svg,115,280,'members are also','');T(svg,115,298,'older (age → T)','');
  T(svg,365,258,'P(Y | do(T = 1)):','lab');T(svg,365,280,'T set from outside;','');T(svg,365,298,'arrows into T cut','')};

/* ---------- toy data for regression / matching / IPW (80 drivers, true effect −60 €) ---------- */
const TOY=(()=>{const r=rng(10);const P=[];for(let i=0;i<80;i++){const x=10*r();const e=sig(0.55*(x-5));const t=r()<e?1:0;const y=640-28*x-60*t+35*randn(r);P.push({x,e,t,y})}return P})();
const ols=pts=>{const n=pts.length;const mx=mean(pts.map(p=>p.x)),my=mean(pts.map(p=>p.y));let sxy=0,sxx=0;pts.forEach(p=>{sxy+=(p.x-mx)*(p.y-my);sxx+=(p.x-mx)**2});const b=sxy/sxx;return [my-b*mx,b]};
function toyPlot(svg,h){const P=Plot(svg,{w:620,h:h||360,x:[0,10],y:[250,750],m:{l:52,r:44,t:52,b:40}});
  P.axes({xt:[0,2,4,6,8,10],yt:[300,400,500,600,700],xl:'carefulness score x',yl:'claim cost (€)'});return P}
FIG['ca-gcomp']=root=>{const svg=svgOf(root);const T1=TOY.filter(p=>p.t),T0=TOY.filter(p=>!p.t);
  const draw=m=>{const P=toyPlot(svg);const g=E('g',{},P.dyn);
    const m1=mean(T1.map(p=>p.y)),m0=mean(T0.map(p=>p.y));let txt='';
    if(m==='raw'){P.line(0,m1,10,m1,'ln so dash');P.line(0,m0,10,m0,'ln sb dash');halo(col(P.text(0.2,m1,'members: '+nf(m1,0)+' €','lab','start',0,-8),'#c55a11'));halo(col(P.text(9.8,m0,'non-members: '+nf(m0,0)+' €','lab','end',0,-8),CC));
      txt='naive difference = '+nf(m1-m0,1)+' €'}
    if(m==='reg'){const [a1,b1]=ols(T1),[a0,b0]=ols(T0);P.line(0,a1,10,a1+10*b1,'ln so');P.line(0,a0,10,a0+10*b0,'ln sb');
      [1.5,5,8.5].forEach(x=>{P.line(x,a0+b0*x,x,a1+b1*x,'ln thin sk');});halo(P.text(1.5,(a0+a1)/2+1.5*(b0+b1)/2,'gap','', 'start',5,4));
      const g1=mean(TOY.map(p=>(a1+b1*p.x)-(a0+b0*p.x)));txt='average gap over all 80 drivers = '+nf(g1,1)+' €'}
    if(m==='match'){T1.forEach(p=>{let b=T0[0];T0.forEach(c=>{if(Math.abs(c.x-p.x)<Math.abs(b.x-p.x))b=c});P.line(p.x,p.y,b.x,b.y,'ln thin sm')});
      const att=mean(T1.map(p=>{let b=T0[0];T0.forEach(c=>{if(Math.abs(c.x-p.x)<Math.abs(b.x-p.x))b=c});return p.y-b.y}));txt='mean gap of '+T1.length+' matched pairs (ATT) = '+nf(att,1)+' €'}
    TOY.forEach(p=>{const d=P.dot(p.x,p.y,4.5,'pt');d.setAttribute('fill',p.t?CT:CC)});
    T(svg,52,22,txt,'lab','start');T(svg,52,42,'toy data: '+T1.length+' members, '+T0.length+' non-members, true effect −60 € for everyone','','start')};
  const cur=segs(root,'m',draw);draw(cur()||'raw')};
FIG['ca-ipw']=root=>{const svg=svgOf(root);
  stepper(root,s=>{const P=toyPlot(svg);setV(root,'s',s+' / 3');const w=p=>p.t?1/p.e:1/(1-p.e);
    const T1=TOY.filter(p=>p.t),T0=TOY.filter(p=>!p.t);const m1=mean(T1.map(p=>p.y)),m0=mean(T0.map(p=>p.y));
    const hm=a=>a.reduce((s,p)=>s+w(p)*p.y,0)/a.reduce((s,p)=>s+w(p),0);const h1=hm(T1),h0=hm(T0);
    if(s>=1){const ex=x=>250+500*sig(0.55*(x-5));P.fn(x=>ex(x),'ln thin sy',0,10,100);[0,0.5,1].forEach(v=>T(P.top,P.X(10)+6,P.Y(250+500*v)+5,String(v),'','start'));halo(col(P.text(0.4,ex(0.4)+30,'e(x) = P(member | x), right axis','','start',0,0),'#7f6000'))}
    if(s<3){P.line(0,m1,10,m1,'ln thin so dash');P.line(0,m0,10,m0,'ln thin sb dash')}
    else{P.line(0,h1,10,h1,'ln so');P.line(0,h0,10,h0,'ln sb');halo(col(P.text(9.8,h1,'weighted members '+nf(h1,0),'lab','end',0,-8),'#c55a11'));halo(col(P.text(9.8,h0,'weighted non-members '+nf(h0,0),'lab','end',0,-8),CC))}
    TOY.forEach(p=>{const d=P.dot(p.x,p.y,s>=2?2.6*Math.sqrt(w(p)):4.5,'pt');d.setAttribute('fill',p.t?CT:CC);d.setAttribute('fill-opacity',s>=2?'0.7':'1')});
    const txt=s<3?'raw difference of means: '+nf(m1-m0,1)+' €':'IPW (normalised weights): '+nf(h1-h0,1)+' €   (true −60 €)';
    T(svg,52,22,txt,'lab','start');T(svg,52,42,s>=2?'dot area ∝ weight: rare members (careless) and rare non-members (careful) count more':'same toy data as the previous slide','','start')})};

/* ---------- overlap and balance (lab) ---------- */
FIG['ca-overlap']=root=>{const svg=initSvg(svgOf(root),620,390);const O=CD.overlap;const ym=Math.max(...O.c,...O.t)*1.1;
  const P=Plot(svg,{at:[0,0],w:620,h:225,x:[0,1],y:[0,ym],m:{l:50,r:14,t:30,b:40}});P.axes({xt:[0,0.2,0.4,0.6,0.8,1],yt:[0,50,100,150],xl:'estimated propensity ê(x)',yl:'drivers'});
  O.c.forEach((n,k)=>{if(n)P.rect(O.bins[k],0,O.bins[k+1],n,'').setAttribute('style','fill:'+CC+';fill-opacity:0.55;stroke:#fff;stroke-width:0.5')});
  O.t.forEach((n,k)=>{if(n)P.rect(O.bins[k],0,O.bins[k+1],n,'').setAttribute('style','fill:'+CT+';fill-opacity:0.55;stroke:#fff;stroke-width:0.5')});
  col(T(svg,330,22,'non-members ('+(CD.po.n-CD.po.n1)+')','lab','start'),CC);col(T(svg,480,22,'members ('+CD.po.n1+')','lab','start'),'#c55a11');T(svg,50,22,'overlap','lab','start');
  const B=CD.bal;const cv=['age','km','claims','urban'];const Q=Plot(svg,{at:[0,225],w:620,h:165,x:[-0.55,0.9],y:[-0.6,3.6],m:{l:70,r:14,t:26,b:38}});
  Q.rect(-0.1,-0.6,0.1,3.6,'').setAttribute('style','fill:#ececec');Q.axes({xt:[-0.4,-0.2,0,0.2,0.4,0.6,0.8],yt:[],grid:false,fx:v=>nf(v,1),xl:'standardised mean difference (members − non-members)'});
  cv.forEach((c,i)=>{const y=3-i;T(Q.root,64,Q.Y(y)+5,c,'lab','end');Q.line(-0.55,y,0.9,y,'gr',Q.bg);
    [['raw','circle',RED],['IPW-weighted','diamond',CB],['matched (ATT)','square',CC]].forEach(([k,sh,cl])=>{const v=B[k][i],x=Q.X(v),yy=Q.Y(y);
      if(sh==='circle')dot(Q.top,x,yy,6,cl,'#fff',1);else if(sh==='square')E('rect',{x:x-5,y:yy-5,width:10,height:10,fill:cl,stroke:'#fff'},Q.top);else E('polygon',{points:[[x,yy-7],[x+7,yy],[x,yy+7],[x-7,yy]].map(p=>p.join(',')).join(' '),fill:cl,stroke:'#fff'},Q.top)})});
  [['raw',RED],['matched',CC],['weighted',CB]].forEach(([t,c],i)=>{dot(svg,250+i*110,239,6,c,'#fff',1);T(svg,260+i*110,244,t,'','start')});T(svg,70,244,'balance','lab','start')};

/* ---------- extreme weights: the stress test (lab) ---------- */
FIG['ca-stress']=root=>{const svg=svgOf(root);const S=CD.stress;const K=['g-computation','AIPW','IPW (Hájek)','IPW (HT)'];const KC=[CB,'#1f1f1f',CC,RED];
  onInput(root,'s',()=>{const i=+q(root,'s').value;setV(root,'s','s = '+S.s[i]);
    const P=Plot(svg,{w:620,h:360,x:[0.3,3.2],y:[0.2,3.6],m:{l:56,r:14,t:112,b:40}});
    P.axes({xt:[0.5,1,1.5,2,2.5,3],yt:[0.477,1,2,3],fy:v=>v<0.6?'3':String(Math.round(Math.pow(10,v))),xl:'selection strength s (1 = the lab’s data)',yl:'RMSE (€, log scale)'});
    K.forEach((k,j)=>{P.path(S.s.map((s,m)=>[s,Math.log10(S[k][m])]),'ln').setAttribute('style','stroke:'+KC[j]);S.s.forEach((s,m)=>{const d=P.dot(s,Math.log10(S[k][m]),m===i?6:3.5,'pt');d.setAttribute('fill',KC[j])})});
    P.line(S.s[i],0.2,S.s[i],3.6,'ln thin sy dash');
    K.forEach((k,j)=>{const x=12+(j%2)*300,y=24+Math.floor(j/2)*24;E('line',{x1:x,x2:x+22,y1:y-5,y2:y-5,stroke:KC[j],'stroke-width':3},svg);T(svg,x+28,y,k+': '+nf(S[k][i],1)+' €','lab','start')});
    T(svg,12,80,'median largest weight '+nf(S['median max weight'][i],0)+' · effective sample '+pc(S['ESS / n'][i],0)+' of n · 100 replications','','start')})};

/* ---------- forest plot (lab) ---------- */
FIG['ca-forest']=root=>{const svg=initSvg(svgOf(root),620,250);const F=CD.est;const n=F.names.length;
  const P=Plot(svg,{at:[0,0],w:620,h:250,x:[-140,0],y:[-0.6,n-0.4],m:{l:150,r:14,t:30,b:40}});P.axes({xt:[-140,-120,-100,-80,-60,-40,-20,0],yt:[],grid:true,fx:v=>String(v).replace('-','−'),xl:'effect on the annual claim cost (€)'});
  P.line(CD.po.ate,-0.6,CD.po.ate,n-0.4,'ln thin sg dash');halo(col(T(svg,P.X(CD.po.ate)+4,22,'true ATE '+nf(CD.po.ate,1),'lab','start'),'#548235'));
  F.names.forEach((nm,i)=>{const y=n-1-i;T(P.root,142,P.Y(y)+5,nm,'lab','end');P.line(F.lo[i],y,F.hi[i],y,'ln thin sk');P.dot(F.est[i],y,5.5,i?'fk':'fr');
    halo(T(P.top,P.X(F.hi[i])+6,P.Y(y)+5,nf(F.est[i],1)+'  ['+nf(F.lo[i],1)+', '+nf(F.hi[i],1)+']','','start'))})};

/* ---------- refutation and sensitivity (lab) ---------- */
FIG['ca-sens']=root=>{const svg=initSvg(svgOf(root),620,390);const Pv=CD.placebo.vals;const lo=-60,w=1.5,nb=50;const h=new Array(nb).fill(0);Pv.forEach(v=>{const k=Math.floor((v-lo)/w);if(k>=0&&k<nb)h[k]++});
  const P=Plot(svg,{at:[0,0],w:620,h:190,x:[lo,lo+w*nb],y:[0,Math.max(...h)*1.25],m:{l:50,r:14,t:30,b:40}});P.axes({xt:[-50,-40,-30,-20,-10,0,10],yt:[0,10,20],fx:v=>String(v).replace('-','−'),xl:'AIPW estimate (€)',yl:'count'});
  h.forEach((n,k)=>{if(n)P.rect(lo+k*w,0,lo+(k+1)*w,n,'').setAttribute('style','fill:#a6a6a6;stroke:#fff;stroke-width:0.5')});
  P.line(CD.ipw.aipw,0,CD.ipw.aipw,Math.max(...h)*1.25,'ln sr');T(svg,50,22,'200 placebo treatments','lab','start');halo(col(P.text(CD.ipw.aipw,Math.max(...h)*0.9,'real T: '+nf(CD.ipw.aipw,1),'lab','start',6,0),RED));
  const D=CD.placebo.drop;const rows=[['all four',CD.ipw.aipw,CB],['without age',D.age,CA],['without km',D.km,CA],['without claims',D.claims,CA],['without urban',D.urban,CA]];
  const Q=Plot(svg,{at:[0,190],w:620,h:200,x:[-90,0],y:[-0.6,4.6],m:{l:120,r:14,t:30,b:40}});Q.axes({xt:[-90,-75,-60,-45,-30,-15,0],yt:[],fx:v=>String(v).replace('-','−'),xl:'AIPW estimate (€)'});
  rows.forEach(([nm,v,c],i)=>{const y=4-i;Q.rect(v,y-0.32,0,y+0.32,'').setAttribute('style','fill:'+c+';fill-opacity:0.8');T(Q.root,112,Q.Y(y)+5,nm,'lab','end');col(T(Q.top,Q.X(v)+6,Q.Y(y)+5,nf(v,1),'lab','start'),'#fff')});
  Q.line(CD.po.ate,-0.6,CD.po.ate,4.6,'ln thin sk dash');T(svg,120,212,'hide one confounder (true ATE '+nf(CD.po.ate,1)+', dashed)','lab','start')};

/* ---------- difference-in-differences (toy) ---------- */
FIG['ca-did']=root=>{const svg=initSvg(svgOf(root),620,350);const P=Plot(svg,{at:[0,0],w:620,h:350,x:[-0.35,1.6],y:[400,570],m:{l:56,r:14,t:24,b:40}});
  P.axes({xt:[0,1],yt:[420,460,500,540],fx:v=>v?'2025 (after)':'2024 (before)',yl:'mean claim cost (€)'});
  P.line(0,520,1,540,'ln sb');P.line(0,470,1,440,'ln so');P.line(0,470,1,490,'ln so dash');
  [[0,520,CC],[1,540,CC],[0,470,CT],[1,440,CT]].forEach(([x,y,c])=>{const d=P.dot(x,y,6,'pt');d.setAttribute('fill',c)});const d=P.dot(1,490,6,'');d.setAttribute('fill','#fff');d.setAttribute('stroke',CT);d.setAttribute('stroke-width','2');
  halo(col(P.text(0,520,'region B (no programme): 520','lab','start',-10,-14),CC));halo(col(P.text(1,540,'540','lab','start',10,5),CC));
  halo(col(P.text(0,470,'region A: 470','lab','start',-10,26),'#c55a11'));halo(col(P.text(1,440,'440','lab','start',10,5),'#c55a11'));
  halo(col(P.text(1,490,'490: A without the programme','','start',10,5),'#c55a11'));
  brace(svg,P.X(1)-12,P.Y(490),P.Y(440),RED,'l');halo(col(P.text(1,465,'effect −50 €','lab','end',-26,5),RED));
  halo(P.text(0.75,535,'+20 € (B’s trend)','','middle',0,-12));halo(P.text(0.5,478,'parallel: +20 €','','middle',30,-6));
  T(svg,340,345,'toy numbers','')};

/* ---------- instrumental variable (toy) ---------- */
FIG['ca-iv']=root=>{const svg=initSvg(svgOf(root),620,340);const Z=[80,170],Tn=[290,170],Y=[510,170],U=[400,60];
  arr(svg,Z,Tn,30,30,'#595959',2.2);arr(svg,Tn,Y,30,30,CT,2.6);arr(svg,U,Tn,30,30,RED,1.8,'6 4');arr(svg,U,Y,30,30,RED,1.8,'6 4');
  E('path',{d:'M'+(Z[0]+18)+','+(Z[1]+26)+' Q295,290 '+(Y[0]-18)+','+(Y[1]+26),fill:'none',stroke:'#bfbfbf','stroke-width':1.8,'stroke-dasharray':'5 4'},svg);
  const m=[295,232];ln(svg,[m[0]-10,m[1]-10],[m[0]+10,m[1]+10],RED,3);ln(svg,[m[0]-10,m[1]+10],[m[0]+10,m[1]-10],RED,3);
  halo(T(svg,295,258,'no direct path: exclusion','','middle'));
  node(svg,Z,'Z',CA,30);node(svg,Tn,'T',CT,30);node(svg,Y,'Y',CB,30);node(svg,U,'U','#fff',30,{stroke:RED,sw:2,dash:'5 4',tcol:RED});
  T(svg,80,122,'letter','lab');T(svg,290,122,'joins','lab');T(svg,510,122,'claim cost','lab');col(T(svg,445,40,'driving style (unmeasured)','','start'),RED);
  T(svg,30,310,'first stage: joining 25 % → 45 % (+0.20)  ·  reduced form: 490 → 480 € (−10)  ·  Wald: −10 / 0.20 = −50 €','','start');T(svg,310,334,'toy numbers','')};

/* ---------- the four customer types (lab) ---------- */
FIG['ca-quad']=root=>{const svg=svgOf(root);const S=CD.types,Qd=CD.quad;
  const cells=[{ty:'sure thing',r:0,c:0,act:'call wasted'},{ty:'persuadable',r:0,c:1,act:'call saves her'},{ty:'sleeping dog',r:1,c:0,act:'call loses her'},{ty:'lost cause',r:1,c:1,act:'call wasted'}];
  const ORDER=[null,'sure thing','persuadable','lost cause','sleeping dog','all'];
  onInput(root,'q',()=>{const qv=+q(root,'q').value;setV(root,'q',qv+' / 5');initSvg(svg,620,360);const sel=ORDER[qv];
    const x0=78,y0=74,cw=110,ch=118;T(svg,x0+cw,24,'without a call','lab');T(svg,x0+cw/2,50,'stays','');T(svg,x0+1.5*cw,50,'leaves','');
    const ty=T(svg,22,y0+ch,'with a call','lab');ty.setAttribute('transform','rotate(-90 22 '+(y0+ch)+')');T(svg,62,y0+ch/2+5,'stays','','end');T(svg,62,y0+1.5*ch+5,'leaves','','end');
    cells.forEach(cl=>{const x=x0+cl.c*cw,y=y0+cl.r*ch,on=sel===cl.ty;E('rect',{x:x,y:y,width:cw-4,height:ch-4,rx:6,fill:on?TYC[cl.ty]:'#f5f5f5',stroke:TYC[cl.ty],'stroke-width':on?3:1.5},svg);
      const c=on?'#fff':'#1f1f1f';col(T(svg,x+cw/2-2,y+34,cl.ty+'s','lab'),on?'#fff':TYC[cl.ty]==='#70ad47'?'#385723':TYC[cl.ty]);col(T(svg,x+cw/2-2,y+64,pc(S[cl.ty]),'lab big'),c);col(T(svg,x+cw/2-2,y+92,cl.act,''),c)});
    const P=Plot(svg,{at:[300,0],w:320,h:360,x:[0,1],y:[-0.18,0.32],m:{l:50,r:10,t:40,b:40}});
    P.axes({xt:[0,0.25,0.5,0.75,1],yt:[-0.1,0,0.1,0.2,0.3],fx:v=>v?String(v):'0',fy:v=>nf(v,1),xl:'churn risk without a call',yl:'true uplift τ(x)'});P.line(0,0,1,0,'ln thin sk',P.bg);
    T(P.root,185,26,'500 lab customers','lab');
    Qd.p0.forEach((p,i)=>{const t=Qd.ty[i];const on=sel==='all'||sel===null||sel===t;const d=P.dot(p,Qd.u[i],on?3.2:2.2,'');d.setAttribute('fill',on?TYC[t]:'#e3e3e3');if(on&&sel!==null&&sel!=='all')d.setAttribute('stroke','#fff')});
    if(sel==='all'){halo(col(P.text(0.95,-0.06,'riskiest: lost causes,','','end',0,0),'#595959'));halo(col(P.text(0.95,-0.09,'uplift ≈ 0','','end',0,6),'#595959'))}
    T(svg,22,340,'ATE = '+pc(S.persuadable)+' − '+pc(S['sleeping dog'])+' = '+nf(100*(S.persuadable-S['sleeping dog']),2)+' points','','start')})};

/* ---------- meta-learners: three pipelines ---------- */
FIG['ca-meta']=root=>{const svg=initSvg(svgOf(root),1160,250);
  const panel=(x0,title,c)=>{E('rect',{x:x0,y:4,width:372,height:240,rx:10,fill:'#fafafa',stroke:c,'stroke-width':1.5},svg);T(svg,x0+186,28,title,'lab big')};
  const bx=(x,y,w,h,t,f)=>box(svg,x,y,w,h,t,f,{cls:'',lh:21});
  panel(4,'S-learner',CC);bx(24,60,120,46,'all data\n(X, T) → Y','#f2f2f2');arrowPx(svg,148,83,176,83,'ln thin sk','fk');bx(180,60,120,46,'one model\nμ̂(x, t)','#dae3f3');
  arrowPx(svg,240,110,240,140,'ln thin sk','fk');bx(130,144,220,46,'τ̂(x) = μ̂(x, 1) − μ̂(x, 0)','#fff2cc');T(svg,190,222,'predict twice, flipping t','');
  panel(394,'T-learner',CT);bx(414,52,110,40,'treated','#fbe5d6');bx(414,118,110,40,'controls','#dae3f3');arrowPx(svg,528,72,560,72,'ln thin sk','fk');arrowPx(svg,528,138,560,138,'ln thin sk','fk');
  bx(564,52,90,40,'μ̂₁(x)','#fbe5d6');bx(564,118,90,40,'μ̂₀(x)','#dae3f3');arrowPx(svg,658,72,690,100,'ln thin sk','fk');arrowPx(svg,658,138,690,112,'ln thin sk','fk');
  bx(694,84,64,40,'−','#fff2cc');T(svg,580,200,'τ̂(x) = μ̂₁(x) − μ̂₀(x)','lab');T(svg,580,224,'two models, half the data each','');
  panel(784,'X-learner',CB);bx(800,48,108,40,'μ̂₁, μ̂₀','#f2f2f2');T(svg,854,104,'(T-learner)','');arrowPx(svg,912,68,934,68,'ln thin sk','fk');
  bx(938,40,204,54,'impute: D̃¹ = Y − μ̂₀(x)\nD̃⁰ = μ̂₁(x) − Y','#e2f0d9');arrowPx(svg,1040,98,1040,120,'ln thin sk','fk');
  bx(938,124,204,40,'regress: τ̂₁(x), τ̂₀(x)','#e2f0d9');arrowPx(svg,1040,168,1040,186,'ln thin sk','fk');
  bx(880,190,262,40,'τ̂(x) = g τ̂₀(x) + (1 − g) τ̂₁(x)','#fff2cc');T(svg,840,160,'g = ê(x)','','middle')};

/* ---------- meta-learners on the lab data ---------- */
FIG['ca-learners']=root=>{const svg=svgOf(root);const C=CD.cate;
  const draw=l=>{const k=l+'-learner';const P=Plot(svg,{w:620,h:360,x:[-0.2,0.35],y:[-0.3,0.45],m:{l:56,r:14,t:40,b:40}});
    P.axes({xt:[-0.2,-0.1,0,0.1,0.2,0.3],yt:[-0.2,0,0.2,0.4],fx:v=>nf(v,1),fy:v=>nf(v,1),xl:'true uplift τ(x)',yl:'estimated τ̂(x)'});
    P.line(-0.2,-0.2,0.35,0.35,'ln thin sk dash',P.bg);C.true.forEach((t,i)=>{const d=P.dot(t,C[k][i],3,'');d.setAttribute('fill',l==='T'?CA:l==='S'?'#5b9bd5':CC);d.setAttribute('fill-opacity','0.6')});
    const M=C.metrics[k];T(svg,56,24,k+': RMSE '+nf(M.rmse,3)+', correlation '+nf(M.corr,2)+' (400 of 20,000 test customers)','lab','start');
    halo(P.text(0.3,0.3,'perfect','','end',-4,-8))};
  const cur=segs(root,'l',draw);draw(cur()||'S')};

/* ---------- Qini curve step by step (12 customers) ---------- */
const QT=[1,0,1,0,1,0,1,0,1,0,1,0],QY=[1,0,1,0,1,1,1,1,0,1,0,1];
FIG['ca-qini']=root=>{const svg=svgOf(root);
  const cum=[];let nt=0,nc=0,rt=0,rc=0;QT.forEach((t,i)=>{nt+=t;nc+=1-t;rt+=t*QY[i];rc+=(1-t)*QY[i];cum.push({nt,nc,rt,rc,q:rt-(nc?rc*nt/nc:0)})});
  const Qs=[0].concat(cum.map(c=>c.q));let area=0;for(let i=1;i<=12;i++)area+=(Qs[i-1]+Qs[i])/2/12;area-=Qs[12]/2;
  onInput(root,'k',()=>{const k=+q(root,'k').value;setV(root,'k',k);initSvg(svg,620,370);
    const cx=[20,60,108,146,176,206,236,270],hd=['k','called','stayed','n_t','n_c','r_t','r_c','Q(k)'];const y0=44,rh=24;
    E('rect',{x:4,y:y0-22,width:294,height:22,fill:CC},svg);hd.forEach((h,j)=>col(TT(svg,cx[j],y0-6,h,''),'#fff'));
    for(let i=0;i<12;i++){const y=y0+i*rh,c=cum[i],on=i<k,cur=i===k-1;
      E('rect',{x:4,y:y,width:294,height:rh,fill:cur?'#fff2cc':i%2?'#f5f7fb':'#fff',stroke:cur?GOLD:'none'},svg);
      T(svg,cx[0],y+17,String(i+1),'');const tc=dot(svg,cx[1],y+12,6,QT[i]?CT:CC,'none',0);T(svg,cx[2],y+17,QY[i]?'stay':'leave','').style.fill=QY[i]?'#385723':RED;
      if(on){[c.nt,c.nc,c.rt,c.rc].forEach((v,j)=>T(svg,cx[3+j],y+17,String(v),''));T(svg,cx[7],y+17,nf(c.q,2),'lab')}}
    col(T(svg,150,y0+12*rh+20,'orange = called, blue = not called','','middle'),'#595959');
    const P=Plot(svg,{at:[300,0],w:320,h:370,x:[0,12],y:[-1,3.6],m:{l:44,r:12,t:44,b:44}});P.axes({xt:[0,2,4,6,8,10,12],yt:[-1,0,1,2,3],fy:v=>String(v).replace('-','−'),xl:'top k customers called',yl:'Q(k)'});
    P.line(0,0,12,Qs[12],'ln thin sm dash',P.bg);halo(P.text(9,Qs[12]*0.75,'random','','middle',0,-8,P.bg));
    if(k===12){const pts=[];for(let i=0;i<=12;i++)pts.push([i,Qs[i]]);for(let i=12;i>=0;i--)pts.push([i,Qs[12]*i/12]);P.poly(pts,'fbs')}
    const pts=[];for(let i=0;i<=k;i++)pts.push([i,Qs[i]]);if(k>0)P.path(pts,'ln sb');pts.forEach(p=>P.dot(p[0],p[1],4,'fb pt'));
    T(P.root,170,26,k?'Q('+k+') = '+cum[k-1].rt+' − '+cum[k-1].rc+' · '+cum[k-1].nt+'/'+cum[k-1].nc+' = '+nf(cum[k-1].q,2):'Q(0) = 0','lab');
    if(k===12)halo(col(P.text(6,-0.6,'Qini coefficient = '+nf(area,2),'lab','middle',0,0),CC))})};

/* ---------- targeting: uplift curves (lab) ---------- */
FIG['ca-target']=root=>{const svg=svgOf(root);const C=CD.curves;const K=[['random','random','#7f7f7f','4 4'],['churn risk','churn risk',RED,''],['X-learner','X-learner',CC,''],['oracle (true uplift)','oracle','#1f1f1f','7 4']];
  onInput(root,'b',()=>{const b=+q(root,'b').value;setV(root,'b',b+' %');const P=Plot(svg,{w:620,h:360,x:[0,100],y:[-100,1650],m:{l:60,r:14,t:96,b:40}});
    P.axes({xt:[0,20,40,60,80,100],yt:[0,400,800,1200,1600],xl:'customers called (%), best first',yl:'extra customers retained'});
    K.forEach(([k,lab,c,da])=>{const p=P.path(C[k].u.map((v,i)=>[i,v]),'ln');p.setAttribute('style','stroke:'+c+';stroke-dasharray:'+(da||'none'));});
    P.line(b,-100,b,1650,'ln thin sy dash');
    K.forEach(([k,lab,c],j)=>{const v=C[k].u[b];const d=P.dot(b,v,5,'pt');d.setAttribute('fill',c);const x=12+(j%2)*300,y=22+Math.floor(j/2)*24;
      E('line',{x1:x,x2:x+22,y1:y-5,y2:y-5,stroke:c,'stroke-width':3},svg);T(svg,x+28,y,lab+': '+nf(v,0),'lab','start')});
    T(svg,12,76,'estimated from the randomised test set (20,000 customers) at '+b+' % called','','start')})};
})();
