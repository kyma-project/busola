import {
  useGetPlaceholder,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { Icon, Link } from 'fundamental-react';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useJsonata } from '../hooks/useJsonata';

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
}) => {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  const { t } = useTranslation();
  const { t: tExt } = useGetTranslation();

  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    scope,
    value,
    arrayItems,
  });

  const href = makeHref({ jsonata, value, structure });

  if (isNil(value)) return emptyLeafPlaceholder;

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {tExt(value)}
      <Icon
        glyph="action"
        size="s"
        className="fd-margin-begin--tiny"
        ariaLabel={t('common.ariaLabel.new-tab-link')}
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
