import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Button } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';

import { useNotification } from '../../contexts/NotificationContext';
import { Tooltip } from '../Tooltip/Tooltip';
import CustomPropTypes from '../../typechecking/CustomPropTypes';
import { useCustomFormValidator } from '../../hooks/useCustomFormValidator';

export const ModalWithForm = ({
  performRefetch,
  sendNotification,
  title,
  button,
  renderForm,
  opened,
  customCloseAction,
  item,
  modalOpeningComponent,
  confirmText,
  invalidPopupMessage,
  className,
  onModalOpenStateChange,
  alwaysOpen,
  i18n,
  ...props
}) => {
  const { t } = useTranslation(null, { i18n });
  const [isOpen, setOpen] = useState(alwaysOpen || false);

  const {
    isValid,
    formElementRef,
    setCustomValid,
    revalidate,
  } = useCustomFormValidator();
  const notificationManager = useNotification();

  confirmText = confirmText || t('common.buttons.create');

  useEffect(() => {
    if (!alwaysOpen) setOpenStatus(opened); // if alwaysOpen===true we can ignore the 'opened' prop
  }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOpen !== undefined) onModalOpenStateChange(isOpen);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  function setOpenStatus(status) {
    if (status) {
      setTimeout(() => revalidate());
      LuigiClient.uxManager().addBackdrop();
    } else {
      LuigiClient.uxManager().removeBackdrop();
      if (customCloseAction) customCloseAction();
    }
    setOpen(status);
  }

  function handleFormChanged(e) {
    setTimeout(() => revalidate());
    if (!e) return;
    if (e.target) {
      if (e.target.getAttribute('data-ignore-visual-validation')) {
        return;
      }

      // current element validity
      // const isValidFormElement = e.target.checkValidity();
      // e.target.classList.toggle('is-invalid', !isValidFormElement);
    }
  }

  function handleFormError(title, message, isWarning) {
    notificationManager.notifyError({
      content: message,
      title: title,
      type: isWarning ? 'warning' : 'error',
    });
  }

  function handleFormSuccess(message) {
    notificationManager.notifySuccess({
      content: message,
    });

    performRefetch();
  }

  function handleFormSubmit() {
    if (isValid) {
      formElementRef.current.dispatchEvent(
        new Event('submit', { cancelable: true }),
      );
      setOpenStatus(false);
    }
  }

  function renderConfirmButton() {
    const disabled = !isValid;
    const button = (
      <Button
        disabled={disabled}
        aria-disabled={disabled}
        onClick={handleFormSubmit}
        option="emphasized"
      >
        {confirmText}
      </Button>
    );

    if (invalidPopupMessage && disabled) {
      return (
        <Tooltip
          content={invalidPopupMessage}
          position="top"
          trigger="mouseenter"
          tippyProps={{
            distance: 16,
          }}
        >
          {button}
        </Tooltip>
      );
    }
    return button;
  }

  const renderModalOpeningComponent = _ =>
    modalOpeningComponent ? (
      <div style={{ display: 'contents' }} onClick={() => setOpenStatus(true)}>
        {modalOpeningComponent}
      </div>
    ) : (
      <Button
        glyph={button.glyph || null}
        aria-label={button.label || null}
        option={button.option}
        compact={button.compact || false}
        disabled={!!button.disabled}
        onClick={() => setOpenStatus(true)}
      >
        {button.text}
      </Button>
    );

  return (
    <>
      {alwaysOpen ? null : renderModalOpeningComponent()}
      <Dialog
        className={className}
        {...props}
        show={isOpen}
        actions={[
          renderConfirmButton(),
          <Button onClick={() => setOpenStatus(false)} option="transparent">
            Cancel
          </Button>,
        ]}
        onClose={() => {
          setOpenStatus(false);
        }}
        title={title}
      >
        {isOpen &&
          renderForm({
            formElementRef,
            isValid,
            setCustomValid,
            onChange: handleFormChanged,
            onError: handleFormError,
            onCompleted: handleFormSuccess,
            performManualSubmit: handleFormSubmit,
            item: item,
          })}
      </Dialog>
    </>
  );
};

ModalWithForm.propTypes = {
  performRefetch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  renderForm: PropTypes.func.isRequired,
  opened: PropTypes.bool,
  customCloseAction: PropTypes.func,
  item: PropTypes.object,
  modalOpeningComponent: PropTypes.node,
  confirmText: PropTypes.string,
  invalidPopupMessage: PropTypes.string,
  button: CustomPropTypes.button,
  className: PropTypes.string,
  onModalOpenStateChange: PropTypes.func,
  alwaysOpen: PropTypes.bool, // set this to true if you want to control the modal by rendering and un-rendering it instead of the open/closed state
};

ModalWithForm.defaultProps = {
  performRefetch: () => {},
  invalidPopupMessage: '',
  onModalOpenStateChange: () => {},
  alwaysOpen: false,
};
