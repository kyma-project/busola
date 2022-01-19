import React, { useEffect, useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import {
  Dropdown,
  EMPTY_TEXT_PLACEHOLDER,
  useMicrofrontendContext,
} from 'react-shared';
import { useTranslation } from 'react-i18next';

export const EVENT_MESSAGE_TYPE = {
  ALL: { key: 'All', text: 'all' },
  NORMAL: { key: 'Normal', text: 'information' },
  WARNING: { key: 'Warning', text: 'warnings' },
};
export const RESOURCE_PATH = {
  APIRule: 'apirules',
  Certificate: 'certificates',
  ConfigMap: 'configmaps',
  CronJob: 'cronjobs',
  DaemonSet: 'daemonsets',
  Deployment: 'deployments',
  DestinationRule: 'destinationrules',
  DNSEntry: 'dnsentries',
  DNSProvider: 'dnsproviders',
  Event: 'events',
  Function: 'functions',
  Gateway: 'gateways',
  HorizontalPodAutoscaler: 'hpas',
  Ingress: 'ingresses',
  Job: 'jobs',
  Node: 'nodes',
  PersistentVolume: 'persistentvolumes',
  PersistentVolumeClaim: 'persistentvolumeclaims',
  Pod: 'pods',
  ReplicaSet: 'replicasets',
  Service: 'services',
  ServiceAccount: 'serviceaccounts',
  StatefulSet: 'statefulsets',
  StorageClass: 'storageclasses',
  Subscription: 'subscriptions',
  VirtualService: 'virtualservices',
};

const navigateToObjectDetails = ({ namespace, name, kind }) => {
  const namespacePrefix = namespace ? `namespaces/${namespace}/` : '';
  const path = `${namespacePrefix}${RESOURCE_PATH[kind]}/details/${name}`;
  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(path);
};

const navigateToNodeDetails = nodeName => {
  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(`/overview/nodes/${nodeName}`);
};

export const formatInvolvedObject = obj => {
  const namespacePrefix = obj.namespace ? `${obj.namespace}` : '';
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

export const formatSourceObject = obj => {
  if (!obj) return EMPTY_TEXT_PLACEHOLDER;
  return obj.host ? (
    <Link className="fd-link" onClick={() => navigateToNodeDetails(obj.host)}>
      {obj.host}
    </Link>
  ) : (
    obj.component
  );
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
    formatSourceObject,
    navigateToObjectDetails,
    navigateToNodeDetails,
    messageSelector,
  };
};
