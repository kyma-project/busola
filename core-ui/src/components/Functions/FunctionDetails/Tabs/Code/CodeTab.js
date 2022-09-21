import React from 'react';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import CodeAndDependencies from './CodeAndDependencies/CodeAndDependencies';
import RepositoryConfig from './RepositoryConfig/RepositoryConfig';
import FunctionVariables from './FunctionVariables/FunctionVariables';

import { isGitSourceType } from 'components/Functions/helpers/functions';
import { serializeVariables } from 'components/Functions/helpers/functionVariables';
import PodList from './PodList/PodList';

export default function CodeTab({ func, isActive }) {
  const { data: configmaps } = useGetList()(
    `/api/v1/namespaces/${func.metadata.namespace}/configmaps`,
  );
  const { data: secrets } = useGetList()(
    `/api/v1/namespaces/${func.metadata.namespace}/secrets`,
  );
  const { customVariables, customValueFromVariables } = serializeVariables({
    functionVariables: func?.spec?.env,
    secrets: secrets,
    configmaps: configmaps,
  });

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
      />
      <PodList
        isActive={isActive}
        namespace={func.metadata.namespace}
        functionName={func.metadata.name}
      />
    </>
  );
}
