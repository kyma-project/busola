import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Button } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { useNotification, Tooltip } from 'react-shared';

//TODO: move this component to a shared "place"

const ModalWithForm = ({
  performRefetch,
  sendNotification,
  title,
  button,
  confirmText,
  renderForm,
  opened,
  customCloseAction,
  modalOpeningComponent,
  invalidPopupMessage,
  ...props
}) => {
  const [isOpen, setOpen] = useState(false);
  const [isValid, setValid] = useState(false);
  const [customValid, setCustomValid] = useState(true);
  const formElementRef = useRef(null);
  const notificationManager = useNotification();

  useEffect(() => {
    setOpenStatus(opened);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  function setOpenStatus(status) {
    if (status) {
      LuigiClient.uxManager().addBackdrop();
    } else {
      LuigiClient.uxManager().removeBackdrop();
      if (customCloseAction) {
        customCloseAction();
      }
    }
    setOpen(status);
  }

  function handleFormChanged(e) {
    setValid(formElementRef.current.checkValidity()); // general form validity
    if (!e || !e.target) {
      return;
    }

    if (typeof e.target.reportValidity === 'function') {
      // for IE
      e.target.reportValidity();
    }

    if (typeof e.target.getAttribute === 'function') {
      if (e.target.getAttribute('data-ignore-visual-validation')) {
        return;
      }
    }

    // current element validity
    if (e.target.checkValidity()) {
      e.target.classList.remove('is-invalid');
    } else {
      e.target.classList.add('is-invalid');
    }
  }

  function handleFormError(title, message, isWarning) {
    notificationManager.notifyError({
      content: message,
      title: title,
      type: isWarning ? 'warning' : 'error',
    });
  }

  function handleFormSuccess(title, message) {
    notificationManager.notifySuccess({
      content: message,
      title: title,
    });

    performRefetch();
  }

  function handleFormSubmit() {
    const form = formElementRef.current;
    if (
      form &&
      form.reportValidity &&
      (typeof form.reportValidity === 'function'
        ? form.reportValidity()
        : form.checkValidity()) // IE workaround; HTML validation tooltips won't be visible
    ) {
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      setTimeout(() => setOpenStatus(false));
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

  return (
    <div>
      <div onClick={() => setOpenStatus(true)}>
        {modalOpeningComponent ? (
          modalOpeningComponent
        ) : (
          <Button
            type="button"
            glyph={button.glyph || null}
            option={button.option}
            compact={button.compact || false}
          >
            {button.text}
          </Button>
        )}
      </div>
      <Dialog
        {...props}
        show={isOpen}
        actions={[
          <Button
            onClick={() => {
              setOpenStatus(false);
            }}
            option="transparent"
          >
            Cancel
          </Button>,
          renderConfirmButton(),
        ]}
        onClose={() => {
          setOpenStatus(false);
        }}
        title={title}
      >
        {renderForm({
          formElementRef,
          isValid,
          setCustomValid: isValid => {
            // revalidate rest of the form
            setValid(formElementRef.current.checkValidity());
            setCustomValid(isValid);
          },
          onChange: handleFormChanged,
          onError: handleFormError,
          onCompleted: handleFormSuccess,
          performManualSubmit: handleFormSubmit,
          setValidity: setValid,
          isOpen,
        })}
      </Dialog>
    </div>
  );
};

ModalWithForm.propTypes = {
  performRefetch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  button: PropTypes.exact({
    text: PropTypes.string.isRequired,
    glyph: PropTypes.string,
    compact: PropTypes.bool,
    option: PropTypes.oneOf(['emphasized', 'light']),
  }),
  modalOpeningComponent: PropTypes.node,
  renderForm: PropTypes.func.isRequired,
  opened: PropTypes.bool,
  customCloseAction: PropTypes.func,
  invalidPopupMessage: PropTypes.string,
};

ModalWithForm.defaultProps = {
  performRefetch: () => {},
  confirmText: 'Create',
  invalidPopupMessage: '',
};

export default ModalWithForm;
