import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { tempDetails } from 'components/Extensibility/tempRes/tempDetails';
import { translations } from 'components/Extensibility/tempRes/translations';

export const useGetCRbyPath = () => {
  const { customResources = [], namespaceId } = useMicrofrontendContext();

  const resource = customResources.find(el => {
    const { scope, urlPath } = el.general || {};
    const hasCorrectScope =
      (scope?.toLowerCase() === 'namespace') === !!namespaceId;
    if (!hasCorrectScope) return false;

    const crPath = window.location.pathname.replace(
      `/namespaces/${namespaceId}`,
      '',
    );
    return crPath.includes(`/${urlPath}`);
  });

  //resource
  resource.details = tempDetails;
  resource.translations = translations;
  console.log(resource);
  return resource;
};
