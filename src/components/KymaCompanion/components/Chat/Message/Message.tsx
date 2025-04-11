import { Icon, Text } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { formatMessage } from 'components/KymaCompanion/utils/formatMarkdown';
import TasksList from '../TaskList/TasksList';
import { isCurrentThemeDark, themeState } from 'state/preferences/themeAtom';
import { useRecoilValue } from 'recoil';
import './Message.scss';
import './marked.scss';

export interface MessageChunk {
  event?: string;
  data: {
    agent?: string;
    answer: {
      content: string;
      tasks?: {
        task_id: number;
        task_name: string;
        status: string;
        agent: string;
      }[];
      next: string;
    };
    error?: string | null;
  };
}

interface MessageProps {
  author: 'user' | 'ai';
  messageChunks: MessageChunk[];
  isLoading: boolean;
  hasError: boolean;
  isLatestMessage: boolean;
  disableFormatting?: boolean;
}

export default function Message({
  author,
  messageChunks,
  isLoading,
  hasError,
  isLatestMessage,
}: MessageProps): JSX.Element {
  const currentTheme = useRecoilValue(themeState);
  const isThemeDark = isCurrentThemeDark(currentTheme);
  const predefinedMarkdownThemeClass = isThemeDark ? 'dark' : 'light';

  const { t } = useTranslation();
  if (isLoading) {
    return <TasksList messageChunks={messageChunks} />;
  }

  const displayError =
    hasError &&
    ((author === 'user' && !isLatestMessage) ||
      (author === 'ai' && isLatestMessage));

  const finalChunk = messageChunks.at(-1);
  const text = finalChunk?.data?.answer?.content ?? '';
  const segmentedText = formatMessage(text, predefinedMarkdownThemeClass);

  const className = author === 'user' ? 'right-aligned' : 'left-aligned';

  return (
    <div className={'message-container ' + className}>
      <div
        className={`markdown message ${className}${
          displayError ? ' error' : ''
        }`}
      >
        {segmentedText}
      </div>
      {displayError && (
        <div className={'message-error ' + className}>
          <Text className="error-text">
            {author === 'user'
              ? t('kyma-companion.error.chat-error')
              : t('kyma-companion.error.suggestions-error')}
          </Text>
          <Icon name="error" design="Negative" className="error-icon" />
        </div>
      )}
    </div>
  );
}
