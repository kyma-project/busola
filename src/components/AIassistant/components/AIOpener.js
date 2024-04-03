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
import { useRecoilState, useSetRecoilState } from 'recoil';
import { showAIassistantState } from 'components/AIassistant/state/showAIassistantAtom';
import { initialPromptState } from '../state/initalPromptAtom';
import getPromptSuggestions from 'components/AIassistant/utils/getPromptSuggestions';
import './AIOpener.scss';

export default function AIOpener() {
  const { t } = useTranslation();
  const [assistantOpen, setOpenAssistant] = useRecoilState(
    showAIassistantState,
  );
  const setInitialPrompt = useSetRecoilState(initialPromptState);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const onSubmitInput = () => {
    if (inputValue.length === 0) return;
    const prompt = inputValue;
    setInputValue('');
    setInitialPrompt(prompt);
    setPopoverOpen(false);
    setOpenAssistant(true);
  };

  return (
    <>
      <Button
        icon="ai"
        className="ai-button"
        id="openPopoverBtn"
        disabled={assistantOpen}
        onClick={async () => {
          setPopoverOpen(true);
          if (suggestions.length === 0) {
            const suggestions = await getPromptSuggestions();
            setSuggestions(suggestions);
          }
        }}
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
          onKeyDown={e => {
            if (e.key === 'Enter') onSubmitInput();
          }}
          onInput={e => setInputValue(e.target.value)}
          placeholder={t('ai-assistant.opener.input-placeholder')}
          className="popover-input"
        />
        <Title level="H5" style={spacing.sapUiTinyMargin}>
          {t('ai-assistant.opener.suggestions')}
        </Title>
        {suggestions.length === 0 ? (
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
                onClick={() => {
                  setInitialPrompt(suggestion);
                  setPopoverOpen(false);
                  setOpenAssistant(true);
                }}
                className="custom-list-item"
              >
                <FlexBox
                  justifyContent="SpaceBetween"
                  alignItems="Center"
                  className="list-item-content"
                >
                  <Text className="text">{suggestion}</Text>
                  <Icon name="navigation-right-arrow" />
                </FlexBox>
              </CustomListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
