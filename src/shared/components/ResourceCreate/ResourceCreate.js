import PropTypes from 'prop-types';
import { Bar, Button } from '@ui5/webcomponents-react';
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
  confirmText,
  invalidPopupMessage,
  className,
  isEdit,
  layoutCloseUrl,
  layoutNumber = 'MidColumn',
  ...props
}) => {
  const { t } = useTranslation();
  const {
    isValid,
    formElementRef,
    setCustomValid,
    revalidate,
  } = useCustomFormValidator();
  const notificationManager = useNotification();

  confirmText = confirmText || t('common.buttons.create');

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
          layoutNumber={layoutNumber}
          layoutCloseUrl={`${layoutCloseUrl}${
            layoutNumber === 'EndColumn' ? '?layout=TwoColumnsMidExpanded' : ''
          }`}
          footer={
            <Bar
              design="FloatingFooter"
              endContent={<>{renderConfirmButton()}</>}
            />
          }
          content={renderForm({
            formElementRef,
            isValid,
            setCustomValid,
            onChange: handleFormChanged,
            onError: handleFormError,
            onCompleted: handleFormSuccess,
            performManualSubmit: handleFormSubmit,
            actions: <>{renderConfirmButton()}</>,
          })}
        />
      )}
      {isEdit &&
        renderForm({
          formElementRef,
          isValid,
          setCustomValid,
          onChange: handleFormChanged,
          onError: handleFormError,
          onCompleted: handleFormSuccess,
          performManualSubmit: handleFormSubmit,
          actions: <>{renderConfirmButton()}</>,
        })}
    </>
  );
};

ResourceCreate.propTypes = {
  performRefetch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  renderForm: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  invalidPopupMessage: PropTypes.string,
  button: CustomPropTypes.button,
  className: PropTypes.string,
  isEdit: PropTypes.bool,
  layoutCloseUrl: PropTypes.bool,
};

ResourceCreate.defaultProps = {
  performRefetch: () => {},
  invalidPopupMessage: '',
  isEdit: false,
};
