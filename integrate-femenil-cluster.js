const fs = require('fs');
const path = require('path');
const root = __dirname;
function edit(file, transform) {
  const target = path.join(root, file);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after !== before) fs.writeFileSync(target, after, 'utf8');
}
const cards = [
  ['cuartos-de-final-liga-mx-femenil.html', 'LIGUILLA FEMENIL', 'Cuartos de final de Liga MX Femenil', 'Cómo clasifican ocho clubes con el formato de grupos de 2026 y qué revisar antes de cada cruce.'],
  ['semifinales-liga-mx-femenil.html', 'LIGUILLA FEMENIL', 'Semifinales de Liga MX Femenil', 'Cómo se definen los cuatro semifinalistas y por qué no deben confundirse las reglas de temporadas distintas.'],
  ['campeonas-liga-mx-femenil.html', 'HISTORIA FEMENIL', 'Campeonas recientes de Liga MX Femenil', 'Pachuca, Tigres y América: títulos recientes verificados de Clausura 2025 a Clausura 2026.']
];
edit('articulos.html', source => {
  if (source.includes('href="cuartos-de-final-liga-mx-femenil.html"')) return source;
  const marker = '<a class="tool-card" href="jugadores-liga-mx.html">';
  if (!source.includes(marker)) throw new Error('No se encontró el punto de integración en artículos');
  const html = cards.map(([href, label, title, description]) => `<a class="tool-card" href="${href}"><span class="num">${label}</span><h2>${title}</h2><p>${description}</p></a>`).join('');
  return source.replace(marker, html + marker);
});
edit('liga-mx-femenil.html', source => {
  const old = '<h2>Cómo se disputa</h2><p>La temporada se divide en torneos cortos. Los clubes juegan una fase regular y los mejor clasificados avanzan a la Liguilla, donde las eliminatorias definen a la campeona. Fechas y criterios concretos pueden cambiar entre torneos.</p>';
  const replacement = '<h2>Cómo se disputa</h2><p>La temporada se divide en torneos cortos. Desde el Apertura 2026, la fase regular se organiza en dos grupos de nueve clubes; los cuatro mejores de cada grupo avanzan a la fase final. Este sistema sustituyó la clasificación de ocho equipos desde una tabla única utilizada en 2025-26. Los cruces, horarios y desempates deben confirmarse en el reglamento de cada edición.</p><p>Para entender la ruta al título, consulta los <a href="cuartos-de-final-liga-mx-femenil.html">cuartos de final</a>, las <a href="semifinales-liga-mx-femenil.html">semifinales</a> y las <a href="campeonas-liga-mx-femenil.html">campeonas recientes</a>.</p>';
  if (source.includes(old)) source = source.replace(old, replacement);
  else if (!source.includes('Desde el Apertura 2026')) throw new Error('No se encontró la sección de formato femenil');
  return source;
});
edit('sitemap.xml', source => {
  const missing = cards.filter(([file]) => !source.includes('/' + file));
  if (!missing.length) return source;
  return source.replace('</urlset>', missing.map(([file]) => `  <url><loc>https://futbolmx.vercel.app/${file}</loc><lastmod>2026-09-16</lastmod></url>`).join('\n') + '\n</urlset>');
});
console.log('Clúster femenil integrado en artículos, guía principal y sitemap.');
