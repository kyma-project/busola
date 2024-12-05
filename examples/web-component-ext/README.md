# How to set up your custom busola extension\

1. Modify general.yaml section (change scope to 'namespace' or 'cluster', etc. )
2. Adjust ui.html and script.js files. Remember to keep general.customElement property in sync with the name of the custom element defined in script.js. The script is loaded only only once and general.customElement property is used to determine if the customElement with that name is already defined.
3. Run ./deploy.sh script to deploy the extension to the cluster. It creates a config map with the extension and deploys it to the cluster. You can directly apply the config map with the command: kubectl kustomize . | kubectl apply -n kyma-system -f -
4. run npm start to start the development server.
