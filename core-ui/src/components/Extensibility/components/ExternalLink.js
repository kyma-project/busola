import { useGetPlaceholder } from 'components/Extensibility/helpers';
import { Icon, Link } from 'fundamental-react';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { jsonataWrapper } from '../helpers/jsonataWrapper';

export const ExternalLink = ({
  value,
  schema,
  structure,
  arrayItem,
  ...props
}) => {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  const { t } = useTranslation();

  const linkFormula = structure.link;

  function jsonata(formula) {
    try {
      const expression = jsonataWrapper(formula);

      expression.assign('root', props.originalResource);
      expression.assign('item', arrayItem);

      return expression.evaluate();
    } catch (e) {
      console.warn('Widget::shouldBeVisible error:', e);
      return { error: e };
    }
  }

  let href;
  if (typeof value === 'string') {
    href = value.startsWith('https://') ? value : `https://${value}`;
  }

  if (isNil(value)) return emptyLeafPlaceholder;

  return (
    <Link
      href={linkFormula ? jsonata(linkFormula) : href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {value}
      <Icon
        glyph="inspect"
        size="s"
        className="fd-margin-begin--tiny"
        ariaLabel={t('common.ariaLabel.new-tab-link')}
      />
    </Link>
  );
};
ExternalLink.inline = true;
