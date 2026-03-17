@echo off
cd /d D:\Projects\Hospital-Project\hospital-selection

echo Checking status...
git status

echo Adding changes...
git add .

echo Committing...
git commit -m "Auto update"

echo Pushing...
git push origin main

echo Done!
pause