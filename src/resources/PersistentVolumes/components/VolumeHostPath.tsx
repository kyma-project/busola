import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
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
      <LayoutPanelRow
        name={t('pv.headers.type')}
        value={t('pv.hostPath.type')}
      />
      <LayoutPanelRow
        name={t('pv.hostPath.path')}
        value={hostPath?.path || EMPTY_TEXT_PLACEHOLDER}
      />
    </>
  );
};
