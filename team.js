(()=>{
  const id=Number(new URLSearchParams(location.search).get('id'));
  const row=window.FMX_DEMO?.standings?.find(x=>Number(x.team.id)===id);
  const team=window.FMX_DEMO?.teams?.find(x=>Number(x.team.id)===id);
  FMX.setDataState(false,window.FMX_MANUAL?.updatedAt);
  if(!row && !team){
    FMX.$('teamContent').innerHTML='<div class="empty">Selecciona un equipo desde la sección de clubes.</div>';
    return;
  }
  const t=row?.team||team.team;
  document.title=`${t.name}: tabla y datos Liga MX Apertura 2026 | FútbolMX`;
  FMX.$('teamTitle').textContent=t.name;
  FMX.$('teamIntro').textContent=`Posición y datos actuales de ${t.name} en el Apertura 2026.`;
  const fx=(window.FMX_DEMO.fixtures||[]).filter(f=>Number(f.teams.home.id)===id||Number(f.teams.away.id)===id);
  FMX.$('teamContent').innerHTML=`
    <div class="tools">
      <article class="tool-card featured-tool"><span class="num">APERTURA 2026</span><h3>${FMX.esc(t.name)}</h3><p>${row?`#${row.rank} · ${row.points} puntos · ${row.all.played} PJ · DG ${row.goalsDiff>0?'+':''}${row.goalsDiff}`:'Club de Liga MX'}</p></article>
      <article class="tool-card"><span class="num">FORMA</span><h3>${row?FMX.esc(row.form.replaceAll('W','G').replaceAll('D','E').replaceAll('L','P')):'—'}</h3><p>Racha reciente registrada en la tabla manual.</p></article>
      <article class="tool-card"><span class="num">PRÓXIMOS</span><h3>${fx.length} destacado${fx.length===1?'':'s'}</h3><p>Partidos importantes cargados manualmente.</p></article>
    </div>
    <div class="cards" style="margin-top:18px">${fx.map(f=>`<${f.url?`a href="${FMX.esc(f.url)}"`:'article'} class="match"><div class="match-meta"><strong>${FMX.fmtDate(f.fixture.date)}</strong><span>${FMX.fmtTime(f.fixture.date)}</span></div><div class="match-body"><div class="mini-team">${FMX.logo('',f.teams.home.name)}<span>${FMX.esc(f.teams.home.name)}</span></div><span class="match-score">VS</span><div class="mini-team"><span>${FMX.esc(f.teams.away.name)}</span>${FMX.logo('',f.teams.away.name)}</div></div></${f.url?'a':'article'}>`).join('')}</div>`;
})();