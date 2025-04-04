# Practical Examples on Problem-Solving Capabilities

In this section, you can check examples of the Kyma Companion responses to possible issues.

## Troubleshooting a Kubernetes Deployment Problem

A user is unable to access their application deployed on Kubernetes.

Solution:

1. Check Pod Status: Use the following command to check if the pods are running:

   ```bash
   kubectl get pods
   ```

2. View Logs: If the Pods are not running, use this command to view the logs for any erros:

   ```bash
   kubectl logs <pod-name>
   ```

3. Describe the Pod: Get detailed information about the pod's status and events with:

   ```bash
   kubectl describe pod <pod-name>

   ```

4. Check Service Configuration: Ensure that the service is correctly configured to route traffic to the pods.

## Creating a Serverless Function in Kyma

A user wants to create a simple "Hello World" Function in Kyma.

Solution:

1. Provide YAML Configuration: Here is the YAML configuration needed to create the function:

   ```yaml
   apiVersion: serverless.kyma-project.io/v1alpha2
    kind: Function
    metadata:
      name: hello-world
      namespace: default
    spec:
      runtime: nodejs20
      source:
        inline:
          source: |
            module.exports = {
              main: async function (event, context) {
                const message = `Hello World from the Kyma Function ${context["function-name"]} running on ${context.runtime}!`;
                console.log(message);
                return message;
              }
            }
      replicas: 1
      resourceConfiguration:
        function:
          profile: XS
   ```

2. Guide Through Deployment: Save the YAML to a file named `hello-world-function.yaml` and apply it using:

   ```bash
   kubectl apply -f hello-world-function.yaml
   ```

3. Verify Deployment: Check the function's status with:

   ```bash
   kubectl get functions -n default
   ```

## Scaling an Application Problem

A user needs to scale their application due to increased traffic.

Solution:

1. Identify the Deployment: Use the following command to find the deployment name:

   ```bash
   kubectl get deployments
   ```

2. Scale the Deployment: Scale the application with:

   ```bash
   kubectl scale deployment <deployment-name> --replicas=<number>
   ```

3. Monitor the Changes: Monitor the pods with:

   ```bash
   kubectl get pods
   ```

## Configuring Ingress in Kubernetes

Solution:

A user wants to expose their application using Ingress

1. Provide Ingress Resource YAML: Here is a sample Ingress resource configuration:

   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: my-ingress
     namespace: default
     annotations:
       nginx.ingress.kubernetes.io/rewrite-target: /
   spec:
     rules:
       - host: myapp.example.com
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: my-service
                   port:
                     number: 80
   ```

2. Apply the Configuration: Appy the Ingress resource using:

   ```bash
   kubectl apply -f <ingress-file.yaml>
   ```

3. Test Access: Test access to the application via the Ingress URL.
