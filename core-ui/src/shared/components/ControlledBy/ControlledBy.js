import React, { useEffect, useState } from 'react';
import LuigiClient from '@luigi-project/client';
import shortid from 'shortid';
import pluralize from 'pluralize';
import { Link } from 'fundamental-react';

import {
  navigateToCustomResourceDefinitionDetails,
  navigateToClusterResourceDetails,
  navigateToFixedPathResourceDetails,
} from 'shared/hooks/navigate';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useMounted } from '../../hooks/useMounted';

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

  // prevents `setState` on onmounted component
  const mounted = useMounted();

  useEffect(() => {
    const checkIfPathExists = async () => {
      if (await pathExists(namespacedViewPath)) {
        if (mounted.current) setViewPath('namespace');
      } else if (await pathExists(clusterWideViewPath)) {
        if (mounted.current) setViewPath('cluster');
      } else {
        if (mounted.current) setViewPath('');
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

export const ControlledBy = ({ ownerReferences }) => {
  if (
    !ownerReferences ||
    (Array.isArray(ownerReferences) && !ownerReferences?.length)
  )
    return EMPTY_TEXT_PLACEHOLDER;

  const OwnerRef = ({ owner, className }) => {
    const resource = pluralize(owner.kind).toLowerCase();

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
  };

  return (
    <>
      {Array.isArray(ownerReferences) ? (
        ownerReferences.map((owner, index) => {
          const className = index > 0 ? 'fd-margin-top--sm' : '';
          return (
            <OwnerRef
              key={owner.kind + owner.name}
              owner={owner}
              className={className}
            />
          );
        })
      ) : (
        <OwnerRef owner={ownerReferences} className={''} />
      )}
    </>
  );
};

export const ControlledByKind = ({ ownerReferences }) => {
  if (
    !ownerReferences ||
    (Array.isArray(ownerReferences) && !ownerReferences?.length)
  )
    return EMPTY_TEXT_PLACEHOLDER;

  const OwnerRef = ({ owner, className }) => (
    <div key={owner.name} className={className}>
      {owner.kind}
    </div>
  );

  return (
    <>
      {Array.isArray(ownerReferences) ? (
        ownerReferences.map((owner, index) => {
          const className = index > 0 ? 'fd-margin-top--sm' : '';
          return <OwnerRef owner={owner} className={className} />;
        })
      ) : (
        <OwnerRef owner={ownerReferences} className={''} />
      )}
    </>
  );
};
