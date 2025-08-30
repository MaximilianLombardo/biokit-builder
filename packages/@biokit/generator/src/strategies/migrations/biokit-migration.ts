import fs from 'fs-extra';
import path from 'path';
import { globby } from 'globby';
import type { RepoAnalysis } from '@biokit/analyzer';

export async function migrateTooBiokitDesign(
  projectPath: string,
  analysis: RepoAnalysis
): Promise<void> {
  console.log('    Migrating to biokit-design-system...');
  
  // Find all component files
  const componentFiles = await globby([
    '**/*.{jsx,tsx}',
    '!node_modules/**',
    '!.next/**',
    '!dist/**',
    '!build/**',
  ], { cwd: projectPath });
  
  // Map common UI library components to biokit equivalents
  const componentMappings = getComponentMappings(analysis.codeQuality.designSystem);
  
  // Process each file
  for (const file of componentFiles) {
    const filePath = path.join(projectPath, file);
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;
    
    // Replace imports
    for (const [oldImport, newImport] of Object.entries(componentMappings.imports)) {
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(oldImport, 'g'), newImport);
        modified = true;
      }
    }
    
    // Replace component usage
    for (const [oldComponent, newComponent] of Object.entries(componentMappings.components)) {
      if (content.includes(oldComponent)) {
        content = content.replace(new RegExp(`<${oldComponent}`, 'g'), `<${newComponent}`);
        content = content.replace(new RegExp(`</${oldComponent}>`, 'g'), `</${newComponent}>`);
        modified = true;
      }
    }
    
    // Replace prop names
    for (const [oldProp, newProp] of Object.entries(componentMappings.props)) {
      if (content.includes(oldProp)) {
        content = content.replace(new RegExp(`${oldProp}=`, 'g'), `${newProp}=`);
        modified = true;
      }
    }
    
    if (modified) {
      await fs.writeFile(filePath, content);
      console.log(`      Updated: ${file}`);
    }
  }
  
  // Update theme configuration
  await updateThemeConfiguration(projectPath, analysis);
}

function getComponentMappings(currentDesignSystem: string) {
  const mappings: any = {
    imports: {},
    components: {},
    props: {},
  };
  
  switch (currentDesignSystem) {
    case 'material-ui':
      mappings.imports = {
        '@mui/material/Button': 'biokit-design-system/Button',
        '@mui/material/TextField': 'biokit-design-system/Input',
        '@mui/material/Card': 'biokit-design-system/Card',
        '@mui/material/Typography': 'biokit-design-system/Text',
        '@mui/material/Box': 'biokit-design-system/Box',
        '@mui/material/Grid': 'biokit-design-system/Grid',
        '@mui/material/Dialog': 'biokit-design-system/Modal',
        '@mui/material/AppBar': 'biokit-design-system/Header',
      };
      mappings.components = {
        'Button': 'Button',
        'TextField': 'Input',
        'Card': 'Card',
        'Typography': 'Text',
        'Box': 'Box',
        'Grid': 'Grid',
        'Dialog': 'Modal',
        'AppBar': 'Header',
      };
      mappings.props = {
        'variant': 'variant',
        'color': 'color',
        'fullWidth': 'fullWidth',
        'onClick': 'onClick',
        'sx': 'className',
      };
      break;
      
    case 'ant-design':
      mappings.imports = {
        'antd/es/button': 'biokit-design-system/Button',
        'antd/es/input': 'biokit-design-system/Input',
        'antd/es/card': 'biokit-design-system/Card',
        'antd/es/typography': 'biokit-design-system/Text',
        'antd/es/layout': 'biokit-design-system/Layout',
        'antd/es/modal': 'biokit-design-system/Modal',
      };
      mappings.components = {
        'Button': 'Button',
        'Input': 'Input',
        'Card': 'Card',
        'Typography.Text': 'Text',
        'Typography.Title': 'Heading',
        'Layout': 'Layout',
        'Modal': 'Modal',
      };
      mappings.props = {
        'type': 'variant',
        'size': 'size',
        'loading': 'isLoading',
        'danger': 'destructive',
      };
      break;
      
    case 'chakra':
      mappings.imports = {
        '@chakra-ui/react': 'biokit-design-system',
      };
      mappings.components = {
        'Button': 'Button',
        'Input': 'Input',
        'Box': 'Box',
        'Text': 'Text',
        'Heading': 'Heading',
        'Card': 'Card',
        'Modal': 'Modal',
        'Stack': 'Stack',
        'Flex': 'Flex',
      };
      mappings.props = {
        'colorScheme': 'color',
        'isLoading': 'isLoading',
        'isDisabled': 'disabled',
      };
      break;
      
    default:
      // Generic mappings for custom or unknown systems
      mappings.imports = {
        './components/Button': 'biokit-design-system/Button',
        './components/Input': 'biokit-design-system/Input',
        './components/Card': 'biokit-design-system/Card',
      };
  }
  
  return mappings;
}

async function updateThemeConfiguration(projectPath: string, analysis: RepoAnalysis) {
  // Update Tailwind config if it exists
  const tailwindConfigPath = path.join(projectPath, 'tailwind.config.js');
  const tailwindConfigTsPath = path.join(projectPath, 'tailwind.config.ts');
  
  let configPath = '';
  if (await fs.pathExists(tailwindConfigPath)) {
    configPath = tailwindConfigPath;
  } else if (await fs.pathExists(tailwindConfigTsPath)) {
    configPath = tailwindConfigTsPath;
  }
  
  if (configPath) {
    let config = await fs.readFile(configPath, 'utf-8');
    
    // Add biokit-design-system to content paths
    if (!config.includes('biokit-design-system')) {
      config = config.replace(
        'content: [',
        `content: [
    './node_modules/biokit-design-system/**/*.{js,ts,jsx,tsx}',`
      );
      
      await fs.writeFile(configPath, config);
    }
  }
  
  // Remove old theme provider components
  const themeProviders = [
    '**/ThemeProvider.{jsx,tsx}',
    '**/theme.{js,ts}',
    '**/mui-theme.{js,ts}',
    '**/chakra-theme.{js,ts}',
  ];
  
  const oldThemeFiles = await globby(themeProviders, {
    cwd: projectPath,
    ignore: ['node_modules/**'],
  });
  
  for (const file of oldThemeFiles) {
    console.log(`      Removing old theme file: ${file}`);
    await fs.remove(path.join(projectPath, file));
  }
}