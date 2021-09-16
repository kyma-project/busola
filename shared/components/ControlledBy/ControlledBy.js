import React from 'react';
import { EMPTY_TEXT_PLACEHOLDER } from '../../constants/constants';
import { Link } from 'fundamental-react';
import {
  navigateToClusterResourceDetails,
  navigateToFixedPathResourceDetails,
  navigateToCustomResourceDefinitionDetails,
} from '../..';

const DEFAULT_VIEWS = [
  'addonsconfigurations',
  'apirules',
  'certificates',
  'functions',
  'configmaps',
  'cronjobs',
  'daemonsets',
  'deployments',
  'dnsentries',
  'dnsproviders',
  'gateways',
  'gitrepositories',
  'issuers',
  'jobs',
  'oauth2clients',
  'pods',
  'replicasets',
  'rolebindings',
  'roles',
  'secrets',
  'servicebindings',
  'serviceinstances',
  'services',
  'statefulsets',
];

const DEFAULT_CLUSTER_VIEWS = [
  'applications',
  'clusteraddonsconfigurations',
  'clusterrolebindings',
  'clusterroles',
  'namespaces',
];

const GoToDetailsLink = ({ resource, name, apiVersion }) => {
  if (!resource) return null;
  if (DEFAULT_VIEWS.includes(resource)) {
    return (
      <Link
        className="fd-link"
        onClick={_ => {
          navigateToFixedPathResourceDetails(resource, name);
        }}
      >
        ({name})
      </Link>
    );
  } else if (DEFAULT_CLUSTER_VIEWS.includes(resource)) {
    return (
      <Link
        className="fd-link"
        onClick={_ => {
          navigateToClusterResourceDetails(resource, name);
        }}
      >
        ({name})
      </Link>
    );
  } else if (apiVersion === 'apps/v1') {
    return <>({name})</>;
  } else {
    return (
      <Link
        className="fd-link"
        onClick={_ => {
          navigateToCustomResourceDefinitionDetails(resource, apiVersion, name);
        }}
      >
        ({name})
      </Link>
    );
  }
};
export const ControlledBy = ({ ownerReferences }) => {
  if (!ownerReferences?.length) return EMPTY_TEXT_PLACEHOLDER;
  return (
    <>
      {ownerReferences.map((owner, index) => {
        const className = index > 0 ? 'fd-margin-top--sm' : '';
        const resource = owner.kind.endsWith('s')
          ? `${owner.kind.toLowerCase()}es`
          : `${owner.kind.toLowerCase()}s`;
        return (
          <div key={owner.name} className={className}>
            {owner.kind}
            &nbsp;
            <GoToDetailsLink
              resource={resource}
              apiVersion={owner.apiVersion}
              name={owner.name}
            />
          </div>
        );
      })}
    </>
  );
};

export const ControlledByKind = ({ ownerReferences }) => {
  if (!ownerReferences?.length) return EMPTY_TEXT_PLACEHOLDER;
  return (
    <>
      {ownerReferences.map((owner, index) => {
        const className = index > 0 ? 'fd-margin-top--sm' : '';
        return (
          <div key={owner.name} className={className}>
            {owner.kind}
          </div>
        );
      })}
    </>
  );
};
