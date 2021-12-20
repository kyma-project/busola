import React, { useEffect, useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { Dropdown } from 'react-shared';
import { useTranslation } from 'react-i18next';

export const EVENT_MESSAGE_TYPE = {
  ALL: { key: 'All', text: 'all' },
  NORMAL: { key: 'Normal', text: 'information' },
  WARNING: { key: 'Warning', text: 'warnings' },
};

export const RESOURCE_PATH = {
  Pod: 'pods',
  Job: 'jobs',
  CronJob: 'cronjobs',
  ReplicaSet: 'replicasets',
  StatefulSet: 'statefulsets',
  DaemonSet: 'daemonsets',
  Deployment: 'deployments',
  Function: 'functions',
  ServiceBroker: 'brokers',
  Certificate: 'certificates',
  Node: 'nodes',
};

export const useMessageList = items => {
  const [displayType, setDisplayType] = useState(EVENT_MESSAGE_TYPE.ALL);
  const [sortedItems, setSortedItems] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    //sorts the messages from the newest once data fetched
    if (items) {
      const sorted = items.sort((first, second) => {
        const firstCreationTime = new Date(first.firstTimestamp).getTime();
        const secondCreationTime = new Date(second.firstTimestamp).getTime();
        return secondCreationTime - firstCreationTime;
      });
      setSortedItems([...sorted]);
    }
  }, [items, setSortedItems]);

  const navigateToObjectDetails = ({ namespace, name, kind }) => {
    const namespacePrefix = namespace ? `namespaces/${namespace}/` : '';
    const path = `${namespacePrefix}${RESOURCE_PATH[kind]}/details/${name}`;
    LuigiClient.linkManager()
      .fromContext('cluster')
      .navigate(path);
  };
  const navigateToNodeDetails = nodeName => {
    LuigiClient.linkManager().navigate(`nodes/${nodeName}`);
  };

  const formatInvolvedObject = obj => {
    const namespacePrefix = obj.namespace || '';
    const text = `${obj.kind} ${namespacePrefix}/${obj.name}`;
    const isLink = !!RESOURCE_PATH[obj.kind];
    return isLink ? (
      <Link
        className="fd-link"
        onClick={() => {
          if (obj.kind === 'Node') {
            navigateToNodeDetails(obj.name);
          } else {
            navigateToObjectDetails(obj);
          }
        }}
      >
        {text}
      </Link>
    ) : (
      text
    );
  };

  const messageSelector = (
    <Dropdown
      compact
      options={Object.values(EVENT_MESSAGE_TYPE).map(el => ({
        key: el.key,
        text: t(`node-details.${el.text}`),
      }))}
      selectedKey={displayType.key}
      onSelect={(_, { key }) => {
        setDisplayType(
          Object.values(EVENT_MESSAGE_TYPE).find(type => type.key === key),
        );
      }}
    />
  );

  return {
    displayType,
    setDisplayType,
    sortedItems,
    formatInvolvedObject,
    navigateToObjectDetails,
    messageSelector,
  };
};
