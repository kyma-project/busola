import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export const useGetCRbyPath = () => {
  const { customResources = [] } = useMicrofrontendContext();
  const resource = customResources.find(el => {
    const { scope, path } = el.nav || {};
    const hasCorrectPath = window.location.pathname.includes(`/${path}`);
    const hasCorrectScope =
      scope?.toLowerCase().includes('namespace') ===
      window.location.pathname.includes(`namespace`);

    return hasCorrectPath && hasCorrectScope;
  });

  return resource;
};
