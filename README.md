# PulseDesk ⚡

> **A fast, lightweight, cross-platform API Client & Developer Network Workbench**  
> Built for **Desktop (Windows, macOS, Linux)** via Electron and **Web / Mobile** via responsive PWA.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## ✨ Overview

PulseDesk is an agile, zero-bloat alternative to Postman and Insomnia that bridges desktop-native performance with the universal reach of the web. It solves common developer friction points:
- **Zero Browser CORS Restrictions on Desktop**: Electron IPC bridge dispatches requests natively via Node.js fetch, allowing requests to any third-party API without proxy workarounds.
- **Universal Responsive UI**: Multi-pane split layout for desktop displays with seamless fallback to touch-friendly slide-over drawers on mobile screens.
- **cURL In & Out**: Paste any raw cURL snippet to auto-populate request headers, method, and parameters, or export requests back to cURL in one click.
- **Built-in Offline DevTools**: Real-time JWT token decoder with live expiration status, JSON formatter & minifier, Base64/URL converter, UUID v4 generator, and network ping probe.
- **Workspaces & Environments**: Dynamic variable substitution (`{{baseUrl}}`, `{{apiKey}}`) with local-first persistence.

---

## 🚀 Quickstart

```bash
# Clone the repository
git clone https://github.com/your-username/pulsedesk.git
cd pulsedesk

# Install dependencies
npm install

# Run in Web/PWA Mode
npm run dev

# Run in Native Desktop Mode (Electron)
npm run electron:dev
