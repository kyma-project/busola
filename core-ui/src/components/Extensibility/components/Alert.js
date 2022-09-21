import React from 'react';

import { MessageStrip } from 'fundamental-react';
import { useGetTranslation } from 'components/Extensibility/helpers';
import classNames from 'classnames';
import { jsonataWrapper } from '../helpers/jsonataWrapper';

export const Alert = ({ value, schema, structure, ...props }) => {
  const { t: tExt } = useGetTranslation();
  const alert = structure.alert || value;
  const alertFormula = structure.alertFormula;
  const schemaType = structure.type || 'information';

  const messageClassNames = classNames({
    'fd-margin--md': !structure.disableMargin,
  });

  function alertJsonata(alertFormula) {
    try {
      const expression = jsonataWrapper(alertFormula);

      expression.assign('root', props.originalResource);
      expression.assign('item', value);

      return expression.evaluate();
    } catch (e) {
      console.warn('Widget::shouldBeVisible error:', e);
      return { error: e };
    }
  }

  return (
    <div className={messageClassNames}>
      <MessageStrip type={schemaType}>
        {alertFormula ? alertJsonata(alertFormula) : tExt(alert)}
      </MessageStrip>
    </div>
  );
};
