# B.I.G Autos site

The site and the admin dashboard in one small server. No database to install and no outside services.
Edit a car or add a photo in the dashboard, press **Publish changes**, and customers see it straight away.

Everything you add is kept in the `data/` folder next to this code: `data/state.json` (all text and settings),
`data/uploads/` (photos and videos) and `data/backups/` (the last 30 published versions).

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

Username `bigautos-admin`. The password is the one sent to you in chat. To use your own, put `ADMIN_USER` and `ADMIN_PASSWORD` in `.env` and run `docker compose up -d`.

## Notes
- One admin. Anyone signed in can change the whole site, so keep the password private.
- Photos are shrunk automatically. Videos must be under 12 MB.
- Without Docker: `node server.js` works on any machine with Node 18 or newer. Use `PORT` and `DATA_DIR` to change the port and the data folder.
- The editable source is in `source/`. Rebuild with `python3 mkpkg.py` from inside `source/`.
- If you host only the `public/` folder on a static host, the dashboard falls back to saving into GitHub (see Site, Publishing).
