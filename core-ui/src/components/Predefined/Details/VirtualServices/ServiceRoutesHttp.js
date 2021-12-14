import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericList } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';

function ServerPort({ port }) {
  const number = port.targetPort
    ? `${port.number}:${port.targetPort}`
    : port.number;
  return `${port.name} (${number})`;
}

/*
function ServerHosts({ hosts }) {
  return (
    <ul>
      {hosts.map(host => (
        <li key={host}>{host}</li>
      ))}
    </ul>
  );
}
*/

function Destination({ destination }) {
  const portString = destination.port ? `:${destination.port.number}` : '';
  const subsetString = destination.subset ? ` (${destination.subset})` : '';
  return `${destination.host}${portString}${subsetString}`;
}

function Headers({ headers }) {
  const { t } = useTranslation();
  if (!headers?.request && !headers?.response) return '-';
  return (
    <>
      {headers.request && (
        <HeaderOperations
          title={t('virtualservices.headeroperations.request')}
          operations={headers.request}
        />
      )}
      {headers.response && (
        <HeaderOperations
          title={t('virtualservices.headeroperations.response')}
          operations={headers.response}
        />
      )}
    </>
  );
}

function Delegate({ delegate }) {
  return '';
}

function RedirectPortSelection({ selection }) {
  const { t } = useTranslation();
  if (selection === 'FROM_PROTOCOL_DEFAULT') {
    return t('virtualservices.http-routes.redirect.derive-port-default');
  } else if (selection === 'FROM_REQUEST_PORT') {
    return t('virtualservices.http-routes.redirect.derive-port-request');
  } else {
    return '';
  }
}

function HeaderOperations({ title, operations }) {
  const { t } = useTranslation();
  return (
    <>
      <div class="header-operation-title">{title}</div>
      <ul>
        {operations.add &&
          Object.entries(operations.set).map(([header, val]) => (
            <li>
              {t('virtualservices.headeroperations.add')} {header} = {val}
            </li>
          ))}
        {operations.set &&
          Object.entries(operations.set).map(([header, val]) => (
            <li>
              {t('virtualservices.headeroperations.set')} {header} = {val}
            </li>
          ))}
        {operations.remove &&
          operations.remove.map(header => (
            <li>
              {t('virtualservices.headeroperations.remove')} {header}
            </li>
          ))}
      </ul>
    </>
  );
}

function HttpMatchRequests({ matches }) {
  const { t } = useTranslation();

  return (
    <GenericList
      title={t('virtualservices.http-routes.matches')}
      headerRenderer={() => [t('virtualservices.http-routes.url')]}
      rowRenderer={match => [<ServiceMatch match={match} />]}
      entries={matches}
      showHeader={false}
    />
  );
}

function HttpRouteDestinations({ routes }) {
  const { t } = useTranslation();

  return (
    <GenericList
      title={t('virtualservices.http-routes.routes')}
      headerRenderer={() => [
        t('virtualservices.http-routes.route.destination'),
        t('virtualservices.http-routes.route.weight'),
        t('virtualservices.http-routes.route.headers'),
      ]}
      rowRenderer={route => [
        <Destination destination={route.destination} />,
        route.weight || '100',
        <Headers headers={route.headers} />,
      ]}
      entries={routes}
    />
  );
}

function HttpRedirect({ redirect }) {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('virtualservices.http-routes.redirect.title')}
        />
      </LayoutPanel.Header>
      <dl>
        {redirect.uri && (
          <>
            <dd>{t('virtualservices.http-routes.redirect.uri')}</dd>
            <dt>{redirect.uri}</dt>
          </>
        )}
        {redirect.uri && (
          <>
            <dd>{t('virtualservices.http-routes.redirect.authority')}</dd>
            <dt>{redirect.authority}</dt>
          </>
        )}
        {redirect.port && (
          <>
            <dd>{t('virtualservices.http-routes.redirect.port')}</dd>
            <dt>{redirect.authority}</dt>
          </>
        )}
        {redirect.derivePort && (
          <>
            <dd>{t('virtualservices.http-routes.redirect.derive-port')}</dd>
            <dt>
              <RedirectPortSelection selection={redirect.authority} />
            </dt>
          </>
        )}
        {redirect.scheme && (
          <>
            <dd>{t('virtualservices.http-routes.redirect.scheme')}</dd>
            <dt>{redirect.sheme}</dt>
          </>
        )}
        {redirect.redirectCode && (
          <>
            <dd>{t('virtualservices.http-routes.redirect.scheme')}</dd>
            <dt>{redirect.redirectCode}</dt>
          </>
        )}
      </dl>
    </LayoutPanel>
  );
}

export function StringMatch({ def }) {
  const { t } = useTranslation();

  let typeLabel;
  let value;
  if (def.exact) {
    typeLabel = t('virtualservices.match.exact');
    value = def.exact;
  } else if (def.prefix) {
    typeLabel = t('virtualservices.match.prefix');
    value = def.prefix;
  } else if (def.regex) {
    typeLabel = t('virtualservices.match.regex');
    value = def.regex;
  } else {
    return '-';
  }
  return (
    <span>
      ({typeLabel}) {value}
    </span>
  );
}

export function ServiceMatch({ match }) {
  return (
    <>
      {match.uri && (
        <div>
          uri = <StringMatch def={match.uri} />
        </div>
      )}
      {match.scheme && (
        <div>
          scheme = <StringMatch def={match.scheme} />
        </div>
      )}
      {match.method && (
        <div>
          method = <StringMatch def={match.method} />
        </div>
      )}
      {match.authority && (
        <div>
          authority = <StringMatch def={match.authority} />
        </div>
      )}
    </>
  );
}

export function HttpRoutes(service) {
  const { t } = useTranslation();

  if (!service.spec.http) return null;

  return service.spec.http.map(rule => (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('virtualservices.http-routes.title')}
          description={rule.name}
        />
      </LayoutPanel.Header>
      {rule.match && <HttpMatchRequests matches={rule.match} />}
      {rule.route && <HttpRouteDestinations routes={rule.route} />}
      {rule.redirect && <HttpRedirect redirect={rule.redirect} />}
      {rule.delegate && <Delegate />}
    </LayoutPanel>
  ));
}
