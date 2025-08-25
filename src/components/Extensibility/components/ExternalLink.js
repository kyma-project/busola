import {
  useGetPlaceholder,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import { useGetAsyncJsonata, useJsonata } from '../hooks/useJsonata';

import { Button, Icon, Link } from '@ui5/webcomponents-react';
import { isNil } from 'lodash';

const makeHref = ({ getJsonata, value, structure }) => {
  const [link, linkError] = getJsonata(structure.link);
  if (linkError) return linkError.message;

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

  const getJsonata = useGetAsyncJsonata(jsonata);
  const href = makeHref({ getJsonata, value, structure });

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
ExternalLink.copyFunction = ({ value, structure }, _, __, getJsonata) => {
  return makeHref({ getJsonata, value, structure });
};
