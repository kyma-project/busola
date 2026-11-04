import { JSX } from 'react';
import { FormItem, Label } from '@ui5/webcomponents-react';

interface PodTemplateRowProps {
  label: string;
  component: JSX.Element;
}

export function PodTemplateRow({ label, component }: PodTemplateRowProps) {
  return (
    <FormItem labelContent={<Label showColon>{label}</Label>}>
      {component}
    </FormItem>
  );
}
