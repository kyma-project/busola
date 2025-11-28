import { useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon, Input, Label, SuggestionItem } from '@ui5/webcomponents-react';
import '@ui5/webcomponents/dist/features/InputSuggestions.js';
import { useTranslation } from 'react-i18next';
import { useEventListener } from 'hooks/useEventListener';

import { getEntryMatches } from 'shared/components/GenericList/helpers';
import { ResourceDetailContext } from '../ResourceDetails/ResourceDetails';
import { useAtomValue } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import './SearchInput.scss';

SearchInput.propTypes = {
  searchQuery: PropTypes.string,
  entriesKind: PropTypes.string,
  filteredEntries: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  ),
  handleQueryChange: PropTypes.func.isRequired,
  suggestionProperties: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.func.isRequired,
      PropTypes.any,
    ]),
  ),
  showSuggestion: PropTypes.bool,
  allowSlashShortcut: PropTypes.bool,
  disabled: PropTypes.bool,
  onKeyDown: PropTypes.func,
};

export function SearchInput({
  searchQuery,
  entriesKind,
  filteredEntries,
  handleQueryChange,
  suggestionProperties,
  showSuggestion = true,
  disabled = false,
  onKeyDown,
  allowSlashShortcut,
}) {
  const { t } = useTranslation();
  const isDetailsView = useContext(ResourceDetailContext);
  const searchInputRef = useRef(null);
  const columnLayout = useAtomValue(columnLayoutAtom);

  const onKeyPress = (e) => {
    const { key } = e;
    if (isDetailsView) return;
    const isCommandPalleteOpen = document.querySelector(
      '#command-palette-background',
    );
    if (isCommandPalleteOpen) return;
    const isModalOpen = document.querySelector(
      '[accessible-role="Dialog"][open="true"]',
    );
    if (isModalOpen) return;
    if (
      key === '/' &&
      !disabled &&
      allowSlashShortcut &&
      columnLayout.layout === 'OneColumn'
    ) {
      // Prevent firefox native quick find panel open
      e.preventDefault();
      openSearchList();
    }
    if (onKeyDown) {
      onKeyDown(key);
    }
  };

  useEventListener('keydown', onKeyPress, null, [disabled, allowSlashShortcut]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const getSearchSuggestions = async () => {
      if (!filteredEntries) return [];
      const resoled = await Promise.all(
        filteredEntries.map(
          async (entry) =>
            await getEntryMatches(entry, searchQuery, suggestionProperties),
        ),
      );
      return Array.from(new Set(resoled.flat()));
    };
    getSearchSuggestions().then((res) => setSuggestions(res));
  }, [filteredEntries, searchQuery, suggestionProperties]);

  const renderSearchList = () => {
    return suggestions.map((suggestion, index) => (
      <SuggestionItem key={index} id={suggestion} text={suggestion} />
    ));
  };

  const openSearchList = () => {
    setTimeout(() => {
      searchInputRef.current?.focus();
    });
  };

  return (
    <div className="search-input-container">
      <Label for={`search-${entriesKind}`} showColon>
        {t('common.tooltips.search')}
      </Label>
      <Input
        id={`search-${entriesKind}`}
        accessibleName={`search-${entriesKind}`}
        type="Search"
        icon={<Icon name="search" />}
        ref={searchInputRef}
        value={searchQuery}
        onInput={(e) => handleQueryChange(e.target.value)}
        showSuggestions={showSuggestion}
      >
        {showSuggestion && renderSearchList()}
      </Input>
    </div>
  );
}
