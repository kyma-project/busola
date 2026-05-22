import { ShellBarItem } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export function TerminalButton() {
  const { t } = useTranslation();

  return (
    <ShellBarItem
      icon="command-line-interfaces"
      text={t('terminal.name')}
      title={t('terminal.name')}
    />
  );
}
