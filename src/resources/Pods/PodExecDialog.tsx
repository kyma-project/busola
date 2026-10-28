import {
  Bar,
  Button,
  Dialog,
  Form,
  FormItem,
  Icon,
  Input,
  Option,
  Select,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { Label } from 'shared/ResourceForm/components/Label';
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { ConnectionType, terminalSessionAtom } from 'state/terminalSessionAtom';
import InputType from '@ui5/webcomponents/types/InputType';

export type PodExecDialogProps = {
  open: boolean;
  close: Function;
  launchTerminal: Function;
  podResource: Record<any, any>;
};

const DEFAULT_COMMAND = 'sh';
export function PodExecDialog({
  open,
  close,
  launchTerminal,
  podResource,
}: PodExecDialogProps) {
  const setTerminalSession = useSetAtom(terminalSessionAtom);
  const { t } = useTranslation();
  const containersNames = podResource.spec.containers.map(
    (container: { name: any }) => container.name,
  );

  const [container, setContainer] = useState(containersNames[0] || '');
  const [command, setCommand] = useState(DEFAULT_COMMAND);
  const podName = podResource.metadata.name;
  const namespace = podResource.metadata.namespace;

  return (
    <Dialog
      headerText={t('terminal.exec.title')}
      open={open}
      footer={
        <Bar design="Footer">
          <Button
            onClick={() => {
              setTerminalSession({
                status: 'provisioned',
                abortController: null,
                deprovisionPod: async () => {},
                podName: podName,
                container: container,
                command,
                namespace: namespace,
                connectionType: ConnectionType.Exec,
              });
              launchTerminal();
              close();
            }}
          >
            {t('terminal.exec.exec')}
          </Button>
          <Button onClick={() => close()}> {t('common.buttons.cancel')}</Button>
        </Bar>
      }
    >
      <Form onSubmit={(e) => e.preventDefault()}>
        <FormItem labelContent={<Label>{t('terminal.exec.command')}</Label>}>
          <Input
            onInput={(e) => setCommand(e.target.value)}
            value={command}
            type={InputType.Text}
          ></Input>
        </FormItem>
        <FormItem labelContent={<Label>{t('terminal.exec.container')}</Label>}>
          <Select
            onChange={(event) =>
              setContainer(event.detail.selectedOption.value)
            }
            defaultValue={container}
          >
            {containersNames.map((name: string) => (
              <Option key={name} value={name}>
                {name}
              </Option>
            ))}
          </Select>
        </FormItem>
      </Form>
    </Dialog>
  );
}
