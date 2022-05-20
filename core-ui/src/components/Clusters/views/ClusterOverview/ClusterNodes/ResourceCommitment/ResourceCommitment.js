import React, { useEffect, useState } from 'react';
import { useFeature } from 'shared/hooks/useFeature';
import { LayoutPanel } from 'fundamental-react';
import { Dropdown } from 'shared/ResourceForm/inputs';
import { useTranslation } from 'react-i18next';
import { useCurrentQuery } from './queries';
import './ResourceCommitment.scss';
import { Spinner } from 'shared/components/Spinner/Spinner';

function useMetricQuery({ serviceUrl, time }) {
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

function CommitmentGraph({ data }) {
  data = [
    ...data,
    {
      name: 'allocatable',
      value: 1,
    },
  ];
  data.sort((a, b) => a.value - b.value);

  const max = data.at(-1).value;

  data.forEach((v, i) => {
    v.width = data[i - 1] ? data[i].value - data[i - 1].value : data[i].value;
  });

  return (
    <div className="graph">
      {data.map((v, i) => {
        return (
          <div
            key={v.name}
            className={`box--${v.name}`}
            style={{
              width: `${(v.width / max) * 100}%`,
              zIndex: data.length - i,
            }}
          ></div>
        );
      })}
    </div>
  );
}

function ResourceCommitmentComponent({ serviceUrl }) {
  const { t } = useTranslation();
  const [time, setTime] = useState(Math.floor(Date.now() / 1000));
  const { QueryDropdown, queryResults, queryType } = useMetricQuery({
    serviceUrl,
    time,
  });

  const { data, loading, error } = queryResults;

  useEffect(() => {
    const REFETCH_RATE_MS = 30 * 1000;
    const id = setInterval(
      () => setTime(Math.floor(Date.now() / 1000)),
      REFETCH_RATE_MS,
    );
    return () => clearInterval(id);
  }, [queryType]);

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
      <LayoutPanel.Body className="graph-wrapper">{content()}</LayoutPanel.Body>
    </LayoutPanel>
  );
}

export function ResourceCommitment() {
  const { isEnabled, serviceUrl } = useFeature('PROMETHEUS');
  if (!isEnabled) return null;
  return <ResourceCommitmentComponent serviceUrl={serviceUrl} />;
}
