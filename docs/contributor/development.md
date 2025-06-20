# Development

## Start All Views

Use the following command to run Busola locally:

```bash
npm start
```

After a while, open the [http://localhost:8080](http://localhost:8080) address in your browser, and provide your kubeconfig in the **Connect cluster** wizard.

Once you started Busola locally, you can begin the development. All modules have the hot-reload feature enabled, therefore, you can edit the code in real-time and see the changes in your browser.

The apps you started run at the following addresses:

- `Busola` - [http://localhost:8080](http://localhost:8080)
- `Backend` - [http://localhost:3001](http://localhost:3001)

### Security Countermeasures

When developing new features in Busola, adhere to the following rules. This will help you to mitigate any security-related threats.

1. Prevent cross-site request forgery (XSRF).

   - Do not store the authentication token as a cookie. Make sure the token is sent to Busola backend as a bearer token.
   - Make sure that the state-changing operations (`POST`, `PUT`, `DELETE`, and `UPDATE` requests) are only triggered upon explicit user interactions, such as form submissions.
   - Keep in mind that UI rendering in response to the user navigating between views is only allowed to trigger read-only operations (`GET` requests) without any data mutations.

2. Protect against cross-site scripting (XSS).

   - It is recommended to use JS frameworks that have built-in XSS prevention mechanisms, such as [ReactJS](https://reactjs.org/docs/introducing-jsx.html#jsx-prevents-injection-attacks), [Vue.js](https://vuejs.org/v2/guide/security.html#What-Vue-Does-to-Protect-You), or [Angular](https://angular.io/guide/security#angulars-cross-site-scripting-security-model).
   - As a rule of thumb, you cannot perceive user input to be 100% safe. Get familiar with prevention mechanisms included in the framework of your choice. Make sure the user input is sanitized before it is embedded in the DOM tree.
   - Get familiar with the most common [XSS bypasses and potential dangers](https://stackoverflow.com/questions/33644499/what-does-it-mean-when-they-say-react-is-xss-protected). Keep them in mind when writing or reviewing the code.
   - Enable the `Content-security-policy` header for all new micro frontends to ensure in-depth XSS prevention. Do not allow for `unsafe-eval` policy.

### Run Tests

For the information on how to run tests and configure them, go to the [`tests`](tests) directory.
