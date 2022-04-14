import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { getResourceUrl } from 'shared/helpers';
import { getPerResourceDefs } from 'shared/helpers/getResourceDefs';

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
    resourceName: t(resourceI18Key || '') ? t(resourceI18Key) : resourceI18Key,
    namespace: routerParams.namespaceId,
    i18n,
  };
};

let savedResourceGraph = null;
export const usePrepareDetailsProps = (resourceType, resourceI18Key) => {
  const { resourceName, namespaceId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();
  const resourceUrl = getResourceUrl();

  const decodedResourceUrl = decodeURIComponent(resourceUrl);
  const decodedResourceName = decodeURIComponent(resourceName);

  const context = useMicrofrontendContext();
  if (!savedResourceGraph) {
    savedResourceGraph = getPerResourceDefs('resourceGraphConfig', t, context);
  }

  return {
    resourceUrl: decodedResourceUrl,
    resourceType: resourceType,
    resourceTitle: resourceI18Key ? t(resourceI18Key) : resourceI18Key,
    resourceName: decodedResourceName,
    namespace: namespaceId,
    readOnly: queryParams.get('readOnly') === 'true',
    resourceGraphConfig: savedResourceGraph,
    i18n,
  };
};
