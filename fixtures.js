const fixtures=window.FMX_DEMO?.fixtures||[];
let filter='upcoming';
const normalized=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function draw(){
  const q=normalized(FMX.$('search')?.value);
  const round=FMX.$('fixtureRound')?.value||'';
  const list=fixtures.filter(f=>(!q||normalized(f.teams.home.name+' '+f.teams.away.name).includes(q))&&(!round||f.league?.round===round)&&(filter==='all'||(filter==='finished'&&FMX.isFinished(f))||(filter==='upcoming'&&FMX.isUpcoming(f))||(filter==='live'&&FMX.isLive(f))||(filter==='pending'&&FMX.needsUpdate(f)))).sort((a,b)=>filter==='finished'?new Date(b.fixture.date)-new Date(a.fixture.date):new Date(a.fixture.date)-new Date(b.fixture.date));
  FMX.$('fixturesGrid').innerHTML=list.map(f=>{
    const label=FMX.isFinished(f)?'Finalizado':FMX.needsUpdate(f)?'Sin resultado actualizado':FMX.isUpcoming(f)?'Programado':FMX.isLive(f)?'En juego':'Estado por confirmar';
    const score=f.goals?.home!=null&&f.goals?.away!=null?`${f.goals.home} - ${f.goals.away}`:'—';
    const inner=`<div class="match-meta"><strong>${FMX.fmtDate(f.fixture.date)}</strong><span>${FMX.fmtTime(f.fixture.date)} CDMX</span></div><p>${FMX.esc(f.league?.round||'')} · ${label}</p><div class="match-body"><div class="mini-team">${FMX.logo(f.teams.home.logo,f.teams.home.name)}<span>${FMX.esc(f.teams.home.name)}</span></div><span class="match-score">${score}</span><div class="mini-team"><span>${FMX.esc(f.teams.away.name)}</span>${FMX.logo(f.teams.away.logo,f.teams.away.name)}</div></div>${f.url?'<div class="scoreboard-foot"><span>Ficha del encuentro</span><span>Ver partido →</span></div>':''}`;
    return f.url?`<a class="match" href="${FMX.esc(f.url)}">${inner}</a>`:`<article class="match">${inner}</article>`;
  }).join('')||'<div class="empty">No hay partidos para estos filtros en el corte disponible. Prueba «Todos» para consultar el archivo. La ausencia de programación futura no significa que no haya partidos oficiales.</div>';
  const count=FMX.$('fixtureCount');if(count)count.textContent=`${list.length} encuentros encontrados.`;
}
FMX.$('search')?.addEventListener('input',draw);
const statusFilter=FMX.$('statusFilter');
if(statusFilter){statusFilter.value=filter;statusFilter.addEventListener('change',e=>{filter=e.target.value;draw()})}
const fixtureRound=FMX.$('fixtureRound');
if(fixtureRound){fixtureRound.innerHTML='<option value="">Todas las jornadas</option>'+[...new Set(fixtures.map(f=>f.league?.round).filter(Boolean))].map(r=>`<option value="${FMX.esc(r)}">${FMX.esc(r)}</option>`).join('');fixtureRound.addEventListener('change',draw);fixtureRound.closest('[data-query-controls]').hidden=false}
FMX.setDataState(false,window.FMX_MANUAL?.updatedAt);
draw();
