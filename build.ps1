# Genera il sito statico (IT in radice, EN in /en, DE in /de) da src/template.html + src/lang/*.json
# Uso:  powershell -ExecutionPolicy Bypass -File build.ps1
param(
  # Dominio finale (serve per canonical, hreflang e Open Graph). Da cambiare al go-live.
  [string]$Site = "https://garnidellalocanda.it",
  # Base delle immagini. Ora puntano al sito attuale (WordPress); sostituire con "assets/img" dopo aver scaricato/ottimizzato le foto.
  [string]$Img  = "https://locandaelisa.it/wp-content/uploads",
  # Aggiunge <meta name="robots" content="noindex">: da usare per le anteprime (es. GitHub Pages), non per il go-live.
  [switch]$NoIndex,
  # Pagina "il nuovo sito è in arrivo" in radice; il sito completo va in /anteprima/ (noindex) finché non è pronto.
  [switch]$ComingSoon
)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$siteRoot = Join-Path $root "site"
$out  = $siteRoot
$publicSite = $Site.TrimEnd("/")
if ($ComingSoon) {
  $out = Join-Path $siteRoot "anteprima"
  $Site = "$publicSite/anteprima"
  $NoIndex = $true
}
$utf8 = New-Object System.Text.UTF8Encoding($false)

$tpl = [IO.File]::ReadAllText((Join-Path $root "src\template.html"), $utf8)

if (Test-Path $siteRoot) { Remove-Item $siteRoot -Recurse -Force }
New-Item -ItemType Directory -Path $out -Force | Out-Null
Copy-Item (Join-Path $root "src\assets") (Join-Path $out "assets") -Recurse

$langs = @(
  @{ code = "it"; dir = "";    path = "/";    rootRel = "" },
  @{ code = "en"; dir = "en";  path = "/en/"; rootRel = "../" },
  @{ code = "de"; dir = "de";  path = "/de/"; rootRel = "../" }
)

foreach ($l in $langs) {
  $json = [IO.File]::ReadAllText((Join-Path $root "src\lang\$($l.code).json"), $utf8) | ConvertFrom-Json
  $map = @{}
  $json.PSObject.Properties | ForEach-Object { $map[$_.Name] = [string]$_.Value }

  $labels = [ordered]@{
    name = $map.lbl_name; email = $map.lbl_email; phone = $map.lbl_phone; checkin = $map.lbl_checkin;
    checkout = $map.lbl_checkout; adults = $map.lbl_adults; kids = $map.lbl_kids; room = $map.lbl_room
  }
  $map["mail_labels"] = ($labels | ConvertTo-Json -Compress)
  $map["SITE"] = $Site.TrimEnd("/")
  $map["IMG"]  = $Img.TrimEnd("/")
  $map["ROBOTS"] = if ($NoIndex) { '<meta name="robots" content="noindex, nofollow">' } else { "" }
  $map["ROOT"] = $l.rootRel
  $map["path"] = $l.path
  $map["ROOT_IT"] = if ($l.code -eq "it") { "./" } else { "../" }
  $map["ROOT_EN"] = if ($l.code -eq "en") { "./" } elseif ($l.code -eq "it") { "en/" } else { "../en/" }
  $map["ROOT_DE"] = if ($l.code -eq "de") { "./" } elseif ($l.code -eq "it") { "de/" } else { "../de/" }
  foreach ($c in "it","en","de") { $map["cur_$c"] = if ($c -eq $l.code) { 'aria-current="true"' } else { "" } }

  $html = $tpl
  foreach ($k in $map.Keys) { $html = $html.Replace("{{$k}}", $map[$k]) }

  $left = [regex]::Matches($html, "\{\{[A-Za-z0-9_]+\}\}") | ForEach-Object { $_.Value } | Select-Object -Unique
  if ($left) { throw "[$($l.code)] segnaposto non risolti: $($left -join ', ')" }

  $target = if ($l.dir) { Join-Path $out $l.dir } else { $out }
  if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target | Out-Null }
  [IO.File]::WriteAllText((Join-Path $target "index.html"), $html, $utf8)
  Write-Host "OK  $($l.code) -> $target\index.html"
}

# File in radice per il dominio pubblico
$base = $publicSite
$hostName = ([Uri]$base).Host
if ($ComingSoon) {
  Copy-Item (Join-Path $root "src\coming-soon.html") (Join-Path $siteRoot "index.html")
  New-Item -ItemType Directory -Path (Join-Path $siteRoot "assets") -Force | Out-Null
  Copy-Item (Join-Path $root "src\assets\logo.svg") (Join-Path $siteRoot "assets\logo.svg")
  Write-Host "OK  avviso in radice, sito completo in /anteprima/"
}
if ($NoIndex -and -not $ComingSoon) {
  [IO.File]::WriteAllText((Join-Path $siteRoot "robots.txt"), "User-agent: *`nDisallow: /`n", $utf8)
} elseif ($ComingSoon) {
  [IO.File]::WriteAllText((Join-Path $siteRoot "robots.txt"), "User-agent: *`nDisallow: /anteprima/`n", $utf8)
} else {
  [IO.File]::WriteAllText((Join-Path $siteRoot "robots.txt"), "User-agent: *`nAllow: /`n`nSitemap: $base/sitemap.xml`n", $utf8)
  $urls = foreach ($l in $langs) { "  <url><loc>$base$($l.path)</loc></url>" }
  $xml = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`n" + ($urls -join "`n") + "`n</urlset>`n"
  [IO.File]::WriteAllText((Join-Path $siteRoot "sitemap.xml"), $xml, $utf8)
}
# Dominio personalizzato per GitHub Pages
if ($hostName -notlike "*.github.io") { [IO.File]::WriteAllText((Join-Path $siteRoot "CNAME"), "$hostName`n", $utf8) }
Write-Host "OK  robots.txt e CNAME"
