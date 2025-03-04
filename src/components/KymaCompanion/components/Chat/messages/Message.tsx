import {
  BusyIndicator,
  FlexBox,
  Link,
  ObjectStatus,
  Text,
} from '@ui5/webcomponents-react';
import CodePanel from './CodePanel';
import { segmentMarkdownText } from 'components/KymaCompanion/utils/formatMarkdown';
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
    return (
      <div className={'message loading ' + className}>
        {messageChunks.length > 0 ? (
          messageChunks.map((chunk, index) => {
            const taskName =
              chunk?.data?.answer?.tasks?.[index]?.task_name || '';
            return (
              <FlexBox
                justifyContent="SpaceBetween"
                alignItems="Center"
                className="loading-item"
                key={index}
              >
                <Text className="text">{taskName}</Text>
                <div className="loading-status">
                  {index !== messageChunks.length - 1 ? (
                    <ObjectStatus state="Positive" showDefaultIcon />
                  ) : (
                    <BusyIndicator active size="S" delay={0} />
                  )}
                </div>
              </FlexBox>
            );
          })
        ) : (
          <BusyIndicator active size="M" delay={0} />
        )}
      </div>
    );
  }

  const segmentedText = segmentMarkdownText(
    messageChunks.slice(-1)[0]?.data?.answer?.content,
  );
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
              segment.content
            ),
          )}
        </Text>
      )}
    </div>
  );
}
