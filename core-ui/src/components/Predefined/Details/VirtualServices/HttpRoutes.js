import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericList, Tooltip } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';

import {
  Destination,
  RouteDestinations,
  CommonMatchAttributes,
} from './common';

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
  const { t } = useTranslation();

  return (
    <>
      <dd>{t('virtualservices.delegate')}</dd>
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
        <LayoutPanel.Head
          title={t('virtualservices.http-routes.cors-policy.title')}
        />
      </LayoutPanel.Header>
      <dl>
        <dd></dd>
        <dt></dt>
      </dl>
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
      headerRenderer={() => ['']}
      rowRenderer={match => [<HttpMatchRequest match={match} />]}
      entries={matches}
      showHeader={false}
    />
  );
}

function HttpRouteDestinations({ routes }) {
  const { t } = useTranslation();

  return (
    <RouteDestinations
      routes={routes}
      headerRenderer={() => [t('virtualservices.http-routes.route.headers')]}
      rowRenderer={route => [<Headers headers={route.headers} />]}
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

function HttpRewrite({ rewrite }) {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md definition-list">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('virtualservices.http-routes.rewrite.title')}
        />
      </LayoutPanel.Header>
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

export function StringMatch({ label, def, ignoreCase }) {
  const { t } = useTranslation();

  let operator;
  let value;
  let tooltip;
  if (def.exact) {
    operator = '=';
    tooltip = t('virtualservices.match.exact');
    value = def.exact;
  } else if (def.prefix) {
    operator = '^=';
    value = def.prefix;
    tooltip = t('virtualservices.match.prefix');
  } else if (def.regex) {
    operator = '~';
    value = def.regex;
    tooltip = t('virtualservices.match.regex');
  } else {
    return '-';
  }

  return (
    <div>
      {label}
      <Tooltip content={tooltip}>{operator}</Tooltip>
      {value}
      {ignoreCase &&
        !def.regex &&
        t('virtualservices.http-routes.match.ignore-case')}
    </div>
  );
}

function StringMatchMap({ labelId, map }) {
  const { t } = useTranslation();
  return Object.entries(map).map(([field, matchValue]) => (
    <StringMatch label={t(labelId, { field })} def={matchValue} />
  ));
}

function HttpMatchRequest({ match }) {
  const { t } = useTranslation();

  return (
    <>
      {match.uri && (
        <StringMatch
          label={t('virtualservices.http-routes.match.uri')}
          def={match.uri}
          ignoreCase={match.ignoreUriCase}
        />
      )}
      {match.scheme && (
        <StringMatch
          label={t('virtualservices.http-routes.match.scheme')}
          def={match.scheme}
        />
      )}
      {match.method && (
        <StringMatch
          label={t('virtualservices.http-routes.match.method')}
          def={match.method}
        />
      )}
      {match.authority && (
        <StringMatch
          label={t('virtualservices.http-routes.match.authority')}
          def={match.method}
        />
      )}
      {match.headers && (
        <StringMatchMap
          labelId="virtualservices.http-routes.match.header"
          map={match.headers}
        />
      )}
      {match.withoutHeaders && (
        <StringMatchMap
          labelId="virtualservices.http-routes.match.without-header"
          map={match.withoutHeaders}
        />
      )}
      {match.queryParams && (
        <StringMatchMap
          labelId="virtualservices.http-routes.match.header"
          map={match.match.queryParams}
        />
      )}
      <CommonMatchAttributes match={match} />
    </>
  );
}

export function HttpRoutes(service) {
  const { t } = useTranslation();

  if (!service.spec.http) return null;

  return service.spec.http.map(rule => (
    <LayoutPanel className="fd-margin--md definition-list">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('virtualservices.http-routes.title')}
          description={rule.name}
        />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
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
      {rule.headers && (
        <LayoutPanel>
          <LayoutPanel.Header>
            <LayoutPanel.Head
              title={t('virtualservices.http-routes.headers')}
            />
          </LayoutPanel.Header>
          <Headers headers={rule.headers} />
        </LayoutPanel>
      )}
    </LayoutPanel>
  ));
}
