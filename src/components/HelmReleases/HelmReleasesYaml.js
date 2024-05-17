import { ResourceForm } from 'shared/ResourceForm';
import { showYamlTab } from './index';

export default function HelmReleasesYaml({
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialHelmRelease,
  resourceUrl,
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
