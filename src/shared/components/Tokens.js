import React from 'react';

import { Token } from '@ui5/webcomponents-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

const Tokens = ({ tokens }) => (
  <>
    {tokens?.length
      ? tokens.map(scope => (
          <Token
            key={scope}
            className="bsl-margin-end--tiny"
            readOnly
            text={scope}
          />
        ))
      : EMPTY_TEXT_PLACEHOLDER}
  </>
);

export { Tokens };
