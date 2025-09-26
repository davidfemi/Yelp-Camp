module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

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

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(payload));
};


