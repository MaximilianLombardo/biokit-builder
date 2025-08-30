import { globby } from 'globby';
import fs from 'fs-extra';
import path from 'path';

export interface CodebaseAnalysis {
  framework: string;
  language: 'javascript' | 'typescript' | 'python' | 'other';
  hasTypescript: boolean;
  components: string[];
  pages: string[];
  apis: string[];
  styles: string[];
  tests: string[];
  entryPoint?: string;
  packageJson?: any;
}

export async function analyzeCodebase(repoPath: string): Promise<CodebaseAnalysis> {
  // Check for package.json
  const packageJsonPath = path.join(repoPath, 'package.json');
  let packageJson: any = null;
  
  if (await fs.pathExists(packageJsonPath)) {
    packageJson = await fs.readJson(packageJsonPath);
  }
  
  // Detect framework
  const framework = detectFramework(packageJson, repoPath);
  
  // Detect language
  const tsFiles = await globby('**/*.{ts,tsx}', { cwd: repoPath });
  const jsFiles = await globby('**/*.{js,jsx}', { cwd: repoPath });
  const hasTypescript = tsFiles.length > 0;
  const language = hasTypescript ? 'typescript' : 'javascript';
  
  // Find components
  const components = await findComponents(repoPath, framework);
  
  // Find pages/routes
  const pages = await findPages(repoPath, framework);
  
  // Find API routes
  const apis = await findAPIs(repoPath, framework);
  
  // Find styles
  const styles = await findStyles(repoPath);
  
  // Find tests
  const tests = await findTests(repoPath);
  
  // Find entry point
  const entryPoint = await findEntryPoint(repoPath, packageJson);
  
  return {
    framework,
    language,
    hasTypescript,
    components,
    pages,
    apis,
    styles,
    tests,
    entryPoint,
    packageJson,
  };
}

function detectFramework(packageJson: any, repoPath: string): string {
  if (!packageJson) return 'unknown';
  
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  
  // Check for Next.js
  if (deps.next) return 'nextjs';
  
  // Check for React
  if (deps.react && deps['react-scripts']) return 'create-react-app';
  if (deps.react && deps.vite) return 'vite-react';
  if (deps.react && deps.gatsby) return 'gatsby';
  if (deps.react) return 'react';
  
  // Check for Vue
  if (deps.vue || deps.nuxt) return deps.nuxt ? 'nuxt' : 'vue';
  
  // Check for Angular
  if (deps['@angular/core']) return 'angular';
  
  // Check for Svelte
  if (deps.svelte || deps['@sveltejs/kit']) return deps['@sveltejs/kit'] ? 'sveltekit' : 'svelte';
  
  // Check for Express/Node
  if (deps.express) return 'express';
  
  // Check for Python frameworks
  if (fs.pathExistsSync(path.join(repoPath, 'requirements.txt'))) {
    return 'python';
  }
  
  return 'unknown';
}

async function findComponents(repoPath: string, framework: string): Promise<string[]> {
  const patterns = [
    '**/components/**/*.{jsx,tsx,js,ts}',
    '**/src/components/**/*.{jsx,tsx,js,ts}',
    '**/app/components/**/*.{jsx,tsx,js,ts}',
  ];
  
  if (framework === 'vue' || framework === 'nuxt') {
    patterns.push('**/*.vue');
  }
  
  const files = await globby(patterns, {
    cwd: repoPath,
    ignore: ['node_modules/**', '**/*.test.*', '**/*.spec.*'],
  });
  
  return files;
}

async function findPages(repoPath: string, framework: string): Promise<string[]> {
  let patterns: string[] = [];
  
  switch (framework) {
    case 'nextjs':
      patterns = [
        'pages/**/*.{jsx,tsx,js,ts}',
        'app/**/page.{jsx,tsx,js,ts}',
        'src/pages/**/*.{jsx,tsx,js,ts}',
        'src/app/**/page.{jsx,tsx,js,ts}',
      ];
      break;
    case 'gatsby':
      patterns = ['src/pages/**/*.{jsx,tsx,js,ts}'];
      break;
    case 'nuxt':
      patterns = ['pages/**/*.vue'];
      break;
    default:
      patterns = [
        '**/pages/**/*.{jsx,tsx,js,ts}',
        '**/views/**/*.{jsx,tsx,js,ts}',
        '**/routes/**/*.{jsx,tsx,js,ts}',
      ];
  }
  
  const files = await globby(patterns, {
    cwd: repoPath,
    ignore: ['node_modules/**', '**/*.test.*', '**/*.spec.*'],
  });
  
  return files;
}

async function findAPIs(repoPath: string, framework: string): Promise<string[]> {
  let patterns: string[] = [];
  
  switch (framework) {
    case 'nextjs':
      patterns = [
        'pages/api/**/*.{js,ts}',
        'app/api/**/route.{js,ts}',
        'src/pages/api/**/*.{js,ts}',
        'src/app/api/**/route.{js,ts}',
      ];
      break;
    case 'express':
      patterns = [
        'routes/**/*.{js,ts}',
        'api/**/*.{js,ts}',
        'src/routes/**/*.{js,ts}',
        'src/api/**/*.{js,ts}',
      ];
      break;
    default:
      patterns = [
        '**/api/**/*.{js,ts}',
        '**/routes/**/*.{js,ts}',
        '**/endpoints/**/*.{js,ts}',
      ];
  }
  
  const files = await globby(patterns, {
    cwd: repoPath,
    ignore: ['node_modules/**', '**/*.test.*', '**/*.spec.*'],
  });
  
  return files;
}

async function findStyles(repoPath: string): Promise<string[]> {
  const patterns = [
    '**/*.{css,scss,sass,less}',
    '**/styles/**/*',
  ];
  
  const files = await globby(patterns, {
    cwd: repoPath,
    ignore: ['node_modules/**', 'dist/**', 'build/**'],
  });
  
  return files;
}

async function findTests(repoPath: string): Promise<string[]> {
  const patterns = [
    '**/*.{test,spec}.{js,jsx,ts,tsx}',
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/test/**/*.{js,jsx,ts,tsx}',
    '**/tests/**/*.{js,jsx,ts,tsx}',
  ];
  
  const files = await globby(patterns, {
    cwd: repoPath,
    ignore: ['node_modules/**'],
  });
  
  return files;
}

async function findEntryPoint(repoPath: string, packageJson: any): Promise<string | undefined> {
  // Check package.json main field
  if (packageJson?.main) {
    return packageJson.main;
  }
  
  // Common entry points
  const possibleEntries = [
    'index.js',
    'index.ts',
    'src/index.js',
    'src/index.ts',
    'src/main.js',
    'src/main.ts',
    'app.js',
    'app.ts',
    'server.js',
    'server.ts',
  ];
  
  for (const entry of possibleEntries) {
    if (await fs.pathExists(path.join(repoPath, entry))) {
      return entry;
    }
  }
  
  return undefined;
}