import React, { useState } from 'react';
import { Button, Menu, Popover } from 'fundamental-react';

import { ModalWithForm, useGetList } from 'react-shared';
import {
  newVariableModel,
  VARIABLE_TYPE,
} from 'components/Lambdas/helpers/lambdaVariables';
import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';
import VariableForm, { FORM_TYPE } from '../VariableForm/VariableForm';

const emptyCustomVariable = newVariableModel({
  type: VARIABLE_TYPE.CUSTOM,
  variable: {
    name: '',
    value: '',
  },
  additionalProps: { dirty: true },
});
const emptySecretVariable = newVariableModel({
  type: VARIABLE_TYPE.SECRET,
  variable: {
    name: '',
    valueFrom: {
      secretKeyRef: {
        name: null,
        key: null,
      },
    },
  },
  additionalProps: { dirty: true },
});

const emptyConfigMapVariable = newVariableModel({
  type: VARIABLE_TYPE.CONFIG_MAP,
  variable: {
    name: '',
    valueFrom: {
      configMapKeyRef: {
        name: null,
        key: null,
      },
    },
  },
  additionalProps: { dirty: true },
});

export default function CreateVariable({
  lambda,
  customVariables,
  customValueFromVariables,
  variable,
}) {
  const [invalidModalPopupMessage, setInvalidModalPopupMessage] = useState('');
  const [currentVariable, setCurrentVariable] = useState(emptyCustomVariable);
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
      className="fd-dialog--xl-size modal-width--m"
      confirmText="Create"
      renderForm={props => (
        <VariableForm
          {...props}
          lambda={lambda}
          currentVariable={currentVariable}
          setCurrentVariable={setCurrentVariable}
          customVariables={customVariables}
          customValueFromVariables={customValueFromVariables}
          setInvalidModalPopupMessage={setInvalidModalPopupMessage}
          formType={FORM_TYPE.CREATE}
        />
      )}
    />
  );

  const secretVariableModal = (
    <ModalWithForm
      title="Create Secret Variable"
      modalOpeningComponent={<Menu.Item>Secret Variable</Menu.Item>}
      confirmText={ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.CONFIRM_BUTTON.TEXT}
      invalidPopupMessage={invalidModalPopupMessage}
      id="add-lambda-variables-modal"
      className="fd-dialog--xl-size modal-width--m"
      confirmText="Create"
      renderForm={props => (
        <VariableForm
          {...props}
          lambda={lambda}
          currentVariable={currentVariable}
          setCurrentVariable={setCurrentVariable}
          customVariables={customVariables}
          customValueFromVariables={customValueFromVariables}
          setInvalidModalPopupMessage={setInvalidModalPopupMessage}
          formType={FORM_TYPE.CREATE}
        />
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
}
