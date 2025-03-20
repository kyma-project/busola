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
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const currUrl = useUrl();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cluster = useRecoilValue(clusterState);

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

  const createUrl = url => {};
  console.log(layoutState);
  const handleSetupInEditor = (url, resource) => {
    // const resourceUrl = usePrepareResourceUrl({
    //   apiGroup: '',
    //   apiVersion: '',
    //   resourceType: pluralize(resource?.kind || '').toLowerCase(),
    // })
    setLayoutColumn({
      ...layoutState,
      showCreate: {
        ...layoutState.showCreate,
        resource: resource,
        resourceType: '',
        namespaceId: '',
      },
    });
    const parts = url.split('/');
    parts.shift();
    let resType = '';
    let namespace;
    console.log(parts);
    if (parts[0] === 'namespaces') {
      resType = parts[2];
      namespace = parts[1];
      navigate(
        `/cluster/${cluster?.contextName}/namespaces/${namespace}/${pluralize(
          resType,
        ).toLowerCase()}/${parts[3]}`,
      );
    } else {
      resType = parts[0];
      resType = parts[2];
      namespace = parts[1];
      navigate(
        `/cluster/${cluster?.contextName}/${pluralize(resType).toLowerCase()}/${
          parts[1]
        }`,
      );
    }
    console.log(resType);
  };

  console.log(window.location.pathname);

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
              ) : segment.type === 'code' ? (
                <CodePanel key={index} text={segment.content} />
              ) : segment.type === 'highlighted' ? (
                <Text key={index} className="text highlighted">
                  {segment.content}
                </Text>
              ) : segment.type === 'codeWithAction' ? (
                <>
                  <CodePanel key={index} text={segment.content} />
                  <Link
                    key={index}
                    onClick={() =>
                      handleSetupInEditor(segment.link.address, segment.content)
                    }
                  >
                    {segment.link.name}
                  </Link>
                </>
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
