import { useTranslation } from 'react-i18next';

import {
  ControlledBy,
  OwnerReferences,
} from 'shared/components/ControlledBy/ControlledBy';
import {
  ResourceDetails,
  ResourceDetailsProps,
} from 'shared/components/ResourceDetails/ResourceDetails';
import SecretData from 'shared/components/Secret/SecretData';
import { HelmReleaseData } from 'components/HelmReleases/HelmReleaseData';
import { CertificateData } from './CertificateData';
import SecretCreate from './SecretCreate';
import { ResourceDescription } from 'resources/Secrets';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

function HelmReleaseDataWrapper(secret: Record<string, any>) {
  if (secret.type !== 'helm.sh/release.v1') {
    return null;
  }

  return <HelmReleaseData key="helm-release-data" releaseSecret={secret} />;
}

export function SecretDetails(
  props: {
    namespace?: string;
    resourceName?: string;
  } & Omit<
    ResourceDetailsProps,
    'customComponents' | 'customColumns' | 'description' | 'createResourceForm'
  >,
) {
  const { t } = useTranslation();
  const Secret = (resource: { data: Record<string, string> }) => (
    <SecretData key="secret-data" secret={resource} />
  );

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: (secret: {
        metadata: { ownerReferences: OwnerReferences; namespace?: string };
      }) => (
        <ControlledBy
          ownerReferences={secret.metadata.ownerReferences}
          namespace={secret.metadata.namespace}
        />
      ),
    },
  ];

  const Events = () => (
    <EventsList
      key="events"
      namespace={props.namespace}
      filter={filterByResource('Secret', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const Configuration = (secret: { type: string }) => (
    <UI5Card
      keyComponent={'secret-configuration'}
      key="secret-configuration"
      title={t('common.headers.configuration')}
      accessibleName={t('common.accessible-name.configuration')}
    >
      <LayoutPanelRow name={t('secrets.headers.type')} value={secret.type} />
    </UI5Card>
  );

  return (
    <ResourceDetails
      customComponents={[
        Configuration,
        Secret,
        CertificateData,
        HelmReleaseDataWrapper,
        Events,
      ]}
      customColumns={customColumns}
      description={ResourceDescription}
      createResourceForm={SecretCreate}
      {...props}
    />
  );
}

export default SecretDetails;
