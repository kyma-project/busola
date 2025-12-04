import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { FeatureCardBanner } from 'shared/components/FeatureCard/FeatureCard';
import { ThemeType } from 'shared/components/FeatureCard/types';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import JouleIconLightTheme from './assets/JouleIcon.svg';
import JouleIconDarkHCdarkTheme from './assets/JouleIconWhite.svg';
import JouleIconHClightTheme from './assets/JouleIconBlack.svg';
import { isSystemThemeDark, themeAtom } from 'state/preferences/themeAtom';

const getIllustration = (theme: ThemeType): string | undefined => {
  switch (theme) {
    case 'sap_horizon_hcw':
      return JouleIconHClightTheme;
    case 'sap_horizon_hcb':
      return JouleIconDarkHCdarkTheme;
    case 'sap_horizon':
      return JouleIconLightTheme;
    case 'sap_horizon_dark':
      return JouleIconDarkHCdarkTheme;
    case 'light_dark':
    default:
      return isSystemThemeDark()
        ? JouleIconDarkHCdarkTheme
        : JouleIconLightTheme;
  }
};

export function AIBanner({
  feedbackUrl,
  documentationUrl,
}: {
  feedbackUrl: string;
  documentationUrl: string;
}) {
  const { t } = useTranslation();
  const setShowCompanion = useSetAtom(showKymaCompanionAtom);
  const theme = useAtomValue(themeAtom);

  const titleIcon = getIllustration(theme);
  return (
    <FeatureCardBanner
      id="ai-banner"
      className="ai-banner-card"
      title={t('kyma-companion.banner.title')}
      titleIcon={titleIcon}
      description={t('kyma-companion.banner.description')}
      design={'information-2'}
      image="AI"
      buttons={
        <>
          <Button
            key="try-joule"
            design="Emphasized"
            onClick={(e) => {
              e.preventDefault();
              setShowCompanion((prevState) => ({
                ...prevState,
                show: true,
                fullScreen: false,
              }));
            }}
          >
            {t('kyma-companion.banner.buttons.try-joule')}
          </Button>
          <Button
            accessibleRole="Link"
            accessibleName={t('feedback.give-feedback')}
            accessibleDescription="Open in new tab link"
            key="ai-feedback"
            endIcon="inspect"
            onClick={() => {
              const newWindow = window.open(
                feedbackUrl,
                '_blank',
                'noopener, noreferrer',
              );
              if (newWindow) newWindow.opener = null;
            }}
          >
            {t('feedback.give-feedback')}
          </Button>
          <Button
            accessibleRole="Link"
            accessibleName={t('kyma-companion.banner.buttons.documentation')}
            accessibleDescription="Open in new tab link"
            key="ai-documentation"
            endIcon="inspect"
            onClick={() => {
              const newWindow = window.open(
                documentationUrl,
                '_blank',
                'noopener, noreferrer',
              );
              if (newWindow) newWindow.opener = null;
            }}
          >
            {t('kyma-companion.banner.buttons.documentation')}
          </Button>
        </>
      }
    />
  );
}
