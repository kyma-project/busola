import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { useTranslation } from 'react-i18next';
import { Labels } from 'shared/components/Labels/Labels';

type VolumeCSIProps = {
  csi: {
    driver?: string;
    volumeHandle?: string;
    fsType?: string;
    volumeAttributes?: Record<string, string>;
  };
};

export const VolumeCSI = ({ csi }: VolumeCSIProps) => {
  const { t } = useTranslation();

  return (
    <>
      <ResourceDetailsFormItem
        label={t('pv.headers.type')}
        value={t('pv.csi.type')}
      />
      <ResourceDetailsFormItem label={t('pv.csi.driver')} value={csi?.driver} />
      <ResourceDetailsFormItem
        label={t('pv.csi.volumeHandle')}
        value={csi?.volumeHandle}
      />
      <ResourceDetailsFormItem label={t('pv.csi.fsType')} value={csi?.fsType} />
      <ResourceDetailsFormItem
        label={t('pv.csi.volumeAttributes')}
        value={
          <Labels
            labels={csi?.volumeAttributes || {}}
            shortenLongLabels={false}
          />
        }
      />
    </>
  );
};
