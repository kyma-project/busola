import DynamicGitHubComponent from './DynamicGitHubComponent';

export function Panel({
  value,
  structure,
  schema,
  singleRootResource,
  embedResource,
  ...props
}) {
  const githubUrl =
    'https://raw.githubusercontent.com/user/repo/branch/path/to/your/component.js';

  return (
    <div>
      <DynamicGitHubComponent githubUrl={githubUrl} />
    </div>
  );
}
