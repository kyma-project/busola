import { ResourceForm } from 'shared/ResourceForm';
import { showYamlTab } from './index';

type EventYamlProps = {
  resource: any;
  [key: string]: any;
};

export default function EventYaml({
  resource: initialEvent,
  ...props
}: EventYamlProps) {
  return (
    <ResourceForm
      {...props}
      resource={initialEvent}
      initialResource={initialEvent}
      onlyYaml={!!showYamlTab}
    />
  );
}
