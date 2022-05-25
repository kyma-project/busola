import React, { useEffect, useState } from 'react';
import { useFeature } from 'shared/hooks/useFeature';
import { LayoutPanel } from 'fundamental-react';
import { Dropdown } from 'shared/ResourceForm/inputs';
import { useTranslation } from 'react-i18next';
import { useCurrentQuery } from './queries';
import './ResourceCommitment.scss';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

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
      name: 'allocatable',
      value: 1,
    },
    ...data,
  ];
  // make sure legend data is not sorted
  const legendData = [...data];
  data.sort((a, b) => a.value - b.value);

  const max = data.at(-1).value;

  let accumulatedX = 0;
  data.forEach((v, i) => {
    v.width = data[i - 1] ? data[i].value - data[i - 1].value : data[i].value;
    v.xPos = accumulatedX / max;
    accumulatedX += v.width * 100;
  });

  const allocated = data.find(d => d.name === 'allocated').value;
  const requests = data.find(d => d.name === 'requests').value;
  const limits = data.find(d => d.name === 'limits').value;

  // console.log({ allocated, requests, limits });
  // console.log(
  //   'allocated should be between ',
  //   allocated * 0.75,
  //   '(requests) and ',
  //   allocated * 1.5 + '(limits)',
  // );
  // console.log('req:', (requests / allocated) * 100);
  // console.log('lim:', (limits / allocated) * 100);

  return (
    <>
      <svg viewBox="0 0 100 8" xmlns="http://www.w3.org/2000/svg">
        {data.map(v => {
          return (
            <rect
              key={v.name}
              width={(v.width / max) * 100}
              height="100"
              x={v.xPos}
              className={`graph-box--${v.name}`}
            />
          );
        })}
      </svg>
      <legend className="graph-legend">
        {legendData.map(v => (
          <div key={v.name}>
            <Tooltip
              content={t(`graphs.resource-commitment.tooltips.${v.name}`)}
            >
              <div className={`legend-box graph-box--${v.name}`}></div>
              <span>{t(`graphs.resource-commitment.legend.${v.name}`)}</span>
            </Tooltip>
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
