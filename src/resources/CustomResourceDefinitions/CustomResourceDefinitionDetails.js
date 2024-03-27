import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Tokens } from 'shared/components/Tokens';
import { EventsList } from 'shared/components/EventsList';

import { CurrentCRDVersion } from './CurrentCRDVersion';
import { RelatedCRDsList } from './RelatedCRDsList';
import CustomResourceDefinitionCreate from './CustomResourceDefinitionCreate';
import { ResourceDescription } from 'resources/CustomResourceDefinitions';

export function CustomResourceDefinitionDetails(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('custom-resource-definitions.headers.scope'),
      value: resource => resource.spec.scope,
    },
    {
      header: t('custom-resource-definitions.headers.categories'),
      value: ({ spec }) => <Tokens tokens={spec.names?.categories} />,
    },
  ];

  const ResourceNames = resource => {
    const headerRenderer = () => [
      t('custom-resource-definitions.headers.kind'),
      t('custom-resource-definitions.headers.list-kind'),
      t('custom-resource-definitions.headers.plural'),
      t('custom-resource-definitions.headers.singular'),
      t('custom-resource-definitions.headers.short-names'),
    ];
    const rowRenderer = entry => [
      entry.kind,
      entry.listKind,
      entry.plural,
      entry.singular,
      entry.shortNames?.join(', ') || EMPTY_TEXT_PLACEHOLDER,
    ];
    return (
      <GenericList
        title={t('custom-resource-definitions.subtitle.names')}
        entries={resource.spec.names ? [resource.spec.names] : []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        testid="crd-names"
        searchSettings={{
          showSearchField: false,
        }}
      />
    );
  };

  const Events = ({ spec }) => {
    const eventFilter = kind => e => {
      return kind === e.involvedObject?.kind;
    };

    return (
      <EventsList
        namespace={props?.namespace}
        filter={eventFilter(spec?.names?.kind)}
      />
    );
  };

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[
        ResourceNames,
        CurrentCRDVersion,
        RelatedCRDsList,
        Events,
      ]}
      description={ResourceDescription}
      createResourceForm={CustomResourceDefinitionCreate}
      {...props}
    />
  );
}

export default CustomResourceDefinitionDetails;
