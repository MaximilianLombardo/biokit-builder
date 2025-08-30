import type { RepoAnalysis } from '@biokit/analyzer';
import type { GenerationOptions } from '../index';

export function generatePrompt(
  analysis: RepoAnalysis,
  options: GenerationOptions
): string {
  const sections: string[] = [];
  
  // Header
  sections.push('# Application Generation Request\n');
  
  // Project Info
  if (analysis.config) {
    sections.push(`## Project: ${analysis.config.name}\n`);
    if (analysis.config.framework) {
      sections.push(`Framework: ${analysis.config.framework}\n`);
    }
  }
  
  // Requirements
  if (analysis.hasRequirements) {
    sections.push('## Requirements\n');
    
    if (analysis.extractedFeatures && analysis.extractedFeatures.length > 0) {
      sections.push('### Features to Implement:\n');
      analysis.extractedFeatures.forEach(feature => {
        sections.push(`- ${feature.name}`);
        if (feature.description) {
          sections.push(`  ${feature.description}`);
        }
      });
      sections.push('');
    }
  }
  
  // Existing Code Context
  if (analysis.hasCode) {
    sections.push('## Existing Code Context\n');
    sections.push(`- Framework: ${analysis.codeQuality.framework}`);
    sections.push(`- Current Design System: ${analysis.codeQuality.designSystem}`);
    sections.push(`- TypeScript: ${analysis.codeQuality.hasTypescript ? 'Yes' : 'No'}`);
    sections.push(`- Tests: ${analysis.codeQuality.hasTests ? 'Yes' : 'No'}\n`);
  }
  
  // Instructions
  sections.push('## Instructions\n');
  
  if (analysis.type === 'requirements-only') {
    sections.push(`
Please build a complete Next.js application based on the requirements above.

Requirements:
1. Use Next.js 15 with App Router
2. Use TypeScript with strict mode
3. Use Tailwind CSS for styling
4. Integrate biokit-design-system for all UI components
5. Follow React best practices
6. Include error boundaries and loading states
7. Make the application production-ready

Structure:
- Use the app directory for routing
- Create reusable components in src/components
- Add API routes as needed
- Include proper TypeScript types
- Add environment variables for configuration
`);
  } else if (analysis.type === 'existing-app') {
    sections.push(`
Please enhance this existing application with the following improvements:
`);
    
    if (options.improvements === 'all' || Array.isArray(options.improvements)) {
      const improvements = options.improvements === 'all' 
        ? analysis.improvements 
        : options.improvements;
        
      improvements.forEach(imp => {
        sections.push(`- ${imp.replace(/-/g, ' ')}`);
      });
    }
    
    sections.push(`
Requirements:
1. Preserve existing functionality
2. Migrate UI components to biokit-design-system
3. Add TypeScript if not present
4. Improve code quality and structure
5. Add tests for critical paths
6. Ensure accessibility compliance
`);
  } else if (analysis.type === 'partial-implementation') {
    sections.push(`
Please complete this partial implementation:

1. Implement all TODO items found in the code
2. Complete stub functions with real implementations
3. Replace mock data with proper data handling
4. Add missing features from the requirements
5. Ensure all components use biokit-design-system
6. Add proper error handling and loading states
`);
  }
  
  // Design System Requirements
  sections.push(`
## Design System Requirements

All UI components must use biokit-design-system:
- Import components from 'biokit-design-system'
- Use design tokens for colors, spacing, and typography
- Follow the biokit design patterns
- Ensure consistent styling throughout

Example imports:
\`\`\`typescript
import { Button, Card, Input, Text } from 'biokit-design-system'
\`\`\`
`);
  
  // Quality Requirements
  sections.push(`
## Quality Requirements

- TypeScript strict mode enabled
- All components properly typed
- Error boundaries for error handling
- Loading states for async operations
- Accessibility: WCAG 2.1 AA compliance
- Performance: Optimized images and code splitting
- SEO: Proper meta tags and structured data
- Testing: Unit tests for business logic
`);
  
  // Output Requirements
  sections.push(`
## Output Requirements

Generate a complete, production-ready application with:
1. All required features implemented
2. Proper file structure
3. Configuration files (package.json, tsconfig.json, etc.)
4. Environment variables template
5. README with setup instructions
6. Basic tests
`);
  
  return sections.join('\n');
}