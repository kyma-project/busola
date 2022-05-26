import React, { useEffect, useState } from 'react';
import { Dropdown } from 'shared/ResourceForm/inputs';
import { useTranslation } from 'react-i18next';
import { useCurrentQuery } from './queries';
import { useFeature } from 'shared/hooks/useFeature';

export function useMetricsQuery() {
  const { serviceUrl } = useFeature('PROMETHEUS');
  const [time, setTime] = useState(Date.now());
  const { t } = useTranslation();

  const CPU_QUERY = {
    text: t('graphs.resource-commitment.cpu'),
    key: 'cpu',
  };

  const MEMORY_QUERY = {
    text: t('graphs.resource-commitment.memory'),
    key: 'memory',
  };

  const [queryType, setQueryType] = useState(CPU_QUERY.key);
  const queryResults = useCurrentQuery({
    serviceUrl,
    time,
    queryType,
  });

  useEffect(() => {
    const REFETCH_RATE_MS = 60 * 1000;
    const id = setInterval(() => setTime(Date.now()), REFETCH_RATE_MS);
    return () => clearInterval(id);
  }, [queryType]);

  const QueryDropdown = (
    <Dropdown
      fullWidth={false}
      className="query-dropdown"
      selectedKey={queryType}
      onSelect={(_, { key }) => setQueryType(key)}
      options={[CPU_QUERY, MEMORY_QUERY]}
    />
  );

  return {
    QueryDropdown,
    queryResults,
    queryType,
  };
}
