import { globby } from 'globby';
import fs from 'fs-extra';
import path from 'path';

export interface Gap {
  type: 'todo' | 'stub' | 'mock' | 'placeholder' | 'incomplete';
  file: string;
  line?: number;
  description: string;
  priority?: 'high' | 'medium' | 'low';
}

export async function detectGaps(repoPath: string): Promise<Gap[]> {
  const gaps: Gap[] = [];
  
  // Find all code files
  const codeFiles = await globby([
    '**/*.{js,jsx,ts,tsx}',
    '**/*.{py,java,go}',
  ], {
    cwd: repoPath,
    ignore: ['node_modules/**', 'dist/**', 'build/**', '**/*.test.*', '**/*.spec.*'],
  });
  
  for (const file of codeFiles) {
    const filePath = path.join(repoPath, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Find TODOs
    gaps.push(...findTODOs(file, lines));
    
    // Find stub functions
    gaps.push(...findStubFunctions(file, lines));
    
    // Find mock data
    gaps.push(...findMockData(file, lines));
    
    // Find placeholders
    gaps.push(...findPlaceholders(file, lines));
    
    // Find incomplete implementations
    gaps.push(...findIncompleteImplementations(file, lines));
  }
  
  return gaps;
}

function findTODOs(file: string, lines: string[]): Gap[] {
  const gaps: Gap[] = [];
  const todoPattern = /\/\/\s*(TODO|FIXME|HACK|XXX|NOTE|OPTIMIZE|REFACTOR):?\s*(.+)/i;
  
  lines.forEach((line, index) => {
    const match = line.match(todoPattern);
    if (match) {
      gaps.push({
        type: 'todo',
        file,
        line: index + 1,
        description: match[2].trim(),
        priority: match[1].toUpperCase() === 'FIXME' ? 'high' : 'medium',
      });
    }
  });
  
  return gaps;
}

function findStubFunctions(file: string, lines: string[]): Gap[] {
  const gaps: Gap[] = [];
  const stubPatterns = [
    /function\s+\w+\s*\([^)]*\)\s*{\s*}/,
    /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{\s*}/,
    /\w+\s*\([^)]*\)\s*{\s*throw\s+new\s+Error\(['"]Not implemented/,
    /return\s+null\s*;?\s*}\s*$/,
    /return\s+undefined\s*;?\s*}\s*$/,
    /console\.(log|warn|error)\(['"]Not implemented/,
  ];
  
  const codeBlock = lines.join('\n');
  
  stubPatterns.forEach(pattern => {
    if (pattern.test(codeBlock)) {
      // Find the specific line
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          gaps.push({
            type: 'stub',
            file,
            line: index + 1,
            description: 'Empty or stub function implementation',
            priority: 'high',
          });
        }
      });
    }
  });
  
  return gaps;
}

function findMockData(file: string, lines: string[]): Gap[] {
  const gaps: Gap[] = [];
  const mockPatterns = [
    /const\s+\w*mock\w*/i,
    /const\s+\w*dummy\w*/i,
    /const\s+\w*fake\w*/i,
    /const\s+\w*test\w*\s*=\s*[\[{]/i,
    /return\s+[\[{].*hardcoded/i,
    /\/\/\s*Replace with real data/i,
    /\/\/\s*Mock data/i,
  ];
  
  lines.forEach((line, index) => {
    mockPatterns.forEach(pattern => {
      if (pattern.test(line)) {
        gaps.push({
          type: 'mock',
          file,
          line: index + 1,
          description: 'Mock or hardcoded data detected',
          priority: 'medium',
        });
      }
    });
  });
  
  return gaps;
}

function findPlaceholders(file: string, lines: string[]): Gap[] {
  const gaps: Gap[] = [];
  const placeholderPatterns = [
    /Lorem\s+ipsum/i,
    /placeholder/i,
    /coming\s+soon/i,
    /under\s+construction/i,
    /work\s+in\s+progress/i,
    /\[?WIP\]?/,
    /<p>Text<\/p>/,
    /<div>Content<\/div>/,
  ];
  
  lines.forEach((line, index) => {
    placeholderPatterns.forEach(pattern => {
      if (pattern.test(line)) {
        gaps.push({
          type: 'placeholder',
          file,
          line: index + 1,
          description: 'Placeholder content detected',
          priority: 'low',
        });
      }
    });
  });
  
  return gaps;
}

function findIncompleteImplementations(file: string, lines: string[]): Gap[] {
  const gaps: Gap[] = [];
  
  // Look for patterns indicating incomplete work
  const incompletePatterns = [
    {
      pattern: /^\s*\/\/\s*\.\.\./,
      description: 'Ellipsis comment indicating more code needed',
    },
    {
      pattern: /throw\s+new\s+Error\(['"]Not yet implemented/i,
      description: 'Not yet implemented error',
    },
    {
      pattern: /alert\(['"]Not implemented/i,
      description: 'Alert indicating missing implementation',
    },
    {
      pattern: /console\.\w+\(['"]TODO:/i,
      description: 'Console log with TODO',
    },
    {
      pattern: /return\s+Promise\.resolve\(\)/,
      description: 'Empty promise resolution',
    },
    {
      pattern: /catch\s*\([^)]*\)\s*{\s*}/,
      description: 'Empty catch block',
    },
  ];
  
  lines.forEach((line, index) => {
    incompletePatterns.forEach(({ pattern, description }) => {
      if (pattern.test(line)) {
        gaps.push({
          type: 'incomplete',
          file,
          line: index + 1,
          description,
          priority: 'high',
        });
      }
    });
  });
  
  // Check for files that are too short (likely incomplete)
  if (lines.length < 10 && !file.includes('index')) {
    gaps.push({
      type: 'incomplete',
      file,
      description: 'File seems incomplete (very short)',
      priority: 'medium',
    });
  }
  
  return gaps;
}