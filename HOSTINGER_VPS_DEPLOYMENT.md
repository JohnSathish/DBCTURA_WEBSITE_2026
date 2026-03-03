# Hostinger VPS – Step-by-Step Deployment Guide

Use this guide to deploy the Don Bosco project on a Hostinger VPS and to push updates from your local machine.

---

## Part A: What You Need From Hostinger

1. **VPS plan**  
   Any Hostinger VPS (e.g. KVM 1–4) is fine.

2. **From Hostinger panel, get:**
   - **VPS IP address** (e.g. `123.45.67.89`)
   - **SSH username** (often `root` or a user you created)
   - **SSH password** (or SSH key if you use one)
   - **OS** – use **Ubuntu 22.04** (or 24.04) if you can choose.

3. **Domain (optional but recommended)**  
   - Either use Hostinger’s DNS and point your domain’s A record to the VPS IP.  
   - Or use the VPS IP directly for testing (e.g. `http://123.45.67.89`).

4. **Code hosting (for “push from here”)**
   - **GitHub** or **GitLab** (or similar): create a repo, push your project from your PC.  
   - You’ll need the repo URL (e.g. `https://github.com/yourusername/donbosco.git`) and, if private, a **Personal Access Token** or **deploy key** for the VPS to clone/pull.

---

## Part B: First-Time Setup on the VPS (SSH)

Connect to your VPS from your PC (PowerShell or any terminal):

```bash
ssh root@YOUR_VPS_IP
```

Replace `YOUR_VPS_IP` with the IP from Hostinger. Enter the SSH password when asked.

### Step 1: Update system

```bash
apt update && apt upgrade -y
```

### Step 2: Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # should show v20.x
npm -v
```

### Step 3: Install Git, Nginx, and PM2

```bash
apt install -y git nginx
npm install -g pm2
```

### Step 4: Create app directory and clone your repo

Replace `YOUR_REPO_URL` with your actual Git URL (e.g. from GitHub).

```bash
mkdir -p /var/www
cd /var/www
git clone YOUR_REPO_URL donbosco
cd donbosco
```

If the repo is **private**, use one of these:

- **HTTPS with token:**  
  `git clone https://YOUR_TOKEN@github.com/yourusername/donbosco.git donbosco`
- **SSH:**  
  Add your VPS SSH key to GitHub/GitLab, then:  
  `git clone git@github.com:yourusername/donbosco.git donbosco`

### Step 5: Install dependencies and build

```bash
cd /var/www/donbosco
npm install
npm run build
```

### Step 6: Create environment file on the VPS

Create the production `.env` on the server (do **not** commit real secrets to Git):

```bash
nano /var/www/donbosco/.env
```

Paste and **edit** these (use your real domain and a strong secret):

```env
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=production

NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="put-a-long-random-string-here-at-least-32-characters"

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

- Replace `https://yourdomain.com` with your actual domain (or `http://YOUR_VPS_IP` for testing).
- Generate a strong `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32` on the VPS).
- Save: `Ctrl+O`, Enter, then `Ctrl+X`.

### Step 7: Prisma (DB) and PM2

```bash
cd /var/www/donbosco
npx prisma generate
npx prisma db push
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Follow the command `pm2 startup` prints (run the line it suggests) so the app starts after reboot.

### Step 8: Nginx reverse proxy

Create a site config:

```bash
nano /etc/nginx/sites-available/donbosco
```

Paste (replace `yourdomain.com` and `YOUR_VPS_IP` if using IP only):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # If using IP only: server_name YOUR_VPS_IP;

    location / {
        proxy_pass http://127.0.0.1:3000;
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

Enable and reload:

```bash
ln -sf /etc/nginx/sites-available/donbosco /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### Step 9: SSL with Let’s Encrypt (recommended if you use a domain)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will adjust Nginx for HTTPS.

---

## Part C: Deploy Updates From Your PC (“Push From Here”)

After the first-time setup, you can deploy like this from your **local machine** (where the project lives).

### Option 1: Git push + SSH (recommended)

1. **On your PC** – commit and push to GitHub/GitLab:

   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
   (Use your real branch name if not `main`.)

2. **On the VPS** – pull, build, restart:

   ```bash
   ssh root@YOUR_VPS_IP "cd /var/www/donbosco && git pull && npm install && npm run build && npx prisma generate && npx prisma db push && pm2 restart donbosco"
   ```

   Run this single line from your PC (replace `YOUR_VPS_IP`). You’ll be asked for the SSH password (or use SSH key so no password).

### Option 2: Deploy script on your PC (Windows PowerShell)

A script `deploy.ps1` is in the project root. Before first use, edit it and set:

- `$VPS_IP` = your Hostinger VPS IP  
- `$SSH_USER` = usually `root`  
- `$BRANCH` = e.g. `main`

Then from PowerShell in the project folder:

```powershell
.\deploy.ps1
```

You’ll be asked for a commit message; the script will push to Git and then run pull/build/restart on the VPS over SSH.

---

## Part D: Quick Reference

| Item              | Example / command |
|-------------------|-------------------|
| SSH into VPS      | `ssh root@YOUR_VPS_IP` |
| App directory     | `/var/www/donbosco` |
| Restart app       | `pm2 restart donbosco` |
| View logs         | `pm2 logs donbosco` |
| Nginx reload      | `systemctl reload nginx` |
| Env file on VPS   | `/var/www/donbosco/.env` |

---

## What Hostinger Needs to Provide

- VPS with **root (or sudo) SSH access**
- **Ubuntu 22.04** (or 24.04) recommended
- Your **VPS IP**, **SSH user**, and **SSH password** (or key)

You do **not** need Hostinger to install Node or run the app; you do that yourself on the VPS as above. You **can** push from your PC by pushing to Git and then running the one-line SSH command (or the deploy script) to pull and rebuild on the server.
