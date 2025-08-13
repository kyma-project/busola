import {
  JsonataFunction,
  JsonataValue,
} from 'components/Extensibility/hooks/useJsonata';
import { useEffect, useState } from 'react';

type AsyncValueProps = {
  params: [
    string,
    (
      | {
          [key: string]: any;
        }
      | undefined
    ),
    any,
  ];
  jsonata: JsonataFunction;
};

export function AsyncValue({ params, jsonata }: AsyncValueProps) {
  const [value, setValue] = useState<JsonataValue>(['', null]);

  useEffect(() => {
    jsonata(...params)
      .then((result: JsonataValue) => {
        setValue(result);
      })
      .catch((error: Error) => {
        setValue(['', error]);
      });
  }, [params, jsonata]);

  return value;
}
