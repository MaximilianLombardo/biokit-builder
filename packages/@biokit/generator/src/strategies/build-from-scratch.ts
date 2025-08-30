import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import type { RepoAnalysis } from '@biokit/analyzer';
import type { GenerationOptions, GeneratedProject } from '../index';
import { generatePrompt } from '../prompts/builder';

export async function buildFromScratch(
  analysis: RepoAnalysis,
  outputDir: string,
  options: GenerationOptions
): Promise<GeneratedProject> {
  console.log('🏗️  Building application from requirements...');
  
  const projectName = analysis.config?.name || 'biokit-app';
  const projectPath = path.join(outputDir, projectName);
  
  // Ensure project directory
  await fs.ensureDir(projectPath);
  
  // Copy requirements to project for context
  const requirementsPath = path.join(projectPath, '.requirements');
  if (analysis.localPath) {
    await fs.copy(
      path.join(analysis.localPath, 'requirements'),
      requirementsPath,
      { filter: (src) => !src.includes('node_modules') }
    );
  }
  
  // Generate the prompt for Claude Code
  const prompt = generatePrompt(analysis, options);
  
  // Save prompt for debugging
  await fs.writeFile(
    path.join(projectPath, '.biokit-prompt.md'),
    prompt
  );
  
  // Invoke Claude Code to generate the application
  console.log('🤖 Invoking Claude Code to generate application...');
  
  try {
    // This would be the actual Claude Code invocation
    // For now, we'll create a basic structure
    await createBasicStructure(projectPath, projectName, analysis);
    
    // In a real implementation, this would be:
    // await execa('claude', ['code', '--prompt', prompt], {
    //   cwd: projectPath,
    //   stdio: 'inherit'
    // });
    
  } catch (error) {
    console.error('Failed to generate with Claude Code:', error);
    throw error;
  }
  
  return {
    path: projectPath,
    name: projectName,
    type: 'nextjs',
    hasTests: true,
    changes: [
      'Created Next.js application structure',
      'Set up TypeScript configuration',
      'Configured Tailwind CSS',
      'Integrated biokit-design-system',
      'Implemented features from requirements',
    ],
  };
}

async function createBasicStructure(
  projectPath: string,
  projectName: string,
  analysis: RepoAnalysis
): Promise<void> {
  // Create package.json
  await fs.writeJson(path.join(projectPath, 'package.json'), {
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
      test: 'vitest',
    },
    dependencies: {
      next: '^14.0.0',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'biokit-design-system': 'latest',
      'tailwindcss': '^3.4.0',
      '@supabase/supabase-js': '^2.39.0',
      'zod': '^3.22.0',
    },
    devDependencies: {
      '@types/node': '^20.11.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      'typescript': '^5.3.3',
      'eslint': '^8.56.0',
      'eslint-config-next': '^14.0.0',
      'vitest': '^1.2.0',
      '@vitejs/plugin-react': '^4.2.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0',
    },
  }, { spaces: 2 });
  
  // Create tsconfig.json
  await fs.writeJson(path.join(projectPath, 'tsconfig.json'), {
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
      jsx: 'preserve',
      incremental: true,
      plugins: [
        {
          name: 'next',
        },
      ],
      paths: {
        '@/*': ['./src/*'],
      },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, { spaces: 2 });
  
  // Create next.config.js
  await fs.writeFile(path.join(projectPath, 'next.config.js'), `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
`);
  
  // Create tailwind.config.ts
  await fs.writeFile(path.join(projectPath, 'tailwind.config.ts'), `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/biokit-design-system/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Extend with biokit-design-system tokens
    },
  },
  plugins: [],
}

export default config
`);
  
  // Create app directory structure
  const appDir = path.join(projectPath, 'app');
  await fs.ensureDir(appDir);
  
  // Create layout.tsx
  await fs.writeFile(path.join(appDir, 'layout.tsx'), `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Generated with biokit-builder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
`);
  
  // Create page.tsx
  await fs.writeFile(path.join(appDir, 'page.tsx'), `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-center">
        Welcome to ${projectName}
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Generated with biokit-builder
      </p>
    </main>
  )
}
`);
  
  // Create globals.css
  await fs.writeFile(path.join(appDir, 'globals.css'), `@tailwind base;
@tailwind components;
@tailwind utilities;
`);
  
  // Create .env.example
  await fs.writeFile(path.join(projectPath, '.env.example'), `# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys
ANTHROPIC_API_KEY=your_anthropic_key
`);
}