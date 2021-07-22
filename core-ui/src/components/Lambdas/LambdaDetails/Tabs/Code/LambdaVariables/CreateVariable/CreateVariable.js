import React from 'react';
import { Button, Menu, Popover } from 'fundamental-react';

import { VARIABLE_TYPE } from 'components/Lambdas/helpers/lambdaVariables';
import { ENVIRONMENT_VARIABLES_PANEL } from 'components/Lambdas/constants';
import VariableModal from '../VariableForm/VariableModal';

export default function CreateVariable({
  lambda,
  secrets,
  configmaps,
  customVariables,
  customValueFromVariables,
}) {
  const addNewVariableButton = (
    <Button glyph="add" typeAttr="button">
      {ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.ADD_ENV_BUTTON.TEXT}
    </Button>
  );

  const customVariableModal = (
    <VariableModal
      title={ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.TITLE.CUSTOM}
      modalOpeningComponent={
        <Menu.Item>
          {ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.OPEN_BUTTON.CUSTOM}
        </Menu.Item>
      }
      confirmText={ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.CONFIRM_BUTTON.TEXT}
      lambda={lambda}
      type={VARIABLE_TYPE.CUSTOM}
      resources={null}
      customVariables={customVariables}
      customValueFromVariables={customValueFromVariables}
    />
  );

  const secretVariableModal = (
    <VariableModal
      title={ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.TITLE.SECRET}
      modalOpeningComponent={
        <Menu.Item>
          {ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.OPEN_BUTTON.SECRET}
        </Menu.Item>
      }
      confirmText={ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.CONFIRM_BUTTON.TEXT}
      lambda={lambda}
      type={VARIABLE_TYPE.SECRET}
      resources={secrets}
      customVariables={customVariables}
      customValueFromVariables={customValueFromVariables}
    />
  );

  const configMapVariableModal = (
    <VariableModal
      title={ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.TITLE.CONFIG_MAP}
      modalOpeningComponent={
        <Menu.Item>
          {ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.OPEN_BUTTON.CONFIG_MAP}
        </Menu.Item>
      }
      confirmText={ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.CONFIRM_BUTTON.TEXT}
      lambda={lambda}
      type={VARIABLE_TYPE.CONFIG_MAP}
      resources={configmaps}
      customVariables={customVariables}
      customValueFromVariables={customValueFromVariables}
    />
  );

  return (
    <Popover
      body={
        <Menu>
          <Menu.List>
            {customVariableModal}
            {configMapVariableModal}
            {secretVariableModal}
          </Menu.List>
        </Menu>
      }
      control={addNewVariableButton}
      widthSizingType="matchTarget"
      placement="bottom-end"
    />
  );
}
