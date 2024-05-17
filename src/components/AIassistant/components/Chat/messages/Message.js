import {
  BusyIndicator,
  FlexBox,
  Link,
  ObjectStatus,
  Text,
} from '@ui5/webcomponents-react';
import { segmentMarkdownText } from 'components/AIassistant/utils/formatMarkdown';
import CodePanel from './CodePanel';
import './Message.scss';

export default function Message({ className, messageChunks, isLoading }) {
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
                  <ObjectStatus state="Success" showDefaultIcon />
                ) : (
                  <BusyIndicator active size="Small" delay={0} />
                )}
              </div>
            </FlexBox>
          ))
        ) : (
          <BusyIndicator active size="Medium" delay={0} />
        )}
      </div>
    );
  }

  const segmentedText = segmentMarkdownText(messageChunks.slice(-1)[0]?.result);
  return (
    <div className={'message ' + className}>
      {segmentedText && (
        <Text className="text" renderWhitespace hyphenated>
          {segmentedText.map((segment, index) =>
            segment.type === 'bold' ? (
              <Text key={index} className="text bold" renderWhitespace>
                {segment.content}
              </Text>
            ) : segment.type === 'code' ? (
              <CodePanel key={index} text={segment.content} />
            ) : segment.type === 'highlighted' ? (
              <Text key={index} className="text highlighted" renderWhitespace>
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
