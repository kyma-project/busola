import React, { useState } from 'react';
import { isNil } from 'lodash';
import { Button } from 'fundamental-react';

import { Explorer } from './Explorer';

export function DataSource({ name, val }: { name: string; val: any }) {
  const [value, setValue] = useState(val.value);
  const fetchValue = () => val.fetcher().then(setValue);
  return (
    <>
      <dt>{name}</dt>
      <dd>
        {isNil(value) ? (
          <Button
            compact
            glyph="refresh"
            option="emphasized"
            onClick={fetchValue}
          />
        ) : (
          <Explorer value={value} />
        )}
      </dd>
    </>
  );
}
