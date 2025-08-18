import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { AddClusterWizard } from './AddClusterWizard';
import { useAtom } from 'jotai';
import { showAddClusterWizard } from 'state/showAddClusterWizard';

export function AddClusterDialog() {
  const { t } = useTranslation();
  const [showWizard, setShowWizard] = useAtom(showAddClusterWizard);
  const [kubeconfig, setKubeconfig] = useState(undefined);
  const buttonsContainerRef = useRef(null);

  useEffect(() => {
    if (!showWizard) {
      setKubeconfig(undefined);
    }
  }, [showWizard]);

  return (
    <Dialog
      open={showWizard}
      className="add-cluster-wizard-dialog"
      headerText={t('clusters.add.title')}
      onClose={() => setShowWizard(false)}
    >
      <ErrorBoundary>
        {showWizard ? (
          <AddClusterWizard
            kubeconfig={kubeconfig}
            setKubeconfig={setKubeconfig}
            buttonsContainerRef={buttonsContainerRef}
          />
        ) : null}
        <div ref={buttonsContainerRef}></div>
      </ErrorBoundary>
    </Dialog>
  );
}
