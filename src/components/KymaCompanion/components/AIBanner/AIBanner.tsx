import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import { FeatureCardBanner } from 'shared/components/FeatureCard/FeatureCard';
import { showKymaCompanionState } from 'state/companion/showKymaCompanionAtom';

export function AIBanner(feedbackUrl?: string) {
  const { t } = useTranslation();
  const setShowCompanion = useSetRecoilState(showKymaCompanionState);
  return (
    <FeatureCardBanner
      id="ai-banner"
      title={t('kyma-companion.banner.title')}
      description={t('kyma-companion.banner.description')}
      design={'information-2'}
      image="AI"
      buttons={
        <>
          <Button
            key="try-joule"
            design="Emphasized"
            onClick={e => {
              e.preventDefault();
              setShowCompanion({
                show: true,
                fullScreen: false,
              });
            }}
          >
            {t('kyma-companion.banner.buttons.try-joule')}
          </Button>
          <Button
            key="ai-feedback"
            endIcon="inspect"
            onClick={() => {
              window.open(feedbackUrl, '_blank');
            }}
          >
            {t('kyma-companion.banner.buttons.feedback')}
          </Button>
        </>
      }
    />
  );
}
