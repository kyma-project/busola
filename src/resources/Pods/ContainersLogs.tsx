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
const SCROLL_EDGE_THRESHOLD = 50;

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

// 'tail'        — keep the viewport at the newest-logs edge as content arrives
// 'snap-to-top' — scroll to scrollTop=0 once, then transition to 'free'
// 'free'        — user has scrolled away; leave the viewport alone
type LogScrollBehavior = 'tail' | 'snap-to-top' | 'free';

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
  const [scrollBehavior, setScrollBehavior] =
    useState<LogScrollBehavior>('tail');

  const logsPanelBodyRef = useRef<HTMLDivElement>(null);
  const selectedLogIndex = useRef(0);

  // --- Scroll inputs: three callers, each just sets scrollBehavior ---

  // User scrolled: determine whether they are at the newest-logs edge or have moved away.
  // Functional update prevents scroll events from overriding an active 'snap-to-top'.
  const handleScroll = useCallback(() => {
    const el = logsPanelBodyRef.current;
    if (!el) return;
    const atEdge = reverseLogs
      ? el.scrollTop <= SCROLL_EDGE_THRESHOLD
      : el.scrollTop + el.clientHeight >=
        el.scrollHeight - SCROLL_EDGE_THRESHOLD;
    setScrollBehavior((prev) =>
      prev === 'snap-to-top' ? prev : atEdge ? 'tail' : 'free',
    );
  }, [reverseLogs]);

  useEffect(() => {
    const el = logsPanelBodyRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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

  // Gate displayData updates to prevent the DOM from shrinking during background reconnects.
  // Instead, skip empty resets and only switch to new data when:
  //   - scrollBehavior is 'tail': show live updates immediately, or
  //   - the new stream has caught back up to at least the previous length: the DOM won't
  //     shrink, preserving the user's approximate scroll position.
  useEffect(() => {
    const newLength = streamData.data.length;
    if (newLength === 0) return;
    if (scrollBehavior !== 'tail' && newLength < displayData.length) return;

    const snapshot = streamData.data;
    const timeoutId = setTimeout(() => {
      setDisplayData(snapshot);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [streamData.data, scrollBehavior, displayData.length]);

  useEffect(() => {
    const el = logsPanelBodyRef.current;
    if (!el) return;
    if (scrollBehavior === 'tail') {
      el.scrollTop = reverseLogs ? 0 : el.scrollHeight;
    } else if (scrollBehavior === 'snap-to-top') {
      el.scrollTop = 0;
      const id = setTimeout(() => setScrollBehavior('free'), 0);
      return () => clearTimeout(id);
    }
  }, [displayData, scrollBehavior, reverseLogs]);

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
    setScrollBehavior('tail');
  };

  const onLogTimeframeChange = (timeValue: string) => {
    setDisplayData([]);
    setSinceSeconds(timeValue);
    setScrollBehavior('snap-to-top');
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
          <div className="logs-panel-body" ref={logsPanelBodyRef}>
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
