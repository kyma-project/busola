import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { EventsList } from 'shared/components/EventsList';

import { CurrentCRDVersion } from './CurrentCRDVersion';
import { RelatedCRDsList } from './RelatedCRDsList';
import CustomResourceDefinitionCreate from './CustomResourceDefinitionCreate';
import { ResourceDescription } from 'resources/CustomResourceDefinitions';
import { CRDSpecification } from './CRDSpecification';

export function CustomResourceDefinitionDetails(props) {
  const { t } = useTranslation();

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
        key="crd-names"
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
        key="events"
        namespace={props?.namespace}
        filter={eventFilter(spec?.names?.kind)}
      />
    );
  };

  const statusConditions = resource => {
    return resource?.status?.conditions?.map(condition => {
      return {
        header: { titleText: condition.type, status: condition.status },
        message: condition.message,
      };
    });
  };

  return (
    <ResourceDetails
      customComponents={[
        CRDSpecification,
        ResourceNames,
        CurrentCRDVersion,
        RelatedCRDsList,
        Events,
      ]}
      description={ResourceDescription}
      createResourceForm={CustomResourceDefinitionCreate}
      statusConditions={statusConditions}
      {...props}
    />
  );
}

export default CustomResourceDefinitionDetails;
