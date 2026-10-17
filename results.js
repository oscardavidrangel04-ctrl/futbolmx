const confirmedResults=(window.FMX_DEMO?.fixtures||[]).filter(FMX.isFinished).sort((a,b)=>new Date(b.fixture.date)-new Date(a.fixture.date));
function drawResults(list){
  document.getElementById('resultsGrid').innerHTML=list.length?list.map(f=>`<article class="match" id="partido-${f.fixture.id}"><div class="match-meta"><strong>${FMX.fmtDate(f.fixture.date)}</strong><span>${FMX.esc(f.league?.round||'')} · Finalizado</span></div><div class="match-body"><div class="mini-team">${FMX.logo('',f.teams.home.name)}<span>${FMX.esc(f.teams.home.name)}</span></div><span class="match-score">${f.goals.home} - ${f.goals.away}</span><div class="mini-team"><span>${FMX.esc(f.teams.away.name)}</span>${FMX.logo('',f.teams.away.name)}</div></div></article>`).join(''):'<p class="empty">No hay resultados finalizados que coincidan con esos filtros en el corte disponible.</p>';
}
const resultRound=document.getElementById('resultsRound');
const resultTeam=document.getElementById('resultsTeam'),resultVenue=document.getElementById('resultsVenue'),resultCount=document.getElementById('resultsCount');
const normalizeResult=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function filterResults(){
 const raw=normalizeResult(resultTeam?.value),query=({chivas:'guadalajara',rayados:'monterrey',aguilas:'america','la maquina':'cruz azul'})[raw]||raw;
 if(resultVenue){resultVenue.disabled=!query;if(!query)resultVenue.value='';}
 const venue=resultVenue?.value||'';
 const list=confirmedResults.filter(f=>(!resultRound?.value||f.league?.round===resultRound.value)&&(!query||(venue?[f.teams[venue]]:[f.teams.home,f.teams.away]).some(team=>normalizeResult(team.name).includes(query)||normalizeResult(team.name).includes(raw))));
 drawResults(list);if(resultCount)resultCount.textContent=list.length+' partidos de '+confirmedResults.length+' en el archivo. La condición requiere un equipo.';
}
resultTeam?.addEventListener('input',filterResults);resultVenue?.addEventListener('change',filterResults);
if(resultRound){
  const rounds=[...new Set(confirmedResults.map(f=>f.league?.round).filter(Boolean))];
  resultRound.innerHTML='<option value="">Todas las jornadas disponibles</option>'+rounds.map(r=>`<option value="${FMX.esc(r)}">${FMX.esc(r)}</option>`).join('');
  resultRound.closest('[data-query-controls]').hidden=false;
  resultRound.addEventListener('change',filterResults);
}
FMX.setDataState(false,window.FMX_MANUAL?.updatedAt);
filterResults();
