$ErrorActionPreference = 'Stop'
$checkout = Join-Path $PSScriptRoot 'upstream'
$modulePath = Join-Path $checkout 'src/research'
New-Item -ItemType Directory -Path $modulePath -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'extensions/localCity.js') -Destination (Join-Path $modulePath 'localCity.js') -Force
$data = Join-Path $PSScriptRoot 'data'
New-Item -ItemType Directory -Path $data -Force | Out-Null
$publicLink = Join-Path $checkout 'public/local-city-data'
if (-not (Test-Path -LiteralPath $publicLink)) {
    New-Item -ItemType Junction -Path $publicLink -Target $data | Out-Null
}
$entryPath = Join-Path $checkout 'src/main.js'
$entry = [IO.File]::ReadAllText($entryPath)
$callback = 'application.start().then(async ({ scene, controls }) => { await controls.styleManager.initialRestorePromise; installLocalCity(scene); }).catch((error) => {'
if (-not $entry.Contains("import { installLocalCity }")) {
    $anchor = 'application.start().catch((error) => {'
    if (-not $entry.Contains($anchor)) { throw 'Unexpected upstream entry; refusing to patch.' }
    $entry = "import { installLocalCity } from './research/localCity.js';`n" + $entry.Replace(
        $anchor, $callback)
}
$entry = $entry.Replace('application.start().then(({ scene }) => installLocalCity(scene)).catch((error) => {', $callback)
[IO.File]::WriteAllText($entryPath, $entry, (New-Object Text.UTF8Encoding($false)))
Write-Host 'Local city extension installed.'
