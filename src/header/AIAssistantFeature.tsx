import { useEffect } from 'react';
import { ToggleButton } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { useLocation } from 'react-router';
import { useAssistantAvailability } from 'components/KymaCompanion/hooks/useAssistantAvailability';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import JouleChat from 'components/KymaCompanion/JouleChat';
import { ShellBarAction } from './ShellBarAction';

export function AIAssistantFeature() {
  const { t } = useTranslation();
  const [showCompanion, setShowCompanion] = useAtom(showKymaCompanionAtom);
  const { showAssistant, useJouleMode } = useAssistantAvailability();
  const location = useLocation();
  const isOnClustersPage = location.pathname === '/clusters';

  // Close the panel on cluster switch instead of swapping modes mid-conversation.
  useEffect(() => {
    setShowCompanion((prevState) => ({
      ...prevState,
      show: false,
      useJoule: useJouleMode,
    }));
  }, [setShowCompanion, useJouleMode]);

  if (!showAssistant || isOnClustersPage) return null;

  return (
    <>
      <ShellBarAction
        id="ai-assistant"
        icon={showCompanion.show ? 'da-2' : 'da'}
        text={t('kyma-companion.ask-joule')}
        title={t('kyma-companion.ask-joule')}
        onClick={(e) => {
          e.preventDefault();
          setShowCompanion((prevState) => ({
            ...prevState,
            show: prevState.useJoule ? !prevState.show : true,
            fullScreen: false,
          }));
        }}
      >
        <ToggleButton
          accessibleName={t('kyma-companion.name')}
          pressed={showCompanion.show}
          slot="assistant"
        />
        {showCompanion.useJoule && <JouleChat />}
      </ShellBarAction>
    </>
  );
}
