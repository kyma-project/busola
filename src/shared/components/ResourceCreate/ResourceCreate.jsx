import PropTypes from 'prop-types';
import { Bar, Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useBlocker, useNavigate } from 'react-router';

import { useNotification } from 'shared/contexts/NotificationContext';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { useCustomFormValidator } from 'shared/hooks/useCustomFormValidator/useCustomFormValidator';

import { useAtom, useAtomValue } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import './ResourceCreate.scss';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';

export const ResourceCreate = ({
  performRefetch = () => {},
  title,
  headerActions,
  renderForm,
  confirmText,
  invalidPopupMessage = '',
  isEdit = false,
  readOnly = false,
  disableEdit = false,
  layoutCloseCreateUrl,
  layoutNumber = 'midColumn',
  onlyYaml = false,
  protectedResource = false,
  protectedResourceWarning = null,
  isProtectedResourceModificationBlocked = false,
}) => {
  const { t } = useTranslation();
  const { isValid, formElementRef, setCustomValid, revalidate } =
    useCustomFormValidator();
  const notificationManager = useNotification();
  const navigate = useNavigate();
  const [layoutColumn, setLayoutColumn] = useAtom(columnLayoutAtom);
  const isResourceEdited = useAtomValue(isResourceEditedAtom);

  confirmText = confirmText || t('common.buttons.create');

  const blocker = useBlocker(({ historyAction }) => {
    const isBrowserNav = historyAction === 'POP';

    return isBrowserNav && isResourceEdited.isEdited;
  });

  const { navigateSafely } = useFormNavigation(blocker);

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
    navigate(
      layoutCloseCreateUrl
        ? layoutCloseCreateUrl
        : `${window.location.pathname.slice(
            0,
            window.location.pathname.lastIndexOf('/'),
          )}${
            layoutNumber === 'midColumn' ||
            layoutCloseCreateUrl?.showCreate?.resourceType
              ? ''
              : '?layout=TwoColumnsMidExpanded'
          }`,
    );
    if (layoutNumber === 'midColumn') {
      setLayoutColumn({
        ...layoutColumn,
        midColumn: null,
        layout: 'OneColumn',
        showCreate: null,
        showEdit: null,
      });
    } else {
      setLayoutColumn({
        ...layoutColumn,
        endColumn: null,
        layout: 'TwoColumnsMidExpanded',
        showCreate: null,
        showEdit: null,
      });
    }
  }

  function renderConfirmButton() {
    const isDisabled =
      readOnly || disableEdit || isProtectedResourceModificationBlocked;
    return (
      <Button
        className="min-width-button"
        disabled={isDisabled}
        aria-disabled={isDisabled}
        onClick={handleFormSubmit}
        design="Emphasized"
        tooltip={
          isProtectedResourceModificationBlocked
            ? t('common.tooltips.protected-resources-info')
            : invalidPopupMessage
        }
      >
        {confirmText}
      </Button>
    );
  }

  const renderCancelButton = () => {
    return (
      <Button
        onClick={() => {
          navigateSafely(() => navigateAfterClose());
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
          actions={headerActions}
          layoutNumber={layoutNumber}
          layoutCloseUrl={`${layoutCloseCreateUrl}${
            layoutNumber === 'endColumn' ? '?layout=TwoColumnsMidExpanded' : ''
          }`}
          showYamlTab={disableEdit && onlyYaml}
          content={(stickyHeaderHeight) => (
            <>
              <div className="create-form sap-margin-bottom-small" tabIndex={0}>
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
        <div className="edit-form" tabIndex={0}>
          {renderForm({
            readOnly,
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
  isEdit: PropTypes.bool,
  readOnly: PropTypes.bool,
  disableEdit: PropTypes.bool,
  layoutCloseCreateUrl: PropTypes.string,
};
