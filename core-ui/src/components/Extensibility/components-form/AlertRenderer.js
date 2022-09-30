import React from 'react';

import { useGetTranslation } from 'components/Extensibility/helpers';
import { MessageStrip } from 'fundamental-react';
import { jsonataWrapper } from '../helpers/jsonataWrapper';

export function AlertRenderer({ value, schema, storeKeys, compact, ...props }) {
  const { t: tExt } = useGetTranslation();
  const alert = schema.get('alert');
  const schemaType = schema.get('severity') || 'information';

  function alertJsonata(alertFormula) {
    try {
      const expression = jsonataWrapper(alertFormula);

      expression.assign('root', props.originalResource);
      expression.assign('item', value);

      return expression.evaluate();
    } catch (e) {
      console.warn('Widget::shouldBeVisible error:', e);
      return { visible: false, error: e };
    }
  }

  return (
    <MessageStrip type={schemaType} className="fd-margin-top--sm">
      {tExt(alertJsonata(alert))}
    </MessageStrip>
  );
}
