const confirmedResults=(window.FMX_DEMO?.fixtures||[]).filter(FMX.isFinished).sort((a,b)=>new Date(b.fixture.date)-new Date(a.fixture.date));
function drawResults(list){
  document.getElementById('resultsGrid').innerHTML=list.length?list.map(f=>`<article class="match" id="partido-${f.fixture.id}"><div class="match-meta"><strong>${FMX.fmtDate(f.fixture.date)}</strong><span>${FMX.esc(f.league?.round||'')} · Finalizado</span></div><div class="match-body"><div class="mini-team">${FMX.logo('',f.teams.home.name)}<span>${FMX.esc(f.teams.home.name)}</span></div><span class="match-score">${f.goals.home} - ${f.goals.away}</span><div class="mini-team"><span>${FMX.esc(f.teams.away.name)}</span>${FMX.logo('',f.teams.away.name)}</div></div></article>`).join(''):'<p class="empty">No hay resultados finalizados para esta jornada en el corte disponible.</p>';
}
const resultRound=document.getElementById('resultsRound');
if(resultRound){
  const rounds=[...new Set(confirmedResults.map(f=>f.league?.round).filter(Boolean))];
  resultRound.innerHTML='<option value="">Todas las jornadas disponibles</option>'+rounds.map(r=>`<option value="${FMX.esc(r)}">${FMX.esc(r)}</option>`).join('');
  resultRound.closest('[data-query-controls]').hidden=false;
  resultRound.addEventListener('change',()=>drawResults(confirmedResults.filter(f=>!resultRound.value||f.league?.round===resultRound.value)));
}
FMX.setDataState(false,window.FMX_MANUAL?.updatedAt);
drawResults(confirmedResults);
