import React from 'react';

import { Token } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

const Tokens = ({ tokens }) => (
  <div>
    {tokens.length
      ? tokens.map(scope => (
          <Token
            key={scope}
            buttonLabel=""
            className="y-fd-token y-fd-token--no-button y-fd-token--gap fd-margin-end--tiny"
            readOnly={true}
          >
            {scope}
          </Token>
        ))
      : EMPTY_TEXT_PLACEHOLDER}
  </div>
);

export { Tokens };
