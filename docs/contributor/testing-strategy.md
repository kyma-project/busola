# Testing Strategy

Each pull request (PR) to the repository triggers CI/CD jobs that verify the Busola configuration, build and run integration tests.

- `Busola Web Build / build-web-image / Build image` - Checks the ESLint code quality and builds the web Docker image.
- `Busola Build / build-busola-image / Build image` - Checking the ESLint code quality and building the web and backend Docker image.
- `Busola Backend Build / build-backend-image / Build image` - Builds the backend Docker image. The job runs only when changes affect the backend.
- `PR Integration Cluster Tests / run-cluster-test` - Performs integration testing for Busola related to cluster-level functionalities using a k3d cluster.
- `PR Integration Namespace Tests / run-namespace-test` - Performs integration testing for Busola related to namespace-level functionalities using a k3d cluster.
- `PR Kyma Dashboard Integration Tests Dev / run-integration-test` - Performs integration testing for Busola with DEV environement and configuration related to the Kyma functionalities using a k3d cluster with installed Kyma.
- `PR Kyma Dashboard Smoke Tests Stage / run-smoke-test-stage` - Performs smoke testing for Busola with STAGE environement and configuration related to the Kyma functionalities using a k3d cluster with installed Kyma.
- `PR Kyma Dashboard Smoke Tests Prod / run-smoke-test-prod` - Performs smoke testing for Busola with PROD environement and configuration related to the Kyma functionalities using a k3d cluster with installed Kyma.
- `PR Lighthouse Test / run-lighthouse-test` - Performs performance testing for Busola - threshold for accessibility: 80, best-practices: 100.
- `PR Lint Check / run-lint-check` - Performing ESlint and Prettier code quality.
- `PR Unit Tests / run-unit-test` - Performs unit tests of the Busola.
- `Lint Markdown Links PR / markdown-link-check` - Checks links in documentation.
- `CodeQL / Analyze (javascript)` - Code quality static code check.

After the pull request is merged, the following CI/CD jobs are executed:

- `Busola Web Build / build-web-image / Build image` - Performs Busola unit tests and builds the web Docker image.
- `Busola Build / build-busola-image / Build image` - Performs Busola unit tests and builds the web and backend Docker image.
- `Busola Backend Build / build-backend-image / Build image` - Builds the backend Docker image.
- `CodeQL / Analyze (javascript)` - Code quality static code check.

Following CI/CD jobs are executed once a week:

- `Accessibility Tests - run-accessibility-tests` - Performs accessibility tests of the Busola using k3d cluster with Kyma installed.
