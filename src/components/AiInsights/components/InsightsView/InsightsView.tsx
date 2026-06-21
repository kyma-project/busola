import { JSX, useEffect, useRef, useState } from 'react';
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

// Read-only renderer mirroring Companion's UI5Renderer but WITHOUT CodePanel —
// CodePanel mounts useDoesNamespaceExist/useDoesResourceExist effects that fire
// /backend/apis/${apiVersion}/... lookups, which 404 when the LLM omits
// kind/apiVersion from inline code blocks. The renderer is built per render so
// the key counter resets each time (marked-react calls these into sibling
// arrays and needs unique keys).
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

  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setInsights('');
    setError(null);
    setLoading(true);

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
      auth,
      signal: controller.signal,
    })
      .then((text) => {
        if (controller.signal.aborted) return;
        setInsights(text);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err?.message || t('ai-insights.error.generic'));
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    target.resourceKind,
    target.resourceName,
    target.resourceApiVersion,
    target.namespace,
  ]);

  const contextLabel = t('ai-insights.context-label', {
    kind: target.resourceKind,
    name: target.resourceName,
  });

  // Strip Companion's <div class="yaml-block">/<div class="link"> wrappers so
  // the inner ```yaml fences render as plain markdown code blocks. Also unwrap
  // a single ```markdown … ``` fence that wraps the ENTIRE reply — the LLM
  // sometimes does that, and it would otherwise render as a literal code block
  // instead of formatted markdown. Anchored to the full trimmed string so a
  // non-greedy mid-string match doesn't truncate replies that contain a nested
  // ```yaml example.
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
            ) : loading ? (
              <div className="ai-insights-view__loading">
                <BusyIndicator active size="M" delay={0} />
                <Label>{t('ai-insights.loading')}</Label>
              </div>
            ) : (
              <div className="message-container left-aligned">
                <div className={`markdown message left-aligned ${themeClass}`}>
                  <Markdown
                    renderer={buildInsightsRenderer()}
                    openLinksInNewTab={false}
                  >
                    {content}
                  </Markdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
