import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'react-router-dom';

import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';

export const EVENT_MESSAGE_TYPE = {
  ALL: { key: 'All', text: 'all' },
  NORMAL: { key: 'Normal', text: 'information' },
  WARNING: { key: 'Warning', text: 'warnings' },
};

export const RESOURCE_PATH = {
  Certificate: 'certificates',
  ConfigMap: 'configmaps',
  CronJob: 'cronjobs',
  DaemonSet: 'daemonsets',
  Deployment: 'deployments',
  DestinationRule: 'destinationrules',
  DNSEntry: 'dnsentries',
  DNSProvider: 'dnsproviders',
  Event: 'events',
  Gateway: 'gateways',
  HorizontalPodAutoscaler: 'horizontalpodautoscalers',
  Ingress: 'ingresses',
  Issuer: 'issuers',
  Job: 'jobs',
  Node: 'overview/nodes',
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
export const filterByResource = (resourceKind, resourceName) => e =>
  e.involvedObject?.name === resourceName &&
  e.involvedObject?.kind === resourceKind;

export const FormatInvolvedObject = obj => {
  const namespacePrefix = obj.namespace ? `${obj.namespace}` : '';
  const namespaceOverride = obj.namespace ? { namespace: obj.namespace } : null;

  const text = `${obj.kind} ${namespacePrefix}/${obj.name}`;
  const isLink = !!RESOURCE_PATH[obj.kind];
  const { scopedUrl } = useUrl();
  const path = `${RESOURCE_PATH[obj.kind]}/${obj.name}`;
  return isLink ? (
    <Link className="fd-link" to={scopedUrl(path, namespaceOverride)}>
      {text}
    </Link>
  ) : (
    text
  );
};

export const FormatSourceObject = obj => {
  const { clusterUrl } = useUrl();
  if (!obj || Object.keys(obj).length === 0) return EMPTY_TEXT_PLACEHOLDER;
  return obj.host ? (
    <Link className="fd-link" to={clusterUrl(`overview/nodes/${obj.host}`)}>
      {obj.host}
    </Link>
  ) : (
    obj.component
  );
};

export const useMessageList = (defaultType = EVENT_MESSAGE_TYPE.ALL) => {
  const [displayType, setDisplayType] = useState(defaultType);
  const { t } = useTranslation();

  const MessageSelector = (
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
    FormatInvolvedObject,
    FormatSourceObject,
    MessageSelector,
    EVENT_MESSAGE_TYPE,
  };
};
