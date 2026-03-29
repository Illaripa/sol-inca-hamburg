// OAuth proxy para Decap CMS con GitHub
// Vercel serverless function

export function GET(req, res) {
  const { OAUTH_CLIENT_ID } = process.env;

  if (!OAUTH_CLIENT_ID) {
    return res.status(500).json({ error: 'OAUTH_CLIENT_ID no configurado' });
  }

  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/callback`;

  const params = new URLSearchParams({
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'repo,user',
    response_type: 'code',
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
