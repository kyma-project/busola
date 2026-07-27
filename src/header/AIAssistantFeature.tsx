import { ShellBarItem } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { useLocation } from 'react-router';
import { useAssistantAvailability } from 'components/KymaCompanion/hooks/useAssistantAvailability';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import JouleChat from 'components/KymaCompanion/JouleChat';

export function AIAssistantFeature() {
  const { t } = useTranslation();
  const [showCompanion, setShowCompanion] = useAtom(showKymaCompanionAtom);
  const { showAssistant } = useAssistantAvailability();
  const location = useLocation();
  const isOnClustersPage = location.pathname === '/clusters';

  if (!showAssistant || isOnClustersPage) return null;

  return (
    <>
      <ShellBarItem
        icon={showCompanion.show ? 'da-2' : 'da'}
        text={t('kyma-companion.name')}
        title={t('kyma-companion.name')}
        onClick={(e) => {
          e.preventDefault();
          setShowCompanion((prevState) => ({
            ...prevState,
            show: prevState.useJoule ? !prevState.show : true,
            fullScreen: false,
          }));
        }}
      />
      {showCompanion.useJoule && <JouleChat />}
    </>
  );
}
