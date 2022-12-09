import React from 'react';
import pluralize from 'pluralize';
import { Link } from 'react-router-dom';
import './ControlledBy.scss';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useRecoilValue } from 'recoil';
import { extensionsState } from 'state/navigation/extensionsAtom';
import { resources } from 'resources';
import { useUrl } from 'hooks/useUrl';
import { getExtensibilityPath } from 'components/Extensibility/helpers/getExtensibilityPath';

export const GoToDetailsLink = ({
  kind,
  name,
  apiVersion,
  noBrackets = false,
}) => {
  const extensions = useRecoilValue(extensionsState);
  const { namespaceUrl, clusterUrl } = useUrl();

  let path = null;
  const resource = resources.find(res => res.resourceType === pluralize(kind));
  const extResource = extensions?.find(
    cr => cr.general?.resource?.kind === kind,
  );

  if (resource) {
    const partialPath = pluralize(kind || '')?.toLowerCase();
    if (resource.namespaced) {
      path = namespaceUrl(`${partialPath}/${name}`);
    } else {
      path = clusterUrl(`${partialPath}/${name}`);
    }
  } else if (extResource) {
    const partialPath = getExtensibilityPath(extResource.general);
    if (extResource.general.scope === 'namespace') {
      path = namespaceUrl(`${partialPath}/${name}`);
    } else {
      path = clusterUrl(`${partialPath}/${name}`);
    }
  }

  if (!path) {
    return <>{noBrackets ? name : `(${name})`}</>;
  } else {
    return (
      <Link className="fd-link" to={path}>
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
    (Array.isArray(ownerReferences) && !ownerReferences?.length)
  )
    return placeholder;

  const OwnerRef = ({ owner, className }) => {
    return (
      <div key={owner.name} className={className}>
        {owner.kind}
        {!kindOnly && (
          <>
            &nbsp;
            <GoToDetailsLink
              kind={owner.kind}
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
      {ownerReferences.filter(Boolean).map(owner => (
        <li key={owner.kind + owner.name}>
          <OwnerRef owner={owner} />
        </li>
      ))}
    </ul>
  );
};
