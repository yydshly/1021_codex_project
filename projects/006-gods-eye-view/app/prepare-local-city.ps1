$ErrorActionPreference = 'Stop'
$venv = Join-Path $PSScriptRoot '.runtime/geo-python'
$python = Join-Path $venv 'Scripts/python.exe'
if (-not (Test-Path -LiteralPath $python)) {
    & python -m venv $venv
    if ($LASTEXITCODE -ne 0) { throw 'Python 3.10+ is required.' }
}
& $python -m pip install 'pyproj==3.7.1'
if ($LASTEXITCODE -ne 0) { throw 'Could not install coordinate conversion dependency.' }
& $python (Join-Path $PSScriptRoot 'prepare-local-city.py')
if ($LASTEXITCODE -ne 0) { throw 'Local dataset download did not complete.' }
& $python (Join-Path $PSScriptRoot 'check-local-city.py')
if ($LASTEXITCODE -ne 0) { throw 'Local dataset validation failed.' }
& (Join-Path $PSScriptRoot 'install-local-city.ps1')
