import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import pluralize from 'pluralize';
import { cloneDeep } from 'lodash';
import { ReadableElapsedTimeFromNow } from 'shared/components/ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import {
  useGetResourceGraphConfig,
  useAddStyle,
} from 'shared/components/ResourceGraph/useGetResourceGraphConfig';
import { useAtomValue } from 'jotai';
import { extensionsAtom } from 'state/navigation/extensionsAtom';
import { prettifyNameSingular } from 'shared/utils/helpers';

interface PrepareResourceUrlProps {
  apiGroup?: string;
  apiVersion?: string;
  resourceType?: string;
}

export const usePrepareResourceUrl = ({
  apiGroup,
  apiVersion,
  resourceType,
}: PrepareResourceUrlProps) => {
  const { namespaceId } = useParams();

  if (!apiVersion || !resourceType) return;

  const api = apiGroup ? `apis/${apiGroup}/${apiVersion}` : `api/${apiVersion}`;
  const resourceUrl = !apiVersion
    ? ''
    : namespaceId && namespaceId !== '-all-'
      ? `/${api}/namespaces/${namespaceId}/${resourceType?.toLowerCase()}`
      : `/${api}/${resourceType?.toLowerCase()}`;
  return resourceUrl;
};

interface PrepareListProps {
  resourceCustomType?: string;
  resourceType?: string;
  resourceI18Key?: string;
  apiGroup?: string;
  apiVersion?: string;
  hasDetailsView?: boolean;
}

export const usePrepareListProps = ({
  resourceCustomType,
  resourceType,
  resourceI18Key,
  apiGroup,
  apiVersion,
  hasDetailsView,
}: PrepareListProps) => {
  const { namespaceId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();

  const api = apiGroup ? `apis/${apiGroup}/${apiVersion}` : `api/${apiVersion}`;
  const resourceUrl = !apiVersion
    ? ''
    : namespaceId && namespaceId !== '-all-'
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

interface PrepareDetailsProps {
  resourceCustomType?: string;
  resourceType?: string;
  resourceI18Key?: string;
  apiGroup?: string;
  apiVersion?: string;
  resourceName?: string;
  namespaceId?: string;
  showYamlTab?: boolean;
}

export const usePrepareDetailsProps = ({
  resourceCustomType,
  resourceType,
  resourceI18Key,
  apiGroup,
  apiVersion,
  resourceName,
  namespaceId,
  showYamlTab,
}: PrepareDetailsProps) => {
  const encodedResourceName = encodeURIComponent(resourceName?.trimEnd());
  const queryParams = new URLSearchParams(window.location.search);
  const { i18n, t } = useTranslation();
  const api = apiGroup ? `apis/${apiGroup}/${apiVersion}` : `api/${apiVersion}`;
  const resourceUrl = !apiVersion
    ? ''
    : resourceName
      ? namespaceId && namespaceId !== '-all-'
        ? `/${api}/namespaces/${namespaceId}/${resourceType?.toLowerCase()}/${encodedResourceName}`
        : `/${api}/${resourceType?.toLowerCase()}/${encodedResourceName}`
      : '';

  const extensions = useAtomValue(extensionsAtom);
  const addStyle = useAddStyle({ styleId: 'graph-styles' });
  const resourceGraphConfig = useGetResourceGraphConfig(extensions, addStyle);

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
    resourceGraphConfig: resourceGraphConfig,
    i18n,
  };
};

interface PrepareCreateProps {
  resourceCustomType?: string;
  resourceType?: string;
  resourceTypeForTitle?: string;
  apiGroup?: string;
  apiVersion?: string;
}

export const usePrepareCreateProps = ({
  resourceCustomType,
  resourceType,
  resourceTypeForTitle,
  apiGroup,
  apiVersion,
}: PrepareCreateProps) => {
  const { namespaceId } = useParams();
  const { i18n, t } = useTranslation();

  const api = apiGroup ? `apis/${apiGroup}/${apiVersion}` : `api/${apiVersion}`;
  const resourceUrl = !apiVersion
    ? ''
    : namespaceId && namespaceId !== '-all-'
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
  conditions: any[],
  keyValue = 'lastTransitionTime',
) => {
  if (!conditions) {
    return EMPTY_TEXT_PLACEHOLDER;
  }

  const clonedConditions = cloneDeep(conditions);

  clonedConditions.sort(
    (a: any, b: any) =>
      new Date(a[keyValue]).getTime() - new Date(b[keyValue]).getTime(),
  );

  return (
    <ReadableElapsedTimeFromNow
      timestamp={clonedConditions[0] ? clonedConditions[0][[keyValue]] : null}
    />
  );
};
