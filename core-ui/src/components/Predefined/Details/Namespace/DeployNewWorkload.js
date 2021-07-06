import React from 'react';
import { Popover, Menu, Button } from 'fundamental-react';
import {
  ModalWithForm,
  useGetList,
  useMicrofrontendContext,
} from 'react-shared';
import CreateWorkloadForm from './CreateWorkloadForm/CreateWorkloadForm';
import CreateLambdaModal from 'components/Lambdas/LambdasList/Lambdas/CreateLambdaModal';

export default function DeployNewWorkload({ namespaceName }) {
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
    <ModalWithForm
      title="Add new Deployment"
      confirmText="Create"
      className="add-deployment-modal"
      modalOpeningComponent={<Menu.Item>Create Deployment</Menu.Item>}
      renderForm={props => (
        <CreateWorkloadForm namespaceId={namespaceName} {...props} />
      )}
    />
  );

  const control = (
    <Button option="transparent" className="fd-margin-end--tiny" glyph="add">
      Deploy new workload
    </Button>
  );

  return (
    <Popover
      body={
        <Menu>
          <Menu.List>
            {/* <DeployResourceModal
              namespace={namespaceNameame}
              modalOpeningComponent={<Menu.Item>Upload YAML</Menu.Item>}
            /> */}
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
