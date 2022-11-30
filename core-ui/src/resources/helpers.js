import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { getResourceUrl } from 'shared/helpers';
import {
  getResourceGraphConfig,
  useAddStyle,
} from 'shared/components/ResourceGraph/getResourceGraphConfig';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

export const usePrepareListProps = ({
  resourceType,
  resourceI18Key,
  apiGroup,
  apiVersion,
}) => {
  const routerParams = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();
  // const resourceUrl = getResourceUrl();
  //
  console.log('usePrepareListProps::resourceType', resourceType);

  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const api = apiGroup ? `apis/${apiGroup}/${apiVersion}` : `api/${apiVersion}`;
  const resourceUrl = namespaceId
    ? `/${api}/namespaces/${namespaceId}/${resourceType.toLowerCase()}`
    : `/${api}/${resourceType?.toLowerCase()}`;

  // const resourceUrl = /api/v1/namespaces/default/pods

  console.log('usePrepareListProps::resourceUrl', resourceUrl);

  return {
    // hasDetailsView: queryParams.get('hasDetailsView') === 'true',
    hasDetailsView: true, // TODO
    readOnly: queryParams.get('readOnly') === 'true',
    resourceUrl,
    resourceType: resourceType,
    resourceTitle: i18n.exists(resourceI18Key) ? t(resourceI18Key) : '',
    namespace: routerParams.namespaceId,
    i18n,
  };
};

export const usePrepareDetailsProps = ({
  resourceType,
  resourceI18Key,
  apiGroup,
  apiVersion,
}) => {
  const { resourceName, namespaceId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();
  // const resourceUrl = getResourceUrl();
  const api = apiGroup ? `apis/${apiGroup}/${apiVersion}` : `api/${apiVersion}`;
  const resourceUrl = namespaceId
    ? `/${api}/namespaces/${namespaceId}/${resourceType.toLowerCase()}`
    : `/${api}/${resourceType?.toLowerCase()}`;

  const decodedResourceUrl = decodeURIComponent(resourceUrl);
  const decodedResourceName = decodeURIComponent(resourceName);

  const context = useMicrofrontendContext();
  const addStyle = useAddStyle({ styleId: 'graph-styles' });

  return {
    resourceUrl: decodedResourceUrl,
    resourceType: resourceType,
    resourceTitle: i18n.exists(resourceI18Key)
      ? t(resourceI18Key)
      : resourceI18Key,
    resourceName: decodedResourceName,
    namespace: namespaceId,
    readOnly: queryParams.get('readOnly') === 'true',
    resourceGraphConfig: getResourceGraphConfig(t, context, addStyle),
    i18n,
  };
};
