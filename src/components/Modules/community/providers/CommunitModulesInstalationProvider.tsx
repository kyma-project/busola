import { createContext, useEffect, useState } from 'react';
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

function isStateEqual(
  stateA: moduleInstallationState,
  stateB: moduleInstallationState,
): boolean {
  return (
    stateA.message === stateB.message &&
    stateA.state === stateB.state &&
    getModuleName(stateA.moduleTpl) === getModuleName(stateB.moduleTpl)
  );
}

export function CommunityModulesUploadProvider({ children }: any) {
  const [moduleInstallState, setModuleInstallState] = useState<
    moduleInstallationState[]
  >([]);

  const [modulesDuringInstallation, setModulesDuringInstallation] = useState<
    moduleInstallationState[]
  >([]);

  useEffect(() => {
    if (!moduleInstallState || moduleInstallState.length === 0) {
      return;
    }
    const moduleState = moduleInstallState[0];

    const moduleName = getModuleName(moduleState?.moduleTpl);
    const moduleDuringInstallation = modulesDuringInstallation?.find(
      (module) => getModuleName(module.moduleTpl) === moduleName,
    );
    if (!moduleDuringInstallation) {
      const timeoutId = setTimeout(() => {
        setModulesDuringInstallation([
          ...modulesDuringInstallation,
          moduleState,
        ]);
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    const updatedModulesDuringInstallation = modulesDuringInstallation?.map(
      (module) => {
        if (getModuleName(module.moduleTpl) === moduleName) {
          module.state = moduleState.state;
          module.message = moduleState.message || '';
        }
        return module;
      },
    );

    const modulesInstallationTimeoutId = setTimeout(() => {
      setModulesDuringInstallation(updatedModulesDuringInstallation);
    }, 0);

    const moduleInstallTimeoutId = setTimeout(() => {
      setModuleInstallState((moduleStates) => {
        return moduleStates.filter(
          (state) => !isStateEqual(state, moduleState),
        );
      });
    }, 0);
    return () => {
      clearTimeout(modulesInstallationTimeoutId);
      clearTimeout(moduleInstallTimeoutId);
    };
  }, [moduleInstallState]); // eslint-disable-line react-hooks/exhaustive-deps

  const callbackFn: CallbackFn = (moduleTpl, moduleState, message) => {
    setModuleInstallState((moduleStates) => [
      ...moduleStates,
      {
        moduleTpl,
        state: moduleState,
        message: message || '',
      },
    ]);
  };

  return (
    <CommunityModulesInstallationContext.Provider
      value={{
        callback: callbackFn,
        modulesDuringUpload: modulesDuringInstallation,
      }}
      children={children}
    />
  );
}
