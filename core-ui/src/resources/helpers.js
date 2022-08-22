import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { getResourceUrl } from 'shared/helpers';
import {
  getResourceGraphConfig,
  useAddStyle,
} from 'shared/components/ResourceGraph/getResourceGraphConfig';

export const usePrepareListProps = (resourceType, resourceI18Key) => {
  const routerParams = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();
  const resourceUrl = getResourceUrl();
  return {
    hasDetailsView: queryParams.get('hasDetailsView') === 'true',
    readOnly: queryParams.get('readOnly') === 'true',
    resourceUrl,
    resourceType: resourceType,
    resourceTitle: t(resourceI18Key || ''),
    namespace: routerParams.namespaceId,
    i18n,
  };
};

export const usePrepareDetailsProps = (resourceType, resourceI18Key) => {
  const { resourceName, namespaceId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();
  const resourceUrl = getResourceUrl();

  const decodedResourceUrl = decodeURIComponent(resourceUrl);
  const decodedResourceName = decodeURIComponent(resourceName);

  const context = useMicrofrontendContext();
  const addStyle = useAddStyle({ styleId: 'graph-styles' });

  return {
    resourceUrl: decodedResourceUrl,
    resourceType: resourceType,
    resourceTitle: resourceI18Key ? t(resourceI18Key) : resourceI18Key,
    resourceName: decodedResourceName,
    namespace: namespaceId,
    readOnly: queryParams.get('readOnly') === 'true',
    resourceGraphConfig: getResourceGraphConfig(t, context, addStyle),
    i18n,
  };
};
