@echo off
wsl.exe -d Ubuntu --cd /home/user/tailorease -- docker compose up %*
