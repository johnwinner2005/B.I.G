module.exports = async (req, res) => {
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'site/state.json' });
    const b = blobs.find(x => x.pathname === 'site/state.json');
    if (!b) return res.status(404).json({ error: 'Nothing published yet' });
    const r = await fetch(b.url + '?v=' + new Date(b.uploadedAt).getTime());
    if (!r.ok) return res.status(502).json({ error: 'Could not read the published data' });
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
    return res.status(200).send(await r.text());
  } catch (e) {
    return res.status(404).json({ error: 'Storage is not connected yet' });
  }
};
