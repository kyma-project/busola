import { useTranslation } from 'react-i18next';
import './MachineInfo.scss';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import ResourceDetailsCard from 'shared/components/ResourceDetails/ResourceDetailsCard';

export function MachineInfo({ nodeInfo, capacity }) {
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
          <DynamicPageComponent.Column
            title={t('machine-info.architecture-cpus')}
          >
            {`${nodeInfo.architecture}, ${capacity.cpu} ${t(
              'machine-info.cpus',
            )}`}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={t('machine-info.pods-capacity')}>
            {capacity.pods}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={t('machine-info.memory')}>
            {`${formattedMemory} ${t('machine-info.gib')}`}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column
            title={t('machine-info.kube-proxy-version')}
          >
            {nodeInfo.kubeProxyVersion}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column
            title={t('machine-info.kubelet-version')}
          >
            {nodeInfo.kubeletVersion}
          </DynamicPageComponent.Column>
        </>
      }
    />
  );
}
