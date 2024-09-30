import { useTranslation } from 'react-i18next';
import { isEqual } from 'lodash';

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
import PersistentVolumeClaimCreate from './PersistentVolumeClaimCreate';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { ResourceDescription } from 'resources/PersistentVolumeClaims';
import { Link } from 'shared/components/Link/Link';
import { spacing } from '@ui5/webcomponents-react-base';

import './PersistentVolumeClaim.scss';

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
    <>
      {pvc.spec.resources && (
        <UI5Panel
          title={t('persistent-volume-claims.headers.resources.title')}
          keyComponent={'pvc-resources'}
        >
          <div
            className={
              pvc.spec.resources?.requests && pvc.spec.resources?.limits
                ? 'grid-requests'
                : ''
            }
          >
            {pvc.spec.resources?.requests && (
              <div>
                {Object.entries(pvc.spec.resources?.requests).map(requests => {
                  return (
                    <LayoutPanelRow
                      name={requests[0] + ' Requests'}
                      value={requests[1] || EMPTY_TEXT_PLACEHOLDER}
                      key={requests[0]}
                      capitalize={true}
                    />
                  );
                })}
              </div>
            )}
            {pvc.spec.resources?.limits && (
              <div>
                {Object.entries(pvc.spec.resources?.limits).map(limits => {
                  return (
                    <LayoutPanelRow
                      name={limits[0] + ' Limits'}
                      value={limits[1] || EMPTY_TEXT_PLACEHOLDER}
                      key={limits[0]}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </UI5Panel>
      )}
      <UI5Panel
        title={t('common.headers.specification')}
        keyComponent={'pvc-specification'}
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
                url={clusterUrl(`persistentvolumes/${pvc.spec?.volumeName}`)}
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
                url={clusterUrl(`storageclasses/${pvc.spec?.storageClassName}`)}
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
    </>
  );
};

export function PersistentVolumeClaimDetails(props) {
  const { t } = useTranslation();
  const customStatusColumns = [
    {
      header: t('persistent-volume-claims.headers.access-modes'),
      value: pvc => <Tokens tokens={pvc?.status?.accessModes} />,
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
      statusBadge={pvc =>
        <PersistentVolumeClaimStatus phase={pvc?.status.phase} /> || {
          EMPTY_TEXT_PLACEHOLDER,
        }
      }
      customConditionsComponents={[
        {
          header: t('persistent-volume-claims.headers.capacity'),
          value: pvc =>
            pvc.status.capacity ? (
              Object.entries(pvc?.status?.capacity).map(capacity => {
                return (
                  <LayoutPanelRow
                    name={capacity[0]}
                    value={capacity[1] || EMPTY_TEXT_PLACEHOLDER}
                    key={capacity[0]}
                  />
                );
              })
            ) : (
              <div
                className="content bsl-has-color-text-1"
                style={{
                  ...spacing.sapUiSmallMarginBegin,
                  ...spacing.sapUiSmallMarginBottom,
                }}
              >
                {EMPTY_TEXT_PLACEHOLDER}
              </div>
            ),
        },
      ]}
      customStatusColumns={customStatusColumns}
      customComponents={[
        PVCConfiguration,
        PVCPods,
        PVCSelectorSpecification,
        Events,
      ]}
      description={ResourceDescription}
      singularName={t('persistent-volume-claims.name_singular')}
      createResourceForm={PersistentVolumeClaimCreate}
      {...props}
    />
  );
}

export default PersistentVolumeClaimDetails;
