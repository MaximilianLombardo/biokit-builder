# biokit-builder

> AI-powered application builder that transforms codebases or requirements into production-ready Next.js applications with consistent design and best practices.

## 🚀 Features

- **🤖 AI-Driven Development**: Natural language to production code with Claude/GPT-4
- **📊 Codebase Analysis**: Learn from existing repositories and extract patterns
- **🎨 Design System**: Built-in design consistency across all generated apps
- **⚡ Instant Preview**: Real-time hot-reload preview of generated applications
- **🔄 Multiple Input Modes**:
  - Analyze and adapt existing codebases
  - Build from product requirements (PRD)
  - Hybrid mode combining both approaches
- **☁️ Production Ready**:
  - Supabase backend integration
  - One-click Vercel deployment
  - GitHub repository creation
  - CI/CD pipeline setup
- **🛡️ Best Practices**:
  - TypeScript strict mode
  - Zod validation everywhere
  - Comprehensive error handling
  - Security-first approach
- **🧩 Extensible**: Template system for different app types

## 📋 Prerequisites

- Node.js 18+
- npm/pnpm/yarn
- Git
- Supabase account (for backend)
- Vercel account (for deployment)
- AI API keys (at least one):
  - Anthropic (Claude)
  - OpenAI (GPT-4)
  - Google (Gemini)

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/MaximilianLombardo/biokit-builder.git
cd biokit-builder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run setup script
npm run setup

# Start development server
npm run dev
```

## 🎯 Quick Start

### Option 1: Build from Requirements

```bash
# Create a new project from requirements
npm run create -- --from-requirements ./requirements.md --name my-app

# Or use the web interface
npm run dev
# Navigate to http://localhost:3000
# Input your requirements in natural language
```

### Option 2: Analyze Existing Codebase

```bash
# Analyze and enhance an existing project
npm run analyze -- --repo https://github.com/user/repo --enhance

# Or analyze a local project
npm run analyze -- --path ../my-existing-app --output ./analyzed
```

### Option 3: Use Templates

```bash
# List available templates
npm run template -- --list

# Create from template
npm run template -- --use saas --name my-saas-app
```

## 📁 Project Structure

```
biokit-builder/
├── apps/web/              # Main Next.js application
├── packages/
│   ├── @biokit/ai-core/  # AI generation engine
│   ├── @biokit/design-system/  # Design tokens & components
│   ├── @biokit/db/        # Database abstractions
│   └── @biokit/templates/ # Starter templates
├── scripts/               # Automation scripts
├── config/                # Configuration & prompts
└── docs/                  # Documentation
```

## 🔧 Configuration

### Environment Variables

```env
# AI Providers (need at least one)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Vercel (for deployment)
VERCEL_TOKEN=
VERCEL_TEAM_ID=

# GitHub (for repo creation)
GITHUB_TOKEN=
```

### Design System Configuration

Edit `packages/@biokit/design-system/tokens/index.ts` to customize:
- Color schemes
- Typography
- Spacing
- Animations
- Component styles

## 🚢 Deployment

### Deploy Generated App to Vercel

```bash
# Deploy the generated app
npm run deploy -- --app my-app

# Or use the web interface
# Click "Deploy to Vercel" button in the preview
```

### Self-Host biokit-builder

```bash
# Build for production
npm run build

# Deploy using Docker
docker build -t biokit-builder .
docker run -p 3000:3000 biokit-builder

# Or deploy to Vercel
vercel
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📚 Documentation

- [Product Requirements Document](./docs/PRD.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Design System Guide](./docs/DESIGN_SYSTEM.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

## 📄 License

MIT © [Maximilian Lombardo](https://github.com/MaximilianLombardo)

## 🙏 Acknowledgments

This project builds upon patterns and insights from:
- [open-lovable](https://github.com/mendableai/open-lovable) by Firecrawl
- [Claudable](https://github.com/opactorai/Claudable) by OPACTOR

## 🔗 Links

- [Documentation](https://biokit-builder.dev/docs)
- [Demo](https://demo.biokit-builder.dev)
- [Discord Community](https://discord.gg/biokit)
- [Report Issues](https://github.com/MaximilianLombardo/biokit-builder/issues)