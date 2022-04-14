import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Button } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';

import { useNotification } from 'shared/contexts/NotificationContext';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

/* NOTE
 * this is a copy of old shared/components/ModalWithForm. The primary reason is
 * that service-catalog is soon to go away, so it was easier to just keep a
 * service-catalog specific version, rather than updating service catalog to
 * the changes.
 */

const isFormValid = (formRef, reportValidity = false) => {
  if (!formRef || !formRef.current) return false;

  if (reportValidity && typeof formRef.current.reportValidity === 'function') {
    // for IE
    formRef.current.reportValidity();
  }

  return formRef.current.checkValidity();
};

const isJsonSchemaFormValid = formRef => {
  if (!formRef || !formRef.current) return true;

  return formRef.current.state && formRef.current.state.errors
    ? !formRef.current.state.errors.length
    : true;
};

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
  const [isValid, setValid] = useState(false);
  const [customValid, setCustomValid] = useState(true);
  const formElementRef = useRef(null);
  const jsonSchemaFormRef = useRef(null);
  const notificationManager = useNotification();

  confirmText = confirmText || t('common.buttons.create');

  useEffect(() => {
    if (!alwaysOpen) setOpenStatus(opened); // if alwaysOpen===true we can ignore the 'opened' prop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  useEffect(() => {
    if (isOpen !== undefined) onModalOpenStateChange(isOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function checkAllForms(reportValidity = false) {
    const _isEveryFormValid =
      isFormValid(formElementRef, reportValidity) &&
      isJsonSchemaFormValid(jsonSchemaFormRef);
    if (isValid !== _isEveryFormValid) {
      setValid(_isEveryFormValid);
    }
  }

  function setOpenStatus(status) {
    if (status) {
      checkAllForms(false);
      LuigiClient.uxManager().addBackdrop();
    } else {
      LuigiClient.uxManager().removeBackdrop();
      if (customCloseAction) customCloseAction();
    }
    setOpen(status);
  }

  function handleFormChanged(e) {
    setTimeout(() => checkAllForms());
    if (!e) return;
    if (e.target) {
      if (e.target.getAttribute('data-ignore-visual-validation')) {
        return;
      }

      // current element validity
      const isValidFormElement = e.target.checkValidity();
      e.target.classList.toggle('is-invalid', !isValidFormElement);
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
    const _isEveryFormValid =
      isFormValid(formElementRef) && isJsonSchemaFormValid(jsonSchemaFormRef);
    if (_isEveryFormValid) {
      formElementRef.current.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      setOpenStatus(false);
    }
  }

  function renderConfirmButton() {
    const disabled = !isValid || !customValid;
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
            jsonSchemaFormRef,
            isValid,
            setCustomValid: isValid => {
              // revalidate rest of the form
              setValid(formElementRef.current.checkValidity());
              setCustomValid(isValid);
            },
            setValid: setValid,
            onChange: handleFormChanged,
            onError: handleFormError,
            onCompleted: handleFormSuccess,
            performManualSubmit: handleFormSubmit,
            setValidity: setValid,
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
