const fs=require('fs'),p=require('path');
const root=__dirname, base='https://futbolmx.vercel.app/';
const files=fs.readdirSync(root).filter(f=>f.endsWith('.html')&&!f.startsWith('google'));
const html=new Map(files.map(f=>[f,fs.readFileSync(p.join(root,f),'utf8')]));
const sitemap=fs.readFileSync(p.join(root,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const robots=fs.readFileSync(p.join(root,'robots.txt'),'utf8');
const redirects=new Set(JSON.parse(fs.readFileSync(p.join(root,'vercel.json'),'utf8')).redirects.map(x=>x.source));
const problems=[], inbound=new Map(files.map(f=>[f,0]));
const titleMap=new Map(), descMap=new Map();
for(const [file,source] of html){
  const canonical=source.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"|<link[^>]*href="([^"]+)"[^>]*rel="canonical"/i);
  const expected=base+(file==='index.html'?'':file);
  const actual=canonical?.[1]||canonical?.[2];
  if(actual!==expected)problems.push(`${file}: canonical ${actual||'ausente'} != ${expected}`);
  if(!urls.includes(expected)&&!redirects.has('/'+file))problems.push(`${file}: falta en sitemap`);
  const title=source.match(/<title>(.*?)<\/title>/i)?.[1];
  const desc=source.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)?.[1];
  if(title){if(titleMap.has(title))problems.push(`Título duplicado: ${file} y ${titleMap.get(title)}`);titleMap.set(title,file)}
  if(desc){if(descMap.has(desc))problems.push(`Descripción duplicada: ${file} y ${descMap.get(desc)}`);descMap.set(desc,file)}
  for(const match of source.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)){
    try{const schema=JSON.parse(match[1]);if(!schema['@context']||(!schema['@type']&&!Array.isArray(schema['@graph'])))problems.push(`${file}: schema incompleto`)}catch(e){problems.push(`${file}: JSON-LD inválido: ${e.message}`)}
  }
  for(const match of source.matchAll(/href="([^"]+\.html)(?:[?#][^"]*)?"/gi)){
    const target=match[1].split('/').pop();
    if(inbound.has(target)&&target!==file)inbound.set(target,inbound.get(target)+1);
  }
}
for(const url of urls){const file=url===base?'index.html':url.slice(base.length);if(!html.has(file))problems.push(`Sitemap apunta a HTML inexistente: ${url}`)}
if(new Set(urls).size!==urls.length)problems.push('URLs duplicadas en sitemap');
if(!robots.includes(`Sitemap: ${base}sitemap.xml`))problems.push('robots.txt no anuncia el sitemap');
for(const [file,count] of inbound)if(count===0&&file!=='index.html'&&!redirects.has('/'+file))problems.push(`Página huérfana: ${file}`);
console.log(JSON.stringify({html:files.length,indexableHtml:files.filter(f=>f==='index.html'||!redirects.has('/'+f)).length,sitemapUrls:urls.length,schemaPages:[...html.values()].filter(x=>x.includes('application/ld+json')).length,internalLinks:[...inbound.values()].reduce((a,b)=>a+b,0),orphans:[...inbound].filter(([f,n])=>n===0&&f!=='index.html'&&!redirects.has('/'+f)).map(([f])=>f),problems},null,2));
if(problems.length)process.exitCode=1;
