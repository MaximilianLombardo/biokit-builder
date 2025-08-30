# Contributing to biokit-builder

Thank you for your interest in contributing to biokit-builder! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct: be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Issues

1. Check if the issue already exists in the [issue tracker](https://github.com/MaximilianLombardo/biokit-builder/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - System information
   - Screenshots if applicable

### Suggesting Features

1. Check the [existing feature requests](https://github.com/MaximilianLombardo/biokit-builder/issues?q=label%3Aenhancement)
2. Open a new issue with the `enhancement` label
3. Describe the feature and its use case
4. Provide examples if possible

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Write/update tests
5. Update documentation
6. Commit with conventional commits: `feat: add amazing feature`
7. Push to your fork
8. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/biokit-builder.git
cd biokit-builder

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

## Development Guidelines

### Code Style

- TypeScript with strict mode
- Prettier for formatting
- ESLint for linting
- Follow existing patterns

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tool changes

### Testing

- Write unit tests for utilities
- Write integration tests for API routes
- Write E2E tests for critical flows
- Maintain > 80% coverage

### Documentation

- Update README for new features
- Add JSDoc comments for public APIs
- Update architecture docs for structural changes
- Include examples in docs

## Project Structure

```
biokit-builder/
├── apps/web/          # Next.js application
├── packages/          # Shared packages
│   ├── @biokit/ai-core/
│   ├── @biokit/design-system/
│   └── @biokit/db/
├── scripts/           # Build/deploy scripts
└── docs/             # Documentation
```

## Review Process

1. **Automated checks**: CI runs tests, linting, type checking
2. **Code review**: Maintainers review for:
   - Code quality
   - Performance
   - Security
   - Documentation
3. **Testing**: Manual testing of features
4. **Merge**: Squash and merge to main

## Release Process

1. Changes merged to `main`
2. Version bump following semver
3. Changelog update
4. Tag and GitHub release
5. NPM package publish (if applicable)

## Getting Help

- 💬 [Discord Community](https://discord.gg/biokit)
- 📧 Email: support@biokit-builder.dev
- 🐛 [Issue Tracker](https://github.com/MaximilianLombardo/biokit-builder/issues)

## Recognition

Contributors are recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes

Thank you for contributing! 🎉