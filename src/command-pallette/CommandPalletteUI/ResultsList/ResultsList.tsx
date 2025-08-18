import { useEffect, useRef } from 'react';
import { useEventListener } from 'hooks/useEventListener';
import { Result } from './Result';
import { Spinner } from 'shared/components/Spinner/Spinner';
import './ResultsList.scss';
import { useTranslation } from 'react-i18next';
import { LOADING_INDICATOR } from '../types';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import { activateResult, isResultGoingToRedirect } from '../helpers';

function scrollInto(element: Element) {
  element.scrollIntoView({
    block: 'center',
    inline: 'center',
    behavior: 'smooth',
  });
}

type ResultsListProps = {
  results: any; //todo
  suggestion: any; //todo
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  isHistoryMode: boolean;
};

export function ResultsList({
  results,
  suggestion,
  activeIndex,
  setActiveIndex,
  isHistoryMode,
}: ResultsListProps) {
  const listRef = useRef<HTMLUListElement | null>(null);
  const { t } = useTranslation();
  const { navigateSafely } = useFormNavigation();

  //todo 2
  const isLoading = results.find((r: any) => r.type === LOADING_INDICATOR);
  results = results.filter((r: any) => r.type !== LOADING_INDICATOR);

  const activateResultWithSafeNavigation = () => {
    if (isResultGoingToRedirect(results[activeIndex].query)) {
      navigateSafely(() =>
        activateResult(
          results[activeIndex].query,
          results[activeIndex].onActivate,
        ),
      );
    } else
      activateResult(
        results[activeIndex].query,
        results[activeIndex].onActivate,
      );
  };

  useEffect(() => {
    if (results?.length <= activeIndex) {
      setActiveIndex(0);
    }
  }, [results, activeIndex, setActiveIndex]);

  useEventListener(
    'keydown',
    (e: Event) => {
      if (
        document.querySelector(
          'ui5-dialog[header-text="Discard Changes"][open]',
        )
      )
        return;

      if (isHistoryMode) return;

      const { key } = e as KeyboardEvent;
      if (key === 'ArrowDown' && activeIndex < results?.length - 1) {
        setActiveIndex(activeIndex + 1);
        scrollInto(listRef.current!.children[activeIndex + 1]);
      } else if (key === 'ArrowUp' && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
        scrollInto(listRef.current!.children[activeIndex - 1]);
      } else if (key === 'Enter' && results?.[activeIndex]) {
        e.preventDefault();
        activateResultWithSafeNavigation();
      }
    },
    [activeIndex, results, isHistoryMode],
  );

  return (
    <ul className="command-palette-ui__results" ref={listRef}>
      {results?.length ? (
        results.map((result: any /*todo*/, i: number) => (
          <Result
            key={`${result.label}|${result.category}|${result.customActionText}|${i}`}
            {...result}
            index={i}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            onItemClick={() => {
              activateResultWithSafeNavigation();
            }}
          />
        ))
      ) : (
        <div className="result result--disabled">
          <p className="label">
            {t('command-palette.results.no-results-found')}
          </p>
          <p className="description">{suggestion}</p>
        </div>
      )}
      {isLoading && <Spinner />}
    </ul>
  );
}
