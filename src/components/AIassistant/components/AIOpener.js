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
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { showAIassistantState } from 'components/AIassistant/state/showAIassistantAtom';
import { initialPromptState } from '../state/initalPromptAtom';
import getPromptSuggestions from 'components/AIassistant/api/getPromptSuggestions';
import { createPortal } from 'react-dom';
import './AIOpener.scss';
import { authDataState } from 'state/authDataAtom';
import { sessionIDState } from '../state/sessionIDAtom';
import generateSessionID from '../utils/generateSesssionID';

export default function AIOpener({
  namespace,
  resourceType,
  groupVersion,
  resourceName,
}) {
  const { t } = useTranslation();
  const [showAssistant, setShowAssistant] = useRecoilState(
    showAIassistantState,
  );
  const setInitialPrompt = useSetRecoilState(initialPromptState);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [errorOccured, setErrorOccured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const authData = useRecoilValue(authDataState);
  const setSessionID = useSetRecoilState(sessionIDState);

  useEffect(() => {
    return () => {
      setShowAssistant({ show: false, fullScreen: false });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSuggestions = async () => {
    setErrorOccured(false);
    setPopoverOpen(true);
    if (!isLoading && suggestions.length === 0) {
      setIsLoading(true);
      const sessionID = await generateSessionID(authData);
      setSessionID(sessionID);
      const promptSuggestions = await getPromptSuggestions({
        namespace,
        resourceType,
        groupVersion,
        resourceName,
        sessionID,
      });
      setIsLoading(false);
      if (!promptSuggestions) {
        setErrorOccured(true);
      } else {
        setSuggestions(promptSuggestions);
      }
    }
  };

  const sendInitialPrompt = prompt => {
    setInitialPrompt(prompt);
    setPopoverOpen(false);
    setShowAssistant({
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
        disabled={showAssistant.show}
        onClick={fetchSuggestions}
      >
        {t('ai-assistant.opener.use-ai')}
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
            placeholder={t('ai-assistant.opener.input-placeholder')}
            className="popover-input"
          />
          <Title level="H5" style={spacing.sapUiTinyMargin}>
            {t('ai-assistant.opener.suggestions')}
          </Title>
          {errorOccured || (!isLoading && suggestions.length === 0) ? (
            <FlexBox
              alignItems="Center"
              direction="Column"
              style={{ gap: '8px', ...spacing.sapUiTinyMarginBottom }}
            >
              <Text style={spacing.sapUiTinyMargin}>
                {t('ai-assistant.opener.error-message')}
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
