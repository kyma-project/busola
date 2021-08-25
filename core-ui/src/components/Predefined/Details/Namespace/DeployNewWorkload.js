import React from 'react';
import { Popover, Menu, Button } from 'fundamental-react';
import { useGetList, useMicrofrontendContext } from 'react-shared';
import { CreateDeploymentModal } from 'shared/components/CreateDeploymentForm/CreateDeploymentModal';
import CreateLambdaModal from 'components/Lambdas/LambdasList/Lambdas/CreateLambdaModal';
import { useTranslation } from 'react-i18next';

export default function DeployNewWorkload({ namespaceName }) {
  const { t } = useTranslation();
  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;

  const functionsExist = features?.SERVERLESS?.isEnabled;
  const reposExist = functionsExist && features.SERVERLESS?.isEnabled;

  const {
    data: functions,
    error: functionsError,
    loading: functionsLoading = true,
  } = useGetList()(
    `/apis/serverless.kyma-project.io/v1alpha1/namespaces/${namespaceName}/functions`,
    { pollingInterval: 5000, skip: !functionsExist },
  );

  const {
    data: repositories,
    error: repositoriesError,
    loading: repositoriesLoading = true,
  } = useGetList()(
    `/apis/serverless.kyma-project.io/v1alpha1/namespaces/${namespaceName}/gitrepositories`,
    { pollingInterval: 5000, skip: !reposExist },
  );

  const functionNames = (functions || []).map(fn => fn.metadata.name);
  const serverDataError = functionsError || repositoriesError;
  const serverDataLoading = functionsLoading || repositoriesLoading;

  const lambdaModal = functionsExist ? (
    <CreateLambdaModal
      functionNames={functionNames || []}
      repositories={repositories || []}
      serverDataError={serverDataError}
      serverDataLoading={serverDataLoading}
      modalOpeningComponent={<Menu.Item>Create Function</Menu.Item>}
    />
  ) : null;

  const deploymentModal = (
    <CreateDeploymentModal
      namespaceId={namespaceName}
      modalOpeningComponent={
        <Menu.Item>{t('deployments.create-modal.title')}</Menu.Item>
      }
    />
  );

  const control = (
    <Button option="transparent" className="fd-margin-end--tiny" glyph="add">
      {t('namespaces.overview.workloads.deploy-new')}
    </Button>
  );

  return (
    <Popover
      body={
        <Menu>
          <Menu.List>
            {lambdaModal}
            {deploymentModal}
          </Menu.List>
        </Menu>
      }
      control={control}
      widthSizingType="matchTarget"
      placement="bottom-end"
    />
  );
}
