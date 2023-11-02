import { useState, useEffect, useRef } from 'react';
import { saveAs } from 'file-saver';
import {
  Button,
  Label,
  Switch,
  Select,
  Option,
  Text,
} from '@ui5/webcomponents-react';
import { useGetStream } from 'shared/hooks/BackendAPI/useGet';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useNotification } from 'shared/contexts/NotificationContext';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { SearchInput } from 'shared/components/GenericList/SearchInput';
import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

import './ContainersLogs.scss';

const HOUR_IN_SECONDS = 3600;
const MAX_TIMEFRAME_IN_SECONDS = Number.MAX_SAFE_INTEGER;
const DEFAULT_TIMEFRAME = HOUR_IN_SECONDS * 6;

const ContainersLogs = ({ params }) => {
  const { t } = useTranslation();

  useWindowTitle('Logs');
  const notification = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [reverseLogs, setReverseLogs] = useState(false);
  const [logsToSave, setLogsToSave] = useState([]);
  const [sinceSeconds, setSinceSeconds] = useState(String(DEFAULT_TIMEFRAME));
  const selectedLogIndex = useRef(0);
  const { namespaceUrl } = useUrl();

  const logTimeframeOptions = [
    { text: '1 hour', key: String(HOUR_IN_SECONDS) },
    { text: '3 hours', key: String(3 * HOUR_IN_SECONDS) },
    { text: '6 hours', key: String(6 * HOUR_IN_SECONDS) },
    { text: '1 day', key: String(24 * HOUR_IN_SECONDS) },
    { text: 'all', key: String(MAX_TIMEFRAME_IN_SECONDS) },
  ];

  const breadcrumbs = [
    {
      name: 'Pods',
      url: namespaceUrl('pods'),
    },
    {
      name: params.podName,
      url: namespaceUrl(`pods/${params.podName}`),
    },
    { name: '' },
  ];

  const url = `/api/v1/namespaces/${params.namespace}/pods/${params.podName}/log?container=${params.containerName}&follow=true&tailLines=1000&timestamps=true&sinceSeconds=${sinceSeconds}`;
  const streamData = useGetStream(url);

  useEffect(() => {
    selectedLogIndex.current = 0;
    scrollToSelectedLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  function highlightSearch(log, searchText) {
    if (searchText) {
      const logArray = log.split(new RegExp(`(${searchText})`, 'gi'));
      return (
        <span>
          {logArray.map((part, idx) =>
            part?.toLowerCase() === searchText?.toLowerCase() ? (
              <b key={idx} className="logs-highlighted">
                {part}
              </b>
            ) : (
              part
            ),
          )}
        </span>
      );
    }
    return <span>{log}</span>;
  }

  const scrollToSelectedLog = () => {
    const highlightedLogs = document.getElementsByClassName('logs-highlighted');
    if (selectedLogIndex.current < 0) {
      selectedLogIndex.current = highlightedLogs?.length - 1 || 0;
    } else if (selectedLogIndex.current > highlightedLogs?.length - 1) {
      selectedLogIndex.current = 0;
    }
    const selectedLog = highlightedLogs[selectedLogIndex.current];
    if (selectedLog) {
      selectedLog.scrollIntoView();
    }
  };

  const changeSelectedLog = e => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      selectedLogIndex.current = selectedLogIndex.current + 1;
      scrollToSelectedLog();
    } else if (e.key === 'ArrowUp') {
      selectedLogIndex.current = selectedLogIndex.current - 1;
      scrollToSelectedLog();
    }
  };

  const onSwitchChange = () => {
    setShowTimestamps(prev => !prev);
  };

  const onReverseChange = () => {
    setReverseLogs(prev => !prev);
  };

  const onLogTimeframeChange = timeValue => {
    setSinceSeconds(timeValue);
  };

  const saveToFile = (podName, containerName) => {
    const dateObj = new Date();
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();
    const date = `${day}-${month}-${year}-${hour}-${minute}`;

    try {
      const file = new Blob(
        logsToSave.map(log => `${log}\n`),
        { type: 'text/plain' },
      );
      saveAs(file, `${podName}-${containerName}-${date}.txt`);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: t('pods.message.failed-to-download'),
        content: e.message,
      });
    }
  };

  const LogsPanel = ({ streamData, containerName }) => {
    const { error, data } = streamData;
    if (error) return <div className="empty-logs">{error.message}</div>;
    setLogsToSave(data || []);

    if (data.length === 0)
      return (
        <div className="empty-logs">
          <Text>
            {t('pods.message.no-logs-available', {
              containerName: containerName,
            })}
          </Text>
        </div>
      );

    const newData = reverseLogs ? [...data].reverse() : [...data];

    return newData.map((arr, idx) => {
      const timestamp = arr.split(' ')[0];
      const stream = arr.replace(timestamp, '');
      const log = showTimestamps ? `${timestamp} ${stream}` : stream;
      const highlightedLog = highlightSearch(log, searchQuery);
      return (
        <div className="logs" key={idx}>
          {highlightedLog}
        </div>
      );
    });
  };

  return (
    <DynamicPageComponent
      title={params.containerName}
      breadcrumbItems={breadcrumbs}
      content={
        <UI5Panel
          title={t('pods.labels.logs')}
          headerActions={
            <>
              <Label for="context-chooser">
                {t('pods.labels.filter-timeframe')}
              </Label>
              <Select
                onChange={event => {
                  const selectedTimeFrame = event.detail.selectedOption.value;
                  onLogTimeframeChange(selectedTimeFrame);
                }}
              >
                {logTimeframeOptions.map(option => (
                  <Option
                    value={option.key}
                    selected={sinceSeconds.toString() === option.key}
                  >
                    {option.text}
                  </Option>
                ))}
              </Select>
              <Label className="bsl-margin-begin--sm">
                {t('pods.labels.show-timestamps')}
              </Label>
              <Switch
                disabled={!logsToSave?.length}
                onChange={onSwitchChange}
              />
              <Label className="bsl-margin-begin--sm">
                {t('pods.labels.reverse-logs')}
              </Label>
              <Switch
                disabled={!logsToSave?.length}
                onChange={onReverseChange}
              />
              <Button
                disabled={!logsToSave?.length}
                className="logs-download"
                onClick={() => saveToFile(params.podName, params.containerName)}
              >
                {t('pods.labels.save-to-file')}
              </Button>
              <SearchInput
                disabled={!logsToSave?.length}
                title={'Logs'}
                searchQuery={searchQuery}
                handleQueryChange={setSearchQuery}
                showSuggestion={false}
                onKeyDown={changeSelectedLog}
              />
            </>
          }
        >
          <div className="logs-panel-body">
            <LogsPanel
              streamData={streamData}
              containerName={params.containerName}
            />
          </div>
        </UI5Panel>
      }
    />
  );
};

export default ContainersLogs;
