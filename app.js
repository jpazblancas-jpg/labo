let current=0,axis=0,busy=false;const stage=document.querySelector('#stage'),ambient=document.querySelector('#ambient'),index=document.querySelector('#index');
const palettes=[['#f9c677','#ed705d','#acd2e8','#92aac1'],['#efcbe7','#b58acb','#b0d5ea','#b1a6cf'],['#80b4d1','#ff9861','#3678b7','#839dc1']];
function safe(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function words(s){return s.split(' ').map((w,i)=>`<span style="--i:${i}">${safe(w)}</span>`).join(' ')}
function render(){const s=slides[current],p=palettes[Math.floor(current/2)%3];ambient.style.background=`radial-gradient(ellipse at 88% 12%,${p[0]} 0,transparent 48%),radial-gradient(ellipse at 100% 90%,${p[1]} 0,transparent 55%),radial-gradient(ellipse at 0 85%,${p[2]} 0,transparent 58%),${p[3]}`;let content='';if(s.type==='axes'){content=`<div class="body"><div class="axis-tabs" role="tablist" aria-label="Ejes del laboratorio">${s.axes.map((a,i)=>`<button role="tab" aria-selected="${i===axis}" aria-label="${safe(a[0])}" data-axis="${i}">${i+1}</button>`).join('')}</div><div class="axis-content" role="tabpanel"><h2>${safe(s.axes[axis][0])}</h2><p>${safe(s.axes[axis][1])}</p></div></div>`}else if(s.type==='list'){content=`<ol class="list body">${s.body.map((t,i)=>`<li><span>${safe(t)}</span></li>`).join('')}</ol>`}else{content=`<div class="body">${s.body.map(t=>`<p>${safe(t)}</p>`).join('')}</div>`}stage.innerHTML=`<article class="slide ${s.type==='cover'?'cover':''} ${s.diagram?'with-diagram':''}">${s.title?`<h1>${words(s.title)}</h1>`:''}${content}${s.diagram?`<img class="source-diagram" src="diagram${s.diagram}.svg" alt="${s.diagram===1?'ARQ., DAIE, DP, DGD, COM. Ciencias de la Creatividad. Investigación · Colaboración · Innovación':'Investigación, Diseño, Tecnología, Evaluación. Prototipo interdisciplinario. Implementación y resultados'}">`:''}</article>`;document.querySelector('#counter').textContent=`${String(current+1).padStart(2,'0')} / ${slides.length}`;document.querySelector('#progress').style.width=`${(current+1)/slides.length*100}%`;document.querySelector('#prev').disabled=current===0;document.querySelector('#next').disabled=current===slides.length-1;document.querySelectorAll('nav button').forEach((b,i)=>b.setAttribute('aria-current',i===current));stage.querySelectorAll('[data-axis]').forEach(b=>b.onclick=()=>{axis=+b.dataset.axis;render()});document.title=`${s.label} · Laboratorio`;}
async function go(n){
 n=Math.max(0,Math.min(slides.length-1,n));if(n===current||busy)return;
 const direction=n>current?1:-1;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 busy=true;
 try{
  const outgoing=stage.querySelector('.slide');
  if(outgoing&&!reduced){
   const exit=outgoing.animate([
    {opacity:1,transform:'translateZ(0px)',filter:'blur(0px)'},
    {opacity:0,transform:`translateZ(${direction>0?380:-600}px)`,filter:'blur(10px)'}
   ],{duration:420,easing:'cubic-bezier(.4,0,.8,.3)',fill:'forwards'});
   await exit.finished;
  }
  current=n;axis=0;
  stage.style.setProperty('--entry-z',direction>0?'-750px':'380px');
  history.replaceState(null,'',`#${n+1}`);render();
 }finally{busy=false}
}
function menu(open){index.hidden=!open;document.querySelector('#menu').setAttribute('aria-expanded',open);if(open)document.querySelector('#close').focus();else document.querySelector('#menu').focus()}
document.querySelector('nav').innerHTML=slides.map((s,i)=>`<button data-slide="${i}"><small>${String(i+1).padStart(2,'0')}</small>${safe(s.label)}</button>`).join('');document.querySelectorAll('[data-slide]').forEach(b=>b.onclick=()=>{go(+b.dataset.slide);menu(false)});document.querySelector('#prev').onclick=()=>go(current-1);document.querySelector('#next').onclick=()=>go(current+1);document.querySelector('#menu').onclick=()=>menu(index.hidden);document.querySelector('#close').onclick=()=>menu(false);document.querySelector('#full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{document.querySelector('#full').textContent='Usa la opción de pantalla completa de tu navegador'}};
document.addEventListener('keydown',e=>{if(e.key==='Escape')menu(false);if(!index.hidden)return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(current+1)}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1)}if(e.key==='Home')go(0);if(e.key==='End')go(slides.length-1)});let touchX=0;stage.addEventListener('touchstart',e=>touchX=e.changedTouches[0].clientX,{passive:true});stage.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-touchX;if(Math.abs(d)>65)go(current+(d<0?1:-1))},{passive:true});window.addEventListener('hashchange',()=>{const n=parseInt(location.hash.slice(1));if(n>=1&&n<=slides.length){go(n-1)}});current=Math.max(0,Math.min(slides.length-1,(parseInt(location.hash.slice(1))||1)-1));render();
