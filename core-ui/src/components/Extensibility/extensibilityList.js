import React from 'react';
import { getValue } from './components/helpers';
import { useGetCRbyPath } from './useGetCRbyPath';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ExtensibilityCreate } from './extensibilityCreate';
import { Labels } from 'shared/components/Labels/Labels';
import { Link } from 'shared/components/Link/Link';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { usePrepareListProps } from 'resources/helpers';
import { useTranslation } from 'react-i18next';
import { TranslationBundleContext } from './components/helpers';
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

function listColumnDisplay(value, columnProps) {
  const { display, arrayValuePath } = columnProps;
  switch (display) {
    case 'labels':
      return <Labels labels={value} />;
    case 'array':
      if (Array.isArray(value)) {
        return (value || []).map(v => getValue(v, arrayValuePath)).join(', ');
      } else {
        return '';
      }
    case 'external-link':
      return <Link url={value}>{value}</Link>;
    case 'status':
      return (
        <StatusBadge type={resolveBadgeType(value, columnProps)}>
          {value}
        </StatusBadge>
      );
    default:
      return JSON.stringify(value);
  }
}

export const ExtensibilityList = () => {
  const resMetaData = useGetCRbyPath();

  const translationBundle = resMetaData?.navigation?.path || 'extensibility';
  const { t: translate } = useTranslation([translationBundle]); //doesn't always work, add `translationBundle.` at the beggining of a path
  const t = (path, ...props) =>
    translate(`${translationBundle}:${path}`, ...props);

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
    header: t(column.valuePath, {
      defaultValue: column.path?.split('.')?.pop(),
    }),
    value: resource => (
      <Widget value={resource} structure={column} schema={schema} />
    ),
    /*
      const v = listColumnDisplay(getValue(resource, column.valuePath), column);
      if (typeof v === 'undefined' || v === '') {
        return EMPTY_TEXT_PLACEHOLDER;
      } else {
        return v;
      }
      */
  }));
  return (
    <TranslationBundleContext.Provider value={resMetaData.navigation.path}>
      <ResourcesList createResourceForm={ExtensibilityCreate} {...listProps} />
    </TranslationBundleContext.Provider>
  );
};
