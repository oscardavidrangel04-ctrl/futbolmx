let data={...window.FMX_DEMO,live:false};

function renderFixtureCard(f){
  const s=f.fixture.status.short;
  const live=['1H','HT','2H','ET','P','LIVE'].includes(s);
  const score=(f.goals.home!=null||f.goals.away!=null)?`${f.goals.home??0} - ${f.goals.away??0}`:'VS';
  return `<${f.url?`a href="${FMX.esc(f.url)}"`:`article`} class="match">
    <div class="match-meta"><strong>${live?'EN VIVO':FMX.fmtDate(f.fixture.date)}</strong><span>${FMX.fmtTime(f.fixture.date)}</span></div>
    <div class="match-body">
      <div class="mini-team">${FMX.logo(f.teams.home.logo,f.teams.home.name)}<span>${FMX.esc(f.teams.home.name)}</span></div>
      <span class="match-score">${score}</span>
      <div class="mini-team"><span>${FMX.esc(f.teams.away.name)}</span>${FMX.logo(f.teams.away.logo,f.teams.away.name)}</div>
    </div>
  ${f.url?`</a>`:`</article>`}`;
}

function render(){
  const st=data.standings||[],fx=data.fixtures||[],teams=data.teams||[];
  FMX.setDataState(false,window.FMX_MANUAL?.updatedAt);

  const featured=fx[0];
  if(featured){
    FMX.$('featuredDate').textContent=`${FMX.fmtDate(featured.fixture.date)} · ${FMX.fmtTime(featured.fixture.date)}`;
    FMX.$('featuredVenue').textContent=featured.fixture.venue?.name||featured.fixture.venue?.city||'Sede por confirmar';
    FMX.$('featuredHome').textContent=featured.teams.home.name;
    FMX.$('featuredAway').textContent=featured.teams.away.name;
    FMX.$('featuredHomeLogo').innerHTML=FMX.logo(featured.teams.home.logo,featured.teams.home.name,'team-logo');
    FMX.$('featuredAwayLogo').innerHTML=FMX.logo(featured.teams.away.logo,featured.teams.away.name,'team-logo');
  }

  FMX.$('matchesGrid').innerHTML=fx.slice(0,6).map(renderFixtureCard).join('')||'<div class="empty">No hay próximos partidos disponibles.</div>';

  FMX.$('standingsBody').innerHTML=st.slice(0,12).map((r,i)=>`<tr class="${i<6?'zone-top':i<10?'zone-play':''}">
    <td class="rank">${i+1}</td>
    <td><div class="clubcell">${r.team.logo?`<img src="${FMX.esc(r.team.logo)}" alt="">`:`<span class="mini-fallback">${FMX.initials(r.team.name)}</span>`}<span>${FMX.esc(r.team.name)}</span></div></td>
    <td>${r.all.played}</td><td>${r.all.win}</td><td>${r.all.draw}</td><td>${r.all.lose}</td>
    <td>${r.goalsDiff>0?'+':''}${r.goalsDiff}</td><td class="pts">${r.points}</td>
    <td><div class="form">${(r.form||'').slice(-5).split('').map(x=>`<i class="${x}">${x==='W'?'G':x==='D'?'E':'P'}</i>`).join('')}</div></td>
  </tr>`).join('');

  const leader=st[0];
  if(leader){
    const leaderLogo=FMX.$('leaderLogo');
    if(leader.team.logo){
      leaderLogo.src=leader.team.logo; leaderLogo.style.display='block';
    }else{
      leaderLogo.style.display='none';
    }
    FMX.$('leaderName').textContent=leader.team.name;
    FMX.$('leaderPts').textContent=leader.points;
    FMX.$('leaderWins').textContent=leader.all.win;
    FMX.$('leaderGD').textContent=(leader.goalsDiff>0?'+':'')+leader.goalsDiff;
  }

  const show=teams.length?teams.slice(0,6):st.slice(0,6).map(x=>({team:x.team,venue:{}}));
  FMX.$('clubGrid').innerHTML=show.map(x=>`<a class="club-card" href="equipo.html?id=${encodeURIComponent(x.team.id)}">
    <span class="arrow">↗</span>
    ${x.team.logo?`<img src="${FMX.esc(x.team.logo)}" alt="Escudo ${FMX.esc(x.team.name)}">`:`<span class="logo-fallback">${FMX.initials(x.team.name)}</span>`}
    <b>${FMX.esc(x.team.name)}</b><small>${FMX.esc(x.venue?.name||'Ver ficha del club')}</small>
  </a>`).join('');
}

render();