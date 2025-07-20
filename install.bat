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
if errorlevel 1 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo Building project...
npm run build
if errorlevel 1 (
    echo Error: npm run build failed
    pause
    exit /b 1
)

echo Running cleanup script...
node remove.js
if errorlevel 1 (
    echo Error: node remove.js failed
    pause
    exit /b 1
)

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