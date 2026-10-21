$ErrorActionPreference = 'Stop'
$node = Join-Path $PSScriptRoot '.runtime/node-v24.14.0-win-x64/node.exe'
if (-not (Test-Path -LiteralPath $node)) { & (Join-Path $PSScriptRoot 'setup.ps1') }
& $node (Join-Path $PSScriptRoot 'prepare-guangzhou.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Guangzhou dataset preparation failed.' }
& python (Join-Path $PSScriptRoot 'check-guangzhou.py')
if ($LASTEXITCODE -ne 0) { throw 'Guangzhou dataset validation failed.' }
& (Join-Path $PSScriptRoot 'install-local-city.ps1')
