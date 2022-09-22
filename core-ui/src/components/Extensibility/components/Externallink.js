import { useGetPlaceholder } from 'components/Extensibility/helpers';
import { Link } from 'fundamental-react';
import { isNil } from 'lodash';
import { jsonataWrapper } from '../helpers/jsonataWrapper';

export const Externallink = ({ value, schema, structure, ...props }) => {
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  const linkFormula = structure.linkFormula;
  const textFormula = structure.textFormula;

  function jsonata(formula) {
    try {
      const expression = jsonataWrapper(formula);

      expression.assign('root', props.originalResource);
      expression.assign('item', value);

      return expression.evaluate();
    } catch (e) {
      console.warn('Widget::shouldBeVisible error:', e);
      return { error: e };
    }
  }

  let href;
  if (typeof value === 'string') {
    href = value.substring(0, 8) === 'https://' ? value : `https://${value}`;
  }

  if (isNil(value)) return emptyLeafPlaceholder;
  else
    return (
      <p>
        <Link
          href={linkFormula ? jsonata(linkFormula) : href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {textFormula ? jsonata(textFormula) : value}
        </Link>
      </p>
    );
};
