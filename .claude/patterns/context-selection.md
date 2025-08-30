# Context Selection Pattern

Extracted from open-lovable's intelligent file selection for AI code generation.

## Overview

This pattern enables smart selection of relevant files from a codebase to provide optimal context for AI generation while respecting token limits.

## Core Algorithm

```typescript
interface FileManifest {
  path: string;
  content: string;
  type: 'component' | 'util' | 'style' | 'config' | 'test';
  size: number;
  dependencies: string[];
  exports: string[];
  lastModified: Date;
}

interface ContextSelectionOptions {
  maxTokens: number;
  maxFiles: number;
  priorityPaths?: string[];
  excludePaths?: string[];
}

export class ContextSelector {
  private readonly tokenizer: Tokenizer;
  private readonly analyzer: CodeAnalyzer;

  async selectFiles(
    manifest: FileManifest[],
    userIntent: string,
    options: ContextSelectionOptions
  ): Promise<FileManifest[]> {
    // 1. Analyze user intent
    const intent = await this.analyzer.parseIntent(userIntent);
    
    // 2. Score files by relevance
    const scoredFiles = await this.scoreFiles(manifest, intent);
    
    // 3. Apply priority rules
    const prioritized = this.applyPriorities(scoredFiles, options);
    
    // 4. Select within token budget
    return this.selectWithinBudget(prioritized, options.maxTokens);
  }

  private async scoreFiles(
    files: FileManifest[],
    intent: ParsedIntent
  ): Promise<ScoredFile[]> {
    return files.map(file => ({
      ...file,
      score: this.calculateRelevanceScore(file, intent)
    }));
  }

  private calculateRelevanceScore(
    file: FileManifest,
    intent: ParsedIntent
  ): number {
    let score = 0;
    
    // Path relevance (0-30 points)
    if (intent.targetPath && file.path.includes(intent.targetPath)) {
      score += 30;
    }
    
    // Keyword matches (0-25 points)
    const keywordMatches = intent.keywords.filter(
      keyword => file.content.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    score += Math.min(25, keywordMatches * 5);
    
    // File type relevance (0-20 points)
    if (intent.fileTypes.includes(file.type)) {
      score += 20;
    }
    
    // Dependency relationship (0-15 points)
    if (this.hasRelevantDependencies(file, intent)) {
      score += 15;
    }
    
    // Recency (0-10 points)
    const daysSinceModified = this.daysSince(file.lastModified);
    score += Math.max(0, 10 - daysSinceModified);
    
    return score;
  }

  private selectWithinBudget(
    files: ScoredFile[],
    maxTokens: number
  ): FileManifest[] {
    const selected: FileManifest[] = [];
    let currentTokens = 0;
    
    // Sort by score descending
    const sorted = files.sort((a, b) => b.score - a.score);
    
    for (const file of sorted) {
      const fileTokens = this.tokenizer.count(file.content);
      
      if (currentTokens + fileTokens <= maxTokens) {
        selected.push(file);
        currentTokens += fileTokens;
      } else if (selected.length === 0) {
        // Always include at least one file, truncated if necessary
        const truncated = this.truncateToTokens(file, maxTokens);
        selected.push(truncated);
        break;
      }
    }
    
    return selected;
  }
}
```

## Intent Analysis

```typescript
interface ParsedIntent {
  action: 'create' | 'update' | 'fix' | 'refactor' | 'enhance';
  targetPath?: string;
  component?: string;
  keywords: string[];
  fileTypes: FileType[];
  complexity: 'simple' | 'moderate' | 'complex';
}

class IntentAnalyzer {
  private readonly patterns = {
    create: /create|add|new|build|generate/i,
    update: /update|modify|change|edit|alter/i,
    fix: /fix|repair|debug|solve|correct/i,
    refactor: /refactor|improve|optimize|clean/i,
    enhance: /enhance|extend|expand|augment/i,
  };

  async parseIntent(input: string): Promise<ParsedIntent> {
    // Extract action
    const action = this.extractAction(input);
    
    // Extract target path
    const targetPath = this.extractPath(input);
    
    // Extract component name
    const component = this.extractComponent(input);
    
    // Extract keywords
    const keywords = this.extractKeywords(input);
    
    // Determine relevant file types
    const fileTypes = this.determineFileTypes(input, action);
    
    // Assess complexity
    const complexity = this.assessComplexity(input);
    
    return {
      action,
      targetPath,
      component,
      keywords,
      fileTypes,
      complexity
    };
  }

  private extractKeywords(input: string): string[] {
    // Remove common words
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at']);
    
    // Extract meaningful words
    const words = input
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    // Add technical terms
    const technicalTerms = this.extractTechnicalTerms(input);
    
    return [...new Set([...words, ...technicalTerms])];
  }

  private extractTechnicalTerms(input: string): string[] {
    const terms: string[] = [];
    
    // React/Next.js terms
    if (/hook|state|props|component/i.test(input)) {
      terms.push('react');
    }
    
    // API terms
    if (/api|endpoint|route|rest|graphql/i.test(input)) {
      terms.push('api');
    }
    
    // Database terms
    if (/database|sql|query|model|schema/i.test(input)) {
      terms.push('database');
    }
    
    // Style terms
    if (/style|css|tailwind|design|theme/i.test(input)) {
      terms.push('style');
    }
    
    return terms;
  }
}
```

## Smart Context Building

```typescript
interface ContextBuildOptions {
  includeImports: boolean;
  includeTests: boolean;
  includeStyles: boolean;
  includeConfig: boolean;
}

export function buildContext(
  selectedFiles: FileManifest[],
  options: ContextBuildOptions = {
    includeImports: true,
    includeTests: false,
    includeStyles: true,
    includeConfig: true
  }
): string {
  const context: string[] = [];
  
  // Group files by type
  const grouped = groupFilesByType(selectedFiles);
  
  // Add configuration files first (they provide context)
  if (options.includeConfig && grouped.config) {
    context.push('=== Configuration Files ===');
    grouped.config.forEach(file => {
      context.push(formatFileForContext(file));
    });
  }
  
  // Add main implementation files
  if (grouped.component || grouped.util) {
    context.push('\n=== Implementation Files ===');
    [...(grouped.component || []), ...(grouped.util || [])].forEach(file => {
      context.push(formatFileForContext(file));
    });
  }
  
  // Add styles if relevant
  if (options.includeStyles && grouped.style) {
    context.push('\n=== Style Files ===');
    grouped.style.forEach(file => {
      context.push(formatFileForContext(file, { truncate: true }));
    });
  }
  
  // Add tests for reference
  if (options.includeTests && grouped.test) {
    context.push('\n=== Test Files ===');
    grouped.test.forEach(file => {
      context.push(formatFileForContext(file, { truncate: true }));
    });
  }
  
  return context.join('\n\n');
}

function formatFileForContext(
  file: FileManifest,
  options: { truncate?: boolean } = {}
): string {
  const header = `File: ${file.path}`;
  const separator = '-'.repeat(header.length);
  
  let content = file.content;
  
  if (options.truncate && content.length > 1000) {
    // Keep imports and first part of implementation
    const lines = content.split('\n');
    const imports = lines.filter(line => 
      line.startsWith('import') || line.startsWith('export')
    );
    const body = lines
      .filter(line => !line.startsWith('import'))
      .slice(0, 20);
    
    content = [...imports, '// ... truncated ...', ...body].join('\n');
  }
  
  return `${header}\n${separator}\n${content}`;
}
```

## Usage Example

```typescript
// In API route
export async function POST(request: Request) {
  const { prompt, projectFiles } = await request.json();
  
  // Initialize context selector
  const selector = new ContextSelector();
  
  // Select relevant files
  const selectedFiles = await selector.selectFiles(
    projectFiles,
    prompt,
    {
      maxTokens: 4000,
      maxFiles: 10,
      priorityPaths: ['components/', 'app/'],
      excludePaths: ['node_modules/', '.next/']
    }
  );
  
  // Build context
  const context = buildContext(selectedFiles);
  
  // Generate with context
  const response = await generateCode(prompt, context);
  
  return NextResponse.json({ 
    response,
    filesUsed: selectedFiles.map(f => f.path)
  });
}
```

## Optimization Strategies

1. **Cache File Analysis**: Store AST and dependency graphs
2. **Incremental Updates**: Only re-analyze changed files
3. **Parallel Processing**: Analyze files concurrently
4. **Smart Truncation**: Keep most relevant parts of large files
5. **Context Compression**: Remove redundant information

## Advanced Features

### Dependency Graph Analysis

```typescript
class DependencyAnalyzer {
  buildGraph(files: FileManifest[]): DependencyGraph {
    const graph = new Map<string, Set<string>>();
    
    for (const file of files) {
      const imports = this.extractImports(file.content);
      graph.set(file.path, new Set(imports));
    }
    
    return graph;
  }
  
  findRelatedFiles(
    targetFile: string,
    graph: DependencyGraph,
    depth: number = 2
  ): string[] {
    const related = new Set<string>();
    const queue = [{ file: targetFile, depth: 0 }];
    
    while (queue.length > 0) {
      const { file, depth: currentDepth } = queue.shift()!;
      
      if (currentDepth > depth) continue;
      
      related.add(file);
      
      // Add dependencies
      const deps = graph.get(file) || new Set();
      for (const dep of deps) {
        if (!related.has(dep)) {
          queue.push({ file: dep, depth: currentDepth + 1 });
        }
      }
    }
    
    return Array.from(related);
  }
}
```