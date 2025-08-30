import type { CodebaseAnalysis } from './analyzers/codebase';
import type { CodeQuality } from './types';
import type { Gap } from './analyzers/gaps';

export function recommendImprovements(
  codeAnalysis: CodebaseAnalysis | null,
  qualityAnalysis: CodeQuality | null,
  gaps: Gap[]
): string[] {
  const improvements: string[] = [];
  
  if (!codeAnalysis || !qualityAnalysis) {
    return improvements;
  }
  
  // Check design system
  if (qualityAnalysis.designSystem !== 'biokit') {
    improvements.push('migrate-to-biokit-design-system: Replace current UI components with biokit-design-system');
  }
  
  // Check TypeScript
  if (!qualityAnalysis.hasTypescript) {
    improvements.push('add-typescript: Convert JavaScript to TypeScript for better type safety');
  }
  
  // Check tests
  if (!qualityAnalysis.hasTests) {
    improvements.push('add-test-coverage: Add unit and integration tests');
  } else if (qualityAnalysis.metrics && qualityAnalysis.metrics.testCoverage < 60) {
    improvements.push('improve-test-coverage: Increase test coverage to at least 80%');
  }
  
  // Check for gaps
  if (gaps.length > 10) {
    improvements.push('complete-todos: Address TODO comments and incomplete implementations');
  }
  
  const mockDataGaps = gaps.filter(g => g.type === 'mock');
  if (mockDataGaps.length > 0) {
    improvements.push('replace-mock-data: Replace mock data with real API integrations');
  }
  
  const stubGaps = gaps.filter(g => g.type === 'stub');
  if (stubGaps.length > 0) {
    improvements.push('implement-stubs: Complete stub function implementations');
  }
  
  // Check for error handling
  if (codeAnalysis.components.length > 0) {
    improvements.push('add-error-boundaries: Add React error boundaries for better error handling');
  }
  
  // Check for accessibility
  improvements.push('improve-accessibility: Ensure WCAG 2.1 AA compliance');
  
  // Check for performance
  if (codeAnalysis.framework === 'nextjs') {
    improvements.push('optimize-performance: Add Next.js performance optimizations (Image, Font, etc.)');
  }
  
  // Check for environment variables
  if (codeAnalysis.packageJson && !codeAnalysis.packageJson.scripts?.env) {
    improvements.push('extract-env-variables: Extract hardcoded values to environment variables');
  }
  
  // Check for documentation
  const hasReadme = codeAnalysis.packageJson?.readme || false;
  if (!hasReadme) {
    improvements.push('add-documentation: Add README and API documentation');
  }
  
  // Check for CI/CD
  improvements.push('add-ci-cd: Set up continuous integration and deployment');
  
  // Check for linting
  const hasEslint = codeAnalysis.packageJson?.devDependencies?.eslint;
  if (!hasEslint) {
    improvements.push('add-linting: Add ESLint and Prettier for code quality');
  }
  
  // Check for SEO
  if (codeAnalysis.framework === 'nextjs' || codeAnalysis.framework === 'gatsby') {
    improvements.push('improve-seo: Add SEO optimizations and meta tags');
  }
  
  // Check for loading states
  improvements.push('add-loading-states: Add loading indicators for async operations');
  
  // Check for form validation
  if (codeAnalysis.components.some(c => c.includes('form') || c.includes('Form'))) {
    improvements.push('add-form-validation: Add client and server-side form validation');
  }
  
  // Filter out improvements that might not be relevant
  return improvements.filter((imp, index, self) => self.indexOf(imp) === index);
}