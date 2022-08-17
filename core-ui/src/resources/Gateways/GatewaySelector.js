import React from 'react';
import { Token } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function GatewaySelector({ gateway }) {
  return gateway.spec.selector
    ? Object.entries(gateway.spec.selector).map(([key, value]) => (
        <Token readOnly key={key} buttonLabel="">
          {key}={value}
        </Token>
      ))
    : EMPTY_TEXT_PLACEHOLDER;
}
