# Contributing to LogiTrack

## Development Workflow

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: your meaningful commit message"
   ```

3. Push your branch and create a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub from your branch to main

5. Wait for reviews and CI checks to pass

6. Once approved and all checks pass, your PR can be merged

## Branch Naming Convention

- `feature/` - for new features
- `fix/` - for bug fixes
- `docs/` - for documentation changes
- `refactor/` - for code refactoring
- `test/` - for adding tests

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation changes
- `style:` - formatting, missing semicolons, etc.
- `refactor:` - code changes that neither fixes a bug nor adds a feature
- `test:` - adding tests
- `chore:` - updating build tasks, package manager configs, etc.