import { Tag } from '@ui5/webcomponents-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import { spacing } from 'shared/helpers/spacing';

const Tokens = ({ tokens }) => (
  <>
    {tokens?.length
      ? tokens.map(scope => (
          <Tag
            key={scope}
            style={spacing.sapUiTinyMarginEnd}
            design="Set2"
            colorScheme="9"
            hideStateIcon
          >
            {scope}
          </Tag>
        ))
      : EMPTY_TEXT_PLACEHOLDER}
  </>
);

export { Tokens };
