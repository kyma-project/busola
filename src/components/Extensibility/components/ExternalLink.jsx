import { useEffect, useState } from 'react';
import {
  useGetPlaceholder,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import { useJsonata } from '../hooks/useJsonata';

import { Button, Icon, Link, ToolbarButton } from '@ui5/webcomponents-react';
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
  const stringifiedDeps = JSON.stringify([
    arrayItems,
    value,
    scope,
    embedResource,
    singleRootResource,
    originalResource,
  ]);

  useEffect(() => {
    jsonata(structure.link).then((linkObject) => {
      setHref(makeHref({ linkObject, value }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure?.link, stringifiedDeps]);

  if (isNil(value)) return emptyLeafPlaceholder;

  if (
    structure.type === 'button' &&
    structure.targets.find((t) => t.slot === 'details-header')
  ) {
    return (
      <ToolbarButton
        accessibleRole="Link"
        accessibleName={tExt(value)}
        accessibleDescription="Open in new tab link"
        endIcon="inspect"
        onClick={() => {
          const newWindow = window.open(href, '_blank', 'noopener, noreferrer');
          if (newWindow) newWindow.opener = null;
        }}
        text={tExt(value)}
      />
    );
  }
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
