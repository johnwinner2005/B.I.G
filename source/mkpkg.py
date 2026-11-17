import os, re, shutil, zipfile, json
auth = open('p0-auth.js').read()
USER, SALT, ITER, HASH = re.search(r"user: '([^']+)', salt: '([0-9a-f]+)', iter: (\d+), hash: '([0-9a-f]+)'", auth).groups()
root = 'pkg/big-autos-site'
shutil.rmtree('pkg', ignore_errors=True); os.makedirs(f'{root}/public'); os.makedirs(f'{root}/backend')
os.system('python3 build.py /tmp/_p.html auto')
reset = ':root{color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;background:#07080B;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}'
open(f'{root}/public/index.html', 'w').write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="description" content="B.I.G Autos. Cars ready for sale and exclusive car rentals in Lagos, Nigeria."><meta name="theme-color" content="#CE3837"><style>' + reset + '</style></head><body>' + open('/tmp/_p.html').read() + '</body></html>')
srv = open('server.template.js').read().replace('__USER__', USER).replace('__SALT__', SALT).replace('__ITER__', ITER).replace('__HASH__', HASH)
open(f'{root}/backend/server.js', 'w').write(srv)
open(f'{root}/Dockerfile', 'w').write('FROM node:22-alpine\nWORKDIR /app\nCOPY backend/server.js ./server.js\nCOPY public ./public\nENV NODE_ENV=production DATA_DIR=/data\nEXPOSE 3000\nCMD ["node", "server.js"]\n')
open(f'{root}/docker-compose.yml', 'w').write('''services:
  app:
    build: .
    restart: unless-stopped
    environment:
      DATA_DIR: /data
      ADMIN_USER: ${ADMIN_USER:-}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD:-}
    volumes:
      - ./data:/data
    expose:
      - "3000"
  caddy:
    image: caddy:2
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      SITE_ADDRESS: ${SITE_ADDRESS:-:80}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - app
volumes:
  caddy_data:
  caddy_config:
''')
open(f'{root}/Caddyfile', 'w').write('{$SITE_ADDRESS} {\n\tencode gzip\n\treverse_proxy app:3000\n}\n')
open(f'{root}/.env.example', 'w').write('# Copy this file to .env on the server and fill it in.\n# Your domain, for example bigautos.com.ng (leave as :80 to test with the server IP, no HTTPS)\nSITE_ADDRESS=:80\n# Optional: choose your own admin login. Leave empty to use the built-in one.\nADMIN_USER=\nADMIN_PASSWORD=\n')
open(f'{root}/.gitignore', 'w').write('node_modules\n.env\ndata/\n.vercel\n')
json.dump({"name": "big-autos-site", "version": "1.0.0", "private": True, "engines": {"node": ">=18"}}, open(f'{root}/package.json', 'w'), indent=2)
json.dump({"framework": None, "buildCommand": "", "installCommand": "", "outputDirectory": "public"}, open(f'{root}/vercel.json', 'w'), indent=2)
open(f'{root}/.vercelignore', 'w').write("backend\nDockerfile\ndocker-compose.yml\nCaddyfile\n.env.example\nsource\ndata\n")
open(f'{root}/README.md', 'w').write(f"""# B.I.G Autos site

The site and the admin dashboard in one small server. No database to install and no outside services.
Edit a car or add a photo in the dashboard, press **Publish changes**, and customers see it straight away.

Everything you add is kept in the `data/` folder next to this code: `data/state.json` (all text and settings),
`data/uploads/` (photos and videos) and `data/backups/` (the last 30 published versions).

## Put it on Vercel (static, no setup)

Import the repo in Vercel and deploy. `vercel.json` and `.vercelignore` already tell Vercel this is a plain static site, so you need no settings, build command or storage.
On Vercel the dashboard saves into this GitHub repository: open `/#admin`, go to Site, then Publishing, and add a GitHub key (Contents: Read and write on this repo).

## Put it on your Hostinger VPS (about 10 minutes)

1. Point your domain at the VPS. In your domain's DNS add an **A record** for the domain (and `www`) with the VPS IP address.
2. On the VPS (Hostinger's browser terminal works), install Docker if it is missing: `curl -fsSL https://get.docker.com | sh`
3. Download the code: `git clone https://github.com/johnwinner2005/big-autos-main-site && cd big-autos-main-site`
4. Create your settings: `cp .env.example .env` then `nano .env` and set `SITE_ADDRESS=yourdomain.com`
5. Start it: `docker compose up -d --build`

The site is live at your domain with HTTPS (Caddy gets the certificate by itself). Open `yourdomain.com/#admin` to sign in.

**Update the code later:** `git pull && docker compose up -d --build`. Your photos and data are not touched.
**Back up:** copy the `data/` folder.

## Login

Username `{USER}`. The password is the one sent to you in chat. To use your own, put `ADMIN_USER` and `ADMIN_PASSWORD` in `.env` and run `docker compose up -d`.

## Notes
- One admin. Anyone signed in can change the whole site, so keep the password private.
- Photos are shrunk automatically. Videos must be under 12 MB.
- Without Docker: `node backend/server.js` works on any machine with Node 18 or newer. Use `PORT` and `DATA_DIR` to change the port and the data folder.
- The editable source is in `source/`. Rebuild with `python3 mkpkg.py` from inside `source/`.
- If you host only the `public/` folder on a static host, the dashboard falls back to saving into GitHub (see Site, Publishing).
""")
zp = 'big-autos-vercel.zip'
if os.path.exists(zp): os.remove(zp)
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
    for dp, _, fs in os.walk('pkg'):
        for f in fs:
            p = os.path.join(dp, f); z.write(p, os.path.relpath(p, 'pkg'))
print('zip', os.path.getsize(zp))
