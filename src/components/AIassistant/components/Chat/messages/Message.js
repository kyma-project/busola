import { BusyIndicator, Text } from '@ui5/webcomponents-react';
import { segmentMarkdownText } from 'components/AIassistant/utils/formatMarkdown';
import CodePanel from './CodePanel';
import './Message.scss';

export default function Message({ className, message, isLoading }) {
  const segmentedText = segmentMarkdownText(message);
  return (
    <div className={'message ' + className}>
      {isLoading && <BusyIndicator active size="Medium" delay={0} />}
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
            ) : (
              segment.content
            ),
          )}
        </Text>
      )}
    </div>
  );
}
