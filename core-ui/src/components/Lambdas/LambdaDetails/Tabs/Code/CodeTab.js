import React from 'react';
import { useMicrofrontendContext } from 'react-shared';

import CodeAndDependencies from './CodeAndDependencies/CodeAndDependencies';
import RepositoryConfig from './RepositoryConfig/RepositoryConfig';
import LambdaVariables from './LambdaVariables/LambdaVariables';
import InjectedVariables from './LambdaVariables/InjectedVariables';
import { useGetBindingsCombined } from 'components/Lambdas/hooks/useGetBindingsCombined';

import { isGitSourceType } from 'components/Lambdas/helpers/lambdas';
import { serializeVariables } from 'components/Lambdas/helpers/lambdaVariables';
import PodList from './PodList/PodList';

export default function CodeTab({ lambda, isActive }) {
  const { serviceBindingsCombined } = useGetBindingsCombined(lambda, isActive);
  const serviceBindingsWithUsages = (serviceBindingsCombined || []).filter(
    ({ serviceBindingUsage }) => serviceBindingUsage,
  );
  const {
    customVariables,
    customValueFromVariables,
    injectedVariables,
  } = serializeVariables({
    lambdaVariables: lambda?.spec?.env,
    bindingUsages: serviceBindingsWithUsages || [],
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
      {isGitSourceType(lambda?.spec?.type) ? (
        <RepositoryConfig lambda={lambda} />
      ) : (
        <CodeAndDependencies lambda={lambda} />
      )}
      <LambdaVariables
        lambda={lambda}
        customVariables={customVariables}
        customValueFromVariables={customValueFromVariables}
        injectedVariables={injectedVariables}
      />
      <InjectedBindingVariables
        lambda={lambda}
        customVariables={customVariables}
        customValueFromVariables={customValueFromVariables}
        injectedVariables={injectedVariables}
      />
      <PodList
        isActive={isActive}
        namespace={lambda.metadata.namespace}
        functionName={lambda.metadata.name}
      />
    </>
  );
}
