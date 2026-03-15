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
import { ReactNode } from 'react';

interface RenderFormArgs {
  readOnly?: boolean;
  formElementRef: React.RefObject<HTMLFormElement | null>;
  isValid: boolean;
  setCustomValid: (valid: boolean) => void;
  onChange: () => void;
  onError: (title: string, message: string, isWarning: boolean) => void;
  onCompleted: (message: string) => void;
  performManualSubmit: () => void;
  stickyHeaderHeight?: number;
  actions?: ReactNode;
}

interface ResourceCreateProps {
  performRefetch?: () => void;
  title: string;
  headerActions?: ReactNode;
  renderForm: (args: RenderFormArgs) => ReactNode;
  confirmText?: string;
  invalidPopupMessage?: string;
  isEdit?: boolean;
  readOnly?: boolean;
  disableEdit?: boolean;
  layoutCloseCreateUrl?: string;
  layoutNumber?: 'startColumn' | 'midColumn' | 'endColumn';
  onlyYaml?: boolean;
  protectedResource?: boolean;
  protectedResourceWarning?: ReactNode;
  isProtectedResourceModificationBlocked?: boolean;
}

export const ResourceCreate = ({
  performRefetch = () => {},
  title,
  headerActions,
  renderForm,
  confirmText: confirmTextProp,
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
}: ResourceCreateProps) => {
  const { t } = useTranslation();
  const { isValid, formElementRef, setCustomValid, revalidate } =
    useCustomFormValidator() as {
      isValid: boolean;
      formElementRef: React.RefObject<HTMLFormElement | null>;
      setCustomValid: (valid: boolean) => void;
      revalidate: () => void;
    };
  const notificationManager = useNotification();
  const navigate = useNavigate();
  const [layoutColumn, setLayoutColumn] = useAtom(columnLayoutAtom);
  const isResourceEdited = useAtomValue(isResourceEditedAtom);

  const confirmText = confirmTextProp || t('common.buttons.create');

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

  function handleFormError(
    title: string,
    message: string,
    _isWarning: boolean,
  ) {
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
    } else {
      notificationManager.notifyError({
        content: t('common.messages.must-fill-required'),
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
            (layoutCloseCreateUrl as any)?.showCreate?.resourceType
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
