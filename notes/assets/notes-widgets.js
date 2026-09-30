/* Notes pages (Quarto): draw the slide figures and give every scripted widget its own step buttons.
   A page loads ../../slides/assets/figures.js, then this file, then its topic's fig-<topic>.js
   (see notes/_metadata.yml). Widgets use exactly the slide markup: <div class="widget" data-fig="NAME"
   data-auto="k=1 :: caption | k=2 :: caption">. A scrolling page has no slide keys, so the data-auto
   script is played with ◀ ▶ buttons under the widget. The parser mirrors parseAuto() in slides/assets/deck.js. */
(function(){
'use strict';
function parseAuto(w){
  /* a step boundary is a '|' followed by 'key=' so captions may contain |z| */
  const steps=(w.dataset.auto||'').split(/\|(?=\s*[A-Za-z_][\w-]*\s*=)/).map(s=>s.trim()).filter(Boolean).map(s=>{const i=s.indexOf('::');const cap=i>=0?s.slice(i+2).trim():'';const set=(i>=0?s.slice(0,i):s).split(';').map(a=>a.trim()).filter(Boolean).map(a=>{const j=a.indexOf('=');return [a.slice(0,j).trim(),a.slice(j+1).trim()]}).filter(([k])=>/^[A-Za-z_][\w-]*$/.test(k));return {set,cap}});
  const init={};steps.forEach(st=>st.set.forEach(([k])=>{if(k in init)return;const inp=w.querySelector('input[data-k="'+k+'"]');
    if(inp)init[k]=inp.value;else{const on=w.querySelector('button[data-'+k+'][aria-pressed="true"]');init[k]=on?on.dataset[k]:null}}));
  return {steps,init}}
function setControl(w,k,v){const inp=w.querySelector('input[data-k="'+k+'"]');
  if(inp){if(String(inp.value)!==String(v)&&!(inp.type==='range'&&+inp.value===+v)){inp.value=v;inp.dispatchEvent(new Event('input',{bubbles:true}))}return}
  const btn=w.querySelector('button[data-'+k+'="'+v+'"]');if(btn&&btn.getAttribute('aria-pressed')!=='true')btn.click()}
function stepper(w){const A=parseAuto(w),n=A.steps.length;if(!n)return;
  const bar=document.createElement('div');bar.className='demo-bar';
  bar.innerHTML='<button type="button" class="prev" aria-label="Previous step">◀</button><button type="button" class="next" aria-label="Next step">▶</button><span class="demo-n" aria-live="polite"></span><button type="button" class="reset">Reset</button>';
  const cap=document.createElement('div');cap.className='demo-cap';cap.hidden=true;
  const from=w.querySelector(':scope > .from');w.insertBefore(bar,from);w.insertBefore(cap,from);
  const [bPrev,bNext]=bar.querySelectorAll('button'),bReset=bar.querySelector('.reset'),count=bar.querySelector('.demo-n');
  let cur=-1;
  function go(k){const was=cur;cur=Math.max(-1,Math.min(n-1,k));
    /* replay the script from the widget's initial state up to step cur, as the deck does */
    const st=Object.assign({},A.init);for(let s=0;s<=cur;s++)A.steps[s].set.forEach(([key,v])=>{if(key in A.init)st[key]=v});
    Object.keys(st).forEach(key=>{if(st[key]!==null)setControl(w,key,st[key])});
    /* one-shot buttons (key=click) fire only when a step is newly reached going forward */
    for(let s=was+1;s<=cur;s++)A.steps[s].set.forEach(([key,v])=>{if(v==='click'){const b=w.querySelector('button[data-k="'+key+'"]');if(b)b.click()}});
    const c=cur>=0?A.steps[cur].cap:'';cap.textContent=c?'▸ '+c:'';cap.hidden=!c;
    count.textContent=cur<0?'Guided demo, '+n+' steps':'Step '+(cur+1)+' of '+n;
    bPrev.disabled=cur<0;bNext.disabled=cur>=n-1;bReset.hidden=cur<0;w.classList.toggle('demo-on',cur>=0)}
  bPrev.addEventListener('click',()=>go(cur-1));bNext.addEventListener('click',()=>go(cur+1));bReset.addEventListener('click',()=>go(-1));
  go(-1)}
function boot(){if(!window.MLFIG){console.warn('notes-widgets: slides/assets/figures.js is not loaded');return}
  window.MLFIG.init();document.querySelectorAll('.widget[data-auto]').forEach(stepper)}
/* scripts at the end of the body run before DOMContentLoaded, so the topic's fig-<topic>.js is registered by then */
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
