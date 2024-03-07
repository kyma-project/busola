import DynamicGitHubComponent from './DynamicGitHubComponent';

export function CustomCode({
  value,
  structure,
  schema,
  singleRootResource,
  embedResource,
  ...props
}) {
  const githubUrl =
    'https://raw.githubusercontent.com/mrCherry97/busola/custom-code-babel/CustomComponent.js';

  return (
    <div>
      <DynamicGitHubComponent githubUrl={githubUrl} />
    </div>
  );
}
