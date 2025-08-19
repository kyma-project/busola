import { useTranslation } from 'react-i18next';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import ResourceDetailsCard from 'shared/components/ResourceDetails/ResourceDetailsCard';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import './MachineInfo.scss';

export function MachineInfo({ nodeInfo, capacity, addresses, spec, gpus }) {
  const formattedMemory =
    Math.round((parseInt(capacity.memory) / 1024 / 1024) * 10) / 10;
  const { t } = useTranslation();

  return (
    <ResourceDetailsCard
      wrapperClassname="resource-overview__details-wrapper"
      className="machine-info"
      titleText={t('node-details.machine-info.title')}
      content={
        <>
          <DynamicPageComponent.Column
            title={t('node-details.machine-info.operating-system')}
          >
            {`${nodeInfo.operatingSystem} (${nodeInfo.osImage})`}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column
            title={t('node-details.machine-info.provider')}
          >
            {spec.providerID}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column
            title={t('node-details.machine-info.architecture')}
          >
            {nodeInfo.architecture}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column
            title={t('node-details.machine-info.cpus')}
          >
            {capacity.cpu}
          </DynamicPageComponent.Column>
          {gpus > 0 && (
            <DynamicPageComponent.Column
              title={t('node-details.machine-info.nvidia-gpus')}
            >
              {gpus}
            </DynamicPageComponent.Column>
          )}
          <DynamicPageComponent.Column
            title={t('node-details.machine-info.memory')}
          >
            {`${formattedMemory} ${t('node-details.machine-info.gib')}`}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column
            title={t('node-details.machine-info.pods-capacity')}
          >
            {capacity.pods}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={t('node-details.pod-cidr')}>
            {spec.podCIDRs.join(',')}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column
            title={t('node-details.machine-info.kubelet-version')}
          >
            {nodeInfo.kubeletVersion}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column
            title={t('node-details.machine-info.internal-ip')}
          >
            {addresses.find(a => a.type === 'InternalIP')?.address ||
              EMPTY_TEXT_PLACEHOLDER}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column
            title={t('node-details.machine-info.hostname')}
          >
            {addresses.find(a => a.type === 'Hostname').address ||
              EMPTY_TEXT_PLACEHOLDER}
          </DynamicPageComponent.Column>
        </>
      }
    />
  );
}
