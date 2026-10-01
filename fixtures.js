let fixtures=window.FMX_DEMO.fixtures;let filter='all';
function draw(){
  const q=(FMX.$('search')?.value||'').toLowerCase();
  const list=fixtures.filter(f=>(!q||f.teams.home.name.toLowerCase().includes(q)||f.teams.away.name.toLowerCase().includes(q))&&(filter==='all'||(filter==='live'&&['1H','HT','2H','ET','P','LIVE'].includes(f.fixture.status.short))||(filter==='upcoming'&&f.fixture.status.short==='NS')));
  FMX.$('fixturesGrid').innerHTML=list.map(f=>{
    const inner=`<div class="match-meta"><strong>${FMX.fmtDate(f.fixture.date)}</strong><span>${FMX.fmtTime(f.fixture.date)} · ${FMX.esc(f.fixture.venue?.city||'')}</span></div><div class="match-body"><div class="mini-team">${FMX.logo(f.teams.home.logo,f.teams.home.name)}<span>${FMX.esc(f.teams.home.name)}</span></div><span class="match-score">${f.goals.home!=null?`${f.goals.home} - ${f.goals.away}`:'VS'}</span><div class="mini-team"><span>${FMX.esc(f.teams.away.name)}</span>${FMX.logo(f.teams.away.logo,f.teams.away.name)}</div></div>${f.url?'<div class="scoreboard-foot"><span>Previa, horario y transmisión</span><span>Ver partido →</span></div>':''}`;
    return f.url?`<a class="match" href="${FMX.esc(f.url)}">${inner}</a>`:`<article class="match">${inner}</article>`;
  }).join('')||'<div class="empty">No encontramos partidos con ese filtro.</div>';
}
FMX.$('search').addEventListener('input',draw);
FMX.$('statusFilter').addEventListener('change',e=>{filter=e.target.value;draw()});
FMX.setDataState(false,window.FMX_MANUAL?.updatedAt);
draw();