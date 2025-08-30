import fs from 'fs-extra';
import path from 'path';
import { globby } from 'globby';
import type { RepoAnalysis } from '@biokit/analyzer';

export async function addTypeScript(
  projectPath: string,
  analysis: RepoAnalysis
): Promise<void> {
  console.log('    Adding TypeScript support...');
  
  // Create tsconfig.json if it doesn't exist
  const tsconfigPath = path.join(projectPath, 'tsconfig.json');
  if (!await fs.pathExists(tsconfigPath)) {
    const tsconfig = {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: analysis.codeQuality.framework.includes('next') ? 'preserve' : 'react-jsx',
        incremental: true,
        paths: {
          '@/*': ['./src/*'],
        },
      },
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules', 'dist', 'build'],
    };
    
    await fs.writeJson(tsconfigPath, tsconfig, { spaces: 2 });
  }
  
  // Rename .js/.jsx files to .ts/.tsx
  const jsFiles = await globby([
    '**/*.{js,jsx}',
    '!node_modules/**',
    '!dist/**',
    '!build/**',
    '!.next/**',
    '!*.config.js', // Keep config files as JS
  ], { cwd: projectPath });
  
  for (const file of jsFiles) {
    const filePath = path.join(projectPath, file);
    const isReact = file.endsWith('.jsx') || (await containsJSX(filePath));
    const newExt = isReact ? '.tsx' : '.ts';
    const newPath = filePath.replace(/\.(js|jsx)$/, newExt);
    
    // Add basic type annotations
    let content = await fs.readFile(filePath, 'utf-8');
    content = addBasicTypes(content, isReact);
    
    await fs.writeFile(newPath, content);
    await fs.remove(filePath);
    
    console.log(`      Converted: ${file} → ${path.basename(newPath)}`);
  }
}

async function containsJSX(filePath: string): Promise<boolean> {
  const content = await fs.readFile(filePath, 'utf-8');
  return /<[A-Z]/.test(content) || /return\s*\(?\s*</.test(content);
}

function addBasicTypes(content: string, isReact: boolean): string {
  // Add React import if needed
  if (isReact && !content.includes('import React')) {
    content = `import React from 'react';\n${content}`;
  }
  
  // Add basic prop types for function components
  content = content.replace(
    /export\s+(default\s+)?function\s+(\w+)\s*\(props\)/g,
    'export $1function $2(props: any)'
  );
  
  content = content.replace(
    /export\s+(default\s+)?const\s+(\w+)\s*=\s*\(props\)/g,
    'export $1const $2 = (props: any)'
  );
  
  // Add return types for components
  content = content.replace(
    /export\s+(default\s+)?function\s+(\w+)\s*\((.*?)\)\s*{/g,
    (match, def, name, params) => {
      if (isReact) {
        return `export ${def || ''}function ${name}(${params}): React.ReactElement {`;
      }
      return match;
    }
  );
  
  // Add type to state hooks
  content = content.replace(
    /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState\(/g,
    'const [$1, set$1] = useState<any>('
  );
  
  // Add event handler types
  content = content.replace(
    /const\s+handle(\w+)\s*=\s*\((e)\)/g,
    'const handle$1 = (e: any)'
  );
  
  return content;
}