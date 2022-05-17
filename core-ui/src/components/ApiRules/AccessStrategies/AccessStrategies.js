import React from 'react';
import classNames from 'classnames';

import { GenericList } from 'shared/components/GenericList/GenericList';
import { Icon, InfoLabel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import accessStrategyTypes from '../accessStrategyTypes';

import { ACCESS_STRATEGIES_PANEL } from 'components/ApiRules/constants';

import './AccessStrategies.scss';

const textSearchProperties = ['path', 'accessStrategies', 'methods'];
const rowRenderer = strategy => {
  return [
    <span>{strategy.path}</span>,
    <ul className="tokens">
      {strategy.accessStrategies.map(ac => {
        return (
          <li key={ac.handler}>
            <InfoLabel modifier="filled">
              <Icon
                ariaLabel={
                  accessStrategyTypes[ac.handler]?.displayName || ac.handler
                }
                className="fd-margin-end--tiny"
                glyph={
                  ac.handler === accessStrategyTypes.noop.value ||
                  ac.handler === accessStrategyTypes.allow.value
                    ? 'unlocked'
                    : 'locked'
                }
                size="s"
              />
              {accessStrategyTypes[ac.handler]?.displayName || ac.handler}
            </InfoLabel>
          </li>
        );
      })}
    </ul>,
    <ul className="tokens">
      {strategy.methods
        .sort()
        .reverse()
        .map(method => (
          <li key={method} aria-label="method">
            <InfoLabel>{method}</InfoLabel>
          </li>
        ))}
    </ul>,
  ];
};

export default function AccessStrategies({
  strategies = [],
  showSearchField = true,
  compact = false,
}) {
  const { t, i18n } = useTranslation();

  const headerRenderer = () => [
    t('api-rules.access-strategies.labels.path'),
    t('api-rules.access-strategies.labels.types'),
    t('api-rules.access-strategies.labels.methods'),
  ];

  return (
    <div
      className={classNames('api-rules__access-strategies', {
        'api-rules__access-strategies--compact': compact,
      })}
      aria-label={t('api-rules.access-strategies.title')}
    >
      <GenericList
        title={t(ACCESS_STRATEGIES_PANEL.LIST.TITLE)}
        showSearchField={showSearchField}
        textSearchProperties={textSearchProperties}
        showSearchSuggestion={false}
        entries={strategies}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        noSearchResultMessage={
          ACCESS_STRATEGIES_PANEL.LIST.ERRORS.NOT_MATCHING_SEARCH_QUERY
        }
        i18n={i18n}
      />
    </div>
  );
}
