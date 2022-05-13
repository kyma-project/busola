import React from 'react';
import { getValue, useGetTranslation2 } from './components/helpers';
import { useGetCRbyPath } from './useGetCRbyPath';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ExtensibilityCreate } from './extensibilityCreate';
import { Labels } from 'shared/components/Labels/Labels';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Link } from 'shared/components/Link/Link';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { usePrepareListProps } from 'resources/helpers';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

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
      return (value || []).map(v => getValue(v, arrayValuePath)).join(', ');
    case 'external-link':
      return <Link url={value}>{value}</Link>;
    case 'status':
      return (
        <StatusBadge type={resolveBadgeType(value, columnProps)}>
          {value}
        </StatusBadge>
      );
    default:
      return value;
  }
}

export const ExtensibilityList = () => {
  const resource = useGetCRbyPath();

  const language = useTranslation().i18n.language;
  i18next.removeResourceBundle(language, 'extensibility');
  i18next.addResourceBundle(
    language,
    'extensibility',
    resource?.translations?.['en'],
  );
  const { t } = useTranslation(['extensibility']);
  // const { t: tDefault } = useTranslation(['translation']);

  const listProps = usePrepareListProps(
    resource.navigation.path,
    resource.navigation.label,
  );
  if (resource.navigation.resource.kind) {
    listProps.resourceUrl = listProps.resourceUrl.replace(
      /[a-z0-9-]+\/?$/,
      resource.navigation.resource.kind.toLowerCase(),
    );
  }
  listProps.createFormProps = { resource };
  listProps.resourceName =
    t('labels.name', { defaultValue: resource.navigation.label }) ||
    listProps.resourceName;
  listProps.description = t('labels.description') || '';
  listProps.customColumns = (resource.list.columns || []).map(column => ({
    header: t(column.valuePath, {
      defaultValue: column.valuePath?.split('.')?.pop(),
    }),
    value: resource => {
      const v = listColumnDisplay(getValue(resource, column.valuePath), column);
      if (typeof v === 'undefined' || v === '') {
        return EMPTY_TEXT_PLACEHOLDER;
      } else {
        return v;
      }
    },
  }));
  return (
    <ResourcesList createResourceForm={ExtensibilityCreate} {...listProps} />
  );
};
