# Production Readiness Runbook

## Current application profile

- Laravel 13.20.0, PHP 8.5.8 locally, MariaDB 10.6.5 locally.
- React 19.2, Inertia React 3.6, HeroUI 3.2, Vite 8.1, and Laravel Reverb 1.10.
- The production host is currently unknown. This runbook assumes a Linux VPS with Nginx, PHP-FPM, MariaDB, Supervisor, and cron.
- Do not deploy this application to shared hosting unless it can run persistent queue and Reverb processes.

## Pre-deployment blockers

1. **PHP compatibility:** the locked phpoffice/phpspreadsheet package declares PHP < 8.5; the current local PHP is 8.5.8. Use PHP 8.4 in production until a separately tested dependency update supports PHP 8.5.
2. **Quality gates:** TypeScript, ESLint, and the full PHPUnit suite must be brought to green before production. See the latest CI/local validation output for the exact current failures.
3. **Target server:** domain names, TLS, backup destination, SMTP, process manager, and off-site storage have not been supplied.
4. **Restore test:** no isolated database/file restore has been executed yet.

## Required environment

Keep the server .env outside Git and set at least:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://app.example.com
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=replace_me
DB_USERNAME=least_privileged_app_user
DB_PASSWORD=replace_me

CACHE_STORE=database
SESSION_DRIVER=database
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
QUEUE_CONNECTION=database
```

Never use the MariaDB root account for the application. The deployment operator must create a dedicated user with only the application schema permissions required for normal reads, writes, migrations, and queue work.

## Private storage and document generation

- Nginx document root must be the Laravel public/ directory only.
- storage/app/private/ contains business documents and master templates. It must never be exposed by a web-server alias or public symlink.
- The public storage symlink may expose only deliberate public assets. Current audited business documents are stored on the private disk.
- PHP-FPM may write only storage/ and bootstrap/cache/. Do not use recursive 777 permissions.
- DOCX/PDF generation requires PHP ZIP, DOM/XML, mbstring, GD, and the configured LibreOffice binary when DOCX-to-PDF conversion is required.

## Reverb

Production Reverb requires explicit credentials and an explicit browser-origin allow-list:

```dotenv
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=replace_me
REVERB_APP_KEY=replace_me
REVERB_APP_SECRET=replace_me
REVERB_SERVER_HOST=127.0.0.1
REVERB_SERVER_PORT=8080
REVERB_HOST=ws.example.com
REVERB_PORT=443
REVERB_SCHEME=https
REVERB_ALLOWED_ORIGINS=https://app.example.com
REVERB_APP_RATE_LIMITING_ENABLED=true
```

config/reverb.php deliberately rejects every production browser origin until REVERB_ALLOWED_ORIGINS is configured. Terminate TLS at Nginx and proxy the public WebSocket host to Reverb on 127.0.0.1:8080; do not expose port 8080 publicly.

Run Reverb under Supervisor or an equivalent process manager:

```ini
[program:lbo-reverb]
directory=/var/www/lbocrm
command=/usr/bin/php artisan reverb:start --host=127.0.0.1 --port=8080
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/supervisor/lbo-reverb.log
stopasgroup=true
killasgroup=true
```

After deployment, run php artisan reverb:restart so the process manager starts the new code.

## Queue and scheduler

The application uses the database queue driver. Run at least one supervised worker:

```ini
[program:lbo-queue]
directory=/var/www/lbocrm
command=/usr/bin/php artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/supervisor/lbo-queue.log
stopasgroup=true
killasgroup=true
```

Configure one cron entry:

```cron
* * * * * cd /var/www/lbocrm && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

The scheduled notification/reminder commands use withoutOverlapping() and onOneServer(). All servers must therefore share the configured database/Redis cache store.

## Deployment sequence

1. Confirm a successful encrypted, off-server backup and a current restore-test result.
2. Put the deployment under the agreed traffic/maintenance strategy.
3. Release code without copying .env, storage/app/private, or generated business files.
4. Run composer install --no-dev --prefer-dist --optimize-autoloader.
5. Either build assets on the server with npm ci and npm run build, or upload the verified public/build artifact from CI. Do not delete the manifest.
6. Run reviewed migrations only: php artisan migrate --force.
7. Run php artisan optimize.
8. Run php artisan queue:restart, php artisan reverb:restart, and php artisan schedule:interrupt.
9. Check /up, queue worker state, Reverb connectivity, and the smoke tests below.
10. If code rollback is required, restore the previous release first. Do not assume database migrations can be rolled back after live writes; use the tested database restore plan when needed.

## Backup and restore policy

- Take encrypted database backups daily, retain weekly and monthly restore points, and copy them to off-site storage.
- Back up storage/app/private/, including archi-templates, contracts, finance outputs, and project documents. Exclude framework cache, sessions, logs, vendor, and node_modules.
- Store backups outside the web root and outside the primary server where possible.
- Use a database-native logical backup such as mysqldump --single-transaction --routines --events --triggers with a dedicated backup account. Do not treat file synchronization as a database backup.
- Test restores in an isolated database and isolated private-storage path. Verify application boot, one project document, one contract, and one finance record before declaring a backup usable.

## Web-server and monitoring requirements

- Redirect HTTP to HTTPS, serve only public/, and preserve WebSocket upgrade headers for the Reverb virtual host.
- Monitor /up, HTTP 5xx rate, MariaDB availability, queue failures, Reverb process state, disk space, and backup job failures.
- HSTS is emitted only for secure production requests. Do not preload a domain until TLS and subdomain ownership are confirmed.

## Post-deploy smoke tests

1. Unauthenticated request to a protected page redirects or returns 401/403.
2. Login rate limiting, logout, password reset, and invitation-expiry paths behave as expected.
3. A user from another company cannot open a foreign client, dossier, document, finance record, task, or broadcast channel.
4. Upload, preview, download, and delete operate through authorized routes; no private file is reachable under a public path.
5. Create and download a contract, efficiency sheet, quote, invoice, payment receipt, and finance export.
6. Create a task/calendar reminder and confirm the queue worker and scheduler process it once.
7. Verify private WebSocket subscription authorization and a Reverb reconnect after reverb:restart.

## References

- [Laravel 13 deployment](https://laravel.com/docs/13.x/deployment)
- [Laravel 13 queues](https://laravel.com/docs/13.x/queues)
- [Laravel 13 scheduling](https://laravel.com/docs/13.x/scheduling)
- [Laravel 13 Reverb](https://laravel.com/docs/13.x/reverb)
- [MySQL backup and recovery](https://dev.mysql.com/doc/refman/8.0/en/backup-and-recovery.html)
