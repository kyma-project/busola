import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal } from '@xterm/xterm';
import { Button, Card, Title } from '@ui5/webcomponents-react';
import { showTerminalAtom } from 'state/showTerminalAtom';
import { useAtom, useAtomValue } from 'jotai';
import { themeAtom } from 'state/settings/themeAtom';
import { getXtermTheme } from './terminalThemes';
import './BusolaTerminal.scss';
import '@xterm/xterm/css/xterm.css';

export function BusolaTerminal() {
  const { t } = useTranslation();
  const termDOM = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const [showTerminal, setShowTerminal] = useAtom(showTerminalAtom);
  const theme = useAtomValue(themeAtom);

  useEffect(() => {
    if (!termDOM?.current) return;
    const term = new Terminal({ theme: getXtermTheme(theme) });
    termRef.current = term;

    term.open(termDOM.current);
    term.focus();
    term.write(
      'Hello from terminal. TODO: Logic and functionality will be implemented in future tasks',
    );

    const onFocus = () => term.focus();
    window.addEventListener('focus', onFocus);

    return () => {
      term.dispose();
      termRef.current = null;
      window.removeEventListener('focus', onFocus);
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

  return (
    <div className={containerClass}>
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
              <Button
                design="Transparent"
                icon={showTerminal.isDocked ? 'pushpin-off' : 'pushpin-on'}
                onClick={() =>
                  setShowTerminal((prev) => ({
                    ...prev,
                    isDocked: !prev.isDocked,
                  }))
                }
              />
              <Button
                design="Transparent"
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
