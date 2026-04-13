import { useState, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Label, MessageBox, Text } from '@ui5/webcomponents-react';
import {
  DEFAULT_K8S_NAMESPACE,
  ModuleTemplateType,
} from 'components/Modules/support';
import { useAtomValue } from 'jotai';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { allNodesAtom } from 'state/navigation/allNodesAtom';
import { fetchResourcesToApply } from '../../community/communityModulesHelpers';
import { uploadResource } from '../../community/communityModulesInstallHelpers';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';
import {
  NotificationContextArgs,
  useNotification,
} from 'shared/contexts/NotificationContext';
import { TFunction } from 'i18next';
//import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import './UpdateModuleButton.scss';

type UpdateModuleButtonProps = {
  moduleName: string;
  currentVersion: string;
  newVersion: string;
  moduleTpl: ModuleTemplateType;
};

async function applyModuleTemplateResource(
  moduleTpl: ModuleTemplateType,
  namespaceId: string,
  clusterNodes: any[],
  namespaceNodes: any[],
  postRequest: any,
  patchRequest: any,
  singleGet: any,
  notification: NotificationContextArgs,
  t: TFunction,
  moduleName: string,
) {
  try {
    if (moduleTpl.metadata.creationTimestamp === undefined) {
      await uploadResource(
        { value: moduleTpl },
        namespaceId,
        clusterNodes,
        namespaceNodes,
        postRequest,
        patchRequest,
        singleGet,
      );
    }
    notification.notifySuccess({
      content: t('modules.community.messages.modules-updated'),
    });
  } catch (e) {
    notification.notifyError({
      content: t('modules.community.messages.install-failure', {
        resourceType: moduleName,
        error: e instanceof Error ? e.message : '',
      }),
    });
  }
}

export const UpdateModuleButton = ({
  moduleName,
  currentVersion,
  newVersion,
  moduleTpl,
}: UpdateModuleButtonProps) => {
  const { t } = useTranslation();
  const postRequest = usePost();
  const patchRequest = useUpdate();
  const singleGet = useSingleGet();
  const notification = useNotification();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resourcesToApply, setResourcesToApply] = useState<{ value: any }[]>(
    [],
  );
  const [pendingUpdate, setPendingUpdate] = useState(false);

  const clusterNodes = useAtomValue(allNodesAtom).filter(
    (node) => !node.namespaced,
  );
  const namespaceNodes = useAtomValue(allNodesAtom).filter(
    (node) => node.namespaced,
  );

  const uploadResources = useUploadResources(
    resourcesToApply,
    setResourcesToApply,
    () => {},
    DEFAULT_K8S_NAMESPACE,
  );

  useEffect(() => {
    if (pendingUpdate && resourcesToApply.length > 0) {
      uploadResources();
      applyModuleTemplateResource(
        moduleTpl,
        DEFAULT_K8S_NAMESPACE,
        clusterNodes,
        namespaceNodes,
        postRequest,
        patchRequest,
        singleGet,
        notification,
        t,
        moduleName,
      );
      setPendingUpdate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingUpdate, resourcesToApply]);

  const handleUpdate = async () => {
    setIsDialogOpen(false);

    notification.notifySuccess({
      content: t('modules.community.messages.module-update-started'),
    });

    const templateMap = new Map<string, ModuleTemplateType>();
    templateMap.set(moduleName, moduleTpl);
    await fetchResourcesToApply(templateMap, setResourcesToApply, postRequest);
    setPendingUpdate(true);
  };

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        {t('kyma-modules.update')}
      </Button>
      {isDialogOpen && (
        <MessageBox
          className="update-module-dialog"
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          titleText={t('modules.community.update.title')}
          actions={[
            <Button key="update" design="Emphasized" onClick={handleUpdate}>
              {t('kyma-modules.update')}
            </Button>,
            <Button key="cancel" onClick={() => setIsDialogOpen(false)}>
              {t('common.buttons.cancel')}
            </Button>,
          ]}
        >
          <Text>
            <Trans
              i18nKey="modules.community.update.confirmation"
              values={{ moduleName }}
            >
              <span style={{ fontWeight: 'bold' }}></span>
            </Trans>
          </Text>
          <div className="module-versions-container sap-margin-top-small">
            <Label style={{ textAlign: 'right' }}>
              {t('modules.community.update.current-version')}
            </Label>
            <Text>{currentVersion}</Text>
            <div />
            <Label style={{ textAlign: 'right' }}>
              {t('modules.community.update.latest-version')}
            </Label>
            <Text>{newVersion}</Text>
            {/*TODO: Has to be adjusted when we get Release Notes in modules */}
            {/* {moduleTpl?.spec?.info?.releaseNotes && (
              <ExternalLink
                linkClassName="release-notes-link"
                url={moduleTpl.spec.info.releaseNotes}
                text="Release Notes"
              />
            )} */}
          </div>
        </MessageBox>
      )}
    </>
  );
};
