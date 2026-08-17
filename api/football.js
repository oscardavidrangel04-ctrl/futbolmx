const BASE='https://v3.football.api-sports.io';
async function call(path,key){const r=await fetch(`${BASE}${path}`,{headers:{'x-apisports-key':key}});if(!r.ok)throw new Error(`API-Football ${r.status}`);const j=await r.json();if(j.errors&&Object.keys(j.errors).length)throw new Error(JSON.stringify(j.errors));return j.response||[]}
async function context(key){
 const configuredLeague=process.env.API_FOOTBALL_LEAGUE_ID;
 const configuredSeason=process.env.API_FOOTBALL_SEASON;
 if(configuredLeague&&configuredSeason)return{leagueId:configuredLeague,season:configuredSeason,name:'Liga MX'};
 const leagues=await call('/leagues?country=Mexico&current=true',key);
 const liga=leagues.find(x=>(x.league?.name||'').toLowerCase()==='liga mx')||leagues.find(x=>(x.league?.name||'').toLowerCase().includes('liga mx'));
 if(!liga)throw new Error('Liga MX no encontrada');
 return{leagueId:liga.league.id,season:(liga.seasons||[]).find(s=>s.current)?.year||(liga.seasons||[]).at(-1)?.year,name:liga.league.name};
}
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Método no permitido'});
 const key=process.env.API_FOOTBALL_KEY;if(!key)return res.status(503).json({error:'API_FOOTBALL_KEY no está configurada'});
 try{
  const {leagueId,season,name}=await context(key);const view=String(req.query.view||'home');let payload={league:{id:leagueId,name,season},updatedAt:new Date().toISOString()};
  if(view==='standings'){
   const raw=await call(`/standings?league=${leagueId}&season=${season}`,key);payload.standings=raw?.[0]?.league?.standings?.[0]||[];
  }else if(view==='fixtures'){
   payload.fixtures=await call(`/fixtures?league=${leagueId}&season=${season}&next=30&timezone=America%2FMexico_City`,key);
  }else if(view==='teams'){
   payload.teams=await call(`/teams?league=${leagueId}&season=${season}`,key);
  }else if(view==='team'){
   const team=String(req.query.team||'').replace(/[^0-9]/g,'');if(!team)return res.status(400).json({error:'Falta team'});
   const [teams,fixtures]=await Promise.all([call(`/teams?id=${team}`,key),call(`/fixtures?team=${team}&league=${leagueId}&season=${season}&next=8&timezone=America%2FMexico_City`,key)]);
   payload.team=teams[0]||null;payload.fixtures=fixtures;
  }else{
   const [standingsRaw,fixtures,teams]=await Promise.all([call(`/standings?league=${leagueId}&season=${season}`,key),call(`/fixtures?league=${leagueId}&season=${season}&next=9&timezone=America%2FMexico_City`,key),call(`/teams?league=${leagueId}&season=${season}`,key)]);
   payload.standings=standingsRaw?.[0]?.league?.standings?.[0]||[];payload.fixtures=fixtures;payload.teams=teams;
  }
  res.setHeader('Cache-Control','s-maxage=600, stale-while-revalidate=1800');
  return res.status(200).json(payload);
 }catch(e){console.error(e);return res.status(500).json({error:'No se pudieron obtener los datos de Liga MX'});}
}
