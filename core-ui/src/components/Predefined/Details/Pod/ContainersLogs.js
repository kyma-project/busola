import React, { useState, useEffect, useRef } from 'react';
import { saveAs } from 'file-saver';
import { Button, LayoutPanel, Switch } from 'fundamental-react';
import {
  useGetStream,
  useWindowTitle,
  PageHeader,
  SearchInput,
  useNotification,
} from 'react-shared';
import './ContainersLogs.scss';

export const ContainersLogs = ({ params }) => {
  return <Logs params={params} />;
};

function Logs({ params }) {
  useWindowTitle('Logs');
  const notification = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [logsToSave, setLogsToSave] = useState([]);
  const selectedLogIndex = useRef(0);

  const breadcrumbs = [
    {
      name: 'Pods',
      path: '/',
      fromContext: 'pods',
    },
    {
      name: params.podName,
      path: '/',
      fromContext: 'pod',
    },
    { name: '' },
  ];

  const url = `/api/v1/namespaces/${params.namespace}/pods/${params.podName}/log?container=${params.containerName}&follow=true&tailLines=1000&timestamps=true`;
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
            part.toLowerCase() === searchText.toLowerCase() ? (
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
        title: 'Failed to download the Logs',
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
          No logs avaliable for the '{containerName}' container.
        </div>
      );

    return data.map((arr, idx) => {
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
    <div className="logs-wraper">
      <div className="logs-header">
        <PageHeader
          title={params.containerName}
          breadcrumbItems={breadcrumbs}
        ></PageHeader>
      </div>
      <LayoutPanel className="fd-margin--md logs-panel">
        <LayoutPanel.Header>
          <LayoutPanel.Head title="Logs" />
          <LayoutPanel.Actions className="logs-actions">
            <Switch
              disabled={!logsToSave?.length}
              compact
              onChange={onSwitchChange}
            >
              {showTimestamps ? 'Hide timestamps' : 'Show timestamps'}
            </Switch>
            <Button
              disabled={!logsToSave?.length}
              className="logs-download"
              onClick={() => saveToFile(params.podName, params.containerName)}
            >
              Save to a file
            </Button>
            <SearchInput
              disabled={!logsToSave?.length}
              entriesKind={'Logs'}
              searchQuery={searchQuery}
              handleQueryChange={setSearchQuery}
              showSuggestion={false}
              onKeyDown={changeSelectedLog}
            />
          </LayoutPanel.Actions>
        </LayoutPanel.Header>
        <LayoutPanel.Body className="logs-panel-body">
          <LogsPanel
            streamData={streamData}
            containerName={params.containerName}
          />
        </LayoutPanel.Body>
      </LayoutPanel>
    </div>
  );
}
