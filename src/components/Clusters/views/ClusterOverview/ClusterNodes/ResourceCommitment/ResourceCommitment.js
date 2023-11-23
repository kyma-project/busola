import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFeature } from 'hooks/useFeature';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useMetricsQuery } from './useMetricsQuery';
import { CommitmentGraph } from './CommitmentGraph';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { Text } from '@ui5/webcomponents-react';

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
      return (
        <Text>{t('common.messages.error', { error: error.message })}</Text>
      );
    } else {
      return <CommitmentGraph data={data} />;
    }
  };

  return (
    <UI5Panel disableMargin title={QueryDropdown} className="commitment-graph">
      {content()}
    </UI5Panel>
  );
}
