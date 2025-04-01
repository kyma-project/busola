import { Text } from '@ui5/webcomponents-react';
import { formatMessage } from 'components/KymaCompanion/utils/formatMarkdown';
import TasksList from './TasksList';
import './Message.scss';

interface MessageProps {
  className: string;
  messageChunks: MessageChunk[];
  isLoading: boolean;
  disableFormatting?: boolean;
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
  disableFormatting = false,
}: MessageProps): JSX.Element {
  if (isLoading) {
    return <TasksList messageChunks={messageChunks} />;
  }
  const text = messageChunks.slice(-1)[0]?.data?.answer?.content;

  let segmentedText = null;
  if (disableFormatting) {
    segmentedText = text;
  } else {
    segmentedText = formatMessage(text);
  }

  return (
    <div className={'message ' + className}>
      <Text className="text">{segmentedText}</Text>
    </div>
  );
}
