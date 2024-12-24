import {
  useGetPlaceholder,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import { useJsonata } from '../hooks/useJsonata';

import { Button, Icon, Link } from '@ui5/webcomponents-react';
import { isNil } from 'lodash';

const makeHref = ({ jsonata, value, structure }) => {
  const [link, linkError] = jsonata(structure.link);
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

  const href = makeHref({ jsonata, value, structure });

  if (isNil(value)) return emptyLeafPlaceholder;

  if (structure.type === 'button') {
    return (
      <Button
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
    <Link href={href} target="_blank" rel="noopener noreferrer">
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
ExternalLink.copyFunction = ({ value, structure }, _, __, jsonata) => {
  return makeHref({ jsonata, value, structure });
};
