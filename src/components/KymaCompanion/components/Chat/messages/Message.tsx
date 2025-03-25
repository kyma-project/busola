import { Link, Text } from '@ui5/webcomponents-react';
import CodePanel from './CodePanel';
import TasksList from './TasksList';
import {
  handleResponseFormatting,
  segmentMarkdownText,
} from 'components/KymaCompanion/utils/formatMarkdown';
import './Message.scss';
import { useRecoilState, useRecoilValue } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clusterState } from 'state/clusterAtom';
import pluralize from 'pluralize';

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

  const test = segmentMarkdownText(
    messageChunks.slice(-1)[0]?.data?.answer?.content,
  );
  const segmentedText = handleResponseFormatting(
    messageChunks.slice(-1)[0]?.data?.answer?.content,
  );
  console.log(segmentedText);
  console.log(test);

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
