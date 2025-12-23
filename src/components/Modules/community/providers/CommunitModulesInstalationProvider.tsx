import { createContext, useCallback, useState } from 'react';
import { CallbackFn } from 'components/Modules/community/communityModulesInstallHelpers';
import { getModuleName, ModuleTemplateType } from 'components/Modules/support';
import { State } from 'components/Modules/community/components/uploadStateAtom';

export type CommunityModulesUpload = {
  callback: CallbackFn;
  modulesDuringUpload: moduleInstallationState[];
};

export type moduleInstallationState = {
  moduleTpl: ModuleTemplateType;
  state: State;
  message: string;
};

export const CommunityModulesInstallationContext =
  createContext<CommunityModulesUpload>({
    callback: () => {},
    modulesDuringUpload: [],
  });

export function CommunityModulesUploadProvider({ children }: any) {
  const [modulesDuringInstallation, setModulesDuringInstallation] = useState<
    moduleInstallationState[]
  >([]);

  const callbackFn: CallbackFn = useCallback(
    (moduleTpl, moduleState, message) => {
      const moduleName = getModuleName(moduleTpl);

      setModulesDuringInstallation((prevModules) => {
        const existingIndex = prevModules.findIndex(
          (m) => getModuleName(m.moduleTpl) === moduleName,
        );

        if (existingIndex >= 0) {
          const updated = [...prevModules];
          updated[existingIndex] = {
            moduleTpl,
            state: moduleState,
            message: message || '',
          };
          return updated;
        } else {
          return [
            ...prevModules,
            {
              moduleTpl,
              state: moduleState,
              message: message || '',
            },
          ];
        }
      });
    },
    [],
  );

  return (
    <CommunityModulesInstallationContext.Provider
      value={{
        callback: callbackFn,
        modulesDuringUpload: modulesDuringInstallation,
      }}
    >
      {children}
    </CommunityModulesInstallationContext.Provider>
  );
}
