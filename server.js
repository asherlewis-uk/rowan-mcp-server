import express from 'express';

const app = express();

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 8080);
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://${HOST}:${PORT}`;

app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'rowan-mcp-server',
    status: 'running',
    transport: 'http-scaffold',
    endpoints: {
      health: '/health',
      mcp: '/mcp'
    },
    publicBaseUrl: PUBLIC_BASE_URL
  });
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'rowan-mcp-server',
    timestamp: new Date().toISOString()
  });
});

app.get('/mcp', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'rowan-mcp-server',
    route: '/mcp',
    message: 'HTTP endpoint scaffold is live. MCP transport and tool registration are not wired yet.'
  });
});

app.post('/mcp', (req, res) => {
  res.status(501).json({
    ok: false,
    error: 'not_implemented',
    message: 'MCP JSON-RPC handling is not wired yet.',
    received: req.body ?? null
  });
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'not_found',
    path: req.path
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Rowan MCP Server listening on ${PUBLIC_BASE_URL}`);
});
