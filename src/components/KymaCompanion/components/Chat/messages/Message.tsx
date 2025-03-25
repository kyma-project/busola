import { Icon, Link, Popover, Text } from '@ui5/webcomponents-react';
import CodePanel from './CodePanel';
import { segmentMarkdownText } from 'components/KymaCompanion/utils/formatMarkdown';
import TasksList from './TasksList';
import './Message.scss';
import { createPortal } from 'react-dom';
import { useState } from 'react';

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
  className: string;
  messageChunks: MessageChunk[];
  isLoading: boolean;
  index: number;
  errorNotice: string | null;
  isLatestMessage: boolean;
}

export default function Message({
  author,
  className,
  messageChunks,
  isLoading,
  errorNotice,
  index,
  isLatestMessage,
}: MessageProps): JSX.Element {
  const [popoverOpen, setPopoverOpen] = useState(false);

  if (isLoading) {
    return <TasksList messageChunks={messageChunks} />;
  }

  const displayErrorNotice =
    errorNotice && author === 'user' && !isLatestMessage;

  const finalChunk = messageChunks.at(-1);
  const segmentedText = segmentMarkdownText(
    finalChunk?.data?.answer?.content ?? '',
  );

  return (
    <div className={'message-container ' + className}>
      {displayErrorNotice && (
        <>
          <Icon
            id={`errorNoticOpener-${index}`}
            onClick={() => setPopoverOpen(true)}
            name="information"
            design="Negative"
            mode="Interactive"
          />
          {createPortal(
            <Popover
              opener={`errorNoticOpener-${index}`}
              open={popoverOpen}
              onClose={() => setPopoverOpen(false)}
              placement="Bottom"
            >
              <Text className="description">{errorNotice}</Text>
            </Popover>,
            document.body,
          )}
        </>
      )}
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
    </div>
  );
}
