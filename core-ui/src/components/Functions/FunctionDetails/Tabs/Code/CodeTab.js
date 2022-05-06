import React from 'react';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

import CodeAndDependencies from './CodeAndDependencies/CodeAndDependencies';
import RepositoryConfig from './RepositoryConfig/RepositoryConfig';
import FunctionVariables from './FunctionVariables/FunctionVariables';
import InjectedVariables from './FunctionVariables/InjectedVariables';
import { useGetBindingsCombined } from 'components/Functions/hooks/useGetBindingsCombined';

import { isGitSourceType } from 'components/Functions/helpers/functions';
import { serializeVariables } from 'components/Functions/helpers/functionVariables';
import PodList from './PodList/PodList';

export default function CodeTab({ func, isActive }) {
  const { serviceBindingsCombined } = useGetBindingsCombined(func, isActive);
  const serviceBindingsWithUsages = (serviceBindingsCombined || []).filter(
    ({ serviceBindingUsage }) => serviceBindingUsage,
  );

  const { data: configmaps } = useGetList()(
    `/api/v1/namespaces/${func.metadata.namespace}/configmaps`,
  );
  const { data: secrets } = useGetList()(
    `/api/v1/namespaces/${func.metadata.namespace}/secrets`,
  );
  const {
    customVariables,
    customValueFromVariables,
    injectedVariables,
  } = serializeVariables({
    functionVariables: func?.spec?.env,
    bindingUsages: serviceBindingsWithUsages || [],
    secrets: secrets,
    configmaps: configmaps,
  });
  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;
  const catalogEnabled =
    features?.SERVICE_CATALOG?.isEnabled &&
    features?.SERVICE_CATALOG_ADDONS?.isEnabled;

  const InjectedBindingVariables = catalogEnabled
    ? InjectedVariables
    : () => null;

  return (
    <>
      {isGitSourceType(func?.spec?.type) ? (
        <RepositoryConfig func={func} />
      ) : (
        <CodeAndDependencies func={func} />
      )}
      <FunctionVariables
        func={func}
        secrets={secrets}
        configmaps={configmaps}
        customVariables={customVariables}
        customValueFromVariables={customValueFromVariables}
        injectedVariables={injectedVariables}
      />
      <InjectedBindingVariables
        func={func}
        customVariables={customVariables}
        customValueFromVariables={customValueFromVariables}
        injectedVariables={injectedVariables}
      />
      <PodList
        isActive={isActive}
        namespace={func.metadata.namespace}
        functionName={func.metadata.name}
      />
    </>
  );
}
