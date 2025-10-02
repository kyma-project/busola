import React, {
  createContext,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { CallbackFn } from 'components/Modules/community/communityModulesInstallHelpers';
import { getModuleName, ModuleTemplateType } from 'components/Modules/support';
import { State } from 'components/Modules/community/components/uploadStateAtom';

export type CommunityModulesUpload = {
  callback: CallbackFn;
  modulesDuringUpload: ModuleDuringUpload[];
  setModulesDuringUpload: React.Dispatch<SetStateAction<ModuleDuringUpload[]>>;
};

export type ModuleDuringUpload = {
  moduleTpl: ModuleTemplateType;
  state: State;
  message: string;
};

export const CommunityModulesInstallationContext =
  createContext<CommunityModulesUpload>({
    callback: () => {},
    modulesDuringUpload: [],
    setModulesDuringUpload: () => [],
  });

export function CommunityModulesUploadProvider({ children }: any) {
  const [moduleInstallState, setModuleInstallState] =
    useState<ModuleDuringUpload>();

  const [modulesDuringInstallation, setModulesDuringInstallation] = useState<
    ModuleDuringUpload[]
  >([]);

  useEffect(() => {
    if (!moduleInstallState) {
      return;
    }
    const moduleName = getModuleName(moduleInstallState?.moduleTpl);
    const moduleDuringInstallation = modulesDuringInstallation?.find(
      (module) => getModuleName(module.moduleTpl) === moduleName,
    );
    if (!moduleDuringInstallation) {
      setModulesDuringInstallation([
        ...modulesDuringInstallation,
        moduleInstallState,
      ]);
      return;
    }

    const updatedModulesDuringInstallation = modulesDuringInstallation?.map(
      (module) => {
        if (getModuleName(module.moduleTpl) === moduleName) {
          module.state = moduleInstallState.state;
          module.message = moduleInstallState.message || '';
        }
        return module;
      },
    );
    setModulesDuringInstallation(updatedModulesDuringInstallation);
    setModuleInstallState(undefined);
  }, [moduleInstallState]);

  const callbackFn: CallbackFn = (moduleTpl, moduleState, message) => {
    setModuleInstallState({
      moduleTpl,
      state: moduleState,
      message: message || '',
    });
  };

  return (
    <CommunityModulesInstallationContext.Provider
      value={{
        callback: callbackFn,
        modulesDuringUpload: modulesDuringInstallation,
        setModulesDuringUpload: setModulesDuringInstallation,
      }}
      children={children}
    />
  );
}
