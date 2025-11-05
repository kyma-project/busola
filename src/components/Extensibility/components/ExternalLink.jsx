import { useEffect, useState } from 'react';
import {
  useGetPlaceholder,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import { useJsonata } from '../hooks/useJsonata';

import { Button, Icon, Link } from '@ui5/webcomponents-react';
import { isNil } from 'lodash';

const makeHref = ({ linkObject, value }) => {
  const [link, linkError] = linkObject;
  if (linkError) return linkError;

  let href;
  if (typeof value === 'string') {
    href =
      value.startsWith('https://') || value.startsWith('http://')
        ? value
        : `https://${value}`;
  }
  return link || href;
};

export const ExternalLink = ({
  scope,
  value,
  structure,
  arrayItems,
  originalResource,
  singleRootResource,
  embedResource,
}) => {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  const { t } = useTranslation();
  const { t: tExt } = useGetTranslation();

  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource: embedResource,
    scope,
    value,
    arrayItems,
  });
  const [href, setHref] = useState('');
  const arrayItemsDeps = JSON.stringify(arrayItems);
  const originalResourceDeps = JSON.stringify(originalResource);
  const singleRootResourceDeps = JSON.stringify(singleRootResource);
  const embedResourceDeps = JSON.stringify(embedResource);
  const valueDeps = JSON.stringify(value);
  const scopeDeps = JSON.stringify(scope);

  useEffect(() => {
    jsonata(structure.link).then((linkObject) => {
      setHref(makeHref({ linkObject, value }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    structure?.link,
    valueDeps,
    scopeDeps,
    arrayItemsDeps,
    originalResourceDeps,
    singleRootResourceDeps,
    embedResourceDeps,
  ]);

  if (isNil(value)) return emptyLeafPlaceholder;

  if (structure.type === 'button') {
    return (
      <Button
        accessibleRole="Link"
        accessibleName={tExt(value)}
        accessibleDescription="Open in new tab link"
        className="sap-margin-x-tiny"
        endIcon="inspect"
        onClick={() => {
          const newWindow = window.open(href, '_blank', 'noopener, noreferrer');
          if (newWindow) newWindow.opener = null;
        }}
      >
        {tExt(value)}
      </Button>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      accessibleName={tExt(value)}
      accessibleDescription="Open in new tab link"
    >
      {tExt(value)}
      <Icon
        design="Information"
        name="inspect"
        className="bsl-icon-s sap-margin-begin-tiny"
        accessibleName={t('common.ariaLabel.new-tab-link')}
        originalResource={originalResource}
      />
    </Link>
  );
};
ExternalLink.inline = true;
ExternalLink.copyable = true;
ExternalLink.copyFunction = ({ value }, _, __, linkObject) => {
  return makeHref({ linkObject, value });
};
