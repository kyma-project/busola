import { ResourceForm } from 'shared/ResourceForm';
import { showYamlTab } from './index';
import { ResourceFormProps } from 'shared/ResourceForm/components/ResourceForm';

export default function HelmReleasesYaml({
  resource: initialHelmRelease,
  ...props
}: ResourceFormProps) {
  return (
    <ResourceForm
      {...props}
      resource={initialHelmRelease}
      initialResource={initialHelmRelease}
      onlyYaml={!!showYamlTab}
    />
  );
}
