import { Link, Text, Title } from '@ui5/webcomponents-react';
import CodePanel from './CodePanel';
import { segmentMarkdownText } from 'components/KymaCompanion/utils/formatMarkdown';
import TasksList from './TasksList';
import './Message.scss';
import { TextFormatter } from 'components/KymaCompanion/components/Chat/messages/formatter/TextFormatter';

interface MessageProps {
  className: string;
  messageChunks: MessageChunk[];
  isLoading: boolean;
  formatPlaintext?: boolean;
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
  formatPlaintext = true,
}: MessageProps): JSX.Element {
  if (isLoading) {
    return <TasksList messageChunks={messageChunks} />;
  }

  const segmentedText = segmentMarkdownText(
    messageChunks.slice(-1)[0]?.data?.answer?.content,
  );

  const simpleTest = `\`test\` -> nazwa ktora zostala zjedzona, a nie powinna
  \`test\` -> nowa linia 
  `;

  const fixedMsg = `\`tEST\`  dadasda \`dasdadadsada\`
  zwykly tekst
  dasdsahjhjdkaskj
  dasdakjhd **blabla**
  ### dasdasd das
  #### dasdas daskjdal
  \`\`\`
  \n\n
  Tutaj jest jakis yaml
  dasda
  
  dsada
  
  \`\`\`
  a tutaj zaraz drugi
  \`\`\`
  matko bosko spaghetti 
  ozylo
  \`\`\`
  \`\`\`
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: nginx-deployment
    labels:
      app: nginx
  spec:
    replicas: 3
    selector:
      matchLabels:
        app: nginx
    template:
      metadata:
        labels:
          app: nginx
      spec:
        containers:
        - name: nginx
          image: nginx:1.14.2
          ports:
          - containerPort: 80
  \`\`\``;
  // console.log(messageChunks.slice(-1)[0]?.data?.answer?.content);
  return (
    <div className={'message ' + className}>
      <Text className="text">
        <TextFormatter
          // text={messageChunks.slice(-1)[0]?.data?.answer?.content}
          text={fixedMsg}
          disable={!formatPlaintext}
        />
      </Text>
    </div>
  );
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
              <TextFormatter
                text={segment.content}
                disable={!formatPlaintext}
              ></TextFormatter>
            ),
          )}
        </Text>
      )}
    </div>
  );
}
