/* Deck engine: scaling, footer (logo + page number), step reveals, keyboard/touch navigation. */
(function(){
'use strict';
const stage=document.getElementById('stage');
const slides=[...stage.querySelectorAll(':scope > .slide')];
const base=(document.currentScript&&document.currentScript.src)?document.currentScript.src.replace(/deck\.js.*$/,''):'assets/';
slides.forEach((s,i)=>{const f=document.createElement('div');f.className='foot';const dark=s.classList.contains('cover');
  f.innerHTML='<div class="band"></div><img alt="Universidad de Navarra" src="'+base+'img/'+(dark?'unav-logo-white.png':'unav-logo.png')+'"><span class="pg">'+(i+1)+'</span>';s.appendChild(f)});
const shown=new Array(slides.length).fill(0);let cur=0;
const flowMQ=window.matchMedia('(max-width: 760px)');
const isFlow=()=>document.body.classList.contains('flow');
const stepsOf=i=>[...slides[i].querySelectorAll('.step')];
const applySteps=i=>stepsOf(i).forEach((s,k)=>s.classList.toggle('shown',k<shown[i]));
const bar=document.createElement('nav');bar.id='bar';bar.setAttribute('aria-label','Slide navigation');
bar.innerHTML='<a href="index.html">← All topics</a><span class="ttl"></span><span class="prog"><i></i></span><button type="button" aria-label="Previous slide">←</button><span class="count"></span><button type="button" aria-label="Next slide">→</button>';
document.body.appendChild(bar);bar.querySelector('.ttl').textContent=document.body.dataset.deck||document.title;
const [bPrev,bNext]=bar.querySelectorAll('button');
function render(){slides.forEach((s,i)=>s.classList.toggle('active',i===cur));applySteps(cur);
  bar.querySelector('.count').textContent=(cur+1)+' / '+slides.length;bar.querySelector('.prog i').style.width=(100*(cur+1)/slides.length)+'%';
  try{history.replaceState(null,'','#'+(cur+1))}catch(e){}}
function go(i,all){cur=Math.max(0,Math.min(slides.length-1,i));shown[cur]=all?stepsOf(cur).length:0;render()}
function next(){if(shown[cur]<stepsOf(cur).length){shown[cur]++;applySteps(cur)}else if(cur<slides.length-1)go(cur+1,false)}
function prev(){if(shown[cur]>0){shown[cur]--;applySteps(cur)}else if(cur>0)go(cur-1,true)}
function fit(){if(isFlow()){stage.style.transform='';return}const r=document.getElementById('viewport').getBoundingClientRect();stage.style.transform='scale('+Math.max(0.1,Math.min((r.width-20)/1280,(r.height-20)/720))+')'}
function setFlow(){document.body.classList.toggle('flow',flowMQ.matches);if(flowMQ.matches)slides.forEach(s=>s.querySelectorAll('.step').forEach(x=>x.classList.add('shown')));else applySteps(cur);fit()}
bPrev.addEventListener('click',prev);bNext.addEventListener('click',next);
document.addEventListener('keydown',e=>{if(isFlow()||e.metaKey||e.ctrlKey||e.altKey)return;const t=e.target;if(t&&/INPUT|SELECT|TEXTAREA/.test(t.tagName))return;
  const k=e.key;if(k==='ArrowRight'||k==='PageDown'||k===' '||k==='ArrowDown'){e.preventDefault();next()}else if(k==='ArrowLeft'||k==='PageUp'||k==='ArrowUp'){e.preventDefault();prev()}
  else if(k==='Home'){e.preventDefault();go(0)}else if(k==='End'){e.preventDefault();go(slides.length-1,true)}
  else if(k==='f'||k==='F'){const d=document.documentElement;try{document.fullscreenElement?document.exitFullscreen():d.requestFullscreen().catch(()=>{})}catch(err){}}});
let tx=null,ty=null;stage.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
stage.addEventListener('touchend',e=>{if(tx===null||isFlow())return;const c=e.changedTouches[0];const dx=c.clientX-tx,dy=c.clientY-ty;if(Math.abs(dx)>60&&Math.abs(dx)>2*Math.abs(dy)&&!(e.target.closest&&e.target.closest('input,button,a')))(dx<0?next:prev)();tx=null},{passive:true});
flowMQ.addEventListener?flowMQ.addEventListener('change',setFlow):flowMQ.addListener(setFlow);window.addEventListener('resize',fit);
const h=parseInt((location.hash||'').slice(1),10);if(h>=1&&h<=slides.length)cur=h-1;
if(window.MLFIG)window.MLFIG.init();
setFlow();render();
})();
