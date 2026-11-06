import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { isEqual, upperFirst } from 'lodash';

import { PersistentVolumeClaimStatus } from 'shared/components/PersistentVolumeClaimStatus';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { FormGroup } from '@ui5/webcomponents-react';
import { Tokens } from 'shared/components/Tokens';
import { RelatedPods } from 'shared/components/RelatedPods';
import { Selector } from 'shared/components/Selector/Selector';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useUrl } from 'hooks/useUrl';

import PersistentVolumesList from 'resources/PersistentVolumes/PersistentVolumeList';
import PersistentVolumeClaimCreate from './PersistentVolumeClaimCreate';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import {
  PersistentVolumeClaim,
  ResourceDescription,
  resourceType,
} from 'resources/PersistentVolumeClaims';
import { Link } from 'shared/components/Link/Link';

import { PersistentVolumeType } from 'resources/PersistentVolumes';

type RelatedVolumesProps = {
  labels: Record<string, string>;
};

type PersistentVolumeClaimDetailsProps = {
  namespace: string;
  resourceName: string;
};

const RelatedVolumes = ({ labels }: RelatedVolumesProps) => {
  const PVParams = {
    hasDetailsView: true,
    resourceUrl: '/api/v1/persistentvolumes',
    resourceType: 'persistentVolumes',
    filter: (pv: PersistentVolumeType) => {
      if (!pv.metadata?.labels) return false;

      const pvLabels = Object?.entries(pv.metadata?.labels);
      const pvcLabels = Object?.entries(labels);
      return pvcLabels.every((pvcLabel) =>
        pvLabels.some((pvLabel) => isEqual(pvcLabel, pvLabel)),
      );
    },
    isCompact: true,
    showTitle: true,
    disableCreate: true,
  };

  return <PersistentVolumesList {...PVParams} key="pv-list" />;
};

function PVCSelectorSpecification(pvc: PersistentVolumeClaim) {
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

export const PVCConfiguration = (pvc: PersistentVolumeClaim) => {
  const { t } = useTranslation();
  const { clusterUrl } = useUrl();

  const { data: storageClasses } = useGetList()(
    '/apis/storage.k8s.io/v1/storageclasses',
  ) as { data: any[] | null };
  return (
    <Fragment key="pvc-configuration">
      {pvc.spec.resources && (
        <UI5Card
          title={t('persistent-volume-claims.headers.resources.title')}
          accessibleName={t(
            'persistent-volume-claims.accessible-name.resources',
          )}
          keyComponent={'pvc-resources'}
        >
          <ResourceDetailsForm>
            {pvc.spec.resources?.requests && (
              <FormGroup>
                {Object.entries(pvc.spec.resources.requests).map(
                  ([resource, quantity]) => (
                    <ResourceDetailsFormItem
                      key={resource}
                      label={`${upperFirst(resource)} Requests`}
                      value={quantity}
                    />
                  ),
                )}
              </FormGroup>
            )}
            {pvc.spec.resources?.limits && (
              <FormGroup>
                {Object.entries(pvc.spec.resources.limits).map(
                  ([resource, quantity]) => (
                    <ResourceDetailsFormItem
                      key={resource}
                      label={`${upperFirst(resource)} Limits`}
                      value={quantity}
                    />
                  ),
                )}
              </FormGroup>
            )}
          </ResourceDetailsForm>
        </UI5Card>
      )}
      <UI5Card
        title={t('common.headers.specification')}
        keyComponent={'pvc-specification'}
      >
        <ResourceDetailsForm>
          <ResourceDetailsFormItem
            label={t('persistent-volume-claims.headers.volume-mode')}
            value={pvc.spec?.volumeMode}
          />
          <ResourceDetailsFormItem
            label={t('persistent-volume-claims.headers.access-modes')}
            value={<Tokens tokens={pvc.spec?.accessModes} />}
          />
          <ResourceDetailsFormItem
            label={t('persistent-volume-claims.headers.volume-name')}
            value={
              pvc.spec?.volumeName && (
                <Link
                  url={clusterUrl(`persistentvolumes/${pvc.spec?.volumeName}`)}
                >
                  {pvc.spec?.volumeName}
                </Link>
              )
            }
          />
          <ResourceDetailsFormItem
            label={t('persistent-volume-claims.headers.storage-class-name')}
            value={
              storageClasses?.find(
                ({ metadata }: { metadata: any }) =>
                  metadata.name === pvc.spec?.storageClassName,
              ) ? (
                <Link
                  url={clusterUrl(
                    `storageclasses/${pvc.spec?.storageClassName}`,
                  )}
                >
                  {pvc.spec?.storageClassName}
                </Link>
              ) : (
                pvc.spec?.storageClassName
              )
            }
          />
        </ResourceDetailsForm>
      </UI5Card>
    </Fragment>
  );
};

export function PersistentVolumeClaimDetails(
  props: PersistentVolumeClaimDetailsProps,
) {
  const { t } = useTranslation();
  const customStatusColumns = [
    {
      header: t('persistent-volume-claims.headers.access-modes'),
      value: (pvc: PersistentVolumeClaim) => (
        <Tokens tokens={pvc?.status?.accessModes} />
      ),
    },
    {
      header: t('persistent-volume-claims.headers.capacity'),
      value: (pvc: PersistentVolumeClaim) =>
        pvc?.status?.capacity?.storage || EMPTY_TEXT_PLACEHOLDER,
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

  const PVCPods = (pvc: PersistentVolumeClaim) => {
    const filterByClaim = ({ spec }: { spec: any }) =>
      spec?.volumes?.find(
        (volume: any) =>
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
      statusBadge={(pvc) =>
        pvc?.status?.phase ? (
          <PersistentVolumeClaimStatus phase={pvc?.status.phase} />
        ) : (
          <>{EMPTY_TEXT_PLACEHOLDER}</>
        )
      }
      customStatusColumns={customStatusColumns}
      customComponents={[
        PVCConfiguration,
        PVCPods,
        PVCSelectorSpecification,
        Events,
      ]}
      description={ResourceDescription}
      createResourceForm={PersistentVolumeClaimCreate}
      resourceType={resourceType}
      {...props}
    />
  );
}

export default PersistentVolumeClaimDetails;
