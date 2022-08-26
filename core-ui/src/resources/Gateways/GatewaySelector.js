import React from 'react';
import { Labels as BusolaLabels } from 'shared/components/Labels/Labels';
import { isNil } from 'lodash';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function GatewaySelector({ gateway }) {
  if (isNil(gateway.spec.selector)) {
    return EMPTY_TEXT_PLACEHOLDER;
  } else {
    return <BusolaLabels labels={gateway.spec.selector} />;
  }
}
