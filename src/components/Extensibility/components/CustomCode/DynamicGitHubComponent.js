import React, { useEffect, useState } from 'react';
import { transform } from 'babel-standalone';

const loadAndRenderComponent = async (url, setRenderedComponent) => {
  try {
    const response = await fetch(url);
    const code = await response.text();
    console.log(response, response.text());

    // Transpile the code using babel-standalone
    const transpiledCode = transform(code, {
      presets: ['react', 'env'],
    }).code;

    // Create a function from the transpiled code
    const componentFactory = new Function('React', 'return ' + transpiledCode)(
      React,
    );

    // Render the component
    setRenderedComponent(
      React.createElement(componentFactory.default || componentFactory),
    );
  } catch (error) {
    console.error('Error loading and rendering component:', error);
  }
};

const DynamicGitHubComponent = ({ githubUrl }) => {
  const [renderedComponent, setRenderedComponent] = useState(null);

  useEffect(() => {
    loadAndRenderComponent(githubUrl, setRenderedComponent);
  }, [githubUrl]);

  return <div>{renderedComponent || 'Loading...'}</div>;
};

export default DynamicGitHubComponent;
