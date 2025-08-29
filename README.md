# 🤖 AI Search API n8n Node

**Custom [n8n](https://n8n.io) node** to integrate the [AI Search API](https://aisearchapi.io) into your automation workflows.  
Bring **semantic search**, **context awareness**, and **balance monitoring** directly into your n8n pipelines.

[![npm version](https://img.shields.io/npm/v/n8n-nodes-aisearchapi.svg)](https://www.npmjs.com/package/n8n-nodes-aisearchapi)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)

---

## ✨ Features

- 🔍 **Intelligent Semantic Search** – Natural language search with embeddings  
- 💬 **Context Management** – Add previous messages for richer answers  
- 📝 **Flexible Responses** – Markdown or plain text output  
- 📊 **Balance Monitoring** – Track credits and usage in real time  
- ⚡ **TypeScript Support** – Strong typings and IDE hints  
- 🧩 **n8n Ready** – Works as a drag-and-drop node inside your n8n editor  

---

## 🚀 Get Started

### 1) Sign Up & Get Your API Key
- [🆕 Create Account](https://aisearchapi.io/join)  
- [🔑 Log In](https://aisearchapi.io/login)  
- [📊 Dashboard](https://aisearchapi.io/dashboard) – manage your API key  

### 2) Install the Package

From npm (recommended):

```bash
npm install n8n-nodes-aisearchapi
```

From source:

```bash
git clone https://github.com/aisearchapi/aisearchapi-n8n.git
cd aisearchapi-n8n
npm install
npm run build
```

### 3) Run n8n with Your Extension

**Windows PowerShell (edit the path to your local folder):**
```powershell
docker run -it --rm -p 5678:5678 `
  -e N8N_CUSTOM_EXTENSIONS=/extensions `
  -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true `
  -e DB_SQLITE_POOL_SIZE=5 `
  -e N8N_RUNNERS_ENABLED=true `
  -v "C:\n8n-extensions\aisearchapi-n8n:/extensions" `
  -v n8n_data:/home/node/.n8n `
  n8nio/n8n:latest
```

**macOS / Linux / WSL (edit the path to your local folder):**
```bash
docker run -it --rm -p 5678:5678 \
  -e N8N_CUSTOM_EXTENSIONS=/extensions \
  -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
  -e DB_SQLITE_POOL_SIZE=5 \
  -e N8N_RUNNERS_ENABLED=true \
  -v "$HOME/n8n-extensions/aisearchapi-n8n:/extensions" \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n:latest
```

Then open: **http://localhost:5678**

You should see a log line like: `Loaded extensions from /extensions`.

---

## 🔧 Configuration in n8n

1. Go to **Credentials → New → AI Search API**  
2. Paste your **API Key** (without the `Bearer` prefix)  
3. Save

---

## 📖 Usage

### Search
- Resource: **Search**  
- Operation: **Search**  
- Parameters:  
  - `query` → your question (required)  
  - `responseType` → `markdown | text`  
  - `context` → optional array of messages  
  - `timeout` → ms (default `30000`)  

### Balance
- Resource: **Account**  
- Operation: **Get Balance**  

---

## ⚠️ Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| 401  | Unauthorized | Invalid key → [Get key](https://aisearchapi.io/join) |
| 429  | Too Many Requests | Slow down / add retry logic |
| 433  | Quota Exceeded | Buy credits / upgrade |
| 500  | Server Error | Try again later |
| 503  | Service Unavailable | Temporary downtime |

---

## 🔧 Development

```bash
git clone https://github.com/aisearchapi/aisearchapi-n8n.git
cd aisearchapi-n8n
npm install
npm run build
```

You should see:
```
dist/credentials/AiSearchApi.credentials.js
dist/nodes/AiSearchApi/AiSearchApi.node.js
```

**Package hints** (important parts of `package.json`):  
```json
{
  "name": "n8n-nodes-aisearchapi",
  "version": "0.1.0",
  "main": "dist/index.js",
  "files": ["dist", "README.md", "LICENSE"],
  "keywords": ["n8n", "n8n-community-node-package", "AI Search API", "semantic search", "automation"],
  "n8n": {
    "nodes": ["dist/nodes/AiSearchApi/AiSearchApi.node.js"],
    "credentials": ["dist/credentials/AiSearchApi.credentials.js"]
  },
  "scripts": {
    "build": "rimraf dist && tsc -p tsconfig.json && npm run copy:assets",
    "copy:assets": "shx mkdir -p dist/nodes/AiSearchApi dist/credentials && shx cp nodes/AiSearchApi/aisearchapi.svg dist/nodes/AiSearchApi/ && shx cp credentials/aisearchapi.svg dist/credentials/"
  },
  "dependencies": {
    "n8n-workflow": "1.108.2"
  },
  "devDependencies": {
    "rimraf": "^5.0.0",
    "shx": "^0.3.4",
    "typescript": "^5.0.0"
  }
}
```

**TypeScript config** (CommonJS build to avoid ESM issues):  
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true
  },
  "include": ["credentials/**/*", "nodes/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

**Logos / Icons**
- Put your SVGs in:
  - `nodes/AiSearchApi/aisearchapi.svg`
  - `credentials/aisearchapi.svg`
- The build script above copies them next to compiled files in `dist/...`.

---

## 🛡️ Best Practices

- Keep your API key secret → store it in n8n **Credentials**  
- Use **Markdown** output for rich UI when possible  
- Reset **context** when you change topics  
- Watch your **credits** via the balance endpoint  

---

## 🧰 Troubleshooting

- **Node not visible in n8n**  
  - Check `dist/...` files exist after build  
  - Check `package.json` has the `"n8n"` block (paths into `dist`)  
  - Restart the Docker container after changes  
  - Verify the mounted path with `docker exec -it <ID> sh -c "ls -R /extensions"`  

- **Cannot find package 'n8n-workflow'**  
  - Install it in this package: `npm i n8n-workflow@1.108.2`  
  - Build as **CommonJS** (see `tsconfig.json`)  
  - Keep `node_modules` when you mount your folder into the container  

- **Windows copy errors (cp not found)**  
  - Use `shx` (already in the scripts above) or PowerShell `Copy-Item`

---

## 📚 Resources

- [🌐 AI Search API Homepage](https://aisearchapi.io)  
- [🆕 Sign Up](https://aisearchapi.io/join)  
- [🔑 Log In](https://aisearchapi.io/login)  
- [📊 Dashboard](https://aisearchapi.io/dashboard)  
- [📘 Documentation](https://docs.aisearchapi.io)  
- [🐙 GitHub Issues](https://github.com/aisearchapi/aisearchapi-n8n/issues)  
- [📦 npm Package](https://www.npmjs.com/package/n8n-nodes-aisearchapi)

---

## 🎉 Start Now

```bash
npm install n8n-nodes-aisearchapi
```

Connect your API key in n8n and build **AI-powered workflows** in minutes.

---

## 🔍 SEO Keywords

AI Search API n8n node, semantic search automation, context-aware AI n8n, AI Search API workflow automation, AI Search API key integration, n8n extension AI Search API, AI search node for n8n, n8n semantic search plugin
