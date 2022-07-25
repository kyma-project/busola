import React, { useState } from 'react';
import { Button, Menu, Popover } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';

import { VARIABLE_TYPE } from 'components/Functions/helpers/functionVariables';
import VariableModal from '../VariableForm/VariableModal';
import { useTranslation } from 'react-i18next';

export default function CreateVariable({
  func,
  secrets,
  configmaps,
  customVariables,
  customValueFromVariables,
  injectedVariables,
}) {
  const { t, i18n } = useTranslation();

  const addNewVariableButton = (
    <Button glyph="add" typeAttr="button">
      {t('functions.variable.buttons.add')}
    </Button>
  );
  const [currentModal, setCurrentModal] = useState();

  const commonProps = {
    func: func,
    confirmText: t('common.buttons.create'),
    customVariables: customVariables,
    customValueFromVariables: customValueFromVariables,
    injectedVariables: injectedVariables,
    onModalOpenStateChange: state => {
      if (!state) setCurrentModal();
    },
    alwaysOpen: true,
  };

  const customVariableModalProps = {
    title: t('functions.variable.create-modal.title.custom'),
    type: VARIABLE_TYPE.CUSTOM,
    resources: null,
  };

  const secretVariableModalProps = {
    title: t('functions.variable.create-modal.title.secret'),
    type: VARIABLE_TYPE.SECRET,
    resources: secrets,
  };

  const configMapVariableModalProps = {
    title: t('functions.variable.create-modal.title.config-map'),
    type: VARIABLE_TYPE.CONFIG_MAP,
    resources: configmaps,
  };
  function openModalWithProps(props) {
    LuigiClient.uxManager().addBackdrop();
    setCurrentModal(<VariableModal {...props} {...commonProps} i18n={i18n} />);
  }

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
                {t('functions.variable.buttons.open.custom')}
              </Menu.Item>
              <Menu.Item
                onClick={_ => openModalWithProps(secretVariableModalProps)}
              >
                {t('functions.variable.buttons.open.secret')}
              </Menu.Item>
              <Menu.Item
                onClick={_ => openModalWithProps(configMapVariableModalProps)}
              >
                {t('functions.variable.buttons.open.config-map')}
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
