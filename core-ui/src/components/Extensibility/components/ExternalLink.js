import { useGetPlaceholder } from 'components/Extensibility/helpers';
import { Icon, Link } from 'fundamental-react';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

// import { jsonataWrapper } from '../helpers/jsonataWrapper';
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

  const [link, linkError] = useJsonata(structure.link, {
    resource: originalResource,
    scope,
    value,
    arrayItems,
  });
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
