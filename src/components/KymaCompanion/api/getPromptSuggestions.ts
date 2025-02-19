import { PostFn } from 'shared/hooks/BackendAPI/usePost';

interface GetPromptSuggestionsParams {
  post: PostFn;
  namespace?: string;
  resourceType: string;
  groupVersion?: string;
  resourceName?: string;
}

interface PromptSuggestionsResponse {
  promptSuggestions: string[];
  conversationId: string;
}

export default async function getPromptSuggestions({
  post,
  namespace = '',
  resourceType = '',
  groupVersion = '',
  resourceName = '',
}: GetPromptSuggestionsParams): Promise<PromptSuggestionsResponse | false> {
  try {
    const response = await post('/ai-chat/suggestions', {
      namespace,
      resourceType,
      groupVersion,
      resourceName,
    });

    if (
      response &&
      typeof response === 'object' &&
      Array.isArray(response.promptSuggestions) &&
      typeof response.conversationId === 'string'
    ) {
      return response as PromptSuggestionsResponse;
    }

    console.error('Invalid response format:', response);
    return false;
  } catch (error) {
    console.error('Error fetching data:', error);
    return false;
  }
}
