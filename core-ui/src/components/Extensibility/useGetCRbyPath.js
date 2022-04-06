import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export const useGetCRbyPath = () => {
  const { customResources = [] } = useMicrofrontendContext();
  const resource = customResources.find(el => {
    const needle = new RegExp(`/${el.nav.path}/?[a-z0-9-]*$`);
    return needle.test(window.location.pathname);
  });

  return resource;
};
