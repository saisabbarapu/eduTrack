@echo off
title EduTrack - Auto Run
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\auto-run.ps1"
pause
