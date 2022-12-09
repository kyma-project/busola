import { Button, MessageBox } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function IncorrectPath({
  to,
  title = 'Incorrect path.',
  message = 'The provided path does not exist. You will get redirected.',
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <MessageBox
      type="warning"
      title={title}
      actions={[
        <Button
          data-testid="delete-confirmation"
          type="attention"
          compact
          onClick={() => navigate(to)}
        >
          {t('common.buttons.ok')}
        </Button>,
      ]}
      show={true}
    >
      <p>{message}</p>
    </MessageBox>
  );
}
