import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { analyzeRepository } from '@biokit/analyzer';
import { generateApplication } from '@biokit/generator';
import path from 'path';
import fs from 'fs-extra';

interface EnhanceOptions {
  output: string;
  improvements: 'all' | 'select';
}

export async function enhanceCommand(repoUrl: string, options: EnhanceOptions) {
  const spinner = ora();
  
  try {
    // Analyze repository
    spinner.start('Analyzing repository...');
    const analysis = await analyzeRepository(repoUrl);
    spinner.succeed('Repository analyzed');
    
    if (!analysis.hasCode) {
      console.log(chalk.yellow('\n⚠️  This repository has no code to enhance.'));
      console.log('Use `biokit-builder generate` to build from requirements.');
      return;
    }
    
    // Show current state
    console.log(chalk.cyan('\n📊 Current State:'));
    console.log(`  Framework: ${analysis.codeQuality.framework}`);
    console.log(`  Design System: ${analysis.codeQuality.designSystem}`);
    console.log(`  TypeScript: ${analysis.codeQuality.hasTypescript ? '✅' : '❌'}`);
    console.log(`  Tests: ${analysis.codeQuality.hasTests ? '✅' : '❌'}`);
    
    // Select improvements
    let selectedImprovements = analysis.improvements;
    
    if (options.improvements === 'select' && analysis.improvements.length > 0) {
      console.log(chalk.yellow('\n🔧 Available Improvements:'));
      
      const { selected } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selected',
          message: 'Select improvements to apply:',
          choices: analysis.improvements.map(imp => ({
            name: imp.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
            value: imp,
            checked: true,
          })),
        },
      ]);
      
      selectedImprovements = selected;
    }
    
    if (selectedImprovements.length === 0) {
      console.log(chalk.yellow('\n⚠️  No improvements selected.'));
      return;
    }
    
    console.log(chalk.cyan('\n📝 Improvements to apply:'));
    selectedImprovements.forEach((imp, i) => {
      console.log(`  ${i + 1}. ${imp.replace(/-/g, ' ')}`);
    });
    
    // Confirm before proceeding
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Proceed with enhancements?',
        default: true,
      },
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('Enhancement cancelled.'));
      return;
    }
    
    // Prepare output directory
    const outputDir = path.resolve(options.output);
    await fs.ensureDir(outputDir);
    
    // Apply enhancements
    spinner.start('Applying enhancements...');
    const project = await generateApplication(analysis, outputDir, {
      mode: 'enhance',
      improvements: selectedImprovements,
      preserve: [],
      style: 'strict',
    });
    spinner.succeed('Enhancements applied successfully');
    
    // Show summary
    console.log(chalk.green('\n✅ Enhancement complete!'));
    console.log(chalk.cyan(`📁 Enhanced application: ${project.path}`));
    
    // Show what changed
    if (project.changes) {
      console.log(chalk.yellow('\n📋 Changes made:'));
      project.changes.forEach(change => {
        console.log(`  - ${change}`);
      });
    }
    
    console.log(chalk.yellow('\n📝 Next steps:'));
    console.log(`  1. Review changes in ${path.relative(process.cwd(), project.path)}`);
    console.log('  2. Run tests to ensure everything works');
    console.log('  3. Commit changes to version control');
    
  } catch (error) {
    spinner.fail('Enhancement failed');
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}