import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { useTranslation } from 'react-i18next';

type VolumeHostPathProps = {
  hostPath: {
    path?: string;
  };
};

export const VolumeHostPath = ({ hostPath }: VolumeHostPathProps) => {
  const { t } = useTranslation();

  return (
    <>
      <ResourceDetailsFormItem
        label={t('pv.headers.type')}
        value={t('pv.hostPath.type')}
      />
      <ResourceDetailsFormItem
        label={t('pv.hostPath.path')}
        value={hostPath?.path}
      />
    </>
  );
};
