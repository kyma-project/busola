import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
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
      <LayoutPanelRow name={t('pv.headers.type')} value={t('pv.csi.type')} />
      <LayoutPanelRow
        name={t('pv.csi.driver')}
        value={csi?.driver || EMPTY_TEXT_PLACEHOLDER}
      />
      <LayoutPanelRow
        name={t('pv.csi.volumeHandle')}
        value={csi?.volumeHandle || EMPTY_TEXT_PLACEHOLDER}
      />
      <LayoutPanelRow
        name={t('pv.csi.fsType')}
        value={csi?.fsType || EMPTY_TEXT_PLACEHOLDER}
      />
      <LayoutPanelRow
        name={t('pv.csi.volumeAttributes')}
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
