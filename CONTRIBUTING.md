
# Contributing to Hyderabad Metro PWA

Thank you for your interest in contributing to the Hyderabad Metro PWA! We welcome contributions from the community and are grateful for your support.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please treat all community members with respect and create a welcoming environment for everyone.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Git
- Basic knowledge of React, Next.js, and TypeScript

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/hyderabad-metro-pwa.git
   cd hyderabad-metro-pwa
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/originalowner/hyderabad-metro-pwa.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Create environment file**:
   ```bash
   cp .env.example .env.local
   ```
6. **Start the development server**:
   ```bash
   npm run dev
   ```

## 📋 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (browser, OS, device)
- **Console errors** if any

### Suggesting Features

Feature requests are welcome! Please provide:

- **Clear description** of the feature
- **Use case** and benefits
- **Possible implementation** approach
- **Mockups or examples** if applicable

### Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

4. **Commit your changes**:
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Testing instructions

## 🎯 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Code formatting is handled by Prettier
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add comments for complex logic

### Component Guidelines

- **Functional Components**: Use functional components with hooks
- **Props Interface**: Define TypeScript interfaces for all props
- **Reusability**: Create reusable components when possible
- **Accessibility**: Follow WCAG guidelines for accessibility

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(metro-map): add station search functionality
fix(route-planner): resolve incorrect fare calculation
docs: update installation instructions
```

### Testing

- **Unit Tests**: Write tests for utility functions
- **Component Tests**: Test React components with React Testing Library
- **E2E Tests**: Add end-to-end tests for critical user flows
- **Coverage**: Maintain good test coverage

### Performance

- **Bundle Size**: Keep bundle size optimized
- **Images**: Optimize images and use appropriate formats
- **Lazy Loading**: Implement lazy loading for heavy components
- **Caching**: Utilize Next.js caching strategies

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable components
│   ├── ui/             # Basic UI components
│   ├── metro-map/      # Metro map specific
│   └── common/         # Common components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript definitions
└── styles/             # Global styles
```

## 🔍 Review Process

All submissions require review. Here's what we look for:

- **Code Quality**: Clean, readable, and maintainable code
- **Functionality**: Features work as expected
- **Testing**: Adequate test coverage
- **Documentation**: Updated documentation if needed
- **Performance**: No significant performance regressions
- **Accessibility**: Meets accessibility standards

## 🐛 Issue Labels

We use labels to categorize issues:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority-high`: High priority issues

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 💬 Getting Help

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Discord/Slack**: [Link to community chat if available]

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special mentions in project updates

Thank you for contributing to making public transportation more accessible in Hyderabad! 🚇
