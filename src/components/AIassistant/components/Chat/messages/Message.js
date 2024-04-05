import { BusyIndicator, Text } from '@ui5/webcomponents-react';
import CodePanel from './CodePanel';
import './Message.scss';

export default function Message({ className, message, isLoading }) {
  const segmentedText = formatText(message);
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

function formatText(text) {
  if (!text) return [];
  const regex = /(\*\*(.*?)\*\*)|(```([\s\S]*?)```)|(`(.*?)`)|[^*`]+/g;
  return text.match(regex).map(segment => {
    if (segment.startsWith('**')) {
      return {
        type: 'bold',
        content: segment.replace(/\*\*/g, ''),
      };
    } else if (segment.startsWith('```')) {
      return {
        type: 'code',
        content: segment.replace(/```/g, ''),
      };
    } else if (segment.startsWith('`')) {
      return {
        type: 'highlighted',
        content: segment.replace(/`/g, ''),
      };
    } else {
      return {
        type: 'normal',
        content: segment,
      };
    }
  });
}
