import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { AddClusterWizard } from './AddClusterWizard';
import { useRecoilState, useRecoilValue } from 'recoil';
import { showAddClusterWizard } from 'state/showAddClusterWizard';

function AddClusterDialogComponent({ dialogRef }) {
  const [kubeconfig, setKubeconfig] = useState(undefined);
  const showWizard = useRecoilValue(showAddClusterWizard);

  useEffect(() => {
    if (!showWizard) {
      setKubeconfig(undefined);
    }
  }, [showWizard]);

  return showWizard ? (
    <AddClusterWizard
      kubeconfig={kubeconfig}
      setKubeconfig={setKubeconfig}
      dialogRef={dialogRef}
    />
  ) : null;
}
export function AddClusterDialog() {
  const { t } = useTranslation();
  const [showWizard, setShowWizard] = useRecoilState(showAddClusterWizard);
  const dialogRef = useRef(null);

  return (
    <Dialog
      open={showWizard}
      className="add-cluster-wizard-dialog"
      headerText={t('clusters.add.title')}
      onClose={() => setShowWizard(false)}
      ref={dialogRef}
    >
      <ErrorBoundary>
        <AddClusterDialogComponent dialogRef={dialogRef} />
      </ErrorBoundary>
    </Dialog>
  );
}
