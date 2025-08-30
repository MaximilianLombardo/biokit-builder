#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { generateCommand } from './commands/generate';
import { analyzeCommand } from './commands/analyze';
import { enhanceCommand } from './commands/enhance';
import { previewCommand } from './commands/preview';
import { version } from '../package.json';

const program = new Command();

program
  .name('biokit-builder')
  .description('Transform GitHub repositories into production-ready applications')
  .version(version);

program
  .command('generate <repo-url>')
  .description('Generate or enhance an application from a GitHub repository')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-m, --mode <mode>', 'Generation mode: auto|build|enhance', 'auto')
  .option('-i, --improvements <type>', 'Improvements to apply: all|select', 'all')
  .option('-p, --preserve <items>', 'Items to preserve (comma-separated)', '')
  .option('-s, --style <style>', 'Style strictness: strict|loose', 'strict')
  .option('--deploy', 'Deploy to Vercel after generation', false)
  .option('--no-install', 'Skip dependency installation', false)
  .action(generateCommand);

program
  .command('analyze <repo-url>')
  .description('Analyze a repository and show recommendations')
  .option('-f, --format <format>', 'Output format: json|markdown', 'markdown')
  .option('-v, --verbose', 'Show detailed analysis', false)
  .action(analyzeCommand);

program
  .command('enhance <repo-url>')
  .description('Enhance an existing application with biokit patterns')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-i, --improvements <type>', 'Improvements to apply: all|select', 'select')
  .action(enhanceCommand);

program
  .command('preview <repo-url>')
  .description('Preview changes that would be made')
  .option('--changes', 'Show detailed change list', false)
  .action(previewCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log(chalk.cyan('╔══════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║                                              ║'));
  console.log(chalk.cyan('║    🧬  Welcome to biokit-builder  🧬        ║'));
  console.log(chalk.cyan('║                                              ║'));
  console.log(chalk.cyan('╚══════════════════════════════════════════════╝'));
  console.log();
  program.outputHelp();
}