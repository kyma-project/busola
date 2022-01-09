import React, { useEffect, useRef, useState } from 'react';
import { FormInput } from 'fundamental-react';

export function DebouncedFormInput({
  delay = 400,
  value: externalValue,
  onChange: onDebouncedChange,
  ...props
}) {
  const [value, setValue] = useState(externalValue);
  const timeout = useRef(0);

  useEffect(() => setValue(externalValue), [externalValue]);

  const onChange = e => {
    const v = e.target.value;
    setValue(v);

    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => onDebouncedChange(v), delay);
  };

  return <FormInput value={value} onChange={onChange} {...props} />;
}
