# Deploy Busola With Your Own Configuration

## Prerequisites

- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- [Busola](01-40-deploy-access-kubernetes.md) installed

## Procedure

You can configure Busola to suit your needs. To do so, follow these steps:

1. Go to the `resources/customization` folder and adjust the provided configuration as needed.
2. Set the **NAMESPACE** shell environment variable:

   ```bash
   export NAMESPACE={YOUR_NAMESPACE}
   ```

3. In the root folder of your Busola installation, run the following commands to apply your configuration and restart the dashboard:

   ```bash
   (cd resources/customization && kustomize build . | kubectl apply -f-) --namespace "${NAMESPACE}"
   kubectl rollout restart deployment busola --namespace "${NAMESPACE}"
   ```

4. To verify that your configuration has been applied, go to your Cluster Overview, select the Feedback button, and choose **Give Feedback**. The link you provided in `resources/customization/config/config.yaml` should open. By default it's `kyma-project.io`.

In addition, select your namespace, and check if your extensions are loaded properly. For example, **Kustomized Horizontal Pod Autoscalers** in the **Discovery and Network** section, as provided in `resources/customization/extensions/extensions.yaml`.

## Related Information

- [Extensibility](01-30-extensibility.md)
- [Busola Configuration](technical-reference/configuration.md)
- [Feature Flags](technical-reference/feature-flags.md)
