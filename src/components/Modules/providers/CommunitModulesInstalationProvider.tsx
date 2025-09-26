import React, { createContext, SetStateAction, useState } from 'react';
import { CallbackFn } from 'components/Modules/community/communityModulesHelpers';
import { getModuleName, ModuleTemplateType } from 'components/Modules/support';
import { State } from 'components/Modules/community/components/uploadStateAtom';

export type CommunityModulesUpload = {
  callback: CallbackFn;
  moduleDuringUpload: ModuleDuringUpload[];
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
    moduleDuringUpload: [],
    setModulesDuringUpload: () => [],
  });

export function CommunityModulesUploadProvider({ children }: any) {
  const [modulesDuringInstallation, setModulesDuringInstallation] = useState<
    ModuleDuringUpload[]
  >([]);

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
      }}
      children={children}
    />
  );
}
