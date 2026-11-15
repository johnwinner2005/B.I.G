import os, re, shutil, zipfile, json
auth = open('p0-auth.js').read()
m = re.search(r"user: '([^']+)', salt: '([0-9a-f]+)', iter: (\d+), hash: '([0-9a-f]+)'", auth)
USER, SALT, ITER, HASH = m.groups()
root = 'vercel-pkg/big-autos-site'
shutil.rmtree('vercel-pkg', ignore_errors=True)
for d in ['public']: os.makedirs(f'{root}/{d}')
os.system('python3 build.py /tmp/_v.html github')
body = open('/tmp/_v.html').read()
reset = ':root{color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;background:#07080B;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}'
page = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<meta name="description" content="B.I.G Autos. Cars ready for sale and exclusive car rentals in Lagos, Nigeria.">'
        '<meta name="theme-color" content="#CE3837"><style>' + reset + '</style></head><body>' + body + '</body></html>')
open(f'{root}/public/index.html', 'w').write(page)

json.dump({"name": "big-autos-site", "version": "1.0.0", "private": True, "description": "B.I.G Autos website with admin dashboard", "engines": {"node": ">=18"}}, open(f'{root}/package.json', 'w'), indent=2)
json.dump({"outputDirectory": "public", "headers": [{"source": "/(.*)", "headers": [{"key": "X-Content-Type-Options", "value": "nosniff"}, {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"}]}]}, open(f'{root}/vercel.json', 'w'), indent=2)
open(f'{root}/.gitignore', 'w').write('node_modules\n.vercel\n.env*\n')
open(f'{root}/README.md', 'w').write(f"""# B.I.G Autos site

Plain website with a built-in admin dashboard. No database, no server code and no Vercel storage.
When you press **Publish changes** in the dashboard, the changes are saved straight into this GitHub repository
(`public/data/state.json` for the text, `public/uploads/` for photos and videos). Your host rebuilds the site by itself.

## One-time setup

1. **Host the repo.** On Vercel: Add New, Project, import this repo. Framework: Other. Output directory: `public`. No build command, no environment variables, no storage.
2. **Make a GitHub key** (about 2 minutes): GitHub, Settings, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token.
   - Repository access: only this repository.
   - Permissions: Contents, Read and write.
3. **Connect the dashboard.** Open `your-site/#admin` and sign in. Go to Site, then Publishing. Paste the repository (`owner/name`), the branch (`main`) and the key. Press Save, then Test connection.
4. Edit anything, then press **Publish changes**. The live site updates in about a minute.

Do step 3 once on each phone or computer you publish from. The key is kept only on that device. Anyone without the key cannot change the site.

## Login

Username `{USER}`. The password is the one sent to you in chat. This login only opens the dashboard on your device. The GitHub key is what protects publishing.

## Notes
- Photos are shrunk automatically. Videos must be under 12 MB.
- Newly uploaded photos can look empty on your own screen for a minute, until the site finishes rebuilding.
- The editable source is in `source/`. Rebuild the package with `python3 mkvercel.py` from inside `source/`.
""")
# zip
zp = 'big-autos-vercel.zip'
if os.path.exists(zp): os.remove(zp)
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
    for dp, _, fs in os.walk('vercel-pkg'):
        for f in fs:
            p = os.path.join(dp, f); z.write(p, os.path.relpath(p, 'vercel-pkg'))
print('zip', os.path.getsize(zp))
