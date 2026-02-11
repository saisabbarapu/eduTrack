# EduTrack - Install dependencies then run (one script)
# Run from project root: .\scripts\install-and-run.ps1

$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
& "$root\scripts\install-all.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& "$root\scripts\run-project.ps1"
