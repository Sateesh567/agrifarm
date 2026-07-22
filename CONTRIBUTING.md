# Contributing to AgriFarm

Thank you for contributing to **AgriFarm**! We welcome contributions from developers, QA automation engineers, and open-source enthusiasts.

## Branch Strategy

- `main`: Production-ready code. All changes must arrive via Pull Requests.
- `develop`: Integration branch for active development.
- `feature/*`: New features or enhancements.
- `bugfix/*`: Bug fixes.

## Development Workflow

1. **Fork or Clone the Repository**:
   ```bash
   git clone https://github.com/Sateesh567/agrifarm.git
   cd agrifarm
   ```

2. **Set Up Environment Variables**:
   Copy `.env.example` to `.env` in respective module folders:
   ```bash
   cp backend-server/.env.example backend-server/.env
   cp admin-portal/.env.example admin-portal/.env
   ```

3. **Branching & Commit Guidelines**:
   - Use descriptive branch names: `feature/crop-scanner-ui` or `bugfix/jwt-expiry-fix`
   - Follow standard commit messages: `feat: add mandi price filter` or `fix: resolve db connection pool leak`

4. **Running Quality Checks**:
   - Backend: `npm test` inside `backend-server/backend-tests`
   - Android: `./gradlew lintDebug testDebugUnitTest`
   - Admin Portal: `npm run build` inside `admin-portal`

5. **Submitting a Pull Request**:
   - Fill out the PR template completely with test evidence and screenshots.
