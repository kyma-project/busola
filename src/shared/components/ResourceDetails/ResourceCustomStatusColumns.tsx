import { Form, FormItem, Label, Text } from '@ui5/webcomponents-react';

export type CustomColumn = {
  header?: string;
  id?: string;
  value: (resource: any) => React.ReactNode;
  conditionComponent?: boolean;
  fullWidth?: boolean;
  visibility?: (
    resource: any,
  ) =>
    | Promise<{ visible: boolean; error?: Error | null }>
    | { visible: boolean; error?: Error | null };
};

export type CustomColumnsType = Array<CustomColumn>;

type ResourceCustomStatusColumnsProps = {
  filteredStatusColumns: CustomColumnsType;
  resource: any;
};

export function ResourceCustomStatusColumns({
  filteredStatusColumns,
  resource,
}: ResourceCustomStatusColumnsProps) {
  return (
    <Form layout="S2 M2 L2 XL2" labelSpan="S12 M12 L12 XL12">
      {filteredStatusColumns?.map((col) => (
        <FormItem
          key={col.header}
          labelContent={<Label showColon>{col.header ?? ''}</Label>}
        >
          <Text className="text-with-padding">{col.value(resource)}</Text>
        </FormItem>
      ))}
    </Form>
  );
}
