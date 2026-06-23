import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { saveAs } from 'file-saver';
import {
  Button,
  Label,
  Option,
  Select,
  Switch,
} from '@ui5/webcomponents-react';
import { useSetAtom } from 'jotai';
import { useGetStream } from 'shared/hooks/BackendAPI/useGet';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { useNotification } from 'shared/contexts/NotificationContext';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { SearchInput } from 'shared/components/GenericList/SearchInput';
import { useTranslation } from 'react-i18next';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';

import './ContainersLogs.scss';
import { LogsPanel } from 'resources/Pods/LogsPanel';

const HOUR_IN_SECONDS = 3600;
const MAX_TIMEFRAME_IN_SECONDS = Number.MAX_SAFE_INTEGER;
const DEFAULT_TIMEFRAME = HOUR_IN_SECONDS * 6;

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
  const [logsToSave, setLogsToSave] = useState([]);
  const [sinceSeconds, setSinceSeconds] = useState(String(DEFAULT_TIMEFRAME));
  const selectedLogIndex = useRef(0);
  const setShowCompanion = useSetAtom(showKymaCompanionAtom);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const floatingButtonRef = useRef<HTMLDivElement>(null);
  const capturedSelectionRef = useRef<string>('');
  const capturedLineRangeRef = useRef<string | undefined>(undefined);
  const capturedScrollTargetRef = useRef<Element | null>(null);
  const skipNextCaptureRef = useRef(false);
  const dynamicPageHeaderRef = useRef<Element | null>(null);

  const showFloatingButton = (x: number, y: number, flipped = false) => {
    const el = floatingButtonRef.current;
    if (!el) return;
    el.style.transform = `translate(calc(${x}px - 50%), ${y}px)`;
    el.dataset.flipped = String(flipped);
    el.style.display = '';
  };

  const hideFloatingButton = () => {
    const el = floatingButtonRef.current;
    if (el) el.style.display = 'none';
  };

  useEffect(() => {
    // Position/visibility updates go directly to the DOM so the browser can
    // composite them without scheduling React re-renders (avoiding 60fps jitter).
    // A scroll listener won't work because the actual scrolling element
    // (ui5-dynamic-page-scroll-container) lives in shadow DOM and scroll events
    // don't cross the shadow boundary even with capture-phase listeners.
    let rafId: number;
    const loop = () => {
      if (capturedSelectionRef.current) {
        const selection = window.getSelection();
        if (selection?.rangeCount) {
          const sr = selection.getRangeAt(0).getBoundingClientRect();
          const cr = logContainerRef.current?.getBoundingClientRect();
          if (cr) {
            // The real scrolling happens in the shadow DOM (ui5-dynamic-page-scroll-container),
            // so cr.top goes negative as the user scrolls. The sticky DynamicPage title bar
            // stays fixed; measure its bottom as the true top clip boundary.
            if (!dynamicPageHeaderRef.current) {
              const dp = logContainerRef.current?.closest('ui5-dynamic-page');
              dynamicPageHeaderRef.current =
                (dp as any)?.shadowRoot?.querySelector('header') ?? null;
            }
            const stickyBottom =
              dynamicPageHeaderRef.current?.getBoundingClientRect()?.bottom ??
              0;
            const visibleTop = Math.max(cr.top, stickyBottom);
            const visibleBottom = Math.min(cr.bottom, window.innerHeight);
            if (sr.bottom < visibleTop || sr.top > visibleBottom) {
              hideFloatingButton();
            } else {
              const aboveY = sr.top - 44;
              const flipped = aboveY < stickyBottom;
              const y = flipped ? sr.bottom + 8 : aboveY;
              showFloatingButton(sr.left + sr.width / 2, y, flipped);
            }
          }
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const handleMouseUp = () => {
      // Defer so the browser finalises the selection after mouseup
      setTimeout(() => {
        if (skipNextCaptureRef.current) {
          skipNextCaptureRef.current = false;
          return;
        }
        const selection = window.getSelection();
        const text = selection?.toString().trim() ?? '';
        if (!text || !selection?.rangeCount) return;
        const range = selection.getRangeAt(0);
        if (!logContainerRef.current?.contains(range.commonAncestorContainer))
          return;
        capturedSelectionRef.current = text;

        const logDivs = Array.from(
          logContainerRef.current?.querySelectorAll('div.logs') ?? [],
        );
        const hits = logDivs.reduce<number[]>((acc, el, i) => {
          if (range.intersectsNode(el)) acc.push(i + 1);
          return acc;
        }, []);
        if (hits.length === 0) {
          capturedLineRangeRef.current = undefined;
          capturedScrollTargetRef.current = null;
        } else if (hits.length === 1) {
          capturedLineRangeRef.current = `line ${hits[0]}`;
          capturedScrollTargetRef.current = logDivs[hits[0] - 1];
        } else {
          capturedLineRangeRef.current = `lines ${hits[0]}–${hits[hits.length - 1]}`;
          capturedScrollTargetRef.current = logDivs[hits[0] - 1];
        }
      }, 0);
    };

    const handleSelectionChange = () => {
      if (!window.getSelection()?.toString().trim()) {
        capturedSelectionRef.current = '';
        hideFloatingButton();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const handleLogInsightsClick = () => {
    setShowCompanion((prev) => ({
      ...prev,
      show: true,
      fullScreen: false,
      insightsTarget: {
        resourceKind: 'Pod',
        resourceName: podName,
        resourceApiVersion: 'v1',
        namespace,
        additionalContext: `## User-Selected Log Lines\nThe user has selected the following log lines from the pod for analysis:\n\n\`\`\`\n${capturedSelectionRef.current}\n\`\`\``,
        logLineRange: capturedLineRangeRef.current,
      },
    }));
    skipNextCaptureRef.current = true;
    capturedSelectionRef.current = '';
    capturedLineRangeRef.current = undefined;
    hideFloatingButton();

    // After the companion panel opens the log container shrinks. Watch for that
    // resize and scroll the first selected line back into center view.
    const scrollTarget = capturedScrollTargetRef.current;
    capturedScrollTargetRef.current = null;
    if (scrollTarget && logContainerRef.current) {
      const ro = new ResizeObserver(() => {
        ro.disconnect();
        scrollTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      ro.observe(logContainerRef.current);
    }
  };

  const logTimeframeOptions = [
    { text: '1 hour', key: String(HOUR_IN_SECONDS) },
    { text: '3 hours', key: String(3 * HOUR_IN_SECONDS) },
    { text: '6 hours', key: String(6 * HOUR_IN_SECONDS) },
    { text: '1 day', key: String(24 * HOUR_IN_SECONDS) },
    { text: 'all', key: String(MAX_TIMEFRAME_IN_SECONDS) },
  ];

  const url = `/api/v1/namespaces/${namespace}/pods/${podName}/log?container=${containerName}&follow=true&tailLines=1000&timestamps=true&sinceSeconds=${sinceSeconds}`;
  const streamData = useGetStream(url);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLogsToSave(streamData.data || []);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [streamData.data]);

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
        logsToSave.map((log) => `${log}\n`),
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
    <>
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
                  disabled={!logsToSave?.length}
                  onChange={onSwitchChange}
                />
                <Label>{t('pods.labels.reverse-logs')}</Label>
                <Switch
                  disabled={!logsToSave?.length}
                  onChange={onReverseChange}
                />
                <Button
                  disabled={!logsToSave?.length}
                  onClick={() => saveToFile(podName, containerName)}
                >
                  {t('pods.labels.save-to-file')}
                </Button>
                <SearchInput
                  disabled={!logsToSave?.length}
                  entriesKind="Logs"
                  searchQuery={searchQuery}
                  handleQueryChange={setSearchQuery}
                  showSuggestion={false}
                  filteredEntries={[]}
                  suggestionProperties={[]}
                  allowSlashShortcut={false}
                  onKeyDown={changeSelectedLog}
                />
              </>
            }
          >
            <div className="logs-panel-body" ref={logContainerRef}>
              <LogsPanel
                streamData={streamData}
                containerName={containerName}
                searchQuery={searchQuery}
                reverseLogs={reverseLogs}
                showTimestamps={showTimestamps}
              />
            </div>
          </UI5Panel>
        }
      />
      {createPortal(
        <div
          ref={floatingButtonRef}
          className="logs-analyze-button"
          style={{ display: 'none' }}
        >
          <Button
            design="Emphasized"
            icon="ai"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleLogInsightsClick}
          >
            {t('ai-insights.analyze-logs')}
          </Button>
        </div>,
        document.body,
      )}
    </>
  );
};

export default ContainersLogs;
