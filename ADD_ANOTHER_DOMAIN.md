# Add another domain on the same VPS (e.g. www.pasfanc.ac.in)

You can host multiple sites on the same server. Each domain can point to its own folder or app.

---

## Overview

| Step | What you do |
|------|-------------|
| 1 | Point the new domain’s DNS to your VPS IP |
| 2 | Put the site files on the VPS (folder + app or static files) |
| 3 | Add an Nginx config for the new domain (and SSL) |
| 4 | Restart/reload as needed |

---

## Step 1: DNS for the new domain

Where **pasfanc.ac.in** is managed (registrar/DNS):

- **A record** for **@** (or **pasfanc.ac.in**) → **82.25.110.120**
- **A record** for **www** → **82.25.110.120**

(Use your actual VPS IP if different.) Wait a few minutes for DNS to propagate.

---

## Step 2: Put the site files on the VPS

SSH in: `ssh root@82.25.110.120`

### Option A: New site is a Node/Next.js app (like Don Bosco)

```bash
cd /var/www
git clone https://github.com/YourUsername/pasfanc-repo.git pasfanc
cd pasfanc
npm install
npm run build
```

Create `.env` in `/var/www/pasfanc` with the right values (e.g. `DATABASE_URL`, `NEXTAUTH_URL=https://www.pasfanc.ac.in`, etc.).

Run it on a **different port** (e.g. **3002**) so it doesn’t clash with Don Bosco (3001):

**PM2 config** for the new app – create `/var/www/pasfanc/ecosystem.config.js`:

```js
const path = require("path");
module.exports = {
  apps: [{
    name: "pasfanc",
    script: path.join(__dirname, "node_modules/next/dist/bin/next"),
    args: "start -p 3002",
    cwd: __dirname,
    interpreter: "node",
    env: { NODE_ENV: "production" },
  }],
};
```

Then:

```bash
cd /var/www/pasfanc
npx prisma generate
npx prisma db push
pm2 start ecosystem.config.js
pm2 save
```

You’ll use **port 3002** in Nginx for this domain (see Step 3).

### Option B: New site is static HTML/PHP or a simple app

```bash
mkdir -p /var/www/pasfanc
cd /var/www/pasfanc
```

Upload or clone your files here (e.g. into `public` or `htdocs`). If it’s just static files, Nginx will serve from a folder (no Node/PM2). Example folder: `/var/www/pasfanc/public`.

---

## Step 3: Nginx config for the new domain

Create a new Nginx site config (don’t remove the Don Bosco one).

```bash
nano /etc/nginx/sites-available/pasfanc
```

**If the new site is a Node app on port 3002** (Option A), paste:

```nginx
server {
    listen 80;
    server_name pasfanc.ac.in www.pasfanc.ac.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name pasfanc.ac.in www.pasfanc.ac.in;

    ssl_certificate /etc/letsencrypt/live/pasfanc.ac.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pasfanc.ac.in/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**If the new site is static files** (Option B), use this instead of the `location /` block above (and keep the 80 redirect and 443 server with SSL):

```nginx
server {
    listen 80;
    server_name pasfanc.ac.in www.pasfanc.ac.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name pasfanc.ac.in www.pasfanc.ac.in;

    ssl_certificate /etc/letsencrypt/live/pasfanc.ac.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pasfanc.ac.in/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/pasfanc/public;
    index index.html index.htm;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Save (Ctrl+O, Enter, Ctrl+X).

---

## Step 4: Get SSL for the new domain

**First** enable the site and run Nginx (without SSL in the config if you prefer):

You can temporarily use only the **port 80** block so Certbot can issue the certificate:

```bash
# Enable site
ln -sf /etc/nginx/sites-available/pasfanc /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Get certificate (Certbot will add SSL to the config or you add it manually)
certbot --nginx -d pasfanc.ac.in -d www.pasfanc.ac.in
```

If you already pasted the full config with `ssl_certificate` paths, Certbot may complain that the domain isn’t set up yet. In that case:

1. In `pasfanc` config, keep only the **listen 80** block (no 443 block yet).
2. Reload Nginx, run `certbot --nginx -d pasfanc.ac.in -d www.pasfanc.ac.in`.
3. Certbot will add the 443 block and SSL paths. If it doesn’t, add the 443 block yourself (as in Step 3) and run certbot again or paste the paths Certbot shows.

Then:

```bash
nginx -t && systemctl reload nginx
```

---

## Step 5: Summary

| Domain | App / files | Port (if Node) | Nginx config |
|--------|-------------|-----------------|--------------|
| donboscocollegetura.cloud, www | /var/www/donboscocollege | 3001 | sites-available/donboscocollege |
| pasfanc.ac.in, www.pasfanc.ac.in | /var/www/pasfanc | 3002 (or static) | sites-available/pasfanc |

- **Don Bosco** stays as is (port 3001, its own Nginx config).
- **New domain** = new folder, new Nginx file, new port if Node, and its own SSL (Certbot).

To add more domains later: repeat Steps 1–4 with a new folder, new port (e.g. 3003), and new Nginx server block.
