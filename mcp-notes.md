# MCP notes

This branch adds an MCP server scaffold without changing existing files.

Added files:
- mcp-package.json
- mcp-server.js

Local use:
1. Copy `mcp-package.json` over `package.json`
2. Run `npm install`
3. Start with `HOST=0.0.0.0 PORT=8080 npm run start:mcp`

Checks:
- `curl -i http://127.0.0.1:8080/`
- `curl -i http://127.0.0.1:8080/health`

MCP path:
- `/mcp`
