import { FormItem, Label, Text } from '@ui5/webcomponents-react';
import { ResourceDetailsForm } from './ResourceDetailsForm';

export type CustomColumn = {
  header?: string;
  id?: string;
  value: (resource: any) => React.ReactNode;
  conditionComponent?: boolean;
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
    <ResourceDetailsForm>
      {filteredStatusColumns?.map((col) => (
        <FormItem
          key={col.header}
          labelContent={<Label showColon>{col.header ?? ''}</Label>}
        >
          <Text className="text-with-padding">{col.value(resource)}</Text>
        </FormItem>
      ))}
    </ResourceDetailsForm>
  );
}
