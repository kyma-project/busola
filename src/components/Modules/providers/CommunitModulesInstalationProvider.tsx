import React, {
  createContext,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import {
  CallbackFn,
  installCommunityModule,
} from 'components/Modules/community/communityModulesHelpers';
import { getModuleName, ModuleTemplateType } from 'components/Modules/support';
import { State } from 'components/Modules/community/components/uploadStateAtom';
import {
  NotificationContextArgs,
  useNotification,
} from 'shared/contexts/NotificationContext';
import { PostFn, usePost } from 'shared/hooks/BackendAPI/usePost';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useAtom, useAtomValue } from 'jotai/index';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { allNodesAtom } from 'state/navigation/allNodesAtom';
import { MutationFn, useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useTranslation } from 'react-i18next';

export type CommunityModulesUpload = {
  callback: CallbackFn;
  moduleDuringUpload: ModuleDuringUpload[];
  setModulesDuringUpload: React.Dispatch<SetStateAction<ModuleDuringUpload[]>>;
  setModulesTemplatesToUpload: React.Dispatch<
    SetStateAction<Map<String, ModuleTemplateType>>
  >;
};

export type ModuleDuringUpload = {
  moduleTpl: ModuleTemplateType;
  state: State;
  message: string;
};

export const CommunityModulesInstallationContext =
  createContext<CommunityModulesUpload>({
    callback: () => {},
    moduleDuringUpload: [],
    setModulesDuringUpload: () => [],
    setModulesTemplatesToUpload: () => [],
  });

export function CommunityModulesUploadProvider({ children }: any) {
  const [modulesDuringInstallation, setModulesDuringInstallation] = useState<
    ModuleDuringUpload[]
  >([]);

  const [moduleTemplatesToupload, setModulesTemplatesToUpload] = useState<
    Map<String, ModuleTemplateType>
  >(new Map());
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();
  const patchRequest = useUpdate();

  const singleGet = useSingleGet();
  const [layoutColumn, setLayoutColumn] = useAtom(columnLayoutAtom);
  const clusterNodes = useAtomValue(allNodesAtom).filter(
    (node) => !node.namespaced,
  );
  const namespaceNodes = useAtomValue(allNodesAtom).filter(
    (node) => node.namespaced,
  );
  useEffect(() => {
    upload(
      moduleTemplatesToupload,
      clusterNodes,
      namespaceNodes,
      postRequest,
      patchRequest,
      singleGet,
      notification,
      setLayoutColumn,
      layoutColumn,
      t,
      callbackFn,
    );
  }, [moduleTemplatesToupload]);

  const callbackFn: CallbackFn = (moduleTpl, moduleState, message) => {
    console.log(moduleState);
    const moduleName = getModuleName(moduleTpl);
    const moduleDuringInstalation = modulesDuringInstallation?.find(
      (module) => getModuleName(module.moduleTpl) === moduleName,
    );
    if (!moduleDuringInstalation) {
      const newModuleDuringInstallation = {
        moduleTpl,
        message: message || '',
        state: moduleState,
      };
      setModulesDuringInstallation([
        ...modulesDuringInstallation,
        newModuleDuringInstallation,
      ]);
      console.log(newModuleDuringInstallation);
      return;
    }

    const updatedModulesDuringInstallation = modulesDuringInstallation?.map(
      (module) => {
        if (getModuleName(module.moduleTpl) === moduleName) {
          module.state = moduleState;
          module.message = message || '';
        }
        return module;
      },
    );
    console.log(updatedModulesDuringInstallation);
    setModulesDuringInstallation(updatedModulesDuringInstallation);
  };

  return (
    <CommunityModulesInstallationContext.Provider
      value={{
        callback: callbackFn,
        moduleDuringUpload: modulesDuringInstallation,
        setModulesDuringUpload: setModulesDuringInstallation,
        setModulesTemplatesToUpload,
      }}
      children={children}
    />
  );
}

// @ts-ignore
const upload = async function (
  communityModulesTemplatesToApply: Map<String, ModuleTemplateType>,
  clusterNodes: any,
  namespaceNodes: any,
  postRequest: PostFn,
  patchRequest: MutationFn,
  singleGet: Function,
  notification: NotificationContextArgs,
  setLayoutColumn: Function,
  layoutColumn: any,
  t: Function,
  callback: CallbackFn,
) {
  console.log('START');
  try {
    const operationPromises = communityModulesTemplatesToApply
      .values()
      .map((moduleTemplate) =>
        installCommunityModule(
          moduleTemplate,
          clusterNodes,
          namespaceNodes,
          postRequest,
          patchRequest,
          singleGet,
          callback,
        ),
      );
    await Promise.allSettled(operationPromises);

    notification.notifySuccess({
      content: t('modules.community.messages.success', {
        resourceType: 'Community Module',
      }),
    });

    // setUploadState([]);
    setLayoutColumn({
      ...layoutColumn,
      layout: 'OneColumn',
      midColumn: null,
      endColumn: null,
      showCreate: null,
    });
  } catch (e) {
    console.error(e);
    notification.notifyError({
      content: t('modules.community.messages.install-failure', {
        resourceType: 'Community Module',
        error: e instanceof Error && e?.message ? e.message : '',
      }),
    });
  }
};
