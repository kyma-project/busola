import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { PersistentVolumeClaimStatus } from 'shared/components/PersistentVolumeClaimStatus';
import { Tokens } from 'shared/components/Tokens';

import { PersistentVolumeClaimCreate } from './PersistentVolumeClaimCreate';
import { Description } from 'shared/components/Description/Description';
import {
  persistentVolumeClaimDocsURL,
  persistentVolumeClaimI18nDescriptionKey,
} from 'resources/PersistentVolumeClaims/index';

export function PersistentVolumeClaimList(props) {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
      value: ({ status }) => (
        <PersistentVolumeClaimStatus phase={status.phase} />
      ),
    },
    {
      header: t('persistent-volume-claims.headers.storage'),
      value: ({ spec }) => ({
        content: spec.resources.requests.storage,
        style: { wordBreak: 'keep-all' },
      }),
    },
    {
      header: t('persistent-volume-claims.headers.access-modes'),
      value: ({ spec }) => <Tokens tokens={spec.accessModes} />,
    },
  ];

  return (
    <ResourcesList
      description={
        <Description
          i18nKey={persistentVolumeClaimI18nDescriptionKey}
          url={persistentVolumeClaimDocsURL}
        />
      }
      customColumns={customColumns}
      {...props}
      createResourceForm={PersistentVolumeClaimCreate}
      emptyListProps={{
        subtitleText: t('persistent-volume-claims.description'),
        url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/',
      }}
    />
  );
}

export default PersistentVolumeClaimList;
