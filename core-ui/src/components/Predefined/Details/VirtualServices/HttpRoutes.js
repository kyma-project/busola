import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericList } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';

import {
  Destination,
  RouteDestinations,
  CommonMatchAttributes,
} from './common';

function InlineHeaders({ headers }) {
  const { t } = useTranslation();
  if (!headers?.request && !headers?.response) return '-';
  return (
    <>
      {headers.request && (
        <HeaderOperations
          title={t('virtualservices.headers.request')}
          operations={headers.request}
        />
      )}
      {headers.response && (
        <HeaderOperations
          title={t('virtualservices.headers.response')}
          operations={headers.response}
        />
      )}
    </>
  );
}

function Headers({ headers }) {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('virtualservices.headers.title')} />
      </LayoutPanel.Header>
      {headers.request && (
        <LayoutPanel className="fd-margin--md">
          <LayoutPanel.Header>
            <LayoutPanel.Head title={t('virtualservices.headers.request')} />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            <HeaderOperations operations={headers.request} />
          </LayoutPanel.Body>
        </LayoutPanel>
      )}
      {headers.response && (
        <LayoutPanel className="fd-margin--md">
          <LayoutPanel.Header>
            <LayoutPanel.Head title={t('virtualservices.headers.response')} />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            <HeaderOperations operations={headers.response} />
          </LayoutPanel.Body>
        </LayoutPanel>
      )}
    </LayoutPanel>
  );
}

function Delegate({ delegate }) {
  const { t } = useTranslation();

  return (
    <>
      <dd>{t('virtualservices.http-routes.delegate')}</dd>
      <dt>
        {delegate.namespace && `${delegate.namespace}/`} {delegate.name}
      </dt>
    </>
  );
}

function CorsPolicy({ cors }) {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md definition-list">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('virtualservices.http-routes.cors.title')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <dl>
          <dd>{t('virtualservices.http-routes.cors.allow-origins')}</dd>
          {cors.allowOrigins.map(origin => (
            <dt>
              <StringMatch def={origin} />
            </dt>
          ))}
          {cors.allowMethods?.length && (
            <>
              <dd>{t('virtualservices.http-routes.cors.allow-methods')}</dd>
              {cors.allowMethods.map(method => (
                <dt>{method}</dt>
              ))}
            </>
          )}
          {cors.allowHeaders?.length && (
            <>
              <dd>{t('virtualservices.http-routes.cors.allow-headers')}</dd>
              {cors.allowHeaders.map(header => (
                <dt>{header}</dt>
              ))}
            </>
          )}
          {cors.exposeHeaders?.length && (
            <>
              <dd>{t('virtualservices.http-routes.cors.expose-headers')}</dd>
              {cors.exposeHeaders.map(header => (
                <dt>{header}</dt>
              ))}
            </>
          )}
          {cors.maxAge && (
            <>
              <dd>{t('virtualservices.http-routes.cors.max-age')}</dd>
              <dt>{cors.maxAge}</dt>
            </>
          )}
          <>
            <dd>{t('virtualservices.http-routes.cors.allow-credentials')}</dd>
            <dt>
              {cors.allowCredentials
                ? t('common.labels.yes')
                : t('common.labels.no')}
            </dt>
          </>
        </dl>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
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
      {title && <div class="header-operation-title">{title}</div>}
      <ul>
        {operations.add &&
          Object.entries(operations.set).map(([header, val]) => (
            <li>
              <span className="header-operation">
                {t('virtualservices.headers.add')}
              </span>{' '}
              {header} = {val}
            </li>
          ))}
        {operations.set &&
          Object.entries(operations.set).map(([header, val]) => (
            <li>
              <span className="header-operation">
                {t('virtualservices.headers.set')}
              </span>{' '}
              {header} = {val}
            </li>
          ))}
        {operations.remove &&
          operations.remove.map(header => (
            <li>
              <span className="header-operation">
                {t('virtualservices.headers.remove')}
              </span>{' '}
              {header}
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
      title={t('virtualservices.matches.title')}
      headerRenderer={() => ['']}
      rowRenderer={match => [<HttpMatchRequest match={match} />]}
      entries={matches}
      showHeader={false}
      showSearchField={false}
    />
  );
}

function HttpRouteDestinations({ routes }) {
  const { t } = useTranslation();

  return (
    <RouteDestinations
      routes={routes}
      headerRenderer={() => [t('virtualservices.http-routes.route.headers')]}
      rowRenderer={route => [<InlineHeaders headers={route.headers} />]}
    />
  );
}

function HttpRedirect({ redirect }) {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md definition-list">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('virtualservices.http-routes.redirect.title')}
        />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <dl>
          {redirect.uri && (
            <>
              <dd>{t('virtualservices.http-routes.redirect.uri')}</dd>
              <dt>{redirect.uri}</dt>
            </>
          )}
          {redirect.authority && (
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
              <dt>{redirect.scheme}</dt>
            </>
          )}
          {redirect.redirectCode && (
            <>
              <dd>{t('virtualservices.http-routes.redirect.scheme')}</dd>
              <dt>{redirect.redirectCode}</dt>
            </>
          )}
        </dl>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}

function HttpRewrite({ rewrite }) {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md definition-list">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('virtualservices.http-routes.rewrite.title')}
        />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <dl>
          {rewrite.uri && (
            <>
              <dd>{t('virtualservices.http-routes.rewrite.uri')}</dd>
              <dt>{rewrite.uri}</dt>
            </>
          )}
          {rewrite.authority && (
            <>
              <dd>{t('virtualservices.http-routes.rewrite.authority')}</dd>
              <dt>{rewrite.authority}</dt>
            </>
          )}
        </dl>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}

function HttpRetry({ retries }) {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md definition-list">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('virtualservices.http-routes.retries.title')}
        />
      </LayoutPanel.Header>
      <dl>
        <dd>{t('virtualservices.http-routes.retries.attempts')}</dd>
        <dt>{retries.attempts}</dt>

        {retries.perTryTimeout && (
          <>
            <dd>{t('virtualservices.http-routes.retries.per-try-timeout')}</dd>
            <dt>{retries.perTryTimeout}</dt>
          </>
        )}

        {retries.retryOn && (
          <>
            <dd>{t('virtualservices.http-routes.retries.retry-on')}</dd>
            <dt>{retries.retryOn}</dt>
          </>
        )}

        <dd>
          {t('virtualservices.http-routes.retries.retryRemoteLocalities')}
        </dd>
        <dt>
          {retries.retryRemoteLocalities
            ? t('common.labels.yes')
            : t('common.labels.no')}
        </dt>
      </dl>
    </LayoutPanel>
  );
}

function HttpFaultInjectionDelay({ delay }) {
  const { t } = useTranslation();

  let percent;
  if (delay.percentage) {
    percent = delay.percentage.value * 100;
  } else if (delay.percent) {
    percent = delay.percent;
  }

  return (
    <>
      <dd>{t('virtualservices.http-routes.fault.delay')}</dd>
      <dt>
        {delay.fixedDelay} {percent && `(${percent}%)`}
      </dt>
    </>
  );
}

function HttpFaultInjectionAbort({ abort }) {
  const { t } = useTranslation();

  let percent;
  if (abort.percentage) {
    percent = abort.percentage.value * 100;
  }

  return (
    <>
      <dd>{t('virtualservices.http-routes.fault.abort')}</dd>
      <dt>
        {abort.fixedDelay} {percent && `(${percent}%)`}
      </dt>
    </>
  );
}

export function StringMatch({ def, ignoreCase }) {
  const { t } = useTranslation();

  let label;
  let value;
  if (def.exact) {
    label = t('virtualservices.matches.exact');
    value = def.exact;
  } else if (def.prefix) {
    label = t('virtualservices.matches.prefix');
    value = def.prefix;
  } else if (def.regex) {
    label = t('virtualservices.matches.regex');
    value = def.regex;
  } else {
    return '-';
  }

  return (
    <>
      <span class="match-type">{label}</span> {value}{' '}
      {ignoreCase && !def.regex && (
        <span className="ignore-case">
          {t('virtualservices.matches.ignore-case')}
        </span>
      )}
    </>
  );
}

function StringMatchMap({ labelId, map }) {
  const { t } = useTranslation();
  return Object.entries(map).map(([field, matchValue]) => (
    <>
      <dd>{t(labelId, { field })}</dd>
      <dt>
        <StringMatch def={matchValue} />
      </dt>
    </>
  ));
}

function HttpMatchRequest({ match }) {
  const { t } = useTranslation();

  return (
    <dl>
      {match.uri && (
        <>
          <dd>{t('virtualservices.matches.uri')}</dd>
          <dt>
            <StringMatch def={match.uri} ignoreCase={match.ignoreUriCase} />
          </dt>
        </>
      )}
      {match.scheme && (
        <>
          <dd>{t('virtualservices.matches.scheme')}</dd>
          <dt>
            <StringMatch def={match.scheme} />
          </dt>
        </>
      )}
      {match.method && (
        <>
          <dd>{t('virtualservices.matches.method')}</dd>
          <dt>
            <StringMatch def={match.method} />
          </dt>
        </>
      )}
      {match.authority && (
        <>
          <dd>{t('virtualservices.matches.authority')}</dd>
          <dt>
            <StringMatch def={match.method} />
          </dt>
        </>
      )}
      {match.headers && (
        <StringMatchMap
          labelId="virtualservices.matches.header"
          map={match.headers}
        />
      )}
      {match.withoutHeaders && (
        <StringMatchMap
          labelId="virtualservices.matches.without-header"
          map={match.withoutHeaders}
        />
      )}
      {match.queryParams && (
        <StringMatchMap
          labelId="virtualservices.matches.header"
          map={match.queryParams}
        />
      )}
      <CommonMatchAttributes match={match} />
    </dl>
  );
}

export function HttpRoutes(service) {
  const { t } = useTranslation();

  if (!service.spec.http) return null;

  return service.spec.http.map(rule => (
    <LayoutPanel className="fd-margin--md definition-list virual-service-route">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('virtualservices.http-routes.title')}
          description={rule.name}
        />
      </LayoutPanel.Header>
      <LayoutPanel.Body className="route-extras">
        <dl>
          {rule.timeout && (
            <>
              <dd>{t('virtualservices.http-routes.timeout')}</dd>
              <dt>{rule.timeout}</dt>
            </>
          )}
          {rule.fault?.delay && (
            <HttpFaultInjectionDelay delay={rule.fault.delay} />
          )}
          {rule.fault?.abort && (
            <HttpFaultInjectionAbort abort={rule.fault.abort} />
          )}
          {rule.mirror && (
            <>
              <dd>{t('virtualservices.http-routes.mirror')}</dd>
              <dt>
                <Destination destination={rule.mirror} /> (
                {rule.mirrorPercentage?.value * 100 ?? 100}%)
              </dt>
            </>
          )}
          {rule.delegate && <Delegate delegate={rule.delegate} />}
        </dl>
      </LayoutPanel.Body>
      {rule.match && <HttpMatchRequests matches={rule.match} />}
      {rule.route && <HttpRouteDestinations routes={rule.route} />}
      {rule.redirect && <HttpRedirect redirect={rule.redirect} />}
      {rule.rewrite && <HttpRewrite rewrite={rule.rewrite} />}
      {rule.retries && <HttpRetry retries={rule.retries} />}
      {rule.corsPolicy && <CorsPolicy cors={rule.corsPolicy} />}
      {rule.headers && <Headers headers={rule.headers} />}
    </LayoutPanel>
  ));
}
