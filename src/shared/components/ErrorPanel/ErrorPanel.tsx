import { getErrorMessage } from 'shared/utils/helpers';
import { useTranslation } from 'react-i18next';
import { UI5Panel } from '../UI5Panel/UI5Panel';

type ErrorPanelProps = {
  error: any;
  title?: string;
};
export const ErrorPanel = ({ error, title }: ErrorPanelProps) => {
  const { t } = useTranslation();

  return (
    <UI5Panel
      title={title || 'Error'}
      accessibleName={t('components.accessible-name.error')}
    >
      <div
        style={{
          fontSize: '18px',
        }}
      >
        {getErrorMessage(error, t('components.error-panel.error'))}
      </div>
    </UI5Panel>
  );
};
