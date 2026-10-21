param([int]$Port = 4173, [switch]$OpenBrowser)
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'setup.ps1')
$lock = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'upstream.lock.json') -Raw | ConvertFrom-Json
$node = Join-Path $PSScriptRoot ('.runtime/node-v{0}-win-x64/node.exe' -f $lock.nodeVersion)
$checkout = Join-Path $PSScriptRoot 'upstream'
if ($OpenBrowser) { Start-Process "http://localhost:$Port" }
Push-Location $checkout
try {
    & $node 'node_modules/vite/bin/vite.js' --host 127.0.0.1 --port $Port --strictPort
    if ($LASTEXITCODE -ne 0) { throw 'Development server stopped with an error.' }
} finally { Pop-Location }
