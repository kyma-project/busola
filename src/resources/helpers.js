import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import pluralize from 'pluralize';
import { cloneDeep } from 'lodash';
import { ReadableElapsedTimeFromNow } from 'shared/components/ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import {
  getResourceGraphConfig,
  useAddStyle,
} from 'shared/components/ResourceGraph/getResourceGraphConfig';
import { useRecoilValue } from 'recoil';
import { extensionsState } from 'state/navigation/extensionsAtom';
import { prettifyNameSingular } from 'shared/utils/helpers';

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
  resourceName,
  namespaceId,
  showYamlTab,
}) => {
  const encodedResourceName = encodeURIComponent(resourceName);
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();
  const api = apiGroup ? `apis/${apiGroup}/${apiVersion}` : `api/${apiVersion}`;
  const resourceUrl = resourceName
    ? namespaceId
      ? `/${api}/namespaces/${namespaceId}/${resourceType?.toLowerCase()}/${encodedResourceName}`
      : `/${api}/${resourceType?.toLowerCase()}/${encodedResourceName}`
    : '';

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
    showYamlTab,
    resourceGraphConfig: getResourceGraphConfig(extensions, addStyle),
    i18n,
  };
};

export const usePrepareCreateProps = ({
  resourceCustomType,
  resourceType,
  resourceTypeForTitle,
  apiGroup,
  apiVersion,
}) => {
  const { namespaceId } = useParams();
  const { i18n, t } = useTranslation();

  const api = apiGroup ? `apis/${apiGroup}/${apiVersion}` : `api/${apiVersion}`;
  const resourceUrl =
    namespaceId && namespaceId !== '-all-'
      ? `/${api}/namespaces/${namespaceId}/${resourceType?.toLowerCase()}`
      : `/${api}/${resourceType?.toLowerCase()}`;

  return {
    resourceUrl,
    resourceType: resourceCustomType || pluralize(resourceType || ''),
    resourceTitle: `${t(
      'components.resources-list.create',
    )} ${prettifyNameSingular(
      resourceTypeForTitle,
      resourceCustomType ?? resourceType,
    )}`,
    namespace: namespaceId,
    i18n,
  };
};

export const getLastTransitionTime = (
  conditions,
  keyValue = 'lastTransitionTime',
) => {
  if (!conditions) {
    return EMPTY_TEXT_PLACEHOLDER;
  }

  const clonedConditions = cloneDeep(conditions);

  clonedConditions.sort(
    (a, b) => new Date(a[keyValue]).getTime() - new Date(b[keyValue]).getTime(),
  );

  return (
    <ReadableElapsedTimeFromNow
      timestamp={clonedConditions[0] ? clonedConditions[0][[keyValue]] : null}
      valueUnit="days ago"
    />
  );
};
