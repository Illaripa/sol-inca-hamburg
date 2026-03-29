// OAuth callback para Decap CMS con GitHub
// Vercel serverless function

export async function GET(req, res) {
  const { code } = req.query;
  const { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } = process.env;

  if (!code) {
    return res.status(400).send('Código OAuth no recibido');
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET,
        code,
      }),
    });

    const data = await tokenRes.json();

    if (data.error) {
      return res.status(401).send(`Error OAuth: ${data.error_description}`);
    }

    // Envía el token de vuelta a la ventana de Decap CMS
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <body>
      <script>
        (function() {
          const token = ${JSON.stringify(data.access_token)};
          const provider = 'github';
          const message = 'authorization:' + provider + ':success:' + JSON.stringify({ token, provider });
          function sendMessage(e) {
            window.opener.postMessage(message, e.origin);
          }
          window.addEventListener('message', sendMessage, false);
          window.opener.postMessage('authorizing:' + provider, '*');
        })();
      </script>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Error interno: ' + err.message);
  }
}
