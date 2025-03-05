import { useTranslation } from 'react-i18next';
import './MachineInfo.scss';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import ResourceDetailsCard from 'shared/components/ResourceDetails/ResourceDetailsCard';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function MachineInfo({ nodeInfo, capacity, addresses, spec }) {
  const formattedMemory =
    Math.round((parseInt(capacity.memory) / 1024 / 1024) * 10) / 10;
  const { t } = useTranslation();

  return (
    <ResourceDetailsCard
      wrapperClassname="resource-overview__details-wrapper"
      className="machine-info__card "
      titleText={t('machine-info.title')}
      content={
        <>
          <DynamicPageComponent.Column
            title={t('machine-info.operating-system')}
          >
            {`${nodeInfo.operatingSystem} (${nodeInfo.osImage})`}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={t('node-details.provider')}>
            {spec.providerID}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={t('machine-info.architecture')}>
            {nodeInfo.architecture}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={t('machine-info.cpus')}>
            {capacity.cpu}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={t('machine-info.memory')}>
            {`${formattedMemory} ${t('machine-info.gib')}`}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={t('machine-info.pods-capacity')}>
            {capacity.pods}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={t('node-details.pod-cidr')}>
            {spec.podCIDRs.join(',')}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column
            title={t('machine-info.kubelet-version')}
          >
            {nodeInfo.kubeletVersion}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={'InternalIP'}>
            {addresses.find(a => a.type === 'InternalIP')?.address ||
              EMPTY_TEXT_PLACEHOLDER}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={'HostName'}>
            {addresses.find(a => a.type === 'Hostname').address ||
              EMPTY_TEXT_PLACEHOLDER}
          </DynamicPageComponent.Column>
        </>
      }
    />
  );
}
