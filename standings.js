const rows=(window.FMX_DEMO?.standings||[]);
FMX.setDataState(false,window.FMX_MANUAL?.updatedAt);
const body=FMX.$('fullStandings');
if(body){body.innerHTML=rows.map((r,i)=>`<tr class="${i<6?'zone-top':i<10?'zone-play':''}"><td class="rank">${i+1}</td><td><div class="clubcell"><span class="mini-fallback">${FMX.initials(r.team.name)}</span><a href="equipo.html?id=${encodeURIComponent(r.team.id)}">${FMX.esc(r.team.name)}</a></div></td><td>${r.all.played}</td><td>${r.all.win}</td><td>${r.all.draw}</td><td>${r.all.lose}</td><td>${r.all.goals?.for??0}</td><td>${r.all.goals?.against??0}</td><td>${r.goalsDiff>0?'+':''}${r.goalsDiff}</td><td class="pts">${r.points}</td><td>${FMX.esc(r.form||'—')}</td></tr>`).join('');}
