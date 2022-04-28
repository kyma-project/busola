import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel, Link } from 'fundamental-react';
import { isEqual } from 'lodash';

import { PersistentVolumeClaimStatus } from 'shared/components/PersistentVolumeClaimStatus';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { navigateToClusterResourceDetails } from 'shared/hooks/navigate';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';
import { RelatedPods } from 'shared/components/RelatedPods';
import { Selector } from 'shared/components/Selector/Selector';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import PersistentVolumesList from 'resources/PersistentVolumes/PersistentVolumeList';

import { PersistentVolumeClaimCreate } from './PersistentVolumeClaimCreate';

const RelatedVolumes = ({ labels }) => {
  const PVParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: '/api/v1/persistentvolumes',
    resourceType: 'persistentVolumes',
    filter: pv => {
      if (!pv.metadata?.labels) return false;

      const pvLabels = Object?.entries(pv.metadata?.labels);
      const pvcLabels = Object?.entries(labels);
      return pvcLabels.every(pvcLabel =>
        pvLabels.some(pvLabel => isEqual(pvcLabel, pvLabel)),
      );
    },
    isCompact: true,
    showTitle: true,
  };

  return <PersistentVolumesList {...PVParams} key="pv-list" />;
};

function PVCSelectorSpecification(pvc) {
  const { t } = useTranslation();

  return (
    <Selector
      key="PVCSelector"
      namespace={pvc.metadata.namespace}
      labels={pvc.spec.selector?.matchLabels}
      expressions={pvc.spec.selector?.matchExpressions}
      selector={pvc.spec?.selector}
      message={t('persistent-volume-claims.message.empty-selector')}
      RelatedResources={RelatedVolumes}
    />
  );
}

export const PVCConfiguration = pvc => {
  const { t } = useTranslation();

  const { data: storageClasses } = useGetList()(
    '/apis/storage.k8s.io/v1/storageclasses',
  );
  return (
    <LayoutPanel className="fd-margin--md" key={'pvc-configuration'}>
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('persistent-volume-claims.headers.configuration')}
        />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          key={pvc.spec?.volumeMode}
          name={t('persistent-volume-claims.headers.volume-mode')}
          value={pvc.spec?.volumeMode}
        />
        <LayoutPanelRow
          key={pvc.spec?.accessModes}
          name={t('persistent-volume-claims.headers.access-modes')}
          value={<Tokens tokens={pvc.spec?.accessModes} />}
        />
        <LayoutPanelRow
          key={pvc.spec?.volumeName}
          name={t('persistent-volume-claims.headers.volume-name')}
          value={
            pvc.spec?.volumeName ? (
              <Link
                onClick={() =>
                  navigateToClusterResourceDetails(
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
        <LayoutPanelRow
          key={pvc.spec?.storageClassName}
          name={t('persistent-volume-claims.headers.storage-class-name')}
          value={
            storageClasses?.find(
              ({ metadata }) => metadata.name === pvc.spec?.storageClassName,
            ) ? (
              <Link
                onClick={() =>
                  navigateToClusterResourceDetails(
                    'storageclasses',
                    pvc.spec?.storageClassName,
                  )
                }
              >
                {pvc.spec?.storageClassName}
              </Link>
            ) : (
              <p>
                {pvc.spec?.storageClassName !== ''
                  ? pvc.spec?.storageClassName
                  : EMPTY_TEXT_PLACEHOLDER}
              </p>
            )
          }
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

export function PersistentVolumeClaimDetails(props) {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
      value: ({ status }) =>
        <PersistentVolumeClaimStatus phase={status.phase} /> || {
          EMPTY_TEXT_PLACEHOLDER,
        },
    },
    {
      header: t('persistent-volume-claims.headers.storage'),
      value: ({ spec }) => <p>{spec.resources?.requests?.storage}</p>,
    },
  ];

  const Events = () => (
    <EventsList
      key="events"
      namespace={props.namespace}
      filter={filterByResource('PersistentVolumeClaim', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const PVCPods = pvc => {
    const filterByClaim = ({ spec }) =>
      spec?.volumes?.find(
        volume =>
          volume?.persistentVolumeClaim?.claimName === pvc.metadata.name,
      );

    return (
      <RelatedPods
        filter={filterByClaim}
        key="pvcPods"
        namespace={pvc.metadata.namespace}
      />
    );
  };

  const StatsComponent = pvc => {
    return (
      <StatsPanel
        namespace={pvc.metadata.namespace}
        name={pvc.metadata.name}
        defaultMetric="pvc-usage"
        type="pvc"
      />
    );
  };

  return (
    <ResourceDetails
      customComponents={[
        PVCConfiguration,
        PVCPods,
        PVCSelectorSpecification,
        StatsComponent,
        Events,
      ]}
      customColumns={customColumns}
      singularName={t('persistent-volume-claims.name_singular')}
      createResourceForm={PersistentVolumeClaimCreate}
      {...props}
    />
  );
}

export default PersistentVolumeClaimDetails;
