import pluralize from 'pluralize';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export const useIsInCurrentNamespace = resource => {
  const { namespaceNodes, namespaceId: namespace } = useMicrofrontendContext();

  const resourceType = pluralize(resource?.kind?.toLowerCase());
  const resourceNamespace = resource?.metadata?.namespace;
  const hasCurrentNamespace =
    namespace && resourceNamespace ? resourceNamespace === namespace : true;
  const isKnownNamespaceWide = !!namespaceNodes?.find(
    n => n.resourceType === resourceType,
  );

  return !(isKnownNamespaceWide && !hasCurrentNamespace);
};
