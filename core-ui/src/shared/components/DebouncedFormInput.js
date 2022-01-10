import React, { useEffect, useRef, useState } from 'react';
import { FormInput } from 'fundamental-react';

export const DebouncedFormInput = React.forwardRef((props, ref) => {
  const {
    delay = 300,
    value: externalValue,
    onChange: onDebouncedChange,
    ...rest
  } = props;
  const [value, setValue] = useState(externalValue);
  const timeout = useRef(0);

  useEffect(() => setValue(externalValue), [externalValue]);

  const onChange = e => {
    const v = e.target.value;
    setValue(v);

    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => onDebouncedChange(v), delay);
  };

  return <FormInput ref={ref} value={value} onChange={onChange} {...rest} />;
});
