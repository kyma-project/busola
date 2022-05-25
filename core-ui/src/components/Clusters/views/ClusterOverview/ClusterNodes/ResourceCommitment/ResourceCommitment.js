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
  const { t } = useTranslation();
  data = [
    {
      name: 'capacity',
      value: 1,
    },
    ...data,
  ];

  const utilized = data.find(d => d.name === 'utilized').value;
  const capacity = data.find(d => d.name === 'capacity').value;
  const limits = data.find(d => d.name === 'limits').value;

  const shouldShowAllocatable = limits < capacity;

  data = data.filter(d => d.name !== 'utilized');
  if (!shouldShowAllocatable) {
    data = data.filter(d => d.name !== 'capacity');
  }
  data.sort((a, b) => a.value - b.value);

  const sum = data.reduce((prev, curr) => prev + curr.value, 0);

  let accumulatedX = 0;
  data.forEach((v, i) => {
    v.width = (data[i].value / sum) * 100;
    v.xPos = accumulatedX;
    accumulatedX += v.width;
  });

  const dataToShow = shouldShowAllocatable
    ? ['requests', 'limits', 'capacity']
    : ['requests', 'limits'];

  return (
    <>
      <svg viewBox="0 0 100 12" xmlns="http://www.w3.org/2000/svg">
        {dataToShow.map(ds => {
          const v = data.find(d => d.name === ds);
          return (
            <rect
              key={v.name}
              width={v.width}
              x={v.xPos}
              height="4"
              y="4"
              className={`graph-box--${v.name}`}
            />
          );
        })}
        <svg x={(utilized / sum) * 100}>
          <text y="3" className="a">
            {t('graphs.resource-commitment.utilized')}
          </text>
          <rect height="4" y="4" width="0.2" x="-0.1" />
          <polygon points="-0.5,3.3, 0.5,3.3, 0,4" />
        </svg>
        {!shouldShowAllocatable && (
          <>
            <svg x={(capacity / sum) * 100}>
              <text y="9" className="b">
                {t('graphs.resource-commitment.capacity')}
              </text>
              <rect
                className="graph-box--utilized"
                height="4"
                y="4"
                width="0.2"
                x="-0.1"
              />
              <polygon
                className="graph-box--utilized"
                points="-0.5,8.7, 0.5,8.7, 0,8"
              />
              ;
            </svg>
          </>
        )}
      </svg>
      <legend className="graph-legend">
        {dataToShow.map(e => (
          <div key={e}>
            <div className={`legend-box graph-box--${e}`}></div>
            <span>{t(`graphs.resource-commitment.${e}`)}</span>
          </div>
        ))}
      </legend>
    </>
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
    const REFETCH_RATE_MS = 60 * 1000;
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
