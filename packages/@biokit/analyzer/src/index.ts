import simpleGit from 'simple-git';
import { globby } from 'globby';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { analyzeCodebase } from './analyzers/codebase';
import { analyzeRequirements } from './analyzers/requirements';
import { analyzeQuality } from './analyzers/quality';
import { detectGaps } from './analyzers/gaps';
import { classifyRepository } from './classifier';
import { recommendImprovements } from './recommender';
import type { RepoAnalysis, BiokitConfig } from './types';

const git = simpleGit();

export async function analyzeRepository(repoUrl: string): Promise<RepoAnalysis> {
  // Create temp directory for cloning
  const tempDir = path.join(os.tmpdir(), 'biokit-builder', Date.now().toString());
  await fs.ensureDir(tempDir);
  
  try {
    // Clone repository
    console.log(`Cloning repository: ${repoUrl}`);
    await git.clone(repoUrl, tempDir, ['--depth', '1']);
    
    // Check for biokit config
    const configPath = path.join(tempDir, 'biokit.config.json');
    let config: BiokitConfig | undefined;
    if (await fs.pathExists(configPath)) {
      config = await fs.readJson(configPath);
    }
    
    // Analyze what exists in the repo
    const hasCode = await detectCode(tempDir);
    const hasDocs = await detectDocumentation(tempDir);
    
    // Run appropriate analyzers
    const codeAnalysis = hasCode ? await analyzeCodebase(tempDir) : null;
    const requirementsAnalysis = hasDocs ? await analyzeRequirements(tempDir) : null;
    const qualityAnalysis = hasCode ? await analyzeQuality(tempDir) : null;
    const gaps = hasCode ? await detectGaps(tempDir) : [];
    
    // Classify repository type
    const repoType = classifyRepository(hasCode, hasDocs, codeAnalysis);
    
    // Get improvement recommendations
    const improvements = recommendImprovements(
      codeAnalysis,
      qualityAnalysis,
      gaps
    );
    
    // Build file tree
    const fileTree = await buildFileTree(tempDir);
    
    return {
      type: repoType,
      repoUrl,
      localPath: tempDir,
      hasCode,
      hasRequirements: hasDocs,
      codeQuality: qualityAnalysis || {
        hasTests: false,
        hasTypescript: false,
        designSystem: 'none',
        framework: 'unknown',
        packageManager: 'npm',
      },
      requirements: requirementsAnalysis || {
        prd: false,
        userStories: false,
        technicalSpecs: false,
        mockups: false,
        dataModels: false,
      },
      improvements,
      extractedFeatures: requirementsAnalysis?.features,
      fileTree,
      config,
    };
    
  } catch (error) {
    // Clean up temp directory on error
    await fs.remove(tempDir);
    throw new Error(`Failed to analyze repository: ${error.message}`);
  }
}

async function detectCode(repoPath: string): Promise<boolean> {
  const codePatterns = [
    '**/*.{js,jsx,ts,tsx}',
    '**/*.{py,java,go,rs}',
    '**/*.{html,css,scss,sass}',
    'package.json',
    'requirements.txt',
    'Cargo.toml',
    'go.mod',
  ];
  
  const files = await globby(codePatterns, {
    cwd: repoPath,
    ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
  });
  
  return files.length > 0;
}

async function detectDocumentation(repoPath: string): Promise<boolean> {
  const docPatterns = [
    '**/README.md',
    '**/requirements/**/*.md',
    '**/docs/**/*.md',
    '**/design/**/*',
    '**/PRD.md',
    '**/user-stories.md',
    '**/technical-spec.md',
  ];
  
  const files = await globby(docPatterns, {
    cwd: repoPath,
    ignore: ['node_modules/**', '.git/**'],
  });
  
  return files.length > 0;
}

async function buildFileTree(repoPath: string, maxDepth: number = 3): Promise<string> {
  const tree: string[] = [];
  
  async function traverse(dir: string, prefix: string = '', depth: number = 0) {
    if (depth > maxDepth) return;
    
    const items = await fs.readdir(dir);
    const filtered = items.filter(item => 
      !item.startsWith('.') && 
      item !== 'node_modules' && 
      item !== 'dist' && 
      item !== 'build'
    );
    
    for (let i = 0; i < filtered.length; i++) {
      const item = filtered[i];
      const itemPath = path.join(dir, item);
      const stat = await fs.stat(itemPath);
      const isLast = i === filtered.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      
      tree.push(prefix + connector + item);
      
      if (stat.isDirectory()) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        await traverse(itemPath, newPrefix, depth + 1);
      }
    }
  }
  
  const basename = path.basename(repoPath);
  tree.push(basename);
  await traverse(repoPath, '', 0);
  
  return tree.join('\n');
}

// Re-export types
export * from './types';