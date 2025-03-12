import {
  BusyIndicator,
  FlexBox,
  ObjectStatus,
  Text,
} from '@ui5/webcomponents-react';
import './TasksList.scss';

export default function TasksList({
  className,
  messageChunks,
}: MessageProps): JSX.Element {
  const chunksLength = messageChunks?.length;

  return (
    <div className={'message loading no-background ' + className}>
      {chunksLength > 0 ? (
        messageChunks[chunksLength - 1]?.data?.answer?.tasks?.map(
          (task, index) => {
            return (
              <FlexBox
                justifyContent="SpaceBetween"
                alignItems="Center"
                className="loading-item"
                key={index}
              >
                {task?.status === 'completed' ? (
                  <ObjectStatus state="Positive" showDefaultIcon large={true} />
                ) : (
                  <span className="ai-steps-loader" />
                )}
                <Text className="text">{task?.task_name}</Text>
                <div className="loading-status"></div>
              </FlexBox>
            );
          },
        )
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
