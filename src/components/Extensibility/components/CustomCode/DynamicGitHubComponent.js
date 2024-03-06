import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DynamicGitHubComponent = ({ githubUrl }) => {
  const [renderedComponent, setRenderedComponent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(githubUrl);
        const compiledCode = response.data;

        // Create a basic environment for the code execution
        const environment = {
          React: React,
          // Add any other necessary global variables here
        };

        // Combine the environment and the pre-compiled code
        const script = `(function() { ${compiledCode} })();`;

        // Execute the code using eval
        eval(script);

        // Access the exported component from the environment
        const componentFactory = environment.module.exports;

        // Render the component
        setRenderedComponent(
          React.createElement(componentFactory.default || componentFactory),
        );
      } catch (error) {
        console.error('Error loading and rendering component:', error);
      }
    };

    fetchData();
  }, [githubUrl]);

  return <div>{renderedComponent || 'Loading...'}</div>;
};

export default DynamicGitHubComponent;
