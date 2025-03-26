import { Text } from '@ui5/webcomponents-react';
import CodePanel from './CodePanel';
import TasksList from './TasksList';
import {
  handleResponseFormatting,
  segmentMarkdownText,
} from 'components/KymaCompanion/utils/formatMarkdown';
import './Message.scss';

interface MessageProps {
  className: string;
  messageChunks: MessageChunk[];
  isLoading: boolean;
}

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
  };
}

export default function Message({
  className,
  messageChunks,
  isLoading,
}: MessageProps): JSX.Element {
  if (isLoading) {
    return <TasksList messageChunks={messageChunks} />;
  }

  const segmentedText = handleResponseFormatting(
    messageChunks.slice(-1)[0]?.data?.answer?.content,
  );

  return (
    <div className={'message ' + className}>
      {segmentedText && (
        <Text className="text">
          {segmentedText.map((segment, index) =>
            segment ? (
              segment.type === 'bold' ? (
                <Text key={index} className="text bold">
                  {segment.content}
                </Text>
              ) : segment.type === 'code' ||
                segment.type === 'codeWithAction' ? (
                <CodePanel key={index} segment={segment} />
              ) : segment.type === 'highlighted' ? (
                <Text key={index} className="text highlighted">
                  {segment.content}
                </Text>
              ) : (
                segment.content
              )
            ) : null,
          )}
        </Text>
      )}
    </div>
  );
}
