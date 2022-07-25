import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { PersistentVolumeClaimStatus } from 'shared/components/PersistentVolumeClaimStatus';
import { Tokens } from 'shared/components/Tokens';

import { PersistentVolumeClaimCreate } from './PersistentVolumeClaimCreate';

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

  const description = (
    <Trans i18nKey="persistent-volume-claims.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/storage/persistent-volumes/"
      />
    </Trans>
  );
  return (
    <ResourcesList
      description={description}
      customColumns={customColumns}
      createResourceForm={PersistentVolumeClaimCreate}
      {...props}
    />
  );
}
export default PersistentVolumeClaimList;
