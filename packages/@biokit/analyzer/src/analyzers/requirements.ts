import { globby } from 'globby';
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import type { RequirementsInfo, ExtractedFeature } from '../types';

export interface RequirementsAnalysis extends RequirementsInfo {
  features: ExtractedFeature[];
  userFlows: string[];
  dataModels: any[];
}

export async function analyzeRequirements(repoPath: string): Promise<RequirementsAnalysis> {
  const analysis: RequirementsAnalysis = {
    prd: false,
    userStories: false,
    technicalSpecs: false,
    mockups: false,
    dataModels: false,
    features: [],
    userFlows: [],
    dataModels: [],
  };
  
  // Find requirement documents
  const docPatterns = [
    '**/*.md',
    '**/requirements/**/*',
    '**/docs/**/*',
    '**/design/**/*',
  ];
  
  const files = await globby(docPatterns, {
    cwd: repoPath,
    ignore: ['node_modules/**', '.git/**'],
  });
  
  // Analyze each file
  for (const file of files) {
    const filePath = path.join(repoPath, file);
    const filename = path.basename(file).toLowerCase();
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Check document types
    if (filename.includes('prd') || filename.includes('product-requirement')) {
      analysis.prd = true;
      analysis.features.push(...extractFeaturesFromPRD(content));
    }
    
    if (filename.includes('user-stor') || filename.includes('stories')) {
      analysis.userStories = true;
      analysis.features.push(...extractFeaturesFromUserStories(content));
    }
    
    if (filename.includes('technical') || filename.includes('spec')) {
      analysis.technicalSpecs = true;
    }
    
    if (filename.includes('data-model') || filename.includes('schema')) {
      analysis.dataModels = true;
      analysis.dataModels.push(...extractDataModels(content));
    }
    
    // Extract user flows
    if (filename.includes('flow') || filename.includes('journey')) {
      analysis.userFlows.push(...extractUserFlows(content));
    }
  }
  
  // Check for mockups
  const imagePatterns = [
    '**/mockups/**/*.{png,jpg,jpeg,svg,pdf}',
    '**/design/**/*.{png,jpg,jpeg,svg,pdf,fig,sketch}',
    '**/wireframes/**/*.{png,jpg,jpeg,svg,pdf}',
  ];
  
  const images = await globby(imagePatterns, {
    cwd: repoPath,
    ignore: ['node_modules/**'],
  });
  
  if (images.length > 0) {
    analysis.mockups = true;
  }
  
  // Deduplicate features
  analysis.features = deduplicateFeatures(analysis.features);
  
  return analysis;
}

function extractFeaturesFromPRD(content: string): ExtractedFeature[] {
  const features: ExtractedFeature[] = [];
  const lines = content.split('\n');
  
  let inFeaturesSection = false;
  let currentFeature: ExtractedFeature | null = null;
  
  for (const line of lines) {
    // Check for features section
    if (/^#{1,3}\s*(features|functionality|requirements)/i.test(line)) {
      inFeaturesSection = true;
      continue;
    }
    
    // Check for end of features section
    if (inFeaturesSection && /^#{1,3}\s/.test(line) && 
        !/features|functionality|requirements/i.test(line)) {
      inFeaturesSection = false;
    }
    
    if (inFeaturesSection) {
      // Extract feature items
      if (/^[\-\*]\s+(.+)/.test(line)) {
        const match = line.match(/^[\-\*]\s+(.+)/);
        if (match) {
          const featureName = match[1].trim();
          currentFeature = {
            name: featureName,
            priority: detectPriority(featureName),
          };
          features.push(currentFeature);
        }
      } else if (currentFeature && /^\s{2,}/.test(line)) {
        // Sub-item or description
        currentFeature.description = (currentFeature.description || '') + line.trim() + ' ';
      }
    }
  }
  
  return features;
}

function extractFeaturesFromUserStories(content: string): ExtractedFeature[] {
  const features: ExtractedFeature[] = [];
  
  // Match user story patterns
  const storyPattern = /as\s+a\s+(.+?),?\s+i\s+want\s+(.+?)\s+so\s+that\s+(.+)/gi;
  let match;
  
  while ((match = storyPattern.exec(content)) !== null) {
    features.push({
      name: match[2].trim(),
      description: `As a ${match[1]}, ${match[3]}`,
      priority: 'medium',
    });
  }
  
  // Also look for simpler story formats
  const simplePattern = /^[\-\*]\s*\[?(user story|story|feature)\]?:?\s*(.+)/gmi;
  while ((match = simplePattern.exec(content)) !== null) {
    features.push({
      name: match[2].trim(),
      priority: 'medium',
    });
  }
  
  return features;
}

function extractDataModels(content: string): any[] {
  const models: any[] = [];
  
  // Look for code blocks with schema definitions
  const codeBlockPattern = /```(?:json|typescript|javascript|yaml)?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = codeBlockPattern.exec(content)) !== null) {
    const block = match[1];
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(block);
      if (parsed && typeof parsed === 'object') {
        models.push(parsed);
      }
    } catch {
      // Not JSON, try to extract schema-like patterns
      if (/interface|type|schema|model/i.test(block)) {
        models.push({ raw: block });
      }
    }
  }
  
  // Look for table definitions
  const tablePattern = /\|(.+)\|/g;
  const tables = content.match(tablePattern);
  if (tables && tables.length > 2) {
    // Likely a markdown table describing data model
    models.push({ table: tables });
  }
  
  return models;
}

function extractUserFlows(content: string): string[] {
  const flows: string[] = [];
  const lines = content.split('\n');
  
  let currentFlow = '';
  let inFlowSection = false;
  
  for (const line of lines) {
    if (/^#{1,3}\s*(user flow|flow|journey|process)/i.test(line)) {
      if (currentFlow) {
        flows.push(currentFlow.trim());
      }
      currentFlow = line.replace(/^#+\s*/, '') + '\n';
      inFlowSection = true;
    } else if (inFlowSection) {
      if (/^#{1,3}\s/.test(line)) {
        // New section
        if (currentFlow) {
          flows.push(currentFlow.trim());
        }
        currentFlow = '';
        inFlowSection = false;
      } else {
        currentFlow += line + '\n';
      }
    }
  }
  
  if (currentFlow) {
    flows.push(currentFlow.trim());
  }
  
  return flows;
}

function detectPriority(text: string): 'high' | 'medium' | 'low' {
  const highPriorityKeywords = ['must', 'required', 'critical', 'essential', 'p0', 'p1'];
  const lowPriorityKeywords = ['nice to have', 'optional', 'future', 'later', 'p3', 'p4'];
  
  const lowerText = text.toLowerCase();
  
  if (highPriorityKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'high';
  }
  
  if (lowPriorityKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'low';
  }
  
  return 'medium';
}

function deduplicateFeatures(features: ExtractedFeature[]): ExtractedFeature[] {
  const seen = new Set<string>();
  return features.filter(feature => {
    const key = feature.name.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}