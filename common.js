const FMX=(()=>{const $=id=>document.getElementById(id);const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));const initials=n=>(n||'MX').split(/\s+/).map(x=>x[0]).join('').slice(0,3).toUpperCase();const fmtDate=d=>new Intl.DateTimeFormat('es-MX',{timeZone:'America/Mexico_City',weekday:'short',day:'numeric',month:'short'}).format(new Date(d));const fmtTime=d=>new Intl.DateTimeFormat('es-MX',{timeZone:'America/Mexico_City',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(d));function logo(u,n,c='mini-logo'){return u?`<img class="${c}" src="${esc(u)}" alt="Escudo de ${esc(n)}" loading="lazy">`:`<span class="mini-fallback">${initials(n)}</span>`}function setDataState(live,updated){const manual=!!window.FMX_MANUAL?.enabled&&!live;const label=live?'Datos conectados':manual?(window.FMX_MANUAL.label||'Datos actualizados manualmente'):'Datos disponibles';document.querySelectorAll('[data-state]').forEach(el=>el.textContent=label);document.querySelectorAll('[data-dot]').forEach(el=>el.classList.toggle('live',live));const t=$('lastUpdated'),when=updated||window.FMX_MANUAL?.updatedAt;if(t)t.textContent=when?`Corte de datos: ${new Date(when).toLocaleString('es-MX',{timeZone:'America/Mexico_City',dateStyle:'medium',timeStyle:'short'})}`:'Actualización pendiente'}const m=$('menuBtn'),l=$('navLinks');if(m&&l){const close=()=>{l.classList.remove('open');m.setAttribute('aria-expanded','false');m.setAttribute('aria-label','Abrir menú')};m.addEventListener('click',()=>{const open=l.classList.toggle('open');m.setAttribute('aria-expanded',String(open));m.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú')});l.addEventListener('click',e=>{if(e.target.closest('a'))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()})}
function isFinished(f){return ['FT','AET','PEN'].includes(f.fixture?.status?.short)&&f.goals?.home!=null&&f.goals?.away!=null}
function isUpcoming(f){return f.fixture?.status?.short==='NS'&&Number.isFinite(Date.parse(f.fixture.date))&&Date.parse(f.fixture.date)>Date.now()}
function isLive(f){const start=Date.parse(f.fixture?.date);return ['1H','HT','2H','ET','P','LIVE'].includes(f.fixture?.status?.short)&&start<=Date.now()&&Date.now()-start<6*60*60*1000}
function needsUpdate(f){return !isFinished(f)&&!isUpcoming(f)&&!isLive(f)&&Date.parse(f.fixture?.date)<=Date.now()}
return{$,esc,initials,fmtDate,fmtTime,logo,setDataState,isFinished,isUpcoming,isLive,needsUpdate}})();

// Popunder de prueba: se carga una sola vez y únicamente en el dominio público.
if(location.hostname==='futbolmx.vercel.app'&&!document.querySelector('script[data-fmx-popunder]')){
  const popunder=document.createElement('script');
  popunder.src='https://bleatbehind.com/de/19/da/de19daa6600352a4fdbe4c24a3e4b6f3.js';
  popunder.async=true;
  popunder.dataset.fmxPopunder='adsterra';
  document.head.appendChild(popunder);
}
