# Genera il sito statico (IT in radice, EN in /en, DE in /de) da src/template.html + src/lang/*.json
# Uso:  powershell -ExecutionPolicy Bypass -File build.ps1
param(
  # Dominio finale (serve per canonical, hreflang e Open Graph). Da cambiare al go-live.
  [string]$Site = "https://locandaelisa.it",
  # Base delle immagini. Ora puntano al sito attuale (WordPress); sostituire con "assets/img" dopo aver scaricato/ottimizzato le foto.
  [string]$Img  = "https://locandaelisa.it/wp-content/uploads",
  # Aggiunge <meta name="robots" content="noindex">: da usare per le anteprime (es. GitHub Pages), non per il go-live.
  [switch]$NoIndex
)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$out  = Join-Path $root "site"
$utf8 = New-Object System.Text.UTF8Encoding($false)

$tpl = [IO.File]::ReadAllText((Join-Path $root "src\template.html"), $utf8)

if (Test-Path $out) { Remove-Item $out -Recurse -Force }
New-Item -ItemType Directory -Path $out | Out-Null
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
