import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Labels } from 'shared/components/Labels/Labels';
import { Link } from 'shared/components/Link/Link';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { usePrepareListProps } from 'resources/helpers';

import { useGetCRbyPath } from './useGetCRbyPath';
import { ExtensibilityCreate } from './ExtensibilityCreate';
import {
  getValue,
  TranslationBundleContext,
  useGetTranslation,
} from './helpers';
import { Widget } from './components/Widget';

function resolveBadgeType(value, columnProps) {
  const { successValues, warningValues } = columnProps;
  if ((successValues || []).includes(value)) {
    return 'success';
  } else if ((warningValues || []).includes(value)) {
    return 'warning';
  }
  return undefined;
}

export const ExtensibilityListCore = ({ resMetaData }) => {
  const { t, widgetT } = useGetTranslation();

  const schema = resMetaData?.schema;

  const listProps = usePrepareListProps(
    resMetaData.navigation.path,
    resMetaData.navigation.label,
  );

  if (resMetaData.resource?.kind) {
    listProps.resourceUrl = listProps.resourceUrl.replace(
      /[a-z0-9-]+\/?$/,
      (resMetaData.resource?.kind).toLowerCase(),
    );
  }
  listProps.createFormProps = { resource: resMetaData };
  listProps.resourceName = t('labels.name', {
    defaultValue: resMetaData.navigation.label,
  });
  listProps.description = t('labels.description', {
    defaultValue: '',
  });
  listProps.customColumns = (resMetaData.list || []).map(column => ({
    header: widgetT(column),
    value: resource => (
      <Widget value={resource} structure={column} schema={schema} />
    ),
  }));
  return (
    <ResourcesList createResourceForm={ExtensibilityCreate} {...listProps} />
  );
};

export const ExtensibilityList = () => {
  const resMetaData = useGetCRbyPath();

  return (
    <TranslationBundleContext.Provider value={resMetaData.navigation.path}>
      <ExtensibilityListCore resMetaData={resMetaData} />
    </TranslationBundleContext.Provider>
  );
};
