import {
  Bar,
  Button,
  Dialog,
  Form,
  FormItem,
  Input,
  Option,
  Select,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { Label } from 'shared/ResourceForm/components/Label';
import InputType from '@ui5/webcomponents/types/InputType';
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { ConnectionType, terminalSessionAtom } from 'state/terminalSessionAtom';

export type PodExecDialogProps = {
  open: boolean;
  close: Function;
  launchTerminal: Function;
  podResource: Record<any, any>;
};
// TODO:
// Pod name, namespace, to which container container?

export function PodExecDialog({
  open,
  close,
  launchTerminal,
  podResource,
}: PodExecDialogProps) {
  const setTerminalSession = useSetAtom(terminalSessionAtom);

  const { t } = useTranslation();

  const [container, setContainer] = useState('');
  const [command, setCommand] = useState('');
  const podName = podResource.metadata.name;
  const namespace = podResource.metadata.namespace;
  const containersNames = podResource.spec.containers.map(
    (container: { name: any }) => container.name,
  );
  const selectedContainer = container || containersNames[0];
  return (
    <Dialog
      headerText={t('terminal.exec.title')}
      open={open}
      footer={
        <Bar design="Footer">
          <Button
            onClick={() => {
              setTerminalSession({
                podName: podName,
                container: selectedContainer,
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
            onSelect={(e) => setContainer(e.details.selectedOption.value)}
            defaultValue={selectedContainer}
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
