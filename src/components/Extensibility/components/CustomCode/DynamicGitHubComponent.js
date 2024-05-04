// Your React component
import React, { useEffect, useState } from 'react';
import path from 'path';
import webpack from 'webpack';
import fs from 'fs';

const DynamicGitHubComponent = ({ githubUrl }) => {
  const [renderedComponent, setRenderedComponent] = useState(null);

  useEffect(() => {
    const fetchAndRenderComponent = async () => {
      try {
        // Dynamically generate Webpack configuration
        const webpackConfig = {
          mode: 'production',
          entry: githubUrl,
          output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
            libraryTarget: 'commonjs2',
          },
          module: {
            rules: [
              {
                test: /\.js$/,
                use: 'webpack-http-loader',
              },
            ],
          },
        };

        // Run Webpack
        const outputPath = webpackConfig.output.path;
        await webpack(webpackConfig);

        // Determine whether the component is using CommonJS or ES6 module syntax
        const isCommonJS = fs.existsSync(`${outputPath}/bundle.js`); // Assuming bundle.js for CommonJS

        // Dynamically import and render the component
        const { default: componentFactory } = await import(
          `./${outputPath}/bundle${isCommonJS ? '' : '.mjs'}`
        );

        // Update the state with the rendered component
        setRenderedComponent(React.createElement(componentFactory));
      } catch (error) {
        console.error(
          `Error loading and rendering component from URL ${githubUrl}:`,
          error,
        );
      }
    };

    fetchAndRenderComponent();
  }, [githubUrl]);

  return <div>{renderedComponent || <div>Loading...</div>}</div>;
};

export default DynamicGitHubComponent;
