# Testing Strategy

Each pull request to the repository triggers CI/CD jobs that verify the Busola configuration, build and run integration tests.

- `pre-busola-web-deployment-check` - Checks if busola web image in deployment is bumped correctly.
- `pre-busola-backend-deployment-check` - Checks if busola backend image in deployment is bumped correctly. (runs only when changes affect backend)
- `pull-busola-web-build` - Unit tests of busola and build web docker image.
- `pull-busola-local-build` - Unit tests of busola and build web and backend docker image.
- `pull-busola-backend-build` - Build backend docker image. (runs only when changes affect backend)
- `pull-busola-integration-cluster-k3d` - Performs integration testing for the Busola related to cluster level functionallities using k3d cluster.
- `pull-busola-integration-namespace-k3d` - Performs integration testing for the Busola related to namespace level functionallities using k3d cluster.
- `pull-busola-lighthouse` - Performs performance testing for the Busola.
- `Lint Markdown Links PR / markdown-link-check` - Code quality static code check.
- `CodeQL / Analyze (javascript)` - Code quality static code check.

After the pull request is merged, the following CI/CD jobs are executed:

- `post-busola-web-build` - Unit tests of busola and build web docker image.
- `post-busola-local-build` - Unit tests of busola and build web and backend docker image.
- `post-busola-backend-build` - Builds backend docker image.
