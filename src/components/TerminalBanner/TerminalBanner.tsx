import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';
import { showTerminalAtom } from 'state/showTerminalAtom';
import { FeatureCardBanner } from 'shared/components/FeatureCard/FeatureCard';

const TERMINAL_DOCS_URL =
  'https://github.com/kyma-project/busola/blob/main/docs/user/01-50-terminal.md';

export function TerminalBanner() {
  const { t } = useTranslation();
  const { isEnabled } = useFeature(configFeaturesNames.TERMINAL);
  const setShowTerminal = useSetAtom(showTerminalAtom);

  if (!isEnabled) return null;

  const buttons = (
    <>
      <Button
        design="Emphasized"
        onClick={() => setShowTerminal((prev) => ({ ...prev, isOpen: true }))}
      >
        {t('terminal.banner.open')}
      </Button>
      <Button
        accessibleRole="Link"
        accessibleName={t('common.buttons.learn-more')}
        endIcon="inspect"
        onClick={() =>
          window.open(TERMINAL_DOCS_URL, '_blank', 'noopener,noreferrer')
        }
      >
        {t('common.buttons.learn-more')}
      </Button>
    </>
  );

  return (
    <FeatureCardBanner
      id="TerminalBanner"
      title={t('terminal.banner.title')}
      description={t('terminal.banner.description')}
      design="information-2"
      image="Terminal"
      buttons={buttons}
    />
  );
}
