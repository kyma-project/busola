import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';

type VolumeLocalProps = {
  local: {
    path?: string;
  };
};

export const VolumeLocal = ({ local }: VolumeLocalProps) => {
  const { t } = useTranslation();

  return (
    <>
      <LayoutPanelRow name={t('pv.headers.type')} value={t('pv.local.type')} />
      <LayoutPanelRow
        name={t('pv.local.path')}
        value={local?.path || EMPTY_TEXT_PLACEHOLDER}
      />
    </>
  );
};
