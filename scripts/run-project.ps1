# EduTrack - Run backend and frontend
# Run from project root: .\scripts\run-project.ps1
# Ensure MongoDB is running and you've run: cd backend; npm run seed (optional)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

Write-Host "Starting backend on http://localhost:5000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; node server.js"

Start-Sleep -Seconds 3

Write-Host "Starting frontend on http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host "`nBackend: http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "`nClose the terminal windows to stop the servers." -ForegroundColor Yellow
