# Connectivity Issues with Busola Against a k3d Cluster

## Symptom

You are experiencing connectivity problems with Busola in Docker against a k3d cluster.

## Cause

When the k3d cluster's API Server is exposed on the `0.0.0.0` address on your machine, Busola in Docker interprets `0.0.0.0` as its internal Docker address, routing the requests to the wrong endpoint.

## Solution

- For Docker Desktop on Mac and Windows, pass `DOCKER_DESKTOP_CLUSTER=true` when starting Busola in Docker. This way, `0.0.0.0` is automatically replaced with `host.docker.internal`, which resolves to a routable IP address of the Docker Desktop virtual machine.

  ```bash
  docker run --rm -it -p 3001:3001 -e DOCKER_DESKTOP_CLUSTER=true --pid=host --name busola europe-docker.pkg.dev/kyma-project/prod/busola:latest
  ```

- For Linux, run Busola with `--net=host` and omit the `-p` parameter.

  ```bash
  docker run --rm -it --net=host --pid=host --name busola europe-docker.pkg.dev/kyma-project/prod/busola:latest
  ```
