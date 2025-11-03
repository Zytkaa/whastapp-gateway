# Contributing to WhatsApp Gateway

Thank you for your interest in contributing to the WhatsApp Gateway project! This document provides guidelines for contributing.

## Getting Started

1. **Fork the repository**

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/whastapp-gateway.git
   cd whastapp-gateway
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up your environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, maintainable code
   - Follow the existing code style
   - Add comments where necessary

3. **Test your changes**
   - Ensure the application builds: `npm run build`
   - Test API endpoints manually
   - Check logs for errors

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Provide a clear description of your changes

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add webhook support for incoming messages
fix: resolve session deduplication race condition
docs: update API documentation for message endpoints
```

## Code Style

### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Provide proper type definitions
- Avoid using `any` where possible

### Naming Conventions
- **Files**: kebab-case (e.g., `auth.service.ts`)
- **Classes**: PascalCase (e.g., `AuthService`)
- **Functions/Variables**: camelCase (e.g., `createSession`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Code Organization
```typescript
// 1. Imports
import { Express } from 'express';
import logger from '../config/logger';

// 2. Types/Interfaces
interface UserData {
  id: string;
  email: string;
}

// 3. Constants
const MAX_ATTEMPTS = 3;

// 4. Main code
class AuthService {
  // ...
}

// 5. Exports
export default new AuthService();
```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Express middleware
├── models/         # Database schemas
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Adding New Features

### 1. New API Endpoint

1. Define the route in `src/routes/`
2. Create controller in `src/controllers/`
3. Add business logic to `src/services/`
4. Update Swagger documentation
5. Update API_GUIDE.md

### 2. New Database Table

1. Add schema to `src/models/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:push` to apply changes
4. Update related services

### 3. New Middleware

1. Create file in `src/middleware/`
2. Export the middleware function
3. Add to routes or app as needed
4. Document usage

## Testing

Currently, the project doesn't have automated tests. Contributions to add testing infrastructure are welcome!

When testing manually:
1. Test all affected endpoints
2. Check error handling
3. Verify logging
4. Test edge cases
5. Check database updates

## Documentation

Good documentation is crucial. When contributing:

### Code Documentation
- Add JSDoc comments for functions
- Document complex logic
- Explain non-obvious code

### API Documentation
- Update Swagger annotations
- Update API_GUIDE.md with examples
- Document new endpoints

### README Updates
- Keep README.md current
- Update feature list
- Add new dependencies to prerequisites

## Pull Request Guidelines

### Before Submitting
- [ ] Code builds without errors
- [ ] All endpoints tested manually
- [ ] No unnecessary console.logs
- [ ] Documentation updated
- [ ] Commit messages follow convention

### PR Description Should Include
- What changes were made
- Why the changes were needed
- How to test the changes
- Screenshots (if UI changes)
- Related issues

### PR Review Process
1. Maintainers will review your PR
2. Address any feedback
3. Once approved, PR will be merged

## Reporting Issues

### Bug Reports
Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)
- Logs/error messages

### Feature Requests
Include:
- Clear description of the feature
- Use case/motivation
- Proposed implementation (optional)
- Examples from other projects (if applicable)

## Security Issues

**Do not** open public issues for security vulnerabilities.

Instead:
1. Email the maintainers directly
2. Provide detailed information
3. Wait for response before disclosure

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive criticism
- Accept responsibility for mistakes

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Spam or self-promotion

## Questions?

- Check the README and guides first
- Search existing issues
- Ask in discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC).

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- Project documentation (for major features)

Thank you for contributing to WhatsApp Gateway! 🎉
