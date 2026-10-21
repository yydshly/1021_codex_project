param([switch]$ForceInstall)
$ErrorActionPreference = 'Stop'
$lock = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'upstream.lock.json') -Raw | ConvertFrom-Json
$runtime = Join-Path $PSScriptRoot '.runtime'
$nodeDirectory = Join-Path $runtime ("node-v{0}-win-x64" -f $lock.nodeVersion)
$node = Join-Path $nodeDirectory 'node.exe'
$checkout = Join-Path $PSScriptRoot 'upstream'

function Invoke-CheckedGit {
    param([string[]]$GitArguments)
    & git @GitArguments
    if ($LASTEXITCODE -ne 0) { throw "Git failed: $GitArguments" }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Install Git for Windows first.' }
New-Item -ItemType Directory -Path $runtime -Force | Out-Null
if (-not (Test-Path -LiteralPath $node)) {
    $archive = Join-Path $runtime ("node-v{0}-win-x64.zip" -f $lock.nodeVersion)
    $validArchive = (Test-Path -LiteralPath $archive) -and ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant() -eq $lock.nodeWindowsSha256)
    if (-not $validArchive) {
        & curl.exe -fL --retry 2 --connect-timeout 15 --max-time 300 ("https://nodejs.org/dist/v{0}/node-v{0}-win-x64.zip" -f $lock.nodeVersion) -o $archive
        if ($LASTEXITCODE -ne 0) { throw 'Node download failed.' }
    }
    if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $lock.nodeWindowsSha256) { throw 'Node checksum mismatch.' }
    Expand-Archive -LiteralPath $archive -DestinationPath $runtime -Force
}
$env:PATH = $nodeDirectory + [IO.Path]::PathSeparator + $env:PATH
if (-not (Test-Path -LiteralPath (Join-Path $checkout '.git'))) {
    Invoke-CheckedGit -GitArguments @('clone', '--depth', '1', '--filter=blob:none', '--sparse', $lock.repository, $checkout)
}
$actualCommit = & git -C $checkout rev-parse HEAD
if ($LASTEXITCODE -ne 0) { throw 'Cannot read upstream revision.' }
if ($actualCommit.Trim() -ne $lock.commit) {
    $dirty = & git -C $checkout status --porcelain
    if ($dirty) { throw 'Upstream contains local edits. Keep them before changing the pinned revision.' }
    Invoke-CheckedGit -GitArguments @('-C', $checkout, 'fetch', '--depth', '1', 'origin', $lock.commit)
    Invoke-CheckedGit -GitArguments @('-C', $checkout, 'checkout', '--detach', $lock.commit)
}
# Keep runtime sources and assets, omitting large documentation GIFs.
Invoke-CheckedGit -GitArguments @('-C', $checkout, '-c', 'http.version=HTTP/1.1', 'sparse-checkout', 'set', 'src', 'server', 'scripts', 'config', 'build', 'public')
$marker = Join-Path $runtime 'installed-commit.txt'
if ($ForceInstall -or -not (Test-Path -LiteralPath (Join-Path $checkout 'node_modules/vite')) -or -not (Test-Path -LiteralPath $marker) -or (Get-Content -LiteralPath $marker -Raw).Trim() -ne $lock.commit) {
    $env:PUPPETEER_SKIP_DOWNLOAD = 'true'
    Push-Location $checkout
    try {
        & $node (Join-Path $nodeDirectory 'node_modules/npm/bin/npm-cli.js') ci --no-audit --no-fund --prefer-offline --fetch-timeout=300000 --fetch-retries=2
        if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
        Set-Content -LiteralPath $marker -Value $lock.commit -Encoding ascii
    } finally { Pop-Location }
}
Write-Host "Ready: Node $(& $node --version), upstream $($lock.commit)."
& (Join-Path $PSScriptRoot 'install-local-city.ps1')
