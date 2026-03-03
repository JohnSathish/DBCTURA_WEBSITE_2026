# Deploy Don Bosco College to your server

**Repo:** [https://github.com/JohnSathish/donboscocollege](https://github.com/JohnSathish/donboscocollege)  
**Domain:** https://donboscocollegetura.cloud  
**Server:** Ubuntu 24.04 + OpenLiteSpeed + Node.js (IP: 82.25.110.120)

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

In your **domain DNS** (where donboscocollegetura.cloud is managed):

- Add an **A record**:  
  **Name:** `@` (or `donboscocollegetura`)  
  **Value:** `82.25.110.120`  
  **TTL:** 300 or 3600  

- Optional: add **www**  
  **Name:** `www`  
  **Value:** `82.25.110.120`

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

Paste this and **edit** the secret and keys:

```env
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=production

NEXTAUTH_URL="https://donboscocollegetura.cloud"
NEXTAUTH_SECRET="REPLACE_WITH_LONG_RANDOM_STRING_AT_LEAST_32_CHARS"

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIJgYsAAAAAJs_65ZtGwVc6ic3DI0iNnXS5okt
RECAPTCHA_SECRET_KEY=6LeIJgYsAAAAAC5jRGoLZfAge8zosnNikl43cEJ4
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
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Run the command that `pm2 startup` prints (so the app restarts after reboot).

---

## Step 7: OpenLiteSpeed – reverse proxy and SSL

Your server uses **OpenLiteSpeed** (not Nginx). You need to:

1. **Add a virtual host** for `donboscocollegetura.cloud` (or use the OpenLiteSpeed admin panel).
2. **Set up a reverse proxy** so that requests to `donboscocollegetura.cloud` are forwarded to `http://127.0.0.1:3000` (where Next.js runs under PM2).
3. **Enable SSL** for `https://donboscocollegetura.cloud` (e.g. Let’s Encrypt via the panel or certbot).

### Option A: Using OpenLiteSpeed Web Admin panel

- Log in to the OpenLiteSpeed admin (often `https://82.25.110.120:7080` or as per Hostinger instructions).
- Create a new **virtual host** with **document root** for your domain (e.g. a placeholder or the app path).
- In that vhost, add a **context** or **proxy** so:
  - **URI** or **location:** `/`
  - **Backend / proxy:** `http://127.0.0.1:3000`
- Enable **SSL** for this vhost (use the panel’s SSL / Let’s Encrypt option if available).

### Option B: Using config files (if you have shell access to OLS config)

Proxy is usually configured in the vhost config. Example idea (exact path may vary):

```apache
# Proxy all requests to Next.js
proxy / http://127.0.0.1:3000/
```

Then reload OpenLiteSpeed and request an SSL certificate (e.g. certbot for OpenLiteSpeed or the panel’s SSL feature).

### DNS and SSL

- Ensure the **A record** for `donboscocollegetura.cloud` points to `82.25.110.120`.
- After the proxy works, set **NEXTAUTH_URL** in `.env` to `https://donboscocollegetura.cloud` (already in Step 5) and restart:

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
| **Domain** | https://donboscocollegetura.cloud |
| **Server IP** | 82.25.110.120 |
| **App path on server** | /var/www/donboscocollege |
| **NEXTAUTH_URL** | https://donboscocollegetura.cloud |
| **PM2 app name** | donbosco (from ecosystem.config.js) |

Do **Step 0** first so the server can clone the repo. If you tell me which OpenLiteSpeed panel or config you have (Hostinger panel name or “Web Admin Console”), I can give exact clicks or config lines for the proxy and SSL.
