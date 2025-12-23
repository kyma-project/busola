import { useRef, useState } from 'react';
import { Dialog } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { AddClusterWizard } from './AddClusterWizard';
import { useAtom } from 'jotai';
import { showAddClusterWizardAtom } from 'state/showAddClusterWizardAtom';

export function AddClusterDialog() {
  const { t } = useTranslation();
  const [showWizard, setShowWizard] = useAtom(showAddClusterWizardAtom);
  const [kubeconfig, setKubeconfig] = useState(undefined);
  const dialogRef = useRef(null);

  const handleCloseDialog = () => {
    setShowWizard(false);
    setKubeconfig(undefined);
  };

  return (
    <Dialog
      open={showWizard}
      className="add-cluster-wizard-dialog"
      headerText={t('clusters.add.title')}
      onClose={handleCloseDialog}
    >
      <ErrorBoundary>
        {showWizard ? (
          <AddClusterWizard
            kubeconfig={kubeconfig}
            setKubeconfig={setKubeconfig}
            dialogRef={dialogRef}
          />
        ) : null}
        <div ref={dialogRef}></div>
      </ErrorBoundary>
    </Dialog>
  );
}
