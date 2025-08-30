import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import type { RepoAnalysis } from '@biokit/analyzer';
import { buildFromScratch } from './strategies/build-from-scratch';
import { enhanceExistingApp } from './strategies/enhance-existing';
import { completePartialImplementation } from './strategies/complete-partial';
import { applyHybridApproach } from './strategies/hybrid-approach';

export interface GenerationOptions {
  mode: 'auto' | 'build' | 'enhance';
  improvements: string[] | 'all';
  preserve: string[];
  style: 'strict' | 'loose';
}

export interface GeneratedProject {
  path: string;
  name: string;
  type: string;
  hasTests: boolean;
  changes?: string[];
}

export interface PreviewInfo {
  affectedFiles?: Array<{
    path: string;
    action: 'create' | 'modify' | 'delete';
  }>;
  dependencies?: {
    add: string[];
    remove: string[];
    update: string[];
  };
  configChanges?: string[];
  estimatedTime?: string;
}

export async function generateApplication(
  analysis: RepoAnalysis,
  outputDir: string,
  options: GenerationOptions
): Promise<GeneratedProject> {
  // Ensure output directory exists
  await fs.ensureDir(outputDir);
  
  // Determine generation strategy based on repo type
  let project: GeneratedProject;
  
  switch (analysis.type) {
    case 'requirements-only':
      project = await buildFromScratch(analysis, outputDir, options);
      break;
      
    case 'existing-app':
      project = await enhanceExistingApp(analysis, outputDir, options);
      break;
      
    case 'partial-implementation':
      project = await completePartialImplementation(analysis, outputDir, options);
      break;
      
    case 'hybrid':
      project = await applyHybridApproach(analysis, outputDir, options);
      break;
      
    default:
      throw new Error(`Unknown repository type: ${analysis.type}`);
  }
  
  // Post-generation tasks
  await postGeneration(project);
  
  return project;
}

export async function previewChanges(analysis: RepoAnalysis): Promise<PreviewInfo> {
  const preview: PreviewInfo = {
    affectedFiles: [],
    dependencies: {
      add: [],
      remove: [],
      update: [],
    },
    configChanges: [],
    estimatedTime: '10-15 minutes',
  };
  
  // Determine what files would be affected
  if (analysis.type === 'requirements-only') {
    // Building from scratch
    preview.affectedFiles = [
      { path: 'package.json', action: 'create' },
      { path: 'tsconfig.json', action: 'create' },
      { path: 'next.config.js', action: 'create' },
      { path: 'tailwind.config.ts', action: 'create' },
      { path: '.env.example', action: 'create' },
      { path: 'app/layout.tsx', action: 'create' },
      { path: 'app/page.tsx', action: 'create' },
    ];
    
    preview.dependencies.add = [
      'next@latest',
      'react@latest',
      'react-dom@latest',
      'typescript',
      'tailwindcss',
      'biokit-design-system',
    ];
    
    preview.estimatedTime = '15-20 minutes';
  } else if (analysis.type === 'existing-app') {
    // Enhancing existing app
    if (analysis.codeQuality.designSystem !== 'biokit') {
      preview.affectedFiles.push(
        ...analysis.codeQuality.components?.map(c => ({
          path: c,
          action: 'modify' as const,
        })) || []
      );
      
      preview.dependencies.add.push('biokit-design-system');
      
      // Remove old design system
      if (analysis.codeQuality.designSystem === 'material-ui') {
        preview.dependencies.remove.push('@mui/material', '@emotion/react');
      }
    }
    
    if (!analysis.codeQuality.hasTypescript) {
      preview.configChanges.push('Add TypeScript configuration');
      preview.dependencies.add.push('typescript', '@types/react', '@types/node');
    }
    
    preview.estimatedTime = '20-30 minutes';
  }
  
  // Add improvements that would be applied
  if (analysis.improvements.length > 0) {
    preview.configChanges.push(...analysis.improvements.map(imp => 
      `Apply: ${imp.replace(/-/g, ' ')}`
    ));
  }
  
  return preview;
}

async function postGeneration(project: GeneratedProject): Promise<void> {
  // Create .gitignore if not exists
  const gitignorePath = path.join(project.path, '.gitignore');
  if (!await fs.pathExists(gitignorePath)) {
    await fs.writeFile(gitignorePath, `
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/
.next/
out/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
    `.trim());
  }
  
  // Create README if not exists
  const readmePath = path.join(project.path, 'README.md');
  if (!await fs.pathExists(readmePath)) {
    await fs.writeFile(readmePath, `# ${project.name}

Generated with biokit-builder

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- biokit-design-system

## Generated by biokit-builder

This project was generated using biokit-builder, which analyzed requirements and implemented a production-ready application.
`);
  }
}