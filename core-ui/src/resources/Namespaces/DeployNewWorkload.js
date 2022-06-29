import React, { useState } from 'react';
import { Popover, Menu, Button } from 'fundamental-react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { DeploymentCreate } from 'resources/Deployments/DeploymentCreate';
import { FunctionCreate } from 'resources/Functions/FunctionCreate';
import { useTranslation } from 'react-i18next';

export default function DeployNewWorkload({ namespaceName }) {
  const { t, i18n } = useTranslation();
  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;

  const [toggleFormFn, getToggleFormFn] = useState(() => {});

  const functionsExist = features?.SERVERLESS?.isEnabled;

  const functionModal = functionsExist ? (
    <ModalWithForm
      title={t('functions.create-view.title')}
      confirmText={t('common.buttons.create')}
      className="add-deployment-modal modal-size--l"
      modalOpeningComponent={
        <Menu.Item key="create-function">
          {t('functions.create-view.title')}
        </Menu.Item>
      }
      getToggleFormFn={getToggleFormFn}
      renderForm={props => (
        <FunctionCreate
          {...props}
          namespace={namespaceName}
          toggleFormFn={toggleFormFn}
          resourceUrl={`/apis/serverless.kyma-project.io/v1alpha1/namespaces/${namespaceName}/functions`}
        />
      )}
      i18n={i18n}
    />
  ) : null;

  const deploymentModal = (
    <ModalWithForm
      title={t('deployments.create-modal.title')}
      confirmText={t('common.buttons.create')}
      className="add-deployment-modal modal-size--l"
      modalOpeningComponent={
        <Menu.Item key="create-deployment">
          {t('deployments.create-modal.title')}
        </Menu.Item>
      }
      renderForm={props => (
        <DeploymentCreate
          {...props}
          namespace={namespaceName}
          toggleFormFn={toggleFormFn}
          resourceUrl={`/apis/apps/v1/namespaces/${namespaceName}/deployments/`}
        />
      )}
      i18n={i18n}
    />
  );

  const control = (
    <Button className="fd-margin-end--tiny" glyph="add">
      {t('namespaces.overview.workloads.deploy-new')}
    </Button>
  );

  return (
    <div>
      <Popover
        body={
          <Menu>
            <Menu.List>
              {functionModal}
              {deploymentModal}
            </Menu.List>
          </Menu>
        }
        control={control}
        widthSizingType="matchTarget"
        placement="bottom-end"
      />
    </div>
  );
}
