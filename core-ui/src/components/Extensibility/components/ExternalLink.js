import { useGetPlaceholder } from 'components/Extensibility/helpers';
import { Icon, Link } from 'fundamental-react';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useJsonata } from '../hooks/useJsonata';

export const ExternalLink = ({
  scope,
  value,
  schema,
  structure,
  arrayItems,
  originalResource,
  ...props
}) => {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  const { t } = useTranslation();

  const jsonata = useJsonata({
    resource: originalResource,
    scope,
    value,
    arrayItems,
  });
  const [link, linkError] = jsonata(structure.link);
  if (linkError) return linkError.message;

  let href;
  if (typeof value === 'string') {
    href = value.startsWith('https://') ? value : `https://${value}`;
  }

  if (isNil(value)) return emptyLeafPlaceholder;

  return (
    <Link href={link || href} target="_blank" rel="noopener noreferrer">
      {value}
      <Icon
        glyph="inspect"
        size="s"
        className="fd-margin-begin--tiny"
        ariaLabel={t('common.ariaLabel.new-tab-link')}
        originalResource={originalResource}
      />
    </Link>
  );
};
ExternalLink.inline = true;
