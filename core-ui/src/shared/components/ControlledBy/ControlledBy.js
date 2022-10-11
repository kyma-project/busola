import React, { useEffect, useState } from 'react';
import LuigiClient from '@luigi-project/client';
import shortid from 'shortid';
import pluralize from 'pluralize';
import { Link } from 'fundamental-react';
import './ControlledBy.scss';

import {
  navigateToCustomResourceDefinitionDetails,
  navigateToClusterResourceDetails,
  navigateToFixedPathResourceDetails,
} from 'shared/hooks/navigate';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

export const ControlledBy = ({
  ownerReferences,
  kindOnly,
  placeholder = EMPTY_TEXT_PLACEHOLDER,
}) => {
  if (
    !ownerReferences ||
    (!Array.isArray(ownerReferences) && !ownerReferences?.length)
  )
    return placeholder;

  const OwnerRef = ({ owner, className }) => {
    const resource = pluralize(owner.kind)?.toLowerCase();
    return (
      <div key={owner.name} className={className}>
        {owner.kind}
        {!kindOnly && (
          <>
            &nbsp;
            <GoToDetailsLink
              resource={resource}
              apiVersion={owner.apiVersion}
              name={owner.name}
            />
          </>
        )}
      </div>
    );
  };

  if (!Array.isArray(ownerReferences)) {
    ownerReferences = [ownerReferences];
  }

  return (
    <ul className="controlled-by-list">
      {ownerReferences.map(owner => (
        <li key={owner.kind + owner.name}>
          <OwnerRef owner={owner} />
        </li>
      ))}
    </ul>
  );
};
