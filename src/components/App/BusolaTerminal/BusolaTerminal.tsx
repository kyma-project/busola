import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal } from '@xterm/xterm';
import { Button, Card, Title } from '@ui5/webcomponents-react';
import { showTerminalAtom } from 'state/showTerminalAtom';
import { useSetAtom } from 'jotai';
import './BusolaTerminal.scss';
import '@xterm/xterm/css/xterm.css';

export function BusolaTerminal() {
  const { t } = useTranslation();
  const termDOM = useRef<HTMLDivElement>(null);
  const setShowTerminal = useSetAtom(showTerminalAtom);

  useEffect(() => {
    if (!termDOM?.current) return;
    // init
    const term = new Terminal();

    // config
    term.open(termDOM?.current);
    term.focus();

    // focus
    window.addEventListener('focus', () => {
      term.focus();
    });

    return () => {
      term?.dispose?.();
      window.removeEventListener('focus', () => {
        term.focus();
      });
    };
  }, []);

  return (
    <div className="terminal-container">
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
                icon="full-screen"
                onClick={() => {}}
              />
              <Button
                design="Transparent"
                icon="decline"
                tooltip={t('common.buttons.close')}
                onClick={() => setShowTerminal(false)}
              />
            </div>
          </div>
        }
      >
        <div ref={termDOM} className="terminal"></div>
      </Card>
    </div>
  );
}
