# EduTrack - Auto run: install if needed, then start backend + frontend
# Run from project root: .\scripts\auto-run.ps1
# Or double-click this file (may need: Right-click -> Run with PowerShell)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$backendPath = "$root\backend"
$frontendPath = "$root\frontend"

# Install dependencies if missing
if (-not (Test-Path "$backendPath\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location $backendPath
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Host "Backend install failed." -ForegroundColor Red; exit $LASTEXITCODE }
    Set-Location $root
}
if (-not (Test-Path "$frontendPath\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location $frontendPath
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Host "Frontend install failed." -ForegroundColor Red; exit $LASTEXITCODE }
    Set-Location $root
}

# Start backend (use node directly to avoid nodemon EPERM on some systems)
Write-Host "Starting backend at http://localhost:5000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; node server.js"

Start-Sleep -Seconds 4

# Start frontend
Write-Host "Starting frontend at http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host "`nBackend:  http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000 (browser opened)" -ForegroundColor Green
Write-Host "`nClose the two server windows to stop." -ForegroundColor Yellow
