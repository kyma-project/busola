import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Button, Card, Title } from '@ui5/webcomponents-react';
import { showTerminalAtom } from 'state/showTerminalAtom';
import { useAtom, useAtomValue } from 'jotai';
import { themeAtom } from 'state/settings/themeAtom';
import { getXtermTheme } from './terminalThemes';
import './BusolaTerminal.scss';
import '@xterm/xterm/css/xterm.css';

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
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [showTerminal, setShowTerminal] = useAtom(showTerminalAtom);
  const theme = useAtomValue(themeAtom);

  useEffect(() => {
    if (!termDOM?.current) return;
    const term = new Terminal({ theme: getXtermTheme(theme) });
    const fitAddon = new FitAddon();
    termRef.current = term;
    fitAddonRef.current = fitAddon;

    term.loadAddon(fitAddon);
    term.open(termDOM.current);
    fitAddon.fit();
    term.write(
      'Hello from terminal. TODO: Logic and functionality will be implemented in future tasks',
    );

    // input
    term.onData((data) => {
      // TODO: Temporary. Implement terminal input handling logic in future tasks.
      term.write(data);
    });

    const observer = new ResizeObserver(() => {
      fitAddon.fit();
      if (onMinHeightComputed && termDOM.current) {
        const xtermRow =
          termDOM.current.querySelector<HTMLElement>('.xterm-rows > div');
        const cardHeader = termDOM.current
          .closest('.terminal-card')
          ?.querySelector<HTMLElement>('.terminal-card__header')?.offsetHeight;
        const cellHeight = xtermRow?.offsetHeight ?? 20;
        const headerHeight = cardHeader ?? 60;
        const contentPadding = 40; // 1rem top + bottom from padding + rounded up for a better experience.
        onMinHeightComputed(
          Math.ceil(headerHeight + contentPadding + cellHeight),
        );
      }
    });
    observer.observe(termDOM.current);

    return () => {
      observer.disconnect();
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      if (termRef.current) {
        termRef.current.options.theme = getXtermTheme(theme);
      }
    };

    applyTheme();

    if (theme === 'light_dark') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', applyTheme);
      return () => mq.removeEventListener('change', applyTheme);
    }
  }, [theme]);

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

  return (
    <div className={containerClass} style={containerStyle}>
      <Card
        className="terminal-card"
        accessibleName={t('terminal.name')}
        header={
          <div className="terminal-card__header">
            <Title level="H5" size="H5">
              {t('terminal.name')}
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
                onClick={() =>
                  setShowTerminal((prev) => ({ ...prev, isOpen: false }))
                }
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
