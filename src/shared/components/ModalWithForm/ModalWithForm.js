import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Button, Bar } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { useNotification } from 'shared/contexts/NotificationContext';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator/useCustomFormValidator';
import { createPortal } from 'react-dom';

export const ModalWithForm = ({
  performRefetch,
  title,
  button,
  renderForm,
  item,
  modalOpeningComponent,
  confirmText,
  invalidPopupMessage,
  className,
  getToggleFormFn,
  ...props
}) => {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);
  const [resetFormFn, setResetFormFn] = useState(() => () => {});

  const {
    isValid,
    formElementRef,
    setCustomValid,
    revalidate,
  } = useCustomFormValidator();
  const notificationManager = useNotification();

  confirmText = confirmText || t('common.buttons.create');

  const setOpenStatus = status => {
    if (status) {
      setTimeout(() => revalidate());
    }
    setOpen(status);
  };

  useEffect(() => {
    console.log('1 - mount');

    return () => {
      console.log('1 - unmount');
    };
  }, []);

  useEffect(() => {
    console.log(isOpen);
  }, [isOpen]);

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

  const renderModalOpeningComponent = _ =>
    modalOpeningComponent ? (
      <div style={{ display: 'contents' }} onClick={() => setOpenStatus(true)}>
        {modalOpeningComponent}
      </div>
    ) : (
      <Button
        icon={button.icon || null}
        iconEnd
        aria-label={button.label || null}
        design={button.design}
        disabled={!!button.disabled}
        onClick={() => setOpenStatus(true)}
      >
        {button.text}
      </Button>
    );

  return (
    <div onClick={event => event.preventDefault}>
      {renderModalOpeningComponent()}
      {createPortal(
        <Dialog
          className={`${className}`}
          {...props}
          open={isOpen}
          footer={
            <Bar
              design="Footer"
              endContent={
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
              }
            />
          }
          onAfterClose={() => {
            setOpenStatus(false);
          }}
          headerText={title}
        >
          {isOpen &&
            renderForm({
              handleSetResetFormFn: setResetFormFn,
              formElementRef,
              isValid,
              setCustomValid,
              onChange: handleFormChanged,
              onError: handleFormError,
              onCompleted: handleFormSuccess,
              performManualSubmit: handleFormSubmit,
              item: item,
            })}
        </Dialog>,
        document.body,
      )}
    </div>
  );
};

ModalWithForm.propTypes = {
  performRefetch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  renderForm: PropTypes.func.isRequired,
  item: PropTypes.object,
  modalOpeningComponent: PropTypes.node,
  confirmText: PropTypes.string,
  invalidPopupMessage: PropTypes.string,
  button: CustomPropTypes.button,
  className: PropTypes.string,
};

ModalWithForm.defaultProps = {
  performRefetch: () => {},
  invalidPopupMessage: '',
};
