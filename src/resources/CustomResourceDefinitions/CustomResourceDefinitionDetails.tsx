import { useTranslation } from 'react-i18next';

import {
  ResourceDetails,
  ResourceDetailsProps,
} from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { EventsList } from 'shared/components/EventsList';

import { CurrentCRDVersion } from './CurrentCRDVersion';
import { RelatedCRDsList } from './RelatedCRDsList';
import CustomResourceDefinitionCreate from './CustomResourceDefinitionCreate';
import { ResourceDescription } from 'resources/CustomResourceDefinitions';
import { CRDSpecification } from './CRDSpecification';

type CustomResourceDefinitionDetailsProps = {
  namespace?: string;
} & Omit<
  ResourceDetailsProps,
  | 'namespace'
  | 'customComponents'
  | 'description'
  | 'createResourceForm'
  | 'statusConditions'
>;

export function CustomResourceDefinitionDetails({
  namespace,
  ...props
}: CustomResourceDefinitionDetailsProps) {
  const { t } = useTranslation();

  const ResourceNames = (resource: Record<string, any>) => {
    const headerRenderer = () => [
      t('custom-resource-definitions.headers.kind'),
      t('custom-resource-definitions.headers.list-kind'),
      t('custom-resource-definitions.headers.plural'),
      t('custom-resource-definitions.headers.singular'),
      t('custom-resource-definitions.headers.short-names'),
    ];
    const rowRenderer = (entry: Record<string, any>) => [
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
        accessibleName={t('custom-resource-definitions.accessible-name.names')}
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

  const Events = ({ spec }: { spec?: Record<string, any> }) => {
    const eventFilter =
      (kind: string) => (e: { involvedObject?: { kind?: string } }) => {
        return kind === e.involvedObject?.kind;
      };

    return (
      <EventsList
        key="events"
        namespace={namespace}
        filter={eventFilter(spec?.names?.kind)}
      />
    );
  };

  const statusConditions = (resource: Record<string, any>) => {
    return resource?.status?.conditions?.map(
      (condition: { type: string; status: string; message: string }) => {
        return {
          header: { titleText: condition.type, status: condition.status },
          message: condition.message,
        };
      },
    );
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
      namespace={namespace}
      description={ResourceDescription}
      createResourceForm={CustomResourceDefinitionCreate}
      statusConditions={statusConditions}
      {...props}
    />
  );
}

export default CustomResourceDefinitionDetails;
