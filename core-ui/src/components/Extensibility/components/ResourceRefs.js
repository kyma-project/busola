import React from 'react';
import { Link } from 'fundamental-react';

import { useGetTranslation } from '../helpers';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useTranslation } from 'react-i18next';
import { navigateToResource } from 'shared/helpers/universalLinks';

export function ResourceRefs({ value, structure, schema }) {
  const { t, i18n } = useTranslation();
  const { widgetT } = useGetTranslation();
  const resourceType = structure.kind;
  //kyma logpipeline api can return object in place of array wrongly, if only one record is defined
  const sanitizedValue =
    !Array.isArray(value) && value?.name && value?.namespace ? [value] : value;

  const headerRenderer = () => [
    t('common.headers.link'),
    t('common.headers.namespace'),
    t('common.headers.name'),
  ];

  const rowRenderer = ({ name, namespace }) => [
    <Link
      onClick={() =>
        navigateToResource({
          kind: resourceType,
          name,
          namespace,
        })
      }
    >
      {namespace}/{name}
    </Link>,
    namespace,
    name,
  ];

  return (
    <GenericList
      title={widgetT(structure)}
      entries={sanitizedValue || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      i18n={i18n}
      showSearchField={false}
    />
  );
}
ResourceRefs.array = true;
