import React from 'react';
import { isNil } from 'lodash';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import {
  ControlledBy as CB,
  ControlledByKind as CBK,
} from 'shared/components/ControlledBy/ControlledBy';

export function ControlledBy({ value, structure, schema }) {
  const emptyTextPlaceholder = structure.placeholder || EMPTY_TEXT_PLACEHOLDER;

  return isNil(value) ? emptyTextPlaceholder : <CB ownerReferences={value} />;
}
export function ControlledByKind({ value, structure, schema }) {
  const emptyTextPlaceholder = structure.placeholder || EMPTY_TEXT_PLACEHOLDER;

  return isNil(value) ? emptyTextPlaceholder : <CBK ownerReferences={value} />;
}
