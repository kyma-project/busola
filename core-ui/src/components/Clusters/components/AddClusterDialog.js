import React, { useEffect, useState } from 'react';
import { Dialog } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { AddClusterWizard } from './AddClusterWizard';

import './AddClusterDialog.scss';

export function AddClusterDialog({ show, onCancel }) {
  const [kubeconfig, setKubeconfig] = useState(undefined);
  const { t } = useTranslation();

  useEffect(() => {
    if (show) {
      setKubeconfig(undefined);
    }
  }, [show]);

  return (
    <Dialog
      show={show}
      className="add-cluster-dialog"
      title={t('clusters.add.title')}
      actions={[]}
    >
      <AddClusterWizard
        kubeconfig={kubeconfig}
        setKubeconfig={setKubeconfig}
        onCancel={onCancel}
      />
    </Dialog>
  );
}
