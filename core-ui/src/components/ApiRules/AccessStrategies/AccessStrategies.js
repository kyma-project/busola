import React from 'react';
import classNames from 'classnames';

import { GenericList } from 'react-shared';
import { InfoLabel, Icon } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import accessStrategyTypes, { usesMethods } from '../accessStrategyTypes';

import { ACCESS_STRATEGIES_PANEL } from 'components/ApiRules/constants';

import './AccessStrategies.scss';

const headerRenderer = () => ['Path', 'Type', 'Methods'];
const textSearchProperties = ['path', 'accessStrategies', 'methods'];
const rowRenderer = strategy => {
  const selectedType = strategy.accessStrategies[0].handler;
  return [
    <span>{strategy.path}</span>,
    <InfoLabel modifier="filled">
      <Icon
        ariaLabel={accessStrategyTypes[selectedType].displayName}
        glyph={
          selectedType === accessStrategyTypes.noop.value ||
          selectedType === accessStrategyTypes.allow.value
            ? 'unlocked'
            : 'locked'
        }
        size="s"
      />
      {accessStrategyTypes[selectedType].displayName}
    </InfoLabel>,
    <ul
      className={classNames('methods', {
        'fd-hidden': !usesMethods(selectedType),
      })}
    >
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
  return (
    <div
      className={classNames('api-rules__access-strategies', {
        'api-rules__access-strategies--compact': compact,
      })}
      aria-label="Access strategies"
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
