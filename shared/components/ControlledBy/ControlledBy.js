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
import shortid from 'shortid';

function pathExists(path) {
  const pathId = shortid.generate();

  return new Promise(resolve => {
    LuigiClient.addCustomMessageListener(
      'busola.pathExists.answer',
      (msg, listenerId) => {
        if (msg.pathId === pathId) {
          resolve(msg.exists);
          LuigiClient.removeCustomMessageListener(listenerId);
        }
      },
    );

    LuigiClient.sendCustomMessage({
      id: 'busola.pathExists',
      path,
      pathId,
    });
  });
}

export const GoToDetailsLink = ({
  resource,
  name,
  apiVersion,
  noBrackets = false,
}) => {
  const { cluster, namespaceId } = useMicrofrontendContext();
  const activeClusterName = cluster?.name;
  const namespacedViewPath = `/cluster/${activeClusterName}/namespaces/${namespaceId}/${resource}/details/${name}`;
  const clusterWideViewPath = `/cluster/${activeClusterName}/${resource}/details/${name}`;

  const [viewPath, setViewPath] = useState(null);

  useEffect(() => {
    const checkIfPathExists = async () => {
      if (await pathExists(namespacedViewPath)) {
        setViewPath('namespace');
      } else if (await pathExists(clusterWideViewPath)) {
        setViewPath('cluster');
      } else {
        setViewPath('');
      }
    };
    if (resource && !viewPath) {
      checkIfPathExists();
    }
  }, [name, resource]);

  if (!resource || viewPath === null) return null;
  if (viewPath === 'namespace') {
    return (
      <Link
        className="fd-link"
        onClick={_ => {
          navigateToFixedPathResourceDetails(resource, name);
        }}
      >
        {noBrackets ? name : `(${name})`}
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
        {noBrackets ? name : `(${name})`}
      </Link>
    );
  } else if (apiVersion === 'apps/v1' || !apiVersion) {
    return <>{noBrackets ? name : `(${name})`}</>;
  } else {
    return (
      <Link
        className="fd-link"
        onClick={_ => {
          navigateToCustomResourceDefinitionDetails(resource, apiVersion, name);
        }}
      >
        {noBrackets ? name : `(${name})`}
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
