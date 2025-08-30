# Patterns Extracted from open-lovable

## 1. AI Code Generation System

### Multi-Provider LLM Support

```typescript
// Provider initialization pattern
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';

const providers = {
  anthropic: createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
  }),
  
  openai: createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
  
  google: createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  }),
  
  groq: createGroq({
    apiKey: process.env.GROQ_API_KEY,
  }),
};

// Model configuration
const modelConfig = {
  'anthropic/claude-3-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 8000,
    temperature: 0.7,
  },
  'openai/gpt-4': {
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    maxTokens: 8000,
    temperature: 0.7,
  },
  'google/gemini-pro': {
    provider: 'google',
    model: 'gemini-pro',
    maxTokens: 8000,
    temperature: 0.7,
  },
};
```

### Context-Aware File Selection

```typescript
// From lib/context-selector.ts
export function selectFilesForEdit(
  files: FileManifest,
  editIntent: string,
  maxFiles: number = 5
): string[] {
  const relevantFiles: Array<{ path: string; score: number }> = [];
  
  // Parse the edit intent
  const keywords = extractKeywords(editIntent);
  const componentName = extractComponentName(editIntent);
  const fileTypes = determineFileTypes(editIntent);
  
  // Score each file
  for (const [path, content] of Object.entries(files)) {
    let score = 0;
    
    // Check for component name match
    if (componentName && path.includes(componentName)) {
      score += 50;
    }
    
    // Check for keyword matches in content
    keywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        score += 10;
      }
    });
    
    // Check for file type match
    const fileExt = path.split('.').pop();
    if (fileTypes.includes(fileExt)) {
      score += 20;
    }
    
    // Check for import/export relationships
    if (hasRelevantImports(content, keywords)) {
      score += 15;
    }
    
    relevantFiles.push({ path, score });
  }
  
  // Sort by score and return top files
  return relevantFiles
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFiles)
    .map(f => f.path);
}

function extractKeywords(intent: string): string[] {
  // Remove common words and extract meaningful terms
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but']);
  const words = intent
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  // Add technical terms based on patterns
  if (intent.includes('button') || intent.includes('click')) {
    words.push('onClick', 'Button', 'handleClick');
  }
  
  if (intent.includes('form') || intent.includes('input')) {
    words.push('onChange', 'onSubmit', 'value', 'Form');
  }
  
  return [...new Set(words)];
}
```

### Edit Intent Analysis

```typescript
// From lib/edit-intent-analyzer.ts
interface EditIntent {
  action: 'create' | 'update' | 'delete' | 'fix' | 'refactor';
  targetType: 'component' | 'function' | 'style' | 'config';
  confidence: number;
  suggestedFiles: string[];
  context: string;
}

export function analyzeEditIntent(
  prompt: string,
  currentFiles: FileManifest
): EditIntent {
  // Determine action type
  const action = determineAction(prompt);
  
  // Identify target type
  const targetType = identifyTargetType(prompt, currentFiles);
  
  // Calculate confidence
  const confidence = calculateConfidence(prompt, action, targetType);
  
  // Suggest files to edit
  const suggestedFiles = suggestFilesToEdit(
    prompt,
    currentFiles,
    action,
    targetType
  );
  
  // Build context
  const context = buildEditContext(
    action,
    targetType,
    suggestedFiles,
    currentFiles
  );
  
  return {
    action,
    targetType,
    confidence,
    suggestedFiles,
    context,
  };
}

function determineAction(prompt: string): EditIntent['action'] {
  const patterns = {
    create: /create|add|new|implement|build/i,
    update: /update|change|modify|edit|improve/i,
    delete: /delete|remove|eliminate|clean/i,
    fix: /fix|repair|debug|solve|correct/i,
    refactor: /refactor|reorganize|restructure|optimize/i,
  };
  
  for (const [action, pattern] of Object.entries(patterns)) {
    if (pattern.test(prompt)) {
      return action as EditIntent['action'];
    }
  }
  
  return 'update'; // default
}
```

### Streaming Code Generation

```typescript
// Enhanced streaming with file detection
export async function* generateCodeStream(
  prompt: string,
  context: GenerationContext
): AsyncGenerator<CodeChunk> {
  const enhancedPrompt = buildEnhancedPrompt(prompt, context);
  
  // Start streaming from LLM
  const stream = await streamText({
    model: getModel(context.model),
    prompt: enhancedPrompt,
    temperature: context.temperature || 0.7,
    maxTokens: context.maxTokens || 8000,
  });
  
  let buffer = '';
  let currentFile: string | null = null;
  let fileContent = '';
  
  for await (const chunk of stream) {
    buffer += chunk;
    
    // Detect file boundaries
    const fileMatch = buffer.match(/```(\w+)?\s*(?:\/\/ )?([\w\/.]+)\n/);
    
    if (fileMatch) {
      // If we were building a file, yield it
      if (currentFile && fileContent) {
        yield {
          type: 'file',
          path: currentFile,
          content: fileContent,
          language: detectLanguage(currentFile),
        };
      }
      
      // Start new file
      currentFile = fileMatch[2];
      fileContent = '';
      buffer = buffer.substring(fileMatch.index! + fileMatch[0].length);
    }
    
    // Check for end of file
    if (buffer.includes('```') && currentFile) {
      const endIndex = buffer.indexOf('```');
      fileContent += buffer.substring(0, endIndex);
      
      yield {
        type: 'file',
        path: currentFile,
        content: fileContent,
        language: detectLanguage(currentFile),
      };
      
      currentFile = null;
      fileContent = '';
      buffer = buffer.substring(endIndex + 3);
    } else if (currentFile) {
      // Continue building current file
      fileContent += buffer;
      buffer = '';
    } else {
      // Regular text chunk
      yield {
        type: 'text',
        content: buffer,
      };
      buffer = '';
    }
  }
  
  // Yield any remaining content
  if (currentFile && fileContent) {
    yield {
      type: 'file',
      path: currentFile,
      content: fileContent,
      language: detectLanguage(currentFile),
    };
  }
  
  if (buffer) {
    yield {
      type: 'text',
      content: buffer,
    };
  }
}
```

## 2. Code Application System

### Progressive Code Updates

```typescript
// Pattern for applying generated code to existing project
interface CodeApplication {
  files: Map<string, string>;
  conflicts: ConflictResolution[];
  dependencies: string[];
}

export async function applyGeneratedCode(
  generatedFiles: GeneratedFile[],
  existingFiles: FileManifest,
  options: ApplicationOptions
): Promise<CodeApplication> {
  const application = new CodeApplication();
  
  for (const file of generatedFiles) {
    // Check if file exists
    const exists = existingFiles[file.path];
    
    if (exists) {
      // Handle update/merge
      const result = await mergeFile(
        existingFiles[file.path],
        file.content,
        options.mergeStrategy
      );
      
      if (result.hasConflicts) {
        application.conflicts.push({
          path: file.path,
          conflicts: result.conflicts,
          resolution: options.conflictResolution,
        });
      }
      
      application.files.set(file.path, result.merged);
    } else {
      // New file
      application.files.set(file.path, file.content);
    }
    
    // Extract dependencies
    const deps = extractDependencies(file.content);
    application.dependencies.push(...deps);
  }
  
  return application;
}

async function mergeFile(
  existing: string,
  generated: string,
  strategy: MergeStrategy
): Promise<MergeResult> {
  switch (strategy) {
    case 'overwrite':
      return { merged: generated, hasConflicts: false };
    
    case 'merge-imports':
      return mergeWithImports(existing, generated);
    
    case 'merge-smart':
      return smartMerge(existing, generated);
    
    default:
      return { merged: generated, hasConflicts: false };
  }
}

function mergeWithImports(existing: string, generated: string): MergeResult {
  // Extract imports from both files
  const existingImports = extractImports(existing);
  const generatedImports = extractImports(generated);
  
  // Merge imports
  const mergedImports = mergeImportSets(existingImports, generatedImports);
  
  // Extract body content
  const existingBody = removeImports(existing);
  const generatedBody = removeImports(generated);
  
  // Combine
  const merged = `${mergedImports.join('\n')}\n\n${generatedBody}`;
  
  return {
    merged,
    hasConflicts: false,
  };
}
```

### Package Detection and Installation

```typescript
// Automatic package detection from code
export function detectRequiredPackages(code: string): string[] {
  const packages = new Set<string>();
  
  // Regex patterns for different import styles
  const patterns = [
    /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const packageName = match[1];
      
      // Filter out relative imports and built-ins
      if (!packageName.startsWith('.') && 
          !packageName.startsWith('/') &&
          !isBuiltinModule(packageName)) {
        // Extract package name from deep imports
        const basePackage = extractBasePackage(packageName);
        packages.add(basePackage);
      }
    }
  }
  
  return Array.from(packages);
}

function extractBasePackage(importPath: string): string {
  // Handle scoped packages
  if (importPath.startsWith('@')) {
    const parts = importPath.split('/');
    return parts.slice(0, 2).join('/');
  }
  
  // Regular packages
  return importPath.split('/')[0];
}

async function installMissingPackages(
  detectedPackages: string[],
  installedPackages: Set<string>
): Promise<void> {
  const missing = detectedPackages.filter(pkg => !installedPackages.has(pkg));
  
  if (missing.length === 0) return;
  
  console.log(`Installing missing packages: ${missing.join(', ')}`);
  
  // Install with appropriate package manager
  const packageManager = detectPackageManager();
  const command = buildInstallCommand(packageManager, missing);
  
  await executeCommand(command);
}
```

## 3. Sandbox and Preview System

### E2B Sandbox Integration

```typescript
// From api/create-ai-sandbox/route.ts
import { Sandbox } from '@e2b/code-interpreter';

export async function createDevelopmentSandbox(): Promise<SandboxInfo> {
  // Create E2B sandbox
  const sandbox = await Sandbox.create({
    apiKey: process.env.E2B_API_KEY,
    timeoutMs: 15 * 60 * 1000, // 15 minutes
  });
  
  const sandboxId = sandbox.sandboxId;
  const host = sandbox.getHost(5173); // Vite default port
  
  // Set up Vite React app
  await setupViteApp(sandbox);
  
  // Start development server
  await startDevServer(sandbox);
  
  return {
    sandboxId,
    url: `https://${host}`,
    status: 'ready',
  };
}

async function setupViteApp(sandbox: Sandbox) {
  const setupScript = `
    # Create React app structure
    mkdir -p /home/user/app/src
    cd /home/user/app
    
    # Create package.json
    cat > package.json << 'EOF'
    {
      "name": "sandbox-app",
      "type": "module",
      "scripts": {
        "dev": "vite --host"
      },
      "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      "devDependencies": {
        "@vitejs/plugin-react": "^4.0.0",
        "vite": "^4.3.9"
      }
    }
    EOF
    
    # Install dependencies
    npm install
  `;
  
  await sandbox.runCode(setupScript);
}
```

### Real-time File Updates

```typescript
// Pattern for updating files in sandbox
export async function updateSandboxFiles(
  sandboxId: string,
  files: Map<string, string>
): Promise<void> {
  const sandbox = getSandbox(sandboxId);
  
  for (const [path, content] of files) {
    // Write file to sandbox
    await sandbox.filesystem.write(
      `/home/user/app/${path}`,
      content
    );
  }
  
  // Trigger HMR if dev server is running
  if (await isDevServerRunning(sandbox)) {
    // Vite will automatically pick up changes
    console.log('Files updated, HMR triggered');
  } else {
    // Restart dev server if needed
    await restartDevServer(sandbox);
  }
}
```

## 4. Error Detection and Recovery

### Vite Error Monitoring

```typescript
// Pattern for detecting and handling build errors
interface ViteError {
  type: 'syntax' | 'import' | 'runtime';
  file: string;
  line?: number;
  column?: number;
  message: string;
}

export class ViteErrorMonitor {
  private errors: ViteError[] = [];
  private ws: WebSocket | null = null;
  
  connectToVite(url: string) {
    this.ws = new WebSocket(`${url}/__vite_ws`);
    
    this.ws.on('message', (data) => {
      const message = JSON.parse(data);
      
      if (message.type === 'error') {
        this.handleError(message.err);
      }
    });
  }
  
  private handleError(error: any) {
    const viteError = this.parseViteError(error);
    this.errors.push(viteError);
    
    // Attempt automatic fix
    if (this.canAutoFix(viteError)) {
      this.attemptAutoFix(viteError);
    }
  }
  
  private canAutoFix(error: ViteError): boolean {
    // Check if error is fixable
    return error.type === 'import' && 
           error.message.includes('not found');
  }
  
  private async attemptAutoFix(error: ViteError) {
    if (error.type === 'import') {
      // Extract missing package
      const packageName = this.extractPackageName(error.message);
      
      // Install missing package
      await this.installPackage(packageName);
      
      // Clear error
      this.errors = this.errors.filter(e => e !== error);
    }
  }
}
```

### Truncation Recovery

```typescript
// Pattern for handling truncated AI responses
export async function detectAndFixTruncation(
  generatedCode: string,
  context: GenerationContext
): Promise<string> {
  // Check for truncation indicators
  const truncationPatterns = [
    /\/\/ \.\.\./,
    /\/\* incomplete \*\//,
    /\n\s*$/,  // Ends abruptly
  ];
  
  const isTruncated = truncationPatterns.some(
    pattern => pattern.test(generatedCode)
  );
  
  if (!isTruncated) {
    return generatedCode;
  }
  
  // Find truncation point
  const truncationPoint = findTruncationPoint(generatedCode);
  
  // Generate completion
  const completion = await generateCompletion(
    generatedCode.substring(truncationPoint),
    context
  );
  
  return generatedCode.substring(0, truncationPoint) + completion;
}

function findTruncationPoint(code: string): number {
  // Find last complete statement
  const lines = code.split('\n');
  let lastCompleteIndex = lines.length - 1;
  
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    
    // Check if line appears complete
    if (line.endsWith(';') || 
        line.endsWith('}') || 
        line.endsWith('>')) {
      lastCompleteIndex = i;
      break;
    }
  }
  
  return lines.slice(0, lastCompleteIndex + 1).join('\n').length;
}
```

## 5. Configuration Management

### Centralized App Configuration

```typescript
// From config/app.config.ts
export const appConfig = {
  e2b: {
    timeoutMinutes: 15,
    vitePort: 5173,
    viteStartupDelay: 7000,
    cssRebuildDelay: 2000,
  },
  
  ai: {
    defaultModel: 'anthropic/claude-3-sonnet',
    availableModels: [
      'anthropic/claude-3-sonnet',
      'openai/gpt-4',
      'google/gemini-pro',
      'groq/mixtral-8x7b',
    ],
    defaultTemperature: 0.7,
    maxTokens: 8000,
    truncationRecoveryMaxTokens: 4000,
  },
  
  codeApplication: {
    defaultRefreshDelay: 2000,
    packageInstallRefreshDelay: 5000,
    enableTruncationRecovery: true,
    maxTruncationRecoveryAttempts: 1,
  },
  
  ui: {
    showModelSelector: true,
    showStatusIndicator: true,
    animationDuration: 200,
    toastDuration: 3000,
    maxChatMessages: 100,
    maxRecentMessagesContext: 20,
  },
  
  packages: {
    useLegacyPeerDeps: true,
    installTimeout: 60000,
    autoRestartVite: true,
  },
  
  files: {
    excludePatterns: [
      'node_modules/**',
      '.git/**',
      '.next/**',
      'dist/**',
      'build/**',
    ],
    maxFileSize: 1024 * 1024, // 1MB
    textFileExtensions: [
      '.js', '.jsx', '.ts', '.tsx',
      '.css', '.scss', '.sass',
      '.html', '.xml', '.svg',
      '.json', '.yml', '.yaml',
      '.md', '.txt', '.env',
    ],
  },
};
```

## Key Takeaways

1. **Multi-Provider Support**: Abstract LLM providers for flexibility
2. **Context Awareness**: Smart file selection based on intent
3. **Streaming First**: Use streaming for better UX
4. **Error Recovery**: Automatic detection and fixing of common errors
5. **Package Management**: Auto-detect and install dependencies
6. **Sandbox Integration**: Use E2B for safe code execution
7. **Configuration Centralization**: Single source of truth for config