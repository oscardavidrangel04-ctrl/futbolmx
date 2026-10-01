param([string]$Root = $PSScriptRoot)

$ErrorActionPreference = 'Stop'
$issues = [System.Collections.Generic.List[string]]::new()
$htmlFiles = Get-ChildItem -LiteralPath $Root -Filter '*.html' -File
$sitemapPath = Join-Path $Root 'sitemap.xml'
$sitemap = Get-Content -LiteralPath $sitemapPath -Raw
$redirectSources = @((Get-Content -LiteralPath (Join-Path $Root 'vercel.json') -Raw | ConvertFrom-Json).redirects.source)

foreach ($file in $htmlFiles) {
  if ($file.Name -like 'google*.html') { continue }
  $content = Get-Content -LiteralPath $file.FullName -Raw
  foreach ($required in @('<title>', 'name="description"', 'rel="canonical"', '<h1')) {
    if ($content -notmatch [regex]::Escape($required)) { $issues.Add("$($file.Name): falta $required") }
  }
  if ($content -notmatch 'property="og:image"') { $issues.Add("$($file.Name): falta og:image") }
  $links = [regex]::Matches($content, '(?:href|src)="([^"]+)"')
  foreach ($link in $links) {
    $target = $link.Groups[1].Value.Split('?')[0].Split('#')[0]
    if ($target -and $target -notmatch '^(https?:|/|#|mailto:|tel:|data:)') {
      if (-not (Test-Path -LiteralPath (Join-Path $Root $target))) { $issues.Add("$($file.Name): enlace local roto ($target)") }
    }
  }
  $canonical = [regex]::Match($content, 'rel="canonical"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*rel="canonical"')
  if ($canonical.Success) {
    $url = if ($canonical.Groups[1].Value) { $canonical.Groups[1].Value } else { $canonical.Groups[2].Value }
    $canonicalPath = ([uri]$url).AbsolutePath
    if ($sitemap -notmatch [regex]::Escape($url) -and $redirectSources -notcontains $canonicalPath) { $issues.Add("$($file.Name): canonical no incluida en sitemap") }
  }
}

$dataFile = Join-Path $Root 'demo.js'
$data = Get-Content -LiteralPath $dataFile -Raw
$rows = [regex]::Matches($data, 'points:(-?\d+).*?goalsDiff:(-?\d+).*?all:\{played:(\d+),win:(\d+),draw:(\d+),lose:(\d+),goals:\{for:(\d+),against:(\d+)\}\}')
foreach ($row in $rows) {
  $points, $goalDiff, $played, $wins, $draws, $losses, $goalsFor, $goalsAgainst = $row.Groups[1..8].Value | ForEach-Object { [int]$_ }
  if ($points -ne ($wins * 3 + $draws)) { $issues.Add("demo.js: puntos inconsistentes en una fila de tabla") }
  if ($played -ne ($wins + $draws + $losses)) { $issues.Add("demo.js: PJ no coincide con G/E/P en una fila de tabla") }
  if ($goalDiff -ne ($goalsFor - $goalsAgainst)) { $issues.Add("demo.js: DG no coincide con GF/GC en una fila de tabla") }
}

if ($issues.Count) {
  $issues | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Output "Validación completada: $($htmlFiles.Count) archivos HTML, sitemap, enlaces y tabla manual sin incidencias."
