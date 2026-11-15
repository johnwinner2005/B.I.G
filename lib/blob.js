// Finds the Blob token however Vercel named it (BLOB_READ_WRITE_TOKEN or a custom prefix).
function findToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const k = Object.keys(process.env).find(n => /_READ_WRITE_TOKEN$/.test(n) && process.env[n]);
  return k ? process.env[k] : '';
}
async function blob() {
  const token = findToken();
  if (!token) { const e = new Error('NO_TOKEN'); e.code = 'NO_TOKEN'; throw e; }
  const m = await import('@vercel/blob');
  return { token, put: (n, d, o) => m.put(n, d, { ...o, token }), list: o => m.list({ ...o, token }) };
}
function explain(e) {
  const m = String((e && e.message) || e || '');
  if (e && e.code === 'NO_TOKEN') return 'Storage is not connected. In Vercel open Storage, create a Blob store (choose Public), connect it to this project for all environments, then redeploy.';
  if (/private/i.test(m)) return 'This Blob store is private. Create a new Blob store with Public access and connect it to this project, then redeploy.';
  if (/Cannot find (package|module)/i.test(m)) return 'Server packages were not installed. Redeploy the project from the latest GitHub commit.';
  return 'Storage error: ' + m.slice(0, 200);
}
module.exports = { blob, explain, findToken };
