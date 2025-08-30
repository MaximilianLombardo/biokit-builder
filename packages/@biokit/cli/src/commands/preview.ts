import chalk from 'chalk';
import ora from 'ora';
import { analyzeRepository } from '@biokit/analyzer';
import { previewChanges } from '@biokit/generator';

interface PreviewOptions {
  changes: boolean;
}

export async function previewCommand(repoUrl: string, options: PreviewOptions) {
  const spinner = ora('Analyzing repository...').start();
  
  try {
    const analysis = await analyzeRepository(repoUrl);
    spinner.succeed('Analysis complete');
    
    console.log(chalk.cyan('\n🔍 Preview of Changes\n'));
    console.log(`Repository: ${repoUrl}`);
    console.log(`Type: ${analysis.type}\n`);
    
    // Get preview of changes
    const preview = await previewChanges(analysis);
    
    // Show generation mode
    console.log(chalk.yellow('Generation Mode:'));
    if (analysis.hasCode) {
      console.log('  → Enhancement mode (improving existing code)\n');
    } else {
      console.log('  → Build mode (creating from requirements)\n');
    }
    
    // Show improvements that would be applied
    if (analysis.improvements.length > 0) {
      console.log(chalk.yellow('Improvements to Apply:'));
      analysis.improvements.forEach((improvement, index) => {
        console.log(`  ${index + 1}. ${improvement.replace(/-/g, ' ')}`);
      });
      console.log();
    }
    
    // Show files that would be affected
    if (options.changes && preview.affectedFiles) {
      console.log(chalk.yellow('Files to be Modified:'));
      
      const grouped = preview.affectedFiles.reduce((acc, file) => {
        if (!acc[file.action]) acc[file.action] = [];
        acc[file.action].push(file);
        return acc;
      }, {} as Record<string, any[]>);
      
      if (grouped.create) {
        console.log(chalk.green('\n  New files:'));
        grouped.create.forEach(file => {
          console.log(`    + ${file.path}`);
        });
      }
      
      if (grouped.modify) {
        console.log(chalk.blue('\n  Modified files:'));
        grouped.modify.forEach(file => {
          console.log(`    ~ ${file.path}`);
        });
      }
      
      if (grouped.delete) {
        console.log(chalk.red('\n  Deleted files:'));
        grouped.delete.forEach(file => {
          console.log(`    - ${file.path}`);
        });
      }
      
      console.log();
    }
    
    // Show dependency changes
    if (preview.dependencies) {
      console.log(chalk.yellow('Dependencies:'));
      
      if (preview.dependencies.add.length > 0) {
        console.log(chalk.green('  To be added:'));
        preview.dependencies.add.forEach(dep => {
          console.log(`    + ${dep}`);
        });
      }
      
      if (preview.dependencies.remove.length > 0) {
        console.log(chalk.red('  To be removed:'));
        preview.dependencies.remove.forEach(dep => {
          console.log(`    - ${dep}`);
        });
      }
      
      if (preview.dependencies.update.length > 0) {
        console.log(chalk.blue('  To be updated:'));
        preview.dependencies.update.forEach(dep => {
          console.log(`    ~ ${dep}`);
        });
      }
      
      console.log();
    }
    
    // Show configuration changes
    if (preview.configChanges) {
      console.log(chalk.yellow('Configuration Changes:'));
      preview.configChanges.forEach(change => {
        console.log(`  - ${change}`);
      });
      console.log();
    }
    
    // Show estimated time
    if (preview.estimatedTime) {
      console.log(chalk.cyan(`⏱️  Estimated time: ${preview.estimatedTime}`));
    }
    
    // Show next command
    console.log(chalk.green('\n✨ To apply these changes, run:'));
    if (analysis.hasCode) {
      console.log(`  biokit-builder enhance ${repoUrl}`);
    } else {
      console.log(`  biokit-builder generate ${repoUrl}`);
    }
    
  } catch (error) {
    spinner.fail('Preview failed');
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}