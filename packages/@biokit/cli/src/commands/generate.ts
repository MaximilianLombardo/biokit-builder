import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { analyzeRepository } from '@biokit/analyzer';
import { generateApplication } from '@biokit/generator';
import { execSync } from 'child_process';

interface GenerateOptions {
  output: string;
  mode: 'auto' | 'build' | 'enhance';
  improvements: 'all' | 'select';
  preserve: string;
  style: 'strict' | 'loose';
  deploy: boolean;
  install: boolean;
}

export async function generateCommand(repoUrl: string, options: GenerateOptions) {
  console.log(chalk.cyan('🚀 Starting biokit-builder...\n'));
  
  const spinner = ora();
  
  try {
    // Step 1: Analyze repository
    spinner.start('Analyzing repository...');
    const analysis = await analyzeRepository(repoUrl);
    spinner.succeed(`Repository analyzed: ${chalk.green(analysis.type)}`);
    
    // Display analysis summary
    console.log(chalk.yellow('\n📊 Repository Analysis:'));
    console.log(`  Type: ${analysis.type}`);
    console.log(`  Has Code: ${analysis.hasCode ? '✅' : '❌'}`);
    console.log(`  Has Requirements: ${analysis.hasRequirements ? '✅' : '❌'}`);
    
    if (analysis.hasCode) {
      console.log(`  Framework: ${analysis.codeQuality.framework}`);
      console.log(`  Design System: ${analysis.codeQuality.designSystem}`);
      console.log(`  TypeScript: ${analysis.codeQuality.hasTypescript ? '✅' : '❌'}`);
      console.log(`  Tests: ${analysis.codeQuality.hasTests ? '✅' : '❌'}`);
    }
    
    if (analysis.improvements.length > 0) {
      console.log(chalk.yellow('\n🔧 Recommended Improvements:'));
      analysis.improvements.forEach((improvement, index) => {
        console.log(`  ${index + 1}. ${improvement}`);
      });
    }
    
    // Step 2: Determine generation mode
    let generationMode = options.mode;
    if (generationMode === 'auto') {
      generationMode = analysis.hasCode ? 'enhance' : 'build';
    }
    
    console.log(chalk.cyan(`\n🏗️  Generation mode: ${generationMode}`));
    
    // Step 3: Prepare output directory
    const outputDir = path.resolve(options.output);
    await fs.ensureDir(outputDir);
    
    // Step 4: Generate or enhance application
    spinner.start('Generating application...');
    const project = await generateApplication(analysis, outputDir, {
      mode: generationMode,
      improvements: options.improvements,
      preserve: options.preserve.split(',').filter(Boolean),
      style: options.style,
    });
    spinner.succeed('Application generated successfully');
    
    // Step 5: Install dependencies
    if (options.install) {
      spinner.start('Installing dependencies...');
      execSync('npm install', { 
        cwd: project.path,
        stdio: 'ignore' 
      });
      spinner.succeed('Dependencies installed');
    }
    
    // Step 6: Run initial build/test
    if (project.hasTests) {
      spinner.start('Running tests...');
      try {
        execSync('npm test', { 
          cwd: project.path,
          stdio: 'ignore' 
        });
        spinner.succeed('Tests passed');
      } catch (error) {
        spinner.warn('Some tests failed - please review');
      }
    }
    
    // Step 7: Deploy if requested
    if (options.deploy) {
      spinner.start('Deploying to Vercel...');
      try {
        const deployResult = execSync('vercel --prod', { 
          cwd: project.path,
          encoding: 'utf-8'
        });
        const deployUrl = deployResult.trim().split('\n').pop();
        spinner.succeed(`Deployed to: ${chalk.green(deployUrl)}`);
      } catch (error) {
        spinner.fail('Deployment failed - please deploy manually');
      }
    }
    
    // Success message
    console.log(chalk.green('\n✅ Application generated successfully!'));
    console.log(chalk.cyan(`📁 Output: ${project.path}`));
    
    // Next steps
    console.log(chalk.yellow('\n📝 Next steps:'));
    console.log(`  1. cd ${path.relative(process.cwd(), project.path)}`);
    if (!options.install) {
      console.log('  2. npm install');
      console.log('  3. npm run dev');
    } else {
      console.log('  2. npm run dev');
    }
    
  } catch (error) {
    spinner.fail('Generation failed');
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}