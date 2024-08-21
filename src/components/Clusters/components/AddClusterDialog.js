import React, { useEffect, useState } from 'react';
import { Dialog } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { AddClusterWizard } from './AddClusterWizard';
import { useRecoilState, useRecoilValue } from 'recoil';
import { showAddClusterWizard } from 'state/showAddClusterWizard';

function AddClusterDialogComponent() {
  const [kubeconfig, setKubeconfig] = useState(undefined);
  const showWizard = useRecoilValue(showAddClusterWizard);

  useEffect(() => {
    if (!showWizard) {
      setKubeconfig(undefined);
    }
  }, [showWizard]);

  return showWizard ? (
    <AddClusterWizard kubeconfig={kubeconfig} setKubeconfig={setKubeconfig} />
  ) : null;
}
export function AddClusterDialog() {
  const { t } = useTranslation();
  const [showWizard, setShowWizard] = useRecoilState(showAddClusterWizard);

  return (
    <Dialog
      open={showWizard}
      className="add-cluster-wizard-dialog"
      headerText={t('clusters.add.title')}
      onAfterClose={() => setShowWizard(false)}
    >
      <ErrorBoundary>
        <AddClusterDialogComponent />
      </ErrorBoundary>
    </Dialog>
  );
}
