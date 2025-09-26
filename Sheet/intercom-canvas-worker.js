export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const backendBase = env.BACKEND_URL || 'https://your-backend.example.com';
    const frontendBase = env.FRONTEND_URL || 'https://thecampground.vercel.app';

    let body = {};
    try {
      body = await request.json();
    } catch (_err) {
      body = {};
    }
    const { limit = 10, search } = body || {};

    const apiUrl = new URL(`${backendBase}/api/campgrounds`);
    apiUrl.searchParams.set('limit', String(limit));
    if (search) apiUrl.searchParams.set('search', String(search));

    let campgrounds = [];
    try {
      const resp = await fetch(apiUrl.toString(), { headers: { 'content-type': 'application/json' } });
      if (resp.ok) {
        const json = await resp.json();
        const list = json && json.data && Array.isArray(json.data.campgrounds) ? json.data.campgrounds : [];
        campgrounds = list;
      }
    } catch (_e) {
      // Silent fail over to empty list
    }

    const pickImage = (images) => {
      if (Array.isArray(images) && images.length > 0) {
        const first = images[0];
        if (typeof first === 'string') return first;
        if (first && typeof first.url === 'string') return first.url;
      }
      return `${frontendBase}/og-image.png`;
    };

    const formatPrice = (price) => (typeof price === 'number' ? `$${price}` : 'Price on request');

    const items = campgrounds.map((cg) => {
      const id = String(cg._id || '');
      return {
        type: 'item',
        title: cg.title || 'Untitled Campground',
        image: { url: pickImage(cg.images) },
        description: `From ${formatPrice(cg.price)} • ${cg.location || 'Unknown location'}`,
        buttons: [
          {
            type: 'button',
            label: 'View',
            action: { type: 'url', url: `${frontendBase}/campgrounds/${id}?utm_source=intercom&utm_medium=messenger` }
          },
          {
            type: 'button',
            label: 'Book',
            action: { type: 'url', url: `${frontendBase}/campgrounds/${id}?book=true&utm_source=intercom&utm_medium=messenger` }
          }
        ]
      };
    });

    const canvas = {
      canvas: {
        content: {
          components: items.length > 0
            ? [{ type: 'list', items }]
            : [{ type: 'text', text: 'No campgrounds available right now.' }]
        }
      }
    };

    return new Response(JSON.stringify(canvas), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  }
};


