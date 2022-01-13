import React from 'react';
import { useTranslation } from 'react-i18next';
import { PersistentVolumeClaimStatus } from 'shared/components/PersistentVolumeClaimStatus';

import {
  EMPTY_TEXT_PLACEHOLDER,
  GenericList,
  Tokens,
  navigateToFixedPathResourceDetails,
} from 'react-shared';
import { ResourcePods } from './ResourcePods';
import { LayoutPanel, Link } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

const MatchExpressions = resource => {
  const { t, i18n } = useTranslation();
  const headerRenderer = () => [
    t('persistent-volume-claims.headers.key'),
    t('persistent-volume-claims.headers.operator'),
    t('persistent-volume-claims.headers.values'),
  ];

  const { key, operator, values } = resource.spec?.selector
    ?.matchExpressions || { key: '', operator: '', values: [] };
  const rowRenderer = [key, operator, <Tokens tokens={values} />];
  console.log(resource.spec?.selector?.matchExpressions);
  return (
    <GenericList
      title={t('persistent-volume-claims.headers.selector')}
      entries={resource.spec?.selector?.matchExpressions || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      testid="daemon-set-tolerations"
      i18n={i18n}
      showSearchField={false}
    />
  );
};

const PVCConfiguration = resource => {
  const { t } = useTranslation();

  const accessModes = resource.spec.accessModes.join(', ');
  return (
    <LayoutPanel className="fd-margin--md" key={'pvc-configuration'}>
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Configuration" />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={t('persistent-volume-claims.headers.volume-mode')}
          value={resource.spec.volumeMode}
        />
        <LayoutPanelRow
          name={t('persistent-volume-claims.headers.access-modes')}
          value={accessModes}
        />
        <LayoutPanelRow
          name={t('persistent-volume-claims.headers.volume-name')}
          value={
            resource.spec?.volumeName ? (
              <Link
                onClick={() =>
                  navigateToFixedPathResourceDetails(
                    'persistentvolumes',
                    resource.spec?.volumeName,
                  )
                }
              >
                {resource.spec?.volumeName}
              </Link>
            ) : (
              <p>{EMPTY_TEXT_PLACEHOLDER}</p>
            )
          }
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

export const PersistentVolumeClaimsDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('subscription.headers.conditions.status'),
      value: ({ status }) => (
        <PersistentVolumeClaimStatus phase={status.phase} />
      ),
    },
    {
      header: t('persistent-volume-claims.headers.storage-class'),
      value: ({ spec }) => (
        <p>{spec?.storageClassName || EMPTY_TEXT_PLACEHOLDER}</p>
      ),
    },
    {
      header: t('persistent-volume-claims.headers.capacity'), //capacity, storage or size
      value: ({ spec }) => <p>{spec.resources.requests.storage}</p>,
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[ResourcePods, PVCConfiguration]}
      customColumns={customColumns}
      singularName={t('persistent-volume-claims.name_singular')}
      {...otherParams}
    />
  );
};
