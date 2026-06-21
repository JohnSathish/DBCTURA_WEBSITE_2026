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
DATABASE_URL="file:/app/data/dev.db"
NEXTAUTH_URL="https://donboscocollege.ac.in"
NEXT_PUBLIC_SITE_URL="https://donboscocollege.ac.in"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
```

Database schema is applied with the **tools** profile (uses full build image with Prisma CLI):

```bash
docker compose -f docker-compose.prod.yml --profile tools run --rm --build db-push
```

**Question Bank error** (`column academicYear does not exist`): production DB still has the old `QuestionPaper` table. Run the one-time migration (backs up DB, drops legacy table, re-applies schema):

```bash
bash /opt/donboscocollege/scripts/migrate-academics-schema.sh
```

Then re-upload question papers via `/admin/question-bank`.

Set admin password:

```bash
docker compose -f docker-compose.prod.yml --profile tools run --rm \
  -e ADMIN_EMAIL=admin@donboscocollege.ac.in \
  -e ADMIN_PASSWORD='your-strong-password' \
  admin-password
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

**Symptom:** `donboscocollege.ac.in` shows **BCL OneCampus ERP** instead of the college website.  
**Cause:** Nginx has no vhost for the college domain, so traffic falls through to the ERP default server (port 3000).

### 4a — HTTP routing first (recommended)

```bash
# College app must respond locally
curl -I http://127.0.0.1:3002/

cp /opt/donboscocollege/docker/nginx/donboscocollege.ac.in.http-only.conf \
   /opt/nep-erp/nginx/conf.d/donboscocollege.ac.in.conf

docker exec nep-erp-nginx-1 nginx -t
docker exec nep-erp-nginx-1 nginx -s reload
```

Open **http://donboscocollege.ac.in** — you should see the Don Bosco College homepage (not ERP).

If upstream fails, edit the conf and replace `host.docker.internal` with `172.17.0.1`.

### 4b — HTTPS (after HTTP works)

```bash
certbot certonly --webroot -w /var/www/certbot \
  -d donboscocollege.ac.in -d www.donboscocollege.ac.in

cp /opt/donboscocollege/docker/nginx/donboscocollege.ac.in.conf \
   /opt/nep-erp/nginx/conf.d/donboscocollege.ac.in.conf

docker exec nep-erp-nginx-1 nginx -t
docker exec nep-erp-nginx-1 nginx -s reload
```

Verify ERP vhost uses its **own** `server_name` (not `_` / `default_server` for every domain). List configs:

```bash
docker exec nep-erp-nginx-1 ls -la /etc/nginx/conf.d/
docker exec nep-erp-nginx-1 grep -r "server_name\|default_server\|proxy_pass" /etc/nginx/conf.d/
```

---

## Step 5 — DNS

Point **donboscocollege.ac.in** A record → `82.25.110.120` (same IP as ERP).

Nginx routes by **hostname** — ERP and college site can share **80/443** safely.

---

## Updates (college site only)

**Always use the deploy script** — it rebuilds the app and fixes the nginx upstream (prevents 502 after rebuild):

```bash
cd /opt/donboscocollege
git pull origin main
bash scripts/deploy-college.sh
```

Or one line:

```bash
bash /opt/donboscocollege/scripts/deploy-college.sh
```

### Why you get 502 after `docker compose up --build`

When `donboscocollege-web` is recreated, its **Docker IP changes**. Nginx still proxies to the **old IP**, so you see **502 Bad Gateway**.

The deploy script:

1. Pulls code and rebuilds `donboscocollege-web`
2. Waits until `http://127.0.0.1:3002` responds
3. Connects the college container to the ERP nginx network
4. Updates `donboscocollege_upstream` in nginx config to `donboscocollege-web:3000` (or current IP)
5. Runs `nginx -t` and `nginx -s reload`

**Do not use plain `git pull && docker compose up --build` without the nginx fix.**

Manual fix if needed:

```bash
bash /opt/donboscocollege/scripts/deploy-college.sh
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
