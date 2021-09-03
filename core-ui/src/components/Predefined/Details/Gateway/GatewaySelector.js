import React from 'react';
import { Token } from 'fundamental-react';

export function GatewaySelector({ gateway }) {
  return Object.entries(gateway.spec.selector).map(([key, value]) => (
    <Token readOnly key={key} buttonLabel="">
      {key}={value}
    </Token>
  ));
}
