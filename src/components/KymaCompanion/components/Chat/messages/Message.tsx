import {
  BusyIndicator,
  FlexBox,
  Link,
  ObjectStatus,
  Text,
} from '@ui5/webcomponents-react';
import CodePanel from './CodePanel';
import './Message.scss';

interface MessageProps {
  className: string;
  messageChunks: Array<{ result: string }>; // Adjust this type based on the structure of 'messageChunks'
  isLoading: boolean;
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
          messageChunks.map((chunk, index) => (
            <FlexBox
              justifyContent="SpaceBetween"
              alignItems="Center"
              className="loading-item"
              key={index}
            >
              <Text className="text">{chunk?.result}</Text>
              <div className="loading-status">
                {index !== messageChunks.length - 1 ? (
                  <ObjectStatus state="Positive" showDefaultIcon />
                ) : (
                  <BusyIndicator active size="S" delay={0} />
                )}
              </div>
            </FlexBox>
          ))
        ) : (
          <BusyIndicator active size="M" delay={0} />
        )}
      </div>
    );
  }

  const segmentedText: any[] = [];
  // TODO: uncomment when utils changes are added
  // const segmentedText = segmentMarkdownText(messageChunks.slice(-1)[0]?.result);
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
