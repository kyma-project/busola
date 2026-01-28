import { useMemo } from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export const UnmanagedModuleInfo = ({ kymaResource }: any) => {
  const { t } = useTranslation();

  const isSomeModuleUnmanaged = useMemo(() => {
    return (kymaResource?.spec?.modules || []).some(
      (module: { managed: boolean }) => {
        return module?.managed === false;
      },
    );
  }, [kymaResource]);

  return (
    isSomeModuleUnmanaged && (
      <MessageStrip design="Information" hideCloseButton>
        {t('kyma-modules.unmanaged-modules-info')}
      </MessageStrip>
    )
  );
};
