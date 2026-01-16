import { Dialog } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { AddClusterWizard } from './AddClusterWizard';
import { useAtom } from 'jotai';
import { showAddClusterWizardAtom } from 'state/showAddClusterWizardAtom';

export function AddClusterDialog() {
  const { t } = useTranslation();
  const [showWizard, setShowWizard] = useAtom(showAddClusterWizardAtom);

  const handleCloseDialog = () => {
    setShowWizard(false);
  };

  return (
    <Dialog
      open={showWizard}
      className="add-cluster-wizard-dialog"
      headerText={t('clusters.add.title')}
      onClose={handleCloseDialog}
    >
      <ErrorBoundary>{showWizard ? <AddClusterWizard /> : null}</ErrorBoundary>
    </Dialog>
  );
}
