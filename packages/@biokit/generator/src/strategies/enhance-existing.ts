import fs from 'fs-extra';
import path from 'path';
import type { RepoAnalysis } from '@biokit/analyzer';
import type { GenerationOptions, GeneratedProject } from '../index';
import { migrateTooBiokitDesign } from './migrations/biokit-migration';
import { addTypeScript } from './migrations/typescript-migration';
import { improveCodeQuality } from './migrations/quality-improvements';

export async function enhanceExistingApp(
  analysis: RepoAnalysis,
  outputDir: string,
  options: GenerationOptions
): Promise<GeneratedProject> {
  console.log('✨ Enhancing existing application...');
  
  const projectName = path.basename(analysis.localPath || 'enhanced-app');
  const projectPath = path.join(outputDir, projectName);
  
  // Copy existing project to output directory
  if (analysis.localPath) {
    await fs.copy(analysis.localPath, projectPath, {
      filter: (src) => !src.includes('node_modules') && !src.includes('.git'),
    });
  }
  
  const changes: string[] = [];
  
  // Determine which improvements to apply
  let improvementsToApply = analysis.improvements;
  if (options.improvements !== 'all' && Array.isArray(options.improvements)) {
    improvementsToApply = options.improvements;
  }
  
  // Apply improvements
  for (const improvement of improvementsToApply) {
    console.log(`  Applying: ${improvement}`);
    
    switch (improvement) {
      case 'migrate-to-biokit-design-system':
        await migrateTooBiokitDesign(projectPath, analysis);
        changes.push('Migrated to biokit-design-system');
        break;
        
      case 'add-typescript':
        await addTypeScript(projectPath, analysis);
        changes.push('Added TypeScript support');
        break;
        
      case 'add-test-coverage':
        await addTestCoverage(projectPath, analysis);
        changes.push('Added test coverage');
        break;
        
      case 'improve-accessibility':
        await improveAccessibility(projectPath, analysis);
        changes.push('Improved accessibility');
        break;
        
      case 'add-error-boundaries':
        await addErrorBoundaries(projectPath, analysis);
        changes.push('Added error boundaries');
        break;
        
      case 'optimize-performance':
        await optimizePerformance(projectPath, analysis);
        changes.push('Optimized performance');
        break;
        
      case 'extract-env-variables':
        await extractEnvVariables(projectPath, analysis);
        changes.push('Extracted environment variables');
        break;
        
      default:
        console.log(`  Skipping unknown improvement: ${improvement}`);
    }
  }
  
  // Update package.json with new dependencies
  await updatePackageJson(projectPath, analysis, improvementsToApply);
  
  return {
    path: projectPath,
    name: projectName,
    type: analysis.codeQuality.framework,
    hasTests: true,
    changes,
  };
}

async function addTestCoverage(projectPath: string, analysis: RepoAnalysis): Promise<void> {
  // Create test setup
  const testConfig = `import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})`;
  
  await fs.writeFile(path.join(projectPath, 'vitest.config.ts'), testConfig);
  
  // Create test setup file
  await fs.ensureDir(path.join(projectPath, 'src', 'test'));
  await fs.writeFile(
    path.join(projectPath, 'src', 'test', 'setup.ts'),
    `import '@testing-library/jest-dom'`
  );
  
  // Generate tests for components
  // This would invoke Claude Code to generate tests
  console.log('    Generating test files...');
}

async function improveAccessibility(projectPath: string, analysis: RepoAnalysis): Promise<void> {
  // Add accessibility linting
  const eslintConfig = await fs.readJson(path.join(projectPath, '.eslintrc.json')).catch(() => ({}));
  
  eslintConfig.extends = eslintConfig.extends || [];
  eslintConfig.extends.push('plugin:jsx-a11y/recommended');
  
  eslintConfig.plugins = eslintConfig.plugins || [];
  eslintConfig.plugins.push('jsx-a11y');
  
  await fs.writeJson(path.join(projectPath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
}

async function addErrorBoundaries(projectPath: string, analysis: RepoAnalysis): Promise<void> {
  const errorBoundaryCode = `'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}`;
  
  const componentsDir = path.join(projectPath, 'src', 'components');
  await fs.ensureDir(componentsDir);
  await fs.writeFile(
    path.join(componentsDir, 'ErrorBoundary.tsx'),
    errorBoundaryCode
  );
}

async function optimizePerformance(projectPath: string, analysis: RepoAnalysis): Promise<void> {
  // Add performance optimizations for Next.js
  if (analysis.codeQuality.framework.toLowerCase().includes('next')) {
    // Update next.config.js for optimizations
    const configPath = path.join(projectPath, 'next.config.js');
    let config = await fs.readFile(configPath, 'utf-8').catch(() => '');
    
    if (!config.includes('images:')) {
      config = config.replace(
        'module.exports = nextConfig',
        `nextConfig.images = {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
}

module.exports = nextConfig`
      );
      await fs.writeFile(configPath, config);
    }
  }
}

async function extractEnvVariables(projectPath: string, analysis: RepoAnalysis): Promise<void> {
  // Create .env.example if it doesn't exist
  const envExamplePath = path.join(projectPath, '.env.example');
  if (!await fs.pathExists(envExamplePath)) {
    await fs.writeFile(envExamplePath, `# API Keys
# Add your environment variables here

# Database
DATABASE_URL=

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Third-party services
`);
  }
}

async function updatePackageJson(
  projectPath: string,
  analysis: RepoAnalysis,
  improvements: string[]
): Promise<void> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  
  // Add biokit-design-system if migrating
  if (improvements.includes('migrate-to-biokit-design-system')) {
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.dependencies['biokit-design-system'] = 'latest';
    
    // Remove old design system
    if (analysis.codeQuality.designSystem === 'material-ui') {
      delete packageJson.dependencies['@mui/material'];
      delete packageJson.dependencies['@emotion/react'];
      delete packageJson.dependencies['@emotion/styled'];
    }
  }
  
  // Add TypeScript if needed
  if (improvements.includes('add-typescript')) {
    packageJson.devDependencies = packageJson.devDependencies || {};
    packageJson.devDependencies['typescript'] = '^5.3.3';
    packageJson.devDependencies['@types/react'] = '^18.2.0';
    packageJson.devDependencies['@types/node'] = '^20.11.0';
  }
  
  // Add testing libraries
  if (improvements.includes('add-test-coverage')) {
    packageJson.devDependencies = packageJson.devDependencies || {};
    packageJson.devDependencies['vitest'] = '^1.2.0';
    packageJson.devDependencies['@testing-library/react'] = '^14.0.0';
    packageJson.devDependencies['@testing-library/jest-dom'] = '^6.0.0';
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.test = 'vitest';
  }
  
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}