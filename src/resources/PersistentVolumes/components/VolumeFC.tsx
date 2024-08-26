import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
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
      <LayoutPanelRow name={t('pv.headers.type')} value={t('pv.fc.type')} />
      <LayoutPanelRow
        name={t('pv.fc.lun')}
        value={fc?.lun || EMPTY_TEXT_PLACEHOLDER}
      />
      <LayoutPanelRow
        name={t('pv.fc.fsType')}
        value={fc?.fsType || EMPTY_TEXT_PLACEHOLDER}
      />
      {fc?.wwids && (
        <LayoutPanelRow
          name={t('pv.fc.wwids')}
          value={<Tokens tokens={fc?.wwids || []} />}
        />
      )}
      {fc?.targetWWNs && (
        <LayoutPanelRow
          name={t('pv.fc.targetWWNs')}
          value={<Tokens tokens={fc?.targetWWNs || []} />}
        />
      )}
    </>
  );
};
