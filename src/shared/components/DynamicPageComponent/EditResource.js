import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { useNotification } from 'shared/contexts/NotificationContext';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator/useCustomFormValidator';

export const EditResource = ({
  performRefetch,
  sendNotification,
  title,
  button,
  renderForm,
  opened,
  customCloseAction,
  modalOpeningComponent,
  confirmText,
  invalidPopupMessage,
  className,
  onModalOpenStateChange,
  alwaysOpen,
  getToggleFormFn,
  ...props
}) => {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(alwaysOpen || false);
  const [resetFormFn, setResetFormFn] = useState(() => () => {});
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

  const setOpenStatus = status => {
    if (status) {
      setTimeout(() => revalidate());
    } else {
      if (customCloseAction) customCloseAction();
    }
    setOpen(status);
  };

  useEffect(() => {
    if (getToggleFormFn) {
      // If getToggleFormFn is defined, the function that toggles form modal on/off is passed to parent. The modal will not be closed automatically
      // after clicking on the submit button. You must call toggleFormFn(false) to close the modal at the moment you prefer.
      getToggleFormFn(() => setOpenStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToggleFormFn]);

  function handleFormChanged() {
    setTimeout(() => revalidate());
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
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      if (!getToggleFormFn) {
        setOpenStatus(false);
      }
    }
  }

  function renderConfirmButton() {
    const disabled = !isValid;
    const button = (
      <Button
        disabled={disabled}
        aria-disabled={disabled}
        onClick={handleFormSubmit}
        design="Emphasized"
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

  return (
    <>
      {renderForm({
        handleSetResetFormFn: setResetFormFn,
        formElementRef,
        isValid,
        setCustomValid,
        onChange: handleFormChanged,
        onError: handleFormError,
        onCompleted: handleFormSuccess,
        performManualSubmit: handleFormSubmit,
        actions: (
          <>
            {renderConfirmButton()}
            <Button onClick={resetFormFn} design="Transparent">
              {t('common.buttons.reset')}
            </Button>
            <Button
              onClick={() => {
                setOpenStatus(false);
              }}
              design="Transparent"
            >
              {t('common.buttons.cancel')}
            </Button>
          </>
        ),
      })}
    </>
  );
};

EditResource.propTypes = {
  performRefetch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  renderForm: PropTypes.func.isRequired,
  opened: PropTypes.bool,
  customCloseAction: PropTypes.func,
  modalOpeningComponent: PropTypes.node,
  confirmText: PropTypes.string,
  invalidPopupMessage: PropTypes.string,
  button: CustomPropTypes.button,
  className: PropTypes.string,
  onModalOpenStateChange: PropTypes.func,
  alwaysOpen: PropTypes.bool, // set this to true if you want to control the modal by rendering and un-rendering it instead of the open/closed state
};

EditResource.defaultProps = {
  performRefetch: () => {},
  invalidPopupMessage: '',
  onModalOpenStateChange: () => {},
  alwaysOpen: false,
};
