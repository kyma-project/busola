# Check Services with curl in the Kyma Dashboard Terminal

Use the Kyma dashboard terminal to verify that Services running inside your cluster are responding correctly. This is useful when you want to quickly test a Service endpoint without leaving the dashboard or installing any local tools.

## Prerequisites

- You have the terminal feature enabled. For details, see [Kyma Dashboard Terminal](../01-50-terminal.md).

## Procedure

1. In Kyma dashboard, go to **Namespaces** and select `default`.

2. Go to **Workloads** > **Deployments** and choose **Create**.

3. Enter `nginx-test` as the name and `nginx` as the Docker image, then choose **Create**.

4. Wait until the Pod status changes to `Running`.

5. Go to **Discovery and Network** > **Services** and choose **Create**.

6. Enter `nginx-test` as the name. Under **Ports**, set **Port** and **Target Port** both to `80` and enter a port name, for example `http`. Under **Selectors**, add the key `app` and value `nginx-test`, then choose **Create**.

7. In the top navigation bar of Kyma dashboard, choose the **Terminal** icon.

   Wait for the terminal to connect. The status in the terminal header changes from **Connecting…** to **Connected to terminal.**

8. Send a GET request to fetch the response body from the Service:

   ```bash
   curl http://<service-name>.<namespace>.svc.cluster.local:<port>
   ```

   Example:

   ```bash
   curl http://nginx-test.default.svc.cluster.local:80
   ```

9. To see only the HTTP status code (useful for verifying that a Service is up), run:

   ```bash
   curl -o /dev/null -w "%{http_code}\n" http://<service-name>.<namespace>.svc.cluster.local:<port>
   ```

## Result

The terminal displays the HTTP response from the Service. A status code of `200` confirms the Service is reachable and responding correctly. Other common status codes:

| Code  | Meaning                                                        |
| ----- | -------------------------------------------------------------- |
| `200` | OK. The Service is responding correctly.                       |
| `404` | Not Found. The path doesn't exist on the Service.              |
| `503` | Service Unavailable. The Service exists but isn't ready.       |
| `000` | No connection. The Service is unreachable or the URL is wrong. |

## Troubleshooting

**The terminal shows `curl: (6) Could not resolve host`**

The DNS name is incorrect. Double-check the Service name, namespace, and port. To find the correct values, use the Kyma dashboard **Services** view.

**The terminal shows `curl: (7) Failed to connect`**

The Service is reachable but not accepting connections on the given port. Verify the port number in the Kyma dashboard **Services** view.

**The output looks malformed or is missing a newline**

This is a known display issue in the current terminal version. The response content is correct. Only the formatting in the terminal view is affected.
