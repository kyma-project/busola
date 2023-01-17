import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFeature } from 'hooks/useFeature';
import { LayoutPanel } from 'fundamental-react';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useMetricsQuery } from './useMetricsQuery';
import { CommitmentGraph } from './CommitmentGraph';
import './ResourceCommitment.scss';

export function ResourceCommitment() {
  const { isEnabled } = useFeature('PROMETHEUS');
  const { t } = useTranslation();
  const {
    QueryDropdown,
    queryResults: { data, loading, error },
  } = useMetricsQuery();

  if (!isEnabled) return null;

  const content = () => {
    if (loading) {
      return <Spinner />;
    } else if (error) {
      return <p>{t('common.messages.error', { error: error.message })}</p>;
    } else {
      return <CommitmentGraph data={data} />;
    }
  };

  return (
    <LayoutPanel className="commitment-graph">
      <LayoutPanel.Header>
        <LayoutPanel.Filters>{QueryDropdown}</LayoutPanel.Filters>
      </LayoutPanel.Header>
      <LayoutPanel.Body>{content()}</LayoutPanel.Body>
    </LayoutPanel>
  );
}
