import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Tab,
  TabContainer,
  Title,
  Toolbar,
  ToolbarSpacer,
} from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useSetRecoilState } from 'recoil';
import { showAIassistantState } from 'components/AIassistant/state/showAIassistantAtom';
import IntroBox from './IntroBox';
import Chat from './Chat';
import PageInsights from './PageInsights';
import './AIassistant.scss';

export default function AIassistant() {
  const { t } = useTranslation();
  const setOpenAssistant = useSetRecoilState(showAIassistantState);

  return (
    <Card
      style={spacing.sapUiTinyMargin}
      className="ai_assistant"
      header={
        <Toolbar toolbarStyle="Clear" className="ai_assistant__header">
          <Title level="H4" className="title">
            {t('ai-assistant.name')}
          </Title>
          <ToolbarSpacer />
          <div>
            <Button
              design="Transparent"
              icon="full-screen"
              className="action"
            />
            <Button
              design="Transparent"
              icon="decline"
              className="action"
              onClick={() => {
                setOpenAssistant(false);
              }}
            />
          </div>
        </Toolbar>
      }
    >
      <IntroBox />
      <TabContainer fixed>
        <Tab selected text={t('ai-assistant.tabs.chat')}>
          <Chat />
        </Tab>
        <Tab text={t('ai-assistant.tabs.page-insights')}>
          <PageInsights />
        </Tab>
      </TabContainer>
    </Card>
  );
}
