# Testing Strategy

Each pull request (PR) to the repository triggers CI/CD jobs that verify the Busola configuration, build and run integration tests.

- `pre-busola-web-deployment-check` - Checks if the Busola web image in deployment is bumped correctly.
- `pre-busola-backend-deployment-check` - Checks if the Busola backend image in deployment is bumped correctly. The check runs only when PR changes affect the backend.
- `pull-busola-web-build` - Unit tests of Busola checking the ESLint code quality, and building the web Docker image.
- `pull-busola-local-build` - Unit tests of Busola checking the ESLint code quality and building the web and backend Docker image.
- `pull-busola-backend-build` - Builds the backend Docker image. The job runs only when changes affect the backend.
- `pull-busola-integration-cluster-k3d` - Performs integration testing for Busola related to cluster-level functionalities using a k3d cluster.
- `pull-busola-integration-namespace-k3d` - Performs integration testing for Busola related to namespace-level functionalities using a k3d cluster.
- `pull-busola-lighthouse` - Performs performance testing for Busola - threshold for accessibility: 80, best-practices: 100.
- `Lint Markdown Links PR / markdown-link-check` - Checks links in documentation.
- `CodeQL / Analyze (javascript)` - Code quality static code check.

After the pull request is merged, the following CI/CD jobs are executed:

- `post-busola-web-build` - Performs Busola unit tests and builds the web Docker image.
- `post-busola-local-build` - Performs Busola unit tests and builds the web and backend Docker image.
- `post-busola-backend-build` - Builds the backend Docker image.
