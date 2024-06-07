import { useEffect, useRef } from 'react';
import { useEventListener } from 'hooks/useEventListener';
import { Result } from './Result';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { addHistoryEntry } from '../search-history';
import './ResultsList.scss';
import { useTranslation } from 'react-i18next';
import { LOADING_INDICATOR } from '../types';
import { useRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { handleActionIfFormOpen } from 'shared/components/UnsavedMessageBox/helpers';

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
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [isFormOpen, setIsFormOpen] = useRecoilState(isFormOpenState);

  //todo 2
  const isLoading = results.find((r: any) => r.type === LOADING_INDICATOR);
  results = results.filter((r: any) => r.type !== LOADING_INDICATOR);
  useEffect(() => {
    if (results?.length <= activeIndex) {
      setActiveIndex(0);
    }
  }, [results, activeIndex, setActiveIndex]);

  useEventListener(
    'keydown',
    (e: Event) => {
      if (isHistoryMode) return;

      const { key } = e as KeyboardEvent;
      if (key === 'ArrowDown' && activeIndex < results?.length - 1) {
        setActiveIndex(activeIndex + 1);
        scrollInto(listRef.current!.children[activeIndex + 1]);
      } else if (key === 'ArrowUp' && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
        scrollInto(listRef.current!.children[activeIndex - 1]);
      } else if (key === 'Enter' && results?.[activeIndex]) {
        handleActionIfFormOpen(
          isResourceEdited,
          setIsResourceEdited,
          isFormOpen,
          setIsFormOpen,
          () => {
            addHistoryEntry(results[activeIndex].query);
            results[activeIndex].onActivate();
          },
        );
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
              handleActionIfFormOpen(
                isResourceEdited,
                setIsResourceEdited,
                isFormOpen,
                setIsFormOpen,
                () => {
                  addHistoryEntry(result.query);
                  result.onActivate();
                },
              );
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
