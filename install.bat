[ -f .env.pro ] && mv .env.pro .env && npm install && npm run build && node remove.js && start.bat
