# Addons Configuration UI

## Overview

This project contains an application with the Addons Configuration UI page for the Kyma Busola. The view enables you to list Namespace-scoped and cluster-wide addons configurations.

The [create-react-app](https://create-react-app.dev/) project provides the structure for this application. Read the project's [documentation](https://create-react-app.dev/docs/available-scripts) for more information.

## Installation

To install dependencies, run the `npm install` command.

## Usage

This section describes how to build the application, and how to build and publish the image.

### Build the application

Use the following command to build the application in the production environment, in the `build` folder:

```bash
npm run build
```

The command allows you to correctly bundle React in the production mode, and optimize the build for the best performance.

The build is minified and the filenames include hashes.

### Build and run the Docker image

1. Run the following command to build and run the Docker image:

    ``` bash
    sh ../scripts/build-docker-image.sh addons-ui
    docker run --rm -p 8004:80 docs-ui
    ```

2. Open `http://localhost:8004` in a browser.

## Development

Run the `npm start` command to start the application in the development mode.
Open the `[http://localhost:8004](http://localhost:8004)` link to view it in the browser.

The page reloads if you make edits.
If lint errors appear, the console displays them.

## Test the application

Run the `npm test` command to launch the test runner in the interactive watch mode.

See the **Running Tests** section in the Create React App [documentation](https://create-react-app.dev/docs/running-tests) for more information.
