import {
  BusyIndicator,
  FlexBox,
  Label,
  ObjectStatus,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { MessageChunk } from '../Message/Message';
import './TasksList.scss';

interface TaskListProps {
  messageChunks: MessageChunk[];
}

export default function TasksList({
  messageChunks,
}: TaskListProps): JSX.Element {
  const { t } = useTranslation();
  const chunksLength = messageChunks?.length;

  const allTasksCompleted =
    chunksLength > 0 &&
    messageChunks[chunksLength - 1]?.data?.answer?.tasks?.every(
      task => task?.status === 'completed',
    );

  return (
    <div className="tasks-list">
      {chunksLength > 0 ? (
        <>
          {messageChunks[chunksLength - 1]?.data?.answer?.tasks?.map(
            (task, index) => {
              return (
                <FlexBox
                  justifyContent="SpaceBetween"
                  alignItems="Center"
                  className="loading-item"
                  key={index}
                >
                  {task?.status === 'completed' ? (
                    <ObjectStatus
                      state="Positive"
                      showDefaultIcon
                      large={true}
                    />
                  ) : (
                    <span className="ai-steps-loader" />
                  )}
                  <Label className="text">{task?.task_name}</Label>
                </FlexBox>
              );
            },
          )}
          {allTasksCompleted && (
            <FlexBox
              justifyContent="SpaceBetween"
              alignItems="Center"
              className="loading-item"
            >
              <span className="ai-steps-loader" />
              <Label className="text">
                {t('kyma-companion.opener.preparing-final-answer')}
              </Label>
            </FlexBox>
          )}
        </>
      ) : (
        <BusyIndicator
          active
          size="M"
          delay={0}
          className="ai-busy-indicator"
        />
      )}
    </div>
  );
}
