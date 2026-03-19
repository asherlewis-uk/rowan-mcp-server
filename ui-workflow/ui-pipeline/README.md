# UI Pipeline Factory

A drop-in **agentic UI/UX factory** that wires Google Stitch MCP, 21st.dev Magic MCP, Nano Banana 2, ReactBits, Chakra UI, Three.js, and Framer Motion into a single self-contained folder.

---

## Quick Start

```bash
cd ui-pipeline
npm install
npm run dev          # → http://localhost:3001
```

---

## API Keys Required

Two MCP servers need keys before agents can generate screens or components:

| Server | Where to get the key |
|--------|----------------------|
| **STITCH_API_KEY** | [stitch.google.com/dashboard](https://stitch.google.com/dashboard) → Settings → API Keys → "Create MCP Key" (starts with `stitch_...`) |
| **MAGIC_API_KEY** | [21st.dev/account/api-keys](https://21st.dev/account/api-keys) → "Create new MCP key" (starts with `magic_...`) |

### VS Code (recommended)
`.vscode/settings.json` uses `${input:...}` — VS Code will prompt you securely on first use.

### Cursor
Set environment variables before launching:
```bash
export STITCH_API_KEY=stitch_...
export MAGIC_API_KEY=magic_...
cursor .
```
`.cursor/mcp.json` reads them from the environment.

### .env (manual fallback)
```
STITCH_API_KEY=stitch_...
MAGIC_API_KEY=magic_...
```

---

## Folder Structure

```
ui-pipeline/
├── package.json              All dependencies
├── vite.config.ts            Dev server on :3001
├── index.html                HTML entry point
├── .vscode/settings.json     MCP server declarations (VS Code)
├── .cursor/mcp.json          MCP server declarations (Cursor)
├── mcp/
│   ├── servers/              Per-server capability manifests
│   │   ├── stitch-mcp.json
│   │   ├── magic-mcp.json
│   │   └── nano-banana-mcp.json
│   ├── prompts/              Agent system prompts
│   │   ├── stitch.system.md  Design extraction agent
│   │   ├── magic.system.md   Component generation agent
│   │   └── architect.system.md  App wiring agent
│   └── routing.yaml          Intent → agent chain mapping
├── design-dna/
│   ├── theme.json            Brand tokens (colors, fonts, spacing)
│   └── moodboards/           Reference images (drop PNGs here)
├── src/
│   ├── main.tsx              App entry + ChakraProvider
│   └── ui/
│       ├── sections/         Page-level components
│       │   └── HeroSection.tsx
│       └── primitives/       Reusable atoms
└── README.md
```

---

## Agent Usage

Once MCP servers are running, invoke agents by @-mentioning them in VS Code Copilot Chat or Cursor Chat:

```
@stitch  Design a hero section matching a cyberpunk mood, dark background, neon accents
@magic   Code it with Chakra layout + ReactBits ClickSpark button
@architect  Wire HeroSection into App.tsx with ChakraProvider
```

### Full pipeline (one shot)
```
@stitch @magic @architect  Build a SaaS landing page: hero, features grid, pricing table, CTA footer
```

---

## Stack

| Library | Version | Role |
|---------|---------|------|
| React | ^18.3.1 | UI runtime |
| ChakraUI | ^2.8.2 | Layout, controls, theming |
| @emotion/react | ^11.11.4 | CSS-in-JS (Chakra peer) |
| framer-motion | ^11.2.10 | Enter/exit animations |
| three | ^0.165.0 | WebGL renderer |
| @react-three/fiber | ^8.16.8 | Three.js React bindings |
| @react-three/drei | ^9.115.1 | Three.js helpers |
| matter-js | ^0.20.0 | Physics engine |
| @appletosolutions/reactbits | latest | Animation & effect components |

---

## Drop Into Any Repo

1. Copy the entire `ui-pipeline/` folder into your project root.
2. Run `cd ui-pipeline && npm install`.
3. Import sections directly:

```tsx
import { HeroSection } from '../ui-pipeline/src/ui/sections/HeroSection'
```

Or run it standalone on `:3001` alongside your main dev server.
