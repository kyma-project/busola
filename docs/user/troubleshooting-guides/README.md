# Troubleshooting

The troubleshooting guides aim to identify the most common recurring problems the users face, as well as the most suitable solutions to these problems.

If you can't find a solution, check for open issues in the [Busola GitHub repository](https://github.com/kyma-project/busola/issues). If none of them addresses your problem, create a new one. You can also reach out to our [Slack channel](https://kyma-community.slack.com/) to get direct support from the community.

> [!TIP]
> To solve most of the problems with Busola development, clear the browser cache or do a hard refresh of the website.

## HTTP Status Codes

All HTTP response codes are forwarded directly from the [Kubernetes API](https://kubernetes.io/docs/concepts/overview/kubernetes-api/).
The only exceptions are:

- `400` when the request is invalid. The response contains a reason
- `502` when the backend gets the `503` response code from the Kubernetes API
- `502` when something unexpected happened when forwarding the request. The response contains the request ID, which can help you find the root cause in the backend logs
