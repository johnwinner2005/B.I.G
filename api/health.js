const { findToken } = require('../lib/blob');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  let pkg = true; try { require.resolve('@vercel/blob'); } catch { pkg = false; }
  res.status(200).json({ ok: true, storageTokenFound: !!findToken(), blobPackageInstalled: pkg, node: process.version });
};
