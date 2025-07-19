powershell -Command "git pull origin main; cls; git pull origin main; npm install; if (Test-Path .nuxt) { Remove-Item -Recurse -Force .nuxt }; npm run build; node remove.js; start.bat"
