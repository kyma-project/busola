# Troubleshooting

> [!TIP]
> To solve most of the problems with Busola development, clear the browser cache or do a hard refresh of the website.

### Connectivity Issues with Busola Against a k3d Cluster

#### Symptom

You are experiencing connectivity problems with Busola in Docker against a k3d cluster.

#### Cause

When the k3d cluster's API Server is exposed on the `0.0.0.0` address on your machine, Busola in Docker interprets `0.0.0.0` as its internal Docker address, routing the requests to the wrong endpoint.

#### Solution

- For Docker Desktop for Mac and Windows, pass `DOCKER_DESKTOP_CLUSTER=true` on dockerized Busola startup. This way, `0.0.0.0` is automatically replaced with `host.docker.internal`, which is resolved to 'routable' IP address of a Docker Desktop virtual machine.

  ```bash
  docker run --rm -it -p 3001:3001 -e DOCKER_DESKTOP_CLUSTER=true --pid=host --name busola europe-docker.pkg.dev/kyma-project/prod/busola:latest
  ```

- For Linux, run Busola with `--net=host` (omitting the `-p` parameter).

  ```bash
  docker run --rm -it --net=host --pid=host --name busola europe-docker.pkg.dev/kyma-project/prod/busola:latest
  ```

### SSL Certificate Issue While Connecting to the API Server

#### Symptom

When you run Busola in Docker on macOS, it can't connect to the k3d cluster. The container log contains the following errors:

```
Error [ERR_TLS_CERT_ALTNAME_INVALID]: Hostname/IP does not match certificate's altnames: Host: host.docker.internal. is not in the cert's altnames: DNS:k3d-k3s-default-server-0, DNS:k3d-k3s-default-serverlb, DNS:kubernetes, DNS:kubernetes.default, DNS:kubernetes.default.svc, DNS:kubernetes.default.svc.cluster.local, DNS:localhost, IP Address:0.0.0.0, IP Address:10.43.0.1, IP Address:127.0.0.1, IP Address:172.28.0.3, IP Address:0:0:0:0:0:0:0:1
```

#### Cause

Busola run in a Docker container with the environment variable `DOCKER_DESKTOP_CLUSTER=true` replaces the IP `0.0.0.0` in the API Server URL with `host.docker.internal`. Kubernetes is not aware of that host name, so its API Server doesn't have it in the SSL certificate, which results in the above error.

Furthermore, this behavior has changed in the recent k3d versions, which is a result of [this fix](https://github.com/k3s-io/k3s/commit/aa76942d0fcb23dd02c25aa7a0dfb96b6b915fa5) for [this security issue](https://github.com/k3s-io/k3s/security/advisories/GHSA-m4hf-6vgr-75r2).

Clusters created by [k3d](https://k3d.io/) use a [listener](https://github.com/rancher/dynamiclistener) that extracts [SNI](https://en.wikipedia.org/wiki/Server_Name_Indication) host names from requests sent to the API server. If a new host name is requested, then the SSL certificate is regenerated, and the new host name is added to the list of Subject Alternative Names. Unfortunately, the security fix limits this mechanism only to the expected host names, like those related to Kubernetes nodes. This makes it useless for the `host.docker.internal` case.

#### Solution

Provide the `host.docker.internal` host name upfront during [k3d](https://k3d.io/) cluster creation:

```
k3d cluster create kyma --k3s-arg '--tls-san=host.docker.internal@server:*'
```

A cluster created in such a way has the `host.docker.internal` set as Subject Alternative Name in the SSL Certificate of the API Server since the very beginning.
