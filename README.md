# B.I.G Autos site

Public site at `/`, admin at `/#admin` (or the "Staff" link in the footer).

## Deploy (about 5 minutes)

1. Unzip this folder. Go to vercel.com, sign in, then **Add New → Project**.
   - Easiest: put the folder in a GitHub repo and import it.
   - Or install the CLI and run `npx vercel --prod` inside this folder.
2. Leave the framework as **Other**. No build command is needed.
3. After the first deploy, open the project, go to **Storage → Create Database → Blob**, name it anything, and **Connect** it to this project (all environments). This adds `BLOB_READ_WRITE_TOKEN` for you.
4. **Redeploy** (Deployments → the latest one → Redeploy) so the site picks up the storage.
5. Open `your-project.vercel.app/#admin`, sign in, change anything, tap **Publish changes**. Visitors see it within about a minute.

## Login

Username `bigautos-admin`. The password is the one sent to you in chat. Only a hash is stored in this code.

To change it, add these in Vercel → Settings → Environment Variables, then redeploy:
- `ADMIN_USER` (optional, default `bigautos-admin`)
- `ADMIN_PASSWORD` (your new password; it overrides the built-in one)
- `SESSION_SECRET` (optional, any long random text)

## Notes
- Photos you upload are stored in Blob and the site keeps only their links. Keep each photo or video under 3 MB (photos are shrunk automatically).
- Your edits save on your device first. They go live for everyone only when you press **Publish changes**.
- To use your own domain later: Project → Settings → Domains.

## Source

`public/index.html` is a built file. The editable source is in `source/`
(`p*.js`, `app.css`, `state.json`). Rebuild the Vercel package with
`python3 mkvercel.py` from inside `source/`; it writes to `vercel-pkg/` and a zip.
