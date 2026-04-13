# Development

## Starting All Views

Use the following command to run Busola locally:

```bash
npm start
```

After a while, open the [http://localhost:8080](http://localhost:8080) address in your browser, and provide your kubeconfig in the **Connect cluster** wizard.

Once you started Busola locally, you can begin the development. All modules have the hot-reload feature enabled, therefore, you can edit the code in real-time and see the changes in your browser.

The apps you started run at the following addresses:

- `Busola` - [http://localhost:8080](http://localhost:8080)
- `Backend` - [http://localhost:3001](http://localhost:3001)

## Generating a Token for Busola Instances

When connecting to a cluster from Busola instance (running via `npm start` or Docker), you must provide a kubeconfig that contains a valid authentication token. The following steps show how to create a dedicated ServiceAccount and generate a kubeconfig with a token for it — entirely from the Busola UI.

> [!NOTE]
> You need an existing cluster connection in Busola to complete these steps. Use your current kubeconfig to connect first, then follow the steps below to create a dedicated token for future logins.

1. In your namespace, go to **Configuration** > **Service Accounts**.

2. Select **Create**, fill in the name (for example, `busola-dev`), and choose **Create**.

3. To grant the ServiceAccount access to cluster resources, in **Cluster Overview** go to **Configuration** > **Cluster Role Bindings**.

4. Open the `cluster-admin` role, and choose **Edit**.

   > [!NOTE]
   > The `cluster-admin` role grants full access to all cluster resources. For local development this is typically convenient, but in shared or sensitive environments consider using a more restrictive ClusterRole.

5. In **Subjects** section, choose **Add Subject**, and in the newly created Subject, provide the following information:
   - **Kind**: Service Account
   - **Namespace**: The name of your namespace where you created your Service Account
   - **Service Account Name**: The name of your Service Account (for example, `busola-dev`)

6. Switch to the **View** tab, and select the newly created Subject.

7. Select **Generate TokenRequest**.

8. In the modal that opens, choose the token expiration time (for example, `86400s` for 24 hours) from the dropdown.

   > [!NOTE]
   > The token is deactivated automatically after the expiration time. Choose a duration that fits your development session.

9. Copy or download the generated kubeconfig.

10. Use the kubeconfig to connect to your cluster in the Busola **Connect cluster** wizard.

### Security Countermeasures

When developing new features in Busola, adhere to the following rules. This will help you to mitigate any security-related threats.

1. Prevent cross-site request forgery (XSRF).
   - Do not store the authentication token as a cookie. Make sure the token is sent to Busola backend as a bearer token.
   - Make sure that the state-changing operations (`POST`, `PUT`, `DELETE`, and `UPDATE` requests) are only triggered upon explicit user interactions, such as form submissions.
   - Keep in mind that UI rendering in response to the user navigating between views is only allowed to trigger read-only operations (`GET` requests) without any data mutations.

2. Protect against cross-site scripting (XSS).
   - It is recommended to use JS frameworks that have built-in XSS prevention mechanisms, such as [ReactJS](https://reactjs.org/docs/introducing-jsx.html#jsx-prevents-injection-attacks), [Vue.js](https://vuejs.org/v2/guide/security.html#What-Vue-Does-to-Protect-You), or [Angular](https://angular.io/guide/security#angulars-cross-site-scripting-security-model).
   - As a rule of thumb, you cannot perceive user input to be 100% safe. Get familiar with prevention mechanisms included in the framework of your choice. Make sure the user input is sanitized before it is embedded in the DOM tree.
   - Get familiar with the most common [XSS bypasses and potential dangers](https://stackoverflow.com/questions/33644499/what-does-it-mean-when-they-say-react-is-xss-protected). Keep them in mind when writing or reviewing the code. <!-- markdown-link-check-disable-line -->
   - Enable the `Content-security-policy` header for all new micro frontends to ensure in-depth XSS prevention. Do not allow for `unsafe-eval` policy.

### Running Tests

For information on how to run and configure tests, go to the [`tests`](../../tests) directory.
