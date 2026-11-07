import sys, os
mode = sys.argv[2] if len(sys.argv) > 2 else 'artifact'
head='<title>B.I.G Autos</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap">\n'
css=open('app.css').read()
files=['p0-brand.js','p0-auth.js','p0-photos.js','p0-hero.js','p1-core.js','p2-public.js','p3-fx-viewer.js','p4-admin.js','p5-events.js']
parts=[]
for f in files:
    s=open(f).read()
    if f=='p0-auth.js' and mode=='vercel': s='const ADMIN = null; /* real login is checked on the server */\n'
    parts.append(s+'\n')
js=''.join(parts).replace('__MODE__',mode)
state=open('state.json').read().strip().replace('</','<\\/') if os.path.exists('state.json') else 'null'
doc=head+'<style id="app-css">'+css+'</style>\n<div id="root"><div style="min-height:100svh;background:#07080B"></div></div>\n<script type="application/json" id="state">'+state+'</script>\n<script id="app">(()=>{\'use strict\';\n'+js+'\n})();</script>'
open(sys.argv[1] if len(sys.argv)>1 else 'index.html','w').write(doc)
