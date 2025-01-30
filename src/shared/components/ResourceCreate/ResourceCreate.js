import PropTypes from 'prop-types';
import { Bar, Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { useNotification } from 'shared/contexts/NotificationContext';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator/useCustomFormValidator';

import { useRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { handleActionIfFormOpen } from '../UnsavedMessageBox/helpers';

import './ResourceCreate.scss';

export const ResourceCreate = ({
  performRefetch = () => {},
  title,
  renderForm,
  confirmText,
  invalidPopupMessage = '',
  isEdit = false,
  readOnly = false,
  disableEdit = false,
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
  const [layoutColumn, setLayoutColumn] = useRecoilState(columnLayoutState);
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [isFormOpen, setIsFormOpen] = useRecoilState(isFormOpenState);

  confirmText = confirmText || t('common.buttons.create');

  function handleFormChanged() {
    setTimeout(() => {
      revalidate();
    });
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
    } else {
      notificationManager.notifyError({
        content: t('common.messages.must-fill-required'),
        type: 'error',
      });
    }
  }

  function renderProtectedResourceButton() {
    if (protectedResource) return protectedResourceWarning;
  }

  function navigateAfterClose() {
    setIsResourceEdited({ isEdited: false });
    window.history.pushState(
      window.history.state,
      '',
      layoutCloseCreateUrl
        ? layoutCloseCreateUrl
        : `${window.location.pathname.slice(
            0,
            window.location.pathname.lastIndexOf('/'),
          )}${
            layoutNumber === 'MidColumn' ||
            layoutCloseCreateUrl?.showCreate?.resourceType
              ? ''
              : '?layout=TwoColumnsMidExpanded'
          }`,
    );
    layoutNumber === 'MidColumn'
      ? setLayoutColumn({
          ...layoutColumn,
          midColumn: null,
          layout: 'OneColumn',
          showCreate: null,
        })
      : setLayoutColumn({
          ...layoutColumn,
          endColumn: null,
          layout: 'TwoColumnsMidExpanded',
          showCreate: null,
        });
  }

  function renderConfirmButton() {
    return (
      <Button
        disabled={readOnly || disableEdit}
        aria-disabled={readOnly || disableEdit}
        onClick={handleFormSubmit}
        design="Emphasized"
        tooltip={invalidPopupMessage}
      >
        {confirmText}
      </Button>
    );
  }

  const renderCancelButton = () => {
    return (
      <Button
        onClick={() => {
          handleActionIfFormOpen(
            isResourceEdited,
            setIsResourceEdited,
            isFormOpen,
            setIsFormOpen,
            () => navigateAfterClose(),
          );
        }}
        design="Transparent"
      >
        {t('common.buttons.cancel')}
      </Button>
    );
  };

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
          content={stickyHeaderHeight => (
            <>
              <div className="create-form sap-margin-bottom-small">
                {renderForm({
                  formElementRef,
                  isValid,
                  setCustomValid,
                  onChange: handleFormChanged,
                  onError: handleFormError,
                  onCompleted: handleFormSuccess,
                  performManualSubmit: handleFormSubmit,
                  stickyHeaderHeight,
                })}
              </div>
              <div
                data-testid={'create-form-footer-bar'}
                className="sap-margin-x-small"
                style={{
                  marginTop: 'auto',
                  position: 'sticky',
                  bottom: '0.5rem',
                }}
              >
                <Bar
                  design="FloatingFooter"
                  endContent={
                    <>
                      {renderConfirmButton()}
                      {renderCancelButton()}
                    </>
                  }
                />
              </div>
            </>
          )}
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
  performRefetch: PropTypes.func,
  title: PropTypes.string.isRequired,
  renderForm: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  invalidPopupMessage: PropTypes.string,
  button: CustomPropTypes.button,
  className: PropTypes.string,
  isEdit: PropTypes.bool,
  readOnly: PropTypes.bool,
  disableEdit: PropTypes.bool,
  layoutCloseCreateUrl: PropTypes.string,
};
