@echo off
chcp 65001 >nul
title Proje Kokpiti
cd /d "%~dp0"
start "" http://localhost:4545
node server.js
pause
