import {
  Button,
  CustomListItem,
  FlexBox,
  Icon,
  Input,
  List,
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

  return !assistantOpen ? (
    <>
      <Button
        icon="ai"
        className="ai-button"
        id="openPopoverBtn"
        onClick={async () => {
          const suggestions = await getPromptSuggestions();
          setSuggestions(suggestions);
          setPopoverOpen(true);
        }}
      >
        {t('ai-assistant.use-ai')}
      </Button>
      <Popover
        open={popoverOpen}
        header={
          <Input
            icon={<Icon name="paper-plane" onClick={() => {}} />}
            value={''}
            onKeyDown={e => {}}
            onInput={e => {}}
            placeholder="Ask about this cluster"
          />
        }
        onAfterClose={() => setPopoverOpen(false)}
        opener="openPopoverBtn"
        placementType="Bottom"
        horizontalAlign="Right"
      >
        <Title level="H5">{'Suggestions'}</Title>
        <FlexBox
          direction="Column"
          style={{ gap: '8px', ...spacing.sapUiSmallMarginTopBottom }}
        >
          <List>
            {suggestions.map((suggestion, index) => (
              <CustomListItem
                key={index}
                onClick={() => {
                  setInitialPrompt(suggestion);
                  setOpenAssistant(true);
                }}
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
        </FlexBox>
      </Popover>
    </>
  ) : (
    <></>
  );
}
