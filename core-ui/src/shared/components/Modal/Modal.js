import React from 'react';
import LuigiClient from '@luigi-project/client';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Modal.scss';
import { Dialog as FdModal, Button } from 'fundamental-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useTranslation } from 'react-i18next';

Modal.propTypes = {
  title: PropTypes.any,
  modalOpeningComponent: PropTypes.any.isRequired,
  onShow: PropTypes.func,
  actions: PropTypes.any,
  onHide: PropTypes.func,
  onConfirm: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  type: PropTypes.string,
  disabledConfirm: PropTypes.bool,
  waiting: PropTypes.bool,
  tooltipData: PropTypes.object,
  className: PropTypes.string,
};

Modal.defaultProps = {
  title: 'components.modal.title',
  confirmText: 'components.modal.confirm-text',
  actions: null,
  type: 'default',
  disabledConfirm: false,
  waiting: false,
};

export function Modal({
  title,
  actions,
  modalOpeningComponent,
  onShow,
  onHide,
  onConfirm,
  confirmText,
  cancelText,
  type,
  disabledConfirm,
  waiting,
  tooltipData,
  children,
  className,
  i18n,
}) {
  const { t } = useTranslation(null, { i18n });
  const [show, setShow] = React.useState(false);
  function onOpen() {
    if (onShow) {
      onShow();
    }
    LuigiClient.uxManager().addBackdrop();
    setShow(true);
  }

  function onClose() {
    if (onHide) {
      onHide();
    }
    LuigiClient.uxManager().removeBackdrop();
    setShow(false);
  }

  function handleConfirmClicked() {
    if (onConfirm) {
      const result = onConfirm();
      // check if confirm is not explicitly cancelled
      if (result !== false) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  const createActions = () => {
    const confirmMessage = waiting ? (
      <div style={{ width: '97px', height: '16px' }}>
        <Spinner />
      </div>
    ) : (
      t(confirmText)
    );

    const confirmButton = (
      <Button
        option="emphasized"
        onClick={handleConfirmClicked}
        disabled={disabledConfirm}
        data-e2e-id="modal-confirmation-button"
      >
        {confirmMessage}
      </Button>
    );
    let output = [
      tooltipData ? (
        <Tooltip {...tooltipData} minWidth={tooltipData.minWidth || '191px'}>
          {confirmButton}
        </Tooltip>
      ) : (
        confirmButton
      ),
    ];

    if (cancelText) {
      output.push(
        <Button
          style={{ marginRight: '12px' }}
          option="transparent"
          onClick={onClose}
        >
          {cancelText}
        </Button>,
      );
    }

    return output;
  };

  const modalActions = () => {
    if (typeof actions === 'function') return actions(onClose);
    return actions || createActions();
  };

  return (
    <>
      <div style={{ display: 'contents' }} onClick={onOpen}>
        {modalOpeningComponent}
      </div>
      <FdModal
        className={classNames('custom-modal', className)}
        type={type}
        title={t(title)}
        show={show}
        onClose={onClose}
        actions={modalActions()}
      >
        {children}
      </FdModal>
    </>
  );
}
