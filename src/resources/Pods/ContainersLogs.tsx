import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import {
  Button,
  Label,
  Option,
  Select,
  Switch,
} from '@ui5/webcomponents-react';
import { useGetStream } from 'shared/hooks/BackendAPI/useGet';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useNotification } from 'shared/contexts/NotificationContext';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { SearchInput } from 'shared/components/GenericList/SearchInput';
import { useTranslation } from 'react-i18next';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

import './ContainersLogs.scss';
import { LogsPanel } from 'resources/Pods/LogsPanel';

const HOUR_IN_SECONDS = 3600;
const MAX_TIMEFRAME_IN_SECONDS = Number.MAX_SAFE_INTEGER;
const DEFAULT_TIMEFRAME = HOUR_IN_SECONDS * 6;
const THRESHOLD = 50;

interface ContainersLogsProps {
  namespace: string;
  podName: string;
  containerName: string;
}

const scrollToSelectedLog = (selectedLogIndex: { current: number }) => {
  const highlightedLogs = document.getElementsByClassName('logs-highlighted');
  if (selectedLogIndex.current < 0) {
    selectedLogIndex.current = highlightedLogs?.length - 1 || 0;
  } else if (selectedLogIndex.current > highlightedLogs?.length - 1) {
    selectedLogIndex.current = 0;
  }
  const selectedLog = highlightedLogs[selectedLogIndex.current];
  if (selectedLog) {
    selectedLog.scrollIntoView();
  }
};

const ContainersLogs = ({
  namespace,
  containerName,
  podName,
}: ContainersLogsProps) => {
  const { t } = useTranslation();

  useWindowTitle('Logs');
  const notification = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [reverseLogs, setReverseLogs] = useState(false);
  const [sinceSeconds, setSinceSeconds] = useState(String(DEFAULT_TIMEFRAME));
  const [displayData, setDisplayData] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const [scrollContainerReady, setScrollContainerReady] = useState(false);
  const selectedLogIndex = useRef(0);
  const isAtNewestEdge = useRef(true);
  const reverseLogsRef = useRef(reverseLogs);
  const displayDataLengthRef = useRef(0);
  // Distinguish the initial mount from a real user-initiated timeframe change so we can
  // skip the scroll-to-top logic on first render (auto-scroll to bottom is the right
  // default there).
  const isInitialTimeframe = useRef(true);

  const handleScrollContainerReady = useCallback(
    (container: HTMLElement | null) => {
      scrollContainerRef.current = container;
      setScrollContainerReady(!!container);
    },
    [],
  );

  // Track whether the user is at the newest-logs edge (bottom in normal, top in reversed).
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isAtNewestEdge.current = reverseLogs
      ? el.scrollTop <= THRESHOLD
      : el.scrollTop + el.clientHeight >= el.scrollHeight - THRESHOLD;
  }, [reverseLogs]);

  // Attach the scroll listener to the real scroll container whenever it changes.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [scrollContainerReady, handleScroll]);

  // When reverseLogs toggles: update the ref, re-enable auto-scroll, snap to new edge.
  useEffect(() => {
    reverseLogsRef.current = reverseLogs;
    isAtNewestEdge.current = true;
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = reverseLogs ? 0 : el.scrollHeight;
  }, [reverseLogs, scrollContainerReady]);

  const logTimeframeOptions = [
    { text: '1 hour', key: String(HOUR_IN_SECONDS) },
    { text: '3 hours', key: String(3 * HOUR_IN_SECONDS) },
    { text: '6 hours', key: String(6 * HOUR_IN_SECONDS) },
    { text: '1 day', key: String(24 * HOUR_IN_SECONDS) },
    { text: 'all', key: String(MAX_TIMEFRAME_IN_SECONDS) },
  ];

  const tailLinesParam =
    sinceSeconds === String(MAX_TIMEFRAME_IN_SECONDS) ? '&tailLines=1000' : '';
  const url = `/api/v1/namespaces/${namespace}/pods/${podName}/log?container=${containerName}&follow=true${tailLinesParam}&timestamps=true&sinceSeconds=${sinceSeconds}`;
  const streamData = useGetStream(url);

  // On an explicit timeframe change: reset the length threshold so the first arriving
  // chunk is shown immediately, then scroll to the top so controls stay in view.
  // On the initial mount we skip the scroll-to-top so the first load still auto-scrolls
  // to the newest logs.
  useEffect(() => {
    displayDataLengthRef.current = 0;
    if (isInitialTimeframe.current) {
      isInitialTimeframe.current = false;
      return;
    }
    isAtNewestEdge.current = false;
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = 0;
  }, [sinceSeconds]);

  // Gate displayData updates to prevent the DOM from shrinking during background reconnects.
  // Instead, skip empty resets and only switch to new data when:
  //   - the user is tailing (isAtNewestEdge = true): show live updates immediately, or
  //   - the new stream has caught back up to at least the previous length: the DOM won't
  //     shrink, so the user's approximate scroll position is preserved.
  useEffect(() => {
    const newLength = streamData.data.length;
    if (newLength === 0) return;
    if (!isAtNewestEdge.current && newLength < displayDataLengthRef.current)
      return;

    displayDataLengthRef.current = newLength;
    const snapshot = streamData.data;
    const timeoutId = setTimeout(() => {
      setDisplayData(snapshot);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [streamData.data]);

  // Auto-scroll to the newest-logs edge on each displayData update, but only if the user
  // was already at that edge (i.e. tailing). If they scrolled away, leave them alone.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !isAtNewestEdge.current) return;
    el.scrollTop = reverseLogsRef.current ? 0 : el.scrollHeight;
  }, [displayData, scrollContainerReady]);

  useEffect(() => {
    selectedLogIndex.current = 0;
    scrollToSelectedLog(selectedLogIndex);
  }, [searchQuery]);

  const changeSelectedLog = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      selectedLogIndex.current = selectedLogIndex.current + 1;
      scrollToSelectedLog(selectedLogIndex);
    } else if (e.key === 'ArrowUp') {
      selectedLogIndex.current = selectedLogIndex.current - 1;
      scrollToSelectedLog(selectedLogIndex);
    }
  };

  const onSwitchChange = () => {
    setShowTimestamps((prev) => !prev);
  };

  const onReverseChange = () => {
    setReverseLogs((prev) => !prev);
  };

  const onLogTimeframeChange = (timeValue: string) => {
    setSinceSeconds(timeValue);
  };

  const saveToFile = (podName: string, containerName: string) => {
    const dateObj = new Date();
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();
    const date = `${day}-${month}-${year}-${hour}-${minute}`;

    try {
      const file = new Blob(
        displayData.map((log) => `${log}\n`),
        { type: 'text/plain' },
      );
      saveAs(file, `${podName}-${containerName}-${date}.txt`);
    } catch (e: any) {
      console.error(e);
      notification.notifyError({
        title: t('pods.message.failed-to-download'),
        content: e.message,
      });
    }
  };

  return (
    <DynamicPageComponent
      title={containerName}
      onScrollContainerReady={handleScrollContainerReady}
      content={
        <UI5Panel
          title={t('pods.labels.logs')}
          accessibleName={t('pods.accessible-name.logs')}
          headerActions={
            <>
              <Label for="context-chooser">
                {t('pods.labels.filter-timeframe')}
              </Label>
              <Select
                onChange={(event) => {
                  const selectedTimeFrame = event.detail.selectedOption.value;
                  onLogTimeframeChange(selectedTimeFrame ?? '');
                }}
              >
                {logTimeframeOptions.map((option) => (
                  <Option
                    key={option.key}
                    value={option.key}
                    selected={sinceSeconds.toString() === option.key}
                  >
                    {option.text}
                  </Option>
                ))}
              </Select>
              <Label>{t('pods.labels.show-timestamps')}</Label>
              <Switch
                disabled={!displayData.length}
                onChange={onSwitchChange}
              />
              <Label>{t('pods.labels.reverse-logs')}</Label>
              <Switch
                disabled={!displayData.length}
                onChange={onReverseChange}
              />
              <Button
                disabled={!displayData.length}
                onClick={() => saveToFile(podName, containerName)}
              >
                {t('pods.labels.save-to-file')}
              </Button>
              <SearchInput
                disabled={!displayData.length}
                entriesKind={'Logs'}
                filteredEntries={[]}
                suggestionProperties={[]}
                allowSlashShortcut={false}
                searchQuery={searchQuery}
                handleQueryChange={setSearchQuery}
                showSuggestion={false}
                onKeyDown={changeSelectedLog}
              />
            </>
          }
        >
          <div className="logs-panel-body">
            <LogsPanel
              streamData={{ data: displayData, error: streamData.error }}
              containerName={containerName}
              searchQuery={searchQuery}
              reverseLogs={reverseLogs}
              showTimestamps={showTimestamps}
            />
          </div>
        </UI5Panel>
      }
    />
  );
};

export default ContainersLogs;
