/* Deck engine: scaling, footer (logo + page number), step reveals, scripted demo steps, keyboard/touch navigation,
   and chaining between topics (body[data-prev] / body[data-next]). */
(function(){
'use strict';
const stage=document.getElementById('stage');
const slides=[...stage.querySelectorAll(':scope > .slide')];
const base=(document.currentScript&&document.currentScript.src)?document.currentScript.src.replace(/deck\.js.*$/,''):'assets/';
slides.forEach((s,i)=>{const f=document.createElement('div');f.className='foot';const dark=s.classList.contains('cover');
  f.innerHTML='<div class="band"></div><img alt="Universidad de Navarra" src="'+base+'img/'+(dark?'unav-logo-white.png':'unav-logo.png')+'"><span class="pg">'+(i+1)+'</span>';s.appendChild(f)});
const nextDeck=document.body.dataset.next||'',prevDeck=document.body.dataset.prev||'';
const deckTitle=f=>f.replace(/^.*\//,'').replace(/^\d+_/,'').replace(/\.html.*$/,'').replace(/_/g,' ').replace(/^./,c=>c.toUpperCase());
const shown=new Array(slides.length).fill(0),applied=new Array(slides.length).fill(0);let cur=0;
const flowMQ=window.matchMedia('(max-width: 760px)');
const isFlow=()=>document.body.classList.contains('flow');

/* ---- steps: ".step" reveals and scripted demo steps ("data-auto" on a widget), in document order ----
   data-auto="k=20 :: caption | k=80 :: caption | mode=std" — steps separated by "|", assignments by ";".
   key=value sets <input data-k="key"> (fires "input") or clicks <button data-key="value">; key=click clicks <button data-k="key">. */
const autoCache=new WeakMap(),actCache=[];
function parseAuto(w){if(autoCache.has(w))return autoCache.get(w);
  /* a step boundary is a '|' followed by 'key=' so captions may contain |z| */
  const steps=(w.dataset.auto||'').split(/\|(?=\s*[A-Za-z_][\w-]*\s*=)/).map(s=>s.trim()).filter(Boolean).map(s=>{const i=s.indexOf('::');const cap=i>=0?s.slice(i+2).trim():'';const set=(i>=0?s.slice(0,i):s).split(';').map(a=>a.trim()).filter(Boolean).map(a=>{const j=a.indexOf('=');return [a.slice(0,j).trim(),a.slice(j+1).trim()]}).filter(([k])=>/^[A-Za-z_][\w-]*$/.test(k));return {set,cap}});
  const init={};steps.forEach(st=>st.set.forEach(([k])=>{if(k in init)return;const inp=w.querySelector('input[data-k="'+k+'"]');
    if(inp)init[k]=inp.value;else{const on=w.querySelector('button[data-'+k+'][aria-pressed="true"]');init[k]=on?on.dataset[k]:null}}));
  let cap=w.querySelector('.demo-cap');if(!cap){cap=document.createElement('div');cap.className='demo-cap';cap.hidden=true;w.appendChild(cap)}
  const A={steps,init,cap};autoCache.set(w,A);return A}
function setControl(w,k,v){const inp=w.querySelector('input[data-k="'+k+'"]');
  if(inp){if(String(inp.value)!==String(v)&&!(inp.type==='range'&&+inp.value===+v)){inp.value=v;inp.dispatchEvent(new Event('input',{bubbles:true}))}return}
  const btn=w.querySelector('button[data-'+k+'="'+v+'"]');if(btn&&btn.getAttribute('aria-pressed')!=='true')btn.click()}
function applyAuto(w,last){const A=parseAuto(w);const st=Object.assign({},A.init);
  for(let s=0;s<=last;s++)A.steps[s].set.forEach(([k,v])=>{if(k in A.init)st[k]=v});
  Object.keys(st).forEach(k=>{if(st[k]!==null)setControl(w,k,st[k])});
  const c=last>=0?A.steps[last].cap:'';A.cap.textContent=c?'▸ '+c:'';A.cap.hidden=!c;
  w.classList.toggle('demo-on',last>=0);w.classList.toggle('demo-done',last>=0&&last===A.steps.length-1)}
function actionsOf(i){if(actCache[i])return actCache[i];const list=[];
  slides[i].querySelectorAll('.step,[data-auto]').forEach(el=>{if(el.hasAttribute('data-auto')){parseAuto(el).steps.forEach((st,k)=>list.push({el,k,st}))}else list.push({el,step:true})});
  return actCache[i]=list}
function applySteps(i){const acts=actionsOf(i),n=shown[i],was=applied[i];applied[i]=n;
  acts.forEach((a,k)=>{if(a.step)a.el.classList.toggle('shown',k<n)});
  const widgets=[];acts.forEach(a=>{if(!a.step&&widgets.indexOf(a.el)<0)widgets.push(a.el)});
  widgets.forEach(w=>{let last=-1;acts.forEach((a,k)=>{if(a.el===w&&!a.step&&k<n)last=a.k});applyAuto(w,last)});
  /* one-shot buttons (key=click) fire only when newly reached going forward */
  for(let k=was;k<n;k++){const a=acts[k];if(a.step)continue;a.st.set.forEach(([key,v])=>{if(v==='click'){const b=a.el.querySelector('button[data-k="'+key+'"]');if(b)b.click()}})}}
const stepsOf=i=>actionsOf(i);

/* ---- navigation bar ---- */
const bar=document.createElement('nav');bar.id='bar';bar.setAttribute('aria-label','Slide navigation');
bar.innerHTML='<a href="index.html">← All topics</a><span class="ttl"></span><span class="prog"><i></i></span><button type="button" aria-label="Previous slide">←</button><span class="count"></span><button type="button" aria-label="Next slide">→</button>'+(nextDeck?'<a class="nx" href="'+nextDeck+'#1">Next: '+(document.body.dataset.nextTitle||deckTitle(nextDeck))+' →</a>':'');
document.body.appendChild(bar);bar.querySelector('.ttl').textContent=document.body.dataset.deck||document.title;
const [bPrev,bNext]=bar.querySelectorAll('button');
function render(){slides.forEach((s,i)=>s.classList.toggle('active',i===cur));applySteps(cur);
  bar.querySelector('.count').textContent=(cur+1)+' / '+slides.length;bar.querySelector('.prog i').style.width=(100*(cur+1)/slides.length)+'%';
  try{history.replaceState(null,'','#'+(cur+1))}catch(e){}}
function go(i,all){cur=Math.max(0,Math.min(slides.length-1,i));shown[cur]=all?stepsOf(cur).length:0;render()}
function next(){if(shown[cur]<stepsOf(cur).length){shown[cur]++;applySteps(cur)}else if(cur<slides.length-1)go(cur+1,false);else if(nextDeck)location.href=nextDeck+'#1'}
function prev(){if(shown[cur]>0){shown[cur]--;applySteps(cur)}else if(cur>0)go(cur-1,true);else if(prevDeck)location.href=prevDeck+'#last'}
function fit(){if(isFlow()){stage.style.transform='';return}const r=document.getElementById('viewport').getBoundingClientRect();stage.style.transform='scale('+Math.max(0.1,Math.min((r.width-20)/1280,(r.height-20)/720))+')'}
function setFlow(){document.body.classList.toggle('flow',flowMQ.matches);if(flowMQ.matches)slides.forEach(s=>s.querySelectorAll('.step').forEach(x=>x.classList.add('shown')));else applySteps(cur);fit()}
bPrev.addEventListener('click',prev);bNext.addEventListener('click',next);
document.addEventListener('keydown',e=>{if(isFlow()||e.metaKey||e.ctrlKey||e.altKey)return;const t=e.target;if(t&&/INPUT|SELECT|TEXTAREA/.test(t.tagName))return;
  const k=e.key;if(k==='ArrowRight'||k==='PageDown'||k===' '||k==='ArrowDown'){e.preventDefault();next()}else if(k==='ArrowLeft'||k==='PageUp'||k==='ArrowUp'){e.preventDefault();prev()}
  else if(k==='Home'){e.preventDefault();go(0)}else if(k==='End'){e.preventDefault();go(slides.length-1,true)}
  else if(k==='n'||k==='N'){if(nextDeck)location.href=nextDeck+'#1'}else if(k==='p'||k==='P'){if(prevDeck)location.href=prevDeck+'#1'}
  else if(k==='f'||k==='F'){const d=document.documentElement;try{document.fullscreenElement?document.exitFullscreen():d.requestFullscreen().catch(()=>{})}catch(err){}}});
let tx=null,ty=null;stage.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
stage.addEventListener('touchend',e=>{if(tx===null||isFlow())return;const c=e.changedTouches[0];const dx=c.clientX-tx,dy=c.clientY-ty;if(Math.abs(dx)>60&&Math.abs(dx)>2*Math.abs(dy)&&!(e.target.closest&&e.target.closest('input,button,a')))(dx<0?next:prev)();tx=null},{passive:true});
flowMQ.addEventListener?flowMQ.addEventListener('change',setFlow):flowMQ.addListener(setFlow);window.addEventListener('resize',fit);
if(window.MLFIG)window.MLFIG.init();
const hash=(location.hash||'').slice(1);let all=false;
if(hash==='last'){cur=slides.length-1;all=true}else{const h=parseInt(hash,10);if(h>=1&&h<=slides.length)cur=h-1}
if(all)shown[cur]=stepsOf(cur).length;
setFlow();render();
window.DECK={next,prev,go,slides:slides.length,steps:i=>stepsOf(i).length};
})();
