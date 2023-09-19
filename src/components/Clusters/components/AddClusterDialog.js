import React, { useEffect, useState } from 'react';
import { Dialog } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { AddClusterWizard } from './AddClusterWizard';

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
  const { t } = useTranslation();

  return (
    <Dialog
      open={show}
      className="wizard-dialog"
      headerText={t('clusters.add.title')}
    >
      <ErrorBoundary>
        <AddClusterDialogComponent onCancel={onCancel} show={show} />
      </ErrorBoundary>
    </Dialog>
  );
}
