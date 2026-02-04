# Enable TLS in the Backend Service

By default, the communication with the backend Pod is plain HTTP. Even when you use Istio Service Mesh, the last bit of communication between the Istio sidecar and the backend service stays plain HTTP.

If your use case needs TLS all the way into the backend Pod, enable it by providing a TLS certificate to the backend service, setting some environment variables and changing the deployment. Depending on your setup, you might have to use a valid TLS certificate (for example, if you are directly exposing the backend Pod without TLS termination in between). In this case, you might want to use cert-manager to handle your certificates, or provide a valid one here and manage it yourself.

1. Generate a TLS certificate and create a tls secret on your cluster.
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout tls.key -out tls.crt -subj "/CN=foo.bar.com"
   kubectl create secret tls busola-backend-tls --key="tls.key" --cert="tls.crt"
   ```
2. Mount your certificate into the backend Pod by modifying the `resources/backend/deployment.yaml` file as follows:

   ```yaml
   # [...]

   # spec.template.spec.containers[0]
   volumeMounts:
   - mountPath: /var/run/secrets/ssl/
      name: ssl
      readOnly: true

   # [...]

   # spec.template.spec
   volumes:
   - name: ssl
      secret:
      secretName: busola-backend-tls

   # [...]
   ```

3. Set the following environment variables on the backend Pod:

   ```yaml
   # [...]

   # spec.template.spec.containers[0]
   env:
   - name: "BUSOLA_SSL_ENABLED"
      value: "1"
   - name: "BUSOLA_SSL_KEY_FILE"
      value: "/var/run/secrets/ssl/tls.key"
   - name: "BUSOLA_SSL_CRT_FILE"
      value: "/var/run/secrets/ssl/tls.crt"

   # [...]
   ```

4. If you are using Istio Service Mesh, enable the `destinationrule-busola-backend.yaml` resource in `resources/istio/kustomization.yaml`.
5. Install Busola according to [Deploying and Accessing Busola in a Kubernetes Cluster](user/01-40-deploy-access-kubernetes.md).
