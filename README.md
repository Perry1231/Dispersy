# Dispersy

**Dispersy** is an AI-powered desktop development environment built around a multi-agent architecture.

The project is designed as a foundation for an AI development workspace where multiple models and specialized agents can work together on development tasks.

> Status: **Early Development / Preview — v0.1.0**

## Overview

Dispersy aims to provide a unified environment for working with AI models and development agents.

Instead of interacting with a single AI model, the long-term goal is to allow a task to be distributed across multiple models or specialized agents, with their relationships and execution flow represented inside the application.

The current version focuses on the desktop application shell, task management, model selection and graph-based visualization.

## Current Features

### Desktop Application

Dispersy is built as an Electron desktop application with:

* Native desktop window
* Custom dark interface
* Windows application identity
* Custom application icon
* Secure renderer configuration
* Fast startup
* Hidden native menu bar
* Minimum window dimensions

### Task Management

The current interface provides a lightweight task management system.

Tasks can be:

* Created
* Selected
* Renamed
* Deleted
* Archived
* Restored
* Pinned
* Sorted by creation time
* Sorted by usage
* Opened in the graph view

Each task stores information such as:

```text
Task
├── ID
├── Name
├── Models
├── Creation time
├── Usage count
├── Pinned state
├── Archive state
└── Graph positions
```

### Model Management

The application currently contains a model selection interface.

The prototype includes:

```text
Model A
Model B
Model C
```

Models can be connected to a task through the model picker.

The architecture is intentionally designed so that real AI models and agents can be integrated later.

### Agent / Model Graph

Dispersy includes an interactive SVG-based graph for visualizing connected models.

The graph currently supports:

* Multiple model nodes
* Connections between nodes
* Automatic circular layout
* Dragging nodes
* Dynamic connections
* Neighbor displacement
* Elastic graph behavior
* Persistent node positions during the session

The graph is intended to become the foundation for visualizing multi-agent workflows.

## Architecture

The current application follows a simple Electron architecture:

```text
Dispersy
│
├── Electron Main Process
│   └── main.js
│
├── Preload Layer
│   └── preload.js
│
└── Renderer
    ├── index.html
    ├── styles.css
    └── renderer.js
```

### Main Process

`main.js` is responsible for:

* Creating the Electron window
* Managing application lifecycle
* Loading the renderer
* Configuring the Windows application ID
* Configuring security-related WebPreferences
* Handling macOS activation behavior
* Preventing the initial white flash before the UI is ready

### Preload

`preload.js` provides a controlled bridge between Electron and the renderer.

The application uses:

```javascript
contextIsolation: true
nodeIntegration: false
sandbox: true
```

This keeps the renderer separated from direct Node.js access.

### Renderer

The renderer contains the application interface and client-side logic.

Main responsibilities include:

* Navigation
* Task management
* Model selection
* Graph rendering
* Node interaction
* Task sorting
* Archive management
* UI state

## Project Structure

```text
Dispersy/
│
├── build/
│   ├── icon.ico
│   └── icon.png
│
├── renderer/
│   ├── index.html
│   ├── renderer.js
│   └── styles.css
│
├── scripts/
│   └── make-icon.mjs
│
├── .gitignore
├── .test-server.js
├── Dispersy.lnk
├── LICENSE
├── main.js
├── package.json
├── package-lock.json
└── preload.js
```

## Technology Stack

| Technology       | Purpose                       |
| ---------------- | ----------------------------- |
| Electron         | Desktop application framework |
| JavaScript       | Application logic             |
| HTML             | User interface structure      |
| CSS              | Interface styling             |
| SVG              | Interactive model graph       |
| Node.js          | Runtime and build tooling     |
| electron-builder | Windows application packaging |

## Requirements

* Node.js 18+
* npm
* Windows for the current Windows distribution target

## Installation

Clone the repository:

```bash
git clone https://github.com/Perry1231/Dispersy.git
cd Dispersy
```

Install dependencies:

```bash
npm install
```

## Development

Start the Electron application:

```bash
npm start
```

The application will launch in development mode.

## Build

The project uses `electron-builder` for Windows packaging.

Build the application with:

```bash
npm run dist
```

The current configuration targets:

```text
Windows
└── x64
```

The Electron application uses the following application ID:

```text
app.dispersy.desktop
```

## Development Utilities

### Generate Icon

The repository contains a script for generating the application icon:

```bash
npm run icon
```

### Renderer Test Server

A small static server is included for manually testing the renderer:

```bash
node .test-server.js
```

It serves the `renderer` directory locally on:

```text
127.0.0.1:8123
```

## Roadmap

Dispersy is currently in an early prototype stage.

Planned development includes:

### AI Models

* Real model provider integration
* Local model support
* Cloud model support
* Model configuration
* API key management
* Model-specific parameters

### Multi-Agent System

* Specialized development agents
* Agent orchestration
* Agent-to-agent communication
* Task decomposition
* Parallel agent execution
* Agent result aggregation
* Agent roles and permissions

### Development Environment

* Project/workspace management
* File system integration
* Code generation
* Code editing
* Terminal integration
* Git integration
* Build and test automation

### Graph System

* Real agent execution graphs
* Dependency relationships
* Execution status
* Agent outputs
* Error states
* Live graph updates
* Interactive workflow editing

### Persistence

Future versions are expected to introduce persistent storage for:

* Tasks
* Projects
* Model configurations
* Agent configurations
* Graphs
* Application settings

## Design Philosophy

Dispersy is being developed around several principles:

### Multi-Agent First

The system is designed around collaboration between multiple AI models and specialized agents rather than relying exclusively on a single model.

### Visual Workflows

Complex AI workflows should be understandable through a visual representation of agents, models and their relationships.

### Local Desktop Environment

Dispersy is designed as a desktop application rather than only a browser-based interface, allowing deeper integration with local development environments.

### Modular Architecture

The application is structured so that AI providers, agents and development tools can be added without rebuilding the entire interface.

## Security

The Electron renderer currently uses:

```javascript
contextIsolation: true
nodeIntegration: false
sandbox: true
```

The Content Security Policy also restricts scripts, styles and resources to the application itself.

As AI providers, external APIs and development tools are introduced, additional security considerations will be required.

## Current Limitations

This release is a prototype.

At the moment:

* AI models are represented by placeholder models
* Agent execution is not implemented
* Tasks are not persisted between application sessions
* Search functionality is not implemented yet
* Model configuration is a placeholder
* The graph represents model relationships rather than real execution
* Project/file management is not implemented yet
* Authentication and API key management are not implemented

## Contributing

Contributions, ideas and experiments are welcome.

A typical development workflow is:

```bash
git clone https://github.com/Perry1231/Dispersy.git
cd Dispersy
npm install
npm start
```

For larger changes, consider opening an issue first to discuss the proposed architecture or feature.

## License

Dispersy is distributed under the license included in this repository.

See [`LICENSE`](LICENSE) for the complete license text.

## Project

**Dispersy**

AI-powered development environment based on multi-agent architecture.

Repository:

https://github.com/Perry1231/Dispersy

Version:

```text
0.1.0
```

Status:

```text
Early Development / Preview
```
