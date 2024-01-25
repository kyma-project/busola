import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Link } from '@ui5/webcomponents-react';
import { useSetRecoilState } from 'recoil';

import { useGetTranslation } from '../helpers';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useUrl } from 'hooks/useUrl';
import { columnLayoutState } from 'state/columnLayoutAtom';

export function ResourceRefs({ value, structure, schema, disableMargin }) {
  const { t } = useTranslation();
  const { resourceUrl } = useUrl();
  const navigate = useNavigate();

  const setLayoutColumn = useSetRecoilState(columnLayoutState);

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
      style={{ fontWeight: 'bold' }}
      onClick={() => {
        setLayoutColumn({
          midColumn: null,
          endColumn: null,
          layout: 'OneColumn',
        });

        navigate(
          resourceUrl({
            kind: resourceType,
            metadata: {
              name,
              namespace,
            },
          }),
        );
      }}
    >
      {namespace}/{name}
    </Link>,
    namespace,
    name,
  ];

  const sortBy = defaultSort => {
    const { name } = defaultSort;
    return {
      name,
      namespace: (a, b) =>
        a.metadata?.namespace.localeCompare(b.metadata?.namespace),
    };
  };

  return (
    <GenericList
      title={widgetT(structure)}
      entries={sanitizedValue || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      disableMargin={disableMargin}
      searchSettings={{
        showSearchField: false,
      }}
      sortBy={sortBy}
    />
  );
}
ResourceRefs.array = true;
