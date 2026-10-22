param([switch]$Apply)

# One-time cleanup list approved on 2026-10-22. Default execution only previews.
$ErrorActionPreference = 'Stop'
$repoRoot = (Get-Item -LiteralPath (Join-Path $PSScriptRoot '..') -Force).FullName.TrimEnd('\')
if ($repoRoot -ne 'F:\codex_project\1021_codex_project') {
    throw 'This cleanup list is restricted to F:\codex_project\1021_codex_project.'
}

$relativeTargets = @(
    '_site',
    'projects/008-cel-story-studio/app/node_modules/.cache',
    'projects/001-remotion-flat-vector/app/node_modules/.cache',
    'projects/008-cel-story-studio/app/.cache/actors-preview-018-bundle',
    'projects/008-cel-story-studio/app/.cache/bauhaus-014-review-bundle',
    'projects/008-cel-story-studio/app/.cache/capability-bundle',
    'projects/008-cel-story-studio/app/.cache/collage-014-review-bundle',
    'projects/008-cel-story-studio/app/.cache/director-018',
    'projects/008-cel-story-studio/app/.cache/effect-bundle',
    'projects/008-cel-story-studio/app/.cache/framing-013-bundle',
    'projects/008-cel-story-studio/app/.cache/hud-preview-013/bundle',
    'projects/008-cel-story-studio/app/.cache/hud-preview-014/bundle',
    'projects/008-cel-story-studio/app/.cache/hud-preview-015/bundle',
    'projects/008-cel-story-studio/app/.cache/isometric-design/bundle',
    'projects/008-cel-story-studio/app/.cache/line-review-bundle',
    'projects/008-cel-story-studio/app/.cache/liquid-preview-014/bundle',
    'projects/008-cel-story-studio/app/.cache/liquid-preview-015/bundle',
    'projects/008-cel-story-studio/app/.cache/magnetic-qa-bundle',
    'projects/008-cel-story-studio/app/.cache/morph-review-bundle',
    'projects/008-cel-story-studio/app/.cache/neon-review-bundle',
    'projects/008-cel-story-studio/app/.cache/neon014-review-bundle',
    'projects/008-cel-story-studio/app/.cache/pixel-013-review-bundle',
    'projects/008-cel-story-studio/app/.cache/pixel-014-review-bundle',
    'projects/008-cel-story-studio/app/.cache/prism-preview-014/bundle',
    'projects/008-cel-story-studio/app/.cache/story-016',
    'projects/008-cel-story-studio/app/.cache/story-017',
    'projects/008-cel-story-studio/app/.cache/styles-bundle',
    'projects/008-cel-story-studio/app/.cache/world-bundle'
)

# Validate every existing target before making any changes. Do not follow links.
$targets = @()
foreach ($relative in $relativeTargets) {
    $candidate = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $relative))
    if (-not $candidate.StartsWith($repoRoot + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Target outside repository: $candidate"
    }
    if (-not (Test-Path -LiteralPath $candidate)) { continue }
    $resolved = (Resolve-Path -LiteralPath $candidate).ProviderPath.TrimEnd('\')
    if ($resolved -ne $candidate -or -not (Get-Item -LiteralPath $resolved -Force).PSIsContainer) {
        throw "Unexpected target: $resolved"
    }
    $ancestor = $resolved
    while ($ancestor -ne $repoRoot) {
        if (((Get-Item -LiteralPath $ancestor -Force).Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Reparse point in target ancestry: $ancestor"
        }
        $ancestor = Split-Path -Path $ancestor -Parent
        if (-not $ancestor) { throw 'Unexpected path ancestry.' }
    }
    $children = @(Get-ChildItem -LiteralPath $resolved -Force -Recurse)
    if (@($children | Where-Object { ($_.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0 }).Count -gt 0) {
        throw "Reparse point inside target: $resolved"
    }
    $files = @($children | Where-Object { -not $_.PSIsContainer })
    $bytes = [long](($files | Measure-Object -Property Length -Sum).Sum)
    $targets += [pscustomobject]@{ Path=$relative; AbsolutePath=$resolved; Files=$files.Count; Bytes=$bytes }
}

$targets | Select-Object Path, Files, @{Name='GiB'; Expression={[math]::Round($_.Bytes / 1GB, 3)}} | Format-Table -AutoSize
$totalBytes = [long](($targets | Measure-Object -Property Bytes -Sum).Sum)
Write-Output ("Total: {0} directories, {1:N3} GiB of file contents." -f $targets.Count, ($totalBytes / 1GB))
if (-not $Apply) {
    Write-Output 'Preview only. Pass -Apply to delete exactly the listed directories after stopping related jobs.'
    return
}

$freeBefore = [System.IO.DriveInfo]::new('F:\').AvailableFreeSpace
$removed = @()
$failure = $null
try {
    foreach ($target in $targets) {
        Remove-Item -LiteralPath $target.AbsolutePath -Recurse -Force -ErrorAction Stop
        if (Test-Path -LiteralPath $target.AbsolutePath) { throw "Target remains: $($target.AbsolutePath)" }
        $removed += $target.Path
    }
} catch {
    $failure = $_.Exception.Message
} finally {
    $freeAfter = [System.IO.DriveInfo]::new('F:\').AvailableFreeSpace
    $record = [ordered]@{
        root=$repoRoot
        completed=($null -eq $failure)
        removed=$removed
        intended_logical_bytes=$totalBytes
        free_before_bytes=$freeBefore
        free_after_bytes=$freeAfter
        observed_free_delta_bytes=($freeAfter - $freeBefore)
        error=$failure
    }
    $recordPath = Join-Path $repoRoot 'docs/disk-cleanup-result-2026-10-22.json'
    $record | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $recordPath -Encoding utf8
    Write-Output ("Removed {0} directories. Result: {1}" -f $removed.Count, $recordPath)
}
if ($null -ne $failure) { throw $failure }
