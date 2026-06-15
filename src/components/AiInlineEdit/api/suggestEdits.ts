import { getClusterConfig } from 'state/utils/getBackendInfo';

export type SuggestEditsContext = {
  line_start: number;
  line_end: number;
};

export type SuggestEditsParams = {
  userQuery: string;
  context: SuggestEditsContext;
  fullYaml: string;
  additionalContext?: string | null;
  signal?: AbortSignal;
};

/**
 * Calls the Busola backend proxy (`/backend/ai-editor/suggest-edits`), which
 * forwards to the external kyma-ai-editor `/v1/suggest-edits` endpoint and
 * returns the full updated YAML document. No cluster auth is required, so a
 * plain `fetch` is used (mirrors the Kyma Companion api layer).
 */
export async function suggestEdits({
  userQuery,
  context,
  fullYaml,
  additionalContext = null,
  signal,
}: SuggestEditsParams): Promise<string> {
  const { backendAddress } = getClusterConfig();

  const response = await fetch(`${backendAddress}/ai-editor/suggest-edits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      user_query: userQuery,
      context,
      full_yaml: fullYaml,
      additional_context: additionalContext,
    }),
    signal,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody?.error) {
        message = errorBody.error;
      }
    } catch {
      // response had no JSON body; keep the status-based message
    }
    throw new Error(message);
  }

  const data = await response.json();
  if (typeof data?.updated_yaml !== 'string') {
    throw new Error('AI inline edit backend returned an unexpected response');
  }
  return data.updated_yaml;
}
