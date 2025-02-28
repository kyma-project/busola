import { useTranslation } from 'react-i18next';
import { Button, Card, Title } from '@ui5/webcomponents-react';
import { useRecoilState } from 'recoil';
import {
  ShowKymaCompanion,
  showKymaCompanionState,
} from 'state/companion/showKymaCompanionAtom';
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
          <div className="kyma-companion__header">
            <Title level="H4" size="H4" className="title">
              {t('kyma-companion.name')}
            </Title>
            <div className="actions-container">
              <Button
                design="Transparent"
                icon="restart"
                tooltip={t('common.buttons.reset')}
                className="action"
                onClick={() => {}}
              />
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
                tooltip={t('common.buttons.close')}
                className="action"
                onClick={() =>
                  setShowCompanion({ show: false, fullScreen: false })
                }
              />
            </div>
          </div>
        }
      >
        <Chat />
      </Card>
    </div>
  );
}
