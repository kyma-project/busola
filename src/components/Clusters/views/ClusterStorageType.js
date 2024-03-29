import { useState } from 'react';
import { HintButton } from 'shared/components/DescriptionHint/DescriptionHint';
import { useTranslation } from 'react-i18next';

export function ClusterStorageType({ clusterConfig }) {
  const { t } = useTranslation();
  const storage = clusterConfig?.storage;
  const [showDescription, setShowDescription] = useState(false);

  const tooltipContent = t(`clusters.storage.descriptions.${storage}`);

  return (
    <>
      {t(`clusters.statuses.${storage.toLowerCase()}`) ||
        t('clusters.statuses.unknown')}
      <HintButton
        setShowTitleDescription={setShowDescription}
        showTitleDescription={showDescription}
        description={tooltipContent}
        context="storage-type"
      ></HintButton>
    </>
  );
}
