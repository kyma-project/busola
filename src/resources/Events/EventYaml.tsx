import { ResourceForm } from 'shared/ResourceForm';
import { showYamlTab } from './index';

export default function EventYaml({ resource: initialEvent, ...props }) {
  return (
    <ResourceForm
      {...props}
      resource={initialEvent}
      initialResource={initialEvent}
      onlyYaml={!!showYamlTab}
    />
  );
}
