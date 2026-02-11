# EduTrack - Install all dependencies
# Run from project root: .\scripts\install-all.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location "$root\backend"
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Cyan
Set-Location "$root\frontend"
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`nInstalling Python ML dependencies..." -ForegroundColor Cyan
Set-Location "$root\ml-service"
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`nAll dependencies installed." -ForegroundColor Green
Set-Location $root
