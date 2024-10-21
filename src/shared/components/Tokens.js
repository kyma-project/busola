import React from 'react';

import { Token } from '@ui5/webcomponents-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import { spacing } from 'shared/helpers/spacing';

const Tokens = ({ tokens }) => (
  <>
    {tokens?.length
      ? tokens.map(scope => (
          <Token
            key={scope}
            style={spacing.sapUiTinyMarginEnd}
            readOnly
            text={scope}
          />
        ))
      : EMPTY_TEXT_PLACEHOLDER}
  </>
);

export { Tokens };
