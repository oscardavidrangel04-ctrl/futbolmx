const fs = require('fs');
const path = require('path');
const root = __dirname;

// Enlaces contextuales entre la intención amplia y las preguntas específicas.
// Nunca se crean páginas duplicadas para "final", "goleador" o "campeón".
const links = {
  'apertura-y-clausura-liga-mx.html': [
    ['como-se-organiza-un-torneo-de-liga-mx.html','Cómo se organiza un torneo'],
    ['formato-liguilla-liga-mx-2026.html','Formato de la Liguilla']
  ],
  'que-es-la-cantera-en-futbol.html': [
    ['jugadores-liga-mx.html','Cómo evaluar a los jugadores'],
    ['equipos.html','Clubes de Liga MX']
  ],
  'posiciones-de-futbol.html': [
    ['jugadores-liga-mx.html','Jugadores por posición'],
    ['estadisticas-liga-mx.html','Estadísticas por función']
  ],
  'como-funciona-el-var-en-liga-mx.html': [
    ['arbitros-liga-mx.html','El trabajo de los árbitros'],
    ['criterios-desempate-liga-mx.html','Reglas de competencia']
  ],
  'cuantos-equipos-tiene-liga-mx.html': [
    ['equipos.html','Directorio de equipos'],
    ['cuantos-partidos-tiene-liga-mx.html','Partidos de un torneo']
  ],
  'maximos-goleadores-historicos-liga-mx.html': [
    ['tabla-de-goleo-liga-mx.html','Goleadores del torneo actual'],
    ['ultimos-20-campeones-liga-mx.html','Campeones recientes']
  ],
  'como-se-organiza-un-torneo-de-liga-mx.html': [
    ['apertura-y-clausura-liga-mx.html','Apertura y Clausura'],
    ['formato-liguilla-liga-mx-2026.html','Formato de Liguilla']
  ],
  'estadios-de-liga-mx.html': [
    ['fan-id-liga-mx.html','FAN ID y acceso'],
    ['partidos.html','Próximos partidos']
  ],
  'quien-es-el-mejor-equipo-de-la-liga-mx.html': [
    ['campeones-liga-mx.html','Palmarés histórico'],
    ['tabla.html','Mejor equipo del torneo actual']
  ],
  'cual-es-el-equipo-mas-viejo-de-la-liga-mx.html': [
    ['historia-del-futbol-mexicano.html','Historia del fútbol mexicano'],
    ['equipos.html','Clubes participantes']
  ],
  'cuantos-puntos-se-necesitan-para-calificar-liguilla.html': [
    ['que-necesita-un-equipo-para-calificar-liguilla.html','Calcula el escenario de tu equipo'],
    ['simulador.html','Probar escenarios en el simulador']
  ],
  'que-necesita-un-equipo-para-calificar-liguilla.html': [
    ['cuantos-puntos-se-necesitan-para-calificar-liguilla.html','Por qué no hay una cifra fija'],
    ['criterios-desempate-liga-mx.html','Criterios de desempate']
  ],
  'diferencia-entre-repechaje-y-play-in-liga-mx.html': [
    ['play-in-liga-mx.html','Situación del Play-In'],
    ['formato-liguilla-liga-mx-2026.html','Formato vigente de la Liguilla']
  ],
  'ventaja-de-posicion-en-la-liguilla.html': [
    ['cuartos-de-final-liga-mx.html','Cruces de cuartos de final'],
    ['final-liga-mx.html','Por qué la final es distinta']
  ],
  'final-liga-mx.html': [
    ['semifinales-liga-mx.html','Camino a la final'],
    ['ventaja-de-posicion-en-la-liguilla.html','Ventaja de posición antes de la final']
  ],
  'tabla-de-goleo-liga-mx.html': [
    ['maximos-goleadores-historicos-liga-mx.html','Goleadores históricos']
  ],
  'campeones-liga-mx.html': [
    ['quien-es-el-mejor-equipo-de-la-liga-mx.html','Cómo definir al mejor equipo']
  ],
  'formato-liguilla-liga-mx-2026.html': [
    ['cuantos-puntos-se-necesitan-para-calificar-liguilla.html','Cuántos puntos se necesitan'],
    ['ventaja-de-posicion-en-la-liguilla.html','Ventaja de posición']
  ],
  'equipos.html': [
    ['cuantos-equipos-tiene-liga-mx.html','Cuántos equipos compiten'],
    ['cuando-juega-atlas.html','Cuándo juega Atlas'],
    ['cuando-juega-chivas.html','Cuándo juega Chivas'],
    ['cuando-juega-leon.html','Cuándo juega León'],
    ['cuando-juega-monterrey.html','Cuándo juega Monterrey'],
    ['cuando-juega-necaxa.html','Cuándo juega Necaxa'],
    ['cuando-juega-pachuca.html','Cuándo juega Pachuca'],
    ['cuando-juega-pumas.html','Cuándo juega Pumas'],
    ['cuando-juega-tigres.html','Cuándo juega Tigres'],
    ['cuando-juega-toluca.html','Cuándo juega Toluca']
  ],
  'arbitros-liga-mx.html': [
    ['como-funciona-el-var-en-liga-mx.html','Cómo funciona el VAR']
  ],
  'fan-id-liga-mx.html': [
    ['estadios-de-liga-mx.html','Guía para visitar estadios']
  ],
  'play-in-liga-mx.html': [
    ['diferencia-entre-repechaje-y-play-in-liga-mx.html','Diferencia entre repechaje y Play-In']
  ]
};

let added = 0;
for (const [file, targets] of Object.entries(links)) {
  const filePath = path.join(root, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const missing = targets.filter(([target]) => !html.includes(`href="${target}"`));
  if (!missing.length) continue;
  const block = `<div class="seo-related"><h2>Lecturas relacionadas</h2>${missing.map(([target, label]) => `<p><a href="${target}">${label} →</a></p>`).join('')}</div>`;
  if (html.includes('</aside>')) html = html.replace('</aside>', `${block}</aside>`);
  else if (html.includes('</main>')) html = html.replace('</main>', `<section class="section"><div class="container prose-card">${block}</div></section></main>`);
  else throw new Error(`No se encontró lugar de inserción: ${file}`);
  fs.writeFileSync(filePath, html, 'utf8');
  added += missing.length;
}
console.log(`Enlaces contextuales añadidos: ${added}`);

// El índice editorial debe estar a un clic desde el menú principal de cada página.
let navigationUpdated = 0;
for (const file of fs.readdirSync(root).filter(name => name.endsWith('.html') && !name.startsWith('google'))) {
  const filePath = path.join(root, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const nav = html.match(/<nav\b[^>]*class="navlinks"[^>]*>[\s\S]*?<\/nav>/i);
  if (!nav || nav[0].includes('href="articulos.html"')) continue;
  const updated = nav[0].replace('</nav>', '<a href="articulos.html">Artículos</a></nav>');
  html = html.replace(nav[0], updated);
  fs.writeFileSync(filePath, html, 'utf8');
  navigationUpdated++;
}
console.log(`Menús principales actualizados: ${navigationUpdated}`);
