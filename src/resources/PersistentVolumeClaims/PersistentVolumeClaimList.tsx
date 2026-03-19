import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { PersistentVolumeClaimStatus } from 'shared/components/PersistentVolumeClaimStatus';
import { Tokens } from 'shared/components/Tokens';

import PersistentVolumeClaimCreate from './PersistentVolumeClaimCreate';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/PersistentVolumeClaims';

interface PersistentVolumeClaimListProps {
  namespace?: string;
  layoutCloseCreateUrl?: string;
  [key: string]: any;
}

export function PersistentVolumeClaimList(
  props: PersistentVolumeClaimListProps,
) {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
      value: ({ status }: { status: any }) => (
        <PersistentVolumeClaimStatus phase={status.phase} />
      ),
    },
    {
      header: t('persistent-volume-claims.headers.storage'),
      value: ({ spec }: { spec: any }) => (
        <p style={{ wordBreak: 'keep-all' }}>
          {spec.resources.requests.storage}
        </p>
      ),
    },
    {
      header: t('persistent-volume-claims.headers.access-modes'),
      value: ({ spec }: { spec: any }) => <Tokens tokens={spec.accessModes} />,
    },
  ];

  return (
    <ResourcesList
      description={ResourceDescription}
      customColumns={customColumns}
      resourceType="persistentVolumeClaims"
      resourceUrl="/api/v1/persistentvolumeclaims"
      {...props}
      createResourceForm={PersistentVolumeClaimCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}

export default PersistentVolumeClaimList;
