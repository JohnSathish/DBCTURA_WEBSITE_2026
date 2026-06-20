# Safe deploy: Don Bosco College website + existing ERP on same VPS

**Server:** `ssh root@82.25.110.120`  
**College site:** https://donboscocollege.ac.in  
**Goal:** Deploy the new Next.js site **without breaking** the existing ERP (OneCampus / CyberPanel / other app).

---

## Golden rules

| Do | Don't |
|----|--------|
| Use folder `/var/www/donboscocollege` | Don't overwrite ERP files in `/var/www/...` |
| PM2 app name **`donbosco`** on port **3001** | Don't use port **3000** (ERP / nghttpx / CyberPanel) |
| New Nginx vhost for **`donboscocollege.ac.in` only** | Don't edit ERP's Nginx/OLS vhost |
| `pm2 restart donbosco` when updating | Don't run `pm2 restart all` or `pm2 delete all` |
| `nginx -t` before `systemctl reload nginx` | Don't set `default_server` on Don Bosco SSL block |

Your docs already note: **port 3000 is used by nghttpx (CyberPanel)** on this VPS. Don Bosco is configured for **3001** in `ecosystem.config.js`.

---

## Step 1 — Audit the server (run this first)

SSH in:

```bash
ssh root@82.25.110.120
```

Run the read-only audit (copy script from repo or paste):

```bash
cd /var/www/donboscocollege 2>/dev/null || mkdir -p /tmp/audit && cd /tmp/audit
# If repo already cloned:
bash scripts/server-audit-before-deploy.sh
```

Or run manually:

```bash
ss -tlnp
pm2 list
ls -la /var/www
ls -la /etc/nginx/sites-enabled 2>/dev/null
```

**Write down:**

- ERP PM2 app name (e.g. `erp`, `onecampus`, `bcl`) — **do not restart it**
- ERP port (likely **3000**)
- Whether **3001** is free (Don Bosco target port)
- ERP domain(s) in Nginx — **leave those config files unchanged**

If **3001 is taken**, change Don Bosco to **3002** in `ecosystem.config.js` and in the Nginx proxy for `donboscocollege.ac.in` only.

---

## Step 2 — Deploy Don Bosco (isolated)

```bash
mkdir -p /var/www
cd /var/www

# First time only:
git clone https://github.com/JohnSathish/donboscocollege.git donboscocollege
cd donboscocollege

# Updates:
# git pull

npm install
npm run build
npx prisma generate
npx prisma db push
```

Create `/var/www/donboscocollege/.env` (see `.env.example`):

```env
NODE_ENV=production
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="https://donboscocollege.ac.in"
NEXT_PUBLIC_SITE_URL="https://donboscocollege.ac.in"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
```

Set admin password:

```bash
export ADMIN_EMAIL="admin@donboscocollege.ac.in"
export ADMIN_PASSWORD='YOUR_STRONG_PASSWORD'
npm run admin:set-password
```

Start **only** the Don Bosco PM2 process:

```bash
pm2 start ecosystem.config.js    # name: donbosco, port: 3001
pm2 save
```

Verify locally (does not affect ERP):

```bash
curl -I http://127.0.0.1:3001
pm2 list
```

---

## Step 3 — Nginx: new vhost for college domain only

Create **new** file (do not replace ERP config):

```bash
nano /etc/nginx/sites-available/donboscocollege-ac-in
```

Use `nginx-donboscocollege-ac-in.conf` from the repo (or copy below). Important: **no `default_server`**.

Enable:

```bash
ln -sf /etc/nginx/sites-available/donboscocollege-ac-in /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

SSL:

```bash
certbot --nginx -d donboscocollege.ac.in -d www.donboscocollege.ac.in
nginx -t && systemctl reload nginx
```

**DNS:** A record for `donboscocollege.ac.in` → `82.25.110.120`

When DNS is switched from ERP to this site, only the **college domain** vhost changes traffic; ERP keeps working on **its own domain** if it uses a different hostname.

---

## Step 4 — If both share the same domain

If ERP and the college site both used `donboscocollege.ac.in`:

1. Deploy and test on **3001** first (`curl http://127.0.0.1:3001`).
2. Update **only** the Nginx `server_name donboscocollege.ac.in` block to proxy to **3001**.
3. Keep a backup of the old ERP vhost:  
   `cp /etc/nginx/sites-available/OLD_FILE /root/erp-nginx-backup.conf`
4. Reload Nginx after `nginx -t`.

The ERP app can keep running on 3000 for admin/internal URLs if needed.

---

## Step 5 — Safe updates (after go-live)

From your PC:

```bash
ssh root@82.25.110.120 "cd /var/www/donboscocollege && git pull && npm install && npm run build && npx prisma generate && npx prisma db push && pm2 restart donbosco"
```

This restarts **only** `donbosco`, not the ERP process.

---

## Quick checklist before go-live

- [ ] `pm2 list` — ERP still **online**
- [ ] `curl -I http://127.0.0.1:3001` — college app responds
- [ ] ERP URL still opens in browser
- [ ] `donboscocollege.ac.in` opens college site (after DNS + Nginx)
- [ ] `nginx -t` passes

---

## Rollback (if something goes wrong)

```bash
# Restore ERP Nginx config from backup
cp /root/erp-nginx-backup.conf /etc/nginx/sites-available/<erp-site>
nginx -t && systemctl reload nginx

# Stop Don Bosco only
pm2 stop donbosco
```

ERP should work again; college site will be offline until you fix Don Bosco.
