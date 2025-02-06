import { useTranslation } from 'react-i18next';
import { Button, Card, Title } from '@ui5/webcomponents-react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  ShowKymaCompanion,
  showKymaCompanionState,
} from 'components/KymaCompanion/state/showKymaCompanionAtom';
import Chat from './Chat/Chat';
import { useEffect, useState } from 'react';
import { sessionIDState } from '../state/sessionIDAtom';
import { clusterState } from 'state/clusterAtom';
import getPromptSuggestions from '../api/getPromptSuggestions';
import './KymaCompanion.scss';

export default function KymaCompanion() {
  const { t } = useTranslation();
  const [showCompanion, setShowCompanion] = useRecoilState<ShowKymaCompanion>(
    showKymaCompanionState,
  );
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const setSessionID = useSetRecoilState(sessionIDState);
  const cluster = useRecoilValue(clusterState);

  useEffect(() => {
    async function fetchSuggestions() {
      const sessionID = ''; // TODO
      setSessionID(sessionID);
      const promptSuggestions = await getPromptSuggestions({
        namespace: 'default', // TODO
        resourceType: 'deployment', // TODO
        groupVersion: 'apps/v1', // TODO
        resourceName: 'test-x', // TODO
        sessionID, // TODO
        clusterUrl: cluster?.currentContext.cluster.cluster.server ?? '',
        token: '', // TODO
        certificateAuthorityData:
          cluster?.currentContext.cluster.cluster[
            'certificate-authority-data'
          ] ?? '',
      });
      if (promptSuggestions) {
        setSuggestions(promptSuggestions);
      }
    }

    if (cluster && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [cluster, suggestions, setSessionID]);

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
                className="action"
                onClick={() =>
                  setShowCompanion({ show: false, fullScreen: false })
                }
              />
            </div>
          </div>
        }
      >
        <Chat suggestions={suggestions} />
      </Card>
    </div>
  );
}
