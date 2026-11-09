import { isValidElement, ReactNode } from 'react';
import { FormItem, Label, Text } from '@ui5/webcomponents-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { stringifyIfBoolean } from 'shared/utils/helpers';

interface ResourceDetailsFormItemProps {
  label: string;
  value: ReactNode;
}

export function ResourceDetailsFormItem({
  label,
  value,
}: ResourceDetailsFormItemProps) {
  const sanitizedValue = stringifyIfBoolean(value);
  const isEmpty =
    sanitizedValue === undefined ||
    sanitizedValue === null ||
    sanitizedValue === '';

  return (
    <FormItem labelContent={<Label showColon>{label}</Label>}>
      {isValidElement(sanitizedValue) ? (
        // Components may render bare text, which UI5 only slots in an element.
        <div>{sanitizedValue}</div>
      ) : (
        <Text>{isEmpty ? EMPTY_TEXT_PLACEHOLDER : sanitizedValue}</Text>
      )}
    </FormItem>
  );
}
