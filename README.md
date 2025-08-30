# biokit-builder

A powerful CLI tool that transforms GitHub repositories into production-ready applications using Claude Code.

## Overview

biokit-builder analyzes GitHub repositories containing either:
- **Requirements & Documentation** → Builds complete applications from scratch
- **Existing Code** → Enhances, refactors, and aligns with biokit-design-system  
- **Partial Implementations** → Completes features and improves code quality

## Key Features

- 🔍 **Intelligent Analysis** - Automatically detects repository type and suggests improvements
- 🤖 **Claude Code Integration** - Leverages Claude Code for intelligent code generation
- 🎨 **Design System Migration** - Automatically migrates to biokit-design-system
- 📦 **TypeScript Support** - Adds or improves TypeScript configurations
- ✅ **Quality Improvements** - Adds tests, error handling, and accessibility
- 🚀 **Production Ready** - Generates deployment-ready applications

## Installation

```bash
npm install -g biokit-builder
```

## Usage

### Basic Commands

```bash
# Analyze a repository
biokit-builder analyze https://github.com/user/repo

# Generate or enhance an application
biokit-builder generate https://github.com/user/repo

# Preview changes before applying
biokit-builder preview https://github.com/user/repo

# Enhance existing application with specific improvements
biokit-builder enhance https://github.com/user/repo --improvements select
```

### Command Options

#### `generate` Command
- `-o, --output <dir>` - Output directory (default: ./output)
- `-m, --mode <mode>` - Generation mode: auto|build|enhance (default: auto)
- `-i, --improvements <type>` - Improvements to apply: all|select (default: all)
- `--deploy` - Deploy to Vercel after generation

#### `analyze` Command
- `-f, --format <format>` - Output format: json|markdown (default: markdown)
- `-v, --verbose` - Show detailed analysis

## Repository Formats

### Requirements-Only Repository
```
my-app-requirements/
├── README.md              # Project overview
├── requirements/
│   ├── PRD.md            # Product requirements
│   ├── user-stories.md   # User stories
│   └── features.md       # Feature list
├── design/
│   ├── mockups/          # UI mockups
│   └── user-flows.md     # User flow diagrams
└── biokit.config.json    # Optional configuration
```

### Existing Application
biokit-builder will analyze and enhance:
- React/Next.js applications
- Vue/Nuxt applications  
- Any JavaScript/TypeScript project
- Projects using various UI libraries (Material-UI, Ant Design, etc.)

## How It Works

1. **Analysis Phase**
   - Clones the repository
   - Detects code, documentation, and gaps
   - Identifies improvement opportunities

2. **Generation Phase**
   - Invokes Claude Code with context
   - Applies improvements and migrations
   - Generates missing features

3. **Output Phase**
   - Creates enhanced application
   - Updates dependencies
   - Adds tests and documentation

## Example Workflows

### Building from Requirements
```bash
# Create a repo with requirements
mkdir my-saas-idea
cd my-saas-idea
echo "# SaaS Requirements" > README.md
echo "## Features\n- User authentication\n- Dashboard\n- Billing" > requirements/PRD.md

# Push to GitHub
git init && git add . && git commit -m "Initial requirements"
gh repo create my-saas-idea --push

# Generate application
biokit-builder generate https://github.com/user/my-saas-idea
```

### Enhancing Existing App
```bash
# Analyze existing React app
biokit-builder analyze https://github.com/user/my-react-app

# Apply all improvements
biokit-builder generate https://github.com/user/my-react-app --mode enhance
```

## Improvements Applied

When enhancing existing applications, biokit-builder can:
- ✨ Migrate to biokit-design-system
- 📘 Add TypeScript support
- 🧪 Add test coverage
- ♿ Improve accessibility
- 🛡️ Add error boundaries
- ⚡ Optimize performance
- 🔐 Extract environment variables
- 📝 Add documentation
- 🎨 Improve code quality

## Configuration

Create a `biokit.config.json` in your repository:

```json
{
  "name": "my-app",
  "framework": "nextjs",
  "designSystem": "biokit-design-system",
  "features": {
    "auth": true,
    "database": "supabase",
    "payments": "stripe"
  },
  "deployment": {
    "platform": "vercel"
  }
}
```

## Development

```bash
# Clone the repository
git clone https://github.com/MaximilianLombardo/biokit-builder

# Install dependencies
npm install

# Build packages
npm run build

# Run in development
npm run dev
```

## Architecture

```
biokit-builder/
├── packages/
│   ├── @biokit/cli/        # CLI commands and interface
│   ├── @biokit/analyzer/   # Repository analysis engine
│   └── @biokit/generator/  # Code generation with Claude Code
└── examples/               # Example requirement repositories
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

## License

MIT © [Maximilian Lombardo](https://github.com/MaximilianLombardo)

## Acknowledgments

This project builds upon patterns and insights from:
- [open-lovable](https://github.com/mendableai/open-lovable) by Firecrawl
- [Claudable](https://github.com/opactorai/Claudable) by OPACTOR