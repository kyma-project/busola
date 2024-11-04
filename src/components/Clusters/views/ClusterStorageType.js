import { useState } from 'react';
import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';
import { useTranslation } from 'react-i18next';

export function ClusterStorageType({ clusterConfig }) {
  const { t } = useTranslation();
  const storage = clusterConfig?.storage;
  const [showDescription, setShowDescription] = useState(false);

  const tooltipContent = t(`clusters.storage.descriptions.${storage}`);

  const storageType =
    t(`clusters.statuses.${storage?.toLowerCase()}`) ||
    t('clusters.statuses.unknown');

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {storageType}
      <HintButton
        className="sap-margin-begin-tiny"
        setShowTitleDescription={setShowDescription}
        showTitleDescription={showDescription}
        description={tooltipContent}
        ariaTitle={storageType}
      />
    </div>
  );
}
