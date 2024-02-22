import { useTranslation } from 'react-i18next';
import { isEqual } from 'lodash';
import { Link } from 'react-router-dom';

import { PersistentVolumeClaimStatus } from 'shared/components/PersistentVolumeClaimStatus';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { RelatedPods } from 'shared/components/RelatedPods';
import { Selector } from 'shared/components/Selector/Selector';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useUrl } from 'hooks/useUrl';

import PersistentVolumesList from 'resources/PersistentVolumes/PersistentVolumeList';
import { PersistentVolumeClaimCreate } from './PersistentVolumeClaimCreate';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { ResourceDescription } from 'resources/PersistentVolumeClaims';

const RelatedVolumes = ({ labels }) => {
  const PVParams = {
    hasDetailsView: true,
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
    disableCreate: true,
    disableMargin: true,
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
  const { clusterUrl } = useUrl();

  const { data: storageClasses } = useGetList()(
    '/apis/storage.k8s.io/v1/storageclasses',
  );
  return (
    <UI5Panel
      title={t('persistent-volume-claims.headers.configuration')}
      keyComponent={'pvc-configuration'}
    >
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
              className="bsl-link"
              to={clusterUrl(`persistentvolumes/${pvc.spec?.volumeName}`)}
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
              className="bsl-link"
              to={clusterUrl(`storageclasses/${pvc.spec?.storageClassName}`)}
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
    </UI5Panel>
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

  return (
    <ResourceDetails
      customComponents={[
        PVCConfiguration,
        PVCPods,
        PVCSelectorSpecification,
        Events,
      ]}
      customColumns={customColumns}
      description={ResourceDescription}
      singularName={t('persistent-volume-claims.name_singular')}
      createResourceForm={PersistentVolumeClaimCreate}
      {...props}
    />
  );
}

export default PersistentVolumeClaimDetails;
