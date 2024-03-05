import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { useGetTranslation } from '../helpers';

import { GenericList } from 'shared/components/GenericList/GenericList';
import { Link } from 'shared/components/Link/Link';

export function ResourceRefs({ value, structure, schema, disableMargin }) {
  const { t } = useTranslation();
  const { resourceUrl } = useUrl();

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
      url={resourceUrl({
        kind: resourceType,
        metadata: {
          name,
          namespace,
        },
      })}
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
