import { ResourceForm } from 'shared/ResourceForm';
import { showYamlTab } from './index';

export default function HelmReleasesYaml({
  resource: initialHelmRelease,
  ...props
}) {
  return (
    <ResourceForm
      {...props}
      resource={initialHelmRelease}
      initialResource={initialHelmRelease}
      onlyYaml={!!showYamlTab}
    />
  );
}
