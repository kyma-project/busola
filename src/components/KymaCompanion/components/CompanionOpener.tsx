// TODO: uncomment when API changes are added
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  ListItemCustom,
  FlexBox,
  Icon,
  Input,
  List,
  Popover,
  Text,
  Title,
  BusyIndicator,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { showKymaCompanionState } from 'components/KymaCompanion/state/showKymaCompanionAtom';
import { initialPromptState } from '../state/initalPromptAtom';
import { createPortal } from 'react-dom';
import { sessionIDState } from '../state/sessionIDAtom';
import { clusterState } from 'state/clusterAtom';
import './CompanionOpener.scss';

interface AIOpenerProps {
  namespace: string;
  resourceType: string;
  groupVersion: string;
  resourceName: string;
}

export default function CompanionOpener({
  namespace,
  resourceType,
  groupVersion,
  resourceName,
}: AIOpenerProps) {
  const { t } = useTranslation();
  const [showCompanion, setShowCompanion] = useRecoilState(
    showKymaCompanionState,
  );
  const setInitialPrompt = useSetRecoilState(initialPromptState);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [errorOccured, setErrorOccured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const setSessionID = useSetRecoilState(sessionIDState);
  const cluster = useRecoilValue(clusterState);

  const fetchSuggestions = async () => {
    setErrorOccured(false);
    setPopoverOpen(true);
    if (!isLoading && suggestions.length === 0) {
      setIsLoading(true);
      // TODO
      const sessionID = '';
      setSessionID(sessionID);
      const promptSuggestions: string[] = [];
      // TODO: uncomment when API changes are added
      //const promptSuggestions = await getPromptSuggestions({ namespace, resourceType, groupVersion, resourceName, sessionID, clusterUrl: cluster?.currentContext.cluster.cluster.server ?? '', token: '', certificateAuthorityData: cluster?.currentContext.cluster.cluster['certificate-authority-data'] ?? ''});
      setIsLoading(false);
      if (!promptSuggestions) {
        setErrorOccured(true);
      } else {
        setSuggestions(promptSuggestions);
      }
    }
  };

  const sendInitialPrompt = (prompt: string) => {
    setInitialPrompt(prompt);
    setPopoverOpen(false);
    setShowCompanion({
      show: true,
      fullScreen: false,
    });
  };

  const onSubmitInput = () => {
    if (inputValue.length === 0) return;
    const prompt = inputValue;
    setInputValue('');
    sendInitialPrompt(prompt);
  };

  return (
    <>
      <Button
        icon="ai"
        className="ai-button"
        id="openPopoverBtn"
        disabled={showCompanion.show}
        onClick={fetchSuggestions}
      >
        {t('kyma-companion.opener.use-ai')}
      </Button>
      {createPortal(
        <Popover
          className="suggestions-popover"
          open={popoverOpen}
          onClose={() => setPopoverOpen(false)}
          opener="openPopoverBtn"
          horizontalAlign="End"
          placement="Bottom"
        >
          <Input
            icon={<Icon name="paper-plane" onClick={onSubmitInput} />}
            value={inputValue}
            onKeyDown={e => e.key === 'Enter' && onSubmitInput()}
            onInput={e => setInputValue(e.target.value)}
            placeholder={t('kyma-companion.opener.input-placeholder')}
            className="popover-input"
          />
          <Title level="H5" className="sap-margin-tiny">
            {t('kyma-companion.opener.suggestions')}
          </Title>
          {errorOccured || (!isLoading && suggestions.length === 0) ? (
            <FlexBox
              alignItems="Center"
              direction="Column"
              className="sap-margin-bottom-tiny"
              style={{ gap: '8px' }}
            >
              <Text className="sap-margin-tiny">
                {t('kyma-companion.opener.error-message')}
              </Text>
              <Button onClick={fetchSuggestions}>
                {t('common.buttons.retry')}
              </Button>
            </FlexBox>
          ) : isLoading ? (
            <div className="sap-margin-tiny sap-margin-top-small">
              <BusyIndicator active delay={1000} size="M" />
            </div>
          ) : (
            <List className="sap-margin-top-tiny">
              {suggestions.map((suggestion, index) => (
                <ListItemCustom
                  key={index}
                  onClick={() => sendInitialPrompt(suggestion)}
                  className="custom-list-item"
                >
                  <Text className="text">{suggestion}</Text>
                  <Icon name="navigation-right-arrow" />
                </ListItemCustom>
              ))}
            </List>
          )}
        </Popover>,
        document.body,
      )}
    </>
  );
}
