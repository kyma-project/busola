import { Icon, Text } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { formatMessage } from 'components/KymaCompanion/utils/formatMarkdown';
import TasksList from '../TaskList/TasksList';
import { isCurrentThemeDark, themeAtom } from 'state/settings/themeAtom';
import { useAtomValue } from 'jotai';
import './Message.scss';
import './marked.scss';
import { Author, MessageChunk } from '../types';

interface MessageProps {
  author: Author;
  messageChunks: MessageChunk[];
  isLoading: boolean;
  partialAIFailure?: boolean;
  hasError?: boolean;
  isLatestMessage: boolean;
  disableFormatting?: boolean;
}

export default function Message({
  author,
  messageChunks,
  isLoading,
  partialAIFailure = false,
  hasError = false,
  isLatestMessage,
}: MessageProps): JSX.Element {
  const currentTheme = useAtomValue(themeAtom);
  const isThemeDark = isCurrentThemeDark(currentTheme);
  const predefinedMarkdownThemeClass = isThemeDark ? 'dark' : 'light';

  const { t } = useTranslation();
  if (isLoading) {
    return <TasksList messageChunks={messageChunks} />;
  }

  const displayError =
    hasError &&
    ((author === 'user' && !isLatestMessage) ||
      (author === 'ai' && isLatestMessage));

  const finalChunk = messageChunks.at(-1);
  const text = finalChunk?.data?.answer?.content ?? '';
  const segmentedText = formatMessage(text, predefinedMarkdownThemeClass);

  const className = author === 'user' ? 'right-aligned' : 'left-aligned';

  return (
    <div className={'message-container ' + className}>
      <div
        className={`markdown message ${className}${
          displayError ? ' error' : ''
        }`}
      >
        {segmentedText}
      </div>
      {partialAIFailure && (
        <div className={'message-error ' + className}>
          <Text className="error-text">
            {t('kyma-companion.error.partial-ai-failure')}
          </Text>
          <Icon name="error" design="Negative" className="error-icon" />
        </div>
      )}
      {displayError && (
        <div className={'message-error ' + className}>
          <Text className="error-text">
            {author === 'user'
              ? t('kyma-companion.error.chat-error')
              : t('kyma-companion.error.suggestions-error')}
          </Text>
          <Icon name="error" design="Negative" className="error-icon" />
        </div>
      )}
    </div>
  );
}
