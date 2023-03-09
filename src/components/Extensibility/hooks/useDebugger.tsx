import React, {
  useState,
  useRef,
  useContext,
  createContext,
  ReactNode,
} from 'react';
import { Icon, Popover, Button } from 'fundamental-react';
import { isNil } from 'lodash';

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
          JSON.stringify(value, null, 4)
        )}
      </dd>
    </>
  );
}

export function DebugonataQuery({ name, data }: { name: string; data: any }) {
  const [expanded, setExpanded] = useState(false);
  console.log('DebugonataQuery', data);
  return (
    <li>
      <div onClick={() => setExpanded(!expanded)}>
        <Icon
          className="control-icon"
          ariaHidden
          glyph={expanded ? 'navigation-down-arrow' : 'navigation-right-arrow'}
        />{' '}
        {name}
      </div>
      {expanded && (
        <div className="query">
          <dl className="info">
            <dt>query</dt>
            <dd>{data.query}</dd>
            <dt>computed value</dt>
            <dd>{data.value}</dd>
          </dl>
          {data.vars && (
            <>
              <h2>Variables</h2>
              <dl className="vars">
                {Object.entries(data.vars).map(([name, val]: any) => (
                  <>
                    <dt>{name}</dt>
                    <dd>{!isNil(val) && JSON.stringify(val, null, 4)}</dd>
                  </>
                ))}
              </dl>
            </>
          )}
          {!!Object.keys(data.dataSources).length && (
            <>
              <h2>Data sources</h2>
              <dl className="data-sources">
                {Object.entries(data.dataSources).map(([name, val]: any) => (
                  <DataSource name={name} val={val} />
                ))}
              </dl>
            </>
          )}
        </div>
      )}
    </li>
  );
}

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
                <DebugonataQuery name={name} data={data} />
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
