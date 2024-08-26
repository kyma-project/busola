import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';

type VolumeNFSProps = {
  nfs: {
    server?: string;
    path?: string;
  };
};

export const VolumeNFS = ({ nfs }: VolumeNFSProps) => {
  const { t } = useTranslation();

  return (
    <>
      <LayoutPanelRow name={t('pv.headers.type')} value={t('pv.nfs.type')} />
      <LayoutPanelRow
        name={t('pv.nfs.server')}
        value={nfs?.server || EMPTY_TEXT_PLACEHOLDER}
      />
      <LayoutPanelRow
        name={t('pv.nfs.path')}
        value={nfs?.path || EMPTY_TEXT_PLACEHOLDER}
      />
    </>
  );
};
