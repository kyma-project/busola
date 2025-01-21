// TODO: uncomment when API changes are added
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  CustomListItem,
  FlexBox,
  Icon,
  Input,
  List,
  Loader,
  Popover,
  Text,
  Title,
} from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
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
          onAfterClose={() => setPopoverOpen(false)}
          opener="openPopoverBtn"
          placementType="Bottom"
          horizontalAlign="Right"
        >
          <Input
            icon={<Icon name="paper-plane" onClick={onSubmitInput} />}
            value={inputValue}
            onKeyDown={e => e.key === 'Enter' && onSubmitInput()}
            onInput={e => setInputValue(e.target.value)}
            placeholder={t('kyma-companion.opener.input-placeholder')}
            className="popover-input"
          />
          <Title level="H5" style={spacing.sapUiTinyMargin}>
            {t('kyma-companion.opener.suggestions')}
          </Title>
          {errorOccured || (!isLoading && suggestions.length === 0) ? (
            <FlexBox
              alignItems="Center"
              direction="Column"
              style={{ gap: '8px', ...spacing.sapUiTinyMarginBottom }}
            >
              <Text style={spacing.sapUiTinyMargin}>
                {t('kyma-companion.opener.error-message')}
              </Text>
              <Button onClick={fetchSuggestions}>
                {t('common.buttons.retry')}
              </Button>
            </FlexBox>
          ) : isLoading ? (
            <div
              style={{
                ...spacing.sapUiTinyMargin,
                ...spacing.sapUiSmallMarginTop,
              }}
            >
              <Loader progress="60%" />
            </div>
          ) : (
            <List style={spacing.sapUiTinyMarginTop}>
              {suggestions.map((suggestion, index) => (
                <CustomListItem
                  key={index}
                  onClick={() => sendInitialPrompt(suggestion)}
                  className="custom-list-item"
                >
                  <Text className="text">{suggestion}</Text>
                  <Icon name="navigation-right-arrow" />
                </CustomListItem>
              ))}
            </List>
          )}
        </Popover>,
        document.body,
      )}
    </>
  );
}
