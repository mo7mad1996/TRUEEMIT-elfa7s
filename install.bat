@echo off
echo Starting deployment process...

REM Check if .env.pro exists before renaming
if exist .env.pro (
    echo Found .env.pro, renaming to .env...
    rename .env.pro .env
    if errorlevel 1 (
        echo Error: Failed to rename .env.pro to .env
        pause
        exit /b 1
    )
    echo Successfully renamed .env.pro to .env
) else (
    echo .env.pro not found, skipping rename step
)

echo Installing dependencies...
npm install


echo Building project...
npm run build


echo Running cleanup script...
node remove.js


echo Starting application...
if exist start.bat (
    call start.bat
) else (
    echo Error: start.bat not found
    pause
    exit /b 1
)

echo Deployment process completed successfully!
pause