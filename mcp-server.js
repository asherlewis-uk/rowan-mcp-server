import { randomUUID } from 'node:crypto';

import express from 'express';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';
import { isInitializeRequest, McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

const app = express();

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 8080);
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://${HOST}:${PORT}`;

app.use(express.json({ limit: '1mb' }));

function buildServer() {
  const server = new McpServer({
    name: 'rowan-mcp-server',
    version: '0.1.0'
  });

  server.registerTool(
    'health_check',
    {
      title: 'Health Check',
      description: 'Returns the current server status.',
      inputSchema: z.object({})
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              ok: true,
              service: 'rowan-mcp-server',
              status: 'running',
              publicBaseUrl: PUBLIC_BASE_URL,
              timestamp: new Date().toISOString()
            },
            null,
            2
          )
        }
      ]
    })
  );

  server.registerPrompt(
    'rowan_status_prompt',
    {
      title: 'Rowan Status Prompt',
      description: 'Summarize the current Rowan MCP server status.',
      argsSchema: z.object({})
    },
    async () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Summarize the status of Rowan MCP Server at ${PUBLIC_BASE_URL}.`
          }
        }
      ]
    })
  );

  server.registerResource(
    'rowan-service-info',
    `${PUBLIC_BASE_URL}/resource/service-info`,
    {
      title: 'Rowan Service Info',
      description: 'Basic metadata about the Rowan MCP server.',
      mimeType: 'application/json'
    },
    async () => ({
      contents: [
        {
          uri: `${PUBLIC_BASE_URL}/resource/service-info`,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              name: 'rowan-mcp-server',
              version: '0.1.0',
              transport: 'streamable-http',
              endpoints: {
                root: '/',
                health: '/health',
                mcp: '/mcp'
              }
            },
            null,
            2
          )
        }
      ]
    })
  );

  return server;
}

const transports = {};

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'rowan-mcp-server',
    status: 'running',
    transport: 'streamable-http',
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

app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];

  try {
    let transport;

    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new NodeStreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          transports[newSessionId] = transport;
        }
      });

      transport.onclose = () => {
        if (transport.sessionId && transports[transport.sessionId]) {
          delete transports[transport.sessionId];
        }
      };

      const server = buildServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided'
        },
        id: null
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error'
        },
        id: null
      });
    }
  }
});

app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];

  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  await transports[sessionId].handleRequest(req, res);
});

app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];

  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  await transports[sessionId].handleRequest(req, res);
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
