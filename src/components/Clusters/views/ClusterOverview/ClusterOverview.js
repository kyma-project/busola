import React, { useState } from 'react';
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
import { ClusterNodes } from './ClusterNodes';
import { ClusterValidation } from './ClusterValidation/ClusterValidation';
import { useFeature } from 'hooks/useFeature';
import { useNodesQuery } from 'components/Nodes/nodeQueries';
import ClusterStats from './ClusterStats';
import ClusterDetails from './ClusterDetails';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { deleteCluster } from 'components/Clusters/shared';
import { spacing } from '@ui5/webcomponents-react-base';
import './ClusterOverview.scss';
import { useSetRecoilState } from 'recoil';
import { showAIassistantState } from 'components/AIassistant/state/showAIassistantAtom';
import getPromptSuggestions from 'components/AIassistant/utils/getPromptSuggestions';

const Injections = React.lazy(() =>
  import('../../../Extensibility/ExtensibilityInjections'),
);

export function ClusterOverview() {
  const { t } = useTranslation();
  const clusterValidation = useFeature('CLUSTER_VALIDATION');
  const clustersInfo = useClustersInfo();
  const currentCluster = clustersInfo?.currentCluster;
  const notification = useNotification();
  const navigate = useNavigate();
  const { nodes: data, error, loading } = useNodesQuery();
  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceType: t('clusters.labels.name'),
  });
  const setOpenAssistant = useSetRecoilState(showAIassistantState);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const actions = (
    <Button
      design="Transparent"
      onClick={() => {
        handleResourceDelete({
          deleteFn: () => {
            deleteCluster(clustersInfo?.currentCluster?.name, clustersInfo);
            notification.notifySuccess({
              content: t('clusters.disconnect'),
            });
            navigate('/clusters');
          },
        });
      }}
    >
      {t('common.buttons.disconnect')}
    </Button>
  );

  return (
    <>
      <DynamicPageComponent
        title={currentCluster.currentContext.cluster.name}
        actions={actions}
        content={
          <>
            <Injections
              destination="ClusterOverview"
              slot="details-top"
              root=""
            />
            <FlexBox
              alignItems="Center"
              justifyContent="SpaceBetween"
              style={spacing.sapUiMediumMargin}
            >
              <Title level="H3">
                {t('cluster-overview.headers.cluster-details')}
              </Title>
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
                            setPopoverOpen(false);
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
            </FlexBox>
            <ClusterDetails currentCluster={currentCluster} />
            {data && <ClusterStats data={data} />}
            <ClusterNodes data={data} error={error} loading={loading} />
            {clusterValidation?.isEnabled && <ClusterValidation />}
            <Injections destination="ClusterOverview" slot="details-bottom" />
          </>
        }
      />
      <YamlUploadDialog />
      {createPortal(
        <DeleteMessageBox
          resource={currentCluster}
          resourceIsCluster={true}
          resourceTitle={currentCluster?.kubeconfig['current-context']}
          deleteFn={e => {
            deleteCluster(e.name, clustersInfo);
            notification.notifySuccess({
              content: t('clusters.disconnect'),
            });
            navigate('/clusters');
          }}
        />,
        document.body,
      )}
    </>
  );
}
