import chalk from 'chalk';
import ora from 'ora';
import { analyzeRepository } from '@biokit/analyzer';

interface AnalyzeOptions {
  format: 'json' | 'markdown';
  verbose: boolean;
}

export async function analyzeCommand(repoUrl: string, options: AnalyzeOptions) {
  const spinner = ora('Analyzing repository...').start();
  
  try {
    const analysis = await analyzeRepository(repoUrl);
    spinner.succeed('Analysis complete');
    
    if (options.format === 'json') {
      console.log(JSON.stringify(analysis, null, 2));
      return;
    }
    
    // Markdown format
    console.log(chalk.cyan('\n# Repository Analysis Report\n'));
    console.log(`**Repository:** ${repoUrl}`);
    console.log(`**Type:** ${analysis.type}`);
    console.log(`**Date:** ${new Date().toISOString()}\n`);
    
    console.log(chalk.yellow('## Summary\n'));
    console.log(`- Has Code: ${analysis.hasCode ? '✅ Yes' : '❌ No'}`);
    console.log(`- Has Requirements: ${analysis.hasRequirements ? '✅ Yes' : '❌ No'}`);
    
    if (analysis.hasCode) {
      console.log(chalk.yellow('\n## Code Quality\n'));
      console.log(`- Framework: ${analysis.codeQuality.framework}`);
      console.log(`- Design System: ${analysis.codeQuality.designSystem}`);
      console.log(`- TypeScript: ${analysis.codeQuality.hasTypescript ? '✅ Yes' : '❌ No'}`);
      console.log(`- Tests: ${analysis.codeQuality.hasTests ? '✅ Yes' : '❌ No'}`);
      
      if (options.verbose && analysis.codeQuality.metrics) {
        console.log(chalk.yellow('\n### Detailed Metrics\n'));
        console.log(`- Lines of Code: ${analysis.codeQuality.metrics.linesOfCode}`);
        console.log(`- Number of Files: ${analysis.codeQuality.metrics.fileCount}`);
        console.log(`- Test Coverage: ${analysis.codeQuality.metrics.testCoverage}%`);
        console.log(`- Components: ${analysis.codeQuality.metrics.componentCount}`);
      }
    }
    
    if (analysis.hasRequirements) {
      console.log(chalk.yellow('\n## Requirements\n'));
      console.log(`- Product Docs: ${analysis.requirements.prd ? '✅' : '❌'}`);
      console.log(`- User Stories: ${analysis.requirements.userStories ? '✅' : '❌'}`);
      console.log(`- Technical Specs: ${analysis.requirements.technicalSpecs ? '✅' : '❌'}`);
      console.log(`- Design Mockups: ${analysis.requirements.mockups ? '✅' : '❌'}`);
      
      if (options.verbose && analysis.extractedFeatures) {
        console.log(chalk.yellow('\n### Extracted Features\n'));
        analysis.extractedFeatures.forEach((feature, index) => {
          console.log(`${index + 1}. ${feature.name}`);
          if (feature.description) {
            console.log(`   ${feature.description}`);
          }
        });
      }
    }
    
    if (analysis.improvements.length > 0) {
      console.log(chalk.yellow('\n## Recommended Improvements\n'));
      analysis.improvements.forEach((improvement, index) => {
        const [key, description] = improvement.split(':');
        console.log(`${index + 1}. **${key}**`);
        if (description) {
          console.log(`   ${description}`);
        }
      });
    }
    
    if (options.verbose) {
      console.log(chalk.yellow('\n## File Structure\n'));
      if (analysis.fileTree) {
        console.log('```');
        console.log(analysis.fileTree);
        console.log('```');
      }
    }
    
    console.log(chalk.cyan('\n## Recommendation\n'));
    if (analysis.type === 'requirements-only') {
      console.log('This repository contains only requirements. Run `biokit-builder generate` to build the application from scratch.');
    } else if (analysis.type === 'existing-app') {
      console.log('This is an existing application. Run `biokit-builder enhance` to improve it with biokit patterns.');
    } else if (analysis.type === 'partial-implementation') {
      console.log('This repository has partial implementation. Run `biokit-builder generate` to complete and enhance it.');
    }
    
  } catch (error) {
    spinner.fail('Analysis failed');
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}