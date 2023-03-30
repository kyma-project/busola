import React, { useState } from 'react';
import { Icon } from 'fundamental-react';
import { isNil } from 'lodash';

import { Explorer } from './Explorer';
import { DataSource } from './DataSource';

export function Query({ name, data }: { name: string; data: any }) {
  console.log('Query', data);
  const [expanded, setExpanded] = useState(false);
  return (
    <li>
      <div className="expandable" onClick={() => setExpanded(!expanded)}>
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
            <dd>
              <Explorer value={data.value} />
            </dd>
            <dt>scope</dt>
            <dd>
              <Explorer value={data.scope} />
            </dd>
          </dl>
          {data.vars && (
            <>
              <h2>Variables</h2>
              <dl className="vars">
                {Object.entries(data.vars).map(([name, val]: any) => (
                  <>
                    <dt>{name}</dt>
                    <dd>
                      <Explorer value={val} />
                    </dd>
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
