import { getErrorMessage } from 'shared/utils/helpers';
import { useTranslation } from 'react-i18next';
import { UI5Card } from '../UI5Card/UI5Card';

type ErrorPanelProps = {
  error: any;
  title?: string;
};
export const ErrorPanel = ({ error, title }: ErrorPanelProps) => {
  const { t } = useTranslation();

  return (
    <UI5Card
      title={title || 'Error'}
      accessibleName={t('components.accessible-name.error')}
    >
      <div
        className="sap-margin-x-small sap-margin-bottom-tiny"
        style={{
          fontSize: '18px',
        }}
      >
        {getErrorMessage(error, t('components.error-panel.error'))}
      </div>
    </UI5Card>
  );
};
