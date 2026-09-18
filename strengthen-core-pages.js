const fs = require('fs');
const path = require('path');

const root = __dirname;
const changed = [];
function update(file, transform) {
  const target = path.join(root, file);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    changed.push(file);
  }
}
function insertBeforeArticleEnd(source, marker, html) {
  if (source.includes(marker)) return source;
  const point = source.indexOf('</article>');
  if (point < 0) throw new Error(`Falta </article> para ${marker}`);
  return source.slice(0, point) + html + source.slice(point);
}

update('index.html', source => {
  const oldCard = '<a class="tool-card featured-tool" href="cruz-azul-vs-inter-miami.html"><span class="num">16 SEP</span><h3>Cruz Azul vs Inter Miami</h3><p>Horario y dónde ver la Campeones Cup.</p></a>';
  const newCard = '<a class="tool-card featured-tool" href="america-vs-chivas.html"><span class="num">19 SEP</span><h3>América vs Chivas</h3><p>Clásico Nacional: fecha, horario y contexto del partido.</p></a>';
  if (source.includes(oldCard)) source = source.replace(oldCard, newCard);
  if (!source.includes('href="como-funciona-el-var-en-liga-mx.html"')) {
    const marker = '<a class="tool-card" href="arbitros-liga-mx.html"><span class="num">ARBITRAJE</span><h3>Árbitros Liga MX</h3><p>Funciones y designaciones.</p></a>';
    if (!source.includes(marker)) throw new Error('No se encontró tarjeta de árbitros en inicio');
    source = source.replace(marker, marker + '<a class="tool-card" href="como-funciona-el-var-en-liga-mx.html"><span class="num">REGLAS</span><h3>Cómo funciona el VAR</h3><p>Qué puede revisarse y quién toma la decisión final.</p></a>');
  }
  return source;
});

update('arbitros-liga-mx.html', source => {
  source = source.replace('https://fmf.mx/comision-del-arbitro', 'https://arbitraje.fmf.mx/');
  source = source.replace('La cantidad cambia durante la temporada; distintas fuentes estadísticas registran alrededor de dos decenas de árbitros centrales utilizados.', 'No hay un número fijo por partido o temporada: consulta las designaciones oficiales para identificar al cuerpo arbitral de cada encuentro.');
  return insertBeforeArticleEnd(source, 'Cómo comprobar una designación arbitral', '<h2>Cómo comprobar una designación arbitral</h2><p>Busca primero la jornada y el partido en la <a href="https://arbitraje.fmf.mx/" rel="noopener noreferrer">Comisión de Árbitros de la FMF</a>. En la ficha de designación se distingue al árbitro central de los asistentes, el cuarto árbitro y el equipo de video. Un nombre incluido en esta guía no significa que esa persona dirigirá el siguiente partido de su club.</p><h2>Qué revisar si cambia el árbitro</h2><p>Las designaciones pueden actualizarse antes del encuentro. Compara la fecha de publicación del anuncio con la jornada que estás consultando y vuelve a verificar el mismo día del partido. Para entender el alcance de la asistencia de video, lee nuestra <a href="como-funciona-el-var-en-liga-mx.html">guía del VAR</a>; para la programación, consulta <a href="partidos.html">partidos de Liga MX</a>.</p>');
});

update('como-funciona-el-var-en-liga-mx.html', source => insertBeforeArticleEnd(source, 'Ejemplo práctico de revisión VAR', '<h2>Ejemplo práctico de revisión VAR</h2><p>Si se concede un gol y el VAR detecta un posible fuera de juego en la jugada que lo originó, puede recomendar una revisión. El árbitro mantiene su decisión inicial si las imágenes no muestran un error claro; si lo muestran, puede corregirla. Una comprobación silenciosa no implica necesariamente que el árbitro vaya a mirar el monitor.</p><h2>Qué no significa una revisión</h2><p>El VAR no vuelve a arbitrar todo el encuentro ni elimina las decisiones interpretativas. Las <a href="https://www.theifab.com/laws/latest/video-assistant-referee-var-protocol/" rel="noopener noreferrer">Reglas de Juego de IFAB</a> explican las situaciones revisables, el papel del árbitro y las extensiones introducidas para 2026–27, incluidas ciertas segundas amonestaciones claramente incorrectas. La aplicación concreta depende del protocolo autorizado para la competición.</p><p>Si buscas quién fue designado en un partido, consulta <a href="arbitros-liga-mx.html">árbitros de Liga MX</a> y la <a href="https://arbitraje.fmf.mx/" rel="noopener noreferrer">fuente oficial de la FMF</a>.</p>'));

update('liga-mx-femenil.html', source => insertBeforeArticleEnd(source, 'Qué cambió en Apertura 2026', '<h2>Qué cambió en Apertura 2026</h2><p>La fase regular pasó de una tabla única de 18 clubes a dos grupos de nueve. Según el anuncio del nuevo formato, cada equipo disputa 14 partidos —ocho dentro de su grupo y seis intergrupales— y los cuatro mejor ubicados de cada sector avanzan a la fase final. Esta diferencia importa al comparar tablas de temporadas anteriores: la posición en una tabla general antigua no determina por sí sola la clasificación en el sistema nuevo.</p><p>El cambio busca reducir la carga de partidos y los viajes. La <a href="https://www.bbva.com/es/mx/liga-femenil-bbva-estrena-esquema-de-competencia-y-relanza-su-imagen/" rel="noopener noreferrer">presentación de la Liga Femenil BBVA</a> explica el objetivo; el detalle de grupos y encuentros se documentó al anunciar el <a href="https://www.jornada.com.mx/noticia/2026/07/23/deportes/liga-femenil-cambiara-su-formato-de-competencia-para-el-apertura-2026" rel="noopener noreferrer">Apertura 2026</a>. Para seguir la fase decisiva, ve a <a href="cuartos-de-final-liga-mx-femenil.html">cuartos</a>, <a href="semifinales-liga-mx-femenil.html">semifinales</a> y <a href="campeonas-liga-mx-femenil.html">campeonas recientes</a>.</p>'));

update('descenso-liga-mx.html', source => insertBeforeArticleEnd(source, 'Ejemplo sencillo del cociente', '<h2>Ejemplo sencillo del cociente</h2><p>Si un club suma 30 puntos en 30 partidos del periodo considerado, su cociente es 1.000. Otro club con 24 puntos en 30 partidos tiene 0.800 y quedaría más abajo en esa comparación. El ejemplo sólo ilustra la división; para ordenar la tabla real hay que usar los partidos y periodos definidos en el reglamento de la temporada.</p><h2>Qué decía el reglamento 2025–26</h2><p>El <a href="https://fmf.mx/docs/reglamentos/497.pdf" rel="noopener noreferrer">reglamento de Liga MX publicado por la FMF</a> estableció que al terminar la temporada 2025–26 no habría descenso a Expansión MX y que los tres últimos de la tabla de cociente realizarían pagos al Fondo de Estabilización. Eso no confirma automáticamente la regla de temporadas posteriores. Antes de afirmar que volvió el ascenso o el descenso, debe consultarse el acuerdo oficial del ciclo correspondiente.</p><p>La <a href="tabla.html">tabla general</a> ordena el torneo corto; el cociente utiliza una ventana distinta. Confundirlas puede llevar a conclusiones equivocadas sobre el riesgo de un club.</p>'));

update('campeones-liga-mx.html', source => insertBeforeArticleEnd(source, 'Cómo contamos los títulos de liga', '<h2>Cómo contamos los títulos de liga</h2><p>Este recuento incluye campeonatos de primera división y separa el trofeo de liga de la Copa MX, la Concacaf Champions Cup y el Campeón de Campeones. Por eso dos tablas de “títulos totales” pueden dar cifras distintas aunque coincidan en campeonatos de liga. El <a href="https://cfcruzazul.com/los-datos-de-la-decima/" rel="noopener noreferrer">Club Cruz Azul documenta su décima liga en el Clausura 2026</a>.</p><p>Un torneo Apertura y un torneo Clausura entregan títulos distintos. Para revisar la secuencia reciente ve a <a href="ultimos-20-campeones-liga-mx.html">los últimos 20 campeones</a>; para comparar clubes más allá de una sola cifra, consulta <a href="quien-es-el-mejor-equipo-de-la-liga-mx.html">cómo evaluar al mejor equipo</a>. El Apertura 2026 se añadirá sólo cuando haya una final confirmada.</p>'));

update('cuando-juega-america.html', source => {
  source = source.replace('<strong>19 sep</strong><span>21:00</span>', '<strong>19 sep</strong><span>21:15</span>');
  source = source.replace('Actualización semanal', 'Verifica antes del partido');
  source = source.replace('Revisión: 13 sep 2026', 'Revisión: 16 sep 2026');
  source = source.replace('Actualizado 13 sep 2026', 'Actualizado 16 sep 2026');
  return insertBeforeArticleEnd(source, 'Confirmación del clásico de septiembre', '<h2>Confirmación del clásico de septiembre</h2><p>Para América vs Guadalajara del 19 de septiembre, la <a href="https://arbitraje.fmf.mx/" rel="noopener noreferrer">Comisión de Árbitros de la FMF</a> muestra las 21:15, horario del centro de México, en sus designaciones de Jornada 9. Los horarios pueden modificarse después de una primera publicación; verifica la ficha oficial antes de salir al estadio o buscar la transmisión.</p><p>Esta página reúne partidos de América, no resultados en directo. Si un encuentro ya se disputó, comprueba el marcador en <a href="resultados.html">resultados</a> y la programación general en <a href="calendario-liga-mx.html">calendario de Liga MX</a>.</p>');
});

update('cuando-juega-cruz-azul.html', source => {
  const oldCard = /<a class="match" href="cruz-azul-vs-inter-miami\.html">[\s\S]*?<\/a>/;
  if (oldCard.test(source)) source = source.replace(oldCard, '');
  source = source.replace('<strong>19 sep</strong><span>19:00</span>', '<strong>19 sep</strong><span>19:10</span>');
  source = source.replace('Actualización semanal', 'Verifica antes del partido');
  source = source.replace('Revisión: 13 sep 2026', 'Revisión: 16 sep 2026');
  source = source.replace('Actualizado 13 sep 2026', 'Actualizado 16 sep 2026');
  source = source.replace(/<script type="application\/ld\+json">(\{[^<]*\})<\/script>/, (whole, raw) => {
    const data = JSON.parse(raw);
    if (data['@type'] !== 'ItemList') return whole;
    data.itemListElement = data.itemListElement.filter(item => !item.name.includes('Inter Miami')).map((item, index) => ({...item, position:index + 1}));
    data.numberOfItems = data.itemListElement.length;
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  });
  return insertBeforeArticleEnd(source, 'Próximo encuentro de liga verificado', '<h2>Próximo encuentro de liga verificado</h2><p>Tras el partido internacional del 16 de septiembre, el siguiente encuentro de Liga MX en esta lista es Monterrey vs Cruz Azul el 19 de septiembre. Las <a href="https://arbitraje.fmf.mx/" rel="noopener noreferrer">designaciones de la FMF</a> muestran las 19:10, hora del centro de México. Confirma cualquier ajuste de última hora en la fuente oficial.</p><p>Si buscas el encuentro internacional ya disputado, consulta la <a href="cruz-azul-vs-inter-miami.html">ficha de Cruz Azul vs Inter Miami</a>; no lo presentamos como próximo partido. Para el torneo local, sigue <a href="monterrey-vs-cruz-azul.html">Monterrey vs Cruz Azul</a> y el <a href="calendario-liga-mx.html">calendario general</a>.</p>');
});

for (const [file, from, to] of [
  ['america-vs-chivas.html', '21:00', '21:15'],
  ['monterrey-vs-cruz-azul.html', '19:00', '19:10']
]) {
  update(file, source => {
    if (!source.includes(to)) source = source.replaceAll(from, to);
    return insertBeforeArticleEnd(source, 'Hora contrastada con FMF', `<h2>Hora contrastada con FMF</h2><p>La <a href="https://arbitraje.fmf.mx/" rel="noopener noreferrer">Comisión de Árbitros de la FMF</a> registra este partido de Jornada 9 a las ${to}, hora del centro de México. La programación puede cambiar; verifica la ficha oficial el día del encuentro.</p>`);
  });
}

update('cuando-juega-chivas.html', source => source.replaceAll('18:00', '21:15'));
update('cuando-juega-monterrey.html', source => source.replaceAll('19 sep · 19:00', '19 sep · 19:10').replace('sábado 19 de septiembre a las 19:00', 'sábado 19 de septiembre a las 19:10'));
for (const file of ['calendario-liga-mx.html', 'jornada-9-liga-mx-2026.html']) {
  update(file, source => source
    .replace(/(href="monterrey-vs-cruz-azul\.html"><div class="match-meta"><strong>[^<]+<\/strong><span>)19:00/, (_, prefix) => prefix + '19:10')
    .replace(/(href="america-vs-chivas\.html"><div class="match-meta"><strong>[^<]+<\/strong><span>)(?:18:00|21:00)/, (_, prefix) => prefix + '21:15'));
}
update('demo.js', source => source
  .replace("url:'monterrey-vs-cruz-azul.html',fixture:{id:3007,date:'2026-09-19T19:00:00-06:00'", "url:'monterrey-vs-cruz-azul.html',fixture:{id:3007,date:'2026-09-19T19:10:00-06:00'")
  .replace("url:'america-vs-chivas.html',fixture:{id:3008,date:'2026-09-19T18:00:00-06:00'", "url:'america-vs-chivas.html',fixture:{id:3008,date:'2026-09-19T21:15:00-06:00'"));

update('sitemap.xml', source => {
  for (const file of changed.filter(name => name.endsWith('.html'))) {
    const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const expression = new RegExp(`(<loc>https://futbolmx\\.vercel\\.app/${escaped}<\\/loc><lastmod>)[^<]+(</lastmod>)`);
    source = source.replace(expression, '$1' + '2026-09-16' + '$2');
  }
  return source;
});

console.log(JSON.stringify({changed, count:changed.length}, null, 2));
