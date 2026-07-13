# Generating a Token for Busola Instances

You have an existing cluster remotely connected to Kyma dashboard. At the same time, you want to connect to the cluster from a local Busola (Kyma dashboard) instance that you run using `npm start` or Docker. To enable the local connection, you must create a dedicated ServiceAccount and generate a kubeconfig with a token for it.

> [!NOTE]
> You need an existing cluster connection in Busola to complete these steps. Use your current kubeconfig to connect first, then follow the steps below to create a dedicated token for future logins.

1. In your namespace, go to **Configuration** > **Service Accounts**.

2. Select **Create**, fill in the name (for example, `busola-dev`), and choose **Create**.

3. To grant the ServiceAccount access to cluster resources, in **Cluster Overview**, go to **Configuration** > **Cluster Role Bindings**.

4. Open the `cluster-admin` role binding, and choose **Edit**.

   > [!NOTE]
   > The `cluster-admin` role grants full access to all cluster resources. For local development, this is typically convenient, but in shared or sensitive environments, consider using a more restrictive ClusterRole.

5. In the **Subjects** section, choose **Add Subject**, and in the newly created Subject, provide the following information:
   - **Kind**: `ServiceAccount`
   - **Namespace**: The name of your namespace where you created your Service Account
   - **Service Account Name**: The name of your Service Account (for example, `busola-dev`)

6. Switch to the **View** tab, and select the newly created Subject.

7. Select **Generate TokenRequest**.

8. In the modal that opens, choose the token expiration time (for example, `86400s` for 24 hours) from the dropdown.

   > [!NOTE]
   > The token is deactivated automatically after the expiration time. Choose a duration that fits your development session.

9. Copy or download the generated kubeconfig.

10. Use the kubeconfig to connect to your cluster in the Busola **Connect cluster** wizard.
