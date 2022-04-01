import React from 'react';
import { Popover, Menu, Button } from 'fundamental-react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { DeploymentsCreate } from '../../Create/Deployments/Deployments.create';
import { FunctionsCreate } from '../../Create/Functions/Functions.create';
import { useTranslation } from 'react-i18next';

export default function DeployNewWorkload({ namespaceName }) {
  const { t, i18n } = useTranslation();
  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;

  const functionsExist = features?.SERVERLESS?.isEnabled;

  const lambdaModal = functionsExist ? (
    <ModalWithForm
      title={t('functions.create-view.title')}
      confirmText={t('common.buttons.create')}
      className="add-deployment-modal modal-size--l"
      modalOpeningComponent={
        <Menu.Item key="create-function">
          {t('functions.create-view.title')}
        </Menu.Item>
      }
      renderForm={props => (
        <FunctionsCreate {...props} namespace={namespaceName} />
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
        <DeploymentsCreate {...props} namespace={namespaceName} />
      )}
      i18n={i18n}
    />
  );

  const control = (
    <Button option="transparent" className="fd-margin-end--tiny" glyph="add">
      {t('namespaces.overview.workloads.deploy-new')}
    </Button>
  );

  return (
    <div>
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
    </div>
  );
}
