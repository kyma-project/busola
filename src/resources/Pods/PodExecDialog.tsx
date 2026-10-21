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
};
// TODO:
// Pod name, namespace, to which container container?

export function PodExecDialog({
  open,
  close,
  launchTerminal,
}: PodExecDialogProps) {
  const [command, setCommand] = useState('');
  const [container, setContainer] = useState('');
  const setTerminalSession = useSetAtom(terminalSessionAtom);
  const { t } = useTranslation();

  return (podResource: Record<string, any>, resourceURL: string) => {
    console.log(podResource);
    const podName = podResource.metadata.name;
    const namespace = podResource.metadata.namespace;
    const containersNames = podResource.spec.containers.map(
      (container: { name: any }) => container.name,
    );
    // TODO: add better validation
    if (container === '') {
      setContainer(containersNames[0]);
    }
    console.log(containersNames);
    return (
      <Dialog
        headerText={'Exec options'}
        open={open}
        footer={
          <Bar design="Footer">
            <Button
              onClick={() => {
                console.log(
                  'Lets connect to the desired pod using: ',
                  command,
                  'and container: ',
                  container,
                );
                setTerminalSession({
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
              Exec
            </Button>
            <Button onClick={() => close()}>
              {' '}
              {t('common.buttons.cancel')}
            </Button>
          </Bar>
        }
      >
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormItem labelContent={<Label>{'Command'}</Label>}>
            <Input
              onInput={(e) => setCommand(e.target.value)}
              value={command}
              type={InputType.Text}
            ></Input>
          </FormItem>
          <FormItem labelContent={<Label>Container</Label>}>
            <Select
              onSelect={() => setContainer(e.details.selectedOption.value)}
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
  };
}
