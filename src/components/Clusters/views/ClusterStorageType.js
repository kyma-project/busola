import { useState } from 'react';
import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';
import { useTranslation } from 'react-i18next';
import { spacing } from '@ui5/webcomponents-react-base';

export function ClusterStorageType({ clusterConfig }) {
  const { t } = useTranslation();
  const storage = clusterConfig?.storage;
  const [showDescription, setShowDescription] = useState(false);

  const tooltipContent = t(`clusters.storage.descriptions.${storage}`);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {t(`clusters.statuses.${storage?.toLowerCase()}`) ||
        t('clusters.statuses.unknown')}
      <HintButton
        style={spacing.sapUiTinyMarginBegin}
        setShowTitleDescription={setShowDescription}
        showTitleDescription={showDescription}
        description={tooltipContent}
      ></HintButton>
    </div>
  );
}
