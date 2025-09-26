module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Log the incoming request for debugging
  console.log('Intercom request body:', JSON.stringify(req.body, null, 2));
  console.log('Intercom request headers:', JSON.stringify(req.headers, null, 2));

  const defaultFrontend = process.env.FRONTEND_URL || '';
  const forwardedProto = req.headers['x-forwarded-proto'] || 'https';
  const forwardedHost = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = defaultFrontend || `${forwardedProto}://${forwardedHost}`;
  const sheetUrl = process.env.SHEET_URL || `${baseUrl}/api/intercom-sheet`;

  const payload = {
    canvas: {
      content: {
        components: [
          {
            type: 'text',
            text: 'Browse our available campgrounds and find your perfect outdoor getaway!'
          },
          {
            type: 'button',
            id: 'view_campgrounds_btn',
            label: 'View Campgrounds',
            action: {
              type: 'sheet',
              url: sheetUrl
            }
          }
        ]
      }
    }
  };

  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).json(payload);
  } catch (error) {
    console.error('Error in initialize webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


