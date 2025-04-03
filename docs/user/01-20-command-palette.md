# Command Palette

With the Kyma dashboard command palette feature, you can easily navigate through all your dashboard resources, such as workloads, deployments, etc.
You can perform actions such as listing or accessing your namespaces, or preferences, or uploading YAML files.

## Using Command Palette

To access command palette, press `cmd+k` on your keyboard or choose **Quick Navigation**.

![Quick navigation](assets/quick-navi.png)

Enter `?` to see all navigation options and the resources' aliases. For example, if you want to see your namespaces, it's enough to type `ns`.

![Namespaces in navigation](assets/navigation-ns.png)

To see the history of your actions, use the up or down arrow. Pressing the right arrow autocompletes your search.
By entering the resource name and pressing the tab key, you can see the list of all resources available in the given namespace.

![Listing all resources](assets/navigation-resources.png)

With the command palette, you can also switch contexts between your resources. For example, if you're viewing your available Pods on the `default` namespace, and you want to check the Pods on a different one, type `ns/{NAME_OF_YOUR_NAMESPACE}` and choose the first option. It takes you to the list of Pods in the selected namespace.

![Switch context](assets/switch-context.png)
