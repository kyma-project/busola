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
import { useUrl } from 'hooks/useUrl';
import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { showAIassistantState } from 'components/AIassistant/state/showAIassistantAtom';
import { initialPromptState } from '../state/initalPromptAtom';
import getPromptSuggestions from 'components/AIassistant/api/getPromptSuggestions';
import './AIOpener.scss';

export default function AIOpener() {
  const { t } = useTranslation();
  const [assistantOpen, setOpenAssistant] = useRecoilState(
    showAIassistantState,
  );
  const { namespace } = useUrl();
  const setInitialPrompt = useSetRecoilState(initialPromptState);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [errorOccured, setErrorOccured] = useState(false);

  const fetchSuggestions = async () => {
    setErrorOccured(false);
    setPopoverOpen(true);
    if (suggestions.length === 0) {
      const promptSuggestions = await getPromptSuggestions({ namespace });
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
    setOpenAssistant(true);
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
        disabled={assistantOpen}
        onClick={fetchSuggestions}
      >
        {t('ai-assistant.opener.use-ai')}
      </Button>
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
        {errorOccured ? (
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
        ) : suggestions.length === 0 ? (
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
      </Popover>
    </>
  );
}
