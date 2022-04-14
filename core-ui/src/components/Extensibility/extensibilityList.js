import React from 'react';
import * as jp from 'jsonpath';
import { useGetCRbyPath } from './useGetCRbyPath';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { usePrepareListProps } from 'resources/helpers';
import { ExtensibilityCreate } from './extensibilityCreate';
import { Labels } from 'shared/components/Labels/Labels';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Link } from 'shared/components/Link/Link';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

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
      return (value || []).map(v => jp.value(v, arrayValuePath)).join(', ');
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
  listProps.customColumns = (resource.list.columns || []).map(column => ({
    header: column.header,
    value: resource => {
      const v = listColumnDisplay(jp.value(resource, column.valuePath), column);
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
