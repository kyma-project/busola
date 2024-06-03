import { useState } from 'react';

import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { Link } from 'shared/components/Link/Link';
import pluralize from 'pluralize';

export const EVENT_MESSAGE_TYPE = {
  ALL: { key: 'All', text: 'all' },
  NORMAL: { key: 'Normal', text: 'information' },
  WARNING: { key: 'Warning', text: 'warnings' },
};

export const RESOURCE_PATH = {
  CAPOperator: 'customresources/capoperators.operator.sme.sap.com',
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
  HorizontalPodAutoscaler: 'horizontalpodautoscalers',
  Ingress: 'ingresses',
  Issuer: 'issuers',
  Job: 'jobs',
  Node: 'overview/nodes',
  PersistentVolume: 'persistentvolumes',
  PersistentVolumeClaim: 'persistentvolumeclaims',
  Pod: 'pods',
  ReplicaSet: 'replicasets',
  Serverless: 'serverlesses',
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
  console.log(obj);
  const namespacePrefix = obj.namespace ? `${obj.namespace}` : '';
  const namespaceOverride = obj.namespace ? { namespace: obj.namespace } : null;

  const text = `${obj.kind} ${namespacePrefix}/${obj.name}`;
  const isLink = !!RESOURCE_PATH[obj.kind];
  console.log([obj.kind]);
  const { scopedUrl } = useUrl();
  const path = isLink
    ? `${RESOURCE_PATH[obj.kind]}/${obj.name}`
    : `${pluralize(obj?.kind).toLocaleLowerCase()}/${obj.name}`;
  return isLink ? (
    <Link url={scopedUrl(path, namespaceOverride)}>{text}</Link>
  ) : (
    text
  );
};

export const FormatSourceObject = obj => {
  console.log(obj);
  const { clusterUrl } = useUrl();
  if (!obj || Object.keys(obj).length === 0) return EMPTY_TEXT_PLACEHOLDER;
  return obj.host ? (
    <Link url={clusterUrl(`overview/nodes/${obj.host}`)}>{obj.host}</Link>
  ) : (
    obj.component
  );
};

export const useMessageList = (defaultType = EVENT_MESSAGE_TYPE.ALL) => {
  const [displayType, setDisplayType] = useState(defaultType);
  const { t } = useTranslation();

  const MessageSelector = (
    <Dropdown
      accessibleName="message-type"
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
