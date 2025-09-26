module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const backendBase = process.env.BACKEND_URL || 'https://yelpcamp-vvv2.onrender.com';
  const frontendBase = process.env.FRONTEND_URL || 'https://thecampground.vercel.app';
  
  // Generate a nonce for inline styles and scripts
  const nonce = Buffer.from(Math.random().toString()).toString('base64').substring(0, 16);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>The Campgrounds – Sheet</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://js.intercomcdn.com/messenger-sheet-library.latest.js"></script>
  <style nonce="${nonce}">
    html, body { margin: 0; padding: 0; height: 100vh; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background:#fff; overflow: hidden; }
    .container { height: 100vh; display: flex; flex-direction: column; }
    .topbar { display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid #e5e7eb; flex-shrink: 0; }
    .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:12px; padding:12px; overflow-y: auto; flex: 1; }
    .card { border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; background:#fff; }
    .img { width:100%; height:140px; object-fit:cover; background:#f3f4f6; }
    .content { padding:10px; }
    .title { font-weight:600; margin:0 0 6px; }
    .desc { color:#6b7280; font-size:14px; margin:0 0 10px; }
    .row { display:flex; gap:8px; }
    .btn { display:inline-block; padding:8px 10px; border-radius:6px; text-decoration:none; font-weight:500; border:1px solid #d1d5db; color:#111827; background:#fff; }
    .btn.primary { background:#111827; color:#fff; border-color:#111827; }
    .close { border:1px solid #d1d5db; background:#fff; border-radius:6px; padding:6px 10px; cursor:pointer; }
  </style>
  <!-- Intentionally no X-Frame-Options and CSP without frame-ancestors per Intercom Sheets requirements -->
  
</head>
<body>
  <div class="container">
    <div class="topbar">
      <div>Available Campgrounds</div>
      <button class="close" id="close">Close</button>
    </div>
    <div class="grid" id="grid"></div>
  </div>

  <script nonce="${nonce}">
    const FRONTEND_URL = ${JSON.stringify(frontendBase)};
    const BACKEND_URL = ${JSON.stringify(backendBase)};

    const pickImage = (images) => {
      if (Array.isArray(images) && images.length > 0) {
        const first = images[0];
        if (typeof first === 'string') return first;
        if (first && typeof first.url === 'string') return first.url;
      }
      return FRONTEND_URL + '/og-image.png';
    };

    const formatPrice = (price) => (typeof price === 'number' ? '$' + price : 'Price on request');

    async function loadCampgrounds() {
      const url = new URL(BACKEND_URL + '/api/campgrounds');
      url.searchParams.set('limit', '12');
      const res = await fetch(url.toString(), { headers: { 'content-type': 'application/json' } });
      if (!res.ok) return [];
      const json = await res.json();
      return (json && json.data && Array.isArray(json.data.campgrounds)) ? json.data.campgrounds : [];
    }

    function renderList(campgrounds) {
      const grid = document.getElementById('grid');
      grid.innerHTML = '';
      campgrounds.forEach((cg) => {
        const id = String(cg._id || '');
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = \`
          <img class="img" src="\${pickImage(cg.images)}" alt="\${(cg.title || 'Campground')}" />
          <div class="content">
            <h3 class="title">\${cg.title || 'Untitled Campground'}</h3>
            <p class="desc">From \${formatPrice(cg.price)} • \${cg.location || 'Unknown location'}</p>
            <div class="row">
              <a class="btn" href="\${FRONTEND_URL}/campgrounds/\${id}?utm_source=intercom&utm_medium=sheet" target="_blank" rel="noopener">View</a>
              <a class="btn primary" href="\${FRONTEND_URL}/campgrounds/\${id}?book=true&utm_source=intercom&utm_medium=sheet" target="_blank" rel="noopener">Book</a>
            </div>
          </div>
        \`;
        grid.appendChild(card);
      });
    }

    document.getElementById('close').addEventListener('click', () => {
      if (window.INTERCOM_MESSENGER_SHEET_LIBRARY) {
        window.INTERCOM_MESSENGER_SHEET_LIBRARY.submitSheet({ closed: true });
      }
    });

    (async () => {
      try {
        const data = await loadCampgrounds();
        renderList(data);
      } catch (e) {
        renderList([]);
      }
    })();
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  // Intentionally omit X-Frame-Options per Intercom Sheets requirements.
  // Set CSP header that allows inline styles with hash and Intercom's script domain
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self' https:; img-src 'self' https: data:; style-src 'self' 'nonce-${nonce}' https:; script-src 'self' https://js.intercomcdn.com/ 'nonce-${nonce}'; connect-src 'self' https:; object-src 'none'; base-uri 'self';`
  );
  res.status(200).send(html);
};


