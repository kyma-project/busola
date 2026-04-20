import { getClusterConfig } from 'state/utils/getBackendInfo';

interface GetFollowUpQuestionsParams {
  sessionID?: string;
  handleFollowUpQuestions: (results: any) => void;
  handleFollowUpError: () => void;
  clusterUrl: string;
  token?: string;
  clientCertificateData?: string;
  clientKeyData?: string;
  certificateAuthorityData: string;
}

export default async function getFollowUpQuestions({
  sessionID = '',
  handleFollowUpQuestions,
  handleFollowUpError,
  clusterUrl,
  token,
  clientCertificateData,
  clientKeyData,
  certificateAuthorityData,
}: GetFollowUpQuestionsParams): Promise<void> {
  try {
    const { backendAddress } = getClusterConfig();
    const url = `${backendAddress}/ai-chat/followup`;

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        clusterUrl,
        certificateAuthorityData,
        sessionId: sessionID,
        clusterToken: token,
        clientCertificateData,
        clientKeyData,
      }),
      method: 'POST',
    });

    const promptSuggestions = (await response.json()).promptSuggestions;
    if (!promptSuggestions) {
      throw new Error('No follow-up questions available');
    }

    handleFollowUpQuestions(promptSuggestions);
  } catch (error) {
    handleFollowUpError();
    console.error('Error fetching data:', error);
  }
}
