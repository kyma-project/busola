import { useState } from 'react';
import classNames from 'classnames';
import {
  Bar,
  Button,
  Dialog,
  Title,
  UI5WCSlotsNode,
} from '@ui5/webcomponents-react';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

import './Modal.scss';

type ModalProps = {
  title?: string;
  modalOpeningComponent?: any;
  openerDisabled?: boolean;
  onShow?: () => void;
  actions: any;
  onHide?: () => void;
  onConfirm?: () => boolean;
  confirmText?: string;
  cancelText?: string;
  disabledConfirm?: boolean;
  waiting?: boolean;
  className: string;
  headerActions?: UI5WCSlotsNode;
  children: JSX.Element[];
};
export function Modal({
  title = 'components.modal.title',
  actions = null,
  modalOpeningComponent,
  openerDisabled = false,
  onShow,
  onHide,
  onConfirm,
  confirmText = 'components.modal.confirm-text',
  cancelText,
  disabledConfirm = false,
  waiting = false,
  children,
  className,
  headerActions,
}: ModalProps) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  function onOpen() {
    if (onShow) {
      onShow();
    }
    setShow(true);
  }

  function onClose() {
    if (onHide) {
      onHide();
    }
    setShow(false);
  }

  async function handleConfirmClicked() {
    if (onConfirm) {
      const result = await onConfirm();
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

    const output = [
      <Button
        key="confirmation"
        design="Emphasized"
        onClick={handleConfirmClicked}
        disabled={disabledConfirm}
        data-e2e-id="modal-confirmation-button"
      >
        {confirmMessage}
      </Button>,
    ];

    if (cancelText) {
      output.push(
        <Button
          style={{ marginRight: '12px' }}
          design="Transparent"
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
      <div
        style={{ display: 'contents' }}
        onClick={!openerDisabled ? onOpen : () => {}}
      >
        {modalOpeningComponent}
      </div>
      {createPortal(
        <Dialog
          accessibleName={title}
          className={classNames('custom-modal', className)}
          headerText={title}
          header={
            headerActions ? (
              <Bar
                startContent={<Title level="H5">{title}</Title>}
                endContent={headerActions}
              />
            ) : null
          }
          open={show}
          onClose={onClose}
          footer={
            <Bar design="Footer" slot="footer" endContent={modalActions()} />
          }
        >
          {children}
        </Dialog>,
        document.body,
      )}
    </>
  );
}
