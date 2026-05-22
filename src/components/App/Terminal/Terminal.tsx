import { useTranslation } from 'react-i18next';

export function Terminal() {
  const { t } = useTranslation();

  return (
    <div style={{ padding: '1rem', color: 'var(--sapGroup_TitleTextColor)' }}>
      <h2>{t('terminal.name')}</h2>
    </div>
  );
}
