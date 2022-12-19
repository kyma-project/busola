import { Button, MessageBox } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { extensionsState } from 'state/navigation/extensionsAtom';

export function IncorrectPath({ to, title = '', message = '' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const extensions = useRecoilValue(extensionsState);

  title = title || t('components.incorrect-path.title.default');
  message = message || t('components.incorrect-path.message.default');

  if (!extensions) return null;

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
