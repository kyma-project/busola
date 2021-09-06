import React from 'react';
import { useGetList } from 'react-shared';

import { CreateRepositoryModal } from 'components/Lambdas/LambdasList/Repositories/RepositoryModal';
export default function CreateNewRepository({ namespaceName, i18n }) {
  const {
    data: repositories,
    error: repositoriesError,
    loading: repositoriesLoading = true,
  } = useGetList()(
    `/apis/serverless.kyma-project.io/v1alpha1/namespaces/${namespaceName}/gitrepositories`,
    { pollingInterval: 5000 },
  );

  const repositoryNames = (repositories || []).map(r => r.name);
  const serverDataError = repositoriesError;
  const serverDataLoading = repositoriesLoading;

  const lambdaModal = (
    <CreateRepositoryModal
      repositoryNames={repositoryNames}
      serverDataError={serverDataError || false}
      serverDataLoading={serverDataLoading || false}
      i18n={i18n}
    />
  );

  return lambdaModal;
}
