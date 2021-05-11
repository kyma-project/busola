import React, { useState } from 'react';
import { Button, LayoutPanel, Switch } from 'fundamental-react';
import {
  useGetStream,
  useWindowTitle,
  PageHeader,
  SearchInput,
} from 'react-shared';
import './ContainersLogs.scss';

export const ContainersLogs = ({ params }) => {
  return <Logs params={params} />;
};

function Logs({ params }) {
  useWindowTitle('Logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [textToSave, setTextToSave] = useState([]);

  const filterEntries = (entries, query) => {
    if (!query) return entries;

    const filterEntry = entry =>
      entry
        .toString()
        .toLowerCase()
        .indexOf(query.toLowerCase()) !== -1;

    return entries.filter(filterEntry);
  };

  const breadcrumbs = [
    {
      name: 'Pods',
      path: '/',
      fromAbsolutePath: false,
    },
    {
      name: params.podName,
      path: `/details/${params.podName}`,
      fromAbsolutePath: false,
    },
    { name: '' },
  ];

  const url = `/api/v1/namespaces/${params.namespace}/pods/${params.podName}/log?container=${params.containerName}&follow=true&tailLines=1000&timestamps=true`;
  const streamData = useGetStream(url);

  const LogsPanel = ({ streamData, containerName }) => {
    const { error, data } = streamData;
    if (error) return error.message;
    setTextToSave(data || []);

    const filteredEntries = filterEntries(data, searchQuery);

    if (filteredEntries.length === 0)
      return (
        <div className="empty-logs">
          No logs avaliable for the '{containerName}' container.
        </div>
      );

    return filteredEntries.map((arr, idx) => {
      const timestamp = arr.split(' ')[0];
      const stream = arr.replace(timestamp, '');
      return (
        <div className="logs" key={idx}>
          {showTimestamps ? `${timestamp} ${stream}` : stream}
        </div>
      );
    });
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

    const element = document.createElement('a');
    const file = new Blob(textToSave, { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${podName}-${containerName}-${date}.txt`;
    document.body.appendChild(element); // required for this to work in FireFox
    element.click();
  };

  return (
    <>
      <PageHeader
        title={params.containerName}
        breadcrumbItems={breadcrumbs}
      ></PageHeader>
      <LayoutPanel className="fd-margin--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title="Logs" />
          <LayoutPanel.Actions className="logs-actions">
            <Switch compact onChange={onSwitchChange}>
              {showTimestamps ? 'Hide timestamps' : 'Show timestamps'}
            </Switch>
            <Button
              className="logs-download"
              onClick={() => saveToFile(params.podName, params.containerName)}
            >
              Save to a file
            </Button>
            <SearchInput
              entriesKind={'Logs'}
              searchQuery={searchQuery}
              handleQueryChange={setSearchQuery}
              showSuggestion={false}
            />
          </LayoutPanel.Actions>
        </LayoutPanel.Header>
        <LayoutPanel.Body className="logs-panel">
          <LogsPanel
            streamData={streamData}
            containerName={params.containerName}
          />
        </LayoutPanel.Body>
      </LayoutPanel>
    </>
  );
}
