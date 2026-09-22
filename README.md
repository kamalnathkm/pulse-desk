# PulseDesk ⚡

> **A fast, lightweight, cross-platform API Client & Developer Network Workbench**  
> Built for **Desktop (Windows, macOS, Linux)** via Electron and **Web / Mobile** via responsive PWA.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![PulseDesk Banner](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Overview

PulseDesk is an agile, zero-bloat alternative to Postman and Insomnia that bridges desktop-native performance with the universal reach of the web. It solves common developer friction points:
- **Zero Browser CORS Restrictions on Desktop**: Electron IPC bridge dispatches requests natively via Node.js fetch, allowing requests to any third-party API without proxy workarounds.
- **Universal Responsive UI**: Multi-pane split layout for desktop displays with seamless fallback to touch-friendly slide-over drawers on mobile screens.
- **cURL In & Out**: Paste any raw cURL snippet to auto-populate request headers, method, and parameters, or export requests back to cURL in one click.
- **Built-in Offline DevTools**: Real-time JWT token decoder with live expiration status, JSON formatter & minifier, Base64/URL converter, UUID v4 generator, and network ping probe.
- **Workspaces & Environments**: Dynamic variable substitution (`{{baseUrl}}`, `{{apiKey}}`) with local-first persistence.

---

## 🚀 Key Features

- **Cross-Platform Architecture**:
  - **Native Desktop App (Electron)**: Direct Node.js HTTP bridge that completely bypasses browser CORS restrictions with native OS windowing.
  - **Modern Web / PWA**: Runs in any modern desktop or mobile browser with responsive drawer navigation and local storage.
- **Full-Featured API Workbench**:
  - HTTP Methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
  - Dynamic Query Parameters & Header tables with active/inactive toggles.
  - Body payload options: JSON (with instant formatting), Raw Text, or None.
  - Response inspector: Status code pill, roundtrip latency (ms), payload size (KB/Bytes), formatted JSON, and response headers table.
  - Keyboard shortcut: <kbd>Ctrl+Enter</kbd> (or <kbd>Cmd+Enter</kbd>) to dispatch requests instantly.
- **cURL Integration**:
  - Paste any raw cURL command to import it directly into the request editor.
  - One-click copy export to clean, multi-line cURL.
- **Workspaces & History**:
  - Organize requests into collections and folders.
  - Automated history recording of executed requests with status codes and execution times.
  - Environment variable manager: Reference `{{baseUrl}}`, `{{apiKey}}`, etc., with live substitution.
- **Integrated DevTools Hub**:
  - **JWT Decoder**: Decodes headers, payloads, algorithms, and calculates real-time token expiry status.
  - **JSON Prettifier & Minifier**: Instant syntax validation and formatting.
  - **Base64 / URL Encoder & Decoder**: Bidirectional conversions.
  - **UUID v4 Generator**: Single or bulk random UUID creation.
  - **Network Latency Probe**: Visual roundtrip ping tool.

---

## 🛠️ Quickstart

### 1. Clone & Install
```bash
git clone https://github.com/kamalnathkm/pulse-desk.git
cd pulse-desk
npm install
```

### 2. Run in Web / Browser Mode
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Run in Native Desktop Mode (Electron)
```bash
npm run electron:dev
```
Starts the Vite dev server and launches the Electron desktop window.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized production bundle inside `dist/`.

### 5. Run Automated Tests
```bash
npm test
```

---

## 📂 Project Structure

```
pulsedesk/
├── .github/
│   └── workflows/
│       └── ci.yml       # Automated GitHub Actions test & build pipeline
├── electron/
│   ├── main.cjs         # Electron main process & CORS-free HTTP bridge
│   └── preload.cjs      # Secure IPC context bridge (window.api)
├── src/
│   ├── components/
│   │   ├── DevTools/    # JWT, JSON, Base64, UUID, Latency tools
│   │   ├── CurlModal.tsx
│   │   ├── EnvironmentModal.tsx
│   │   ├── Header.tsx
│   │   ├── RequestEditor.tsx
│   │   ├── ResponseViewer.tsx
│   │   └── Sidebar.tsx
│   ├── services/
│   │   ├── curlParser.ts   # cURL serialization & parsing
│   │   ├── environment.ts  # {{var}} template replacement
│   │   ├── httpClient.ts   # Dual-mode HTTP dispatcher
│   │   └── storage.ts      # Local persistence & seed data
│   ├── types/
│   │   └── index.ts        # Data schemas & IPC typings
│   ├── App.tsx             # Root application orchestrator
│   ├── index.css           # Tailwind styles & theme variables
│   └── main.tsx            # React DOM mounting
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── test-smoke.js
├── LICENSE
└── README.md
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
