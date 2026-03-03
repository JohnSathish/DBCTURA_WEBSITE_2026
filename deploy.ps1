# Deploy Don Bosco to Hostinger VPS from your PC
# Usage: .\deploy.ps1
# Edit the variables below to match your VPS and branch.

$VPS_IP   = "82.25.110.120"
$SSH_USER = "root"                  # or your SSH username
$BRANCH   = "main"
$APP_DIR  = "/var/www/donboscocollege"

Write-Host "=== Don Bosco deploy to VPS ===" -ForegroundColor Cyan

# 1. Git push from here
Write-Host "`n1. Pushing to Git..." -ForegroundColor Yellow
git add .
$msg = Read-Host "Commit message (or press Enter to skip commit/push)"
if ($msg) {
    git commit -m $msg
    git push origin $BRANCH
} else {
    Write-Host "Skipping commit/push. Will only pull and rebuild on VPS (if you already pushed)." -ForegroundColor Gray
}

# 2. On VPS: pull, install, build, restart
Write-Host "`n2. Updating and rebuilding on VPS..." -ForegroundColor Yellow
$remoteCmd = "cd $APP_DIR && git pull && npm install && npm run build && npx prisma generate && npx prisma db push && pm2 restart donbosco"
ssh "${SSH_USER}@${VPS_IP}" $remoteCmd

Write-Host "`nDone. Check https://donboscocollegetura.cloud" -ForegroundColor Green
