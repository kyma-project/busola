import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, LayoutPanel } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { navigateToResource } from 'shared/helpers/universalLinks';
import { PersistentVolumeStatus } from './PersistentVolumeStatus';
import { Selector } from 'shared/components/Selector/Selector';

export function PersistentVolumesDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.status'),
      value: ({ status }) => <PersistentVolumeStatus status={status} />,
    },
  ];

  const PvDetails = ({ spec, metadata }) => (
    <div key="persistent-volumes-ref" data-testid="persistent-volumes-ref">
      <LayoutPanel className="fd-margin--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={t('pv.details')} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          <LayoutPanelRow
            name={t('pv.headers.finalizers')}
            value={<Tokens tokens={metadata.finalizers} />}
          />
          <LayoutPanelRow
            name={t('pv.headers.capacity')}
            value={spec.capacity?.storage}
          />
          <LayoutPanelRow
            name={t('pv.headers.mount-options')}
            value={<Tokens tokens={spec.mountOptions} />}
          />
          <LayoutPanelRow
            name={t('pv.headers.access-modes')}
            value={<Tokens tokens={spec.accessModes} />}
          />
          <LayoutPanelRow
            name={t('pv.headers.reclaim-policy')}
            value={spec.persistentVolumeReclaimPolicy}
          />
          <LayoutPanelRow
            name={t('pv.headers.storage-class-name')}
            value={
              (spec?.storageClassName && (
                <Link
                  onClick={() =>
                    navigateToResource({
                      name: spec?.storageClassName,
                      kind: 'StorageClass',
                    })
                  }
                >
                  {spec?.storageClassName}
                </Link>
              )) ||
              EMPTY_TEXT_PLACEHOLDER
            }
          />
          <LayoutPanelRow
            name={t('pv.headers.claim-name')}
            value={
              (spec?.claimRef?.name && (
                <Link
                  onClick={() =>
                    navigateToResource({
                      name: spec?.claimRef?.name,
                      kind: 'PersistentVolumeClaim',
                      namespace: spec?.claimRef?.namespace,
                    })
                  }
                >
                  {spec?.claimRef?.name}
                </Link>
              )) ||
              EMPTY_TEXT_PLACEHOLDER
            }
          />
        </LayoutPanel.Body>
      </LayoutPanel>

      <LayoutPanel className="fd-margin--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={t('pv.nfs')} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          <LayoutPanelRow
            name={t('pv.headers.server')}
            value={spec.nfs?.server || EMPTY_TEXT_PLACEHOLDER}
          />
          <LayoutPanelRow
            name={t('pv.headers.path')}
            value={spec.nfs?.path || EMPTY_TEXT_PLACEHOLDER}
          />
        </LayoutPanel.Body>
      </LayoutPanel>
    </div>
  );

  const Events = () => (
    <EventsList
      filter={filterByResource('PersistentVolume', otherParams.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const MatchSelector = job => (
    <Selector
      namespace={job.metadata.namespace}
      labels={job.spec?.selector?.matchLabels}
      expressions={job.spec?.selector?.matchExpressions}
      selector={job.spec?.selector}
    />
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[PvDetails, Events, MatchSelector]}
      {...otherParams}
    />
  );
}
