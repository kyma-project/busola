import React from 'react';
import { Button } from 'fundamental-react';
import { useGetList } from 'react-shared';
import CreateLambdaModal from 'components/Lambdas/LambdasList/Lambdas/CreateLambdaModal';

export default function CreateNewFunction({ namespaceName }) {
  const {
    data: repositories,
    error: repositoriesError,
    loading: repositoriesLoading = true,
  } = useGetList()(
    `/apis/serverless.kyma-project.io/v1alpha1/namespaces/${namespaceName}/gitrepositories`,
    { pollingInterval: 10000 },
  );

  const control = (
    <Button option="transparent" className="fd-margin-end--tiny" glyph="add">
      Create Function
    </Button>
  );

  return (
    <CreateLambdaModal
      repositories={repositories || []}
      serverDataError={repositoriesError}
      serverDataLoading={repositoriesLoading}
      modalOpeningComponent={control}
    />
  );
}
