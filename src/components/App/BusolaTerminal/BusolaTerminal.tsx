import { RefObject, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Button, Card, Title } from '@ui5/webcomponents-react';
import { showTerminalAtom } from 'state/showTerminalAtom';
import { terminalSessionAtom } from 'state/terminalSessionAtom';
import { clusterAtom } from 'state/clusterAtom';
import { useAtom, useAtomValue } from 'jotai';
import { attachThemeLoaded, detachThemeLoaded } from '@ui5/webcomponents-base';
import { getXtermTheme } from './terminalThemes';
import { useTerminalSession } from './useTerminalSession';
import './BusolaTerminal.scss';
import '@xterm/xterm/css/xterm.css';

function createXTerm() {
  const term = new Terminal({ theme: getXtermTheme() });
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  fitAddon.fit();
  return { term, fitAddon };
}

function createResizeObserver(
  fitAddon: FitAddon,
  termDOM: RefObject<HTMLDivElement | null>,
  onMinHeightComputed?: (minHeight: number) => void,
) {
  return new ResizeObserver(() => {
    fitAddon.fit();
    if (onMinHeightComputed && termDOM.current) {
      const xtermRow =
        termDOM.current.querySelector<HTMLElement>('.xterm-rows > div');
      const cardHeader = termDOM.current
        .closest('.terminal-card')
        ?.querySelector<HTMLElement>('.terminal-card__header')?.offsetHeight;
      const cellHeight = xtermRow?.offsetHeight ?? 20;
      const headerHeight = cardHeader ?? 60;
      const contentPadding = 40; // margin (0.5rem+1rem) + padding (2×0.5rem)
      onMinHeightComputed(
        Math.ceil(headerHeight + contentPadding + cellHeight),
      );
    }
  });
}
export function BusolaTerminal({
  dockedHeight,
  onMinHeightComputed,
}: {
  dockedHeight?: number;
  onMinHeightComputed?: (minHeight: number) => void;
}) {
  const { t } = useTranslation();
  const termDOM = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const location = useLocation();
  const [showTerminal, setShowTerminal] = useAtom(showTerminalAtom);
  const [sessionInfo, setSessionInfo] = useAtom(terminalSessionAtom);
  const { connect, disconnect } = useTerminalSession();
  const cluster = useAtomValue(clusterAtom);
  const openedOnClusterRef = useRef(cluster?.name);
  const isOnClustersPage = location.pathname === '/clusters';

  useEffect(() => {
    if (cluster?.name !== openedOnClusterRef.current || isOnClustersPage) {
      openedOnClusterRef.current = cluster?.name;
      disconnect();
      setShowTerminal((prev) => ({ ...prev, isOpen: false }));
    }
  }, [cluster?.name, setShowTerminal, disconnect, isOnClustersPage]);

  useEffect(() => {
    console.log(sessionInfo.status);

    if (!termDOM?.current) return;
    switch (sessionInfo.status) {
      case 'reconnecting': {
        termRef.current
          ? connect(termRef.current)
          : console.warn('Reconnecting to not existing terminal, aborting');
        break;
      }
      case 'provisioned': {
        const { term, fitAddon } = createXTerm();
        term.open(termDOM.current);
        termRef.current = term;
        connect(term);
        const observer = createResizeObserver(
          fitAddon,
          termDOM,
          onMinHeightComputed,
        );
        observerRef.current = observer;
        observer.observe(termDOM.current);
        break;
      }
    }
  }, [sessionInfo.status]);

  useEffect(() => {
    const applyTerminalTheme = () => {
      if (termRef.current) {
        termRef.current.options.theme = getXtermTheme();
      }
    };

    // UI5 applies the theme's CSS variables to :root asynchronously, so the
    // resolved colors are only available after this event fires. Re-read them
    // here to keep the terminal in sync on every theme change.
    attachThemeLoaded(applyTerminalTheme);
    return () => detachThemeLoaded(applyTerminalTheme);
  }, []);

  useEffect(() => {
    return () => {
      //   cleanup on dismount
      console.log('Cleaning on dismount');
      observerRef.current?.disconnect();
      observerRef.current = null;
      disconnect();
      termRef.current?.dispose();
      termRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    console.log('closing');
    setSessionInfo((prev) => ({ ...prev, status: 'disconnecting' }));
    disconnect();
    setShowTerminal((prev) => ({ ...prev, isOpen: false }));
  };

  const containerClass = [
    'terminal-container',
    showTerminal.isFullscreen && 'terminal-container--fullscreen',
    !showTerminal.isDocked &&
      !showTerminal.isFullscreen &&
      'terminal-container--popup',
  ]
    .filter(Boolean)
    .join(' ');

  const containerStyle =
    dockedHeight && showTerminal.isDocked && !showTerminal.isFullscreen
      ? { height: `${dockedHeight}px`, flexShrink: 0 as const }
      : undefined;

  let statusLabel: string | null;
  switch (sessionInfo.status) {
    case 'provisioning':
      statusLabel = t('terminal.status.provisioning');
      break;
    case 'error':
      console.warn('Terminal state is in error:', sessionInfo.errorMessage);
      statusLabel = t('terminal.status.error');
      break;
    case 'reconnecting':
      statusLabel = t('terminal.status.reconnecting');
      break;
    default:
      statusLabel = null;
  }

  return (
    <div className={containerClass} style={containerStyle}>
      <Card
        className="terminal-card"
        accessibleName={t('terminal.name')}
        header={
          <div className="terminal-card__header">
            <Title level="H5" size="H5">
              {t('terminal.name')}
              {statusLabel && (
                <span className="terminal-card__status"> — {statusLabel}</span>
              )}
            </Title>
            <div>
              <Button
                design="Transparent"
                accessibleName="full-screen-terminal"
                icon={
                  showTerminal.isFullscreen ? 'exit-full-screen' : 'full-screen'
                }
                onClick={() =>
                  setShowTerminal((prev) => ({
                    ...prev,
                    isFullscreen: !prev.isFullscreen,
                  }))
                }
              />
              {/*TODO: Initial changes are ready (docking, undocking). It will be improved (e.g. moving undocked terminal) in the next task. */}
              {/* <Button
                design="Transparent"
                icon={showTerminal.isDocked ? 'pushpin-on' : 'pushpin-off'}
                onClick={() =>
                  setShowTerminal((prev) => ({
                    ...prev,
                    isDocked: !prev.isDocked,
                  }))
                }
              /> */}
              <Button
                design="Transparent"
                accessibleName="close-terminal"
                icon="decline"
                tooltip={t('common.buttons.close')}
                onClick={handleClose}
              />
            </div>
          </div>
        }
      >
        <div ref={termDOM} className="terminal-content"></div>
      </Card>
    </div>
  );
}
