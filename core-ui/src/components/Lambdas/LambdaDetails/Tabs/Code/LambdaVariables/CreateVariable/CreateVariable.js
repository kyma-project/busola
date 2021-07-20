import React, { useState } from 'react';
import { Button, Menu, Popover } from 'fundamental-react';

import { ModalWithForm, useGetList, usePost } from 'react-shared';
import {
  newVariableModel,
  VARIABLE_TYPE,
  ERROR_VARIABLE_VALIDATION,
} from 'components/Lambdas/helpers/lambdaVariables';
import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';
import VariableForm, { FORM_TYPE } from '../VariableForm/VariableForm';

const emptyVariable = {};

export default function CreateVariable({ lambda, variables }) {
  const createVariable = usePost();
  const [invalidModalPopupMessage, setInvalidModalPopupMessage] = useState('');

  const { data: configmaps } = useGetList()(
    `/api/v1/namespaces/${lambda.metadata.namespace}/configmaps`,
  );
  const { data: secrets } = useGetList()(
    `/api/v1/namespaces/${lambda.metadata.namespace}/secrets`,
  );

  const addNewVariableButton = (
    <Button glyph="add" typeAttr="button">
      {ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.ADD_ENV_BUTTON.TEXT}
    </Button>
  );

  const customVariableModal = (
    <ModalWithForm
      title="Create Custom Variable"
      modalOpeningComponent={<Menu.Item>Custom Variable</Menu.Item>}
      confirmText={ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.CONFIRM_BUTTON.TEXT}
      invalidPopupMessage={invalidModalPopupMessage}
      id="add-lambda-variables-modal"
      className="fd-dialog--xl-size modal-width--l modal--no-padding"
      confirmText="Create"
      renderForm={props => (
        <VariableForm
          {...props}
          lambda={lambda}
          currentVariable={emptyVariable}
          variables={variables}
          sendRequest={createVariable}
          onSubmitAction={createVariable}
          setInvalidModalPopupMessage={setInvalidModalPopupMessage}
          requestType="create"
          formType={FORM_TYPE.CREATE}
        />
        // <RepositoryForm
        //   {...props}
        //   onSubmitAction={createRepository}
        //   repositoryNames={repositoryNames}
        //   setInvalidModalPopupMessage={setInvalidModalPopupMessage}
        //   formType={FORM_TYPE.CREATE}
        // />
      )}
    />
  );

  return (
    <Popover
      body={
        <Menu>
          <Menu.List>
            {customVariableModal}
            {/* {configMapVariableModal}
            {secretVariableModal} */}
          </Menu.List>
        </Menu>
      }
      control={addNewVariableButton}
      widthSizingType="matchTarget"
      placement="bottom-end"
    />
  );

  // return (
  //   <VariablesModal
  //     variable={emptyVariable}
  //     sendRequest={createApiRule}
  //     requestType="create"
  //     saveButtonText="Create"
  //     headerTitle="Create API Rule"
  //     breadcrumbItems={breadcrumbItems}
  //   />
  // );
}
