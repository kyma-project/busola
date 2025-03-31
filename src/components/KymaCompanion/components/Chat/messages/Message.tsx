import { Text } from '@ui5/webcomponents-react';
import { formatMessage } from 'components/KymaCompanion/utils/formatMarkdown';
import TasksList from './TasksList';
import './Message.scss';
import './marked.scss';
import { isCurrentThemeDark, themeState } from 'state/preferences/themeAtom';
import { useRecoilValue } from 'recoil';

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
  const currentTheme = useRecoilValue(themeState);
  const isThemeDark = isCurrentThemeDark(currentTheme);
  const predefinedMarkdownThemeClass = isThemeDark ? 'dark' : 'light';

  if (isLoading) {
    return <TasksList messageChunks={messageChunks} />;
  }

  const text = messageChunks.slice(-1)[0]?.data?.answer?.content;
  let segmentedText = null;
  if (disableFormatting) {
    segmentedText = text;
  } else {
    segmentedText = formatMessage(text, predefinedMarkdownThemeClass);
  }

  return (
    <div id={'some-random-id'} className={'message ' + className + ' markdown'}>
      <Text className="text">{segmentedText}</Text>
    </div>
  );
}
