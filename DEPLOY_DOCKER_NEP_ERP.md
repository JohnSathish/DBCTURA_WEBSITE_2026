# Deploy Don Bosco College website alongside NEP ERP (Docker)

**Server:** `ssh root@82.25.110.120`  
**Repo:** https://github.com/JohnSathish/DBCTURA_WEBSITE_2026.git  
**College domain:** https://donboscocollege.ac.in  

---

## Your server layout (from audit)

| Container | Port | Role |
|-----------|------|------|
| `nep-erp-nginx-1` | **80, 443** | Public reverse proxy — **add college domain here** |
| `nep-erp-web-1` | **3000** | ERP frontend — **do not touch** |
| `nep-erp-api-1` | **3001** | ERP API — **do not touch** |
| `nep-erp-postgres-1` | 15432 | ERP database |
| `nep-erp-redis-1` | 6379 | ERP cache |
| **`donboscocollege-web`** | **3002** | **New** college website (this deploy) |

Compose files for ERP: `/opt/nep-erp/docker-compose.yml`, `docker-compose.prod.yml`

---

## Golden rules

1. **Never** change `nep-erp-web`, `nep-erp-api`, or their ports **3000/3001**.
2. **Never** run `docker compose down` in `/opt/nep-erp`.
3. College site uses **port 3002** only.
4. Only **reload** nginx after adding a new vhost — don't rebuild ERP containers.

---

## Step 1 — Clone college site (separate folder from ERP)

```bash
mkdir -p /opt/donboscocollege
cd /opt/donboscocollege
git clone https://github.com/JohnSathish/DBCTURA_WEBSITE_2026.git .
cp .env.example .env
nano .env
```

Minimum `.env`:

```env
NODE_ENV=production
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="https://donboscocollege.ac.in"
NEXT_PUBLIC_SITE_URL="https://donboscocollege.ac.in"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
```

Set admin password (one-time, after first build):

```bash
docker compose -f docker-compose.prod.yml run --rm web node -e "
console.log('Run admin:set-password on host with Node, or seed via prisma after first up')
"
# Easier: install node on host temporarily, or exec after container is up:
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec web npx prisma db push
# On host with node: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:set-password
```

---

## Step 2 — Build and start college container (port 3002)

```bash
cd /opt/donboscocollege
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl -I http://127.0.0.1:3002
```

Verify ERP still works:

```bash
curl -I http://127.0.0.1:3000
curl -I http://127.0.0.1:3001
docker ps | grep nep-erp
```

---

## Step 3 — Allow nginx to reach host port 3002

Inside `nep-erp` docker-compose, the **nginx** service needs host gateway access. Check if this exists:

```bash
grep -A2 host.docker.internal /opt/nep-erp/docker-compose*.yml
```

If missing, add under `nep-erp-nginx` service in `docker-compose.prod.yml`:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

Then **only restart nginx** (not the whole stack):

```bash
cd /opt/nep-erp
docker compose -f docker-compose.prod.yml up -d nginx
```

Alternative if `host.docker.internal` fails: use Docker bridge IP `172.17.0.1:3002` in the nginx upstream.

---

## Step 4 — Add nginx vhost for donboscocollege.ac.in

Copy the sample config from this repo:

```bash
cp /opt/donboscocollege/docker/nginx/donboscocollege.ac.in.conf \
   /opt/nep-erp/nginx/conf.d/donboscocollege.ac.in.conf
```

Edit paths to match how ERP nginx mounts SSL certs and conf.d.

Test and reload **nginx only**:

```bash
docker exec nep-erp-nginx-1 nginx -t
docker exec nep-erp-nginx-1 nginx -s reload
```

Get SSL certificate (if not already):

```bash
# Use same certbot method as ERP — often webroot via nginx
certbot certonly --webroot -w /var/www/certbot \
  -d donboscocollege.ac.in -d www.donboscocollege.ac.in
```

---

## Step 5 — DNS

Point **donboscocollege.ac.in** A record → `82.25.110.120` (same IP as ERP).

Nginx routes by **hostname** — ERP and college site can share **80/443** safely.

---

## Updates (college site only)

```bash
cd /opt/donboscocollege
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

ERP containers are not affected.

---

## Rollback

```bash
docker compose -f /opt/donboscocollege/docker-compose.prod.yml down
docker exec nep-erp-nginx-1 rm /etc/nginx/conf.d/donboscocollege.ac.in.conf
docker exec nep-erp-nginx-1 nginx -s reload
```

ERP keeps running on 3000/3001.

---

## Port map (quick reference)

```
Internet :443
    └── nep-erp-nginx-1
            ├── erp-domain.example     → nep-erp-web:3000
            └── donboscocollege.ac.in  → host:3002 → donboscocollege-web
```
