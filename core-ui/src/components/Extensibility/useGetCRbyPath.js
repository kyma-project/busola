import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export const useGetCRbyPath = () => {
  const { customResources = [], namespaceId } = useMicrofrontendContext();

  const resource = (customResources || []).find(el => {
    const { scope, path } = el.resource || {};
    const hasCorrectScope =
      !!scope?.toLowerCase().includes('namespace') === !!namespaceId;
    if (!hasCorrectScope) return false;

    const crPath = window.location.pathname.replace(
      `/namespaces/${namespaceId}`,
      '',
    );
    return crPath.includes(`/${path}`);
  });

  return resource;
};
