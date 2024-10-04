import { useState } from 'react';
import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';
import { useTranslation } from 'react-i18next';
import { spacing } from '@ui5/webcomponents-react-base';

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
        style={spacing.sapUiTinyMarginBegin}
        setShowTitleDescription={setShowDescription}
        showTitleDescription={showDescription}
        description={tooltipContent}
        ariaTitle={storageType}
      />
    </div>
  );
}
