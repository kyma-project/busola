import React, { useEffect, useState } from 'react';
import { Dialog } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { YamlUploadWizard } from './YamlUploadWizard';

export function YamlUploadDialog({ show, onCancel }) {
  const [yamlContent, setYamlContent] = useState(undefined);
  const { t } = useTranslation();

  useEffect(() => {
    if (show) {
      setYamlContent(undefined);
    }
  }, [show]);

  return (
    <Dialog
      show={show}
      className="add-cluster-dialog"
      title={t('clusters.add.title')}
      actions={[]}
    >
      <YamlUploadWizard
        yamlContent={yamlContent}
        setYamlContent={setYamlContent}
        onCancel={onCancel}
      />
    </Dialog>
  );
}
