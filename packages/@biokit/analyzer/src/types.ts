export type RepoType = 
  | 'requirements-only'     // Just docs, no code
  | 'partial-implementation' // Some code + requirements
  | 'existing-app'          // Full app needing enhancement
  | 'hybrid';               // Mix of implemented and planned features

export interface CodeQuality {
  hasTests: boolean;
  hasTypescript: boolean;
  designSystem: 'biokit' | 'material-ui' | 'ant-design' | 'chakra' | 'tailwind' | 'other' | 'none';
  framework: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  metrics?: {
    linesOfCode: number;
    fileCount: number;
    testCoverage: number;
    componentCount: number;
  };
}

export interface RequirementsInfo {
  prd: boolean;
  userStories: boolean;
  technicalSpecs: boolean;
  mockups: boolean;
  dataModels: boolean;
}

export interface ExtractedFeature {
  name: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'planned' | 'in-progress' | 'completed';
}

export interface RepoAnalysis {
  type: RepoType;
  repoUrl: string;
  localPath?: string;
  hasCode: boolean;
  hasRequirements: boolean;
  codeQuality: CodeQuality;
  requirements: RequirementsInfo;
  improvements: string[];
  extractedFeatures?: ExtractedFeature[];
  fileTree?: string;
  config?: BiokitConfig;
}

export interface BiokitConfig {
  name: string;
  framework: string;
  designSystem: string;
  features: {
    auth?: boolean;
    database?: string;
    payments?: string;
    analytics?: boolean;
  };
  deployment?: {
    platform: string;
    autoDeploy: boolean;
  };
}

export interface FileInfo {
  path: string;
  type: 'component' | 'page' | 'api' | 'style' | 'config' | 'test' | 'doc' | 'other';
  language: string;
  size: number;
}

export interface ImprovementRecommendation {
  key: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedEffort: 'small' | 'medium' | 'large';
  category: 'design-system' | 'code-quality' | 'performance' | 'testing' | 'accessibility' | 'structure';
}