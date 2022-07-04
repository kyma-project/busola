import React, { useEffect, useState } from 'react';
import { Dialog } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { AddClusterWizard } from './AddClusterWizard';
import './AddClusterDialog.scss';

function AddClusterDialogComponent({ show, onCancel }) {
  const [kubeconfig, setKubeconfig] = useState(undefined);

  useEffect(() => {
    if (show) {
      setKubeconfig(undefined);
    }
  }, [show]);

  return (
    <AddClusterWizard
      kubeconfig={kubeconfig}
      setKubeconfig={setKubeconfig}
      onCancel={onCancel}
    />
  );
}
export function AddClusterDialog({ show, onCancel }) {
  const { t, i18n } = useTranslation();

  return (
    <Dialog
      show={show}
      className="add-cluster-dialog"
      title={t('clusters.add.title')}
      actions={[]}
    >
      <ErrorBoundary i18n={i18n}>
        <AddClusterDialogComponent onCancel={onCancel} show={show} />
      </ErrorBoundary>
    </Dialog>
  );
}
