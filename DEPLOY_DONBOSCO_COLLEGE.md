# Deploy Don Bosco College to your server

**Repo:** [https://github.com/JohnSathish/donboscocollege](https://github.com/JohnSathish/donboscocollege)  
**Domain (production):** https://donboscocollege.ac.in  
**Staging (optional):** https://donboscocollegetura.cloud  
**Server:** Ubuntu 24.04 + Nginx/OpenLiteSpeed + Node.js (IP: 82.25.110.120)

> **Existing ERP on same server?** Read **[DEPLOY_SAFE_WITH_ERP.md](./DEPLOY_SAFE_WITH_ERP.md)** first. Run `bash scripts/server-audit-before-deploy.sh` on the VPS before deploying. Don Bosco uses port **3001** only — do not touch port **3000** or the ERP PM2/Nginx config.

---

## Step 0: Push your project to GitHub (do this first – repo is currently empty)

On your **PC** in the project folder (`c:\Users\johnm\donbosco`):

```powershell
# If you haven't set this repo as remote yet:
git remote add origin https://github.com/JohnSathish/donboscocollege.git

# Or if origin already points elsewhere, set this URL:
git remote set-url origin https://github.com/JohnSathish/donboscocollege.git

# Push (use your GitHub username and password or Personal Access Token when asked)
git branch -M main
git push -u origin main
```

If the repo is **private**, use a Personal Access Token instead of password: GitHub → Settings → Developer settings → Personal access tokens.

---

## Step 1: Point your domain to the server

In your **domain DNS** (where **donboscocollege.ac.in** is managed):

- Add an **A record**:  
  **Name:** `@`  
  **Value:** your server IP (e.g. `82.25.110.120`)  
  **TTL:** 300 or 3600  

- Add **www** (optional):  
  **Name:** `www`  
  **Value:** same server IP

Wait a few minutes for DNS to propagate.

---

## Step 2: SSH into the server

From your PC:

```bash
ssh root@82.25.110.120
```

(Use your actual SSH user if not `root`.)

---

## Step 3: Install Git and PM2 (if not already present)

Node.js is already on the server. Install Git and PM2:

```bash
apt update
apt install -y git
npm install -g pm2
```

---

## Step 4: Clone the repo and build the app

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/JohnSathish/donboscocollege.git donboscocollege
cd donboscocollege
npm install
npm run build
```

If the repo is **private**, use:

```bash
git clone https://YOUR_GITHUB_TOKEN@github.com/JohnSathish/donboscocollege.git donboscocollege
```

---

## Step 5: Create `.env` on the server

```bash
nano /var/www/donboscocollege/.env
```

Paste from `.env.example` and **edit** secrets and SMTP. Minimum for production:

```env
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=production

NEXTAUTH_URL="https://donboscocollege.ac.in"
NEXT_PUBLIC_SITE_URL="https://donboscocollege.ac.in"
NEXTAUTH_SECRET="REPLACE_WITH_LONG_RANDOM_STRING_AT_LEAST_32_CHARS"

# reCAPTCHA — register keys for donboscocollege.ac.in
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# SMTP (grievances, blood donors, notice alerts)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="principal@donboscocollege.ac.in"
```

Generate a strong secret on the server:

```bash
openssl rand -base64 32
```

Copy the output and replace `REPLACE_WITH_LONG_RANDOM_STRING_AT_LEAST_32_CHARS` with it.  
Save: `Ctrl+O`, Enter, `Ctrl+X`.

---

## Step 6: Prisma and PM2

```bash
cd /var/www/donboscocollege
npx prisma generate
npx prisma db push
```

### Set admin login (production)

Do **not** use the default dev password. Set a strong password via environment variables:

```bash
export ADMIN_EMAIL="admin@donboscocollege.ac.in"
export ADMIN_PASSWORD='YOUR_STRONG_PASSWORD_HERE'
npm run admin:set-password
```

Then start the app:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Run the command that `pm2 startup` prints (so the app restarts after reboot).

---

## Step 7: OpenLiteSpeed – reverse proxy and SSL

Your server uses **OpenLiteSpeed** (not Nginx). You need to:

1. **Add a virtual host** for `donboscocollege.ac.in` (or use the OpenLiteSpeed admin panel).
2. **Set up a reverse proxy** so requests are forwarded to `http://127.0.0.1:3001` (PM2 runs Next.js on port **3001** per `ecosystem.config.js`).
3. **Enable SSL** for `https://donboscocollege.ac.in` (Let’s Encrypt via the panel or certbot).

### Option A: Using OpenLiteSpeed Web Admin panel

- Log in to the OpenLiteSpeed admin (often `https://82.25.110.120:7080` or as per Hostinger instructions).
- Create a new **virtual host** with **document root** for your domain (e.g. a placeholder or the app path).
- In that vhost, add a **context** or **proxy** so:
  - **URI** or **location:** `/`
  - **Backend / proxy:** `http://127.0.0.1:3001`
- Enable **SSL** for this vhost (use the panel’s SSL / Let’s Encrypt option if available).

### Option B: Using config files (if you have shell access to OLS config)

Proxy is usually configured in the vhost config. Example idea (exact path may vary):

```apache
# Proxy all requests to Next.js
proxy / http://127.0.0.1:3001/
```

Then reload OpenLiteSpeed and request an SSL certificate (e.g. certbot for OpenLiteSpeed or the panel’s SSL feature).

### DNS and SSL

- Ensure the **A record** for `donboscocollege.ac.in` points to your server IP.
- Set **NEXTAUTH_URL** and **NEXT_PUBLIC_SITE_URL** in `.env` to `https://donboscocollege.ac.in`, then restart:

```bash
pm2 restart donbosco
```

---

## Step 8: Deploy updates from your PC (after first deploy)

1. On your PC: commit and push to GitHub.

```powershell
cd c:\Users\johnm\donbosco
git add .
git commit -m "Your update message"
git push origin main
```

2. On the server: pull, build, restart.

```bash
ssh root@82.25.110.120 "cd /var/www/donboscocollege && git pull && npm install && npm run build && npx prisma generate && npx prisma db push && pm2 restart donbosco"
```

---

## Summary

| Item | Value |
|------|--------|
| **Repo** | https://github.com/JohnSathish/donboscocollege.git |
| **Domain** | https://donboscocollege.ac.in |
| **Server IP** | 82.25.110.120 |
| **App path on server** | /var/www/donboscocollege |
| **NEXTAUTH_URL** | https://donboscocollege.ac.in |
| **NEXT_PUBLIC_SITE_URL** | https://donboscocollege.ac.in |
| **PM2 app name** | donbosco (from ecosystem.config.js) |

Do **Step 0** first so the server can clone the repo. If you tell me which OpenLiteSpeed panel or config you have (Hostinger panel name or “Web Admin Console”), I can give exact clicks or config lines for the proxy and SSL.
