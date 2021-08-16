import React from 'react';
import { Button } from 'fundamental-react';

import VariableModal from '../VariableForm/VariableModal';

import { VARIABLE_TYPE } from 'components/Lambdas/helpers/lambdaVariables';
import { useTranslation } from 'react-i18next';

export default function EditVariable({
  lambda,
  secrets,
  configmaps,
  customVariables,
  customValueFromVariables,
  injectedVariables,
  variable,
}) {
  const { t } = useTranslation();

  const modalOpeningComponent = (
    <Button compact option="transparent" glyph="edit" />
  );
  let resources;
  let type;
  if (variable.type === VARIABLE_TYPE.CONFIG_MAP) {
    resources = configmaps;
    type = 'config-map';
  } else if (variable.type === VARIABLE_TYPE.SECRET) {
    resources = secrets;
    type = 'secret';
  } else {
    resources = [];
    type = 'custom';
  }
  const variableModal = (
    <VariableModal
      title={t(`functions.variable.title.edit-modal.${type}`)}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={t('common.buttons.save')}
      lambda={lambda}
      variable={variable}
      type={variable.type}
      resources={resources}
      customVariables={customVariables}
      customValueFromVariables={customValueFromVariables}
      injectedVariables={injectedVariables}
    />
  );
  return variableModal;
}
