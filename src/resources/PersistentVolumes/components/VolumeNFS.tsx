import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
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
      <ResourceDetailsFormItem
        label={t('pv.headers.type')}
        value={t('pv.nfs.type')}
      />
      <ResourceDetailsFormItem
        label={t('pv.nfs.server')}
        value={nfs?.server || EMPTY_TEXT_PLACEHOLDER}
      />
      <ResourceDetailsFormItem
        label={t('pv.nfs.path')}
        value={nfs?.path || EMPTY_TEXT_PLACEHOLDER}
      />
    </>
  );
};
