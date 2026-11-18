import sys, os, re, base64, hashlib
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
if mode != 'artifact' and state != 'null':
    import json as _j
    _s = _j.loads(state.replace('<\\/', '</'))
    _s['cars'] = [c for c in _s.get('cars', []) if not c.get('sample')]
    _s['reviews'] = [r for r in _s.get('reviews', []) if not r.get('sample')]
    state = _j.dumps(_s, separators=(',', ':')).replace('</', '<\\/')
if mode != 'artifact':
    out = os.path.dirname(os.path.abspath(sys.argv[1])); os.makedirs(os.path.join(out, 'img'), exist_ok=True)
    def ext(m):
        data = base64.b64decode(m.group(2)); e = {'jpeg': 'jpg', 'png': 'png', 'webp': 'webp'}[m.group(1)]
        name = hashlib.sha1(data).hexdigest()[:12] + '.' + e
        open(os.path.join(out, 'img', name), 'wb').write(data); return '/img/' + name
    rx = r"data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)"
    js = re.sub(rx, ext, js); state = re.sub(rx, ext, state); css = re.sub(rx, ext, css)
    first = re.search(r"const HERO = \[\"([^\"]+)\"", js)
    boot = ('<script>try{var t=JSON.parse(localStorage.getItem("big-skin"));document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark")}catch(e){document.documentElement.setAttribute("data-theme","dark")}'
            'window.__boot={h:fetch("/api/health",{cache:"no-store"}).then(function(r){return r.ok?r.json():null}).catch(function(){return null}),'
            's:fetch("/data/state.json",{cache:"no-cache"}).then(function(r){return r.ok?r.json():null}).catch(function(){return null})}</script>\n')
    pre = ('<link rel="preload" as="image" href="' + first.group(1) + '" fetchpriority="high">\n') if first else ''
    fonts = re.search(r'<link rel="stylesheet" href="(https://fonts.googleapis.com[^"]+)">', head).group(1)
    head = head.replace('<link rel="stylesheet" href="' + fonts + '">', '<link rel="stylesheet" href="' + fonts + '" media="print" onload="this.media=\'all\'"><noscript><link rel="stylesheet" href="' + fonts + '"></noscript>')
    head = boot + pre + head
    skel = '<div class="sk" aria-hidden="true"><div class="sk-top"><i class="sk-logo"></i><i class="sk-dot"></i></div><div class="sk-hero"><i class="sk-l w60"></i><i class="sk-l w80"></i><i class="sk-l w40"></i><i class="sk-img"></i></div><div class="sk-grid"><i></i><i></i><i></i></div></div>'
else:
    skel = '<div style="min-height:100svh;background:#07080B"></div>'
doc=head+'<style id="app-css">'+css+'</style>\n<div id="root">'+skel+'</div>\n<script type="application/json" id="state">'+state+'</script>\n<script id="app">(()=>{\'use strict\';\n'+js+'\n})();</script>'
open(sys.argv[1] if len(sys.argv)>1 else 'index.html','w').write(doc)
