import React, { useState } from 'react';
import { Dropdown } from 'shared/ResourceForm/inputs';
import { useTranslation } from 'react-i18next';
import { useCurrentQuery } from './queries';

export function useMetricsQuery({ serviceUrl, time }) {
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

  const QueryDropdown = (
    <Dropdown
      compact={false}
      fullWidth={false}
      className="query-dropdown"
      selectedKey={queryType}
      onSelect={(_, { key }) => {
        setQueryType(key);
      }}
      options={[CPU_QUERY, MEMORY_QUERY]}
    />
  );

  return {
    QueryDropdown,
    queryResults,
    queryType,
  };
}
