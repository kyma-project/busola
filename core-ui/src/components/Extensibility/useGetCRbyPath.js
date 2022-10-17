import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export const useGetCRbyPath = () => {
  const { customResources = [], namespaceId } = useMicrofrontendContext();

  const resource = customResources.find(el => {
    const { scope, urlPath } = el.general || {};
    const hasCorrectScope =
      (scope?.toLowerCase() === 'namespace') === !!namespaceId;
    if (!hasCorrectScope) return false;

    const crPath = window.location.pathname
      .replace(`/namespaces/${namespaceId}`, '')
      .replace('/core-ui', '');

    return crPath.split('/')[1] === urlPath;
  });

  return resource;
};
