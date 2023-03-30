import React, {
  useState,
  useRef,
  useContext,
  createContext,
  ReactNode,
} from 'react';
import { Icon, Popover, Button } from 'fundamental-react';
import { isNil } from 'lodash';

import { Query } from './Query';

import './useDebugger.scss';

type DebugContextEnv = {
  [debugId: string]: {
    resource: any;
    scope: any;
    arrayItems: any;
    queries: {
      [key: string]: {
        query: string;
        value: any;
        env: any;
      };
    };
  };
};
type DebugContextProps = {
  env: { current: DebugContextEnv };
  uuid: string;
  init: (
    debugId: string,
    {
      resource,
      scope,
      arrayItems,
    }: { resource: any; scope: any; arrayItems: any },
  ) => void;
  setQuery: (debugId: string, datapoint: string, data: any) => void;
  updateQuery: (debugId: string, datapoint: string, data: any) => void;
};

export const DebugContext = createContext<DebugContextProps>({
  env: {
    current: {},
  },
  uuid: '',
  init: () => 0,
  setQuery: () => null,
  updateQuery: () => null,
});

export function DebugonataBody() {
  const { env, uuid } = useContext(DebugContext);

  return (
    <>
      <h1>Debugonata</h1>
      <ul>
        {Object.entries(env.current).map(([debugId, subenv]) => (
          <div>
            {Object.entries(subenv?.queries)
              .filter(([name, data]: [string, any]) => data.query)
              .map(([name, data]: [string, any]) => (
                <Query name={name} data={data} />
              ))}
          </div>
        ))}
      </ul>
    </>
  );
}

export function Debugonata() {
  return (
    <Popover
      className="debugonata-trigger"
      popperClassName="debugonata"
      body={<DebugonataBody />}
      control={<Icon glyph="legend" />}
      noArrow
    />
  );
}

export function DebugContextProvider({
  root,
  children,
}: {
  root: boolean;
  children: ReactNode;
}) {
  const env = useRef<DebugContextEnv>({});
  const [uuid] = useState(() => crypto.randomUUID());

  return (
    <DebugContext.Provider
      value={{
        env,
        uuid,
        init(debugId: string, { resource, scope, arrayItems }) {
          const id = (env.current[debugId] = {
            resource,
            scope,
            arrayItems,
            queries: {},
          });
          // return id;
        },
        setQuery(debugId: string, datapoint: string, data: any) {
          if (!debugId || !datapoint) return;
          env.current[debugId].queries[datapoint] = data;
        },
        updateQuery(debugId: string, datapoint: string, data: any) {
          if (!debugId || !datapoint) return;
          env.current[debugId].queries[datapoint] = {
            ...env.current[debugId].queries[datapoint],
            ...data,
          };
        },
      }}
    >
      {children}
    </DebugContext.Provider>
  );
}
