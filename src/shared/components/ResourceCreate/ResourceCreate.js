import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { useNotification } from 'shared/contexts/NotificationContext';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator/useCustomFormValidator';

export const ResourceCreate = ({
  performRefetch,
  sendNotification,
  title,
  button,
  renderForm,
  opened,
  customCloseAction,
  confirmText,
  invalidPopupMessage,
  className,
  onModalOpenStateChange,
  alwaysOpen,
  isEdit,
  ...props
}) => {
  console.log('!!!! ResourceCreate', {
    performRefetch,
    sendNotification,
    title,
    button,
    renderForm,
    opened,
    customCloseAction,
    confirmText,
    invalidPopupMessage,
    className,
    onModalOpenStateChange,
    alwaysOpen,
    ...props,
  });
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
      {!isEdit && (
        <DynamicPageComponent
          title={title}
          content={renderForm({
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
        />
      )}
      {isEdit &&
        renderForm({
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

ResourceCreate.propTypes = {
  performRefetch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  renderForm: PropTypes.func.isRequired,
  opened: PropTypes.bool,
  customCloseAction: PropTypes.func,
  confirmText: PropTypes.string,
  invalidPopupMessage: PropTypes.string,
  button: CustomPropTypes.button,
  className: PropTypes.string,
  onModalOpenStateChange: PropTypes.func,
  alwaysOpen: PropTypes.bool, // set this to true if you want to control the modal by rendering and un-rendering it instead of the open/closed state
  isEdit: PropTypes.bool,
};

ResourceCreate.defaultProps = {
  performRefetch: () => {},
  invalidPopupMessage: '',
  onModalOpenStateChange: () => {},
  alwaysOpen: false,
  isEdit: false,
};
