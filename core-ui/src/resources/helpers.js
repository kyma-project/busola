import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import pluralize from 'pluralize';

import {
  getResourceGraphConfig,
  useAddStyle,
} from 'shared/components/ResourceGraph/getResourceGraphConfig';
import { useRecoilValue } from 'recoil';
import { configurationAtom } from 'state/configurationAtom';
import { extensibilityNodesState } from 'state/navigation/extensibilityNodeAtom';

export const usePrepareListProps = ({
  resourceCustomType,
  resourceType,
  resourceI18Key,
  apiGroup,
  apiVersion,
  hasDetailsView,
}) => {
  const { namespaceId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();

  const api = apiGroup ? `apis/${apiGroup}/${apiVersion}` : `api/${apiVersion}`;
  const resourceUrl = namespaceId
    ? `/${api}/namespaces/${namespaceId}/${resourceType?.toLowerCase()}`
    : `/${api}/${resourceType?.toLowerCase()}`;

  return {
    hasDetailsView,
    readOnly: queryParams.get('readOnly') === 'true',
    resourceUrl,
    resourceType: resourceCustomType || pluralize(resourceType || ''),
    resourceTitle: i18n.exists(resourceI18Key) ? t(resourceI18Key) : '',
    namespace: namespaceId,
    i18n,
  };
};

export const usePrepareDetailsProps = ({
  resourceCustomType,
  resourceType,
  resourceI18Key,
  apiGroup,
  apiVersion,
}) => {
  const { resourceName, namespaceId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();
  const api = apiGroup ? `apis/${apiGroup}/${apiVersion}` : `api/${apiVersion}`;
  const resourceUrl = namespaceId
    ? `/${api}/namespaces/${namespaceId}/${resourceType?.toLowerCase()}/${resourceName}`
    : `/${api}/${resourceType?.toLowerCase()}/${resourceName}`;

  const decodedResourceUrl = decodeURIComponent(resourceUrl);
  const decodedResourceName = decodeURIComponent(resourceName);

  const configuration = useRecoilValue(configurationAtom);
  const features = configuration?.features;
  const customResources = useRecoilValue(extensibilityNodesState);
  const addStyle = useAddStyle({ styleId: 'graph-styles' });

  return {
    resourceUrl: decodedResourceUrl,
    resourceType: resourceCustomType || pluralize(resourceType || ''),
    resourceTitle: i18n.exists(resourceI18Key)
      ? t(resourceI18Key)
      : resourceI18Key,
    resourceName: decodedResourceName,
    namespace: namespaceId,
    readOnly: queryParams.get('readOnly') === 'true',
    resourceGraphConfig: getResourceGraphConfig(
      t,
      features,
      customResources,
      addStyle,
    ),
    i18n,
  };
};
