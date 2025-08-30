import fs from 'fs-extra';
import path from 'path';
import type { RepoAnalysis } from '@biokit/analyzer';

export async function improveCodeQuality(
  projectPath: string,
  analysis: RepoAnalysis
): Promise<void> {
  console.log('    Improving code quality...');
  
  // Add ESLint configuration
  await addESLintConfig(projectPath);
  
  // Add Prettier configuration
  await addPrettierConfig(projectPath);
  
  // Add pre-commit hooks
  await addPreCommitHooks(projectPath);
}

async function addESLintConfig(projectPath: string) {
  const eslintConfig = {
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  };
  
  await fs.writeJson(
    path.join(projectPath, '.eslintrc.json'),
    eslintConfig,
    { spaces: 2 }
  );
}

async function addPrettierConfig(projectPath: string) {
  const prettierConfig = {
    semi: false,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
  };
  
  await fs.writeJson(
    path.join(projectPath, '.prettierrc'),
    prettierConfig,
    { spaces: 2 }
  );
  
  // Add .prettierignore
  await fs.writeFile(
    path.join(projectPath, '.prettierignore'),
    `node_modules
.next
dist
build
coverage
.git
*.log
`
  );
}

async function addPreCommitHooks(projectPath: string) {
  // Add husky and lint-staged configuration
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  
  packageJson['lint-staged'] = {
    '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
    '*.{json,md,yml,yaml}': ['prettier --write'],
  };
  
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts.prepare = 'husky install';
  
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}