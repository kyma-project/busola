# SSL Certificate Issue While Connecting to the API Server

## Symptom

When you run Busola in Docker on macOS, it can't connect to the k3d cluster. The container log contains the following error:

```bash
Error [ERR_TLS_CERT_ALTNAME_INVALID]: Hostname/IP does not match certificate's altnames: Host: host.docker.internal. is not in the cert's altnames: DNS:k3d-k3s-default-server-0, DNS:k3d-k3s-default-serverlb, DNS:kubernetes, DNS:kubernetes.default, DNS:kubernetes.default.svc, DNS:kubernetes.default.svc.cluster.local, DNS:localhost, IP Address:0.0.0.0, IP Address:10.43.0.1, IP Address:127.0.0.1, IP Address:172.28.0.3, IP Address:0:0:0:0:0:0:0:1
```

## Cause

When Busola is run in a Docker container with the environment variable `DOCKER_DESKTOP_CLUSTER=true`, it replaces the IP `0.0.0.0` in the API Server URL with `host.docker.internal`. Kubernetes is not aware of that hostname, so its API Server doesn't have it in the SSL certificate, which results in the error.

Furthermore, this behavior has changed in the recent k3d versions, which is a result of [this fix](https://github.com/k3s-io/k3s/commit/aa76942d0fcb23dd02c25aa7a0dfb96b6b915fa5) for [this security issue](https://github.com/k3s-io/k3s/security/advisories/GHSA-m4hf-6vgr-75r2).

Clusters created by [k3d](https://k3d.io/) use a [listener](https://github.com/rancher/dynamiclistener) that extracts [SNI](https://en.wikipedia.org/wiki/Server_Name_Indication) hostnames from requests sent to the API server. If a new hostname is requested, then the SSL certificate is regenerated, and the new hostname is added to the list of Subject Alternative Names. However, the security fix limits this mechanism only to the expected hostnames, like those related to Kubernetes nodes. This makes it unusable for the `host.docker.internal` case.

## Solution

Provide the `host.docker.internal` hostname upfront during [k3d](https://k3d.io/) cluster creation:

```bash
k3d cluster create kyma --k3s-arg '--tls-san=host.docker.internal@server:*'
```

A cluster created in this way has `host.docker.internal` set as a Subject Alternative Name in the API Server's SSL certificate from the very beginning.
