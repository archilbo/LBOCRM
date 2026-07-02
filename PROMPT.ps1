cd "D:\ARCHI LBO\LBOSM\LBOCRM"

$envPath = ".env"
$envText = Get-Content $envPath -Raw

$envText = $envText -replace '(?m)^VITE_REVERB_APP_KEY=.*$', 'VITE_REVERB_APP_KEY=local'
$envText = $envText -replace '(?m)^VITE_REVERB_HOST=.*$', 'VITE_REVERB_HOST=127.0.0.1'
$envText = $envText -replace '(?m)^VITE_REVERB_PORT=.*$', 'VITE_REVERB_PORT=8081'
$envText = $envText -replace '(?m)^VITE_REVERB_SCHEME=.*$', 'VITE_REVERB_SCHEME=http'

Set-Content $envPath $envText -Encoding UTF8

php artisan optimize:clear