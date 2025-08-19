import pluralize from 'pluralize';
import './ControlledBy.scss';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useRecoilValue } from 'recoil';
import { extensionsState } from 'state/navigation/extensionsAtom';
import { resources } from 'resources';
import { useUrl } from 'hooks/useUrl';
import { getExtensibilityPath } from 'components/Extensibility/helpers/getExtensibilityPath';
import { Link } from '../Link/Link';

export const GoToDetailsLink = ({
  kind,
  name,
  namespace,
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
      path = namespaceUrl(`${partialPath}/${name}`, { namespace });
    } else {
      path = clusterUrl(`${partialPath}/${name}`);
    }
  } else if (extResource) {
    const partialPath = getExtensibilityPath(extResource.general);
    if (extResource.general.scope === 'namespace') {
      path = namespaceUrl(`${partialPath}/${name}`, { namespace });
    } else {
      path = clusterUrl(`${partialPath}/${name}`);
    }
  }

  if (!path) {
    return <>{noBrackets ? name : `(${name})`}</>;
  } else {
    return (
      <Link design="Default" url={path}>
        {noBrackets ? name : `(${name})`}
      </Link>
    );
  }
};

export const ControlledBy = ({
  ownerReferences,
  namespace,
  kindOnly,
  placeholder = EMPTY_TEXT_PLACEHOLDER,
}) => {
  if (
    !ownerReferences ||
    (Array.isArray(ownerReferences) && !ownerReferences?.length)
  )
    return placeholder;

  const OwnerRef = ({ owner }) => {
    return (
      <div key={owner.name}>
        {owner.kind}
        {!kindOnly && (
          <>
            &nbsp;
            <GoToDetailsLink
              kind={owner.kind}
              apiVersion={owner.apiVersion}
              name={owner.name}
              namespace={namespace}
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
