import { Link, Text } from '@ui5/webcomponents-react';
import CodePanel from './CodePanel';
import { segmentMarkdownText } from 'components/KymaCompanion/utils/formatMarkdown';
import TasksList from './TasksList';
import './Message.scss';
import { TextFormatter } from 'components/KymaCompanion/components/Chat/messages/formatter/TextFormatter';

interface MessageProps {
  className: string;
  messageChunks: MessageChunk[];
  isLoading: boolean;
  formatPlaintext?: boolean;
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
  formatPlaintext = true,
}: MessageProps): JSX.Element {
  if (isLoading) {
    return <TasksList messageChunks={messageChunks} />;
  }

  const segmentedText = segmentMarkdownText(
    messageChunks.slice(-1)[0]?.data?.answer?.content,
  );
  console.log(segmentedText);
  return (
    <div className={'message ' + className}>
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
              <Link key={index} href={segment.content.address} target="_blank">
                {segment.content.name}
              </Link>
            ) : (
              <TextFormatter
                text={segment.content}
                disabled={false}
                // disabled={!formatPlaintext}
              ></TextFormatter>
            ),
          )}
        </Text>
      )}
    </div>
  );
}
