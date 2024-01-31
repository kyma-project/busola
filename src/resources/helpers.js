import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import pluralize from 'pluralize';

import {
  getResourceGraphConfig,
  useAddStyle,
} from 'shared/components/ResourceGraph/getResourceGraphConfig';
import { useRecoilValue } from 'recoil';
import { extensionsState } from 'state/navigation/extensionsAtom';

export const usePrepareResourceUrl = ({
  apiGroup,
  apiVersion,
  resourceType,
}) => {
  const { namespaceId } = useParams();

  const api = apiGroup ? `apis/${apiGroup}/${apiVersion}` : `api/${apiVersion}`;
  const resourceUrl = namespaceId
    ? `/${api}/namespaces/${namespaceId}/${resourceType?.toLowerCase()}`
    : `/${api}/${resourceType?.toLowerCase()}`;
  return resourceUrl;
};
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
  const resourceUrl =
    namespaceId && namespaceId !== '-all-'
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
  customResourceName = null,
  customNamespaceId = null,
}) => {
  const {
    resourceName: resourceNameFromParams,
    namespaceId: namespaceIdFromParams,
  } = useParams();
  const resourceName = useMemo(
    () => customResourceName ?? resourceNameFromParams,
    [customResourceName, resourceNameFromParams],
  );
  const namespaceId = useMemo(
    () => customNamespaceId ?? namespaceIdFromParams,
    [customNamespaceId, namespaceIdFromParams],
  );

  const encodedResourceName = encodeURIComponent(resourceName);
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();
  const api = apiGroup ? `apis/${apiGroup}/${apiVersion}` : `api/${apiVersion}`;
  const resourceUrl = namespaceId
    ? `/${api}/namespaces/${namespaceId}/${resourceType?.toLowerCase()}/${encodedResourceName}`
    : `/${api}/${resourceType?.toLowerCase()}/${encodedResourceName}`;

  const extensions = useRecoilValue(extensionsState);
  const addStyle = useAddStyle({ styleId: 'graph-styles' });

  return {
    resourceUrl: resourceUrl,
    resourceType: resourceCustomType || pluralize(resourceType || ''),
    resourceTitle: i18n.exists(resourceI18Key)
      ? t(resourceI18Key)
      : resourceI18Key,
    resourceName: resourceName,
    namespace: namespaceId,
    readOnly: queryParams.get('readOnly') === 'true',
    resourceGraphConfig: getResourceGraphConfig(extensions, addStyle),
    i18n,
  };
};
