# Dispersy

An AI-powered development environment, built around a multi-agent architecture.

## Status

Early development (`0.1.0` — Preview). Currently: desktop shell with a dark-themed
home screen, optimized for fast startup.

## Requirements

- [Node.js](https://nodejs.org/) 18+

## Run

```bash
npm install
npm start
```

## Project layout

```
main.js               — Electron main process (window, lifecycle, IPC)
preload.js            — secure bridge between UI and main process
renderer/
  index.html          — home screen markup
  styles.css          — dark theme (single palette in :root)
  renderer.js         — UI logic
```
