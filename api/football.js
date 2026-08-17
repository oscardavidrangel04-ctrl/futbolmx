
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

  // Preferir coincidencia exacta en México.
  const exact = list.find(x =>
    String(x?.league?.name || '').toLowerCase() === 'liga mx' &&
    String(x?.country?.name || '').toLowerCase() === 'mexico'
  );
  if (exact) return exact;

  // Luego cualquier Liga MX mexicana.
  const mx = list.find(x =>
    String(x?.league?.name || '').toLowerCase().includes('liga mx') &&
    String(x?.country?.name || '').toLowerCase() === 'mexico'
  );
  if (mx) return mx;

  // Último fallback: nombre parecido.
  return list.find(x =>
    String(x?.league?.name || '').toLowerCase().includes('liga mx')
  );
}

function latestSupportedSeason(leagueItem) {
  const seasons = [...(leagueItem?.seasons || [])]
    .filter(s => s?.year)
    .sort((a, b) => Number(b.year) - Number(a.year));

  const current = seasons.find(s => s.current);
  return current?.year || seasons[0]?.year || null;
}

export default async function handler(req, res) {
  try {
    const key = process.env.API_FOOTBALL_KEY;

    if (!key) {
      return res.status(500).json({
        error: 'API_FOOTBALL_KEY no está configurada'
      });
    }

    res.setHeader(
      'Cache-Control',
      's-maxage=900, stale-while-revalidate=1800'
    );

    const forcedLeague = process.env.API_FOOTBALL_LEAGUE_ID
      ? Number(process.env.API_FOOTBALL_LEAGUE_ID)
      : null;

    const forcedSeason = process.env.API_FOOTBALL_SEASON
      ? Number(process.env.API_FOOTBALL_SEASON)
      : null;

    let leagueItem = null;
    let leagueId = forcedLeague;

    // IMPORTANTE:
    // API-Football no permite usar "country" y "search" juntos.
    // Por eso primero buscamos solo por nombre.
    if (!leagueId) {
      const leaguesBySearch = await apiFetch(
        '/leagues?search=Liga%20MX',
        key
      );

      leagueItem = pickLigaMX(leaguesBySearch);

      // Si el search no encontró nada, consultar solo por país.
      if (!leagueItem) {
        const leaguesByCountry = await apiFetch(
          '/leagues?country=Mexico',
          key
        );
        leagueItem = pickLigaMX(leaguesByCountry);
      }

      if (!leagueItem) {
        return res.status(502).json({
          error: 'No se encontró Liga MX en API-Football',
          hint: 'Puedes definir API_FOOTBALL_LEAGUE_ID manualmente en Vercel.'
        });
      }

      leagueId = leagueItem.league.id;
    } else {
      const leagueLookup = await apiFetch(
        `/leagues?id=${leagueId}`,
        key
      );

      leagueItem = leagueLookup.response?.[0] || null;
    }

    let season = forcedSeason || latestSupportedSeason(leagueItem);

    if (!season) {
      season = new Date().getUTCFullYear();
    }

    const view = String(req.query.view || 'home');

    // Para fixtures "next" no hace falta combinarlo con season.
    // Esto evita incompatibilidades innecesarias.
    const standingsPromise = apiFetch(
      `/standings?league=${leagueId}&season=${season}`,
      key
    );

    const fixturesPromise = apiFetch(
      `/fixtures?league=${leagueId}&next=20`,
      key
    );

    const teamsPromise = apiFetch(
      `/teams?league=${leagueId}&season=${season}`,
      key
    );

    const [standingsR, fixturesR, teamsR] = await Promise.all([
      standingsPromise,
      fixturesPromise,
      teamsPromise
    ]);

    const standings =
      standingsR?.response?.[0]?.league?.standings?.[0] || [];

    const fixtures = fixturesR?.response || [];
    const teams = teamsR?.response || [];

    const common = {
      live: true,
      leagueId,
      season,
      leagueName: leagueItem?.league?.name || 'Liga MX',
      updatedAt: new Date().toISOString()
    };

    if (view === 'standings') {
      return res.status(200).json({
        ...common,
        standings
      });
    }

    if (view === 'fixtures') {
      return res.status(200).json({
        ...common,
        fixtures
      });
    }

    if (view === 'teams') {
      return res.status(200).json({
        ...common,
        teams
      });
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
