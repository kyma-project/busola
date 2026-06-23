import { JSX, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useAtomValue } from 'jotai';
import { BusyIndicator, Label, MessageStrip } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import Markdown from 'marked-react';
import { clusterAtom } from 'state/clusterAtom';
import { authDataAtom } from 'state/authDataAtom';
import { isCurrentThemeDark, themeAtom } from 'state/settings/themeAtom';
import { InsightsTarget } from 'state/companion/showKymaCompanionAtom';
import ContextLabel from 'components/KymaCompanion/components/Chat/ContextLabel/ContextLabel';
import 'components/KymaCompanion/components/Chat/Message/Message.scss';
import 'components/KymaCompanion/components/Chat/Message/marked.scss';
import { getInsights, InsightsAuth } from '../../api/getInsights';
import './InsightsView.scss';

// No CodePanel: it fires /backend/apis/... lookups that 404 when the LLM omits
// kind/apiVersion from code blocks. Counter resets per render for unique keys.
function buildInsightsRenderer() {
  let n = 0;
  return {
    code(text: string, lang: string) {
      return (
        <pre key={`c${n++}`} className="ai-insights-view__code">
          <code data-language={lang}>{text}</code>
        </pre>
      );
    },
    codespan(tokens: string) {
      return (
        <code key={`s${n++}`} className="code-border">
          {tokens}
        </code>
      );
    },
    table(table: JSX.Element[]) {
      return (
        <div key={`t${n++}`} className="table">
          {table}
        </div>
      );
    },
  };
}

type InsightsViewProps = {
  target: InsightsTarget;
};

export function InsightsView({ target }: InsightsViewProps) {
  const { t } = useTranslation();
  const cluster = useAtomValue<any>(clusterAtom);
  const authData = useAtomValue<any>(authDataAtom);
  const currentTheme = useAtomValue(themeAtom);
  const themeClass = isCurrentThemeDark(currentTheme) ? 'dark' : 'light';

  // State is reset via a key prop on this component — no setState needed in the effect.
  const [{ insights, loading, error, ttft }, setViewState] = useState({
    insights: '',
    loading: true,
    error: null as string | null,
    ttft: null as number | null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const firstTokenRef = useRef<boolean>(true);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    firstTokenRef.current = true;
    startTimeRef.current = performance.now();

    const auth: InsightsAuth = {
      clusterUrl: cluster?.currentContext?.cluster?.cluster?.server,
      certificateAuthorityData:
        cluster?.currentContext?.cluster?.cluster?.[
          'certificate-authority-data'
        ],
      clusterToken: authData?.token,
      clientCertificateData: authData?.['client-certificate-data'],
      clientKeyData: authData?.['client-key-data'],
    };

    getInsights({
      resourceKind: target.resourceKind,
      resourceName: target.resourceName,
      resourceApiVersion: target.resourceApiVersion,
      namespace: target.namespace,
      additionalContext: target.additionalContext,
      auth,
      signal: controller.signal,
      onToken: (token) => {
        if (firstTokenRef.current) {
          firstTokenRef.current = false;
          const elapsed =
            Math.round((performance.now() - startTimeRef.current) / 100) / 10;
          // React 18 batches state updates; force a render so the spinner
          // disappears as soon as the first token arrives.
          flushSync(() =>
            setViewState((prev) => ({
              ...prev,
              insights: token,
              ttft: elapsed,
            })),
          );
        } else {
          setViewState((prev) => ({
            ...prev,
            insights: prev.insights + token,
          }));
        }
      },
    })
      .then(() => {
        if (controller.signal.aborted) return;
        setViewState((prev) => ({ ...prev, loading: false }));
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setViewState((prev) => ({
          ...prev,
          error: err?.message || t('ai-insights.error.generic'),
          loading: false,
        }));
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextLabel =
    t('ai-insights.context-label', {
      kind: target.resourceKind,
      name: target.resourceName,
    }) + (target.logLineRange ? ` · ${target.logLineRange}` : '');

  // Strip companion div wrappers; unwrap a top-level ```markdown fence the LLM
  // sometimes wraps the entire reply in (anchored to avoid truncating nested blocks).
  const stripped = insights.replace(/<div[^>]*>/g, '').replace(/<\/div>/g, '');
  const trimmed = stripped.trim();
  const sanitized = /^```markdown\s*\n[\s\S]*\n```\s*$/.test(trimmed)
    ? trimmed.replace(/^```markdown\s*\n/, '').replace(/\n```\s*$/, '')
    : stripped;

  const content =
    !loading && !error && !sanitized.trim()
      ? t('ai-insights.error.empty')
      : sanitized;

  return (
    <div className="ai-insights-view">
      <div className="ai-insights-view__chat sap-margin-x-tiny sap-margin-top-tiny">
        <div className="context-group">
          <ContextLabel labelText={contextLabel} />
          <div className="message-context">
            {error ? (
              <MessageStrip design="Negative" hideCloseButton role="alert">
                {error}
              </MessageStrip>
            ) : loading && !insights ? (
              <div className="ai-insights-view__loading">
                <BusyIndicator active size="M" delay={0} />
                <Label>{t('ai-insights.loading')}</Label>
              </div>
            ) : (
              <>
                {ttft !== null && (
                  <span className="ai-insights-view__ttft">
                    {t('ai-insights.ttft', { seconds: ttft })}
                  </span>
                )}
                <div className="message-container left-aligned">
                  <div
                    className={`markdown message left-aligned ${themeClass}`}
                  >
                    <Markdown
                      renderer={buildInsightsRenderer()}
                      openLinksInNewTab={false}
                    >
                      {content}
                    </Markdown>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
