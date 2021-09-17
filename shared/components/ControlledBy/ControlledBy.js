import React, { useEffect, useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { EMPTY_TEXT_PLACEHOLDER } from '../../constants/constants';
import { Link } from 'fundamental-react';
import {
  useMicrofrontendContext,
  navigateToClusterResourceDetails,
  navigateToFixedPathResourceDetails,
  navigateToCustomResourceDefinitionDetails,
} from '../..';

const GoToDetailsLink = ({ resource, name, apiVersion }) => {
  const { cluster, namespaceId } = useMicrofrontendContext();
  const activeClusterName = cluster?.name;
  const namespacedViewPath = `/cluster/${activeClusterName}/namespaces/${namespaceId}/${resource}/details/${name}`;
  const clusterWideViewPath = `/cluster/${activeClusterName}/${resource}/details/${name}`;

  const [viewPath, setViewPath] = useState('');

  useEffect(() => {
    const checkIfPathExists = async () => {
      try {
        const namespacedViewExists = await LuigiClient.linkManager().pathExists(
          namespacedViewPath,
        );
        const clusterWideViewExists = await LuigiClient.linkManager().pathExists(
          clusterWideViewPath,
        );
        if (namespacedViewExists) setViewPath('namespace');
        else if (clusterWideViewExists) setViewPath('cluster');
      } catch (e) {
        console.log(e);
      }
    };
    checkIfPathExists();
  }, []);

  if (!resource) return null;
  if (viewPath === 'namespace') {
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
  } else if (viewPath === 'cluster') {
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
