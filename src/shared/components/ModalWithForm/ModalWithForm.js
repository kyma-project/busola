import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Button, Bar } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { useNotification } from 'shared/contexts/NotificationContext';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator/useCustomFormValidator';
import { createPortal } from 'react-dom';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';

export const ModalWithForm = ({
  performRefetch = () => {},
  title,
  button,
  renderForm,
  item,
  modalOpeningComponent,
  confirmText,
  invalidPopupMessage = '',
  className,
  getToggleFormFn,
  ...props
}) => {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);
  const { navigateSafely } = useFormNavigation();

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

  const renderModalOpeningComponent = _ =>
    modalOpeningComponent ? (
      <div style={{ display: 'contents' }} onClick={() => setOpenStatus(true)}>
        {modalOpeningComponent}
      </div>
    ) : (
      <Button
        endIcon={button.icon || null}
        accessibleName={button.label || null}
        design={button.design}
        disabled={!!button.disabled}
        onClick={() => setOpenStatus(true)}
      >
        {button.text}
      </Button>
    );

  return (
    <>
      {renderModalOpeningComponent()}
      {createPortal(
        <Dialog
          style={{ height: '100%' }}
          className={`${className}`}
          {...props}
          open={isOpen}
          footer={
            <Bar
              design="Footer"
              endContent={
                <>
                  <Button
                    disabled={!isValid}
                    aria-disabled={!isValid}
                    onClick={handleFormSubmit}
                    design="Emphasized"
                    tooltip={!isValid ? invalidPopupMessage : null}
                  >
                    {confirmText}
                  </Button>
                  <Button
                    onClick={() => {
                      navigateSafely(() => setOpenStatus(false));
                    }}
                    design="Transparent"
                  >
                    {t('common.buttons.cancel')}
                  </Button>
                </>
              }
            />
          }
          onClose={() => {
            setOpenStatus(false);
          }}
          headerText={title}
          accessibleName={title}
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
        </Dialog>,
        document.body,
      )}
    </>
  );
};

ModalWithForm.propTypes = {
  performRefetch: PropTypes.func,
  title: PropTypes.string.isRequired,
  renderForm: PropTypes.func.isRequired,
  item: PropTypes.object,
  modalOpeningComponent: PropTypes.node,
  confirmText: PropTypes.string,
  invalidPopupMessage: PropTypes.string,
  button: CustomPropTypes.button,
  className: PropTypes.string,
};
