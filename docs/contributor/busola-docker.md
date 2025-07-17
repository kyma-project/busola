# Busola in Docker

## Adding a Cluster Using Kubeconfig ID

1. If you run Busola in Docker, you can mount your kubeconfig as a bind mount for the Busola container. Prepare the **KUBECONFIG** shell environment variable and run the following command:

   ```bash
   docker run --rm -it -p 3001:3001 -v "${KUBECONFIG}":/app/core-ui/kubeconfig/$(basename "${KUBECONFIG}") --pid=host --name busola europe-docker.pkg.dev/kyma-project/prod/busola:latest
   ```

2. When you open Busola in your browser, visit `http://localhost:3001?kubeconfigID={YOUR_KUBECONFIG_FILE_NAME}`. Busola tries to download that file and adds it for your Busola instance.

## Setting Active Environment

1. To use one of the built-in environments in the `busola` image (dev, stage, prod), pass the **ENVIRONMENT** env to the Docker container.

   ```bash
   docker run --rm -it -p 3001:3001 --env ENVIRONMENT="${ENVIRONMENT}" --pid=host --name busola europe-docker.pkg.dev/kyma-project/prod/busola:latest
   ```

2. To use a custom environment configuration, mount it in Docker and pass the **ENVIRONMENT** and **CUSTOM_CONFIG_PATH** env to the Docker container.
   ```bash
   docker run --rm -it -p 3001:3001 -v ${CUSTOM_CONFIG_PATH}:/app/core-ui/environments/ --env ENVIRONMENT="${ENVIRONMENT}" --pid=host --name busola europe-docker.pkg.dev/kyma-project/prod/busola:latest
   ```
