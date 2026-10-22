$ErrorActionPreference = 'Stop'
$projectApp = $PSScriptRoot
$upstreamDir = Join-Path $projectApp 'upstream'
$commit = 'cef8991daa16ab03799f49c56939e48a1d247964'
if (-not (Test-Path -LiteralPath $upstreamDir)) {
    git clone https://github.com/vigneshv1cky/alphadesk-terminal.git $upstreamDir
    if ($LASTEXITCODE -ne 0) { throw 'Clone failed' }
    git -C $upstreamDir checkout --detach $commit
    if ($LASTEXITCODE -ne 0) { throw 'Checkout failed' }
}
$actual = git -C $upstreamDir rev-parse HEAD
if ($actual -ne $commit) { throw "Existing upstream is at $actual; expected $commit. Preserve your work and select the recorded version." }
uv venv --python 3.12 (Join-Path $projectApp '.venv')
if ($LASTEXITCODE -ne 0) { throw 'Virtual environment setup failed' }
uv pip install --python (Join-Path $projectApp '.venv/Scripts/python.exe') -e $upstreamDir
if ($LASTEXITCODE -ne 0) { throw 'Installation failed' }
Write-Output 'Installed. Run app/.venv/Scripts/python.exe app/launch_original.py from the project directory.'
