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
import { useRecoilState } from 'recoil';
import {
  ShowKymaCompanion,
  showKymaCompanionState,
} from 'components/KymaCompanion/state/showKymaCompanionAtom';
import Chat from './Chat/Chat';
import './KymaCompanion.scss';

export default function KymaCompanion() {
  const { t } = useTranslation();
  const [showCompanion, setShowCompanion] = useRecoilState<ShowKymaCompanion>(
    showKymaCompanionState,
  );

  return (
    <div id="companion_wrapper" className="sap-margin-tiny">
      <Card
        className="kyma-companion"
        header={
          <Toolbar design="Transparent" className="kyma-companion__header">
            <Title level="H4" className="title">
              {t('kyma-companion.name')}
            </Title>
            <ToolbarSpacer />
            <div>
              <Button
                design="Transparent"
                icon={
                  showCompanion.fullScreen ? 'exit-full-screen' : 'full-screen'
                }
                className="action"
                onClick={() =>
                  setShowCompanion({
                    show: true,
                    fullScreen: !showCompanion.fullScreen,
                  })
                }
              />
              <Button
                design="Transparent"
                icon="decline"
                className="action"
                onClick={() =>
                  setShowCompanion({ show: false, fullScreen: false })
                }
              />
            </div>
          </Toolbar>
        }
      >
        <TabContainer
          contentBackgroundDesign="Transparent"
          className={`tab-container`}
        >
          <Tab selected text={t('kyma-companion.tabs.chat')}>
            <Chat />
          </Tab>
        </TabContainer>
      </Card>
    </div>
  );
}
