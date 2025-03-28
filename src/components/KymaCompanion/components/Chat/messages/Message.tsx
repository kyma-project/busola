import { Icon, Link, Text } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import CodePanel from './CodePanel';
import { segmentMarkdownText } from 'components/KymaCompanion/utils/formatMarkdown';
import TasksList from './TasksList';
import './Message.scss';

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
}

export default function Message({
  author,
  messageChunks,
  isLoading,
  hasError,
  isLatestMessage,
}: MessageProps): JSX.Element {
  const { t } = useTranslation();
  if (isLoading) {
    return <TasksList messageChunks={messageChunks} />;
  }

  const displayError =
    hasError &&
    ((author === 'user' && !isLatestMessage) ||
      (author === 'ai' && isLatestMessage));

  const finalChunk = messageChunks.at(-1);
  const segmentedText = segmentMarkdownText(
    finalChunk?.data?.answer?.content ?? '',
  );

  const className = author === 'user' ? 'right-aligned' : 'left-aligned';

  return (
    <div className={'message-container ' + className}>
      <div className={`message ${className}${displayError ? ' error' : ''}`}>
        {segmentedText && (
          <Text className="text">
            {segmentedText.map((segment, index) =>
              segment.type === 'bold' ? (
                <Text key={index} className="text bold">
                  {segment.content}
                </Text>
              ) : segment.type === 'code' ? (
                <CodePanel key={index} text={segment.content} />
              ) : segment.type === 'highlighted' ? (
                <Text key={index} className="text highlighted">
                  {segment.content}
                </Text>
              ) : segment.type === 'link' ? (
                <Link
                  key={index}
                  href={segment.content.address}
                  target="_blank"
                >
                  {segment.content.name}
                </Link>
              ) : (
                segment.content
              ),
            )}
          </Text>
        )}
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
