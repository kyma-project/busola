import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { useTranslation } from 'react-i18next';
import { Tokens } from 'shared/components/Tokens';

type VolumeFCProps = {
  fc: {
    lun?: string;
    fsType?: string;
    wwids?: string[];
    targetWWNs?: string[];
  };
};

export const VolumeFC = ({ fc }: VolumeFCProps) => {
  const { t } = useTranslation();

  return (
    <>
      <ResourceDetailsFormItem
        label={t('pv.headers.type')}
        value={t('pv.fc.type')}
      />
      <ResourceDetailsFormItem label={t('pv.fc.lun')} value={fc?.lun} />
      <ResourceDetailsFormItem label={t('pv.fc.fsType')} value={fc?.fsType} />
      {fc?.wwids && (
        <ResourceDetailsFormItem
          label={t('pv.fc.wwids')}
          value={<Tokens tokens={fc?.wwids || []} />}
        />
      )}
      {fc?.targetWWNs && (
        <ResourceDetailsFormItem
          label={t('pv.fc.targetWWNs')}
          value={<Tokens tokens={fc?.targetWWNs || []} />}
        />
      )}
    </>
  );
};
