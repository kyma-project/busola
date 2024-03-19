import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  List,
  StandardListItem,
  Title,
  Toolbar,
  ToolbarSpacer,
} from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useSetRecoilState } from 'recoil';
import { showAIassistantState } from 'state/showAIassistantAtom';
import './AIassistant.scss';

export default function AIassistant() {
  const { t } = useTranslation();
  const setOpenAssistant = useSetRecoilState(showAIassistantState);

  return (
    <Card
      style={spacing.sapUiTinyMargin}
      className="ai_assistant"
      header={
        <Toolbar className="ai_assistant__header">
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
      <List>
        <StandardListItem description="Software Architect">
          Richard Wilson
        </StandardListItem>
        <StandardListItem description="Visual Designer">
          Elena Petrova
        </StandardListItem>
        <StandardListItem description="Quality Specialist">
          John Miller
        </StandardListItem>
      </List>
    </Card>
  );
}
