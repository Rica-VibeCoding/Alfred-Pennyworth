// Proxy de desenvolvimento para contornar CORS
// Uso: node proxy-dev.js

const http = require('http');
const https = require('https');

const PROXY_PORT = 8001;
const N8N_URL = 'https://n8n-n8n.l1huim.easypanel.host/webhook-test/0c689264-8178-477c-a366-66559b14cf16';

const server = http.createServer((req, res) => {
  // CORS headers permissivos (apenas dev)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Apenas POST para /webhook
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      // Parse URL
      const url = new URL(N8N_URL);

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const proxyReq = https.request(options, (proxyRes) => {
        let responseData = '';

        proxyRes.on('data', chunk => {
          responseData += chunk;
        });

        proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(responseData);
        });
      });

      proxyReq.on('error', (e) => {
        console.error('Erro no proxy:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Erro de conexão com N8N'
        }));
      });

      proxyReq.write(body);
      proxyReq.end();
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PROXY_PORT, () => {
  console.log(`✅ Proxy rodando em http://localhost:${PROXY_PORT}`);
  console.log(`📡 Redirecionando para: ${N8N_URL}`);
  console.log('');
  console.log('Configure config.js:');
  console.log(`  API_ENDPOINT: 'http://localhost:${PROXY_PORT}/webhook'`);
});
