# rowan-mcp-server

Minimal HTTP-accessible scaffold for hosting on Lightning.ai.

## Files

- `package.json` — dependency manifest and start scripts
- `server.js` — HTTP server scaffold
- `.env.example` — environment template

## Install

```bash
npm install
```

## Run

```bash
HOST=0.0.0.0 PORT=8080 npm start
```

## Verify locally on the Lightning instance

```bash
curl -i http://127.0.0.1:8080/
curl -i http://127.0.0.1:8080/health
curl -i http://127.0.0.1:8080/mcp
```

## Expected behavior

- `/` returns service metadata
- `/health` returns a basic health response
- `/mcp` is only a placeholder route right now

## Next implementation step

Wire actual MCP transport and register tools/resources/prompts for remote clients.
