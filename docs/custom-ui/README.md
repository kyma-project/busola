# Custom UI

## What we want to do?

Allow to display UI hosted in the service deployed in the same Kubernetes cluster the user is connected to.

## How it works?

Custom UI needs to be deployed in a service. Based on the configuration (details in progress) Busola will take all the custom UIs and list them in navigation (similar to extensions). In this vie the external application will be embed via iframe (in content part of the Busola) and authenticate by cookies. All the calls from custom UI should go through Busola backend to ensure user permissions are taken into account.

## Architecture graph

![Architecture graph](./assets/architecture-diagram.svg)

## What to remember?

- UI can be crated in any technology - but please don’t use deprecated technologies (like ‘create-react-app’)
- Application should have relative path (can be set by adding in package.json "homepage": “.”,)
- Call to backend from UI should be made via Busola Backend `${busola-domain}/backend/api/v1/namespaces/${namespace}/services/${service-name}:{$port}/proxy/api/${url}`. We will try to pass a `${baseURL}` to front-end so the url will look like this `${baseURL}/proxy/api/${url}`
- Application will be displayed in content part of the Busola, so no navigation or header should be rendered
- Background and styles should match Busola and product standards (UI5)
- One page one application - we recommend creating separated applications for your views, because you won't be able to show your our navigation
