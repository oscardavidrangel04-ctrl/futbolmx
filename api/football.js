
const BASE = 'https://v3.football.api-sports.io';

async function apiFetch(path, key) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-apisports-key': key }
  });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(`API HTTP ${res.status}: ${JSON.stringify(json)}`);
  }

  if (json.errors && Object.keys(json.errors).length) {
    throw new Error(`API error: ${JSON.stringify(json.errors)}`);
  }

  return json;
}

function pickLigaMX(leagues) {
  const list = leagues?.response || [];
  const exact = list.find(x =>
    String(x?.league?.name || '').toLowerCase() === 'liga mx' &&
    String(x?.country?.name || '').toLowerCase() === 'mexico'
  );
  if (exact) return exact;

  return list.find(x =>
    String(x?.league?.name || '').toLowerCase().includes('liga mx') &&
    String(x?.country?.name || '').toLowerCase().includes('mexico')
  );
}

function seasonSupported(leagueItem, candidate) {
  return (leagueItem?.seasons || []).some(s => Number(s.year) === Number(candidate));
}

function latestSupportedSeason(leagueItem) {
  const seasons = [...(leagueItem?.seasons || [])]
    .filter(s => s && s.year)
    .sort((a,b) => Number(b.year) - Number(a.year));
  return seasons[0]?.year;
}

export default async function handler(req, res) {
  try {
    const key = process.env.API_FOOTBALL_KEY;
    if (!key) {
      return res.status(500).json({ error: 'API_FOOTBALL_KEY no está configurada' });
    }

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

    const forcedLeague = process.env.API_FOOTBALL_LEAGUE_ID
      ? Number(process.env.API_FOOTBALL_LEAGUE_ID)
      : null;

    const forcedSeason = process.env.API_FOOTBALL_SEASON
      ? Number(process.env.API_FOOTBALL_SEASON)
      : null;

    // 1) Descubrir Liga MX y las temporadas que realmente ofrece la API.
    let leagueItem;
    let leagueId = forcedLeague;

    if (!leagueId) {
      const leagues = await apiFetch('/leagues?country=Mexico&search=Liga%20MX', key);
      leagueItem = pickLigaMX(leagues);

      if (!leagueItem) {
        // Fallback más amplio por si el buscador de la API cambia.
        const leagues2 = await apiFetch('/leagues?country=Mexico', key);
        leagueItem = pickLigaMX(leagues2);
      }

      if (!leagueItem) {
        return res.status(502).json({
          error: 'No se encontró Liga MX en API-Football',
          hint: 'Prueba definiendo API_FOOTBALL_LEAGUE_ID manualmente en Vercel.'
        });
      }

      leagueId = leagueItem.league.id;
    } else {
      const leagueLookup = await apiFetch(`/leagues?id=${leagueId}`, key);
      leagueItem = leagueLookup.response?.[0];
    }

    // 2) Elegir una temporada válida. No asumir 2026 si el plan/API no la expone.
    let season = forcedSeason;

    if (!season) {
      if (leagueItem) {
        // Preferir la temporada marcada como current; si no, la última disponible.
        const current = (leagueItem.seasons || []).find(s => s.current);
        season = current?.year || latestSupportedSeason(leagueItem);
      }

      // Último fallback: año actual UTC.
      if (!season) season = new Date().getUTCFullYear();
    }

    if (leagueItem && !seasonSupported(leagueItem, season)) {
      season = latestSupportedSeason(leagueItem);
    }

    if (!season) {
      return res.status(502).json({
        error: 'No se encontró una temporada válida de Liga MX',
        leagueId
      });
    }

    const view = String(req.query.view || 'home');

    // 3) Consultas.
    const [standingsR, fixturesR, teamsR] = await Promise.all([
      apiFetch(`/standings?league=${leagueId}&season=${season}`, key),
      apiFetch(`/fixtures?league=${leagueId}&season=${season}&next=20`, key),
      apiFetch(`/teams?league=${leagueId}&season=${season}`, key),
    ]);

    const standings =
      standingsR?.response?.[0]?.league?.standings?.[0] || [];

    const fixtures = fixturesR?.response || [];
    const teams = teamsR?.response || [];

    if (!standings.length && !fixtures.length && !teams.length) {
      return res.status(502).json({
        error: 'API-Football respondió, pero no devolvió datos de Liga MX',
        leagueId,
        season,
        debug: {
          standingsResults: standingsR?.results ?? null,
          fixturesResults: fixturesR?.results ?? null,
          teamsResults: teamsR?.results ?? null
        }
      });
    }

    // 4) Respuestas por vista, manteniendo compatibilidad con el front actual.
    const common = {
      live: true,
      leagueId,
      season,
      updatedAt: new Date().toISOString()
    };

    if (view === 'standings') {
      return res.status(200).json({ ...common, standings });
    }

    if (view === 'fixtures') {
      return res.status(200).json({ ...common, fixtures });
    }

    if (view === 'teams') {
      return res.status(200).json({ ...common, teams });
    }

    return res.status(200).json({
      ...common,
      standings,
      fixtures,
      teams
    });

  } catch (err) {
    console.error('football api error', err);

    return res.status(502).json({
      error: 'No se pudieron obtener los datos de Liga MX',
      detail: String(err?.message || err)
    });
  }
}
