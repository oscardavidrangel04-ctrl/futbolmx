const FMX = (()=>{
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const initials=name=>(name||'MX').split(/\s+/).map(x=>x[0]).join('').slice(0,3).toUpperCase();
  const fmtDate=d=>new Intl.DateTimeFormat('es-MX',{weekday:'short',day:'numeric',month:'short'}).format(new Date(d));
  const fmtTime=d=>new Intl.DateTimeFormat('es-MX',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(d));
  function logo(url,name,cls='mini-logo'){
    return url?`<img class="${cls}" src="${esc(url)}" alt="Escudo de ${esc(name)}" loading="lazy" referrerpolicy="no-referrer">`:`<span class="mini-fallback">${initials(name)}</span>`;
  }
  async function api(params={}){
    const q=new URLSearchParams(params);
    const r=await fetch(`/api/football?${q}`);
    if(!r.ok) throw new Error((await r.json().catch(()=>({}))).error||`Error ${r.status}`);
    return r.json();
  }
  function setDataState(live,updated){
    document.querySelectorAll('[data-state]').forEach(el=>{el.textContent=live?'Datos conectados':'Modo demostración';});
    document.querySelectorAll('[data-dot]').forEach(el=>el.classList.toggle('live',live));
    const t=$('lastUpdated');
    if(t) t.textContent=updated?`Actualizado ${new Date(updated).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'})}`:'API lista para conectar';
  }
  function nav(){
    const menu=$('menuBtn'), links=$('navLinks');
    if(!menu||!links) return;
    const close=()=>{links.classList.remove('open');menu.setAttribute('aria-expanded','false')};
    menu.addEventListener('click',()=>{
      const open=links.classList.toggle('open');
      menu.setAttribute('aria-expanded',String(open));
    });
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape') close()});
  }
  nav();
  return { $,esc,initials,fmtDate,fmtTime,logo,api,setDataState };
})();