import { ReactNode, RefObject, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Button, ButtonPropTypes, Bar } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { useNotification } from 'shared/contexts/NotificationContext';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator/useCustomFormValidator';
import { createPortal } from 'react-dom';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import { checkAuthRequiredInputs } from 'components/Clusters/helper';

type OnErrorProps = { title: string; message: string };

type ButtonArgs = {
  text: string;
  icon?: string;
  label?: string;
  design?: ButtonPropTypes['design'];
  disabled?: boolean;
};

type RenderFormArgs = {
  readOnly?: boolean;
  formElementRef: React.RefObject<HTMLFormElement>;
  isValid: boolean;
  setCustomValid: (valid: boolean) => void;
  onChange: () => void;
  onError: ({ title, message }: OnErrorProps) => void;
  onCompleted: (message: string) => void;
  performManualSubmit: () => void;
  stickyHeaderHeight?: number;
  actions?: ReactNode;
  item: any;
};

type ModalWithFormProps = {
  performRefetch: () => void;
  title: string;
  button?: ButtonArgs;
  renderForm: (args: RenderFormArgs) => ReactNode;
  modalOpeningComponent: JSX.Element;
  confirmText: string;
  invalidPopupMessage?: string;
  className?: string;
  getToggleFormFn?: (fn: () => void) => void;
  [key: string]: any;
};

export const ModalWithForm = ({
  performRefetch = () => {},
  title,
  button = undefined,
  renderForm,
  item = {},
  modalOpeningComponent,
  confirmText,
  invalidPopupMessage = '',
  className,
  getToggleFormFn = undefined,
  ...props
}: ModalWithFormProps) => {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);
  const { navigateSafely } = useFormNavigation();
  const [hasInvalidInputs, setHasInvalidInputs] = useState(false);

  const { isValid, formElementRef, setCustomValid, revalidate } =
    useCustomFormValidator() as {
      isValid: boolean;
      formElementRef: RefObject<HTMLFormElement>;
      setCustomValid: (valid: boolean) => void;
      revalidate: () => void;
    };
  const notificationManager = useNotification();

  confirmText = confirmText || t('common.buttons.create');

  const setOpenStatus = (status: boolean) => {
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
    setTimeout(() => {
      revalidate();
      checkAuthRequiredInputs(formElementRef, setHasInvalidInputs);
    });
  }

  function handleFormError({ title, message }: OnErrorProps) {
    notificationManager.notifyError({
      content: message,
      header: title,
    });
  }

  function handleFormSuccess(message: string) {
    notificationManager.notifySuccess({
      content: message,
    });

    performRefetch();
  }

  function handleFormSubmit() {
    if (isValid) {
      formElementRef.current?.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );

      if (!getToggleFormFn) {
        setOpenStatus(false);
      }
    }
  }

  const renderModalOpeningComponent = () =>
    modalOpeningComponent ? (
      <div style={{ display: 'contents' }} onClick={() => setOpenStatus(true)}>
        {modalOpeningComponent}
      </div>
    ) : (
      <Button
        endIcon={button?.icon}
        accessibleName={button?.label}
        design={button?.design}
        disabled={!!button?.disabled}
        onClick={() => setOpenStatus(true)}
      >
        {button?.text}
      </Button>
    );

  return (
    <>
      {renderModalOpeningComponent()}
      {createPortal(
        <Dialog
          className={className}
          {...props}
          open={isOpen}
          footer={
            <Bar
              design="Footer"
              endContent={
                <>
                  <Button
                    disabled={!isValid || hasInvalidInputs}
                    aria-disabled={!isValid}
                    onClick={handleFormSubmit}
                    design="Emphasized"
                    tooltip={!isValid ? invalidPopupMessage : undefined}
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
  getToggleFormFn: PropTypes.func,
};
