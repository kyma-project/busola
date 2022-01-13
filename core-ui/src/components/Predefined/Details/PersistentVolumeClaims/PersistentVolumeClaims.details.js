import React from 'react';
import { useTranslation } from 'react-i18next';
import { PersistentVolumeClaimStatus } from 'shared/components/PersistentVolumeClaimStatus';

import {
  EMPTY_TEXT_PLACEHOLDER,
  GenericList,
  navigateToFixedPathResourceDetails,
  Labels,
} from 'react-shared';
import { LayoutPanel, Link } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { RelatedPods } from './RelatedPods';

const PVCSelectorSpecification = pvc => {
  const { t, i18n } = useTranslation();
  const headerRenderer = () => [
    t('persistent-volume-claims.headers.key'),
    t('persistent-volume-claims.headers.operator'),
    t('persistent-volume-claims.headers.values'),
  ];

  const rowRenderer = ({ key = '', operator = '', values = [] }) => [
    key,
    operator,
    <Tokens tokens={values} />,
  ];
  return (
    <>
      <LayoutPanel className="fd-margin--md" key={'pvc-selector'}>
        <LayoutPanel.Header>
          <LayoutPanel.Head title="Selector" />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          <LayoutPanelRow
            name={t('persistent-volume-claims.headers.match-labels')}
            value={
              <Labels labels={pvc.spec?.selector?.matchLabels} /> ||
              EMPTY_TEXT_PLACEHOLDER
            }
          />
        </LayoutPanel.Body>
      </LayoutPanel>
      <GenericList
        title={t('persistent-volume-claims.headers.match-expressions')}
        entries={pvc.spec?.selector?.matchExpressions || []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        testid="daemon-set-tolerations"
        i18n={i18n}
        showSearchField={false}
      />
    </>
  );
};

export const PVCConfiguration = pvc => {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md" key={'pvc-configuration'}>
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Configuration" />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={t('persistent-volume-claims.headers.volume-mode')}
          value={pvc.spec.volumeMode}
        />
        <LayoutPanelRow
          name={t('persistent-volume-claims.headers.access-modes')}
          value={<Tokens tokens={pvc.spec.accessModes} />}
        />
        <LayoutPanelRow
          name={t('persistent-volume-claims.headers.volume-name')}
          value={
            pvc.spec?.volumeName ? (
              <Link
                onClick={() =>
                  navigateToFixedPathResourceDetails(
                    'persistentvolumes',
                    pvc.spec?.volumeName,
                  )
                }
              >
                {pvc.spec?.volumeName}
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
      header: t('persistent-volume-claims.headers.capacity'),
      value: ({ spec }) => <p>{spec.resources.requests.storage}</p>,
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[
        PVCConfiguration,
        RelatedPods,
        PVCSelectorSpecification,
      ]}
      customColumns={customColumns}
      singularName={t('persistent-volume-claims.name_singular')}
      {...otherParams}
    />
  );
};
