import PropTypes from 'prop-types';
import { Bar, Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { useNotification } from 'shared/contexts/NotificationContext';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator/useCustomFormValidator';
import { spacing } from '@ui5/webcomponents-react-base';

import './ResourceCreate.scss';

export const ResourceCreate = ({
  performRefetch,
  title,
  renderForm,
  confirmText,
  invalidPopupMessage,
  isEdit,
  readOnly,
  disableEdit,
  layoutCloseCreateUrl,
  layoutNumber = 'MidColumn',
  onlyYaml = false,
  protectedResource = false,
  protectedResourceWarning = null,
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

  function renderProtectedResourceButton() {
    if (protectedResource) return protectedResourceWarning;
  }

  function renderConfirmButton() {
    const disabled = !isValid;

    const button = (
      <Button
        disabled={disabled || readOnly || disableEdit}
        aria-disabled={disabled || readOnly || disableEdit}
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
          layoutCloseUrl={`${layoutCloseCreateUrl}${
            layoutNumber === 'EndColumn' ? '?layout=TwoColumnsMidExpanded' : ''
          }`}
          showYamlTab={disableEdit && onlyYaml}
          content={
            <div className="create-form">
              {renderForm({
                formElementRef,
                isValid,
                setCustomValid,
                onChange: handleFormChanged,
                onError: handleFormError,
                onCompleted: handleFormSuccess,
                performManualSubmit: handleFormSubmit,
              })}
            </div>
          }
          footer={
            <div style={spacing.sapUiSmallMarginBeginEnd}>
              <Bar
                design="FloatingFooter"
                endContent={<>{renderConfirmButton()}</>}
              />
            </div>
          }
        />
      )}
      {isEdit && (
        <div className="edit-form">
          {renderForm({
            formElementRef,
            isValid,
            setCustomValid,
            onChange: handleFormChanged,
            onError: handleFormError,
            onCompleted: handleFormSuccess,
            performManualSubmit: handleFormSubmit,
            actions: (
              <>
                {renderProtectedResourceButton()}
                {renderConfirmButton()}
              </>
            ),
          })}
        </div>
      )}
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
  readOnly: PropTypes.bool,
  disableEdit: PropTypes.bool,
  layoutCloseCreateUrl: PropTypes.bool,
};

ResourceCreate.defaultProps = {
  performRefetch: () => {},
  invalidPopupMessage: '',
  isEdit: false,
  readOnly: false,
  disableEdit: false,
};
