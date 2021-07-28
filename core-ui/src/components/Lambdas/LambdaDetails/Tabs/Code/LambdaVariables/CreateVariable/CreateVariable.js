import React, { useState } from 'react';
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
  const [currentModal, setCurrentModal] = useState();
  const addNewVariableButton = (
    <Button glyph="add" typeAttr="button">
      {ENVIRONMENT_VARIABLES_PANEL.EDIT_MODAL.ADD_ENV_BUTTON.TEXT}
    </Button>
  );

  const commonProps = {
    lambda: lambda,
    confirmText: ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.CONFIRM_BUTTON.TEXT,
    customVariables: customVariables,
    customValueFromVariables: customValueFromVariables,
    onModalOpenStateChange: state => {
      if (!state) setCurrentModal(null);
      console.log('state changed', state);
    },
    alwaysOpen: true,
  };

  const customVariableModalProps = {
    title: ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.TITLE.CUSTOM,
    type: VARIABLE_TYPE.CUSTOM,
    resources: null,
  };

  const secretVariableModalProps = {
    title: ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.TITLE.SECRET,
    type: VARIABLE_TYPE.SECRET,
    resources: secrets,
  };

  const configMapVariableModalProps = {
    title: ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.TITLE.CONFIG_MAP,
    type: VARIABLE_TYPE.CONFIG_MAP,
    resources: configmaps,
  };
  function openModalWithProps(props) {
    setCurrentModal(<VariableModal {...props} {...commonProps} />);
  }
  console.count('render');
  return (
    <>
      {currentModal}
      <Popover
        body={
          <Menu>
            <Menu.List>
              <Menu.Item
                onClick={_ => openModalWithProps(customVariableModalProps)}
              >
                {ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.OPEN_BUTTON.CUSTOM}
              </Menu.Item>
              <Menu.Item
                onClick={_ => openModalWithProps(secretVariableModalProps)}
              >
                {ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.OPEN_BUTTON.SECRET}
              </Menu.Item>
              <Menu.Item
                onClick={_ => openModalWithProps(configMapVariableModalProps)}
              >
                {
                  ENVIRONMENT_VARIABLES_PANEL.CREATE_MODAL.OPEN_BUTTON
                    .CONFIG_MAP
                }
              </Menu.Item>
            </Menu.List>
          </Menu>
        }
        control={addNewVariableButton}
        widthSizingType="matchTarget"
        placement="bottom-end"
      />
    </>
  );
}
