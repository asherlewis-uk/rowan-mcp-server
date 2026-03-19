# Pinned MCP scaffold with cloudflared notes

This branch adds an additive pinned MCP scaffold without modifying existing tracked files.

## Added files
- `mcp-package-pinned.json`
- `mcp-server-pinned.js`
- `mcp-cloudflared-notes.md`

## Intended public address
- `https://mcp.asherlewis.uk/mcp`

## Local usage on the active server

1. Copy the pinned manifest over `package.json`
2. Install dependencies
3. Start the pinned MCP server

Example:

```bash
cp mcp-package-pinned.json package.json
npm install
HOST=0.0.0.0 PORT=8080 PUBLIC_BASE_URL=https://mcp.asherlewis.uk npm run start:mcp:pinned
```

## Verify locally

```bash
curl -i http://127.0.0.1:8080/
curl -i http://127.0.0.1:8080/health
```

## cloudflared install

### Debian/Ubuntu style systems

```bash
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt-get update
sudo apt-get install -y cloudflared
```

### Generic manual install fallback

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
cloudflared --version
```

## Tunnel setup

Authenticate:

```bash
cloudflared tunnel login
```

Create tunnel:

```bash
cloudflared tunnel create rowan-mcp
```

Route DNS for the subdomain:

```bash
cloudflared tunnel route dns rowan-mcp mcp.asherlewis.uk
```

Create config file `~/.cloudflared/config.yml`:

```yaml
tunnel: rowan-mcp
credentials-file: /home/oai/.cloudflared/<TUNNEL-UUID>.json

ingress:
  - hostname: mcp.asherlewis.uk
    service: http://127.0.0.1:8080
  - service: http_status:404
```

Run the tunnel:

```bash
cloudflared tunnel run rowan-mcp
```

## Final MCP endpoint

```text
https://mcp.asherlewis.uk/mcp
```
