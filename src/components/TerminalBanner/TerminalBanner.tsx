import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';
import { FeatureCardBanner } from 'shared/components/FeatureCard/FeatureCard';
import { useLaunchTerminal } from 'components/App/BusolaTerminal/useLaunchTerminal';

const TERMINAL_DOCS_URL =
  'https://help.sap.com/docs/btp/sap-business-technology-platform/kyma-dashboard-terminal';

const TERMINAL_BLOGPOST_URL =
  'https://community.sap.com/t5/technology-blog-posts-by-sap/troubleshoot-your-cluster-directly-from-kyma-dashboard-with-terminal/ba-p/14497218';

export function TerminalBanner() {
  const { t } = useTranslation();
  const { isEnabled } = useFeature(configFeaturesNames.TERMINAL);
  const launch = useLaunchTerminal();

  if (!isEnabled) return null;

  const buttons = (
    <>
      <Button design="Emphasized" onClick={launch}>
        {t('terminal.banner.open')}
      </Button>
      <Button
        accessibleRole="Link"
        accessibleName={t('common.buttons.documentation')}
        endIcon="inspect"
        onClick={() =>
          window.open(TERMINAL_DOCS_URL, '_blank', 'noopener,noreferrer')
        }
      >
        {t('common.buttons.documentation')}
      </Button>
      <Button
        accessibleRole="Link"
        accessibleName={t('common.buttons.learn-more')}
        endIcon="inspect"
        onClick={() =>
          window.open(TERMINAL_BLOGPOST_URL, '_blank', 'noopener,noreferrer')
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
