$ErrorActionPreference = 'Stop'
& python (Join-Path $PSScriptRoot 'prepare-hefei.py')
if ($LASTEXITCODE -ne 0) { throw 'Hefei photogrammetry download failed.' }
& python (Join-Path $PSScriptRoot 'check-hefei.py')
if ($LASTEXITCODE -ne 0) { throw 'Hefei local model verification failed.' }
& (Join-Path $PSScriptRoot 'install-local-city.ps1')
