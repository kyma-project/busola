import React from 'react';
import { Button } from 'fundamental-react';

import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';
import VariableModal from '../VariableForm/VariableModal';

import { VARIABLE_TYPE } from 'components/Lambdas/helpers/lambdaVariables';

export default function EditVariable({
  lambda,
  secrets,
  configmaps,
  customVariables,
  customValueFromVariables,
  variable,
}) {
  const modalOpeningComponent = (
    <Button compact option="transparent" glyph="edit" />
  );
  let resources;
  if (variable.type === VARIABLE_TYPE.CONFIG_MAP) {
    resources = configmaps;
  } else if (variable.type === VARIABLE_TYPE.SECRET) {
    resources = secrets;
  } else {
    resources = [];
  }
  const variableModal = (
    <VariableModal
      title={ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.TITLE[variable.type]}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.CONFIRM_BUTTON.TEXT}
      lambda={lambda}
      variable={variable}
      type={variable.type}
      resources={resources}
      customVariables={customVariables}
      customValueFromVariables={customValueFromVariables}
    />
  );
  return variableModal;
}
