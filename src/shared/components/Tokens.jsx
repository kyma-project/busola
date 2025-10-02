import { Tag } from '@ui5/webcomponents-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

const Tokens = ({ tokens }) => (
  <>
    {tokens?.length
      ? tokens.map((scope) => (
          <Tag
            key={scope}
            className="sap-margin-end-tiny"
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
