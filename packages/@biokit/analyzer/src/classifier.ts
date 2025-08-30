import type { RepoType } from './types';
import type { CodebaseAnalysis } from './analyzers/codebase';

export function classifyRepository(
  hasCode: boolean,
  hasDocs: boolean,
  codeAnalysis: CodebaseAnalysis | null
): RepoType {
  // No code, only requirements
  if (!hasCode && hasDocs) {
    return 'requirements-only';
  }
  
  // Has code but no docs
  if (hasCode && !hasDocs) {
    return 'existing-app';
  }
  
  // Has both code and docs
  if (hasCode && hasDocs) {
    if (codeAnalysis) {
      // Check completeness of implementation
      const hasComponents = codeAnalysis.components.length > 0;
      const hasPages = codeAnalysis.pages.length > 0;
      const hasTests = codeAnalysis.tests.length > 0;
      
      // If missing major pieces, it's partial
      if (!hasComponents || !hasPages) {
        return 'partial-implementation';
      }
      
      // If has tests and substantial code, it's an existing app
      if (hasTests && codeAnalysis.components.length > 5) {
        return 'existing-app';
      }
      
      // Otherwise it's hybrid
      return 'hybrid';
    }
    
    return 'partial-implementation';
  }
  
  // Default to requirements-only if nothing found
  return 'requirements-only';
}