import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useGetCRbyPath } from '../useGetCRbyPath';

export function Events({
  value,
  structure,
  schemaKeys,
  schema,
  originalResource,
  ...props
}) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const res = useGetCRbyPath();
  console.log('ns', namespace);
  console.log('originalResource', originalResource);
  console.log('res', res);
  console.log('val', value);
  //   console.log('schema', schema);
  //   console.log('structure', structure);
  //   console.log('props', props);

  return (
    <EventsList
      namespace={originalResource?.metadata?.namespace}
      filter={filterByResource(
        originalResource.kind,
        originalResource?.metadata?.name,
      )}
      hideInvolvedObjects={true}
    />
  );
}
