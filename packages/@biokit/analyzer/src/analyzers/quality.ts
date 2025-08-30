import { globby } from 'globby';
import fs from 'fs-extra';
import path from 'path';
import type { CodeQuality } from '../types';

export async function analyzeQuality(repoPath: string): Promise<CodeQuality> {
  const packageJsonPath = path.join(repoPath, 'package.json');
  let packageJson: any = {};
  
  if (await fs.pathExists(packageJsonPath)) {
    packageJson = await fs.readJson(packageJsonPath);
  }
  
  // Detect TypeScript
  const hasTypescript = await detectTypescript(repoPath);
  
  // Detect tests
  const hasTests = await detectTests(repoPath);
  
  // Detect design system
  const designSystem = await detectDesignSystem(repoPath, packageJson);
  
  // Detect framework
  const framework = detectFramework(packageJson);
  
  // Detect package manager
  const packageManager = await detectPackageManager(repoPath);
  
  // Calculate metrics if possible
  const metrics = await calculateMetrics(repoPath);
  
  return {
    hasTypescript,
    hasTests,
    designSystem,
    framework,
    packageManager,
    metrics,
  };
}

async function detectTypescript(repoPath: string): Promise<boolean> {
  // Check for tsconfig.json
  if (await fs.pathExists(path.join(repoPath, 'tsconfig.json'))) {
    return true;
  }
  
  // Check for TypeScript files
  const tsFiles = await globby('**/*.{ts,tsx}', {
    cwd: repoPath,
    ignore: ['node_modules/**'],
  });
  
  return tsFiles.length > 0;
}

async function detectTests(repoPath: string): Promise<boolean> {
  // Check for test configuration files
  const testConfigs = [
    'jest.config.js',
    'jest.config.ts',
    'vitest.config.js',
    'vitest.config.ts',
    '.mocharc.json',
    'cypress.config.js',
    'playwright.config.js',
  ];
  
  for (const config of testConfigs) {
    if (await fs.pathExists(path.join(repoPath, config))) {
      return true;
    }
  }
  
  // Check for test files
  const testFiles = await globby([
    '**/*.{test,spec}.{js,jsx,ts,tsx}',
    '**/__tests__/**',
    '**/test/**',
    '**/tests/**',
  ], {
    cwd: repoPath,
    ignore: ['node_modules/**'],
  });
  
  return testFiles.length > 0;
}

async function detectDesignSystem(
  repoPath: string, 
  packageJson: any
): Promise<CodeQuality['designSystem']> {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  
  // Check for biokit-design-system
  if (deps['biokit-design-system'] || deps['@biokit/design-system']) {
    return 'biokit';
  }
  
  // Check for Material-UI
  if (deps['@mui/material'] || deps['@material-ui/core']) {
    return 'material-ui';
  }
  
  // Check for Ant Design
  if (deps['antd']) {
    return 'ant-design';
  }
  
  // Check for Chakra UI
  if (deps['@chakra-ui/react']) {
    return 'chakra';
  }
  
  // Check for Tailwind CSS
  if (deps['tailwindcss']) {
    const configExists = await fs.pathExists(path.join(repoPath, 'tailwind.config.js')) ||
                        await fs.pathExists(path.join(repoPath, 'tailwind.config.ts'));
    if (configExists) {
      return 'tailwind';
    }
  }
  
  // Check for styled-components or emotion
  if (deps['styled-components'] || deps['@emotion/react']) {
    return 'other';
  }
  
  return 'none';
}

function detectFramework(packageJson: any): string {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  
  if (deps.next) return 'Next.js';
  if (deps.gatsby) return 'Gatsby';
  if (deps['@remix-run/react']) return 'Remix';
  if (deps.react && deps['react-scripts']) return 'Create React App';
  if (deps.react && deps.vite) return 'Vite + React';
  if (deps.react) return 'React';
  if (deps.vue) return 'Vue';
  if (deps.svelte) return 'Svelte';
  if (deps['@angular/core']) return 'Angular';
  if (deps.express) return 'Express';
  if (deps.fastify) return 'Fastify';
  if (deps.koa) return 'Koa';
  
  return 'Unknown';
}

async function detectPackageManager(repoPath: string): Promise<'npm' | 'yarn' | 'pnpm'> {
  if (await fs.pathExists(path.join(repoPath, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  
  if (await fs.pathExists(path.join(repoPath, 'yarn.lock'))) {
    return 'yarn';
  }
  
  return 'npm';
}

async function calculateMetrics(repoPath: string): Promise<CodeQuality['metrics']> {
  try {
    // Count lines of code
    const codeFiles = await globby([
      '**/*.{js,jsx,ts,tsx}',
      '**/*.{css,scss,sass}',
    ], {
      cwd: repoPath,
      ignore: ['node_modules/**', 'dist/**', 'build/**'],
    });
    
    let linesOfCode = 0;
    for (const file of codeFiles) {
      const content = await fs.readFile(path.join(repoPath, file), 'utf-8');
      linesOfCode += content.split('\n').length;
    }
    
    // Count components
    const componentFiles = await globby([
      '**/components/**/*.{jsx,tsx}',
      '**/src/components/**/*.{jsx,tsx}',
    ], {
      cwd: repoPath,
      ignore: ['node_modules/**', '**/*.test.*', '**/*.spec.*'],
    });
    
    // Estimate test coverage (simplified)
    const testFiles = await globby([
      '**/*.{test,spec}.{js,jsx,ts,tsx}',
    ], {
      cwd: repoPath,
      ignore: ['node_modules/**'],
    });
    
    const testCoverage = Math.min(
      Math.round((testFiles.length / Math.max(codeFiles.length, 1)) * 100),
      100
    );
    
    return {
      linesOfCode,
      fileCount: codeFiles.length,
      testCoverage,
      componentCount: componentFiles.length,
    };
  } catch (error) {
    // Return default metrics if calculation fails
    return {
      linesOfCode: 0,
      fileCount: 0,
      testCoverage: 0,
      componentCount: 0,
    };
  }
}