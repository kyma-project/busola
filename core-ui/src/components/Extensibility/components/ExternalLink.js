import { useGetPlaceholder } from 'components/Extensibility/helpers';
import { Icon, Link } from 'fundamental-react';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { jsonataWrapper } from '../helpers/jsonataWrapper';

function makeHref({ value, formula, originalResource, arrayItem }) {
  if (formula) {
    try {
      const expression = jsonataWrapper(formula);

      expression.assign('root', originalResource);
      expression.assign('item', arrayItem);

      return expression.evaluate();
    } catch (e) {
      console.warn('Widget::shouldBeVisible error:', e);
      return { error: e };
    }
  }
  if (typeof value === 'string') {
    value = value.startsWith('https://') ? value : `https://${value}`;
  }
  return value ?? '';
}
export function ExternalLink({
  value,
  structure,
  arrayItem,
  originalResource,
}) {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  const { t } = useTranslation();

  if (isNil(value)) return emptyLeafPlaceholder;

  return (
    <Link
      href={makeHref({
        value,
        formula: structure.link,
        originalResource,
        arrayItem,
      })}
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
}
ExternalLink.inline = true;
ExternalLink.copiable = true;
ExternalLink.copyFunction = ({
  originalResource,
  value,
  structure,
  arrayItem,
}) => {
  return makeHref({
    value,
    formula: structure.link,
    originalResource,
    arrayItem,
  });
};
