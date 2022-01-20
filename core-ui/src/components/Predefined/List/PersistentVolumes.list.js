import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Link as DescLink,
  EMPTY_TEXT_PLACEHOLDER,
  StatusBadge,
} from 'react-shared';
import { Link } from 'fundamental-react';
import { Trans } from 'react-i18next';
import { navigateToResource } from 'shared/helpers/universalLinks';

export const PersistentVolumesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('pv.headers.storage-class'),
      value: pv => pv.spec?.storageClassName || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pv.headers.capacity'),
      value: pv => pv.spec?.capacity?.storage || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pv.headers.claim'),
      value: pv =>
        (
          <Link
            onClick={() =>
              navigateToResource({
                namespace: pv.spec?.claimRef?.namespace,
                name: pv.spec?.claimRef?.name,
                kind: pv.spec?.claimRef?.kind,
              })
            }
          >
            {pv.spec?.claimRef?.name}
          </Link>
        ) || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('common.headers.status'),
      value: pv => (
        <span style={{ wordBreak: 'keep-all' }}>
          <StatusBadge autoResolveType noTooltip>
            {pv.status?.phase || EMPTY_TEXT_PLACEHOLDER}
          </StatusBadge>
        </span>
      ),
    },
  ];

  const description = (
    <Trans i18nKey="pv.description">
      <DescLink
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/storage/persistent-volumes"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      resourceName={t('pv.title')}
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
