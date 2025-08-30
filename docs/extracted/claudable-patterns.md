# Patterns Extracted from Claudable

## 1. Project Management System

### Project Lifecycle Management

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  status: 'initializing' | 'active' | 'failed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  config: ProjectConfig;
  metadata: ProjectMetadata;
}

interface ProjectConfig {
  framework: 'nextjs' | 'react' | 'vue' | 'svelte';
  language: 'typescript' | 'javascript';
  styling: 'tailwind' | 'css-modules' | 'styled-components';
  features: string[];
  environment: Record<string, string>;
}

class ProjectManager {
  async createProject(input: CreateProjectInput): Promise<Project> {
    // 1. Validate input
    const validated = ProjectSchema.parse(input);
    
    // 2. Create project directory
    const projectPath = await this.createProjectDirectory(validated.name);
    
    // 3. Initialize git repository
    await this.initializeGit(projectPath);
    
    // 4. Set up base structure
    await this.scaffoldProject(projectPath, validated.config);
    
    // 5. Store in database
    const project = await this.saveProject({
      ...validated,
      path: projectPath,
      status: 'active',
    });
    
    return project;
  }
  
  async loadProject(id: string): Promise<Project> {
    const project = await this.db.findProject(id);
    
    // Verify project still exists on disk
    if (!await this.fileSystem.exists(project.path)) {
      throw new Error('Project directory not found');
    }
    
    return project;
  }
}
```

## 2. Port Detection and Allocation

### Intelligent Port Management

```javascript
const net = require('net');

class PortManager {
  constructor() {
    this.allocatedPorts = new Set();
    this.defaultPorts = {
      web: 3000,
      api: 8080,
      preview: 3100,
    };
  }

  async findAvailablePort(startPort) {
    let port = startPort;
    
    while (!(await this.isPortAvailable(port)) || this.allocatedPorts.has(port)) {
      port++;
      if (port > 65535) {
        throw new Error('No available ports');
      }
    }
    
    this.allocatedPorts.add(port);
    return port;
  }

  isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(true);
        }
      });
      
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      
      server.listen(port, '127.0.0.1');
    });
  }

  async allocatePorts(services) {
    const ports = {};
    
    for (const [service, defaultPort] of Object.entries(services)) {
      ports[service] = await this.findAvailablePort(
        this.defaultPorts[service] || defaultPort
      );
    }
    
    return ports;
  }

  release(port) {
    this.allocatedPorts.delete(port);
  }
}

// Usage
const portManager = new PortManager();
const ports = await portManager.allocatePorts({
  web: 3000,
  api: 8080,
  preview: 3100,
});
```

## 3. Environment Setup Automation

### Dynamic Environment Configuration

```javascript
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

class EnvironmentManager {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.envFile = path.join(rootDir, '.env');
    this.envLocalFile = path.join(rootDir, '.env.local');
  }

  async setup() {
    // 1. Check for existing env files
    const hasEnv = await this.checkExistingEnv();
    
    if (!hasEnv) {
      // 2. Copy from example
      await this.copyFromExample();
    }
    
    // 3. Detect and set ports
    const ports = await this.detectAvailablePorts();
    await this.updatePorts(ports);
    
    // 4. Validate required variables
    await this.validateEnvironment();
    
    // 5. Generate derived variables
    await this.generateDerivedVariables(ports);
    
    return this.loadEnvironment();
  }

  async detectAvailablePorts() {
    const portManager = new PortManager();
    return await portManager.allocatePorts({
      API_PORT: 8080,
      WEB_PORT: 3000,
      PREVIEW_PORT_START: 3100,
    });
  }

  async updatePorts(ports) {
    let envContent = await fs.promises.readFile(this.envFile, 'utf8');
    
    for (const [key, value] of Object.entries(ports)) {
      const regex = new RegExp(`^${key}=.*$`, 'gm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }
    
    await fs.promises.writeFile(this.envFile, envContent);
  }

  async generateDerivedVariables(ports) {
    const derived = {
      NEXT_PUBLIC_API_BASE: `http://localhost:${ports.API_PORT}`,
      NEXT_PUBLIC_WS_BASE: `ws://localhost:${ports.API_PORT}`,
      PUBLIC_URL: `http://localhost:${ports.WEB_PORT}`,
    };
    
    await this.updateEnvironment(derived);
  }

  loadEnvironment() {
    // Load in priority order
    dotenv.config({ path: this.envLocalFile });
    dotenv.config({ path: this.envFile });
    
    return process.env;
  }
}
```

## 4. Monorepo Structure

### Workspace Management

```json
// Root package.json
{
  "name": "biokit-builder",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build"
  }
}
```

### Coordinated Development Servers

```javascript
const { spawn } = require('child_process');
const chalk = require('chalk');

class DevServerManager {
  constructor() {
    this.processes = new Map();
  }

  async startAll() {
    // Start API server
    await this.startServer('api', {
      command: 'python',
      args: ['-m', 'uvicorn', 'app.main:app', '--reload'],
      cwd: './apps/api',
      port: 8080,
      readyMessage: 'Uvicorn running on',
    });
    
    // Start web server
    await this.startServer('web', {
      command: 'npm',
      args: ['run', 'dev'],
      cwd: './apps/web',
      port: 3000,
      readyMessage: 'ready on',
    });
    
    console.log(chalk.green('✓ All servers started successfully'));
  }

  startServer(name, config) {
    return new Promise((resolve, reject) => {
      const process = spawn(config.command, config.args, {
        cwd: config.cwd,
        env: { ...process.env, PORT: config.port },
      });
      
      this.processes.set(name, process);
      
      process.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(chalk.blue(`[${name}]`), output);
        
        if (output.includes(config.readyMessage)) {
          resolve();
        }
      });
      
      process.stderr.on('data', (data) => {
        console.error(chalk.red(`[${name}]`), data.toString());
      });
      
      process.on('error', reject);
    });
  }

  async stopAll() {
    for (const [name, process] of this.processes) {
      console.log(chalk.yellow(`Stopping ${name}...`));
      process.kill('SIGTERM');
    }
    this.processes.clear();
  }
}
```

## 5. Deployment Automation

### Vercel Deployment

```typescript
interface DeploymentConfig {
  projectName: string;
  framework: 'nextjs';
  buildCommand?: string;
  outputDirectory?: string;
  envVariables: Record<string, string>;
}

class VercelDeployer {
  constructor(private token: string, private teamId?: string) {}

  async deploy(projectPath: string, config: DeploymentConfig) {
    // 1. Create Vercel project
    const project = await this.createProject(config.projectName);
    
    // 2. Set environment variables
    await this.setEnvironmentVariables(project.id, config.envVariables);
    
    // 3. Link local directory
    await this.linkProject(projectPath, project.id);
    
    // 4. Deploy
    const deployment = await this.triggerDeployment(projectPath);
    
    // 5. Wait for completion
    await this.waitForDeployment(deployment.id);
    
    return {
      url: deployment.url,
      projectId: project.id,
      deploymentId: deployment.id,
    };
  }

  private async createProject(name: string) {
    const response = await fetch('https://api.vercel.com/v9/projects', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        framework: 'nextjs',
        teamId: this.teamId,
      }),
    });
    
    return response.json();
  }

  private async setEnvironmentVariables(
    projectId: string,
    variables: Record<string, string>
  ) {
    for (const [key, value] of Object.entries(variables)) {
      await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value,
          target: ['production', 'preview', 'development'],
        }),
      });
    }
  }
}
```

### GitHub Repository Creation

```typescript
class GitHubManager {
  constructor(private token: string) {}

  async createRepository(name: string, description?: string) {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `token ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        private: false,
        auto_init: false,
      }),
    });
    
    const repo = await response.json();
    return repo.clone_url;
  }

  async pushToRepository(localPath: string, remoteUrl: string) {
    const git = simpleGit(localPath);
    
    // Add remote
    await git.addRemote('origin', remoteUrl);
    
    // Create initial commit if needed
    const status = await git.status();
    if (status.files.length > 0) {
      await git.add('.');
      await git.commit('Initial commit');
    }
    
    // Push to remote
    await git.push('origin', 'main', { '--set-upstream': true });
  }
}
```

## 6. WebSocket Communication Pattern

### Real-time Updates

```typescript
// Server side
class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server });
    this.setupHandlers();
  }

  private setupHandlers() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        this.handleMessage(clientId, message);
      });
      
      ws.on('close', () => {
        this.clients.delete(clientId);
      });
    });
  }

  broadcast(event: string, data: any) {
    const message = JSON.stringify({ event, data });
    
    for (const client of this.clients.values()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  sendToClient(clientId: string, event: string, data: any) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, data }));
    }
  }
}

// Client side
class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private handlers = new Map<string, Set<Function>>();

  connect(url: string) {
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const { event: eventName, data } = JSON.parse(event.data);
      this.emit(eventName, data);
    };
    
    this.ws.onclose = () => {
      this.reconnect(url);
    };
  }

  on(event: string, handler: Function) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  emit(event: string, data: any) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  send(event: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  private reconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(url), 1000 * this.reconnectAttempts);
    }
  }
}
```

## Key Takeaways

1. **Automated Setup**: Everything should be automated - ports, environment, dependencies
2. **Robust Error Handling**: Always have fallbacks and recovery mechanisms
3. **Real-time Communication**: WebSockets for instant feedback
4. **Monorepo Benefits**: Shared dependencies, coordinated builds
5. **Deployment Integration**: Direct integration with deployment platforms
6. **Port Management**: Intelligent port allocation to avoid conflicts
7. **Environment Flexibility**: Support multiple environment configurations