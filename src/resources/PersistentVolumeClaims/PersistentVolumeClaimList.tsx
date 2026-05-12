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
import { ResourcesListProps } from 'shared/components/ResourcesList/types';

export function PersistentVolumeClaimList(props: ResourcesListProps) {
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
