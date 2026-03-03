# Deployment checklist – what you need to push the project to your server

Use this list to gather everything before deploying. **Do not paste passwords or secrets here** – keep them in a safe place and use them when you run the commands.

---

## 1. Server access (you’ll use these to SSH and run commands)

| Item | Example | Your value |
|------|---------|------------|
| **VPS IP** | `82.25.110.120` | `82.25.110.120` ✅ |
| **SSH username** | `root` or your user | .................... |
| **SSH password or key** | — | Keep secure; use when connecting |

---

## 2. Where your code lives (for the server to clone/pull)

| Item | Example | Your value |
|------|---------|------------|
| **Git repo URL** | `https://github.com/yourusername/donbosco.git` | `https://github.com/JohnSathish/donboscocollege.git` ✅ |
| **Repo visibility** | Public or Private | .................... |
| **If private:** Deploy key or Personal Access Token | — | Create on GitHub/GitLab; use on server for `git clone` / `git pull` |

If the project is **not on GitHub/GitLab yet**: create a repo, push your code from your PC once, then use that repo URL on the server.

---

## 3. Domain or IP for the site

| Item | Example | Your value |
|------|---------|------------|
| **Domain name** (optional) | `donbosco.yourdomain.com` or `yourdomain.com` | `https://donboscocollegetura.cloud` ✅ |
| **Or use IP only** | `http://82.25.110.120` | Works for testing |

- **NEXTAUTH_URL** on the server must match how you open the site (e.g. `https://yourdomain.com` or `http://82.25.110.120`).
- If you use a domain, point its **A record** to `82.25.110.120`.

---

## 4. App directory on the server

Where the project will live on the VPS. Common choices:

- `/var/www/donbosco` (used in the guide)
- Or a path suggested by your Hostinger/OpenLiteSpeed panel (e.g. under `~/` or `/home/...`)

| Item | Your value |
|------|------------|
| **Full path on server** | `/var/www/donboscocollege` ✅ |

---

## 5. Production secrets (create or generate; never commit to Git)

| Item | Where to set | Notes |
|------|--------------|--------|
| **NEXTAUTH_SECRET** | In `.env` on the server | At least 32 random characters. On server run: `openssl rand -base64 32` |
| **NEXTAUTH_URL** | In `.env` on the server | `https://yourdomain.com` or `http://82.25.110.120` |
| **reCAPTCHA** (if you use it) | In `.env` on the server | Same as local or new keys for production domain |

---

## 6. What you already have

- ✅ **OS:** Ubuntu 24.04  
- ✅ **Stack:** OpenLiteSpeed + Node.js  
- ✅ **VPS IP:** 82.25.110.120  
- ✅ **Project:** Don Bosco (Next.js, Prisma, SQLite) ready to deploy  

---

## Next steps once you have the above

1. **Put the project on Git** (if not already): create repo, push from your PC.
2. **SSH into the server:** `ssh YOUR_SSH_USER@82.25.110.120`
3. **Follow `HOSTINGER_VPS_DEPLOYMENT.md`** – use **OpenLiteSpeed** instead of Nginx for the reverse proxy (proxy to `http://127.0.0.1:3000`).
4. **Create `.env` on the server** with `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and reCAPTCHA keys.
5. **Clone, install, build, PM2, then configure OpenLiteSpeed** for your domain or IP.

If you tell me: (1) Git repo URL, (2) domain or “IP only”, (3) app path on server, I can give you the exact commands to run in order (adapted for OpenLiteSpeed).
