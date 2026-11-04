import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
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
      <ResourceDetailsFormItem
        label={t('pv.headers.type')}
        value={t('pv.local.type')}
      />
      <ResourceDetailsFormItem
        label={t('pv.local.path')}
        value={local?.path || EMPTY_TEXT_PLACEHOLDER}
      />
    </>
  );
};
