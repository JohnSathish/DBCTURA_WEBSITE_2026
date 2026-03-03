# Server Deployment Guide – Don Bosco College & Multi-Site VPS

This document explains server concepts, commands, and how to deploy and maintain your sites on the VPS. Read it to understand how everything fits together.

---

## Table of contents

1. [Server concepts](#1-server-concepts)
2. [Your stack overview](#2-your-stack-overview)
3. [First-time deployment (Don Bosco College)](#3-first-time-deployment-don-bosco-college)
4. [Nginx – reverse proxy and SSL](#4-nginx--reverse-proxy-and-ssl)
5. [PM2 – keeping the app running](#5-pm2--keeping-the-app-running)
6. [Environment variables (.env)](#6-environment-variables-env)
7. [Deploying updates](#7-deploying-updates)
8. [Adding another domain](#8-adding-another-domain)
9. [Troubleshooting](#9-troubleshooting)
10. [Command reference (cheat sheet)](#10-command-reference-cheat-sheet)

---

## 1. Server concepts

### What is a VPS?

A **VPS (Virtual Private Server)** is a virtual machine that gives you full control: you install software, open ports, and run your own apps. It has its own **IP address** (e.g. `82.25.110.120`). Anyone on the internet can reach that IP unless a firewall blocks them.

### SSH – how you control the server

- **SSH** = Secure Shell. You run commands on the server from your PC.
- Command: `ssh root@82.25.110.120`
- You log in as **root** (administrator). Everything you do on the VPS happens in a terminal (no desktop by default).

### Ports

- A **port** is a number (0–65535) that identifies which service gets the traffic.
- **80** = HTTP (unencrypted web).
- **443** = HTTPS (encrypted web).
- **3000, 3001, 3002** = often used by Node.js apps. Only the server itself (localhost) needs to reach these; the outside world talks to 80/443 only.

### Reverse proxy (Nginx)

- Your **Node.js app** runs on a port like **3001** and listens only on the server (127.0.0.1).
- **Nginx** listens on **80** and **443** (public). When a request comes for `donboscocollegetura.cloud`, Nginx **forwards** it to `http://127.0.0.1:3001` and sends the response back. That’s a **reverse proxy**.
- Benefits: one place for SSL (HTTPS), one place for multiple domains, and your app doesn’t need to be exposed directly.

### DNS – how a domain points to the server

- **Domain** (e.g. donboscocollegetura.cloud) is human-friendly; the internet uses **IP addresses**.
- **DNS** maps the domain to your VPS IP. You create an **A record**: name `@` (root) or `www`, value = your VPS IP (e.g. `82.25.110.120`).
- After DNS propagates, opening `https://donboscocollegetura.cloud` makes the browser connect to your VPS IP on port 443.

### SSL (HTTPS)

- **SSL/TLS** encrypts traffic between the browser and the server.
- **Let’s Encrypt** gives free certificates. **Certbot** is a tool that gets the certificate and configures Nginx. Certificates expire; Certbot can renew them automatically.

---

## 2. Your stack overview

| Component        | Role |
|-----------------|------|
| **VPS**         | Ubuntu 24.04, IP 82.25.110.120. You have root access. |
| **Nginx**       | Listens on 80 and 443, forwards requests to your app (reverse proxy), serves SSL. |
| **Node.js**     | Runs your Next.js app. |
| **PM2**         | Process manager: starts your app, restarts it if it crashes, keeps it running after you disconnect. |
| **Git**         | Used to pull your code from GitHub to the server. |
| **Prisma**      | ORM for the database. `prisma generate` and `prisma db push` on the server. |
| **SQLite**      | Database file (e.g. `prisma/dev.db`) used by the Don Bosco app. |

**Important:** Port **3000** on your server is used by **nghttpx** (CyberPanel). So the Don Bosco app runs on **port 3001** to avoid conflict.

---

## 3. First-time deployment (Don Bosco College)

Do this once per project on a new VPS.

### 3.1 Push code to GitHub (from your PC)

```powershell
cd c:\Users\johnm\donbosco
git remote set-url origin https://github.com/JohnSathish/donboscocollege.git
git branch -M main
git add .
git commit -m "Initial deploy"
git push -u origin main
```

### 3.2 DNS

In your domain DNS for **donboscocollegetura.cloud**:

- **A record** Name `@` → Value `82.25.110.120`
- **A record** Name `www` → Value `82.25.110.120`

### 3.3 SSH and install Git + PM2 (on VPS)

```bash
ssh root@82.25.110.120
apt update
apt install -y git
npm install -g pm2
```

### 3.4 Clone, install, build (on VPS)

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/JohnSathish/donboscocollege.git donboscocollege
cd donboscocollege
npm install
```

### 3.5 Create .env (on VPS)

```bash
nano /var/www/donboscocollege/.env
```

Paste (replace the secret with a random string):

```env
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=production

NEXTAUTH_URL="https://donboscocollegetura.cloud"
NEXTAUTH_SECRET="PUT_A_LONG_RANDOM_STRING_HERE_AT_LEAST_32_CHARS"

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

Generate a secret: `openssl rand -base64 32` and use it for `NEXTAUTH_SECRET`.  
Save: Ctrl+O, Enter, Ctrl+X.

### 3.6 Build (on VPS)

```bash
cd /var/www/donboscocollege
export DATABASE_URL="file:./prisma/dev.db"
npm run build
```

### 3.7 Prisma and PM2 (on VPS)

```bash
cd /var/www/donboscocollege
npx prisma generate
npx prisma db push
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Run the command that `pm2 startup` prints so the app starts after a reboot.

### 3.8 Nginx config (on VPS)

Create the site config:

```bash
nano /etc/nginx/sites-available/donboscocollege
```

Paste the full Nginx config from [Section 4](#4-nginx--reverse-proxy-and-ssl) (both server blocks). Save.

Enable it and remove default:

```bash
ln -sf /etc/nginx/sites-available/donboscocollege /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 3.9 SSL (on VPS)

```bash
certbot --nginx -d donboscocollegetura.cloud -d www.donboscocollegetura.cloud
```

Follow prompts. Then reload Nginx if needed: `systemctl reload nginx`.

---

## 4. Nginx – reverse proxy and SSL

### What Nginx does

- Listens on **80** (HTTP) and **443** (HTTPS).
- For each **domain** (server_name), it can forward requests to a **backend** (e.g. your Node app on 3001) or serve static files.
- Config files live in `/etc/nginx/sites-available/`. You **enable** a site by linking it into `sites-enabled/`. Nginx loads all files in `sites-enabled/`.

### Full config for Don Bosco College

File: `/etc/nginx/sites-available/donboscocollege`

```nginx
server {
    listen 80;
    server_name donboscocollegetura.cloud www.donboscocollegetura.cloud;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl default_server;
    server_name donboscocollegetura.cloud www.donboscocollegetura.cloud;

    ssl_certificate /etc/letsencrypt/live/donboscocollegetura.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/donboscocollegetura.cloud/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
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

**Important:**

- `server_name` must be **only** the hostnames (e.g. `donboscocollegetura.cloud www.donboscocollegetura.cloud`). **No** `https://` or `/`.
- `proxy_pass` must match the port your app uses (**3001** for Don Bosco).
- `default_server` on 443 makes this block the default for HTTPS when no other server_name matches.

### Nginx commands

| Command | Purpose |
|--------|---------|
| `nginx -t` | Test config; do this before reload. |
| `systemctl reload nginx` | Reload config without dropping connections. |
| `systemctl status nginx` | See if Nginx is running. |
| `ss -tlnp \| grep -E ':80\|:443'` | See what is listening on 80 and 443. |

---

## 5. PM2 – keeping the app running

### What PM2 does

- Runs your Node app in the background. If it crashes, PM2 can restart it.
- After you run `pm2 startup`, PM2 will start your app again after a server reboot.

### ecosystem.config.js (Don Bosco)

Location: `/var/www/donboscocollege/ecosystem.config.js` (and in your repo).

```js
const path = require("path");

module.exports = {
  apps: [
    {
      name: "donbosco",
      script: path.join(__dirname, "node_modules/next/dist/bin/next"),
      args: "start -p 3001",
      cwd: __dirname,
      interpreter: "node",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

- **name** – Used in `pm2 restart donbosco`, etc.
- **args** – `start -p 3001` makes Next.js listen on port 3001 (required because 3000 is used by nghttpx).

### PM2 commands

| Command | Purpose |
|--------|---------|
| `pm2 list` | List apps and status (online/errored). |
| `pm2 start ecosystem.config.js` | Start the app defined in that file. |
| `pm2 restart donbosco` | Restart the app named donbosco. |
| `pm2 stop donbosco` | Stop the app. |
| `pm2 delete donbosco` | Remove the app from PM2 (can start again with `pm2 start`). |
| `pm2 logs donbosco` | Show logs (Ctrl+C to exit). |
| `pm2 save` | Save current process list. |
| `pm2 startup` | Print a command to run so PM2 starts on boot. |

---

## 6. Environment variables (.env)

- Your app reads **environment variables** (e.g. `DATABASE_URL`, `NEXTAUTH_URL`) from a file named **.env** in the project root on the server.
- **Never commit .env to Git** (it contains secrets). Create it only on the server (e.g. with `nano /var/www/donboscocollege/.env`).
- For **build time**, the app also needs `DATABASE_URL`. If the build fails with "DATABASE_URL is not set", run:  
  `export DATABASE_URL="file:./prisma/dev.db"`  
  before `npm run build`, or ensure `.env` exists before building.

---

## 7. Deploying updates

When you change code **locally** and want the live site updated:

### Option A – Manual (from your PC then VPS)

**On your PC:**

```powershell
cd c:\Users\johnm\donbosco
git add .
git commit -m "Describe your changes"
git push origin main
```

**On the VPS** (SSH in, then):

```bash
cd /var/www/donboscocollege
git pull
npm install
npm run build
npx prisma generate
npx prisma db push
pm2 restart donbosco
```

### Option B – One command from your PC (SSH runs everything on VPS)

```powershell
ssh root@82.25.110.120 "cd /var/www/donboscocollege && git pull && npm install && npm run build && npx prisma generate && npx prisma db push && pm2 restart donbosco"
```

(Do the `git add`, `commit`, `push` on your PC first.)

### Option C – Deploy script (deploy.ps1)

From your project folder in PowerShell:

```powershell
.\deploy.ps1
```

The script will ask for a commit message, push to Git, then run the update commands on the VPS via SSH. Edit `deploy.ps1` if your VPS IP, user, or app path change.

---

## 8. Adding another domain

Example: add **www.pasfanc.ac.in** (or **pasfanc.ac.in**) on the same VPS.

### Step 1 – DNS

- **A record** for `@` (or root) → `82.25.110.120`
- **A record** for `www` → `82.25.110.120`

### Step 2 – Site files on VPS

**If it’s a Node/Next.js app:**

```bash
cd /var/www
git clone https://github.com/YourUsername/pasfanc-repo.git pasfanc
cd pasfanc
npm install
npm run build
```

Create `/var/www/pasfanc/ecosystem.config.js` with **port 3002** (see ADD_ANOTHER_DOMAIN.md for full content). Then:

```bash
cd /var/www/pasfanc
npx prisma generate
npx prisma db push
pm2 start ecosystem.config.js
pm2 save
```

**If it’s static files:** put them in e.g. `/var/www/pasfanc/public`.

### Step 3 – Nginx config for the new domain

```bash
nano /etc/nginx/sites-available/pasfanc
```

Add two server blocks: one for port 80 (redirect to HTTPS), one for 443 with `server_name pasfanc.ac.in www.pasfanc.ac.in` and either:

- `proxy_pass http://127.0.0.1:3002` (if Node app on 3002), or  
- `root /var/www/pasfanc/public;` and `try_files` (if static).

Enable and get SSL:

```bash
ln -sf /etc/nginx/sites-available/pasfanc /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d pasfanc.ac.in -d www.pasfanc.ac.in
```

Full examples (Node and static) are in **ADD_ANOTHER_DOMAIN.md**.

---

## 9. Troubleshooting

### Site shows "Welcome to nginx!"

- Nginx is serving the **default** site instead of your config. Fix:
  - `rm -f /etc/nginx/sites-enabled/default`
  - Ensure your config has `proxy_pass http://127.0.0.1:3001` (port **3001** for Don Bosco).
  - Optionally add `default_server` to the 443 `listen` line.
  - `nginx -t && systemctl reload nginx`.

### ERR_CONNECTION_TIMED_OUT

- Browser can’t reach the server. Check:
  - Nginx running: `systemctl status nginx`.
  - Nginx listening on 443: `ss -tlnp | grep 443`.
  - Firewall: open 80 and 443 (e.g. `ufw allow 80/tcp; ufw allow 443/tcp; ufw reload`), or in Hostinger firewall panel.
  - No typo in `server_name` (e.g. no `https://` in server_name).

### "DATABASE_URL is not set" during build

- Create `.env` in the project root with `DATABASE_URL="file:./prisma/dev.db"` before building, or run:
  - `export DATABASE_URL="file:./prisma/dev.db"`
  - then `npm run build`.

### PM2 app in "errored" state / EADDRINUSE :::3000

- **Port 3000** is in use (e.g. by nghttpx). Use **port 3001** for Don Bosco:
  - In `ecosystem.config.js`: `args: "start -p 3001"`.
  - In Nginx: `proxy_pass http://127.0.0.1:3001`.
- If something else is on 3001: `fuser -k 3001/tcp`, then `pm2 start ecosystem.config.js`.

### Certbot "unauthorized" / 404 on .well-known

- Nginx must be the one serving port 80 for your domain (not another server). Ensure your Nginx server block for the domain is enabled and Nginx is listening on 80. Then run certbot again.

### server_name "https://..." has suspicious symbols

- `server_name` must contain **only** hostnames, e.g. `donboscocollegetura.cloud www.donboscocollegetura.cloud`. Remove `https://` and any trailing `/`.

---

## 10. Command reference (cheat sheet)

### SSH and server

```bash
ssh root@82.25.110.120
```

### Nginx

```bash
nginx -t
systemctl reload nginx
systemctl status nginx
ls /etc/nginx/sites-enabled/
ss -tlnp | grep -E ':80|:443'
```

### PM2

```bash
pm2 list
pm2 restart donbosco
pm2 logs donbosco
pm2 start ecosystem.config.js
pm2 save
```

### Deploy / update app (on VPS)

```bash
cd /var/www/donboscocollege
git pull
npm install
npm run build
npx prisma generate
npx prisma db push
pm2 restart donbosco
```

### One-line deploy from PC (PowerShell)

```powershell
ssh root@82.25.110.120 "cd /var/www/donboscocollege && git pull && npm install && npm run build && npx prisma generate && npx prisma db push && pm2 restart donbosco"
```

### SSL (Certbot)

```bash
certbot --nginx -d donboscocollegetura.cloud -d www.donboscocollegetura.cloud
```

### Useful paths (Don Bosco)

| Item | Path |
|------|------|
| App directory | `/var/www/donboscocollege` |
| .env on server | `/var/www/donboscocollege/.env` |
| Nginx site config | `/etc/nginx/sites-available/donboscocollege` |
| SSL certificates | `/etc/letsencrypt/live/donboscocollegetura.cloud/` |

---

## Related files in this project

- **nginx-donboscocollege.conf** – Reference Nginx config (port 3001, SSL).
- **ecosystem.config.js** – PM2 config (port 3001).
- **deploy.ps1** – Script to push and deploy from your PC.
- **ADD_ANOTHER_DOMAIN.md** – Detailed steps to add a second domain (e.g. pasfanc.ac.in).

End of guide.
