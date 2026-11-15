# B.I.G Autos site

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

Username `bigautos-admin`. The password is the one sent to you in chat. This login only opens the dashboard on your device. The GitHub key is what protects publishing.

## Notes
- Photos are shrunk automatically. Videos must be under 12 MB.
- Newly uploaded photos can look empty on your own screen for a minute, until the site finishes rebuilding.
- The editable source is in `source/`. Rebuild the package with `python3 mkvercel.py` from inside `source/`.
